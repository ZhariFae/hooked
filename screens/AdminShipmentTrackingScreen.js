import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import { getFirestore, doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { firebaseApp } from 'auth/firebaseAuth';

const db = getFirestore(firebaseApp);

const STATUS_OPTIONS = ['Pending', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'];

const AdminShipmentTrackingScreen = () => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('Pending');

  useEffect(() => {
    const fetchAllShipments = async () => {
      const querySnapshot = await getDocs(collection(db, 'shipments'));
      const shipmentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Fetch user names for each shipment
      const shipmentsWithNames = await Promise.all(shipmentsData.map(async (shipment) => {
        let userName = shipment.userId;
        try {
          const userDoc = await getDoc(doc(db, 'users', shipment.userId));
          if (userDoc.exists()) {
            userName = userDoc.data().displayName || userDoc.data().name || shipment.userId;
          }
        } catch (e) {}
        return { ...shipment, userName };
      }));
      setShipments(shipmentsWithNames);
    };
    fetchAllShipments();
  }, []);

  const openEditModal = (shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await updateDoc(doc(db, 'shipments', selectedShipment.id), { status: newStatus });
      setShipments(shipments.map(s => s.id === selectedShipment.id ? { ...s, status: newStatus } : s));
      setModalVisible(false);
      Alert.alert('Success', 'Status updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.shipmentItem} onPress={() => openEditModal(item)}>
      <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.deliveryDate}>Expected Delivery: {item.expectedDelivery}</Text>
      <Text style={styles.userId}>User: {item.userName}</Text>
      <Text style={{ color: 'blue', marginTop: 8 }}>Edit Status</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenComponent>
      <Header label="Admin Shipment Tracking" />
      <FlatList
        data={shipments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No shipments found.</Text>}
      />
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Edit Status</Text>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={{ padding: 10, backgroundColor: newStatus === status ? '#2196F3' : '#eee', borderRadius: 6, marginBottom: 8 }}
                onPress={() => setNewStatus(status)}
              >
                <Text style={{ color: newStatus === status ? 'white' : 'black' }}>{status}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection: 'row', marginTop: 24 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleStatusUpdate} style={[styles.modalButton, { backgroundColor: '#2196F3' }] }>
                <Text style={{ color: 'white' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
});

export default AdminShipmentTrackingScreen;
