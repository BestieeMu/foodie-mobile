import { Tabs } from "expo-router";
import { Home, Search, ShoppingBag, User } from "lucide-react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text } from "react-native";

export default function CustomerLayout() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF6B35",
          tabBarInactiveTintColor: "#718096",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
            paddingTop: 8,
            paddingBottom: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600" as const,
          },
          // Ensure labels are shown
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarLabel: ({ color }) => <Text style={{ color }}>Home</Text>,
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarLabel: ({ color }) => (
              <Text style={{ color }}>Search</Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="order"
          options={{
            title: "Orders",
            tabBarLabel: ({ color }) => (
              <Text style={{ color }}>Orders</Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <ShoppingBag size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: ({ color }) => (
              <Text style={{ color }}>Profile</Text>
            ),
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="restaurant/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="menu-item/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="order/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="addresses"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
      <FloatingCartButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
