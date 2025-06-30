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
 * Submits a custom product inquiry.
 * @param {string} userId The ID of the user.
 * @param {string} userName The display name of the user.
 * @param {object} inquiryData - The data for the custom inquiry.
 * @returns {Promise<{success: boolean, id: string}>}
 */
export const submitCustomerInquiry = async (userId, userName, inquiryData) => {
  try {
    const inquiriesCol = collection(db, 'customerInquiry');
    const newInquiryRef = await addDoc(inquiriesCol, {
      ...inquiryData,
      userId: userId,
      userName: userName,
      status: 'pending', // Initial status
      createdAt: serverTimestamp(),
    });
    return { success: true, id: newInquiryRef.id };
  } catch (error) {
    console.error('Error submitting custom inquiry:', error);
    throw error;
  }
};

/**
 * Fetches customer inquiries for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - An array of customer inquiries.
 */
export const getUserCustomerInquiry = async (userId) => {
  try {
    const inquiriesCol = collection(db, 'customerInquiry');
    const q = query(inquiriesCol, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user custom inquiry:', error);
    throw error;
  }
};

/**
 * Fetches all customer inquiries (for admin).
 * @returns {Promise<Array>} - An array of all customer inquiries.
 */
export const getAllCustomerInquiry = async () => {
  try {
    const inquiriesCol = collection(db, 'customerInquiry');
    const querySnapshot = await getDocs(inquiriesCol);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all custom inquiry:', error);
    throw error;
  }
};

/**
 * Updates the status of a customer inquiries.
 * @param {string} inquiryId - The ID of the inquiries to update.
 * @param {string} status - The new status ('answered', etc).
 * @param {string} [answer] - The answer to the inquiry (optional, required if status is 'answered').
 * @returns {Promise<{success: boolean}>}
 */
export const updateInquiryStatus = async (inquiryId, status, answer) => {
  try {
    const inquiryDocRef = doc(db, 'customerInquiry', inquiryId);
    const updateData = { status };
    if (status === 'answered' && answer !== undefined) {
      updateData.answer = answer;
    }
    await updateDoc(inquiryDocRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};