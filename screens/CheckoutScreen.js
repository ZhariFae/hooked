import { MaterialIcons } from '@expo/vector-icons';
import Header from 'components/Header';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { height, radius, spacingX, spacingY } from 'config/spacing';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { normalizeX, normalizeY } from 'utils/normalize';
import useAuth from 'auth/useAuth';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { addUserAddress, getUserAddresses } from 'services/userDataService';
import { addShipment, addTransaction } from 'services/productService';
import { formatPrice } from 'utils/format';
import GCashQrModalContent from 'components/GCashQrModalContent';

function CheckoutScreen({ route }) {
  const { cartTotal } = route.params;
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('GCash');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: '', phone: '', address: '' });
  const [isGcashModalVisible, setGcashModalVisible] = useState(false);

  const shippingFee = 30.0;
  const subtotal = cartTotal;
  const finalTotal = subtotal + shippingFee;

  const loadAddresses = useCallback(async () => {
    if (user) {
      const userAddresses = await getUserAddresses(user.uid);
      setAddresses(userAddresses);
      if (userAddresses.length > 0) {
        setSelectedAddress(userAddresses[0].id); // Select the first address by default
      } else {
        // If no addresses, prompt to add one
        setAddressModalVisible(true);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const handleAddAddress = async () => {
    if (!newAddress.title || !newAddress.phone || !newAddress.address) {
      Alert.alert('Incomplete Form', 'Please fill out all address fields.');
      return;
    }
    try {
      await addUserAddress(user.uid, newAddress);
      Alert.alert('Success', 'Address added successfully.');
      setAddressModalVisible(false);
      setNewAddress({ title: '', phone: '', address: '' }); // Reset form
      loadAddresses(); // Refresh addresses
    } catch (error) {
      Alert.alert('Error', 'Failed to add address.');
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
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            id={addr.id}
            selected={selectedAddress}
            setSelected={setSelectedAddress}
            title={addr.title}
            phone={addr.phone}
            address={addr.address}
          />
        ))}

        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => setAddressModalVisible(true)}>
          <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
          <Typo style={{ color: colors.primary, fontWeight: '600' }}>Add New Address</Typo>
        </TouchableOpacity>

        <Typo size={18} style={{ fontWeight: '600' }}>
          Payment method
        </Typo>
        <MethodRow
          title={'GCash'}
          selected={selectedMethod}
          setSelected={setSelectedMethod}
          img={require('../assets/gcash.png')}
        />
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <Row title={'Shipping fee'} price={`₱${formatPrice(shippingFee)}`} />
        <View style={styles.separator} />
        <Row title={'Subtotal'} price={`₱${formatPrice(subtotal)}`} />
        <View style={styles.separator} />
        <Row title={'Total'} price={`₱${formatPrice(finalTotal)}`} />
        <TouchableOpacity
          style={[{
            backgroundColor: selectedAddress ? colors.primary : colors.grayBG,
            paddingVertical: spacingY._15,
            borderRadius: radius._10,
            alignItems: 'center',
            marginTop: spacingY._15,
          }]}
          disabled={!selectedAddress}
          onPress={async () => {
            setGcashModalVisible(true);
            // Create shipment in Firebase
            const orderId = `ORD${Math.floor(Math.random() * 100000)}`;
            const status = 'Pending';
            const expectedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            // For demo, assuming cart contains a single productId, you may need to adjust for multiple products
            await addShipment({ orderId, status, expectedDelivery, userId: user.uid });

            // Add transaction history using productService
            await addTransaction({
              userId: user.uid,
              orderId,
              amount: finalTotal,
              date: new Date().toISOString().split('T')[0],
              status: 'Paid',
              paymentMethod: selectedMethod,
            });
          }}
        >
          <Typo style={{ color: selectedAddress ? colors.white : colors.gray, fontWeight: '600', fontSize: 18 }}>
            Payment
          </Typo>
        </TouchableOpacity>
      </View>
      <AddressModal
        visible={isAddressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSave={handleAddAddress}
        address={newAddress}
        setAddress={setNewAddress}
      />
      <GcashModal
        visible={isGcashModalVisible}
        onClose={() => setGcashModalVisible(false)}
        totalAmount={finalTotal}
      />
    </ScreenComponent>
  );
}

const AddressModal = ({ visible, onClose, onSave, address, setAddress }) => (
  <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Typo size={18} style={{ fontWeight: '600', marginBottom: spacingY._20 }}>
          Add New Address
        </Typo>
        <TextInput
          style={styles.input}
          placeholder="Title (e.g., Home, Office)"
          value={address.title}
          onChangeText={(text) => setAddress({ ...address, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={address.phone}
          onChangeText={(text) => setAddress({ ...address, phone: text })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Full Address"
          value={address.address}
          onChangeText={(text) => setAddress({ ...address, address: text })}
          multiline
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity onPress={onClose} style={styles.modalButton}>
            <Typo>Cancel</Typo>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave} style={[styles.modalButton, styles.saveButton]}>
            <Typo style={{ color: colors.white }}>Save</Typo>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// GcashModal component encapsulates Modal and GCashQrModalContent
const GcashModal = ({ visible, onClose, totalAmount }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <GCashQrModalContent
          totalAmount={totalAmount}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
};

const Row = ({ title, price }) => {
  return (
    <View style={styles.row}>
      <Typo
        size={15}
        style={{ color: title == 'Total' ? colors.black : colors.gray, fontWeight: '500' }}>
        {title}
      </Typo>
      <Typo size={18} style={{ fontWeight: '600' }}>
        {price}
      </Typo>
    </View>
  );
};

const MethodRow = ({ title, img, selected, setSelected }) => {
  const isSelected = selected == title;
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

const AddressCard = ({ id, title, selected, setSelected, address, phone }) => {
  const isSelected = selected == id;
  return (
    <TouchableOpacity
      style={isSelected ? styles.selectedCard : styles.unSelectedCard}
      onPress={() => setSelected(id)}>
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
    backgroundColor: 'grayBG',
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
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingX._10,
    padding: spacingY._15,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius._20,
    marginBottom: spacingY._20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: radius._20,
    padding: spacingX._20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.grayBG,
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    fontSize: normalizeY(16),
    marginBottom: spacingY._15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacingY._10,
  },
  modalButton: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius._10,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
});
export default CheckoutScreen;
