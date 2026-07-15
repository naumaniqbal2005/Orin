import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import DateHeader from '../../components/DateHeader';
import ActivityCard from '../../components/ActivityCard';
import ThemedText from '../../components/ThemedText';
import { Calendar, Clock, Plus, X } from 'lucide-react-native';
import { Colors } from '../../constants/color';
import { presetsService } from '../../lib/presets';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timeline() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [presets, setPresets] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [timelineData, setTimelineData] = useState(null); // { activities: [], timings: [] }
  const [selectedPreset, setSelectedPreset] = useState(null);

  const getDayOfWeek = (date) => {
    return DAYS_OF_WEEK[date.getDay()];
  };

  const loadPresets = async () => {
    setLoadingPresets(true);
    try {
      const result = await presetsService.list();
      setPresets(result.rows || result.documents || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load presets');
    } finally {
      setLoadingPresets(false);
    }
  };

  const handleLoadPreset = (preset) => {
    setSelectedPreset(preset);
    const dayOfWeek = getDayOfWeek(selectedDate);
    
    // Find the schedule for the selected day
    let daySchedule = null;
    if (preset.daySlots && preset.daySlots.length > 0) {
      for (let i = 0; i < preset.daySlots.length; i++) {
        const days = preset.daySlots[i] || [];
        if (days.includes(dayOfWeek)) {
          daySchedule = {
            activities: preset.activities[i] || [],
            timings: preset.timings[i] || []
          };
          break;
        }
      }
    }

    setTimelineData(daySchedule || { activities: [], timings: [] });
    setPresetModalVisible(false);
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '--:--';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  const processTimelineData = (activities, timings) => {
    if (!activities || activities.length === 0) return [];

    const processed = [];
    for (let i = 0; i < activities.length; i++) {
      const currentTiming = timings[i] || {};
      const currentStart = currentTiming.start_time;
      const currentEnd = currentTiming.end_time;

      // Check if this activity should be merged with the previous one
      if (i > 0) {
        const prevItem = processed[processed.length - 1];
        const prevTiming = timings[i - 1] || {};
        
        // If previous activity ends at the same time this one starts, merge them
        if (prevTiming.end_time === currentStart) {
          prevItem.activities.push(activities[i]);
          prevItem.endTiming = currentEnd;
          continue;
        }
      }

      // Check if there's a gap before this activity
      if (i > 0) {
        const prevTiming = timings[i - 1] || {};
        const prevEnd = parseTimeToMinutes(prevTiming.end_time);
        const currentStartMin = parseTimeToMinutes(currentStart);
        
        if (currentStartMin > prevEnd) {
          // Add a break card
          processed.push({
            type: 'break',
            duration: currentStartMin - prevEnd,
            startTime: prevTiming.end_time,
            endTime: currentStart
          });
        }
      }

      processed.push({
        type: 'activity',
        activities: [activities[i]],
        startTiming: currentStart,
        endTiming: currentEnd
      });
    }

    return processed;
  };

  useEffect(() => {
    // Update timeline when date changes if a preset is selected
    if (selectedPreset) {
      const dayOfWeek = getDayOfWeek(selectedDate);
      
      // Find the schedule for the selected day
      let daySchedule = null;
      if (selectedPreset.daySlots && selectedPreset.daySlots.length > 0) {
        for (let i = 0; i < selectedPreset.daySlots.length; i++) {
          const days = selectedPreset.daySlots[i] || [];
          if (days.includes(dayOfWeek)) {
            daySchedule = {
              activities: selectedPreset.activities[i] || [],
              timings: selectedPreset.timings[i] || []
            };
            break;
          }
        }
      }

      setTimelineData(daySchedule || { activities: [], timings: [] });
    }
  }, [selectedDate, selectedPreset]);

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
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              loadPresets();
              setPresetModalVisible(true);
            }}
          >
            <Plus size={24} color={Colors.iconColour} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <DateHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {!timelineData || timelineData.activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Clock size={48} color={Colors.iconColour} strokeWidth={1.5} />
              </View>
              <ThemedText style={styles.emptyText}>No activities scheduled</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Tap the + button to load a preset schedule
              </ThemedText>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {processTimelineData(timelineData.activities, timelineData.timings).map((item, index) => {
                if (item.type === 'break') {
                  const breakMinutes = item.duration;
                  const hours = Math.floor(breakMinutes / 60);
                  const mins = breakMinutes % 60;
                  const durationText = hours > 0 
                    ? `${hours}h ${mins}m break` 
                    : `${mins}m break`;

                  return (
                    <View key={`break-${index}`} style={styles.breakItem}>
                      <View style={styles.breakTimeColumn}>
                        <View style={styles.breakConnector} />
                      </View>
                      <View style={styles.breakColumn}>
                        <View style={styles.breakCard}>
                          <ThemedText style={styles.breakText}>{durationText}</ThemedText>
                        </View>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={`activity-${index}`} style={styles.timelineItem}>
                    <View style={styles.timeColumn}>
                      <ThemedText style={styles.timeText}>
                        {formatTimeDisplay(item.startTiming)}
                      </ThemedText>
                      <View style={styles.timeConnector} />
                      <ThemedText style={styles.timeText}>
                        {formatTimeDisplay(item.endTiming)}
                      </ThemedText>
                    </View>
                    <View style={styles.activityColumn}>
                      {item.activities.map((activity, actIndex) => (
                        <View 
                          key={actIndex} 
                          style={[
                            styles.activityCard,
                            actIndex > 0 && styles.activityCardNested
                          ]}
                        >
                          <ThemedText style={styles.activityName}>{activity}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Preset Selection Modal */}
        <Modal
          visible={presetModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPresetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={[Colors.pastelPurpleStart, Colors.pastelPurpleEnd]}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <ThemedText title style={styles.modalTitle}>Select Preset</ThemedText>
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setPresetModalVisible(false)}
                >
                  <X size={20} color={Colors.iconColour} />
                </TouchableOpacity>
              </View>

              {loadingPresets ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.iconColour} />
                  <ThemedText style={styles.loadingText}>Loading presets...</ThemedText>
                </View>
              ) : presets.length === 0 ? (
                <View style={styles.modalEmptyContainer}>
                  <ThemedText style={styles.modalEmptyText}>No presets available</ThemedText>
                  <ThemedText style={styles.modalEmptySubtext}>
                    Create presets in the Presets tab first
                  </ThemedText>
                </View>
              ) : (
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {presets.map((preset) => (
                    <TouchableOpacity
                      key={preset.$id}
                      style={styles.presetItem}
                      onPress={() => handleLoadPreset(preset)}
                    >
                      <ThemedText style={styles.presetName}>{preset.name}</ThemedText>
                      <ThemedText style={styles.presetInfo}>
                        {preset.daySlots?.length || 0} schedule group(s)
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </LinearGradient>
          </View>
        </Modal>
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
  timelineContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 70,
    alignItems: 'center',
    paddingTop: 12,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: Colors.text,
  },
  timeConnector: {
    width: 2,
    height: 50,
    backgroundColor: 'rgba(200, 162, 200, 0.4)',
    marginVertical: 6,
    borderRadius: 1,
  },
  activityColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.25)',
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  activityCardNested: {
    marginTop: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activityName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
  },
  breakItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  breakTimeColumn: {
    width: 70,
    alignItems: 'center',
    paddingTop: 12,
  },
  breakConnector: {
    width: 2,
    height: 50,
    backgroundColor: 'rgba(200, 162, 200, 0.2)',
    marginVertical: 6,
    borderRadius: 1,
    borderStyle: 'dashed',
  },
  breakColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  breakCard: {
    backgroundColor: 'rgba(200, 162, 200, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.3)',
    borderStyle: 'dashed',
  },
  breakText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    height: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  modalEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalEmptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.text,
    marginBottom: 4,
  },
  modalEmptySubtext: {
    fontSize: 13,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  presetItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.2)',
  },
  presetName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
    marginBottom: 4,
  },
  presetInfo: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
});
