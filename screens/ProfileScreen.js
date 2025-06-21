import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from 'auth/useAuth';
import ScreenComponent from 'components/ScreenComponent';
import Typo from 'components/Typo';
import colors from 'config/colors';
import { radius, spacingX, spacingY } from 'config/spacing';
import { BlurView } from 'expo-blur';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { normalizeY } from 'utils/normalize';

function ProfileScreen(props) {
  const [key, setKey] = useState(0);
  const Auth = useAuth();

  // comment this if you don't want to animate everytime you open this screen
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
  
  const userName = Auth.user?.displayName || 'User Name';
  const userEmail = Auth.user?.email || 'user@example.com';

  return (
    <ScreenComponent style={styles.container}>
      <BlurView intensity={100} tint="extraLight" style={styles.blurContainer} />
      <MaterialCommunityIcons
        name="camera-plus"
        size={24}
        color={colors.black}
        style={{ alignSelf: 'flex-end' }}
      />
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
          <Row
            title={'Edit profile'}
            iconColor={'#fbdbe6'}
            icon={<Ionicons name="person" size={24} color={'#eb4b8b'} />}
            index={0}
          />
          {/* <View style={styles.line} /> */}
          <Row
            title={'My stats'}
            iconColor={'#dedffd'}
            icon={<Ionicons name="stats-chart" size={24} color={'#5d5be5'} />}
            index={1}
          />
          <Row
            title={'Settings'}
            iconColor={'#ffe3ce'}
            icon={<Ionicons name="settings" size={24} color={'#f97113'} />}
            index={2}
          />
          <Row
            title={'Invite a friend'}
            iconColor={'#F5E8E4'} // '#E9F8F9' '#176B87'
            icon={<Ionicons name="person-add" size={24} color={'#860A35'} />}
            index={3}
          />
        </View>
        <View style={[styles.bottomContainer, { marginBottom: '30%' }]}>
          <Row
            title={'Help'}
            iconColor={'#d1d1d1'}
            icon={<Ionicons name="chatbubble-ellipses" size={24} color={colors.black} />}
            index={4}
          />
          <Row
            title={'Log out'}
            iconColor={'#d1d1d1'}
            icon={<MaterialCommunityIcons name="logout" size={24} color={colors.black} />}
            index={5}
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
