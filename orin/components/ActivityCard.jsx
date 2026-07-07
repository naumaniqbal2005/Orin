import { View, StyleSheet } from 'react-native';
import React from 'react';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import { Colors } from '../constants/color';

export default function ActivityCard({ activity }) {
  const formatTime = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const getCardColor = () => {
    const colors = [
      Colors.purpleX11,
      Colors.mediumSlateBlue,
      Colors.lavenderPurple,
      Colors.mauveMagic,
      Colors.violet,
      Colors.violet2,
      Colors.mauveMagic2,
      Colors.mauveMagic3,
    ];
    const index = activity.id % colors.length;
    return colors[index];
  };

  return (
    <View style={[styles.card, { borderColor: getCardColor() }]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <ThemedText style={styles.activityTitle} title>
            {activity.name}
          </ThemedText>
        </View>
        <ThemedText style={styles.activityDescription}>
          {activity.description}
        </ThemedText>
        <View style={styles.bottomRow}>
          <ThemedText style={styles.timeText}>
            {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: Colors.mauveMagic,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 60,
  },
  topRow: {
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: '900',
  },
  activityDescription: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: Colors.secondaryText,
    marginBottom: 4,
    opacity: 0.8,
  },
  bottomRow: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.white
  },
});
