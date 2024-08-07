// app/page.tsx

'use client'
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, DocumentData, doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { Honk } from 'next/font/google'

const honk = Honk({ 
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

interface FirestoreDocument extends DocumentData {
  id: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<FirestoreDocument[]>([]);


  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        console.log("Auth state changed", currentUser);
      });

      return () => unsubscribe();
    } else {
      console.error("Firebase auth is not initialized");
    }
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');

    if (!auth || !db) {
      console.error("Firebase auth or Firestore not initialized");
      setMessage("Error: Firebase not initialized");
      setLoading(false);
      return;
    }

    const randomEmail = `${Math.random().toString(36).substring(7)}@example.com`;
    const password = "Password69420";

    try {
      console.log("Attempting to create user with email:", randomEmail);
      const userCredential = await createUserWithEmailAndPassword(auth, randomEmail, password);
      console.log("User created successfully:", userCredential.user);

      // Create user document in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      console.log("Attempting to create Firestore document for user:", userCredential.user.uid);

      await setDoc(userRef, {
        email: randomEmail,
        dateCreated: new Date(),
      });

      console.log("User document created in Firestore");
      setMessage('Signed up and logged in successfully!');
      setUser(userCredential.user);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error signing up:", error.message);
        setMessage(`Error signing up: ${error.message}`);
      } else {
        console.error("Unknown error during sign up:", error);
        setMessage("An unknown error occurred during sign up");
      }
    }

    setLoading(false);
  };



  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage('Signed out successfully!');
    } catch (error: any) {
      console.error("Error signing out:", error);
      setMessage(`Error signing out: ${error.message}`);
    }
  };

  const addDocument = async () => {
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'your-collection'), {
          someField: 'Some data',
          createdAt: new Date()
        });
        setMessage(`New document added with ID: ${docRef.id}`);
        // Refresh documents
        const querySnapshot = await getDocs(collection(db, 'your-collection'));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs as FirestoreDocument[]);
      } catch (error: any) {
        console.error("Error adding document: ", error);
        setMessage(`Error adding document: ${error.message}`);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className={`${honk.className} text-6xl text-red-500 mb-8`}>
        Kansha AI 🤖
      </h1>
      {user ? (
        <div>
          <p className="text-2xl text-purple-700">Welcome, {user.email}!</p>
          <p>Firebase User ID: <strong>{user.uid}</strong></p>
          <button 
            onClick={handleLogout}
            className="mt-4 px-6 py-2 bg-red-400 text-white rounded-full hover:bg-red-500 transform hover:scale-110 transition duration-200"
          >
            Sign Out
          </button>
          <button 
            onClick={addDocument}
            className="mt-4 ml-4 px-6 py-2 bg-green-400 text-white rounded-full hover:bg-green-500 transform hover:scale-110 transition duration-200"
          >
            Add Document
          </button>
        </div>
      ) : (
        <button 
          onClick={handleSignUp}
          disabled={loading}
          className="px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transform hover:scale-110 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing up..." : "Sign up with random email and password"}
        </button>
      )}
      {message && <p className="mt-4 text-xl text-indigo-600">{message}</p>}
      {documents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-3xl text-orange-500 mb-4">Documents:</h2>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="bg-white bg-opacity-50 p-2 rounded-lg">
                {JSON.stringify(doc)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}