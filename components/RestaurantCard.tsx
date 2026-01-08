import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, Clock, Bike } from 'lucide-react-native';
import { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant?: Restaurant;
  onPress: () => void;
}

export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{
          uri:
            restaurant?.image ||
            'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=1200&auto=format&fit=crop&q=60',
        }}
        style={styles.image}
      />
      {restaurant && !restaurant.isOpen && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{restaurant?.name ?? ''}</Text>
        <Text style={styles.cuisines} numberOfLines={1}>
          {(restaurant?.cuisines ?? []).join(' • ')}
        </Text>
        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Star size={14} color="#FFB800" fill="#FFB800" />
            <Text style={styles.infoText}>{restaurant?.rating ?? 0}</Text>
            <Text style={styles.infoTextLight}>({restaurant?.reviewCount ?? 0})</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color="#718096" />
            <Text style={styles.infoText}>{restaurant?.deliveryTime ?? '20-30 min'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Bike size={14} color="#718096" />
            <Text style={styles.infoText}>₦{Number(restaurant?.deliveryFee ?? 0).toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#F7FAFC',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 4,
  },
  cuisines: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500' as const,
  },
  infoTextLight: {
    fontSize: 13,
    color: '#718096',
  },
});
