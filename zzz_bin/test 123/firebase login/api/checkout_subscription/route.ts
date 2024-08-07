// app/api/checkout_subscription/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { db } from "@/utils/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import Stripe from "stripe";

type SubscriptionPlan = {
  name: string;
  price: number;
  id: string;
};

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    name: "Basic Fruit Delivery",
    price: 2000,
    id: "price_1Pdw1nE0O9nAbsVm1W89XkGv",
  },
  advanced: {
    name: "Advanced Fruit Delivery",
    price: 3500,
    id: "price_1Pdw3PE0O9nAbsVm5KY83RTR",
  },
  deluxe: {
    name: "Deluxe Fruit Delivery",
    price: 10000,
    id: "price_1Pdw4vE0O9nAbsVmbo2jDQDD",
  },
};

type RequestBody = {
  planId: keyof typeof SUBSCRIPTION_PLANS;
  email: string;
  userId: string;
};

export async function POST(request: Request) {
  try {
    console.log(" --- CHECKOUT SUBSCRIPTION --- ");

    const { planId, email, userId }: RequestBody = await request.json();
    console.log("Received data:", { planId, email, userId });

    if (!planId || !email || !userId || !(planId in SUBSCRIPTION_PLANS)) {
      throw new Error("Missing or invalid required fields");
    }

    const plan = SUBSCRIPTION_PLANS[planId];

    // Check if the user exists in Firebase
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    // Validate that the email in the request matches the email in the user document
    if (userSnap.data()?.email !== email) {
      throw new Error("Email mismatch");
    }

    if (!stripe) {
      throw new Error("Stripe is not properly initialized");
    }

    // Check if the user already has a subscription
    const existingSubscription = userSnap.data().subscription;

    let customer = await stripe.customers.list({ email: email, limit: 1 });
    let customerId: string;

    if (customer.data.length === 0) {
      const newCustomer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: userId,
        },
      });
      customerId = newCustomer.id;
    } else {
      customerId = customer.data[0].id;
      // Update the existing customer's metadata
      await stripe.customers.update(customerId, {
        metadata: {
          user_id: userId,
        },
      });
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: plan.id,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      success_url: `${request.headers.get(
        "origin"
      )}/success?plan=${encodeURIComponent(planId)}`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    };

    if (existingSubscription) {
      // For existing subscriptions, add payment_method_collection
      sessionConfig.payment_method_collection = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Created subscription session:", session.id);

    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      {
        message: error.message || "An error occurred during checkout",
        code: error.code,
      },
      { status: 500 }
    );
  }
}
