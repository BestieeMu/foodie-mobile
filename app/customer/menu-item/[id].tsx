import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Minus, Plus, Check } from 'lucide-react-native';
import { MenuItem } from '@/types';
import { apiService } from '@/services/api';
import { Button } from '@/components/Button';
import { HeaderBar } from '@/components/HeaderBar';
import { useCartStore } from '@/stores/cartStore';

export default function MenuItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ groupId: string; optionId: string }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, getCartItemPrice } = useCartStore();
  const successScale = useRef(new Animated.Value(0)).current;

  const loadMenuItem = useCallback(async () => {
    if (!id) return;
    const menuItem = await apiService.menu.getById(id);
    if (menuItem) {
      setItem(menuItem);
      const rest = await apiService.restaurants.getById(menuItem.restaurantId);
      if (rest) setRestaurant(rest);
    }
  }, [id]);

  useEffect(() => {
    loadMenuItem();
  }, [loadMenuItem]);

  useEffect(() => {
    setQuantity(1);
    setSelectedOptions([]);
    setSpecialInstructions('');
    setIsAdding(false);
  }, [id]);

  const handleOptionSelect = (groupId: string, optionId: string) => {
    const group = item?.optionGroups?.find(g => g.id === groupId);
    if (!group) return;

    if (group.maxSelection === 1) {
      setSelectedOptions(prev => [
        ...prev.filter(o => o.groupId !== groupId),
        { groupId, optionId },
      ]);
    } else {
      const existing = selectedOptions.filter(o => o.groupId === groupId);
      const isSelected = existing.some(o => o.optionId === optionId);

      if (isSelected) {
        setSelectedOptions(prev => prev.filter(o => !(o.groupId === groupId && o.optionId === optionId)));
      } else if (existing.length < group.maxSelection) {
        setSelectedOptions(prev => [...prev, { groupId, optionId }]);
      }
    }
  };

  const isOptionSelected = (groupId: string, optionId: string) => {
    return selectedOptions.some(o => o.groupId === groupId && o.optionId === optionId);
  };

  const handleAddToCart = () => {
    if (!item || !restaurant) return;
    
    setIsAdding(true);
    addItem(restaurant, item, quantity, selectedOptions, specialInstructions);
    
    Animated.sequence([
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }),
      Animated.delay(600),
      Animated.timing(successScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAdding(false);
      router.replace(`/customer/restaurant/${restaurant.id}` as any);
    });
  };

  if (!item || !restaurant) {
    return null;
  }

  const totalPrice = getCartItemPrice(item, selectedOptions) * quantity;

  return (
    <>
      <HeaderBar title={item.name} onBack={() => router.replace(`/customer/restaurant/${restaurant.id}` as any)} />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: item.image }} style={styles.image} />
          
          <View style={styles.content}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>

            {item.optionGroups?.map((group) => (
              <View key={group.id} style={styles.optionGroup}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{group.name}</Text>
                  {group.required && (
                    <Text style={styles.requiredBadge}>Required</Text>
                  )}
                </View>
                <Text style={styles.groupSubtitle}>
                  Select up to {group.maxSelection}
                </Text>

                {group.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.option,
                      isOptionSelected(group.id, option.id) && styles.optionSelected,
                    ]}
                    onPress={() => handleOptionSelect(group.id, option.id)}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[
                        styles.radio,
                        isOptionSelected(group.id, option.id) && styles.radioSelected,
                      ]} />
                      <Text style={styles.optionName}>{option.name}</Text>
                    </View>
                    {option.price > 0 && (
                      <Text style={styles.optionPrice}>+₦{option.price.toLocaleString()}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.instructionsSection}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <TextInput
                style={styles.instructionsInput}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="Any special requests? (optional)"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={20} color="#2D3748" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Plus size={20} color="#2D3748" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button
            title={`Add to Cart • ₦${totalPrice.toLocaleString()}`}
            onPress={handleAddToCart}
            size="large"
            disabled={isAdding}
          />
        </SafeAreaView>

        {isAdding && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successScale,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <View style={styles.successBadge}>
              <Check size={40} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.successText}>Added to Cart!</Text>
            </View>
          </Animated.View>
        )}
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
    height: 280,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  name: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1A202C',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#718096',
    lineHeight: 22,
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FF6B35',
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A202C',
  },
  requiredBadge: {
    fontSize: 12,
    color: '#F56565',
    fontWeight: '600' as const,
  },
  groupSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E0',
  },
  radioSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  optionName: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '500' as const,
  },
  optionPrice: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600' as const,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 12,
  },
  instructionsInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A202C',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A202C',
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  successBadge: {
    backgroundColor: '#38A169',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
