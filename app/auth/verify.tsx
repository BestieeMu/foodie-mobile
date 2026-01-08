import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/Button';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      await verifyOtp(email!, otp);
      // Navigation handled by auth listener
    } catch (error) {
      Alert.alert('Verification Failed', (error as Error).message);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOtp(email!);
      setTimer(60);
      Alert.alert('Success', 'Code resent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code');
    }
  };

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const chars = text.split('').slice(0, 6);
      const newCode = [...code];
      chars.forEach((c, i) => {
        if (index + i < 6) newCode[index + i] = c;
      });
      setCode(newCode);
      if (index + chars.length < 6) {
        inputs.current[index + chars.length]?.focus();
      } else {
        inputs.current[5]?.blur();
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
          </View>

          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6} // Allow paste logic to handle length
                selectTextOnFocus
              />
            ))}
          </View>

          <Button 
            title="Verify" 
            onPress={handleVerify} 
            loading={isLoading}
            size="large"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.linkText, timer > 0 && styles.linkTextDisabled]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
              </Text>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A202C',
    backgroundColor: '#F7FAFC',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#718096',
    fontSize: 15,
  },
  linkText: {
    color: '#FF6B35',
    fontSize: 15,
    fontWeight: '600',
  },
  linkTextDisabled: {
    color: '#A0AEC0',
  },
});
