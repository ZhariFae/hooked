import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from 'auth/firebaseAuth';

const db = getFirestore(firebaseApp);

const TransactionHistoryScreen = ({ route }) => {
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState('');
  const userId = route?.params?.userId;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      // Fetch user name
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserName(userDoc.data().displayName || userDoc.data().name || userId);
        }
      } catch (e) {}
      // Fetch transactions
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    };
    fetchTransactions();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionId}>Transaction ID: {item.id}</Text>
      <Text style={styles.amount}>Amount: ₱{item.amount}</Text>
      <Text style={styles.date}>Date: {item.date}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.paymentMethod}>Payment: {item.paymentMethod}</Text>
    </View>
  );

  return (
    <ScreenComponent>
      <Header label={`Transaction History${userName ? ' - ' + userName : ''}`} />
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No transactions found.</Text>}
      />
    </ScreenComponent>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 4,
  },
  status: {
    fontSize: 15,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 15,
    color: 'gray',
  },
});

export default TransactionHistoryScreen;
