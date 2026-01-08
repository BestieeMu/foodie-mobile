import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/stores/cartStore';

export function FloatingCartButton() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  React.useEffect(() => {
    if (cartItemCount > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [cartItemCount, scaleAnim]);

  if (!cart || cartItemCount === 0) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/customer/cart' as any)}
        activeOpacity={0.9}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartItemCount}</Text>
        </View>
        <ShoppingCart size={24} color="#FFFFFF" />
        <View style={styles.textContainer}>
          <Text style={styles.text}>Cart</Text>
          <Text style={styles.total}>₦{cart.total.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#1A202C',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  textContainer: {
    gap: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  total: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
    opacity: 0.9,
  },
});
