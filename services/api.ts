import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Restaurant, MenuItem, Order, DeliveryOrder, Address, UserRole, User } from '@/types';

const getBaseUrl = () => {
  // 1. Check environment variable first
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;
  if (envBase) {
    return Platform.OS === 'android' && envBase.includes('localhost')
      ? envBase.replace('localhost', '10.0.2.2')
      : envBase;
  }

  // 2. Dynamic host detection for Expo Go (Development)
  if (Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${host}:4003/api`;
  }

  // 3. Fallbacks
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:4003/api' // Android Emulator loopback
    : 'http://localhost:4003/api'; // iOS Simulator / Web
};

const BASE_URL = getBaseUrl();
console.log('API BASE URL', BASE_URL);

async function getToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${BASE_URL}${path}`;
  console.log('API REQUEST', { url, method: options.method || 'GET' });
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (e: any) {
    console.log('API NETWORK ERROR', { url, message: e?.message });
    const fallbackUrl =
      BASE_URL !== defaultBase ? `${defaultBase}${path}` : null;
    if (fallbackUrl) {
      console.log('API RETRY VIA DEFAULT BASE', { fallbackUrl, method: options.method || 'GET' });
      res = await fetch(fallbackUrl, {
        ...options,
        headers,
      });
    } else {
      throw e;
    }
  }

  if (res.status === 401) {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json() as any;
          if (data?.accessToken) {
            await AsyncStorage.setItem('accessToken', data.accessToken);
            const newHeaders = {
              ...headers,
              Authorization: `Bearer ${data.accessToken}`,
            };
            res = await fetch(url, {
              ...options,
              headers: newHeaders,
            });
          }
        }
      }
    } catch {}
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  // @ts-expect-error non-json
  return undefined;
}

export const apiService = {
  auth: {
    login: async (email: string, password: string, role: UserRole, pushToken?: string): Promise<{ user: User; accessToken: string; refreshToken?: string }> => {
      console.log('API LOGIN CALL', { email, role, pushToken });
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, pushToken }),
      });
    },
    signup: async (data: { email: string; password: string; name: string; phone: string; role: UserRole; pushToken?: string }): Promise<{ user: User; accessToken: string; refreshToken?: string }> => {
      const payload = { ...data, role: data.role === 'delivery' ? 'driver' : data.role, pushToken: data.pushToken } as any;
      console.log('API SIGNUP CALL', { email: data.email, role: payload.role });
      return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
      return request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },
  },
  health: {
    check: async (): Promise<{ ok: boolean; env: string }> => {
      return request('/health');
    },
  },

  restaurants: {
    getAll: async (): Promise<Restaurant[]> => {
      const raw = await request<any[]>('/menu/restaurants');
      return raw.map((r) => ({
        id: r.id,
        name: r.name,
        image: r.image || r.imageUrl || '',
        rating: typeof r.rating === 'number' ? r.rating : 0,
        reviewCount: r.reviewCount ?? 0,
        deliveryTime: r.deliveryTime ?? '20-30 min',
        deliveryFee: r.deliveryFee ?? 500,
        minimumOrder: r.minimumOrder ?? 0,
        address: r.address || undefined,
        cuisines: Array.isArray(r.cuisines) ? r.cuisines : (Array.isArray(r.categories) ? r.categories : []),
        isOpen: r.isOpen ?? true,
        distance: r.distance ?? 1.0,
        latitude: r.latitude ?? 0,
        longitude: r.longitude ?? 0,
      }));
    },
    getById: async (id: string): Promise<Restaurant> => {
      const list = await apiService.restaurants.getAll();
      const found = list.find((r) => r.id === id);
      if (!found) throw new Error('Restaurant not found');
      return found;
    },
    search: async (query: string): Promise<Restaurant[]> => {
      const all = await apiService.restaurants.getAll();
      const q = query.toLowerCase();
      return all.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (Array.isArray(r.cuisines) && r.cuisines.some(c => c.toLowerCase().includes(q)))
      );
    },
  },

  menu: {
    getByRestaurant: async (restaurantId: string): Promise<MenuItem[]> => {
      const raw = await request<any[]>(`/menu/restaurants/${restaurantId}/items`);
      return raw.map((it) => {
        const sizes = Array.isArray(it.options?.sizes) ? it.options.sizes : [];
        const addOns = Array.isArray(it.options?.addOns) ? it.options.addOns : [];
        const extras = Array.isArray(it.options?.extras) ? it.options.extras : [];

        const optionGroups = [
          sizes.length
            ? {
                id: 'size',
                name: 'Size',
                required: true,
                maxSelection: 1,
                options: sizes.map((o: any) => ({
                  id: String(o.id),
                  name: String(o.name),
                  price: Number(o.priceDelta ?? 0),
                })),
              }
            : null,
          addOns.length
            ? {
                id: 'addon',
                name: 'Add-ons',
                required: false,
                maxSelection: addOns.length,
                options: addOns.map((o: any) => ({
                  id: String(o.id),
                  name: String(o.name),
                  price: Number(o.priceDelta ?? 0),
                })),
              }
            : null,
          extras.length
            ? {
                id: 'extra',
                name: 'Extras',
                required: false,
                maxSelection: extras.length,
                options: extras.map((o: any) => ({
                  id: String(o.id),
                  name: String(o.name),
                  price: Number(o.priceDelta ?? 0),
                })),
              }
            : null,
        ].filter(Boolean);

        return {
          id: it.id,
          restaurantId: it.restaurantId,
          name: it.name,
          description: it.description || '',
          image: it.image || it.imageUrl || 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=1200&auto=format&fit=crop&q=60',
          price: it.price,
          category: it.category || 'Menu',
          isAvailable: true,
          optionGroups: optionGroups.length ? (optionGroups as any) : undefined,
          preparationTime: 20,
        };
      });
    },
    getById: async (id: string): Promise<MenuItem> => {
      // No direct backend endpoint; search across all restaurants
      const restaurants = await apiService.restaurants.getAll();
      for (const r of restaurants) {
        const items = await apiService.menu.getByRestaurant(r.id);
        const found = items.find((i) => i.id === id);
        if (found) return found;
      }
      throw new Error('Menu item not found');
    },
  },

  addresses: {
    getAll: async (userId?: string): Promise<any[]> => {
      if (userId) {
        return request(`/addresses/${encodeURIComponent(userId)}`);
      }
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        return request(`/addresses/${encodeURIComponent(user.id)}`);
      }
      return [];
    },
    add: async (payload: { userId: string; label: string; street: string; city: string; lat?: number; lng?: number }): Promise<any> => {
      return request('/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  orders: {
    create: async (orderData: any): Promise<Order> => {
      const isCartItems = Array.isArray(orderData.items) && orderData.items.length > 0 && orderData.items[0]?.menuItem;
      const items = isCartItems
        ? orderData.items.map((ci: any) => ({
            itemId: ci.menuItem.id,
            quantity: ci.quantity || 1,
            choice: ci.selectedOptions
              ? {
                  sizeId: ci.selectedOptions.find((o: any) => String(o.groupId).toLowerCase().includes('size'))?.optionId,
                  addOnIds: ci.selectedOptions.filter((o: any) => String(o.groupId).toLowerCase().includes('addon')).map((o: any) => o.optionId),
                  extraIds: ci.selectedOptions.filter((o: any) => String(o.groupId).toLowerCase().includes('extra')).map((o: any) => o.optionId),
                }
              : undefined,
          }))
        : orderData.items;
      const toAddressSchema = (addr: any) => {
        if (!addr) return undefined;
        if (addr.address) return addr;
        const address = [addr.label, addr.street, addr.city].filter(Boolean).join(', ');
        return { address, latitude: addr.lat, longitude: addr.lng };
      };
      const payload = {
        userId: orderData.customerId,
        restaurantId: orderData.restaurantId,
        items,
        type: orderData.type || 'delivery',
        pickupAddress: toAddressSchema(orderData.pickupAddress) 
          || (orderData.restaurant?.address ? { address: String(orderData.restaurant.address) } : undefined)
          || { address: 'Restaurant pickup' },
        deliveryAddress: toAddressSchema(orderData.deliveryAddress),
        gift: !!orderData.gift,
        giftMessage: orderData.giftMessage,
        recipientName: orderData.recipientName,
      };
      const created = await request<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const rest = orderData.restaurant || (orderData.restaurantId ? await apiService.restaurants.getById(orderData.restaurantId) : undefined);
      const normalizeAddressForUI = (addr: any) => {
        if (!addr) return undefined;
        const street = addr.street || addr.address || '';
        return {
          id: addr.id || `addr_${Date.now()}`,
          label: addr.label || 'Delivery',
          street,
          city: addr.city || '',
          state: addr.state || '',
          zipCode: addr.zipCode || '',
          latitude: addr.latitude ?? addr.lat,
          longitude: addr.longitude ?? addr.lng,
          instructions: addr.instructions,
        };
      };
      const full: Order = {
        id: created.id,
        orderNumber: created.id,
        customerId: orderData.customerId,
        customer: orderData.customer,
        restaurantId: orderData.restaurantId,
        restaurant: rest as any,
        items: orderData.items,
        subtotal: orderData.subtotal ?? created.total ?? 0,
        deliveryFee: orderData.deliveryFee ?? rest?.deliveryFee ?? 0,
        tax: orderData.tax ?? 0,
        total: orderData.total ?? created.total ?? 0,
        status: created.status || 'pending',
        type: orderData.type || 'delivery',
        deliveryAddress: normalizeAddressForUI(orderData.deliveryAddress || payload.deliveryAddress),
        pickupAddress: normalizeAddressForUI(orderData.pickupAddress || payload.pickupAddress),
        scheduledFor: orderData.scheduledFor,
        createdAt: new Date(created.createdAt || Date.now()),
        updatedAt: new Date(),
      };
      return full;
    },
    getById: async (id: string): Promise<Order> => {
      return request(`/orders/${id}`);
    },
    getUserOrders: async (userId: string): Promise<Order[]> => {
      return request(`/orders/user/${encodeURIComponent(userId)}`);
    },
  },

  delivery: {
    getAvailableOrders: async (): Promise<DeliveryOrder[]> => {
      return request('/delivery/queue');
    },
    acceptOrder: async (orderId: string): Promise<DeliveryOrder> => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      return request('/delivery/accept', {
        method: 'POST',
        body: JSON.stringify({ driverId: user?.id, orderId }),
      });
    },
    updateDriverLocation: async (latitude: number, longitude: number): Promise<void> => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      await request('/delivery/location', {
        method: 'POST',
        body: JSON.stringify({ driverId: user?.id, lat: latitude, lng: longitude }),
      });
    },
    getStats: async (): Promise<any> => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      if (!user) throw new Error('Not logged in');
      return request(`/delivery/stats/${user.id}`);
    },
    completeOrder: async (orderId: string): Promise<void> => {
      await request(`/delivery/complete/${orderId}`, {
        method: 'POST'
      });
    }
  },

  group: {
    create: async (restaurantId: string): Promise<{ code: string; groupId: string }> => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      const res = await request<any>('/group/create', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id, restaurantId, type: 'delivery' }),
      });
      return { code: res.inviteCode, groupId: res.id };
    },
    join: async (code: string): Promise<{ groupId: string }> => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      const res = await request<any>('/group/join', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id, inviteCode: code }),
      });
      return { groupId: res.id };
    },
    addItem: async (groupId: string, payload: any): Promise<void> => {
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      const userId = payload?.userId || user?.id;
      const items = Array.isArray(payload?.items) ? payload.items : [payload];
      for (const ci of items) {
        const isCartItem = !!ci?.menuItem;
        const body = isCartItem
          ? {
              groupId,
              userId,
              itemId: ci.menuItem.id,
              quantity: ci.quantity || 1,
              choice: ci.selectedOptions
                ? {
                    sizeId: ci.selectedOptions.find((o: any) => String(o.groupId).toLowerCase().includes('size'))?.optionId,
                    addOnIds: ci.selectedOptions.filter((o: any) => String(o.groupId).toLowerCase().includes('addon')).map((o: any) => o.optionId),
                    extraIds: ci.selectedOptions.filter((o: any) => String(o.groupId).toLowerCase().includes('extra')).map((o: any) => o.optionId),
                  }
                : undefined,
            }
          : {
              groupId,
              userId,
              itemId: ci.itemId,
              quantity: ci.quantity || 1,
              choice: ci.choice,
            };
        await request('/group/add-item', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
    },
    finalize: async (groupId: string, payload: Partial<Order>): Promise<Order> => {
      const toAddressSchema = (addr: any) => {
        if (!addr) return undefined;
        if (addr.address) return addr;
        const address = [addr.label, addr.street, addr.city].filter(Boolean).join(', ');
        return { address, latitude: addr.lat, longitude: addr.lng };
      };
      const res = await request<any>('/group/finalize', {
        method: 'POST',
        body: JSON.stringify({
          groupId,
          pickupAddress: toAddressSchema(payload.pickupAddress),
          deliveryAddress: toAddressSchema(payload.deliveryAddress),
        }),
      });
      return res.order;
    },
  },
};
