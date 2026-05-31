import React, { useEffect } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { socketService } from "@/services/socket";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();
  const { initSocketListeners: initOrderListeners, cleanupSocketListeners: cleanupOrderListeners } = useOrderStore();
  const { initSocketListeners: initDeliveryListeners, cleanupSocketListeners: cleanupDeliveryListeners } = useDeliveryStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      initOrderListeners();
      initDeliveryListeners();
    } else {
      cleanupOrderListeners();
      cleanupDeliveryListeners();
      socketService.disconnect();
    }
  }, [isAuthenticated, initOrderListeners, initDeliveryListeners, cleanupOrderListeners, cleanupDeliveryListeners]);

  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === 'auth';
    const inCustomer = segs[0] === 'customer';
    const inDelivery = segs[0] === 'delivery';

    if (isAuthenticated) {
      if (inAuthGroup || segs.length === 0 || segs[0] === '(index)' || segs[0] === undefined) {
        if (user?.role === 'delivery') {
          router.replace('/delivery');
        } else {
          router.replace('/customer');
        }
      }
    } else {
      if (inCustomer || inDelivery) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, segments, user, router, navigationState?.key]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="customer" options={{ headerShown: false }} />
        <Stack.Screen name="delivery" options={{ headerShown: false }} />
      </Stack>
      
      {isLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <Text style={{ fontSize: 40, fontWeight: '900', color: '#FFFFFF', marginBottom: 20 }}>Foodie</Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
