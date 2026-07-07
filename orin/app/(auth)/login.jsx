import { StyleSheet, Text, TextInput, Pressable, View, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/color';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/activity');
    } catch (error) {
      Alert.alert('Login failed', error.message ?? 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText title={true} style={styles.title}>
        Login to your account
      </ThemedText>
      <Spacer />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.iconColour}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.iconColour}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>
      <View style={styles.card}>
        <Link href="/register">
          <ThemedText style={{ fontWeight: 'bold' }} title={true}>
            Go to Register
          </ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
  },
  input: {
    width: '80%',
    padding: 15,
    backgroundColor: '#d6d5e1',
    borderRadius: 8,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#8447FF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#d6d5e1',
    padding: 15,
    borderRadius: 15,
    marginVertical: 10,
  },
});
