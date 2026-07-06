import { View, Text } from 'react-native';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

export default function Calendar() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText title>Calendar</ThemedText>
    </ThemedView>
  );
}
