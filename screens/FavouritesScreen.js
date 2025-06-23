import { useFocusEffect } from '@react-navigation/native';
import useAuth from 'auth/useAuth';
import FavouriteCard from 'components/FavouriteCard';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import { spacingX, spacingY } from 'config/spacing';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getFavouriteProducts, toggleFavourite } from 'services/userDataService';

function FavouritesScreen(props) {
  const [key, setKey] = useState(0);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  const loadFavouriteProducts = useCallback(async () => {
    if (user) {
      const favProducts = await getFavouriteProducts(user.uid);
      setProducts(favProducts);
    }
  }, [user]);

  const handleRemoveFavourite = async (productId) => {
    await toggleFavourite(user.uid, productId, true);
    loadFavouriteProducts(); // Refresh the list
  };

  useFocusEffect(
    useCallback(() => {
      loadFavouriteProducts();
    }, [loadFavouriteProducts])
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
              <FavouriteCard item={item} onRemove={() => handleRemoveFavourite(item.id)} />
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
