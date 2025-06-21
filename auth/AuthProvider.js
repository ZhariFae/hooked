import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext'; // Import the context itself
import { auth } from './firebaseAuth'; // Import the auth instance
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth state loading

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        // After user is created, update their profile with the name
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        // onAuthStateChanged will pick up the updated user.
        // To see immediate UI update with name, you might call setUser(auth.currentUser)
        // but it's often handled by onAuthStateChanged.
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