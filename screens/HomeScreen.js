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
  const [maxProductPrice, setMaxProductPrice] = useState(1000); // Default max price
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    // Fetch products
    const productList = await fetchProducts();
    const visibleProducts =
      user?.role === 'Admin' ? productList : productList.filter((p) => p.activate);
    setAllProducts(visibleProducts);

    // Calculate max price from visible products
    if (visibleProducts.length > 0) {
      const maxPrice = Math.max(...visibleProducts.map((p) => p.price));
      setMaxProductPrice(maxPrice);
    }

    // Fetch favourites
    if (user) {
      const favIds = await getFavouriteIds(user.uid);
      setFavouriteIds(new Set(favIds));
    }
  }, [user]);

  useEffect(() => {
    let filteredProducts = allProducts;

    // Apply filters from modal or the top category selector
    // 1. Category filter
    if (filters.categories && filters.categories.length > 0) {
      // Use categories from the filter modal if they exist
      filteredProducts = filteredProducts.filter((item) =>
        filters.categories.includes(item.category)
      );
    } else if (selected !== 'All') {
      // Otherwise, use the top category selector
      filteredProducts = filteredProducts.filter((item) => item.category === selected);
    }

    // 2. Price range filter
    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter(
        (item) => item.price >= filters.priceRange.low && item.price <= filters.priceRange.high
      );
    }

    // 3. Search query filter
    if (searchQuery) {
      filteredProducts = filteredProducts.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setData(filteredProducts);
  }, [searchQuery, selected, allProducts, filters]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
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
    // Clear modal filters when a quick filter is selected for a clean state
    setFilters({ categories: [], priceRange: null });
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // If modal has category filters, reset the top selector to 'All'
    if (newFilters.categories && newFilters.categories.length > 0) setSelected('All');
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

      <SearchBar
        onPress={() => setFilterModalVisible(true)}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
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
            Products
          </Typo>
          {/* <Typo style={{ color: colors.gray }}>See all</Typo> */}
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
              const isAdmin = user?.role === 'Admin';
              const isInactiveAndAdmin = isAdmin && item.activate === false;
              return (
                <Animated.View
                  key={item.id}
                  style={isInactiveAndAdmin ? { opacity: 0.5 } : {}}
                  entering={FadeInDown.delay(index * 120)
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
      <FilterModal
        visible={filterModalVisible}
        setVisible={setFilterModalVisible}
        maxPrice={maxProductPrice}
        onApplyFilters={handleApplyFilters}
      />
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
