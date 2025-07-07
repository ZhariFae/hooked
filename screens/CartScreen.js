import AppButton from 'components/AppButton';
import CartCard from 'components/CartCard';
import Header from 'components/Header';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { height, radius, spacingX, spacingY } from 'config/spacing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCartProducts, updateCartItemQuantity } from 'services/userDataService';
import { submitCustomRequest } from 'services/customRequestService';
import { normalizeX, normalizeY } from 'utils/normalize';
import useAuth from 'auth/useAuth';
import { formatPrice } from 'utils/format';

function CartScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (user) {
      const cartProducts = await getCartProducts(user.uid);
      setProducts(cartProducts);
    }
  }, [user]);

  const handleQuantityChange = async (productId, newQuantity) => {
    // Find the product details
    const product = products.find((p) => p.id === productId);
    if (newQuantity > 99 && product) {
      // Use setTimeout to ensure Alert shows before any state update or async
      setTimeout(() => {
        Alert.alert(
          'Large Order Notice',
          'Orders above 99 units may take longer to ship. Your request will be reviewed by an admin.',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await submitCustomRequest(
                    user.uid,
                    user.displayName || user.email || 'User',
                    {
                      description: `Bulk order for ${product.name || product.title || 'product'}`,
                      quantity: newQuantity,
                      productId: productId,
                    }
                  );
                  Alert.alert('Request Sent', 'Your bulk order request has been sent to the admin. Please check the custom requests found on your profile for any updates.');
                } catch (e) {
                  Alert.alert('Error', 'Failed to send custom request.');
                }
              },
            },
          ]
        );
      }, 100);
      return;
    }
  };

  useEffect(() => {
    const calculateTotal = () => {
      const newTotal = products.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
      setTotal(newTotal);
    };
    calculateTotal();
  }, [products]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  return (
    <ScreenComponent style={styles.container}>
      <Header label={'My Cart'} />
      {/* Conditional rendering for empty cart message */}
      {products.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your basket of yarn is empty!</Text>
          <Text style={styles.emptyCartSubText}>Time to cast on some delightful finds.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          style={{ flex: 1 }}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => {
            return (
              <Animated.View
                entering={FadeInDown.delay(index * 140)
                  .duration(2000)
                  .damping(12)
                  .springify()}>
                <CartCard
                  item={item}
                  onQuantityChange={(newQuantity) => handleQuantityChange(item.id, newQuantity)}
                  onRemove={async () => {
                    // Remove item from cart
                    if (user) {
                      const { updateCartItemQuantity } = await import('services/userDataService');
                      await updateCartItemQuantity(user.uid, item.id, 0);
                      // Refresh cart
                      loadCart();
                    }
                  }}
                />
              </Animated.View>
            );
          }}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          backgroundColor: colors.white,
          borderTopRightRadius: radius._20,
          borderTopLeftRadius: radius._20,
        }}>
        <View style={styles.checkoutContainer}>
          <Row title={'Subtotal'} price={`₱${formatPrice(total)}`} />
          <View style={styles.separator} />
          <Row title={'Total'} price={`₱${formatPrice(total)}`} />
          <AppButton
            label={'Checkout'}
            onPress={() => navigation.navigate('Checkout', { cartTotal: total })}
          />
        </View>
      </KeyboardAvoidingView>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'grayBG',
  },
  listContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
  },
  emptyCartText: {
    fontSize: normalizeY(22),
    fontWeight: 'bold',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacingY._5,
  },
  emptyCartSubText: {
    fontSize: normalizeY(16),
    color: colors.gray,
    textAlign: 'center',
  },
  discountRow: {
    height: height.input,
    backgroundColor: colors.grayBG,
    width: '100%',
    borderRadius: radius._30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalizeX(15),
    alignItems: 'center',
  },
  input: {

    fontSize: normalizeY(16),
    flex: 1,
    paddingRight: spacingX._10,
  },
  applyText: {
    fontSize: normalizeY(18),
    color: colors.primary,
    fontWeight: '600',
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
    height: height.btn,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: colors.grayBG,
    alignItems: 'center',
  },
  separator: {
    height: normalizeY(2),
    width: '100%',
    backgroundColor: colors.grayBG,
  },
});
export default CartScreen;