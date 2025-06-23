import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import AppButton from 'components/AppButton';
import Header from 'components/Header';
import colors from 'config/colors';
import { spacingX, spacingY, radius } from 'config/spacing';
import { normalizeY } from 'utils/normalize';
import { addProduct } from 'services/productService';

function AdminAddProductScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!name || !category || !price || !imageUrl) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid positive price.');
      return;
    }

    setLoading(true);
    try {
      await addProduct({
        name,
        category,
        price: parsedPrice,
        pictureUrl: imageUrl,
        // Add other default fields as needed for consistency with existing product data
        description: 'A newly added product.',
        seller: 'Admin',
        rating: 4.5,
      });
      Alert.alert('Success', 'Product added successfully!');
      // Clear form fields
      setName('');
      setCategory('');
      setPrice('');
      setImageUrl('');
      // Optionally navigate back to the Profile or a product management screen
      navigation.goBack();
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenComponent style={styles.container}>
      <Header label="Add New Product" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Typo size={18} style={styles.sectionTitle}>
            Product Details
          </Typo>

          <View style={styles.inputGroup}>
            <Typo style={styles.inputLabel}>Product Name</Typo>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cozy Wool Yarn"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typo style={styles.inputLabel}>Category</Typo>
            <TextInput
              style={styles.input}
              placeholder="e.g., Yarn, Hooks, Patterns"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typo style={styles.inputLabel}>Price (₱)</Typo>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Typo style={styles.inputLabel}>Image URL</Typo>
            <TextInput
              style={styles.input}
              placeholder="e.g., https://example.com/image.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <AppButton
            label={loading ? <ActivityIndicator color={colors.white} /> : 'Add Product'}
            onPress={handleAddProduct}
            disabled={loading}
            style={styles.addButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._20,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacingY._15,
    marginTop: spacingY._10,
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: spacingY._15,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: spacingY._5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.grayBG,
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    fontSize: normalizeY(16),
    color: colors.black,
  },
  addButton: {
    marginTop: spacingY._30,
    backgroundColor: colors.primary,
    borderRadius: radius._12,
  },
});

export default AdminAddProductScreen;