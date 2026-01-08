import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{
      headerShown: true,
      headerTitleAlign: 'center',
    }}>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="vehicle" options={{ title: 'Vehicle Info' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="support" options={{ title: 'Support' }} />
    </Stack>
  );
}