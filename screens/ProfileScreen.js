import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from 'auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import { BlurView } from 'expo-blur';
import React, { useCallback, useState, useEffect } from 'react'; // Added useEffect
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { normalizeY } from 'utils/normalize';

function ProfileScreen(props) {
  const [key, setKey] = useState(0);
  const Auth = useAuth();

  // comment this if you don't want to animate everytime you open this screen
  const navigation = useNavigation(); // Initialize useNavigation
  useFocusEffect(
    useCallback(() => {
      setKey((prevKey) => prevKey + 1);
    }, [])
  );

  const Row = ({ icon, title, iconColor, index, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <Animated.View
          style={styles.row}
          entering={FadeInDown.delay(index * 80)
            .duration(800)
            .damping(12)
            .springify()}
          key={`${key}-${index}`}>
          <View
            style={{ backgroundColor: iconColor, padding: spacingY._10, borderRadius: radius._12 }}>
            {icon}
          </View>
          <Typo size={16} style={{ fontWeight: '500', flex: 1 }}>
            {title}
          </Typo>
          <Octicons name="chevron-right" size={24} color="black" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const placeholderImage = "https://img.freepik.com/free-photo/handsome-smiling-man-looking-with-disbelief_176420-19591.jpg?t=st=1723641040~exp=1723644640~hmac=aef27975e23ff9df20ea1f41d340106576264a0d6c9400a220ad615579e1340b&w=740"

  const userRole = Auth.user?.role;
  const userName =
    userRole === 'Admin' ? 'Admin' : Auth.user?.displayName || 'User Name';

  const userEmail = Auth.user?.email || 'user@example.com';

  return (
    <ScreenComponent style={styles.container}>
      <BlurView intensity={100} tint="extraLight" style={styles.blurContainer} />
      <View style={styles.topRow}>
        <Image
          source={{
            uri: Auth.user?.photoURL || placeholderImage,
          }}
          style={styles.img}
        />
        <View style={{ gap: spacingY._7, marginTop: spacingY._5, alignItems: 'center' }}>
          <Typo size={22} style={styles.name}>
            {userName}
          </Typo>
          <Typo size={16} style={{ color: colors.gray, fontWeight: '500' }}>
            {userEmail}
          </Typo>
        </View>
      </View>
      <View style={{ flex: 1, gap: 15 }}>
        <View style={styles.bottomContainer}>
          {userRole === 'Admin' && (
            <>
              <Row
                title={'Add New Product'}
                iconColor={colors.lightBlue} // Choose a suitable color
                icon={<MaterialCommunityIcons name="plus-box" size={24} color={colors.black} />}
                index={0} // Adjust index for animation order
                onPress={() => navigation.navigate('AdminAddProduct')} // Placeholder navigation
              />
              <Row
                title={'Manage Products'}
                iconColor={colors.lightBlue}
                icon={<MaterialCommunityIcons name="pencil-box-multiple" size={24} color={colors.black} />}
                index={1}
                onPress={() => navigation.navigate('AdminManageProducts')} // Placeholder navigation for delete/activate
              />
              {/* Add a separator if desired between admin and user options */}
              {/* <View style={styles.line} /> */}
            </>
          )}
          <Row
            title={userRole === 'Admin' ? 'View Custom Requests' : 'Custom Product Request'}
            iconColor={'#fdf2f8'}
            icon={
              <MaterialCommunityIcons name="comment-question-outline" size={24} color={colors.black} />
            }
            index={userRole === 'Admin' ? 2 : 0}
            onPress={() =>
              navigation.navigate(userRole === 'Admin' ? 'AdminRequests' : 'UserRequests')
            }
          />
          <Row
            title={'Log out'}
            iconColor={'#d1d1d1'}
            icon={<MaterialCommunityIcons name="logout" size={24} color={colors.black} />}
            // Adjust index based on admin rows presence.
            // Admin has 4 items, user has 2.
            // The index is the position in the list (0-based).
            index={userRole === 'Admin' ? 3 : 1}
            onPress={() => Auth.logout()}
          />
        </View>
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    // backgroundColor: colors.lightPrimary,
  },

  blurContainer: {
    ...StyleSheet.absoluteFill,
    paddingTop: 0,
    padding: spacingY._20,
    paddingBottom: '10%',
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: radius._20,
  },
  topRow: {
    marginBottom: normalizeY(25),
    alignItems: 'center',
    gap: spacingX._10,
    marginTop: '2%',
  },
  img: {
    height: normalizeY(110),
    width: normalizeY(110),
    borderRadius: normalizeY(60),
    borderWidth: normalizeY(3),
    borderColor: colors.primary,
  },
  name: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
    paddingVertical: spacingY._10,
    paddingRight: spacingX._5,
  },
  line: {
    height: 0.8,
    width: '95%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    // marginVertical: spacingY._10,
  },
  bottomContainer: {
    backgroundColor: colors.white,
    borderRadius: spacingY._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    padding: spacingY._15,
    // marginBottom: '30%',
  },
});

export default ProfileScreen;
