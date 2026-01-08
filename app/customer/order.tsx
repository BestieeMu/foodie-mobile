import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';
import { useOrderStore } from '@/stores/orderStore';

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useOrderStore((state) => state.orders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#48BB78';
      case 'cancelled':
        return '#F56565';
      case 'on_the_way':
        return '#FF6B35';
      default:
        return '#4299E1';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => router.push(`/customer/order/${item.id}` as any)}
          >
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Clock size={14} color="#718096" />
                <Text style={styles.infoText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {item.deliveryAddress && (
                <View style={styles.infoRow}>
                  <MapPin size={14} color="#718096" />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.deliveryAddress.street}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.itemCount}>{item.items.length} items</Text>
              <Text style={styles.totalPrice}>${item.total.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Start ordering from your favorite restaurants</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1A202C',
  },
  list: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 13,
    color: '#718096',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  orderInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#718096',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  itemCount: {
    fontSize: 14,
    color: '#718096',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A202C',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
  },
});
