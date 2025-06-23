// components/GCashQrModalContent.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import Typo from './Typo';
import colors from '../config/colors';
import { spacingX, spacingY, radius } from '../config/spacing';

/**
 * GCashQrModalContent component displays the GCash QR code and payment details within a modal.
 * It receives the total amount to display and an onClose function to close the modal.
 */
const GCashQrModalContent = ({ totalAmount, onClose }) => {
  // Generate a random number to make the placeholder "random"
  const randomNumber = Math.floor(Math.random() * 1000000); 
  // Using a placeholder image for a non-working QR code.
  // The 'text' parameter includes a random number to make it unique on each render.
  const qrCodeImage = { uri: `https://placehold.co/250x250/E0E0E0/333333?text=QR+Code+${randomNumber}` };

  return (
    <View style={styles.modalContent}>
      {/* Close Button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialIcons name="close" size={24} color={colors.black} />
      </TouchableOpacity>

      {/* Header and Total Amount */}
      <Typo size={22} style={styles.title}>
        Scan to Pay with GCash
      </Typo>
      <Typo size={20} style={styles.amount}>
        Total: ₱{totalAmount.toFixed(2)}
      </Typo>

      {/* QR Code Image */}
      <Image source={qrCodeImage} style={styles.qrCode} />

      {/* Instruction Text */}
      <Typo size={14} style={styles.instruction}>
        Open your GCash app and scan the QR code to complete your payment.
      </Typo>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: colors.white,
    padding: spacingX._20,
    borderRadius: radius._20,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: spacingY._10,
    right: spacingX._10,
    zIndex: 1,
    padding: spacingY._5,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacingY._15,
    marginTop: spacingY._20,
    textAlign: 'center',
  },
  amount: {
    color: colors.primary,
    marginBottom: spacingY._20,
    fontWeight: '600',
  },
  qrCode: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: spacingY._20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius._10,
  },
  instruction: {
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacingY._10,
    lineHeight: 20,
  },
});

export default GCashQrModalContent;
