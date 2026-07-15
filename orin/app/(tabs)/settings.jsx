import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useState } from 'react';
import ThemedText from '../../components/ThemedText';
import { userService } from '../../lib/user';
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react-native';
import { Colors } from '../../constants/color';

const DEFAULT_WAKEUP = { hours: 7, minutes: 0 };
const DEFAULT_SLEEP = { hours: 22, minutes: 0 };

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

export default function Settings() {
  const router = useRouter();
  const [wakeupDate, setWakeupDate] = useState(() =>
    createTimeDate(DEFAULT_WAKEUP.hours, DEFAULT_WAKEUP.minutes)
  );
  const [sleepDate, setSleepDate] = useState(() =>
    createTimeDate(DEFAULT_SLEEP.hours, DEFAULT_SLEEP.minutes)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePicker, setActivePicker] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      const profile = await userService.get();
      const wakeup = parseTimeString(profile.wakeup_time);
      const sleep = parseTimeString(profile.sleep_time);
      if (wakeup) setWakeupDate(wakeup);
      if (sleep) setSleepDate(sleep);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handlePickerChange = (type, event, selectedDate) => {
      setActivePicker(null);

    if (event.type === 'dismissed' || !selectedDate) return;
    if (type === 'wakeup') setWakeupDate(selectedDate);
    if (type === 'sleep') setSleepDate(selectedDate);
  };

  const handleSave = async () => {
    const wakeup_time = formatTimeString(wakeupDate);
    const sleep_time = formatTimeString(sleepDate);

    setSaving(true);
    try {
      try {
        await userService.update({ wakeup_time, sleep_time });
      } catch {
        await userService.create({ wakeup_time, sleep_time });
      }
      Alert.alert('Saved', 'Your schedule preferences have been updated.');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Could not save your settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.iconColour} strokeWidth={2} />
            </TouchableOpacity>
            <ThemedText title style={styles.title}>
              Settings
            </ThemedText>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.iconColour} />
              <ThemedText style={styles.loadingText}>Loading settings...</ThemedText>
            </View>
          ) : (
            <>
              <ThemedText style={styles.subtitle}>
                Set your daily wake-up and sleep times. These are used to shape your schedule.
              </ThemedText>

              <View style={styles.settingsCard}>
                <TouchableOpacity
                  style={styles.timeRow}
                  onPress={() => setActivePicker('wakeup')}
                >
                  <View style={[styles.timeIconContainer, styles.wakeupIcon]}>
                    <Sun size={22} color={Colors.iconColour} strokeWidth={1.5} />
                  </View>
                  <View style={styles.timeInfo}>
                    <ThemedText style={styles.timeLabel}>Wake up</ThemedText>
                    <ThemedText title style={styles.timeValue}>
                      {formatTimeDisplay(formatTimeString(wakeupDate))}
                    </ThemedText>
                  </View>
                  <ChevronRight size={20} color={Colors.iconColour} strokeWidth={1.5} />
                </TouchableOpacity>

                <View style={styles.timeDivider} />

                <TouchableOpacity
                  style={styles.timeRow}
                  onPress={() => setActivePicker('sleep')}
                >
                  <View style={[styles.timeIconContainer, styles.sleepIcon]}>
                    <Moon size={22} color={Colors.iconColour} strokeWidth={1.5} />
                  </View>
                  <View style={styles.timeInfo}>
                    <ThemedText style={styles.timeLabel}>Sleep</ThemedText>
                    <ThemedText title style={styles.timeValue}>
                      {formatTimeDisplay(formatTimeString(sleepDate))}
                    </ThemedText>
                  </View>
                  <ChevronRight size={20} color={Colors.iconColour} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>

              {activePicker === 'wakeup' && (
                <DateTimePicker
                  value={wakeupDate}
                  mode="time"
                  onChange={(event, date) => handlePickerChange('wakeup', event, date)}
                />
              )}

              {activePicker === 'sleep' && (
                <DateTimePicker
                  value={sleepDate}
                  mode="time"
                  onChange={(event, date) => handlePickerChange('sleep', event, date)}
                />
              )}

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.title} />
                ) : (
                  <Text style={styles.saveButtonText}>Save changes</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.bottomSpacer} />
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.title,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  settingsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  timeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  wakeupIcon: {
    backgroundColor: 'rgba(255, 229, 217, 0.8)',
  },
  sleepIcon: {
    backgroundColor: 'rgba(230, 230, 250, 0.9)',
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.secondaryText,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: Colors.title,
  },
  timeDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 12,
  },
  saveButton: {
    backgroundColor: Colors.softLavender,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.title,
  },
  bottomSpacer: {
    height: 40,
  },
});
