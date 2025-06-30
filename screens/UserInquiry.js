import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import Header from 'components/Header';
import AppButton from 'components/AppButton';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { getUserCustomerInquiry } from 'services/inquiryService';
import useAuth from 'auth/useAuth';

const UserInquiry = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInquiries = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const userInquiries = await getUserCustomerInquiry(user.uid);
        setInquiries(userInquiries);
      } catch (error) {
        console.error('Failed to load customer inquiry:', error);
        Alert.alert('Error', 'Could not fetch your inquiries.');
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadInquiries();
    }, [loadInquiries])
  );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'answered':
        return { backgroundColor: colors.primaryLight, color: colors.primary };
      case 'pending':
      default:
        return { backgroundColor: '#ffedd5', color: '#f97316' };
    }
  };

  const renderInquiryItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.requestInfo}>
          <Typo style={styles.description} numberOfLines={3}>
            {item.question}
          </Typo>
          {item.status === 'answered' && item.answer && (
            <View style={{ backgroundColor: '#e0f2fe', borderRadius: 8, padding: 8, marginTop: 6 }}>
              <Typo style={{ fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>Admin Answer:</Typo>
              <Typo style={{ color: colors.black }}>{item.answer}</Typo>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Typo style={[styles.statusText, { color: statusStyle.color }]}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
          </Typo>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenComponent>
        <Header label="My Inquiries" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label="My Inquiries" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={inquiries}
        renderItem={renderInquiryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Typo>You haven't made any customer inquiries yet.</Typo>
          </View>
        }
        ListFooterComponent={
          <AppButton
            label="Submit an Inquiry"
            onPress={() => navigation.navigate('CustomerInquiry')}
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
});

export default UserInquiry;