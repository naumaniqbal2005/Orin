import { ActivityIndicator } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import ThemedView from '../../components/ThemedView';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8447FF" />
      </ThemedView>
    );
  }

  if (user) {
    return <Redirect href="/timeline" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
