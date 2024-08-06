'use client'
import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (typeof window !== 'undefined' && db) {
        try {
          const querySnapshot = await getDocs(collection(db, 'your-collection'));
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDocuments(docs);
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
        setDocuments(docs);
      } catch (error) {
        console.error("Error adding document: ", error);
        setMessage('Error adding document');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Next.js + Firebase App</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button 
            onClick={signOutUser}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
          <button 
            onClick={addDocument}
            className="mt-4 ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Document
          </button>
        </div>
      ) : (
        <button 
          onClick={signIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In with Google
        </button>
      )}
      {message && <p className="mt-4 text-green-500">{message}</p>}
      {documents.length > 0 && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Documents:</h2>
          <ul>
            {documents.map((doc: any) => (
              <li key={doc.id}>{JSON.stringify(doc)}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}