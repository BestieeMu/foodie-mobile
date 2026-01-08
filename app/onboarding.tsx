import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Package, Truck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleRoleSelect = async (role: 'customer' | 'delivery') => {
    await completeOnboarding();
    router.push(`/auth/signup?role=${role}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Naija Chop</Text>
          <Text style={styles.subtitle}>Your favorite Nigerian meals, delivered hot!</Text>
        </View>

        <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => handleRoleSelect('customer')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFF5F0' }]}>
            <Package size={48} color="#FF6B35" />
          </View>
          <Text style={styles.roleTitle}>Order Food</Text>
          <Text style={styles.roleDescription}>
            Jollof, Suya, Amala & more! Get authentic Nigerian meals delivered to your doorstep
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => handleRoleSelect('delivery')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F0F4FF' }]}>
            <Truck size={48} color="#4C6EF5" />
          </View>
          <Text style={styles.roleTitle}>Deliver & Earn</Text>
          <Text style={styles.roleDescription}>
            Accept delivery requests, earn money, and work on your own schedule
          </Text>
        </TouchableOpacity>
        </View>

        <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/signin')}>
          <Text style={styles.linkText}>Sign In</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A202C',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#718096',
  },
  linkText: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600' as const,
  },
});
