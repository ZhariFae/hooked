import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../auth/firebaseAuth';

// This service now interacts with Firebase Firestore.

/**
 * Adds a new product to the 'items' collection in Firestore.
 * @param {object} productData - The product data to add.
 * @returns {Promise<{success: boolean, id: string}>}
 */
export const addProduct = async (productData) => {
  try {
    const itemsCol = collection(db, 'items');
    const newProductRef = await addDoc(itemsCol, {
      ...productData,
      activate: true, // New products are active by default
    });
    return { success: true, id: newProductRef.id };
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

/**
 * Deletes a product from the 'items' collection in Firestore.
 * @param {string} productId - The ID of the product to delete.
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
 * Toggles the 'activate' status of a product in Firestore.
 * @param {string} productId - The ID of the product to update.
 * @param {boolean} currentStatus - The current 'activate' status of the product.
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