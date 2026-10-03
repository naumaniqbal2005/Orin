import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from '../notifications';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(Platform, 'OS', 'android');
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
  Notifications.scheduleNotificationAsync.mockResolvedValue('reminder-id');
  Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
});
afterEach(() => jest.restoreAllMocks());

function futureDay() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date;
}

test('sends an explicit date trigger and Android channel to Expo', async () => {
  const date = futureDay();
  const expected = new Date(date);
  expected.setHours(9, 30, 0, 0);
  await expect(notificationService.scheduleNotification('Test', '09:30', date)).resolves.toBe(
    'reminder-id',
  );
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      trigger: { type: 'date', date: expected.getTime(), channelId: 'activity-reminders' },
    }),
  );
  expect(Notifications.setNotificationChannelAsync.mock.invocationCallOrder[0]).toBeLessThan(
    Notifications.getPermissionsAsync.mock.invocationCallOrder[0],
  );
  expect(Notifications.setNotificationChannelAsync.mock.calls[0][1]).not.toHaveProperty('sound');
});

test('refresh cleanup cancels only Orin activity reminders, preserving other notifications', async () => {
  Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
    { identifier: 'old-activity', content: { data: { source: 'orin-activity-start' } } },
    { identifier: 'nightly', content: { data: { source: 'nightly-reflection' } } },
  ]);
  await notificationService.cancelActivityNotifications();
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-activity');
});

test('past activity times are skipped rather than shifted to a different day', async () => {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  await expect(notificationService.scheduleNotification('Past', '09:30', date)).resolves.toBeNull();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('denied permission never schedules a reminder', async () => {
  Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
  Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
  await expect(
    notificationService.scheduleNotification('Test', '09:30', futureDay()),
  ).resolves.toBeNull();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('a failed batch cancels already registered reminders and propagates the error', async () => {
  Notifications.scheduleNotificationAsync
    .mockResolvedValueOnce('first')
    .mockRejectedValueOnce(new Error('Native failure'));
  await expect(
    notificationService.scheduleDayNotifications(
      ['A', 'B'],
      [{ start_time: '09:30' }, { start_time: '10:30' }],
      futureDay(),
    ),
  ).rejects.toThrow('Native failure');
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('first');
});
