import { Platform } from 'react-native';
import { timeToMinute } from './schema';

const CHANNEL_ID = 'activity-reminders';
let Notifications = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;

  // Configure notification behavior for local notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  notificationsAvailable = false;
  console.warn('Could not initialize expo-notifications:', error.message);
}

export const notificationService = {
  // Check if notifications are available
  isAvailable() {
    return notificationsAvailable;
  },

  // Request notification permissions
  async requestPermissions() {
    if (!notificationsAvailable) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Activity reminders',
        importance: Notifications.AndroidImportance.HIGH,
        // Omit custom sound to use Android's system notification sound.
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  // Schedule a notification for an activity
  async scheduleNotification(activityName, startTime, date) {
    if (!notificationsAvailable) {
      console.warn('Notifications not available - skipping notification for:', activityName);
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    const startMinute = timeToMinute(startTime);
    const triggerDate = new Date(date);
    if (!Number.isFinite(triggerDate.getTime())) throw new Error('Invalid notification date.');
    triggerDate.setHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0);

    // A reminder belongs to its selected day; never move past activities to tomorrow.
    if (triggerDate.getTime() <= Date.now()) return null;

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate.getTime(),
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Activity Starting',
        body: activityName,
        data: { activityName, startTime, source: 'orin-activity-start' },
        sound: true,
      },
      trigger,
    });

    // eslint-disable-next-line no-console
    console.log('[notification scheduled]', {
      notificationId,
      activityName,
      scheduledTime: triggerDate.toString(),
    });
    // eslint-disable-next-line no-console
    console.log('[pending notifications]', await Notifications.getAllScheduledNotificationsAsync());
    return notificationId;
  },

  // Schedule all notifications for a day's activities
  async scheduleDayNotifications(activities, timings, date) {
    if (!notificationsAvailable) {
      console.warn('Notifications not available - skipping all notifications');
      return [];
    }

    const notificationIds = [];

    try {
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const timing = timings[i] || {};
        const startTime = timing.start_time;

        if (activity && startTime) {
          const id = await this.scheduleNotification(activity, startTime, date);
          if (id) {
            notificationIds.push(id);
          }
        }
      }
    } catch (error) {
      // Avoid leaving a partial batch behind when a later activity fails.
      await this.cancelNotifications(notificationIds);
      throw error;
    }

    return notificationIds;
  },

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    if (!notificationsAvailable) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Cancel specific notifications by IDs
  async cancelNotifications(notificationIds) {
    if (!notificationsAvailable) return;
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  },

  // Recover activity reminder IDs after a JS refresh without touching other reminders.
  async cancelActivityNotifications() {
    const pending = await this.getAllScheduledNotifications();
    const ids = pending
      .filter((request) => request.content?.data?.source === 'orin-activity-start')
      .map((request) => request.identifier);
    await this.cancelNotifications(ids);
  },

  // Get all scheduled notifications
  async getAllScheduledNotifications() {
    if (!notificationsAvailable) return [];
    return await Notifications.getAllScheduledNotificationsAsync();
  },
};
