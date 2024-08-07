// app/page.tsx

'use client'
import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, DocumentData } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { useAuth } from './hooks/useAuth';
import { Honk } from 'next/font/google'

// const honk = Honk({ 
//   subsets: ['latin'],
//   weight: '400'
// })

const honk = Honk({ 
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

interface FirestoreDocument extends DocumentData {
  id: string;
}

export default function Home() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState<FirestoreDocument[]>([]);

  useEffect(() => {
    if (auth) {
      console.log("Auth object available");
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log("Auth state changed", user);
      });
      return () => unsubscribe();
    } else {
      console.log("Auth object not available");
    }
  }, []);


  useEffect(() => {
    const fetchDocuments = async () => {
      if (typeof window !== 'undefined' && db) {
        try {
          const querySnapshot = await getDocs(collection(db, 'your-collection'));
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDocuments(docs as FirestoreDocument[]);
        } catch (error) {
          console.error("Error fetching documents: ", error);
          setMessage('Error fetching documents');
        }
      }
    };
    fetchDocuments();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setMessage('Signed in successfully!');
    } catch (error) {
      console.error("Error signing in: ", error);
      setMessage('Error signing in');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setMessage('Signed out successfully!');
    } catch (error) {
      console.error("Error signing out: ", error);
      setMessage('Error signing out');
    }
  };

  const addDocument = async () => {
    if (typeof window !== 'undefined' && db) {
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
      } catch (error) {
        console.error("Error adding document: ", error);
        setMessage('Error adding document');
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
          <p className="text-2xl text-purple-700">Welcome, {user.displayName}!</p>
          <button 
            onClick={signOutUser}
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
          onClick={signIn}
          className="px-6 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transform hover:scale-110 transition duration-200"
        >
          Sign In with Google
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