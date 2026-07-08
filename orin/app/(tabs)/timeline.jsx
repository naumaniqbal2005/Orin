import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import DateHeader from '../../components/DateHeader';
import ActivityCard from '../../components/ActivityCard';
import ThemedText from '../../components/ThemedText';
import { Calendar, Clock, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/color';

export default function Timeline() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Calendar size={28} color={Colors.iconColour} strokeWidth={2} />
            <ThemedText title style={styles.header}>Timeline</ThemedText>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color={Colors.iconColour} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <DateHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Clock size={48} color={Colors.iconColour} strokeWidth={1.5} />
            </View>
            <ThemedText style={styles.emptyText}>No activities scheduled</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tap the + button to schedule your first activity
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
