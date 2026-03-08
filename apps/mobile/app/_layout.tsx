import { Stack } from 'expo-router';
import { BrokerBoxThemeProvider } from '@brokerbox/ui';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
  bg: '#0B0F14',
  card: '#121822',
  primary: '#14B8A6',
  text: '#E5E7EB',
  muted: '#6B7280',
  error: '#DC2626',
};

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('auth_admin').then((res) => {
      if (res === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (password === 'admin') {
      await SecureStore.setItemAsync('auth_admin', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Development password is "admin".');
    }
  };

  if (isAuthenticated === null) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />; // Splash/Loading state
  }

  if (!isAuthenticated) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.loginCard}>
          <Text style={styles.title}>BrokerBox</Text>
          <Text style={styles.subtitle}>Development Mode Gate</Text>

          <TextInput
            style={styles.input}
            placeholder="Username / Email"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password (Hint: admin)"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Unlock App</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <BrokerBoxThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </BrokerBoxThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  }
});
