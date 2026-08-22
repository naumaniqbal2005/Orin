let Notifications = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;

  // Configure notification behavior for local notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  console.warn(
    'expo-notifications not available in Expo Go. Local notifications require a development build.',
  );
}

export const notificationService = {
  // Check if notifications are available
  isAvailable() {
    return notificationsAvailable;
  },

  // Request notification permissions
  async requestPermissions() {
    if (!notificationsAvailable) return false;

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

    // Parse the start time (format: "HH:MM")
    const [hours, minutes] = startTime.split(':');

    // Create the trigger date for today
    const triggerDate = new Date(date);
    triggerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If the time has already passed today, schedule for tomorrow
    const now = new Date();
    if (triggerDate < now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const trigger = new Date(triggerDate);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Activity Starting',
        body: activityName,
        data: { activityName, startTime },
        sound: true,
      },
      trigger,
    });

    return notificationId;
  },

  // Schedule all notifications for a day's activities
  async scheduleDayNotifications(activities, timings, date) {
    if (!notificationsAvailable) {
      console.warn('Notifications not available - skipping all notifications');
      return [];
    }

    const notificationIds = [];

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

  // Get all scheduled notifications
  async getAllScheduledNotifications() {
    if (!notificationsAvailable) return [];
    return await Notifications.getAllScheduledNotificationsAsync();
  },
};
