import { create } from 'zustand';
import { Order, OrderStatus } from '@/types';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrder: (order: Order | null) => void;
  loadOrders: (userId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  initSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  initSocketListeners: () => {
    socketService.on('orders:update', (data: { type: string, order: Order }) => {
      console.log('Order update received:', data);
      const { type, order } = data;
      set((state) => {
        if (type === 'created') {
          // Prevent duplicates
          if (state.orders.some(o => o.id === order.id)) return state;
          return { 
            orders: [order, ...state.orders],
            activeOrder: order 
          };
        } else if (type === 'updated') {
          const updatedOrders = state.orders.map(o => o.id === order.id ? order : o);
          const activeOrder = state.activeOrder?.id === order.id ? order : state.activeOrder;
          return { orders: updatedOrders, activeOrder };
        }
        return state;
      });
    });
  },

  cleanupSocketListeners: () => {
    socketService.off('orders:update');
  },

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

  cancelOrder: async (orderId) => {
    try {
      await apiService.orders.cancel(orderId);
      set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, status: 'cancelled', updatedAt: new Date() } : order
        ),
        activeOrder: state.activeOrder?.id === orderId
          ? { ...state.activeOrder, status: 'cancelled', updatedAt: new Date() }
          : state.activeOrder,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));
