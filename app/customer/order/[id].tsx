import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Clock, MapPin, Package } from 'lucide-react-native';
import { Platform } from 'react-native';

let MapView: any;
let Marker: any;
if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
} else {
  MapView = ({ style }: any) => (
    <View style={[style, { backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' }]}> 
      <Text style={{ color: '#718096' }}>Map preview unavailable on web</Text>
    </View>
  );
  Marker = () => null;
}
import { useOrderStore } from '@/stores/orderStore';
import { HeaderBar } from '@/components/HeaderBar';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, setActiveOrder } = useOrderStore();

  const order = orders.find(o => o.id === id);

  useEffect(() => {
    if (order) {
      setActiveOrder(order);
    }
  }, [order, setActiveOrder]);

  if (!order) {
    return null;
  }

  const statusSteps = [
    { status: 'confirmed', label: 'Order Confirmed', icon: Package },
    { status: 'preparing', label: 'Preparing', icon: Package },
    { status: 'ready_for_pickup', label: 'Ready', icon: Package },
    { status: 'picked_up', label: 'Picked Up', icon: MapPin },
    { status: 'on_the_way', label: 'On the Way', icon: MapPin },
    { status: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

  return (
    <>
      <HeaderBar title="Order Tracking" />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: order.deliveryAddress?.latitude || 37.7749,
            longitude: order.deliveryAddress?.longitude || -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {order.restaurant?.latitude != null && order.restaurant?.longitude != null && (
            <Marker
              coordinate={{
                latitude: order.restaurant.latitude,
                longitude: order.restaurant.longitude,
              }}
              pinColor="#FF6B35"
              title={order.restaurant?.name || ''}
            />
          )}
          {order.deliveryAddress && (
            <Marker
              coordinate={{
                latitude: order.deliveryAddress.latitude,
                longitude: order.deliveryAddress.longitude,
              }}
              pinColor="#4C6EF5"
              title="Delivery Location"
            />
          )}
        </MapView>

        <SafeAreaView style={styles.overlay} edges={['bottom']}>
          <ScrollView style={styles.card}>
            <Text style={styles.orderNumber}>{order.orderNumber || order.id}</Text>
            <Text style={styles.restaurant}>{order.restaurant?.name || ''}</Text>

            <View style={styles.eta}>
              <Clock size={20} color="#FF6B35" />
              <Text style={styles.etaText}>
                Estimated delivery: {order.estimatedDeliveryTime 
                  ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '30-40 min'}
              </Text>
            </View>

            <View style={styles.timeline}>
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const IconComponent = step.icon;

                return (
                  <View key={step.status} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineIcon,
                        isCompleted && styles.timelineIconActive,
                        isCurrent && styles.timelineIconCurrent,
                      ]}>
                        <IconComponent 
                          size={16} 
                          color={isCompleted ? '#FFFFFF' : '#CBD5E0'} 
                        />
                      </View>
                      {index < statusSteps.length - 1 && (
                        <View style={[
                          styles.timelineLine,
                          isCompleted && styles.timelineLineActive,
                        ]} />
                      )}
                    </View>
                    <Text style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelActive,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {order.deliveryAddress && (
              <View style={styles.addressSection}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.addressText}>{order.deliveryAddress.street}</Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </Text>
              </View>
            )}

            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {order.items.map((item: any) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
                  <Text style={styles.orderItemName}>{item?.menuItem?.name ?? item?.name ?? ''}</Text>
                  <Text style={styles.orderItemPrice}>${Number((item.price ?? (item.menuItem?.price ?? 0)) * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#718096',
    marginBottom: 4,
  },
  restaurant: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1A202C',
    marginBottom: 16,
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FF6B35',
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#48BB78',
  },
  timelineIconCurrent: {
    backgroundColor: '#FF6B35',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: '#48BB78',
  },
  timelineLabel: {
    fontSize: 15,
    color: '#A0AEC0',
    paddingTop: 8,
  },
  timelineLabelActive: {
    color: '#718096',
    fontWeight: '500' as const,
  },
  timelineLabelCurrent: {
    color: '#FF6B35',
    fontWeight: '700' as const,
  },
  addressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: 24,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#718096',
    width: 30,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A202C',
  },
});
