import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, HelpCircle, LogOut, ChevronRight, Car } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useDeliveryStore } from '@/stores/deliveryStore';

export default function DeliveryProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isOnline, setOnline } = useDeliveryStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/signin');
  };

  const menuItems = [
    { icon: Car, label: 'Vehicle Info', onPress: () => router.push('/delivery/(profile)/vehicle' as any) },
    { icon: Bell, label: 'Notifications', onPress: () => router.push('/delivery/(profile)/notifications' as any) },
    { icon: HelpCircle, label: 'Help & Support', onPress: () => router.push('/delivery/(profile)/support' as any) },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#F0FFF4' : '#EDF2F7' }]}> 
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#48BB78' : '#A0AEC0' }]} />
              <Text style={[styles.statusText, { color: isOnline ? '#2F855A' : '#4A5568' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={(val) => setOnline(val)}
              thumbColor={isOnline ? '#FFFFFF' : '#FFFFFF'}
              trackColor={{ false: '#CBD5E0', true: '#48BB78' }}
            />
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Delivery Partner</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <item.icon size={22} color="#2D3748" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#A0AEC0" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#F56565" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4C6EF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  email: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  roleText: {
    color: '#4C6EF5',
    fontSize: 12,
    fontWeight: '600',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: '#2D3748',
  },
  logoutButton: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#FFF5F5',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#F56565',
    fontSize: 16,
    fontWeight: '600',
  },
});
