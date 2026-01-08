import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Phone, Mail, MessageSquare } from 'lucide-react-native';

export default function SupportScreen() {
  const callSupport = () => Linking.openURL('tel:+18001234567');
  const emailSupport = () => Linking.openURL('mailto:support@foodieapp.example?subject=Driver%20Support');
  const chatSupport = () => Linking.openURL('https://support.foodieapp.example/chat');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Get in touch for assistance</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={callSupport}>
          <View style={styles.iconWrap}><Phone size={20} color="#2D3748" /></View>
          <View style={styles.content}>
            <Text style={styles.label}>Call Support</Text>
            <Text style={styles.desc}>Speak to an agent 24/7</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={emailSupport}>
          <View style={styles.iconWrap}><Mail size={20} color="#2D3748" /></View>
          <View style={styles.content}>
            <Text style={styles.label}>Email Support</Text>
            <Text style={styles.desc}>Send details, get a response</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={chatSupport}>
          <View style={styles.iconWrap}><MessageSquare size={20} color="#2D3748" /></View>
          <View style={styles.content}>
            <Text style={styles.label}>Live Chat</Text>
            <Text style={styles.desc}>Quick help via web chat</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#FFFFFF', padding: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A202C' },
  subtitle: { marginTop: 4, fontSize: 14, color: '#718096' },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  content: { flex: 1 },
  label: { fontSize: 16, color: '#2D3748', fontWeight: '600' },
  desc: { fontSize: 12, color: '#718096', marginTop: 2 },
});