import React from 'react';
import TabNavigator from './TabNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import ItemDetailsScreen from 'screens/ItemDetailsScreen';
import CartScreen from 'screens/CartScreen';
import AdminAddProductScreen from 'screens/AdminAddProductScreen';
import NotificationsScreen from 'screens/NotificationsScreen';
import CustomRequestScreen from 'screens/CustomRequestScreen';
import AdminRequestsScreen from 'screens/AdminRequestsScreen';
import UserRequestsScreen from 'screens/UserRequestsScreen';
import AdminManageProductsScreen from 'screens/AdminManageProductsScreen';
import CheckoutScreen from 'screens/CheckoutScreen';
import CustomerInquiry from 'screens/CustomerInquiry';
import UserInquiry from 'screens/UserInquiry';
import AdminInquiry from 'screens/AdminInquiry';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Splash'}
      screenOptions={{ headerShown: false, orientation: 'portrait' }}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AdminAddProduct" component={AdminAddProductScreen} />
      <Stack.Screen name="AdminManageProducts" component={AdminManageProductsScreen} />
      <Stack.Screen name="CustomRequest" component={CustomRequestScreen} />
      <Stack.Screen name="AdminRequests" component={AdminRequestsScreen} />
      <Stack.Screen name="UserRequests" component={UserRequestsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="UserInquiry" component={UserInquiry} />
      <Stack.Screen name="CustomerInquiry" component={CustomerInquiry} />
      <Stack.Screen name="AdminInquiry" component={AdminInquiry} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
