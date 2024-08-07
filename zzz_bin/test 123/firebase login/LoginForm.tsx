// user/LoginForm.tsx

"use client";

import { useState } from "react";
import { auth } from "../../utils/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../utils/firebaseClient";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);

    const randomEmail = `${Math.random()
      .toString(36)
      .substring(7)}@example.com`;
    const password = "Password69420";

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        randomEmail,
        password
      );
      console.log("User created and logged in:", userCredential.user);

      // Create user document in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);

      await setDoc(userRef, {
        email: randomEmail,
        dateCreated: new Date(), // Keeping as Date object for consistency with current app
        // dateCreated: new Date().toISOString() -- this is format used in purchaseData
      });

      console.log("User document created in Firestore");
    } catch (error: any) {
      console.error("Error signing up:", error.message);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleSignUp}
      disabled={loading}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded border-2 border-white transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Signing up..." : "Sign up with random email and password"}
    </button>
  );
}
