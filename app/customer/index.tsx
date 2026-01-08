import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { Restaurant } from '@/types';
import { apiService } from '@/services/api';
import { RestaurantCard } from '@/components/RestaurantCard';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories] = useState(['All', 'Jollof Rice', 'Swallow', 'Suya', 'Soups', 'Party Packs']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await apiService.restaurants.getAll();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    if (selectedCategory === 'All') return true;
    return r.cuisines.some(c => c.toLowerCase().includes(selectedCategory.toLowerCase()));
  });

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <TouchableOpacity style={styles.location}>
              <MapPin size={16} color="#FF6B35" />
              <Text style={styles.locationText}>Lagos, Nigeria</Text>
              <ChevronDown size={16} color="#718096" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <FlatList
        data={filteredRestaurants}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/customer/restaurant/${item.id}` as any)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A202C',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#718096',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 20,
  },
});
