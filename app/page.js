"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase'; // Ensure correct import path for Firebase configuration
import { useRouter } from 'next/navigation'; // Correct import for Next.js 13

const UsersPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const router = useRouter();
  useEffect(() => {
    const auth = getAuth();

    // Set up an authentication state observer and get user data
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user data from Firestore
          const usersCollection = collection(db, 'users');
          const userQuery = query(usersCollection, where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))[0]; // Assuming there's only one user document per userId
            setUser(userData);
          } else {
            setError('User not found in Firestore.');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError('No user is currently logged in.');
        setLoading(false);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading user information...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return <p>No user information available.</p>;
  }
  const handleClick = () => {
    console.log("Navigating to /register");
    router.push('/register');
  };
  return (
    <div>
      <h1>User Information</h1>
      <strong>Full Name:</strong> {user.fullName}<br />
      <strong>Email:</strong> {user.email}<br />
      <strong>Phone Number:</strong> {user.phoneNumber}<br />
      <button onClick={handleClick}>Go to Register</button>

    </div>
  );
};

export default UsersPage;
