import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/Button';
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignInScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'delivery'>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await login(email, password, role);
      // Navigation is handled by auth listener in _layout
    } catch (error: any) {
      // Check for unverified account error code
      if (error?.message?.includes('UNVERIFIED') || (error as any)?.code === 'UNVERIFIED') {
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.roleButtonText, role === 'customer' && styles.roleButtonTextActive]}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'delivery' && styles.roleButtonActive]}
              onPress={() => setRole('delivery')}
            >
              <Text style={[styles.roleButtonText, role === 'delivery' && styles.roleButtonTextActive]}>
                Delivery Partner
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <Eye color="#2D3748" size={20} /> : <EyeOff color="#2D3748" size={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <Button 
              title="Sign In" 
              onPress={handleSignIn} 
              loading={loading}
              size="large"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
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
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: '#FF6B35',
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#718096',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2D3748',
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A202C',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1A202C',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
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
