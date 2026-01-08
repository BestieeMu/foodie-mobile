import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Star, Clock, Bike } from 'lucide-react-native';
import { Restaurant, MenuItem } from '@/types';
import { apiService } from '@/services/api';
import { MenuItemCard } from '@/components/MenuItemCard';
import { HeaderBar } from '@/components/HeaderBar';

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const loadRestaurant = useCallback(async () => {
    if (!id) return;
    const data = await apiService.restaurants.getById(id);
    if (data) setRestaurant(data);
  }, [id]);

  const loadMenu = useCallback(async () => {
    if (!id) return;
    const items = await apiService.menu.getByRestaurant(id);
    setMenuItems(items);
    
    const cats = items.map(item => item.category).filter(Boolean);
    const uniqueCategories = Array.from(new Set(cats));
    setCategories(uniqueCategories.length ? uniqueCategories : ['Menu']);
  }, [id]);

  useEffect(() => {
    loadRestaurant();
    loadMenu();
  }, [loadRestaurant, loadMenu]);

  if (!restaurant) {
    return null;
  }

  return (
    <>
      <HeaderBar title={restaurant.name} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: restaurant.image }} style={styles.image} />
          
          <View style={styles.content}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.cuisines}>{restaurant.cuisines.join(' • ')}</Text>

            <View style={styles.info}>
              <View style={styles.infoItem}>
                <Star size={16} color="#FFB800" fill="#FFB800" />
                <Text style={styles.infoText}>{restaurant.rating}</Text>
                <Text style={styles.infoTextLight}>({restaurant.reviewCount})</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={16} color="#718096" />
                <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.infoItem}>
                <Bike size={16} color="#718096" />
                <Text style={styles.infoText}>₦{restaurant.deliveryFee.toLocaleString()}</Text>
              </View>
            </View>

            {categories.map((category) => {
              const categoryItems = menuItems.filter(item => item.category === category || category === 'Menu');
              return (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {categoryItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onPress={() => router.push(`/customer/menu-item/${item.id}` as any)}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1A202C',
    marginBottom: 8,
  },
  cuisines: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 16,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600' as const,
  },
  infoTextLight: {
    fontSize: 14,
    color: '#718096',
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 16,
  },
});
