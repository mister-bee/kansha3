"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { auth, db } from "../utils/firebaseClient";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

type ProductId = "pear" | "banana" | "apple";
type SubscriptionPlanId = "basic" | "advanced" | "deluxe";

interface Subscription {
  planId: string;
  status: string;
}

const PLAN_NAMES: Record<string, string> = {
  price_1Pdw1nE0O9nAbsVm1W89XkGv: "Basic",
  price_1Pdw3PE0O9nAbsVm5KY83RTR: "Advanced",
  price_1Pdw4vE0O9nAbsVmbo2jDQDD: "Deluxe",
};

export default function CheckoutButton() {
  const [user, loading] = useAuthState(auth);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().subscription) {
          setSubscription(userDoc.data().subscription as Subscription);
        }
      }
    };

    if (!loading) {
      fetchSubscription();
    }
  }, [user, loading]);

  const handleCheckout = async (productId: ProductId) => {
    if (loading) {
      toast.error("Please wait while we check your authentication status");
      return;
    }

    if (!user) {
      toast.error("Please log in to create a new Stripe Checkout session");
      return;
    }

    const stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("Failed to load Stripe");
      return;
    }

    const response = await fetch("/api/checkout_products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        userId: user.uid,
        email: user.email,
        quantity: 1,
      }),
    });

    const session = await response.json();

    if (session.id) {
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        toast.error(result.error.message);
      }
    } else {
      toast.error("Failed to create checkout session");
    }
  };

  const handleSubscription = async (planId: SubscriptionPlanId) => {
    if (loading) {
      toast.error("Please wait while we check your authentication status");
      return;
    }

    if (!user) {
      toast.error("Please log in to subscribe");
      return;
    }

    const stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("Failed to load Stripe");
      return;
    }

    const response = await fetch("/api/checkout_subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        userId: user.uid,
        email: user.email,
      }),
    });

    const session = await response.json();

    if (session.id) {
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        toast.error(result.error.message);
      }
    } else {
      toast.error("Failed to create subscription session");
    }
  };

  const renderSubscriptionButtons = () => {
    const plans: SubscriptionPlanId[] = ["basic", "advanced", "deluxe"];
    const currentPlanName = subscription
      ? PLAN_NAMES[subscription.planId]
      : null;

    return plans
      .filter((plan) => plan.toLowerCase() !== currentPlanName?.toLowerCase())
      .map((plan) => (
        <button
          key={plan}
          className="btn btn-warning"
          onClick={() => handleSubscription(plan)}
        >
          Change to {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </button>
      ));
  };
  // const renderSubscriptionButtons = () => {
  //   const plans: SubscriptionPlanId[] = ["basic", "advanced", "deluxe"];
  //   const currentPlan = subscription?.planId;

  //   return plans.map((plan) => {
  //     if (plan === currentPlan) {
  //       return (
  //         <button key={plan} className="btn btn-success" disabled>
  //           Current Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
  //         </button>
  //       );
  //     } else {
  //       return (
  //         <button
  //           key={plan}
  //           className="btn btn-warning"
  //           onClick={() => handleSubscription(plan)}
  //         >
  //           {subscription
  //             ? `Change to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
  //             : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
  //         </button>
  //       );
  //     }
  //   });
  // };
  return (
    <div>
      <br />
      <h1>Buy Fruit</h1>
      <button className="btn btn-accent" onClick={() => handleCheckout("pear")}>
        Buy Pear ($50)
      </button>
      <button
        className="btn btn-accent"
        onClick={() => handleCheckout("banana")}
      >
        Buy Banana ($40)
      </button>
      <button
        className="btn btn-accent"
        onClick={() => handleCheckout("apple")}
      >
        Buy Apple ($20)
      </button>

      <br />
      <br />

      <h1>Fruit Delivery Subscription</h1>
      {subscription && (
        <div className="text-xl mb-4">
          Current Plan: {PLAN_NAMES[subscription.planId] || "Unknown"}
        </div>
      )}
      {renderSubscriptionButtons()}
    </div>
  );
}
