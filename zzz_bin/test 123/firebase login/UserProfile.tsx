// UserProfile.tsx

"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth, db } from "../../utils/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LoginForm from "./LoginForm";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [stripeCustomer, setStripeCustomer] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const stripeCustomerRef = doc(db, "stripe_customers", currentUser.uid);
        const stripeCustomerDoc = await getDoc(stripeCustomerRef);

        if (stripeCustomerDoc.exists()) {
          setStripeCustomer(stripeCustomerDoc.data());
        } else {
          console.log("No stripe customer data found");
        }
      } else {
        setStripeCustomer(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      <h1>User Data</h1>
      {user ? (
        <>
          <p>
            Signed in with email: <strong>{user.email}</strong>
          </p>
          <p>
            Firebase User ID: <strong>{user.uid}</strong>
          </p>
          <div>
            <button
              className="btn btn-secondary my-3 btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <h2>Stripe Customer Data</h2>
          {stripeCustomer ? (
            <>
              <p>
                This data lives in the stripe_customers collection in Firestore
              </p>
              <div className="mockup-code">
                <pre>
                  <code>{JSON.stringify(stripeCustomer, null, 2)}</code>
                </pre>
              </div>
            </>
          ) : (
            <div>
              <p className="text-yellow-500">
                Stripe customer data not created yet. Buy a plan!
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <p>No user logged in.</p>
          <LoginForm />
        </>
      )}
    </div>
  );
}
