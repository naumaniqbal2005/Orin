import { StyleSheet, Pressable, Text, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/color';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter your name, email, and password.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/timeline');
    } catch (error) {
      Alert.alert('Registration failed', error.message ?? 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText title={true} style={styles.title}>
        Register a new account
      </ThemedText>
      <Spacer />
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={Colors.iconColour}
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
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
        placeholder="Password (min 8 chars)"
        placeholderTextColor={Colors.iconColour}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>
      <View style={styles.card}>
        <Link href="/login">
          <ThemedText style={{ fontWeight: 'bold' }} title={true}>
            Go to Login
          </ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    width: '80%',
    padding: 15,
    backgroundColor: '#d6d5e1',
    borderRadius: 8,
    marginVertical: 10,
  },
});
