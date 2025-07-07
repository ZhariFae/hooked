import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import Header from 'components/Header';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { getAllCustomRequests, updateRequestStatus } from 'services/customRequestService';
import { addProduct, getProductById } from 'services/productService';

const AdminRequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRequest, setModalRequest] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const allRequests = await getAllCustomRequests();
      // Sort requests to show pending ones first
      allRequests.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        // You can add secondary sort criteria here, e.g., by date
        return 0;
      });
      setRequests(allRequests);
    } catch (error) {
      console.error('Failed to load custom requests:', error);
      Alert.alert('Error', 'Could not fetch custom requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  // Function to handle accept/deny actions
  const handleAction = async (requestId, newStatus, requestItem) => {
    if (newStatus === 'accepted') {
      // Check if product already exists for this request
      if (requestItem.productId) {
        try {
          const existingProduct = await getProductById(requestItem.productId);
          if (existingProduct) {
            // Product exists, just update status without prompting for price
            const originalRequests = [...requests];
            setRequests((prevRequests) =>
              prevRequests.map((req) => (req.id === requestId ? { ...req, status: 'accepted' } : req))
            );
            const result = await updateRequestStatus(requestId, 'accepted');
            if (!result.success) {
              setRequests(originalRequests);
              Alert.alert('Error', 'Failed to update request status.');
            } else {
              Alert.alert('Success', 'Request accepted. Product already exists.');
              // Refresh requests to reflect updated status
              loadRequests();
            }
            return;
          }
        } catch (err) {
          // If error in checking product, fallback to price modal
        }
      }
      setModalRequest(null);
      setPriceInput('');
      setModalVisible(false);
      // Also update status to accepted if product exists but not found for some reason
      const originalRequests = [...requests];
      setRequests((prevRequests) =>
        prevRequests.map((req) => (req.id === requestId ? { ...req, status: 'accepted' } : req))
      );
      const result = await updateRequestStatus(requestId, 'accepted');
      if (!result.success) {
        setRequests(originalRequests);
        Alert.alert('Error', 'Failed to update request status.');
      } else {
        loadRequests();
      }
      return;
    }
    // Optimistic UI update
    const originalRequests = [...requests];
    setRequests((prevRequests) =>
      prevRequests.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
    );

    try {
      const result = await updateRequestStatus(requestId, newStatus);
      if (!result.success) {
        // Revert on failure
        setRequests(originalRequests);
        Alert.alert('Error', `Failed to update the request to "${newStatus}".`);
      }
    } catch (error) {
      // Revert on error
      setRequests(originalRequests);
      Alert.alert('Error', `An error occurred while updating the request.`);
    }
  };

  // Function to handle adding product after price input
  const handleAddProduct = async () => {
    if (!modalRequest || !priceInput) {
      Alert.alert('Error', 'Please enter a price.');
      return;
    }
    setAddingProduct(true);
    const originalRequests = [...requests];
    setRequests((prevRequests) =>
      prevRequests.map((req) => (req.id === modalRequest.id ? { ...req, status: 'accepted' } : req))
    );
    try {
      // Update request status first
      const result = await updateRequestStatus(modalRequest.id, 'accepted');
      if (!result.success) {
        setRequests(originalRequests);
        Alert.alert('Error', 'Failed to update request status.');
        setAddingProduct(false);
        return;
      }
      // Calculate per-unit price if admin input is total price for all units
      const totalPrice = parseFloat(priceInput);
      const quantity = modalRequest.quantity || 1;
      const perUnitPrice = quantity > 0 ? totalPrice / quantity : totalPrice;
      const productData = {
        name: modalRequest.description,
        description: modalRequest.description,
        category: 'Custom Requests',
        price: perUnitPrice,
        customRequestId: modalRequest.id,
        userId: modalRequest.userId,
      };
      await addProduct(productData);
      setModalVisible(false);
      setModalRequest(null);
      setPriceInput('');
      Alert.alert('Success', 'Product added and request accepted. (Per unit price: ₱' + perUnitPrice.toFixed(2) + ')');
    } catch (error) {
      setRequests(originalRequests);
      Alert.alert('Error', 'Failed to add product.');
    } finally {
      setAddingProduct(false);
    }
  };

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

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.requestInfo}>
          <Typo style={styles.userName}>{item.userName || 'Unknown User'}</Typo>
          <Typo style={styles.description} numberOfLines={3}>
            {item.description}
          </Typo>
          <Typo style={styles.quantity}>Quantity: {item.quantity}</Typo>
        </View>
        <View style={styles.statusAndActions}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}> 
            <Typo style={[styles.statusText, { color: statusStyle.color }]}> 
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
            </Typo>
          </View>
          {item.status === 'pending' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAction(item.id, 'accepted', item)}>
                <Typo style={styles.actionButtonText}>Accept</Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.denyButton]}
                onPress={() => handleAction(item.id, 'denied', item)}>
                <Typo style={styles.actionButtonText}>Deny</Typo>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <ScreenComponent>
        <Header label="Custom Requests" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label="Custom Requests" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Typo>There are no custom requests at the moment.</Typo>
          </View>
        }
      />
      {/* Modal for price input */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!addingProduct) {
            setModalVisible(false);
            setModalRequest(null);
            setPriceInput('');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typo style={styles.modalTitle}>Enter Price for Product</Typo>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter price"
              keyboardType="numeric"
              value={priceInput}
              onChangeText={setPriceInput}
              editable={!addingProduct}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton, { flex: 1, opacity: addingProduct ? 0.7 : 1 }]}
                onPress={handleAddProduct}
                disabled={addingProduct}
              >
                <Typo style={styles.actionButtonText}>{addingProduct ? 'Adding...' : 'Confirm'}</Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.denyButton, { flex: 1, marginLeft: 10, opacity: addingProduct ? 0.7 : 1 }]}
                onPress={() => {
                  if (!addingProduct) {
                    setModalVisible(false);
                    setModalRequest(null);
                    setPriceInput('');
                  }
                }}
                disabled={addingProduct}
              >
                <Typo style={styles.actionButtonText}>Cancel</Typo>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenComponent>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacingX._20 },
  listContent: { padding: spacingX._15, flexGrow: 1 },
  card: {
    backgroundColor: colors.grayBG,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestInfo: { marginBottom: spacingY._10 },
  userName: { fontWeight: 'bold', fontSize: 16, color: colors.primary, marginBottom: spacingY._5 },
  description: { fontSize: 15, marginBottom: spacingY._10, color: colors.black },
  quantity: { color: colors.gray, fontSize: 14 },
  statusAndActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacingY._10,
    marginTop: spacingY._5,
  },
  statusBadge: {
    paddingVertical: spacingY._5,
    paddingHorizontal: spacingX._10,
    borderRadius: radius._20,
    alignSelf: 'flex-start',
  },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  buttonContainer: { flexDirection: 'row', gap: spacingX._10 },
  actionButton: {
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._8,
  },
  acceptButton: { backgroundColor: colors.primary },
  denyButton: { backgroundColor: '#ef4444' },
  actionButtonText: { color: colors.white, fontWeight: '600', fontSize: 13 },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radius._12,
    padding: 24,
    width: '85%',
    alignItems: 'stretch',
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius._8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: colors.grayBG,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AdminRequestsScreen;