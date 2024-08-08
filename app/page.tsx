// app/page.tsx

"use client";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase/config";
import { Honk } from "next/font/google";
import { useRouter } from "next/navigation";

const honk = Honk({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed", currentUser);
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!userDoc.exists()) {
          router.push("/newUserWelcome");
        } else {
          const userData = userDoc.data();
          switch (userData.accountType) {
            case "student":
              router.push("/studentDashboard");
              break;
            case "teacher":
              router.push("/teacherDashboard");
              break;
            case "administrator":
              router.push("/adminDashboard");
              break;
            default:
              router.push("/userProfile");
          }
        }
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (!isOnline) {
      setMessage(
        "You're offline. Please check your internet connection and try again.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User signed in successfully:", result.user);
      // The redirection will be handled in the useEffect hook
    } catch (error) {
      console.error("Error during sign in:", error);
      setMessage(`Error signing in. Please try again later.`);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage("Signed out successfully!");
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setMessage(`Error signing out. Please try again.`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className={`${honk.className} text-6xl text-red-500 mb-8`}>
        Kansha AI 🤖
      </h1>
      {!isOnline && (
        <p className="text-red-500 mb-4">
          You're currently offline. Some features may be unavailable.
        </p>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <p>Redirecting to your dashboard...</p>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || !isOnline}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transform hover:scale-110 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      )}
      {message && <p className="mt-4 text-xl text-indigo-600">{message}</p>}
    </main>
  );
}
