// CheckoutScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import AppButton from 'components/AppButton';
import Header from 'components/Header';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { height, radius, spacingX, spacingY } from 'config/spacing';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native'; // <-- Import Modal
import { normalizeX, normalizeY } from 'utils/normalize';

// Import the new GCash QR modal content component
import GCashQrModalContent from 'components/GCashQrModalContent'; // <-- Adjust this path if 'components' is not directly under your project root

function CheckoutScreen({ route }) {
  const { cartTotal } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('GCash'); // Set default to GCash for testing
  const [selectedAddress, setSelectedAddress] = useState('Home');
  const [showQrModal, setShowQrModal] = useState(false); // <-- State to control modal visibility

  const shippingFee = 30.0;
  const subtotal = cartTotal;
  const finalTotal = subtotal + shippingFee;

  /**
   * Handles the press event on the "Payment" button.
   * If GCash is selected, it opens the QR code modal.
   * Otherwise, it can handle other payment methods (e.g., alert for now).
   */
  const handlePaymentPress = () => {
    if (selectedMethod === 'GCash') {
      setShowQrModal(true); // Open the QR modal
    } else {
      // In a real app, you would handle other payment methods here,
      // e.g., navigate to a credit card form or process the payment directly.
      // For this example, we'll just show an alert.
      // Remember: Avoid using native alert() in production apps, use a custom modal for messages.
      alert('Currently, only GCash payment is supported in this demo.');
    }
  };

  return (
    <ScreenComponent style={styles.container}>
      <Header label={'Checkout'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, padding: spacingX._20 }}
        contentContainerStyle={{ paddingBottom: '10%' }}>
        <Typo size={18} style={{ fontWeight: '600', marginBottom: spacingY._15 }}>
          Shipping to
        </Typo>
        <AddressCard
          selected={selectedAddress}
          setSelected={setSelectedAddress}
          title="Home"
          phone="(+63) 123 456 7890"
          address="123 Salcedo Street, Makati City"
        />
        <AddressCard
          selected={selectedAddress}
          setSelected={setSelectedAddress}
          title="Office"
          phone="(+63) 123 456 7890"
          address="123 Ayala Avenue, Makati City"
        />

        <Typo size={18} style={{ fontWeight: '600' }}>
          Payment method
        </Typo>
        <MethodRow
          title={'GCash'}
          selected={selectedMethod}
          setSelected={setSelectedMethod}
          img={require('../assets/gcash.png')} // Ensure this path is correct
        />
        {/* You can add other payment methods here later */}
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <Row title={'Shipping fee'} price={`₱${shippingFee.toFixed(2)}`} />
        <View style={styles.separator} />
        <Row title={'Subtotal'} price={`₱${subtotal.toFixed(2)}`} />
        <View style={styles.separator} />
        <Row title={'Total'} price={`₱${finalTotal.toFixed(2)}`} />
        <AppButton
          label={'Payment'}
          onPress={handlePaymentPress} // <-- Assign the new handler to onPress
        />
      </View>

      {/* The Modal Component */}
      <Modal
        animationType="fade" // Or "slide" for a different effect
        transparent={true} // Makes the background behind the modal transparent
        visible={showQrModal} // Controls modal visibility based on state
        onRequestClose={() => {
          // This is for Android's hardware back button.
          // It's good practice to allow closing the modal this way.
          setShowQrModal(!showQrModal);
        }}>
        {/* This View creates the dimmed background effect and centers the modal content */}
        <View style={styles.centeredView}>
          <GCashQrModalContent
            totalAmount={finalTotal} // Pass the total amount to the modal
            onClose={() => setShowQrModal(false)} // Pass a function to close the modal
          />
        </View>
      </Modal>
    </ScreenComponent>
  );
}

// Re-using your existing helper components
const Row = ({ title, price }) => {
  return (
    <View style={styles.row}>
      <Typo
        size={15}
        style={{ color: title === 'Total' ? colors.black : colors.gray, fontWeight: '500' }}>
        {title}
      </Typo>
      <Typo size={18} style={{ fontWeight: '600' }}>
        {price}
      </Typo>
    </View>
  );
};

const MethodRow = ({ title, img, selected, setSelected }) => {
  const isSelected = selected === title; // Use strict equality
  return (
    <TouchableOpacity style={styles.row} onPress={() => setSelected(title)}>
      <View style={styles.methodImgBg}>
        <Image source={img} style={styles.methodImg} />
      </View>
      <Typo size={15} style={{ color: colors.black, fontWeight: '500', flex: 1 }}>
        {title}
      </Typo>
      <View>
        <View
          style={[
            styles.dotRadius,
            { borderColor: isSelected ? colors.primary : colors.lightGray },
          ]}>
          {isSelected && <View style={styles.dot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AddressCard = ({ title, selected, setSelected, address, phone }) => {
  const isSelected = selected === title; // Use strict equality
  return (
    <TouchableOpacity
      style={isSelected ? styles.selectedCard : styles.unSelectedCard}
      onPress={() => setSelected(title)}>
      <View
        style={[styles.dotRadius, { borderColor: isSelected ? colors.primary : colors.lightGray }]}>
        {isSelected && <View style={styles.dot} />}
      </View>
      <View style={{ flex: 1, gap: spacingY._5 }}>
        <Typo size={16} style={{ fontWeight: '500' }}>
          {title}
        </Typo>
        <Typo size={12} style={{ color: colors.gray }}>
          {phone}
        </Typo>
        <Typo size={12} style={{ color: colors.gray }}>
          {address}
        </Typo>
      </View>
      <MaterialIcons name="mode-edit" size={20} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.grayBG, // Changed from string 'grayBG' to colors.grayBG
  },
  checkoutContainer: {
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.2,
    backgroundColor: colors.white,
    paddingTop: spacingY._20,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  row: {
    height: height.input,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: colors.grayBG,
    alignItems: 'center',
    gap: spacingX._10,
    marginTop: spacingY._10,
  },
  methodImgBg: {
    backgroundColor: colors.white,
    borderWidth: 1,
    padding: spacingY._7,
    borderRadius: radius._30,
    borderColor: colors.lighterGray,
  },
  methodImg: {
    height: normalizeY(30),
    width: normalizeY(30),
    resizeMode: 'contain',
  },
  separator: {
    height: normalizeY(2),
    width: '100%',
    backgroundColor: colors.grayBG,
  },
  dotRadius: {
    borderWidth: normalizeY(2),
    borderRadius: radius._20,
    borderColor: colors.primary,
    height: normalizeY(20),
    width: normalizeY(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: normalizeY(11),
    width: normalizeY(11),
    borderRadius: radius._10,
    backgroundColor: colors.primary,
  },
  selectedCard: {
    backgroundColor: colors.white,
    gap: spacingX._10,
    flexDirection: 'row',
    padding: spacingY._15,
    borderRadius: radius._20,
    marginBottom: spacingY._20,
    shadowColor: colors.black,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
  },
  unSelectedCard: {
    backgroundColor: colors.lighterGray,
    gap: spacingX._10,
    flexDirection: 'row',
    padding: spacingY._15,
    borderRadius: radius._20,
    marginBottom: spacingY._20,
  },
  // New style for the modal overlay and centering
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent dark background
  },
});

export default CheckoutScreen;