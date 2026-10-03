import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import Timeline from '../../app/(tabs)/timeline';
import { userService } from '../user';
import { presetsService } from '../presets';
import { FocusProvider } from 'expo-router';
import { notificationService } from '../notifications';

jest.mock('expo-router', () => {
  const React = require('react');
  const FocusContext = React.createContext(true);
  return {
    FocusProvider: FocusContext.Provider,
    useFocusEffect: (callback) => {
      const focused = React.useContext(FocusContext);
      React.useEffect(() => (focused ? callback() : undefined), [callback, focused]);
    },
  };
});

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
  jest.resetAllMocks();
  notificationService.cancelActivityNotifications.mockResolvedValue();
  notificationService.cancelNotifications.mockResolvedValue();
  notificationService.scheduleDayNotifications.mockResolvedValue([]);
  userService.get.mockResolvedValue({ activePresetId: null });
  userService.update.mockResolvedValue({ activePresetId: 'saved' });
  presetsService.get.mockResolvedValue(preset);
  presetsService.list.mockResolvedValue({ rows: [preset] });
});

test('returning to Timeline clears a deleted active preset and its reminders', async () => {
  userService.get.mockResolvedValue({ activePresetId: 'saved' });
  const view = await render(
    <FocusProvider value={true}>
      <Timeline />
    </FocusProvider>,
  );
  await waitFor(() => expect(screen.getByText('Saved routine')).toBeTruthy());
  await view.rerender(
    <FocusProvider value={false}>
      <Timeline />
    </FocusProvider>,
  );
  userService.get.mockResolvedValue({ activePresetId: null });
  notificationService.cancelActivityNotifications.mockClear();
  await view.rerender(
    <FocusProvider value={true}>
      <Timeline />
    </FocusProvider>,
  );
  await waitFor(() => expect(screen.getByText('Load preset')).toBeTruthy());
  expect(screen.queryByText('Saved routine')).toBeNull();
  expect(screen.getByText('No activities scheduled')).toBeTruthy();
  await waitFor(() => expect(notificationService.cancelActivityNotifications).toHaveBeenCalled());
});

test.each(['row_not_found', 'document_not_found'])(
  'a dangling active preset is cleared for %s without a restore error',
  async (type) => {
    userService.get.mockResolvedValue({ activePresetId: 'deleted' });
    presetsService.get.mockRejectedValue({ type, code: 404 });
    await render(<Timeline />);
    await waitFor(() => expect(screen.queryByText('Loading your last preset...')).toBeNull());
    expect(userService.update).toHaveBeenCalledWith({ activePresetId: null });
    expect(screen.getByText('No activities scheduled')).toBeTruthy();
    expect(screen.queryByText('Retry loading preset')).toBeNull();
  },
);

test('a table error does not erase the saved preset selection', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  userService.get.mockResolvedValue({ activePresetId: 'saved' });
  presetsService.get.mockRejectedValue({ type: 'table_not_found', code: 404 });
  try {
    await render(<Timeline />);
    await waitFor(() => expect(screen.getByText('Retry loading preset')).toBeTruthy());
    expect(userService.update).not.toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
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
