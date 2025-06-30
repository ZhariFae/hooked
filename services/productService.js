import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../auth/firebaseAuth';

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
      activate: true, 
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