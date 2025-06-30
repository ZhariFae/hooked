import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { submitCustomRequest } from '../services/customRequestService';
import useAuth from '../auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Header from 'components/Header';
import Typo from 'components/Typo';
import AppButton from 'components/AppButton';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import { normalizeY } from 'utils/normalize';

const CustomRequestScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Please log in to submit a request.');
      return;
    }

    if (!description) {
      Alert.alert('Please provide a description for your request.');
      return;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid number for the quantity.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        description,
        quantity: parsedQuantity,
      };

      const result = await submitCustomRequest(user.uid, user.displayName, requestData);

      if (result.success) {
        Alert.alert('Request Submitted', 'Your request has been submitted successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Submission Failed', 'There was an error submitting your request.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenComponent style={styles.container}>
      <Header label="Make a Custom Request" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Typo size={18} style={styles.sectionTitle}>
            Request Details
          </Typo>

          <View style={styles.inputGroup}>
            <Typo style={styles.inputLabel}>Product Description</Typo>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Describe the product you want, including colors, materials, size, etc."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Typo style={styles.inputLabel}>Quantity</Typo>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>

          <AppButton
            label={loading ? <ActivityIndicator color={colors.white} /> : 'Submit Request'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenComponent>
  );
};

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
  multilineInput: {
    height: normalizeY(120),
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacingY._30,
    backgroundColor: colors.primary,
    borderRadius: radius._12,
  },
});

export default CustomRequestScreen;