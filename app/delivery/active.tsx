import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone } from 'lucide-react-native';

// Platform-safe map fallback
let MapView: any;
let Marker: any;
let Polyline: any;
type LatLng = { latitude: number; longitude: number };
if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Polyline = RNMaps.Polyline;
} else {
  MapView = ({ style, children }: any) => (
    <View style={[style, { backgroundColor: '#EDF2F7' }]}> 
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#718096' }}>Map preview unavailable on web</Text>
      </View>
      {children}
    </View>
  );
  Marker = () => null;
  Polyline = () => null;
}

import { useDeliveryStore } from '@/stores/deliveryStore';
import { Button } from '@/components/Button';
import * as Location from 'expo-location';
import { getRouteBetween } from '@/services/directions';

export default function ActiveDeliveryScreen() {
  const { activeDelivery, completeDelivery, setActiveDeliveryStatus, updateDriverLocation } = useDeliveryStore();

  const mapRef = useRef<typeof MapView | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const lastDriverLoc = useRef<LatLng | null>(null);
  const [locSub, setLocSub] = useState<Location.LocationSubscription | null>(null);

  // Helper to compute distance in meters
  const distanceMeters = (a: LatLng, b: LatLng) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // m
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  };

  // Request permissions and start location updates when needed
  useEffect(() => {
    let isMounted = true;
    const startLocationWatch = async () => {
      if (!activeDelivery) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted) setPermissionError('Location permission not granted. Enable to track route.');
        return;
      }
      setPermissionError(null);

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 10 },
        (loc) => {
          updateDriverLocation(loc.coords.latitude, loc.coords.longitude);
        }
      );
      setLocSub(sub);
    };

    // Start watching when picked_up or on_the_way
    if (activeDelivery?.status === 'picked_up' || activeDelivery?.status === 'on_the_way') {
      startLocationWatch();
    }

    return () => {
      isMounted = false;
      locSub?.remove();
      setLocSub(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDelivery?.status]);

  // Animate camera on status changes
  useEffect(() => {
    if (!activeDelivery || !mapRef.current) return;

    const pickup = activeDelivery.pickupLocation;
    const dest = activeDelivery.deliveryLocation;
    const driver = activeDelivery.driverLocation;

    if (activeDelivery.status === 'ready_for_pickup') {
      mapRef.current.animateToRegion({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 600);
    } else if (activeDelivery.status === 'picked_up' && driver) {
      mapRef.current.animateToRegion({
        latitude: driver.latitude,
        longitude: driver.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 600);
    } else if (activeDelivery.status === 'on_the_way' && driver) {
      mapRef.current.fitToCoordinates([
        { latitude: driver.latitude, longitude: driver.longitude },
        { latitude: dest.latitude, longitude: dest.longitude },
      ], {
        edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    }
  }, [activeDelivery?.status, activeDelivery?.driverLocation]);

  // Update route when on_the_way and driver moves significantly
  useEffect(() => {
    const driver = activeDelivery?.driverLocation;
    if (!driver || activeDelivery?.status !== 'on_the_way') return;

    const prev = lastDriverLoc.current;
    if (!prev || distanceMeters(prev, driver) > 25) {
      lastDriverLoc.current = driver;
      const start: LatLng = { latitude: driver.latitude, longitude: driver.longitude };
      const end: LatLng = { latitude: activeDelivery.deliveryLocation.latitude, longitude: activeDelivery.deliveryLocation.longitude };
      getRouteBetween(start, end).then((coords) => {
        setRouteCoords(coords);
        // Keep both in view
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([start, end], {
            edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
            animated: true,
          });
        }
      }).catch(() => {
        // fallback to straight line
        setRouteCoords([start, end]);
      });
    }
  }, [activeDelivery?.driverLocation, activeDelivery?.status]);

  if (!activeDelivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active delivery</Text>
          <Text style={styles.emptySubtext}>Accept an order to start delivering</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePrimaryAction = () => {
    if (activeDelivery.status === 'ready_for_pickup') {
      setActiveDeliveryStatus('picked_up');
    } else if (activeDelivery.status === 'picked_up') {
      setActiveDeliveryStatus('on_the_way');
    } else if (activeDelivery.status === 'on_the_way') {
      setActiveDeliveryStatus('delivered');
      completeDelivery();
    }
  };

  const getPrimaryLabel = () => {
    if (activeDelivery.status === 'ready_for_pickup') return 'Mark as Picked Up';
    if (activeDelivery.status === 'picked_up') return 'Start Navigation';
    if (activeDelivery.status === 'on_the_way') return 'Mark as Delivered';
    return 'Mark as Delivered';
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: activeDelivery.pickupLocation.latitude,
          longitude: activeDelivery.pickupLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Pickup marker */}
        <Marker
          identifier="pickup"
          coordinate={{
            latitude: activeDelivery.pickupLocation.latitude,
            longitude: activeDelivery.pickupLocation.longitude,
          }}
          pinColor="#FF6B35"
          title="Pickup"
        />
        {/* Destination marker */}
        <Marker
          identifier="destination"
          coordinate={{
            latitude: activeDelivery.deliveryLocation.latitude,
            longitude: activeDelivery.deliveryLocation.longitude,
          }}
          pinColor="#4C6EF5"
          title="Delivery"
        />
        {/* Driver marker when available */}
        {activeDelivery.driverLocation && (
          <Marker
            identifier="driver"
            coordinate={activeDelivery.driverLocation}
            title="You"
            pinColor="#2F855A"
          />
        )}
        {/* Route polyline only when on_the_way */}
        {activeDelivery.status === 'on_the_way' && routeCoords.length >= 2 && (
          <Polyline coordinates={routeCoords} strokeColor="#4C6EF5" strokeWidth={4} />
        )}
      </MapView>

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        {permissionError && (
          <View style={styles.permBanner}>
            <Text style={styles.permText}>{permissionError}</Text>
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.customerName}>{activeDelivery.customer.name}</Text>
              <Text style={styles.orderNumber}>{activeDelivery.orderNumber}</Text>
            </View>
            <TouchableOpacity style={styles.phoneButton}>
              <Phone size={20} color="#4C6EF5" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <Text style={styles.locationAddress}>
              {activeDelivery.deliveryLocation.address}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title={getPrimaryLabel()}
              onPress={handlePrimaryAction}
              size="large"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  permBanner: {
    backgroundColor: '#FEF7ED',
    borderColor: '#FBD38D',
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
  },
  permText: { color: '#B7791F', fontSize: 12 },
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
    pointerEvents: 'auto',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#718096',
  },
  phoneButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500' as const,
  },
  actions: {
    gap: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
