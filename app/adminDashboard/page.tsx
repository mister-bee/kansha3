// app/adminDashboard/page.tsx

'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase/config';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to your admin dashboard!</p>
    </div>
  );
}