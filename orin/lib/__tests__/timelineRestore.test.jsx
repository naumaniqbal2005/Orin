import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import Timeline from '../../app/(tabs)/timeline';
import { userService } from '../user';
import { presetsService } from '../presets';

jest.mock('../user', () => ({ userService: { get: jest.fn(), update: jest.fn() } }));
jest.mock('../presets', () => ({ presetsService: { get: jest.fn(), list: jest.fn() } }));
jest.mock('../notifications', () => ({
  notificationService: {
    cancelActivityNotifications: jest.fn(async () => {}),
    cancelNotifications: jest.fn(async () => {}),
    scheduleDayNotifications: jest.fn(async () => []),
  },
}));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
jest.mock('../../components/DateHeader', () => () => null);
jest.mock('lucide-react-native', () => ({
  Calendar: () => null,
  Clock: () => null,
  Plus: () => null,
  X: () => null,
}));

const preset = { $id: 'saved', name: 'Saved routine', daySlots: [], activities: [], timings: [] };
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  jest.clearAllMocks();
  userService.get.mockResolvedValue({ activePresetId: null });
  userService.update.mockResolvedValue({ activePresetId: 'saved' });
  presetsService.get.mockResolvedValue(preset);
  presetsService.list.mockResolvedValue({ rows: [preset] });
});

test('refresh shows loading and restores the exact saved preset without listing all presets', async () => {
  const profile = deferred();
  userService.get.mockReturnValue(profile.promise);
  await render(<Timeline />);
  expect(screen.getByText('Loading your last preset...')).toBeTruthy();
  expect(screen.queryByText('No activities scheduled')).toBeNull();
  await act(async () => profile.resolve({ activePresetId: 'saved' }));
  await waitFor(() => expect(screen.getByText('Change preset')).toBeTruthy());
  expect(screen.getByText('Saved routine')).toBeTruthy();
  expect(presetsService.get).toHaveBeenCalledWith('saved');
  expect(presetsService.list).not.toHaveBeenCalled();
});

test('selection is saved before the picker closes or the selected preset changes', async () => {
  userService.update.mockImplementation(async () => {
    expect(screen.queryByText('Change preset')).toBeNull();
    expect(screen.getByText('Saved routine')).toBeTruthy();
    return { activePresetId: 'saved' };
  });
  await render(<Timeline />);
  await waitFor(() => expect(screen.queryByText('Loading your last preset...')).toBeNull());
  await fireEvent.press(screen.getByText('Load preset'));
  await waitFor(() => expect(screen.getByText('Saved routine')).toBeTruthy());
  await fireEvent.press(screen.getByText('Saved routine'));
  expect(userService.update).toHaveBeenCalledWith({ activePresetId: 'saved' });
  await waitFor(() => expect(screen.getByText('Change preset')).toBeTruthy());
});

test('restore failures offer retry instead of silently presenting an empty day', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  userService.get.mockRejectedValueOnce(new Error('offline'));
  try {
    await render(<Timeline />);
    await waitFor(() => expect(screen.getByText('Retry loading preset')).toBeTruthy());
    userService.get.mockResolvedValue({ activePresetId: 'saved' });
    await fireEvent.press(screen.getByText('Retry loading preset'));
    await waitFor(() => expect(screen.getByText('Change preset')).toBeTruthy());
  } finally {
    log.mockRestore();
  }
});
