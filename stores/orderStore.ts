import { create } from 'zustand';
import { Order, OrderStatus } from '@/types';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrder: (order: Order | null) => void;
  loadOrders: (userId: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  activeOrder: null,

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

  loadOrders: (userId) => {
    console.log('Loading orders for user:', userId);
  },
}));
