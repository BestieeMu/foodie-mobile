import { create } from 'zustand';
import { DeliveryOrder, DeliveryStats, OrderStatus } from '@/types';
import { apiService } from '@/services/api';
import { socketService } from '@/services/socket';

interface DeliveryState {
  availableOrders: DeliveryOrder[];
  activeDelivery: DeliveryOrder | null;
  stats: DeliveryStats;
  isOnline: boolean;
  acceptOrder: (order: DeliveryOrder) => Promise<void>;
  completeDelivery: () => Promise<void>;
  updateDriverLocation: (latitude: number, longitude: number) => Promise<void>;
  loadAvailableOrders: () => Promise<void>;
  loadStats: () => Promise<void>;
  setActiveDeliveryStatus: (status: OrderStatus) => void;
  setOnline: (online: boolean) => void;
  toggleOnline: () => void;
  initSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  availableOrders: [],
  activeDelivery: null,
  stats: {
    totalDeliveries: 0,
    todayDeliveries: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    averageRating: 0,
    completionRate: 0,
    weeklyEarnings: [],
  },
  isOnline: true,

  initSocketListeners: () => {
    socketService.on('orders:update', (data: { type: string, order: DeliveryOrder }) => {
      console.log('Delivery order update received:', data);
      const { type, order } = data;
      set((state) => {
        if (type === 'created') {
          // Add new available order
          if (state.availableOrders.some(o => o.id === order.id)) return state;
          return { availableOrders: [order, ...state.availableOrders] };
        } else if (type === 'updated') {
          // Update existing order in available orders or active delivery
          const updatedAvailableOrders = state.availableOrders.map(o => o.id === order.id ? order : o);
          const activeOrder = state.activeDelivery?.id === order.id ? order : state.activeDelivery;
          return { availableOrders: updatedAvailableOrders, activeDelivery: activeOrder };
        }
        return state;
      });
    });

    socketService.on('delivery:update', (data: { type: string, delivery: DeliveryOrder }) => {
      console.log('Delivery update received:', data);
      const { type, delivery } = data;
      set((state) => {
        if (type === 'assigned') {
          // Add to active delivery
          return { activeDelivery: delivery };
        } else if (type === 'completed') {
          // Remove from active delivery
          return { activeDelivery: null };
        } else if (type === 'updated') {
          // Update active delivery
          return { activeDelivery: state.activeDelivery?.id === delivery.id ? delivery : state.activeDelivery };
        }
        return state;
      });
    });
  },

  cleanupSocketListeners: () => {
    socketService.off('orders:update');
    socketService.off('delivery:update');
  },

  loadStats: async () => {
    try {
      const stats = await apiService.delivery.getStats();
      set({ stats });
    } catch (e) {
      console.log('Failed to load stats', e);
    }
  },

  acceptOrder: async (order) => {
    const accepted = await apiService.delivery.acceptOrder(order.id);
    set((state) => ({
      availableOrders: state.availableOrders.filter(o => o.id !== order.id),
      activeDelivery: accepted || order,
    }));
  },

  setActiveDeliveryStatus: (status) => {
    set((state) => ({
      activeDelivery: state.activeDelivery ? { ...state.activeDelivery, status, updatedAt: new Date() } : null,
    }));
  },

  completeDelivery: async () => {
    const { activeDelivery } = get();
    if (!activeDelivery) return;
    
    try {
      await apiService.delivery.completeOrder(activeDelivery.id);
      
      set((state) => {
        // Optimistic update - in reality, we should fetch fresh stats
        const earnings = state.activeDelivery?.earnings || 0;
        return {
          stats: {
            ...state.stats,
            totalDeliveries: state.stats.totalDeliveries + 1,
            todayDeliveries: state.stats.todayDeliveries + 1,
            totalEarnings: Number((state.stats.totalEarnings + earnings).toFixed(2)),
            todayEarnings: Number((state.stats.todayEarnings + earnings).toFixed(2)),
          },
          activeDelivery: null,
        };
      });
      
      // Fetch fresh stats to be sure
      get().loadStats();
    } catch (e) {
      console.error('Failed to complete delivery', e);
    }
  },

  updateDriverLocation: async (latitude, longitude) => {
    await apiService.delivery.updateDriverLocation(latitude, longitude);
    set((state) => ({
      activeDelivery: state.activeDelivery
        ? { ...state.activeDelivery, driverLocation: { latitude, longitude }, updatedAt: new Date() }
        : null,
    }));
  },

  loadAvailableOrders: async () => {
    const queue = await apiService.delivery.getAvailableOrders();
    set({ availableOrders: queue });
  },
  setOnline: (online: boolean) => set({ isOnline: online }),
  toggleOnline: () => set({ isOnline: !get().isOnline }),
}));