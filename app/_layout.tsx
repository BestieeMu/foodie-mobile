import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/stores/authStore";
import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, hasCompletedOnboarding, user, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inCustomer = segments[0] === 'customer';
    const inDelivery = segments[0] === 'delivery';

    if (!hasCompletedOnboarding && segments[0] !== 'onboarding') {
      router.replace('/onboarding');
    } else if (!isAuthenticated && !inAuthGroup && segments[0] !== 'onboarding') {
      router.replace('/auth/signin');
    } else if (isAuthenticated && (inAuthGroup || segments[0] === 'onboarding')) {
      if (user?.role === 'delivery') {
        router.replace('/delivery');
      } else {
        router.replace('/customer');
      }
    } else if (isAuthenticated && !inCustomer && !inDelivery) {
      if (user?.role === 'delivery') {
        router.replace('/delivery');
      } else {
        router.replace('/customer');
      }
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments, user, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      <Stack.Screen name="customer" options={{ headerShown: false }} />
      <Stack.Screen name="delivery" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const styleNav = async () => {
      if (Platform.OS === "android") {
        await NavigationBar.setBackgroundColorAsync("#000000");
        await NavigationBar.setButtonStyleAsync("light");
      }
    };
    styleNav();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
