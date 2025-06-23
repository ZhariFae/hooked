import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Typo from './Typo';
import { normalizeX, normalizeY } from 'utils/normalize';
import { radius, spacingY } from 'config/spacing';
import colors from 'config/colors';

const CategoryItem = ({ item, isSelected, onPress, index }) => {
  return (
    <Animated.View
      style={styles.catCircle}
      entering={FadeInRight.delay(index * 100)
        .duration(1000)
        .damping(12)
        .springify()}>
      <TouchableOpacity
        style={{ width: '100%', alignItems: 'center' }}
        onPress={() => onPress(item.name)}>
        <View
          style={[
            styles.imgContainer,
            {
              borderColor: isSelected ? colors.primary : colors.white,
            },
          ]}>
          <Image source={item.image} style={[styles.catImg]} />
        </View>

        <Typo
          size={12}
          style={[styles.catName, { color: isSelected ? colors.primary : colors.black }]}>
          {item.name}
        </Typo>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  catCircle: {
    width: normalizeX(70),
    alignItems: 'center',
  },
  imgContainer: {
    padding: 9,
    backgroundColor: colors.lighterGray,
    borderWidth: normalizeY(2),
    borderRadius: radius._30,
    height: normalizeY(52),
    width: normalizeY(52),
    marginBottom: spacingY._5,
  },
  catImg: {
    height: '100%',
    width: '100%',
  },
  catName: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CategoryItem;
