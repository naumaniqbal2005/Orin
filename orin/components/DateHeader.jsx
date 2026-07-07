import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import { Colors } from '../constants/color';

export default function DateHeader({ selectedDate, onDateChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      onDateChange(date);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setShowPicker(true)}
        style={styles.dateButton}
      >
        <ThemedText style={styles.dateText} title>
          {formatDate(selectedDate)}
        </ThemedText>
        <Text style={styles.arrowIcon}>▼</Text>
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          accentColor={Colors.mauveMagic}
        />
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
  arrowIcon: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.mauveMagic,
  },
});
