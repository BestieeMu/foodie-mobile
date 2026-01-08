import { create } from 'zustand';
import { Cart, CartItem, MenuItem, Restaurant } from '@/types';

interface CartState {
  cart: Cart | null;
  addItem: (restaurant: Restaurant, menuItem: MenuItem, quantity: number, selectedOptions: { groupId: string; optionId: string }[], specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemPrice: (menuItem: MenuItem, selectedOptions: { groupId: string; optionId: string }[]) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,

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
    const { cart } = get();
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
      const tax = subtotal * 0.08;
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
      const tax = subtotal * 0.08;
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
    const { cart } = get();
    if (!cart) return;

    const updatedItems = cart.items.filter(item => item.id !== itemId);

    if (updatedItems.length === 0) {
      set({ cart: null });
    } else {
      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.08;
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
    const { cart } = get();
    if (!cart) return;

    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    const updatedItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );

    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
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
