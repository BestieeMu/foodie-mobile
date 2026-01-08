export type UserRole = 'customer' | 'delivery';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  instructions?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  address?: string;
  cuisines: string[];
  isOpen: boolean;
  distance: number;
  latitude: number;
  longitude: number;
}

export interface MenuItemOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelection: number;
  options: MenuItemOption[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  isAvailable: boolean;
  optionGroups?: MenuItemGroup[];
  preparationTime: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: { groupId: string; optionId: string }[];
  specialInstructions?: string;
  price: number;
}

export interface Cart {
  restaurantId: string;
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready_for_pickup' 
  | 'picked_up' 
  | 'on_the_way' 
  | 'delivered' 
  | 'cancelled';

export type OrderType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
    avatar?: string;
  };
  restaurantId: string;
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  type: OrderType;
  deliveryAddress?: Address;
  pickupAddress?: Address;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
  driverId?: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    vehicleType: string;
    licensePlate: string;
  };
  estimatedDeliveryTime?: Date;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface DeliveryStats {
  totalDeliveries: number;
  todayDeliveries: number;
  totalEarnings: number;
  todayEarnings: number;
  averageRating: number;
  completionRate: number;
  weeklyEarnings: { day: string; amount: number }[]
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'delivery' | 'promotion' | 'system';
  read: boolean;
  createdAt: Date;
  data?: any;
}

export interface DeliveryOrder extends Order {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  earnings: number;
  distance: number;
}
