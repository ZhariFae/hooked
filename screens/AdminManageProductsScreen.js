import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import Header from 'components/Header';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { products as fetchProducts } from 'utils/data';
import { deleteProduct, toggleProductActivation, updateProductPrice } from 'services/productService';
import { TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalizeY } from 'utils/normalize';
import { formatPrice } from 'utils/format';

function AdminManageProductsScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const productList = await fetchProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Failed to load products:', error);
      Alert.alert('Error', 'Could not fetch products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const handleDelete = (productId, productName) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(productId);
              Alert.alert('Success', `"${productName}" has been deleted.`);
              loadProducts(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the product.');
            }
          },
        },
      ]
    );
  };

  const handleToggleActivation = async (productId, currentStatus) => {
    try {
      // Optimistically update UI for instant feedback
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === productId ? { ...p, activate: !p.activate } : p))
      );
      await toggleProductActivation(productId, currentStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update the product status.');
      loadProducts(); // Re-fetch to revert optimistic update on error
    }
  };

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const handleEditPrice = (product) => {
    setEditingPriceId(product.id);
    setPriceInput(product.price.toString());
  };

  const handleSavePrice = async (product) => {
    const newPrice = parseFloat(priceInput);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid positive price.');
      return;
    }
    try {
      await updateProductPrice(product.id, newPrice);
      setEditingPriceId(null);
      setPriceInput('');
      loadProducts();
      Alert.alert('Success', 'Price updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update price.');
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.pictureUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Typo size={16} style={styles.productName} numberOfLines={2}>
          {item.name}
        </Typo>
        {editingPriceId === item.id ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TextInput
              style={styles.priceInput}
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity onPress={() => handleSavePrice(item)} style={styles.saveButton}>
              <Typo size={14} style={{ color: colors.primary, fontWeight: 'bold' }}>Save</Typo>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingPriceId(null)} style={styles.cancelButton}>
              <Typo size={14} style={{ color: '#d9534f' }}>Cancel</Typo>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Typo size={14} style={styles.productPrice}>
              ₱{formatPrice(item.price)}
            </Typo>
            <TouchableOpacity onPress={() => handleEditPrice(item)} style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.statusContainer}>
          <Typo style={{ color: item.activate ? colors.primary : '#d9534f' }}>
            {item.activate ? 'Active' : 'Inactive'}
          </Typo>
          <Switch
            trackColor={{ false: '#767577', true: colors.primaryLight }}
            thumbColor={item.activate ? colors.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => handleToggleActivation(item.id, item.activate)}
            value={item.activate}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.name)}>
        <MaterialCommunityIcons name="trash-can-outline" size={24} color={'#d9534f'} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <ScreenComponent>
        <Header label="Manage Products" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenComponent>
    );
  }

  return (
    <ScreenComponent style={styles.container}>
      <Header label="Manage Products" onBackPress={() => navigation.goBack()} />
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={() => setRefreshing(true)}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Typo>No products found.</Typo>
          </View>
        }
      />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  priceInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius._8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 60,
    marginRight: 8,
    color: colors.primary,
    backgroundColor: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  saveButton: {
    marginLeft: 8,
    padding: 4,
  },
  cancelButton: {
    marginLeft: 4,
    padding: 4,
  },
  container: {
    backgroundColor: colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacingX._15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.grayBG,
    borderRadius: radius._12,
    padding: spacingX._10,
    marginBottom: spacingY._15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: normalizeY(80),
    height: normalizeY(80),
    borderRadius: radius._8,
    marginRight: spacingX._15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontWeight: '600',
    marginBottom: spacingY._5,
  },
  productPrice: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacingY._10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: spacingX._5,
    marginLeft: spacingX._10,
  },
});

export default AdminManageProductsScreen;