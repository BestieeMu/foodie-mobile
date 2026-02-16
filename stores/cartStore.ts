import { create } from 'zustand';
import { Cart, CartItem, MenuItem, Restaurant } from '@/types';
import { apiService } from '@/services/api';

interface CartState {
  cart: Cart | null;
  taxRate: number; // Percentage, e.g. 5 for 5%
  fetchSettings: () => Promise<void>;
  addItem: (restaurant: Restaurant, menuItem: MenuItem, quantity: number, selectedOptions: { groupId: string; optionId: string }[], specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemPrice: (menuItem: MenuItem, selectedOptions: { groupId: string; optionId: string }[]) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  taxRate: 5, // Default 5%

  fetchSettings: async () => {
    try {
        const settings = await apiService.system.getSettings();
        if (settings && typeof settings.tax_rate === 'number') {
            set({ taxRate: settings.tax_rate });
        }
    } catch (error) {
        console.log('Failed to fetch settings', error);
    }
  },

  getCartItemPrice: (menuItem: MenuItem, selectedOptions: { groupId: string; optionId: string }[]) => {
    let price = menuItem.price;
    
    selectedOptions.forEach(({ groupId, optionId }) => {
      const group = menuItem.optionGroups?.find(g => g.id === groupId);
      const option = group?.options.find(o => o.id === optionId);
      if (option) {
        price += option.price;
      }
    });

    return price;
  },

  addItem: (restaurant, menuItem, quantity, selectedOptions, specialInstructions) => {
    const { cart, taxRate } = get();
    const itemPrice = get().getCartItemPrice(menuItem, selectedOptions);

    const newItem: CartItem = {
      id: `cart-item-${Date.now()}`,
      menuItem,
      quantity,
      selectedOptions,
      specialInstructions,
      price: itemPrice,
    };

    if (!cart || cart.restaurantId !== restaurant.id) {
      const subtotal = itemPrice * quantity;
      const deliveryFee = restaurant.deliveryFee;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + deliveryFee + tax;

      set({
        cart: {
          restaurantId: restaurant.id,
          restaurant,
          items: [newItem],
          subtotal,
          deliveryFee,
          tax,
          total,
        },
      });
    } else {
      const updatedItems = [...cart.items, newItem];
      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + cart.deliveryFee + tax;

      set({
        cart: {
          ...cart,
          items: updatedItems,
          subtotal,
          tax,
          total,
        },
      });
    }
  },

  removeItem: (itemId) => {
    const { cart, taxRate } = get();
    if (!cart) return;

    const updatedItems = cart.items.filter(item => item.id !== itemId);

    if (updatedItems.length === 0) {
      set({ cart: null });
    } else {
      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + cart.deliveryFee + tax;

      set({
        cart: {
          ...cart,
          items: updatedItems,
          subtotal,
          tax,
          total,
        },
      });
    }
  },

  updateItemQuantity: (itemId, quantity) => {
    const { cart, taxRate } = get();
    if (!cart) return;

    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    const updatedItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );

    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + cart.deliveryFee + tax;

    set({
      cart: {
        ...cart,
        items: updatedItems,
        subtotal,
        tax,
        total,
      },
    });
  },

  clearCart: () => set({ cart: null }),
}));
