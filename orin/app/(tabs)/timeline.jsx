import { View, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import DateHeader from '../../components/DateHeader';
import ActivityCard from '../../components/ActivityCard';
import ThemedText from '../../components/ThemedText';

export default function Timeline() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText title>Activity</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create();
