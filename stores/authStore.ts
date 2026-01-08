import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types';
import { apiService } from '@/services/api';
import { registerForPushNotificationsAsync } from '@/services/push';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  accessToken?: string;
  refreshToken?: string;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (data: { email: string; password: string; name: string; phone: string; role: UserRole }) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasCompletedOnboarding: false,
  accessToken: undefined,
  refreshToken: undefined,

  loadUser: async () => {
    try {
      const [userStr, onboardingStr, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('hasCompletedOnboarding'),
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
      ]);

      if (userStr && accessToken) {
        const user = JSON.parse(userStr) as User;
        set({ 
          user,
          isAuthenticated: true,
          hasCompletedOnboarding: onboardingStr === 'true',
          isLoading: false,
          accessToken,
          refreshToken: refreshToken || undefined,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string, role: UserRole) => {
    // Try to get push token
    let pushToken;
    try {
      pushToken = await registerForPushNotificationsAsync();
    } catch (e) {
      console.log('Push token error:', e);
    }

    const { user, accessToken, refreshToken } = await apiService.auth.login(email, password, role, pushToken);
    const normalizedUser = { ...user, role: (user.role as any) === 'driver' ? 'delivery' : user.role } as User;
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(normalizedUser)],
      ['accessToken', accessToken],
      ['refreshToken', refreshToken || ''],
    ]);
    set({ user: normalizedUser, isAuthenticated: true, accessToken, refreshToken });
  },

  signup: async (data) => {
    // Try to get push token
    let pushToken;
    try {
      pushToken = await registerForPushNotificationsAsync();
    } catch (e) {
      console.log('Push token error:', e);
    }

    const res = await apiService.auth.signup({ ...data, pushToken });
    
    if ((res as any).requiresVerification) {
      return;
    }

    const { user, accessToken, refreshToken } = res;
    const normalizedUser = { ...user, role: (user.role as any) === 'driver' ? 'delivery' : user.role } as User;
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(normalizedUser)],
      ['accessToken', accessToken],
      ['refreshToken', refreshToken || ''],
    ]);
    set({ user: normalizedUser, isAuthenticated: true, accessToken, refreshToken });
  },

  verifyOtp: async (email: string, otp: string) => {
    const { user, accessToken, refreshToken } = await apiService.auth.verifyOtp(email, otp);
    const normalizedUser = { ...user, role: (user.role as any) === 'driver' ? 'delivery' : user.role } as User;
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(normalizedUser)],
      ['accessToken', accessToken],
      ['refreshToken', refreshToken || ''],
    ]);
    set({ user: normalizedUser, isAuthenticated: true, accessToken, refreshToken });
  },

  resendOtp: async (email: string) => {
    await apiService.auth.resendOtp(email);
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['user', 'hasCompletedOnboarding', 'accessToken', 'refreshToken']);
    set({ user: null, isAuthenticated: false, hasCompletedOnboarding: false, accessToken: undefined, refreshToken: undefined });
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    set({ hasCompletedOnboarding: true });
  },
}));
