// app/newUserWelcome/page.tsx

'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Define an enumeration for account types, if applicable
enum AccountType {
  Student = 'student',
  Teacher = 'teacher',
  Administrator = 'administrator'
}


export default function NewUserWelcome() {
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAccountTypeSelection = async (accountType: AccountType) => {
    if (user && db) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          accountType: accountType,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          lastSignIn: new Date(),
        });

        switch(accountType) {
          case 'student':
            router.push('/studentDashboard');
            break;
          case 'teacher':
            router.push('/teacherDashboard');
            break;
          case 'administrator':
            router.push('/adminDashboard');
            break;
        }
      } catch (error) {
        console.error("Error setting account type:", error);
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Kansha AI!</h1>
      <p className="mb-4">Please select your account type:</p>
      <div className="space-y-2">
        <button onClick={() => handleAccountTypeSelection(AccountType.Student)} className="w-full p-2 bg-blue-500 text-white rounded">Student</button>
        <button onClick={() => handleAccountTypeSelection(AccountType.Teacher)} className="w-full p-2 bg-green-500 text-white rounded">Teacher</button>
        <button onClick={() => handleAccountTypeSelection(AccountType.Administrator)} className="w-full p-2 bg-red-500 text-white rounded">Administrator</button>
      </div>
    </div>
  );
}