import { View, StyleSheet } from 'react-native';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';

export default function DayColumn({ slots = [], date }) {
  // Generate 24 hour slots (0-23)
  const hourSlots = Array.from({ length: 24 }, (_, i) => {
    const slot = slots.find(s => s.hourStart === i);
    return {
      hour: i,
      activity: slot?.activityId || null,
      status: slot?.status || 'unscheduled',
      duration: slot?.duration || 1
    };
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.dateText} title>{date}</ThemedText>
      {hourSlots.map((slot) => (
        <View key={slot.hour} style={styles.hourSlot}>
          <ThemedText style={styles.hourText}>{slot.hour}:00</ThemedText>
          <View style={[
            styles.activitySlot,
            slot.activity && styles.filledSlot
          ]}>
            {slot.activity && (
              <ThemedText style={styles.activityText}>
                Activity
              </ThemedText>
            )}
          </View>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  dateText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  hourSlot: {
    flexDirection: 'row',
    minHeight: 40,
    marginBottom: 2,
  },
  hourText: {
    width: 45,
    fontSize: 12,
  },
  activitySlot: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 4,
  },
  filledSlot: {
    backgroundColor: '#8447FF',
  },
  activityText: {
    color: '#fff',
    fontSize: 12,
    padding: 4,
  },
});
