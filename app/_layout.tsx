import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { useDeliveryStore } from "@/stores/deliveryStore";
import { socketService } from "@/services/socket";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments() as string[];
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
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inCustomer = segments[0] === 'customer';
    const inDelivery = segments[0] === 'delivery';

    // If user is authenticated
    if (isAuthenticated) {
      // If user tries to access auth screens or the welcome screen (root), redirect to dashboard
      if (inAuthGroup || segments.length === 0) {
        if (user?.role === 'delivery') {
          router.replace('/delivery');
        } else {
          router.replace('/customer');
        }
      }
    } else {
      // If user is NOT authenticated
      // If user tries to access protected routes, redirect to welcome or signin
      if (inCustomer || inDelivery) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, segments, user, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="customer" options={{ headerShown: false }} />
      <Stack.Screen name="delivery" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const styleNav = async () => {
      if (Platform.OS === "android") {
        try {
          await NavigationBar.setBackgroundColorAsync("#ffffff");
          await NavigationBar.setButtonStyleAsync("dark");
        } catch (e) {
          console.log('NavigationBar error:', e);
        }
      }
    };
    styleNav();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar style="dark" />
        <ErrorBoundary>
          <RootLayoutNav />
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
