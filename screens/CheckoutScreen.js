import { MaterialIcons } from '@expo/vector-icons';
import AppButton from 'components/AppButton';
import Header from 'components/Header';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { height, radius, spacingX, spacingY } from 'config/spacing';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { normalizeX, normalizeY } from 'utils/normalize';

function CheckoutScreen({ route }) {
  const { cartTotal } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('Credit Card');
  const [selectedAddress, setSelectedAddress] = useState('Home');
  const shippingFee = 30.0;
  const subtotal = cartTotal;
  const finalTotal = subtotal + shippingFee;
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
          phone="(319) 555-0115"
          address="482 W Dallas St Wallace"
        />
        <AddressCard
          selected={selectedAddress}
          setSelected={setSelectedAddress}
          title="Office"
          phone="(207) 555-0119"
          address="1749 Wheeler Ridge"
        />

        <Typo size={18} style={{ fontWeight: '600' }}>
          Payment method
        </Typo>
        <MethodRow
          title={'Credit Card'}
          selected={selectedMethod}
          setSelected={setSelectedMethod}
          img={require('../assets/visa.png')}
        />
        <MethodRow
          title={'PayPal'}
          selected={selectedMethod}
          setSelected={setSelectedMethod}
          img={require('../assets/paypal.png')}
        />
        <MethodRow
          title={'Google Pay'}
          selected={selectedMethod}
          setSelected={setSelectedMethod}
          img={require('../assets/google.png')}
        />
        <MethodRow
          title={'Apple Pay'}
          selected={selectedMethod}
          setSelected={setSelectedMethod}
          img={require('../assets/apple.png')}
        />
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <Row title={'Shipping fee'} price={`₱${shippingFee.toFixed(2)}`} />
        <View style={styles.separator} />
        <Row title={'Subtotal'} price={`₱${subtotal.toFixed(2)}`} />
        <View style={styles.separator} />
        <Row title={'Total'} price={`₱${finalTotal.toFixed(2)}`} />
        <AppButton label={'Payment'} />
      </View>
    </ScreenComponent>
  );
}

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

const AddressCard = ({ title, selected, setSelected, address, phone }) => {
  const isSelected = selected == title;
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
});
export default CheckoutScreen;
