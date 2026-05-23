import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@store/auth.store';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Create query client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { restoreSession, isRestoring } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await restoreSession();
      await SplashScreen.hideAsync();
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="village/[id]"
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="village/family/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="village/family/add"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="admin/super/index"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="admin/super/add-village"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="admin/super/add-admin"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="admin/village/index"
              options={{ animation: 'slide_from_right' }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
