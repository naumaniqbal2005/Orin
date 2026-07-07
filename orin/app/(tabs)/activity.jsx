import { View, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import DateHeader from '../../components/DateHeader';
import ActivityCard from '../../components/ActivityCard';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const mockActivities = [
    {
      id: 1,
      name: 'Morning Exercise',
      description: '30 min cardio workout',
      startTime: 7,
      endTime: 8,
    },
    {
      id: 2,
      name: 'Team Standup',
      description: 'Daily sync with the team',
      startTime: 9,
      endTime: 10,
    },
    {
      id: 3,
      name: 'Deep Work Session',
      description: 'Focus on project development',
      startTime: 10,
      endTime: 12,
    },
    {
      id: 4,
      name: 'Lunch Break',
      description: 'Relax and recharge',
      startTime: 12,
      endTime: 13,
    },
    {
      id: 5,
      name: 'Client Meeting',
      description: 'Project review discussion',
      startTime: 14,
      endTime: 15,
    },
    {
      id: 6,
      name: 'Code Review',
      description: 'Review pull requests',
      startTime: 15,
      endTime: 16,
    },
    {
      id: 7,
      name: 'Planning Session',
      description: 'Plan next sprint tasks',
      startTime: 16,
      endTime: 17,
    },
    {
      id: 8,
      name: 'Evening Walk',
      description: 'Outdoor activity',
      startTime: 18,
      endTime: 19,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ThemedView style={styles.innerContainer}>
        <DateHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {mockActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 8,
  },
});
