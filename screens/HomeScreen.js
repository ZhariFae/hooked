import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from 'auth/useAuth';
import CategoryItem from 'components/CategoryItem';
import ImageSlideShow from 'components/ImageSlideShow';
import ProductCard from 'components/ProductCard';
import ScreenComponent from 'components/ScreenComponent';
import SearchBar from 'components/SearchBar';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import FilterModal from 'model/FilterModal';
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { getFavouriteIds, toggleFavourite } from 'services/userDataService';
import { categories, products as fetchProducts } from 'utils/data';
import { normalizeX, normalizeY } from 'utils/normalize';

function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selected, setSelected] = useState('All');
  const [allProducts, setAllProducts] = useState([]);
  const [data, setData] = useState([]);
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  const loadData = useCallback(async () => {
    // Fetch products
    const productList = await fetchProducts();
    const visibleProducts =
      user?.role === 'Admin' ? productList : productList.filter((p) => p.activate);
    setAllProducts(visibleProducts);
    if (selected === 'All') {
      setData(visibleProducts);
    }

    // Fetch favourites
    if (user) {
      const favIds = await getFavouriteIds(user.uid);
      setFavouriteIds(new Set(favIds));
    }
  }, [user, selected]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getFavouriteIds(user.uid).then((favIds) => setFavouriteIds(new Set(favIds)));
      }
    }, [user])
  );

  const handleToggleFavourite = async (productId) => {
    if (!user) return navigation.navigate('Login');
    const isCurrentlyFavourite = favouriteIds.has(productId);
    await toggleFavourite(user.uid, productId, isCurrentlyFavourite);
    const newFavouriteIds = new Set(favouriteIds);
    isCurrentlyFavourite ? newFavouriteIds.delete(productId) : newFavouriteIds.add(productId);
    setFavouriteIds(newFavouriteIds);
  };

  const handleFilter = (category) => {
    setSelected(category);
    setData([]);
    setTimeout(() => {
      if (category === 'All') {
        setData(allProducts);
      } else {
        const filteredData = allProducts.filter((item) => item.category === category);
        setData(filteredData);
      }
    }, 50);
  };
  return (
    <ScreenComponent style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Entypo name="grid" size={24} color="black" />
        </View>
        <TouchableOpacity
          style={styles.iconBg}
          onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <SearchBar onPress={() => setFilterModalVisible(true)} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacingY._60 }}
        showsVerticalScrollIndicator={false}>
        <ImageSlideShow />

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catContainer}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            const isSelected = selected == item.name;
            return (
              <CategoryItem
                item={item}
                onPress={handleFilter}
                isSelected={isSelected}
                index={index}
                key={index}
              />
            );
          }}
        />
        <View style={styles.headingContainer}>
          <Typo size={18} style={{ fontWeight: '600' }}>
            Special For You
          </Typo>
          <Typo style={{ color: colors.gray }}>See all</Typo>
        </View>
        {/* <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}> */}
        {data.length > 0 && (
          <FlatList
            scrollEnabled={false}
            numColumns={2}
            data={data}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              gap: spacingX._20,
              paddingHorizontal: spacingX._20,
              paddingTop: spacingY._15,
            }}
            columnWrapperStyle={{ gap: spacingX._20 }}
            renderItem={({ item, index }) => {
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(index * 100)
                    .duration(600)
                    .damping(13)
                    .springify()}>
                  <ProductCard
                    item={item}
                    isFavourite={favouriteIds.has(item.id)}
                    onToggleFavourite={() => handleToggleFavourite(item.id)}
                  />
                </Animated.View>
              );
            }}
          />
        )}

        {/* </ScrollView> */}
      </ScrollView>
      <FilterModal visible={filterModalVisible} setVisible={setFilterModalVisible} />
    </ScreenComponent>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingBottom: spacingY._20,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    padding: spacingY._5,
    justifyContent: 'space-between',
  },
  iconBg: {
    backgroundColor: colors.lighterGray,
    padding: spacingY._7,
    borderRadius: radius._20,
  },
  catContainer: {
    paddingHorizontal: spacingX._10,
    marginTop: spacingY._10,
  },
  catImg: {
    height: normalizeY(50),
    width: normalizeY(50),
    borderRadius: radius._30,
    backgroundColor: colors.lighterGray,
    borderWidth: normalizeY(2),
    marginBottom: spacingY._5,
  },
  catName: {
    textAlign: 'center',
    fontWeight: '500',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacingY._20,
    marginHorizontal: spacingX._15,
  },
});

export default HomeScreen;
