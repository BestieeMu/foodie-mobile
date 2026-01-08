import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  push: boolean;
  sound: boolean;
  vibration: boolean;
}

const STORAGE_KEY = 'driver_notification_settings';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({ push: true, sound: true, vibration: true });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setSettings(JSON.parse(saved));
    })();
  }, []);

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Customize your alerts</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Push Notifications</Text>
          <Switch value={settings.push} onValueChange={(v) => updateSetting('push', v)} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sound Alerts</Text>
          <Switch value={settings.sound} onValueChange={(v) => updateSetting('sound', v)} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vibration</Text>
          <Switch value={settings.vibration} onValueChange={(v) => updateSetting('vibration', v)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#FFFFFF', padding: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A202C' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#718096' },
  card: { backgroundColor: '#FFFFFF', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  label: { fontSize: 16, color: '#2D3748' },
});