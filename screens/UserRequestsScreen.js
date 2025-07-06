import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import Header from 'components/Header';
import AppButton from 'components/AppButton';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { getUserCustomRequests } from 'services/customRequestService';
import { getProductByCustomRequestId } from 'services/productService';
import useAuth from 'auth/useAuth';
import { addToCart } from 'services/userDataService';

const UserRequestsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const userRequests = await getUserCustomRequests(user.uid);
        // For accepted requests, fetch the price from the product collection
        const requestsWithPrice = await Promise.all(
          userRequests.map(async (req) => {
            if (req.status?.toLowerCase() === 'accepted') {
              try {
                const product = await getProductByCustomRequestId(req.id);
                if (product && typeof product.price === 'number') {
                  return { ...req, price: product.price };
                }
              } catch (e) {
                // ignore error, fallback to no price
              }
            }
            return req;
          })
        );
        setRequests(requestsWithPrice);
      } catch (error) {
        console.error('Failed to load custom requests:', error);
        Alert.alert('Error', 'Could not fetch your requests.');
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return { backgroundColor: colors.primaryLight, color: colors.primary };
      case 'denied':
        return { backgroundColor: '#fee2e2', color: '#ef4444' };
      case 'pending':
      default:
        return { backgroundColor: '#ffedd5', color: '#f97316' };
    }
  };

  const renderRequestItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.requestInfo}>
          <Typo style={styles.description} numberOfLines={3}>
            {item.description}
          </Typo>
          <Typo style={styles.quantity}>Quantity: {item.quantity}</Typo>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}> 
            <Typo style={[styles.statusText, { color: statusStyle.color }]}> 
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
            </Typo>
          </View>
          {item.status?.toLowerCase() === 'accepted' && (
            <View style={styles.priceAndCartRow}>
              {typeof item.price === 'number' && (
                <Typo style={styles.priceText}>₱{item.price.toFixed(2)}</Typo>
              )}
              <AppButton
                label="Add to Cart"
                style={styles.addToCartButton}
                onPress={async () => {
                  if (user) {
                    // Fetch the product to get its real productId
                    const product = await getProductByCustomRequestId(item.id);
                    if (product && product.id) {
                      await addToCart(user.uid, product.id, item.quantity);
                      Alert.alert('Success', `${item.quantity} x ${item.description} added to cart!`);
                      navigation.navigate('Cart');
                    } else {
                      Alert.alert('Error', 'Product not found. Please try again later.');
                    }
                  }
                }}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenComponent>
        <Header label="My Custom Requests" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label="My Custom Requests" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Typo>You haven't made any custom requests yet.</Typo>
          </View>
        }
        ListFooterComponent={
          <AppButton
            label="Make a New Request"
            onPress={() => navigation.navigate('CustomRequest')}
            style={styles.newRequestButton}
          />
        }
      />
    </ScreenComponent>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacingX._20 },
  listContent: { padding: spacingX._15, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.grayBG,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestInfo: { flex: 1, marginRight: spacingX._10 },
  description: { fontWeight: '600', fontSize: 16, marginBottom: spacingY._5 },
  quantity: { color: colors.gray, fontSize: 14 },
  statusBadge: { paddingVertical: spacingY._5, paddingHorizontal: spacingX._10, borderRadius: radius._20 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  newRequestButton: { margin: spacingX._15, backgroundColor: colors.primary },
  addToCartButton: { marginTop: spacingY._10, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5 },
  priceAndCartRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacingY._10 },
  priceText: { fontWeight: 'bold', fontSize: 15, color: colors.primary, marginRight: spacingX._10 },
});

export default UserRequestsScreen;