import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = () => {
  // 1. Check environment variable first
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;
  if (envBase) {
    // Remove /api if present
    const base = envBase.replace('/api', '');
    return Platform.OS === 'android' && base.includes('localhost')
      ? base.replace('localhost', '10.0.2.2')
      : base;
  }

  // 2. Dynamic host detection for Expo Go (Development)
  if (Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${host}:4004`;
  }

  // 3. Fallbacks
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:4004'
    : 'http://localhost:4004';
};

const SOCKET_URL = getBaseUrl();
console.log('SOCKET URL', SOCKET_URL);

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  async connect() {
    if (this.socket?.connected) return;

    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
        console.log('Socket: No token found, skipping connection');
        return;
    }

    console.log('Socket: Connecting with token...');
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.rebindListeners();
    });

    this.socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message);
    });
    
    this.socket.on('disconnect', (reason) => {
       console.log('Socket disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
        this.socket.on(event, callback);
    }
    // Store listener to rebind on reconnect if needed, or just track them
    if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
        this.socket.off(event, callback);
    }
    if (callback) {
        const list = this.listeners.get(event);
        if (list) {
            this.listeners.set(event, list.filter(cb => cb !== callback));
        }
    } else {
        this.listeners.delete(event);
    }
  }
  
  emit(event: string, data: any) {
    if (this.socket?.connected) {
        this.socket.emit(event, data);
    } else {
        console.warn('Socket not connected, cannot emit:', event);
    }
  }

  private rebindListeners() {
      // In case socket was null and re-initialized, we might want to re-attach listeners
      // But usually 'on' attaches to the current socket instance. 
      // If disconnect() sets socket to null, we need to re-attach.
      if (!this.socket) return;
      
      this.listeners.forEach((callbacks, event) => {
          callbacks.forEach(cb => {
              // Avoid duplicate listeners
              if (!this.socket?.hasListeners(event)) {
                   this.socket?.on(event, cb);
              } else {
                  // Check if this specific callback is already attached? 
                  // Socket.io doesn't easily expose that. 
                  // Simplest is to just let consumers handle lifecycle or use a hook.
                  this.socket?.off(event, cb); 
                  this.socket?.on(event, cb);
              }
          });
      });
  }
}

export const socketService = new SocketService();
