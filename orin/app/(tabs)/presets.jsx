import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import {
  LayoutGrid,
  Plus,
  Folder,
  Star,
  X,
  Clock,
  Trash2,
  ChevronLeft,
  Calendar,
  Sparkles,
  Copy,
  Check
} from 'lucide-react-native';
import { Colors } from '../../constants/color';
import { presetsService } from '../../lib/presets';
import { activitiesService } from '../../lib/activities';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const DAYS_SHORT = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun'
};

const DEFAULT_ACTIVITIES = [
  { $id: 'default_1', name: 'Exercise', description: 'Gym, running, or working out' },
  { $id: 'default_2', name: 'Breakfast', description: 'Healthy morning meal' },
  { $id: 'default_3', name: 'Work', description: 'Job, study, or project focus' },
  { $id: 'default_4', name: 'Lunch', description: 'Midday meal break' },
  { $id: 'default_5', name: 'Yoga', description: 'Stretching or mindfulness' },
  { $id: 'default_6', name: 'Reading', description: 'Books, articles, or learning' },
  { $id: 'default_7', name: 'Dinner', description: 'Evening meal and relaxation' },
  { $id: 'default_8', name: 'Sleep', description: 'Night rest or wind down' }
];

function createTimeDate(hours, minutes) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function parseTimeString(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return createTimeDate(hours, minutes);
}

function formatTimeString(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTimeDisplay(timeStr) {
  const date = parseTimeString(timeStr);
  if (!date) return 'Not set';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function Presets() {
  /* const [presets, setPresets] = useState([
     { id: 1, name: 'Morning Routine', icon: 'sun', activities: 5 },
     { id: 2, name: 'Work Day', icon: 'briefcase', activities: 8 },
     { id: 3, name: 'Evening Wind Down', icon: 'moon', activities: 4 },
   ]);
   */
  //the presets are weekly, so well use activities already presnet in the activities tab to select those for the presets
  //and select appropiate time for each bw wakeuptime and sleeptime
  //declate react hooks which are going to be used throughout

  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availableActivities, setAvailableActivities] = useState([]);

  // Preset Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState(null); // null if creating
  const [presetName, setPresetName] = useState('');
  
  // Day-by-Day schedule state
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [weeklySchedule, setWeeklySchedule] = useState({
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': [],
    'Sunday': []
  });

  // Time & Activity Picker state
  const [activeTimePicker, setActiveTimePicker] = useState(null); // { day, slotIndex, type: 'start' | 'end' }
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // { day, slotIndex }

  // Copy Schedule state
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyTargetDays, setCopyTargetDays] = useState([]);

  useEffect(() => {
    loadPresets();
    loadActivities();
  }, []);

  const loadPresets = async () => {
    try {
      const results = await presetsService.list();
      setPresets(results.rows || results.documents || []);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load presets. Please check your connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadActivities = async () => {
    try {
      const result = await activitiesService.list();
      
      let list = [];
      if (Array.isArray(result)) {
        list = result;
      } else if (result && Array.isArray(result.rows)) {
        list = result.rows;
      } else if (result && Array.isArray(result.documents)) {
        list = result.documents;
      }
      
      setAvailableActivities(list);
    } catch (error) {
      setAvailableActivities([]); // Ensure empty array on error
    }
  };

  const getActivitiesList = () => {
    return availableActivities.length > 0 ? availableActivities : DEFAULT_ACTIVITIES;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPresets();
    loadActivities();
  }, []);

  const createEmptySlot = () => ({
    id: `${Date.now()}_slot_${Math.random()}`,
    activityName: '',
    start_time: '08:00',
    end_time: '09:00'
  });

  // Initialize a new preset creation flow
  const handleAddNewPreset = () => {
    setEditingPresetId(null);
    setPresetName('');
    
    const initial = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day] = [createEmptySlot()];
    });
    
    setWeeklySchedule(initial);
    setSelectedDay('Monday');
    setIsEditing(true);
  };

  // Populate editor with existing preset details
  const handleEditPreset = (preset) => {
    setEditingPresetId(preset.$id);
    setPresetName(preset.name);

    const initial = {
      'Monday': [],
      'Tuesday': [],
      'Wednesday': [],
      'Thursday': [],
      'Friday': [],
      'Saturday': [],
      'Sunday': []
    };

    if (preset.daySlots && preset.daySlots.length > 0) {
      for (let i = 0; i < preset.daySlots.length; i++) {
        const days = preset.daySlots[i] || [];
        const actList = preset.activities[i] || [];
        const timeList = preset.timings[i] || [];

        const slots = [];
        const maxSlots = Math.max(actList.length, timeList.length);
        for (let j = 0; j < maxSlots; j++) {
          const timing = timeList[j] || {};
          slots.push({
            id: `${Date.now()}_group_${i}_slot_${j}_${Math.random()}`,
            activityName: actList[j] || '',
            start_time: timing.start_time || '08:00',
            end_time: timing.end_time || '09:00'
          });
        }

        days.forEach(day => {
          if (DAYS_OF_WEEK.includes(day)) {
            // Deep copy slots to avoid reference sharing
            initial[day] = slots.map(s => ({ ...s, id: `${Date.now()}_slot_${Math.random()}` }));
          }
        });
      }
    }

    // Ensure all days have at least one slot
    DAYS_OF_WEEK.forEach(day => {
      if (initial[day].length === 0) {
        initial[day] = [createEmptySlot()];
      }
    });

    setWeeklySchedule(initial);
    setSelectedDay('Monday');
    setIsEditing(true);
  };

  // Slots Actions
  const addSlotToCurrentDay = () => {
    const newSchedule = { ...weeklySchedule };
    newSchedule[selectedDay] = [...newSchedule[selectedDay], createEmptySlot()];
    setWeeklySchedule(newSchedule);
  };

  const removeSlotFromCurrentDay = (slotIndex) => {
    const newSchedule = { ...weeklySchedule };
    const slots = [...newSchedule[selectedDay]];
    slots.splice(slotIndex, 1);
    
    if (slots.length === 0) {
      slots.push(createEmptySlot());
    }
    
    newSchedule[selectedDay] = slots;
    setWeeklySchedule(newSchedule);
  };

  // Copy Schedule Flow
  const handleOpenCopyModal = () => {
    setCopyTargetDays([]);
    setCopyModalVisible(true);
  };

  const toggleCopyTargetDay = (day) => {
    if (copyTargetDays.includes(day)) {
      setCopyTargetDays(copyTargetDays.filter(d => d !== day));
    } else {
      setCopyTargetDays([...copyTargetDays, day]);
    }
  };

  const handleConfirmCopy = () => {
    if (copyTargetDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day to copy to.');
      return;
    }

    const currentSlots = weeklySchedule[selectedDay] || [];
    const newSchedule = { ...weeklySchedule };
    
    copyTargetDays.forEach(day => {
      // Deep copy slots with fresh IDs
      newSchedule[day] = currentSlots.map(slot => ({
        ...slot,
        id: `${Date.now()}_slot_${Math.random()}`
      }));
    });
    
    setWeeklySchedule(newSchedule);
    setCopyModalVisible(false);
    Alert.alert('Copied!', `Schedule copied from ${selectedDay} to: ${copyTargetDays.map(d => DAYS_SHORT[d]).join(', ')}.`);
  };

  // Save Flow with Automatic Grouping
  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      Alert.alert('Error', 'Please enter a preset name.');
      return;
    }

    // Check if at least one activity is selected in the entire week
    let hasAnyActivities = false;
    for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
      const day = DAYS_OF_WEEK[i];
      const slots = weeklySchedule[day] || [];
      if (slots.some(s => s.activityName)) {
        hasAnyActivities = true;
        break;
      }
    }
    if (!hasAnyActivities) {
      Alert.alert('Error', 'Please configure at least one activity slot in your weekly schedule.');
      return;
    }

    // Automatically group identical valid schedules
    const groups = []; // will contain { signature, days: [], activities: [], timings: [] }
    
    DAYS_OF_WEEK.forEach(day => {
      const slots = weeklySchedule[day] || [];
      const validSlots = slots.filter(s => s.activityName);
      
      if (validSlots.length === 0) return; // Skip empty days

      // Sort slots by start_time to ensure consistent comparison signature
      const sortedSlots = [...validSlots].sort((a, b) => a.start_time.localeCompare(b.start_time));
      
      const signature = JSON.stringify(sortedSlots.map(s => ({
        activityName: s.activityName,
        start_time: s.start_time,
        end_time: s.end_time
      })));

      const existingGroup = groups.find(g => g.signature === signature);
      if (existingGroup) {
        existingGroup.days.push(day);
      } else {
        groups.push({
          signature,
          days: [day],
          activities: sortedSlots.map(s => s.activityName),
          timings: sortedSlots.map(s => ({ start_time: s.start_time, end_time: s.end_time }))
        });
      }
    });

    const daySlots = groups.map(g => g.days);
    const activities = groups.map(g => g.activities);
    const timings = groups.map(g => g.timings);

    try {
      setLoading(true);
      if (editingPresetId) {
        await presetsService.update(editingPresetId, {
          name: presetName,
          daySlots,
          activities,
          timings
        });
      } else {
        await presetsService.create({
          name: presetName,
          daySlots,
          activities,
          timings
        });
      }
      console.log(weeklySchedule);
      setIsEditing(false);
      loadPresets();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preset. Please try again.');
      setLoading(false);
    }
  };

  // Delete Flow
  const handleDeletePreset = async () => {
    if (!editingPresetId) return;

    Alert.alert(
      'Delete Preset',
      'Are you sure you want to delete this preset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await presetsService.delete(editingPresetId);
              setIsEditing(false);
              loadPresets();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete preset. Please try again.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Helper to compute activity count for list item card
  const getTotalActivities = (preset) => {
    if (!preset.activities) return 0;
    return preset.activities.reduce((sum, list) => sum + (list ? list.length : 0), 0);
  };

  // Check if a day has configured activities
  const hasActivitiesConfigured = (day) => {
    const slots = weeklySchedule[day] || [];
    return slots.some(s => s.activityName !== '');
  };

  // Renders a preview summary of days & activities inside cards
  const renderPresetPreview = (preset) => {
    if (!preset.daySlots || preset.daySlots.length === 0) return null;
    return preset.daySlots.map((days, idx) => {
      const dayNames = days.map(d => DAYS_SHORT[d] || d).join(', ');
      const activityNames = preset.activities[idx] ? preset.activities[idx].slice(0, 3).join(', ') : '';
      const hasMore = preset.activities[idx] && preset.activities[idx].length > 3 ? '...' : '';
      return (
        <View key={idx} style={styles.previewRow}>
          <ThemedText style={styles.previewDays}>{dayNames}:</ThemedText>
          <ThemedText style={styles.previewActivities} numberOfLines={1}>
            {activityNames || 'No activities'}{hasMore}
          </ThemedText>
        </View>
      );
    });
  };

  // View 1: Preset Listing
  const renderPresetList = () => {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <LayoutGrid size={28} color={Colors.iconColour} strokeWidth={2} />
            <ThemedText title style={styles.header}>Presets</ThemedText>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNewPreset}>
            <Plus size={24} color={Colors.iconColour} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.iconColour]}
              tintColor={Colors.iconColour}
            />
          }
        >
          {presets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <LayoutGrid size={48} color={Colors.iconColour} strokeWidth={1.5} />
              </View>
              <ThemedText style={styles.emptyText}>Create your first preset</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Save your weekly schedules as presets for quick access
              </ThemedText>
            </View>
          ) : (
            <View style={styles.presetsVerticalList}>
              {presets.map((preset, index) => (
                <TouchableOpacity
                  key={preset.$id}
                  style={[
                    styles.presetRowCard,
                    { backgroundColor: index % 2 === 0 ? Colors.cardBackground : 'rgba(255, 255, 255, 0.4)' }
                  ]}
                  onPress={() => handleEditPreset(preset)}
                >
                  <View style={styles.presetCardHeader}>
                    <View style={styles.presetTitleLayout}>
                      <Folder size={24} color={Colors.iconColour} strokeWidth={1.5} style={styles.folderIcon} />
                      <ThemedText title style={styles.presetName}>{preset.name}</ThemedText>
                    </View>
                    <View style={styles.activitiesCountBadge}>
                      <ThemedText style={styles.badgeText}>
                        {getTotalActivities(preset)} act
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.previewContainer}>
                    {renderPresetPreview(preset)}
                  </View>

                  <View style={styles.starContainer}>
                    <Star size={16} color={Colors.iconColour} strokeWidth={1.5} fill={Colors.iconColour} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  };

  // View 2: Preset Creator/Editor (Day-by-Day View)
  const renderPresetEditor = () => {
    const currentSlots = weeklySchedule[selectedDay] || [];

    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Editor Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setIsEditing(false)}>
            <ChevronLeft size={24} color={Colors.iconColour} strokeWidth={2} />
          </TouchableOpacity>
          <ThemedText title style={styles.editorHeaderTitle}>
            {editingPresetId ? 'Edit Preset' : 'New Preset'}
          </ThemedText>
          <TouchableOpacity style={styles.saveHeaderButton} onPress={handleSavePreset}>
            <ThemedText title style={styles.saveHeaderText}>Save</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Preset Name Input */}
          <View style={styles.nameInputContainer}>
            <ThemedText style={styles.inputLabel}>Preset Name</ThemedText>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Normal Week, Exam Mode..."
              placeholderTextColor={Colors.text}
              value={presetName}
              onChangeText={setPresetName}
              color={Colors.text}
            />
          </View>

          {/* Horizontal Day Tabs */}
          <View style={styles.dayTabsContainer}>
            {DAYS_OF_WEEK.map(day => {
              const isActive = selectedDay === day;
              const hasConfig = hasActivitiesConfigured(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayTabChip, isActive && styles.dayTabChipActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <ThemedText style={[styles.dayTabChipText, isActive && styles.dayTabChipTextActive]}>
                    {DAYS_SHORT[day]}
                  </ThemedText>
                  {hasConfig && (
                    <View style={[styles.dayTabDot, isActive && styles.dayTabDotActive]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Day Section */}
          <View style={styles.activeDayContainer}>
            <View style={styles.activeDayHeader}>
              <View style={styles.activeDayTitleContainer}>
                <Calendar size={18} color={Colors.iconColour} />
                <ThemedText title style={styles.activeDayTitle}>
                  {selectedDay} Schedule
                </ThemedText>
              </View>
              
              <TouchableOpacity style={styles.copyScheduleBtn} onPress={handleOpenCopyModal}>
                <Copy size={14} color={Colors.secondaryText} />
                <ThemedText style={styles.copyScheduleBtnText}>Copy To...</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Activities Timeline List */}
            <View style={styles.slotsContainer}>
              {/* Vertical connecting line */}
              {currentSlots.length > 1 && <View style={styles.timelineLine} />}

              {currentSlots.map((slot, index) => (
                <View key={slot.id} style={styles.slotRow}>
                  <View style={styles.timelineNode} />

                  {/* Time Picker Buttons */}
                  <View style={styles.timeButtonsContainer}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setActiveTimePicker({ day: selectedDay, slotIndex: index, type: 'start' })}
                    >
                      <Clock size={14} color={Colors.iconColour} style={styles.slotIcon} />
                      <ThemedText style={styles.timeButtonText}>
                        {formatTimeDisplay(slot.start_time)}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setActiveTimePicker({ day: selectedDay, slotIndex: index, type: 'end' })}
                    >
                      <Clock size={14} color={Colors.iconColour} style={styles.slotIcon} />
                      <ThemedText style={styles.timeButtonText}>
                        {formatTimeDisplay(slot.end_time)}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* Activity Selector Button */}
                  <TouchableOpacity
                    style={styles.activitySelectorBtn}
                    onPress={() => {
                      setActiveSlot({ day: selectedDay, slotIndex: index });
                      setActivityModalVisible(true);
                      loadActivities(); // Reload to get fresh activities
                    }}
                  >
                    <Sparkles size={14} color={Colors.iconColour} style={styles.slotIcon} />
                    <ThemedText
                      style={[
                        styles.activitySelectorText,
                        !slot.activityName && styles.activityPlaceholder
                      ]}
                      numberOfLines={1}
                    >
                      {slot.activityName || 'Select Activity'}
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Remove slot btn */}
                  <TouchableOpacity
                    style={styles.removeSlotBtn}
                    onPress={() => removeSlotFromCurrentDay(index)}
                  >
                    <X size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add Activity Button */}
            <TouchableOpacity
              style={styles.addSlotBtn}
              onPress={addSlotToCurrentDay}
            >
              <Plus size={16} color={Colors.iconColour} strokeWidth={2.5} />
              <ThemedText style={styles.addSlotText}>Add Activity</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Delete Preset Button */}
          {editingPresetId && (
            <TouchableOpacity style={styles.deletePresetBtn} onPress={handleDeletePreset}>
              <Trash2 size={18} color="#FF4D4D" style={styles.deletePresetIcon} />
              <ThemedText style={styles.deletePresetText}>Delete Preset</ThemedText>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Dynamic Time Picker */}
        {activeTimePicker && (
          <DateTimePicker
            value={
              parseTimeString(
                activeTimePicker.type === 'start'
                  ? weeklySchedule[activeTimePicker.day][activeTimePicker.slotIndex].start_time
                  : weeklySchedule[activeTimePicker.day][activeTimePicker.slotIndex].end_time
              ) || new Date()
            }
            mode="time"
            onChange={handleTimeChange}
          />
        )}
      </SafeAreaView>
    );
  };

  const handleTimeChange = (event, date) => {
    setActiveTimePicker(null);
    if (event.type === 'dismissed' || !date || !activeTimePicker) return;
    const timeStr = formatTimeString(date);
    setWeeklySchedule(prev => {
      const newSchedule = { ...prev };
      const daySlots = [...(newSchedule[activeTimePicker.day] || [])];
      const timeField = activeTimePicker.type === 'start' ? 'start_time' : 'end_time';
      daySlots[activeTimePicker.slotIndex] = {
        ...daySlots[activeTimePicker.slotIndex],
        [timeField]: timeStr
      };
      newSchedule[activeTimePicker.day] = daySlots;
      return newSchedule;
    });
  };

  if (loading && presets.length === 0) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.gradientContainer}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.iconColour} />
          <ThemedText style={styles.loadingText}>Loading presets...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientContainer}
    >
      {isEditing ? renderPresetEditor() : renderPresetList()}

      {/* Activity Selection Modal */}
      <Modal
        visible={activityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActivityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={[Colors.pastelPurpleStart, Colors.pastelPurpleEnd]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <ThemedText title style={styles.modalTitle}>
                Select Activity
              </ThemedText>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setActivityModalVisible(false)}
              >
                <X size={20} color={Colors.iconColour} />
              </TouchableOpacity>
            </View>

            {availableActivities.length === 0 && (
              <ThemedText style={styles.suggestionsAlert}>
                Showing suggestions. Create custom ones in the Activities tab.
              </ThemedText>
            )}

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {getActivitiesList().map((activity) => (
                <TouchableOpacity
                  key={activity.$id}
                  style={styles.activitySelectionItem}
                  onPress={() => {
                    if (activeSlot) {
                      setWeeklySchedule(prev => {
                        const newSchedule = { ...prev };
                        const daySlots = [...(newSchedule[activeSlot.day] || [])];
                        daySlots[activeSlot.slotIndex] = {
                          ...daySlots[activeSlot.slotIndex],
                          activityName: activity.name
                        };
                        newSchedule[activeSlot.day] = daySlots;
                        return newSchedule;
                      });
                    }
                    setActivityModalVisible(false);
                  }}
                >
                  <ThemedText title style={styles.activitySelectionName}>
                    {activity.name}
                  </ThemedText>
                  {activity.description ? (
                    <ThemedText style={styles.activitySelectionDesc} numberOfLines={1}>
                      {activity.description}
                    </ThemedText>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      {/* Copy Schedule Target Days Selector Modal */}
      <Modal
        visible={copyModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCopyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={[Colors.pastelPurpleStart, Colors.pastelPurpleEnd]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <ThemedText title style={styles.modalTitle}>
                Copy {selectedDay}'s Schedule
              </ThemedText>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setCopyModalVisible(false)}
              >
                <X size={20} color={Colors.iconColour} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.copyModalSubtitle}>
              Select the days you want to copy this schedule to:
            </ThemedText>

            <ScrollView style={styles.copyDaysScroll} showsVerticalScrollIndicator={false}>
              {DAYS_OF_WEEK.filter(day => day !== selectedDay).map(day => {
                const isSelected = copyTargetDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.copyDayRow, isSelected && styles.copyDayRowActive]}
                    onPress={() => toggleCopyTargetDay(day)}
                  >
                    <ThemedText title style={styles.copyDayName}>
                      {day}
                    </ThemedText>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Check size={14} color={Colors.white} strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.copyActionsRow}>
              <TouchableOpacity
                style={[styles.copyBtn, styles.copyCancelBtn]}
                onPress={() => setCopyModalVisible(false)}
              >
                <ThemedText style={styles.copyBtnText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.copyBtn, styles.copyConfirmBtn]}
                onPress={handleConfirmCopy}
              >
                <ThemedText style={[styles.copyBtnText, styles.copyConfirmBtnText]}>
                  Copy Schedule
                </ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  suggestionsAlert: {
    fontSize: 12,
    color: Colors.secondaryText,
    backgroundColor: 'rgba(200, 162, 200, 0.15)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-Medium',
  },
  safeArea: {
    flex: 1,
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  editorHeaderTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  saveHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.softLavender,
  },
  saveHeaderText: {
    color: Colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
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
  presetsVerticalList: {
    flexDirection: 'column',
    gap: 16,
  },
  presetRowCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.softLavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  presetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetTitleLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  folderIcon: {
    marginTop: -2,
  },
  presetName: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
  },
  activitiesCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 162, 200, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: Colors.title,
    fontFamily: 'Poppins-Medium',
  },
  previewContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 162, 200, 0.15)',
    paddingTop: 10,
    gap: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewDays: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: Colors.secondaryText,
    minWidth: 80,
  },
  previewActivities: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  starContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    opacity: 0.3,
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
  nameInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.2)',
  },
  dayTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayTabChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.2)',
    position: 'relative',
  },
  dayTabChipActive: {
    backgroundColor: Colors.softLavender,
    borderColor: Colors.softLavender,
  },
  dayTabChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.text,
  },
  dayTabChipTextActive: {
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
  },
  dayTabDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.softLavender,
  },
  dayTabDotActive: {
    backgroundColor: Colors.white,
  },
  activeDayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
  },
  activeDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 162, 200, 0.15)',
    paddingBottom: 12,
  },
  activeDayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDayTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  copyScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 162, 200, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  copyScheduleBtnText: {
    fontSize: 12,
    color: Colors.secondaryText,
    fontFamily: 'Poppins-Medium',
  },
  slotsContainer: {
    position: 'relative',
    paddingLeft: 24,
    marginBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 14,
    bottom: 14,
    width: 2,
    backgroundColor: 'rgba(200, 162, 200, 0.25)',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    gap: 8,
  },
  timelineNode: {
    position: 'absolute',
    left: -22,
    top: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.softLavender,
  },
  slotIcon: {
    marginRight: 4,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.2)',
    minWidth: 85,
  },
  timeButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.text,
  },
  activitySelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.2)',
  },
  activitySelectorText: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  activityPlaceholder: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  removeSlotBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.softLavender,
    gap: 6,
  },
  addSlotText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: Colors.secondaryText,
  },
  deletePresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
  },
  deletePresetText: {
    color: '#FF4D4D',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  deletePresetIcon: {
    marginTop: -2,
  },
  bottomSpacer: {
    height: 100,
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
  activitySelectionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.2)',
  },
  activitySelectionName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
    marginBottom: 4,
  },
  activitySelectionDesc: {
    fontSize: 13,
    color: Colors.text,
  },
  copyModalSubtitle: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
    marginBottom: 16,
  },
  copyDaysScroll: {
    maxHeight: 250,
    marginBottom: 20,
  },
  copyDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(200, 162, 200, 0.15)',
  },
  copyDayRowActive: {
    borderColor: Colors.softLavender,
    backgroundColor: 'rgba(200, 162, 200, 0.1)',
  },
  copyDayName: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.softLavender,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.softLavender,
  },
  copyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  copyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyCancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  copyConfirmBtn: {
    backgroundColor: Colors.softLavender,
  },
  copyBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  copyConfirmBtnText: {
    color: Colors.white,
  },
});
