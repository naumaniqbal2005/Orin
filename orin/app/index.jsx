import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ThemedView from '../components/ThemedView';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8447FF" />
      </ThemedView>
    );
  }

  return <Redirect href={user ? '/timeline' : '/login'} />;
}
