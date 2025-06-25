import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import useAuth from 'auth/useAuth';
import AppButton from 'components/AppButton';
import DetailsSelector from 'components/DetailsSelector';
import ItemImageSlider from 'components/ItemImageSlider';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput, // Added TextInput for editable quantity
  Alert,
} from 'react-native';
import { isFavourite, toggleFavourite, addToCart } from 'services/userDataService';
import { normalizeX, normalizeY } from 'utils/normalize';
const { height } = Dimensions.get('screen');

function ItemDetailsScreen({ route, navigation }) {
  const iconSize = 18;
  const item = route.params;
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const checkIfFavourite = async () => {
      const favStatus = await isFavourite(user?.uid, item.id);
      setIsFav(favStatus);
    };
    checkIfFavourite();
  }, [user, item.id]);

  const [selected, setSelected] = useState('Description');
  return (
    <View style={styles.container}>
      <ItemImageSlider images={item.pictureUrl ? Array(5).fill(item.pictureUrl) : []} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBg} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios-new" size={iconSize} color="black" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={styles.iconBg}>
          <AntDesign name="sharealt" size={iconSize} color="black" />
        </View>
        <TouchableOpacity
          style={styles.iconBg}
          onPress={async () => {
            if (!user) {
              return navigation.navigate('Login');
            }
            try {
              await toggleFavourite(user.uid, item.id, isFav);
              setIsFav(!isFav);
            } catch (error) {
              console.error('Failed to toggle favourite:', error);
              Alert.alert('Error', 'Could not update favourite status.');
            }
          }}>
          <AntDesign name={isFav ? 'heart' : 'hearto'} size={iconSize} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: '30%' }}>
          <Typo size={24} style={{ fontWeight: '600' }}>
            {item.name}
          </Typo>
          <Typo size={20} style={styles.price}>
            ₱ {item.price}
          </Typo>
          <Typo size={16} style={styles.seller}>
            Seller: Aliyah Picazo
          </Typo>
          <View style={styles.ratingRow}>
            <View style={styles.ratingView}>
              <AntDesign name="star" size={12} color={colors.white} />
              <Typo size={12} style={{ color: colors.white }}>
                4.8
              </Typo>
            </View>
            <Typo style={{ color: colors.gray }}> (1 Review)</Typo>
          </View>
          <DetailsSelector selected={selected} setSelected={setSelected} />
          {selected == 'Description' ? (
            <Typo style={{ color: colors.gray }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Inceptos imperdiet turpis erat odio augue
              molestie etiam est. Vitae lacus venenatis hendrerit velit tincidunt. Volutpat congue
              fames habitant litora consectetur ex torquent semper semper interdum mauris cras. Sem
              class ipsum sem maximus habitasse iaculis vestibulum. Lacinia per nisl facilisis dolor
              non ante conubia fringilla libero nam phasellus feugiat lacus turpis.
            </Typo>
          ) : (
            <Typo style={{ color: colors.gray }}>
              Molestie suspendisse dignissim venenatis condimentum maecenas erat at aliquet turpis.
              Dictumst arcu tristique ipsum dolor ac porta nulla enim leo sed primis lectus. Pretium
              habitasse ligula rhoncus hendrerit nec. Arcu cubilia iaculis mauris at tristique
              fermentum ligula ipsum nunc tempor augue sapien habitasse. At vitae curae est per
              vitae velit gravida vivamus sodales tempus leo varius purus.
            </Typo>
          )}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <View style={styles.countView}>
            <Typo
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              size={20}
              style={styles.count}>
              -
            </Typo>            
            <TextInput
              style={styles.quantityInput} 
              keyboardType="numeric" 
              value={quantity.toString()} 
              onChangeText={(text) => {
                const newQuantity = parseInt(text);
                if (!isNaN(newQuantity) && newQuantity >= 1) {
                  setQuantity(newQuantity);
                } else if (text === "") {
                  setQuantity(1); 
                }
              }}
            ></TextInput>
            <Typo onPress={() => setQuantity(quantity + 1)} size={20} style={styles.count}>
              +
            </Typo>
          </View>
          <AppButton
            style={{ width: '60%', marginTop: 0 }}
            onPress={async () => {
              if (user) {
                await addToCart(user.uid, item.id, quantity);
                Alert.alert('Success', `${quantity} x ${item.name} added to cart!`);
                navigation.navigate('Cart');
              }
            }}
            label={'Add to Cart'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1,
    marginTop: Platform.OS == 'ios' ? height * 0.06 : spacingY._10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: spacingX._20,
    gap: spacingX._10,
  },
  iconBg: {
    backgroundColor: colors.white,
    padding: spacingY._10,
    borderRadius: radius._20,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -spacingY._20,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    padding: spacingY._15,
    paddingBottom: 0,
  },
  price: {
    fontWeight: '600',
    marginTop: spacingY._5,
  },
  seller: {
    fontWeight: '600',
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingView: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._3,
    borderRadius: radius._12,
    padding: normalizeY(3),
    paddingHorizontal: normalizeX(5),
  },
  colorTxt: {
    fontWeight: '600',
    marginTop: spacingY._15,
    marginBottom: spacingY._10,
  },
  border: {
    borderWidth: 2,
    borderRadius: spacingY._20,
    padding: normalizeY(3),
  },
  dot: {
    height: normalizeY(27),
    width: normalizeY(27),
    borderRadius: radius._15,
  },
  buttonContainer: {
    backgroundColor: colors.black,
    position: 'absolute',
    bottom: spacingY._20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingY._10,
    width: '100%',
    alignSelf: 'center',
    borderRadius: normalizeY(40),
    justifyContent: 'space-between',
  },
  countView: {
    width: '32%',
    borderWidth: 1,
    borderColor: colors.white,
    flexDirection: 'row',
    height: normalizeY(40),
    borderRadius: radius._20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginStart: spacingX._5,
  },
  count: {
    color: colors.white,
    fontWeight: '600',
  },
  quantityInput: {
    minWidth: normalizeX(30), // Ensure enough width for the input
    textAlign: 'center',
    fontSize: normalizeY(20), // Match the size of the surrounding Typo components
    fontWeight: '600', // Match the font weight
    color: colors.white, // Match the text color
  },
});
export default ItemDetailsScreen;
