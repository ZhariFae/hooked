import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  documentId,
} from 'firebase/firestore';
import { db } from '../auth/firebaseAuth';

// Favourites

export const isFavourite = async (userId, productId) => {
  if (!userId || !productId) return false;
  const favRef = doc(db, 'users', userId, 'favourites', productId);
  const docSnap = await getDoc(favRef);
  return docSnap.exists();
};

export const toggleFavourite = async (userId, productId, isCurrentlyFavourite) => {
  const favRef = doc(db, 'users', userId, 'favourites', productId);
  if (isCurrentlyFavourite) {
    await deleteDoc(favRef);
  } else {
    await setDoc(favRef, { addedAt: serverTimestamp() });
  }
};

export const getFavouriteIds = async (userId) => {
  if (!userId) return [];
  const favsRef = collection(db, 'users', userId, 'favourites');
  const favSnapshot = await getDocs(favsRef);
  return favSnapshot.docs.map((doc) => doc.id);
};

export const getFavouriteProducts = async (userId) => {
  const favsRef = collection(db, 'users', userId, 'favourites');
  const favSnapshot = await getDocs(favsRef);
  const favIds = favSnapshot.docs.map((doc) => doc.id);

  if (favIds.length === 0) {
    return [];
  }
  const productsRef = collection(db, 'items');
  const q = query(productsRef, where(documentId(), 'in', favIds));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Cart

export const addToCart = async (userId, productId, quantity) => {
  const cartItemRef = doc(db, 'users', userId, 'cart', productId);
  const docSnap = await getDoc(cartItemRef);

  if (docSnap.exists()) {
    await updateDoc(cartItemRef, {
      quantity: increment(quantity),
    });
  } else {
    await setDoc(cartItemRef, {
      quantity: quantity,
      addedAt: serverTimestamp(),
    });
  }
};

export const getCartProducts = async (userId) => {
  const cartRef = collection(db, 'users', userId, 'cart');
  const cartSnapshot = await getDocs(cartRef);
  if (cartSnapshot.empty) {
    return [];
  }

  const cartItems = cartSnapshot.docs.map((doc) => ({ productId: doc.id, ...doc.data() }));
  const productIds = cartItems.map((item) => item.productId);

  const productsRef = collection(db, 'items');
  const q = query(productsRef, where(documentId(), 'in', productIds));
  const productsSnapshot = await getDocs(q);

  const productsData = productsSnapshot.docs.reduce((acc, doc) => {
    acc[doc.id] = { id: doc.id, ...doc.data() };
    return acc;
  }, {});

  return cartItems.map((item) => ({ ...productsData[item.productId], quantity: item.quantity }));
};

export const updateCartItemQuantity = async (userId, productId, newQuantity) => {
  const cartItemRef = doc(db, 'users', userId, 'cart', productId);
  if (newQuantity > 0) {
    await updateDoc(cartItemRef, { quantity: newQuantity });
  } else {
    // If quantity is 0 or less, remove the item
    await deleteDoc(cartItemRef);
  }
};