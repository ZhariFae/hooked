import 'react-native-gesture-handler';
// import { ThemeProvider } from '@shopify/restyle';
import { theme } from 'theme';

import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from 'navigation/AppNavigator';
import { StatusBar } from 'react-native';
import AuthNavigator from 'navigation/AuthNavigator';
import { AuthProvider } from 'auth/AuthProvider';
import useAuth from 'auth/useAuth';

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  return <NavigationContainer>{user ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
}

export default function App() {
  return (
    <AuthProvider>
      {/* <ThemeProvider theme={theme}> */}
      <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContent />
      </GestureHandlerRootView>
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}
