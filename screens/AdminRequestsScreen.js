import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getAllCustomRequests } from '../services/customRequestService';

const AdminRequestsScreen = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const allRequests = await getAllCustomRequests();
        setRequests(allRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  // Function to handle accept/deny actions
  const handleAction = (requestId, action) => {
    console.log(`Request ${requestId} ${action}ed`);
    // Implement the logic to update the request status in the database.
    // For example:
    // updateRequestStatus(requestId, action).then(() => {
    //   // Refresh the requests list
    //   fetchRequests();
    // });
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestTicket}>
      <Text>UserName: {item.userId.displayName}</Text>
      <Text>Description: {item.description}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Accept" onPress={() => handleAction(item.id, 'accepted')} />
        <Button title="Deny" onPress={() => handleAction(item.id, 'denied')} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Custom Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  requestTicket: { borderWidth: 1, padding: 10, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});

export default AdminRequestsScreen;