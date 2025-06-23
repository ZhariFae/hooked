import { useFocusEffect } from '@react-navigation/native';
import FavouriteCard from 'components/FavouriteCard';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import { spacingX, spacingY } from 'config/spacing';
import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { products } from 'utils/data';

function FavouritesScreen(props) {
  const [key, setKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setKey((prevKey) => prevKey + 1);
    }, [])
  );
  return (
    <ScreenComponent>
      <Typo style={styles.headerTitle} size={22}>
        Favourites
      </Typo>
      <FlatList
        data={products}
        style={{ flex: 1 }}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => {
          return (
            <Animated.View
              key={`${key}-${index}`}
              entering={FadeInDown.delay(index * 140)
                .duration(2000)
                .damping(12)
                .springify()}>
              <FavouriteCard item={item} />
            </Animated.View>
          );
        }}
      />
    </ScreenComponent>
  );
}
const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: 'bold',
    paddingVertical: spacingY._5,
    alignSelf: 'center',
  },
  listContainer: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._10,
    paddingBottom: '30%',
  },
});

export default FavouritesScreen;
