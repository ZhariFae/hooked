import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext'; // Import the context itself
import { auth, db } from './firebaseAuth'; // Import the auth instance
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({...currentUser, ...userDoc.data()});
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //   setUser(currentUser);
    //   setLoading(false);
    // });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          uid: userCredential.user.uid,
          role: 'customer'
        });

      }
      setLoading(false); // Ensure loading is false on success
      return userCredential;
    } catch (error) {
      setLoading(false); // Ensure loading is false on error
      throw error; // Re-throw to be caught by the calling screen
    }
  };

  const login = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password)
      .finally(() => setLoading(false));
  };

  const logout = () => {
    setLoading(true);
    return signOut(auth)
      .finally(() => setLoading(false));
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  // Don't render children until loading is false to prevent flashing of content
  // or to ensure user state is definitively known.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};