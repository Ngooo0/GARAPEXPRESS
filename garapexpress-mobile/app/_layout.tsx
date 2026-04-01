// Polyfill for web navigation - disabled for mobile builds
// import '../src/polyfills/navigationWeb';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAppStore } from '../src/store/appStore';
import { getToken } from '../src/services/api';
import wsService from '../src/services/websocket';
import { startKeepAlive, stopKeepAlive } from '../src/services/keepAlive';

export default function RootLayout() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const fetchOrders = useAppStore((state) => state.fetchOrders);
  const fetchNotifications = useAppStore((state) => state.fetchNotifications);
  const fetchDeliveries = useAppStore((state) => state.fetchDeliveries);

  // Start keep-alive on app launch (for Render cold start prevention)
  useEffect(() => {
    startKeepAlive();
    return () => {
      stopKeepAlive();
    };
  }, []);

  useEffect(() {
    if (!isAuthenticated) {
      wsService.disconnect();
      return;
    }

    const syncRemoteData = async () => {
      try {
        await Promise.allSettled([
          fetchOrders(),
          fetchNotifications(),
          fetchDeliveries(),
        ]);
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    };

    const connect = async () => {
      const token = await getToken();
      wsService.connect(token ?? undefined);
    };

    // Delay initial sync to prevent blocking UI
    const initialSyncTimer = setTimeout(() => {
      syncRemoteData();
      connect();
    }, 500);

    wsService.on('notification', syncRemoteData);
    wsService.on('order_update', syncRemoteData);
    wsService.on('delivery_update', syncRemoteData);
    wsService.on('livraison_assigned', syncRemoteData);

    return () => {
      clearTimeout(initialSyncTimer);
      wsService.off('notification', syncRemoteData);
      wsService.off('order_update', syncRemoteData);
      wsService.off('delivery_update', syncRemoteData);
      wsService.off('livraison_assigned', syncRemoteData);
      wsService.disconnect();
    };
  }, [isAuthenticated, fetchOrders, fetchNotifications, fetchDeliveries]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F8FAFC' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="role-selection" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="medicine/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pharmacy/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order-tracking" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="prescription" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />

          <Stack.Screen name="support" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
