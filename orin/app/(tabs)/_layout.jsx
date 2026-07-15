import { ActivityIndicator } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Colors } from '../../constants/color';
import { Calendar, LayoutGrid, BarChart3, User } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import ThemedView from '../../components/ThemedView';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8447FF" />
      </ThemedView>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.iconColourFocused,
        tabBarInactiveTintColor: Colors.iconColour,
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="presets"
        options={{
          title: 'Presets',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
