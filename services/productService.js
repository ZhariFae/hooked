
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from 'auth/firebaseAuth';

const db = getFirestore(firebaseApp);

export const addShipment = async (shipment) => {
  try {
    await addDoc(collection(db, 'shipments'), shipment);
  } catch (error) {
    console.error('Error adding shipment:', error);
  }
};

export const getShipmentsByUser = async (userId) => {
  try {
    const q = query(collection(db, 'shipments'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return [];
  }
};

/**
 * Adds a transaction to Firestore.
 * @param {object} transaction - Transaction data to add
 * @returns {Promise<void>}
 */
export const addTransaction = async (transaction) => {
  try {
    await addDoc(collection(db, 'transactions'), transaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
};
/**
 * Fetches a product from Firestore by customRequestId field.
 * @param {string} customRequestId
 * @returns {Promise<object|null>} The product object or null if not found
 */
export const getProductByCustomRequestId = async (customRequestId) => {
  try {
    const itemsCol = collection(db, 'items');
    const q = query(itemsCol, where('customRequestId', '==', customRequestId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Return the first matching product
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by customRequestId:', error);
    throw error;
  }
};
/**
 * Updates the price of a product in Firestore.
 * @param {string} productId
 * @param {number} newPrice
 * @returns {Promise<{success: boolean}>}
 */
export const updateProductPrice = async (productId, newPrice) => {
  try {
    const productDocRef = doc(db, 'items', productId);
    await updateDoc(productDocRef, {
      price: newPrice,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating product price in Firestore:', error);
    throw error;
  }
};

/**
 * 
 * @param {object} productData
 * @returns {Promise<{success: boolean, id: string}>}
 */
export const addProduct = async (productData) => {
  try {
    const itemsCol = collection(db, 'items');
    const newProductRef = await addDoc(itemsCol, {
      ...productData,
      activate: false, 
    });
    return { success: true, id: newProductRef.id };
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
    throw error;
  }
};

/**
 *
 * @param {string} productId
 * @returns {Promise<{success: boolean}>}
 */
export const deleteProduct = async (productId) => {
  try {
    const productDocRef = doc(db, 'items', productId);
    await deleteDoc(productDocRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
};

/**
 * 
 * @param {string} productId
 * @param {boolean} currentStatus
 * @returns {Promise<{success: boolean}>}
 */
export const toggleProductActivation = async (productId, currentStatus) => {
  try {
    const productDocRef = doc(db, 'items', productId);
    await updateDoc(productDocRef, {
      activate: !currentStatus,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating product activation in Firestore:', error);
    throw error;
  }
};