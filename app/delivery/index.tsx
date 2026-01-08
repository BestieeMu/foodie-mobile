import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, PackageCheck, AlertTriangle } from 'lucide-react-native';
import { useDeliveryStore } from '@/stores/deliveryStore';
import {Button} from '@/components/Button';

export default function DeliveryQueueScreen() {
  const router = useRouter();
  const { availableOrders, acceptOrder, loadAvailableOrders, isOnline } = useDeliveryStore();

  useEffect(() => {
    loadAvailableOrders();
  }, [loadAvailableOrders]);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <PackageCheck size={18} color="#2D3748" />
          <Text style={styles.cardTitle}>Order #{item.id}</Text>
        </View>
        <Text style={styles.earning}>${Number(item?.earnings ?? 0).toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <MapPin size={16} color="#4A5568" />
        <Text style={styles.address}>{item?.pickupLocation?.address ?? ''}</Text>
      </View>
      <View style={styles.row}>
        <MapPin size={16} color="#4A5568" />
        <Text style={styles.address}>{item?.deliveryLocation?.address ?? ''}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>Distance: {Number(item?.distance ?? 0).toFixed(1)} km</Text>
        <Text style={styles.metaRight}>Items: {Array.isArray(item?.items) ? item.items.length : 0}</Text>
      </View>
      <Button
        title={isOnline ? 'Accept Delivery' : 'Go Online to Accept'}
        onPress={() => {
          if (!isOnline) return;
          acceptOrder(item);
          router.push('/delivery/active');
        }}
        variant={isOnline ? 'primary' : 'secondary'}
        disabled={!isOnline}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}> 
        <Text style={styles.title}>Available Orders</Text>
        <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#F0FFF4' : '#EDF2F7' }]}> 
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#48BB78' : '#A0AEC0' }]} />
          <Text style={[styles.statusText, { color: isOnline ? '#2F855A' : '#4A5568' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {!isOnline && (
        <View style={styles.banner}>
          <AlertTriangle size={16} color="#B7791F" />
          <Text style={styles.bannerText}>You are offline. Toggle Online in Profile to accept orders.</Text>
        </View>
      )}

      <FlatList
        data={availableOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { backgroundColor: '#FFFFFF', padding: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A202C' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  list: { padding: 12 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF7ED',
    borderColor: '#FBD38D',
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
  },
  bannerText: { color: '#B7791F', fontSize: 12, flex: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  earning: { fontSize: 16, fontWeight: '700', color: '#2F855A' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  address: { fontSize: 14, color: '#4A5568' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  metaLeft: { fontSize: 12, color: '#718096' },
  metaRight: { fontSize: 12, color: '#718096' },
});
