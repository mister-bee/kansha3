// app/api/checkout_products/route.ts

import { NextResponse } from "next/server";
import { stripe } from "@/utils/stripe";
import { db } from "@/utils/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

type ProductInfo = {
  price: number;
  id: string;
};

type Products = {
  [key: string]: ProductInfo;
};

const PRODUCTS = {
  pear: { price: 5000, id: "price_1PXpmPE0O9nAbsVmuOPuEFK2" }, // $50
  banana: { price: 4000, id: "price_1PY8YxE0O9nAbsVmgG0sQbdn" }, // $40
  apple: { price: 2000, id: "price_1PY8svE0O9nAbsVmkcwjUv1q" }, // $20
};

type RequestBody = {
  productId: keyof typeof PRODUCTS;
  email: string;
  userId: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    console.log(" --- CHECKOUT PRODUCTS --- ");

    const { productId, email, userId, quantity }: RequestBody =
      await request.json();
    console.log("Received data:", { productId, email, userId, quantity });

    if (!productId || !email || !userId || !(productId in PRODUCTS)) {
      throw new Error("Missing or invalid required fields");
    }

    const product = PRODUCTS[productId];

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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productId.charAt(0).toUpperCase() + productId.slice(1),
            },
            unit_amount: product.price,
          },
          quantity,
        },
      ],
      customer_email: email,
      metadata: {
        user_id: userId,
        product_id: productId,
      },
      success_url: `${request.headers.get(
        "origin"
      )}/success?product=${encodeURIComponent(
        productId
      )}&price=${encodeURIComponent((product.price / 100).toFixed(2))}`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
    });

    console.log("Created session:", session.id);

    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      {
        message: error.message || "An error occurred during checkout",
        code: error.code, // Include the error code if available
      },
      { status: 500 }
    );
  }
}
