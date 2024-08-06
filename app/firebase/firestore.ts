// app/firebase/firestore.ts

import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './config';

// Add a document
export const addDocument = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, 'your-collection'), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Get documents
export const getDocuments = async () => {
  const documents: any[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'your-collection'));
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};