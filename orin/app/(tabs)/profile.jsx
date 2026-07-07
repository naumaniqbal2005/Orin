import { StyleSheet, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText title>Profile</ThemedText>
      <Spacer height={16} />
      <ThemedText>{user?.name ?? 'User'}</ThemedText>
      <ThemedText style={styles.email}>{user?.email}</ThemedText>
      <Spacer height={24} />
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  email: {
    opacity: 0.7,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#8447FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
