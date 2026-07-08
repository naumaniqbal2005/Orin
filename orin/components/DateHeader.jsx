import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import { Colors } from '../constants/color';

export default function DateHeader({ selectedDate, onDateChange }) {
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleDayPress = (day) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    onDateChange(newDate);
    setShowCalendar(false);
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const calendarDays = generateCalendarDays(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setShowCalendar(!showCalendar)}
        style={styles.dateButton}
      >
        <CalendarIcon size={20} color={Colors.iconColour} strokeWidth={1.5} />
        <ThemedText style={styles.dateText} title>
          {formatDate(selectedDate)}
        </ThemedText>
      </TouchableOpacity>
      
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <LinearGradient
            colors={[Colors.pastelPurpleStart, Colors.pastelPurpleEnd]}
            style={styles.calendarHeader}
          >
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
              <ChevronLeft size={24} color={Colors.iconColour} strokeWidth={2} />
            </TouchableOpacity>
            <ThemedText style={styles.monthText} title>
              {monthNames[month]} {year}
            </ThemedText>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <ChevronRight size={24} color={Colors.iconColour} strokeWidth={2} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.weekDaysContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDayCell}>
                <ThemedText style={styles.weekDayText}>{day}</ThemedText>
              </View>
            ))}
          </View>

          <ScrollView style={styles.daysContainer}>
            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day === selectedDate.getDate() && styles.selectedDayCell,
                    !day && styles.emptyDayCell
                  ]}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                >
                  {day && (
                    <ThemedText style={[
                      styles.dayText,
                      day === selectedDate.getDate() && styles.selectedDayText
                    ]}>
                      {day}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowCalendar(false)}
          >
            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.glassBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  calendarContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
  },
  daysContainer: {
    maxHeight: 280,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 4,
  },
  emptyDayCell: {
    backgroundColor: 'transparent',
  },
  selectedDayCell: {
    backgroundColor: Colors.softLavender,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedDayText: {
    color: Colors.white,
    fontFamily: 'Poppins-Medium',
  },
  closeButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
  },
});
