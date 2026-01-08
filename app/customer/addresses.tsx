import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '@/components/HeaderBar';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export default function AddressesScreen() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const list = await apiService.addresses.getAll();
      setAddresses(list || []);
    } catch (e: any) {
      Alert.alert('Failed to load addresses', e?.message || 'Try again.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!user) return;
    if (!label || !street || !city) {
      Alert.alert('Missing info', 'Please fill label, street, and city.');
      return;
    }
    try {
      setLoading(true);
      const entry = await apiService.addresses.add({ userId: user.id, label, street, city });
      setAddresses((prev) => [entry, ...prev]);
      setLabel(''); setStreet(''); setCity('');
      Alert.alert('Address added', 'Your address was saved.');
    } catch (e: any) {
      Alert.alert('Failed to add address', e?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderBar title="Addresses" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.form}>
          <Text style={styles.label}>Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Home, Office..."
            placeholderTextColor="#A0AEC0"
          />
          <Text style={styles.label}>Street</Text>
          <TextInput
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            placeholder="Street address"
            placeholderTextColor="#A0AEC0"
          />
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity style={[styles.addButton, loading && { opacity: 0.7 }]} onPress={handleAdd} disabled={loading}>
            <Text style={styles.addButtonText}>{loading ? 'Saving...' : 'Add Address'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.cardText}>{[item.street, item.city].filter(Boolean).join(', ')}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No addresses yet</Text>
              <Text style={styles.emptySubtext}>Add one above to use at checkout</Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A202C',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginHorizontal: 16,
    marginTop: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#4A5568',
  },
  empty: {
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#718096',
  },
});
