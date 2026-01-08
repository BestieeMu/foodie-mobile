import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Foodie</Text>
          <Text style={styles.subtitle}>Delicious meals delivered to your doorstep.</Text>
        </View>

        <View style={styles.imageContainer}>
           {/* Placeholder for a hero image if you have one, or just use spacing */}
           <View style={styles.heroPlaceholder} />
        </View>

        <View style={styles.footer}>
          <Button 
            title="Get Started" 
            onPress={() => router.push('/auth/signup')} 
            size="large"
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F7FAFC',
    borderRadius: 100,
  },
  footer: {
    gap: 20,
    marginBottom: 40,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#718096',
  },
  loginLink: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
