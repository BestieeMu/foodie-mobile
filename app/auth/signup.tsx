import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { UserRole } from '@/types';

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Default to customer, but allow overriding via params if we came from a specific flow
  const [role, setRole] = useState<UserRole>((params.role as UserRole) || 'customer');

  const handleSignUp = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signup(name, email, password, phone, role);
      // If signup is successful (and requires verification), navigate to OTP screen
      router.push({ pathname: '/auth/verify', params: { email } });
    } catch (error) {
      Alert.alert('Sign Up Failed', (error as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Foodie today</Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleOption, role === 'customer' && styles.roleOptionActive]}
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleOption, role === 'delivery' && styles.roleOptionActive]}
              onPress={() => setRole('delivery')}
            >
              <Text style={[styles.roleText, role === 'delivery' && styles.roleTextActive]}>Driver</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color="#A0AEC0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#A0AEC0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color="#A0AEC0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#A0AEC0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#A0AEC0" />
                ) : (
                  <Eye size={20} color="#A0AEC0" />
                )}
              </TouchableOpacity>
            </View>

            <Button 
              title="Sign Up" 
              onPress={handleSignUp} 
              loading={isLoading}
              size="large"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleOptionActive: {
    backgroundColor: '#FF6B35',
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#718096',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
});
