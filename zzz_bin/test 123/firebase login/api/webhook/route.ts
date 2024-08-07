// app/api/webhook/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { adminDb, admin } from "@/utils/firebaseAdmin";
import Stripe from "stripe";

export async function POST(request: Request) {
  console.log("Webhook function started");
  try {
    console.log("Webhook received:", new Date().toISOString());
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Webhook secret is not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✅ Success: Received Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.payment_succeeded":
      case "invoice.paid":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Detailed webhook error:", error);
    return NextResponse.json(
      { error: "Detailed webhook error" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const productId = session.metadata?.product_id;
  const planId = session.metadata?.plan_id;

  if (!userId) {
    console.error(`❌ Missing userId in session metadata`);
    return;
  }

  if (session.mode === "subscription" && planId) {
    console.log(
      `👤 Processing subscription for user: ${userId}, plan: ${planId}`
    );
    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      await updateUserSubscription(userId, subscription);
    } catch (error) {
      console.error("❌ Error retrieving subscription data:", error);
    }
  } else if (session.mode === "payment" && productId) {
    // Handle one-time purchase (unchanged)
    console.log(
      `👤 Processing purchase for user: ${userId}, product: ${productId}`
    );
    try {
      const userRef = adminDb.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error(`❌ User document not found for userId: ${userId}`);
        return;
      }

      console.log(
        `✅ User document found:`,
        JSON.stringify(userDoc.data(), null, 2)
      );

      const purchaseData = {
        productId,
        amount: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
        purchaseDate: new Date().toISOString(),
      };

      console.log(
        `📦 Purchase data to be stored:`,
        JSON.stringify(purchaseData, null, 2)
      );

      // Update user document with purchase information
      await userRef.update({
        purchases: admin.firestore.FieldValue.arrayUnion(purchaseData),
        lastPurchaseAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Updated user document with purchase data`);

      // Create a separate purchase document
      const purchaseRef = adminDb.collection("purchases").doc(session.id);
      await purchaseRef.set({
        ...purchaseData,
        userId,
        customerEmail: session.customer_details?.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Created purchase document with ID: ${session.id}`);
    } catch (error) {
      console.error("❌ Error updating Firestore:", error);
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error(`❌ Missing userId in subscription metadata`);
    return;
  }

  await updateUserSubscription(userId, subscription);
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  console.log(
    `Updating subscription for user: ${userId}, status: ${subscription.status}`
  );

  try {
    const userRef = adminDb.collection("users").doc(userId);

    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      planId: subscription.items.data[0].price.id,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_start * 1000)
      ),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      ),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: admin.firestore.Timestamp.fromDate(
        new Date(subscription.created * 1000)
      ),
      customerId: subscription.customer as string,
      quantity: subscription.items.data[0].quantity,
      priceId: subscription.items.data[0].price.id,
      productId: subscription.items.data[0].price.product as string,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.update({
      subscription: subscriptionData,
    });

    console.log(`✅ Updated user document with subscription data`);
  } catch (error) {
    console.error("❌ Error updating Firestore:", error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Handling invoice payment succeeded. Invoice ID: ${invoice.id}`);
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    const customer = await stripe.customers.retrieve(
      invoice.customer as string
    );
    if (customer.deleted) {
      console.error(`❌ Customer has been deleted`);
      return;
    }
    const userId = customer.metadata?.user_id;
    if (!userId) {
      console.error(`❌ Missing userId in customer metadata`);
      return;
    }
    await updateUserSubscription(userId, subscription);
  }
}
