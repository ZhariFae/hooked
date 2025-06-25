import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import colors from 'config/colors';
import { View, Image, Dimensions, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Typo from './Typo';
import { normalizeX, normalizeY } from 'utils/normalize';
import { spacingY } from 'config/spacing';
const { width } = Dimensions.get('screen');

function CartCard({ item, onQuantityChange }) {
  const imgSize = width * 0.2;
  const confirmRemove = () => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [{text: 'Cancel', style: 'cancel'}, {text:'Remove', onPress: () => onQuantityChange(0) }],
      {cancelable: false}
    );
  }
  const [quantity, setQuantity] = useState(item.quantity);

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        <Image
          source={{ uri: item.pictureUrl }}
          resizeMode="contain"
          style={{
            width: imgSize,
            height: imgSize,
          }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.row}>
          <Typo size={17} style={{ fontWeight: 'bold' }}>
            {item.name}
          </Typo>
          <TouchableOpacity onPress={confirmRemove}>
            <MaterialIcons name="delete-outline" size={normalizeY(24)} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Typo style={styles.catText}>{item.category}</Typo>
        <View style={styles.row}>
          <Typo style={{ fontWeight: 'bold' }}>₱{item.price}</Typo>
          <View style={styles.quantityControl}>
            <TouchableOpacity onPress={() => onQuantityChange(quantity - 1)}>
              <Typo style={styles.quantityButton}>-</Typo>
            </TouchableOpacity>
            <TextInput style={styles.quantityInput} keyboardType="numeric"              
              value={quantity.toString()}
              onChangeText={(text) => {
                setQuantity(text); 
                if (text === "") return; 
                const newQuantity = parseInt(text);
                if (!isNaN(newQuantity)) 
                  onQuantityChange(newQuantity);
              }}
            />
            <TouchableOpacity onPress={() => onQuantityChange(quantity + 1)}>
              <Typo style={styles.quantityButton}>+</Typo>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: normalizeY(17),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: normalizeY(15),
    borderRadius: normalizeY(12),
    gap: normalizeX(10),
  },
  imgContainer: {
    padding: spacingY._10,
    backgroundColor: colors.lighterGray,
    borderRadius: normalizeY(15),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catText: {
    color: colors.lightGray,
    fontWeight: 'bold',
    marginBottom: normalizeY(3),
  },
  quantityControl: {
        backgroundColor: colors.grayBG,
        borderRadius: normalizeY(20),
        paddingVertical: normalizeY(5),
        paddingHorizontal: normalizeX(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: normalizeX(100),
    },
    quantityButton: {
        fontWeight: 'bold',
        fontSize: normalizeY(16),
        paddingHorizontal: normalizeX(8),
    },
    quantityInput: {
        minWidth: normalizeX(30),
        textAlign: 'center',
        paddingHorizontal: normalizeX(5),
        fontSize: normalizeY(16),
        fontWeight: 'bold',
    },
});

export default CartCard;
