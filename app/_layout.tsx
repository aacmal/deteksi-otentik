import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'onboarding' | '(tabs)'>('(tabs)');

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      if (!hasSeenOnboarding) {
        setInitialRoute('onboarding');
      } else {
        setInitialRoute('(tabs)');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setInitialRoute('(tabs)');
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME}>
      <StatusBar style="light" />
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
