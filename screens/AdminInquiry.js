import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import Header from 'components/Header';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { getAllCustomerInquiry, updateInquiryStatus } from 'services/inquiryService';

const AdminInquiry = () => {
  const navigation = useNavigation();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [answerInputs, setAnswerInputs] = useState({});

  const loadInquiries = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const allInquiries = await getAllCustomerInquiry();
      // Sort inquiries to show pending ones first
      allInquiries.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        // You can add secondary sort criteria here, e.g., by date
        return 0;
      });
      setInquiries(allInquiries);
    } catch (error) {
      console.error('Failed to load customer inquiries:', error);
      Alert.alert('Error', 'Could not fetch customer inquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadInquiries();
    }, [loadInquiries])
  );

  // Function to handle answer submission
  const handleSubmitAnswer = async (inquiryId) => {
    const answer = answerInputs[inquiryId]?.trim();
    if (!answer) {
      Alert.alert('Error', 'Please enter an answer before submitting.');
      return;
    }
    // Optimistic UI update
    const originalInquiries = [...inquiries];
    setInquiries((prevInquiries) =>
      prevInquiries.map((req) =>
        req.id === inquiryId ? { ...req, status: 'answered', answer } : req
      )
    );
    try {
      // You may need to update this service to accept an answer
      const result = await updateInquiryStatus(inquiryId, 'answered', answer);
      if (!result.success) {
        setInquiries(originalInquiries);
        Alert.alert('Error', 'Failed to submit the answer.');
      }
    } catch (error) {
      setInquiries(originalInquiries);
      Alert.alert('Error', 'An error occurred while submitting the answer.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'answered':
        return { backgroundColor: colors.primaryLight, color: colors.primary };
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
            {item.question}
          </Typo>
          {item.status === 'answered' && item.answer && (
            <View style={styles.answerBox}>
              <Typo style={styles.answerLabel}>Admin Answer:</Typo>
              <Typo style={styles.answerText}>{item.answer}</Typo>
            </View>
          )}
        </View>
        <View style={styles.statusAndActions}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Typo style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
            </Typo>
          </View>
          {item.status === 'pending' && (
            <View style={styles.answerInputContainer}>
              <TextInput
                style={styles.answerInput}
                placeholder="Type your answer..."
                value={answerInputs[item.id] || ''}
                onChangeText={(text) => setAnswerInputs((prev) => ({ ...prev, [item.id]: text }))}
                multiline
              />
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton, { marginTop: 8 }]}
                onPress={() => handleSubmitAnswer(item.id)}
              >
                <Typo style={styles.actionButtonText}>Submit Answer</Typo>
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
        <Header label="Customer Inquiries" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label="Customer Inquiries" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={inquiries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Typo>There are no inquiries at the moment.</Typo>
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
  answerInputContainer: { flex: 1, flexDirection: 'column', marginLeft: 10, flexGrow: 1 },
  answerInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius._8,
    padding: spacingX._10,
    minHeight: 40,
    fontSize: 14,
    backgroundColor: colors.white,
    marginBottom: 4,
  },
  answerBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: radius._8,
    padding: spacingX._10,
    marginTop: spacingY._5,
  },
  answerLabel: { fontWeight: 'bold', color: colors.primary, marginBottom: 2 },
  answerText: { color: colors.black },
});

export default AdminInquiry;