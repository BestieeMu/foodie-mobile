import { create } from 'zustand';
import { Order, OrderStatus } from '@/types';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrder: (order: Order | null) => void;
  loadOrders: (userId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
      activeOrder: order,
    }));
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
      ),
      activeOrder: state.activeOrder?.id === orderId
        ? { ...state.activeOrder, status, updatedAt: new Date() }
        : state.activeOrder,
    }));
  },

  setActiveOrder: (order) => set({ activeOrder: order }),

  loadOrders: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await apiService.orders.getUserOrders(userId);
      set({ orders, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
