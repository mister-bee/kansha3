// app/firebase/firestore.ts

import { collection, addDoc, getDocs, DocumentData } from 'firebase/firestore';
import { db } from './config';

export const addDocument = async (data: DocumentData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'your-collection'), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getDocuments = async (): Promise<DocumentData[]> => {
  const documents: DocumentData[] = [];
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