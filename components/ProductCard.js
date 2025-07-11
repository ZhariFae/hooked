import { AntDesign } from '@expo/vector-icons';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React from 'react';
import { Dimensions, Image, View, StyleSheet, TouchableOpacity } from 'react-native';
import Typo from './Typo';
import { normalizeY } from 'utils/normalize';
import { useNavigation } from '@react-navigation/native';
import { formatPrice } from 'utils/format';
const { width, height } = Dimensions.get('screen');

function ProductCard({ item, isFavourite, onToggleFavourite }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('ItemDetails', item)}>
      <TouchableOpacity style={styles.heartBg} onPress={onToggleFavourite}>
        <AntDesign name={isFavourite ? 'heart' : 'hearto'} size={16} color={colors.white} />
      </TouchableOpacity>
      <Image source={{ uri: item.pictureUrl }} style={styles.img} />
      <Typo size={13} style={styles.name}>
        {item.name}
      </Typo>
      <View style={styles.dotsContainer}>
        <Typo size={13} style={{ fontWeight: '600' }}>
          ₱ {formatPrice(item.price)}
        </Typo>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height * 0.21,
    width: width / 2 - spacingX._30,
    backgroundColor: colors.lighterGray,
    borderRadius: radius._15,
    justifyContent: 'space-evenly',
    paddingBottom: spacingY._15,
    overflow: 'hidden',
  },
  heartBg: {
    height: normalizeY(32),
    width: normalizeY(32),
    backgroundColor: colors.primary,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    borderBottomLeftRadius: radius._10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    height: '60%',
    width: '80%',
    resizeMode: 'contain',
    marginVertical: spacingY._15,
    alignSelf: 'center',
  },
  name: {
    fontWeight: '600',
    marginStart: spacingX._10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingX._10,
    paddingTop: spacingY._5,
    gap: spacingX._3,
  },
  dot: {
    height: normalizeY(14),
    width: normalizeY(14),
    borderRadius: radius._12,
    backgroundColor: colors.black,
  },
});
export default ProductCard;
