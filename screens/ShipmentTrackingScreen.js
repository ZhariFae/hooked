import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import useAuth from 'auth/useAuth';
import { getShipmentsByUser } from 'services/productService';

const ShipmentTrackingScreen = () => {
  const [shipments, setShipments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchShipmentData = async () => {
      if (user?.uid) {
        const data = await getShipmentsByUser(user.uid);
        setShipments(data);
      }
    };
    fetchShipmentData();
  }, [user]);

  const renderItem = ({ item }) => (
    <View style={styles.shipmentItem}>
      <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.deliveryDate}>Expected Delivery: {item.expectedDelivery}</Text>
      <Text style={styles.deliveryDate}>Product ID: {item.productId}</Text>
    </View>
  );

  return (
    <ScreenComponent>
      <Header label="Shipment Tracking" />
      <FlatList
        data={shipments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No shipments found.</Text>}
      />
    </ScreenComponent>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  shipmentItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 16,
    color: 'gray',
  },
});

export default ShipmentTrackingScreen;