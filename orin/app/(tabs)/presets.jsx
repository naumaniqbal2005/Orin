import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { LayoutGrid, Plus, Folder, Star } from 'lucide-react-native';
import { Colors } from '../../constants/color';

export default function Presets() {
  const [presets, setPresets] = useState([
    { id: 1, name: 'Morning Routine', icon: 'sun', activities: 5 },
    { id: 2, name: 'Work Day', icon: 'briefcase', activities: 8 },
    { id: 3, name: 'Evening Wind Down', icon: 'moon', activities: 4 },
  ]);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <LayoutGrid size={28} color={Colors.iconColour} strokeWidth={2} />
            <ThemedText title style={styles.header}>Presets</ThemedText>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color={Colors.iconColour} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.presetsContainer}>
            {presets.map((preset, index) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  { backgroundColor: index % 2 === 0 ? Colors.cardBackground : 'rgba(255, 255, 255, 0.4)' }
                ]}
              >
                <View style={styles.presetIconContainer}>
                  <Folder size={32} color={Colors.iconColour} strokeWidth={1.5} />
                </View>
                <ThemedText title style={styles.presetName}>{preset.name}</ThemedText>
                <ThemedText style={styles.presetCount}>
                  {preset.activities} activities
                </ThemedText>
                <View style={styles.starContainer}>
                  <Star size={16} color={Colors.iconColour} strokeWidth={1.5} fill={Colors.iconColour} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <LayoutGrid size={48} color={Colors.iconColour} strokeWidth={1.5} />
            </View>
            <ThemedText style={styles.emptyText}>Create your first preset</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Save your weekly schedules as presets for quick access
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
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  presetCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  presetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetName: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 6,
    color: Colors.title,
  },
  presetCount: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  starContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
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
