import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../auth/firebaseAuth';

/**
 * Submits a custom product request.
 * @param {string} userId The ID of the user.
 * @param {string} userName The display name of the user.
 * @param {object} requestData - The data for the custom request.
 * @returns {Promise<{success: boolean, id: string}>}
 */
export const submitCustomRequest = async (userId, userName, requestData) => {
  try {
    const requestsCol = collection(db, 'customRequests');
    const newRequestRef = await addDoc(requestsCol, {
      ...requestData,
      userId: userId,
      userName: userName,
      status: 'pending', // Initial status
      createdAt: serverTimestamp(),
    });
    return { success: true, id: newRequestRef.id };
  } catch (error) {
    console.error('Error submitting custom request:', error);
    throw error;
  }
};

/**
 * Fetches custom requests for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - An array of custom requests.
 */
export const getUserCustomRequests = async (userId) => {
  try {
    const requestsCol = collection(db, 'customRequests');
    const q = query(requestsCol, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user custom requests:', error);
    throw error;
  }
};

/**
 * Fetches all custom requests (for admin).
 * @returns {Promise<Array>} - An array of all custom requests.
 */
export const getAllCustomRequests = async () => {
  try {
    const requestsCol = collection(db, 'customRequests');
    const querySnapshot = await getDocs(requestsCol);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all custom requests:', error);
    throw error;
  }
};

/**
 * Updates the status of a custom request.
 * @param {string} requestId - The ID of the request to update.
 * @param {string} status - The new status ('accepted' or 'denied').
 * @returns {Promise<{success: boolean}>}
 */
export const updateRequestStatus = async (requestId, status) => {
  try {
    const requestDocRef = doc(db, 'customRequests', requestId);
    await updateDoc(requestDocRef, {
      status: status,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};