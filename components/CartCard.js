import React from 'react';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import colors from 'config/colors';
import { View, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Typo from './Typo';
import { normalizeX, normalizeY } from 'utils/normalize';
import { spacingY } from 'config/spacing';
const { width } = Dimensions.get('screen');

function CartCard({ item, onQuantityChange }) {
  const imgSize = width * 0.2;
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
          <TouchableOpacity onPress={() => onQuantityChange(0)}>
            <MaterialIcons name="delete-outline" size={normalizeY(24)} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Typo style={styles.catText}>{item.category}</Typo>
        <View style={styles.row}>
          <Typo style={{ fontWeight: 'bold' }}>₱{item.price}</Typo>
          <View style={styles.countContanier}>
            <TouchableOpacity onPress={() => onQuantityChange(item.quantity - 1)}>
              <Typo style={{ fontWeight: 'bold' }}>-</Typo>
            </TouchableOpacity>
            <Typo style={{ fontWeight: 'bold' }}>{item.quantity}</Typo>
            <TouchableOpacity onPress={() => onQuantityChange(item.quantity + 1)}>
              <Typo style={{ fontWeight: 'bold' }}>+</Typo>
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
  countContanier: {
    backgroundColor: colors.grayBG,
    width: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: normalizeY(5),
    borderRadius: normalizeY(20),
  },
});

export default CartCard;
