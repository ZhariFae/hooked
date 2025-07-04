import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import Header from 'components/Header';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { getAllCustomRequests, updateRequestStatus } from 'services/customRequestService';

const AdminRequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  const handleAction = async (requestId, newStatus) => {
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
                onPress={() => handleAction(item.id, 'accepted')}>
                <Typo style={styles.actionButtonText}>Accept</Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.denyButton]}
                onPress={() => handleAction(item.id, 'denied')}>
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
});

export default AdminRequestsScreen;