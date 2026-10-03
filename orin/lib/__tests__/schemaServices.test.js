import { presetToSlots, hydratePreset } from '../presetMapping';
import { minuteToTime, timeToMinute } from '../schema';
import { userService } from '../user';
import { presetsService } from '../presets';
import { tablesDB } from '../appwrite';
import { executeDataOperation } from '../backend';
import { listAllRows } from '../tableRows';

jest.mock('../appwrite', () => ({
  DATABASE_ID: 'db',
  tablesDB: {
    getRow: jest.fn(),
    createRow: jest.fn(),
    updateRow: jest.fn(),
    deleteRow: jest.fn(),
    listRows: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
  },
}));
jest.mock('../auth', () => ({
  getCurrentUserId: jest.fn(async () => 'owner'),
  userDocumentPermissions: () => ['read("user:owner")'],
}));
jest.mock('../backend', () => ({ executeDataOperation: jest.fn() }));
jest.mock('react-native-appwrite', () => ({
  ID: { unique: () => 'generated' },
  Query: {
    equal: (field, value) => `${field}=${value}`,
    limit: (value) => `limit=${value}`,
    cursorAfter: (value) => `cursor=${value}`,
  },
}));

const preset = {
  name: 'Test week',
  daySlots: [['Monday', 'Sunday']],
  activities: [['Same name', 'Same name']],
  activityIds: [['a', 'b']],
  timings: [
    [
      { start_time: '08:00', end_time: '09:00' },
      { start_time: '23:30', end_time: '00:15' },
    ],
  ],
};

test.each([true, false])(
  'preset deletion clears the profile only when active=%s',
  async (active) => {
    tablesDB.getRow.mockImplementation(async ({ tableId }) =>
      tableId === 'profiles'
        ? { $id: 'owner', activePresetId: active ? 'p' : 'other' }
        : { $id: 'p', userId: 'owner', name: 'Routine' },
    );
    tablesDB.listRows.mockResolvedValue({ rows: [] });
    tablesDB.updateRow.mockClear();
    expect(await presetsService.delete('p')).toEqual({ wasActive: active });
    if (active) {
      expect(tablesDB.updateRow).toHaveBeenCalledWith({
        databaseId: 'db',
        tableId: 'profiles',
        rowId: 'owner',
        data: { activePresetId: null },
        transactionId: 'tx',
      });
    } else {
      expect(tablesDB.updateRow).not.toHaveBeenCalled();
    }
    expect(tablesDB.deleteRow).toHaveBeenCalledWith({
      databaseId: 'db',
      tableId: 'presets',
      rowId: 'p',
      transactionId: 'tx',
    });
    expect(tablesDB.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx', commit: true });
  },
);

beforeEach(() => {
  jest.clearAllMocks();
  tablesDB.createTransaction.mockResolvedValue({ $id: 'tx' });
  tablesDB.updateTransaction.mockResolvedValue({});
});

test('normalizes copied weekdays and overnight slots without confusing duplicate activity names', () => {
  const slots = presetToSlots(preset);
  expect(slots).toHaveLength(4);
  expect(slots[1]).toMatchObject({
    activityId: 'b',
    weekday: 1,
    startMinute: 1410,
    durationMin: 45,
  });
  expect(slots[2].weekday).toBe(0);
  const hydrated = hydratePreset({ $id: 'p' }, slots, [
    { $id: 'a', name: 'Same name' },
    { $id: 'b', name: 'Same name' },
  ]);
  expect(presetToSlots(hydrated)).toEqual([slots[2], slots[3], slots[0], slots[1]]);
  expect(timeToMinute(minuteToTime(420))).toBe(420);
  expect(() => timeToMinute('24:00')).toThrow();
});

test('rejects unsaved activity placeholders and invalid durations before writing', () => {
  expect(() => presetToSlots({ ...preset, activityIds: [['default_1', 'b']] })).toThrow(
    'Create the activity',
  );
  expect(() =>
    presetToSlots({
      ...preset,
      timings: [[{ start_time: '08:00', end_time: '08:00' }, preset.timings[0][1]]],
    }),
  ).toThrow('between');
});

test('missing profiles use the Function; network and table errors never trigger create', async () => {
  tablesDB.getRow.mockRejectedValueOnce({ type: 'row_not_found', code: 404 });
  executeDataOperation.mockResolvedValueOnce({ $id: 'owner', handle: 'Tester' });
  expect(await userService.get()).toMatchObject({ $id: 'owner' });
  expect(executeDataOperation).toHaveBeenCalledWith(
    'profiles.ensure',
    expect.objectContaining({ timeZone: expect.any(String) }),
  );
  tablesDB.getRow.mockRejectedValueOnce({ type: 'table_not_found', code: 404 });
  await expect(userService.get()).rejects.toMatchObject({ type: 'table_not_found' });
  expect(executeDataOperation).toHaveBeenCalledTimes(1);
});

test('profile updates use canonical minute fields and never write legacy columns', async () => {
  tablesDB.getRow.mockResolvedValue({ $id: 'owner' });
  await userService.update({ wakeMinute: 420, activePresetId: 'p' });
  expect(tablesDB.updateRow).toHaveBeenCalledWith({
    databaseId: 'db',
    tableId: 'profiles',
    rowId: 'owner',
    data: { wakeMinute: 420, activePresetId: 'p' },
  });
  await expect(userService.update({ wakeup_time: '07:00' })).rejects.toThrow('Unsupported');
});

test('preset writes target metadata and normalized slot tables in one transaction', async () => {
  tablesDB.listRows.mockImplementation(async ({ tableId }) => ({
    rows: tableId === 'activities' ? [{ $id: 'a' }, { $id: 'b' }] : [],
  }));
  tablesDB.getRow.mockResolvedValue({ $id: 'generated', userId: 'owner', name: 'Test week' });
  await presetsService.create(preset);
  const writes = tablesDB.createRow.mock.calls.map(([request]) => request);
  expect(writes[0]).toMatchObject({
    tableId: 'presets',
    data: { name: 'Test week', userId: 'owner' },
    transactionId: 'tx',
  });
  expect(writes[0].data).not.toHaveProperty('activities');
  expect(writes.slice(1)).toHaveLength(4);
  expect(writes[1]).toMatchObject({
    tableId: 'preset_slots',
    data: { activityId: 'a', presetId: 'generated', userId: 'owner' },
    transactionId: 'tx',
  });
  expect(tablesDB.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx', commit: true });
});

test('a failed slot write rolls back the whole preset', async () => {
  tablesDB.listRows.mockResolvedValue({ rows: [{ $id: 'a' }, { $id: 'b' }] });
  tablesDB.createRow.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('write failed'));
  await expect(presetsService.create(preset)).rejects.toThrow('write failed');
  expect(tablesDB.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx', rollback: true });
  expect(tablesDB.updateTransaction).not.toHaveBeenCalledWith({
    transactionId: 'tx',
    commit: true,
  });
});

test('preset reads continue beyond the first page of slots', async () => {
  const first = Array.from({ length: 100 }, (_, index) => ({ $id: `slot-${index}` }));
  tablesDB.listRows
    .mockResolvedValueOnce({ rows: first })
    .mockResolvedValueOnce({ rows: [{ $id: 'slot-100' }] });
  expect(await listAllRows('preset_slots', ['userId=owner'])).toHaveLength(101);
  expect(tablesDB.listRows.mock.calls[1][0].queries).toContain('cursor=slot-99');
});

test('preset editing replaces its normalized slots and increments the revision atomically', async () => {
  tablesDB.getRow.mockResolvedValue({ $id: 'p', userId: 'owner', name: 'Old', revision: 1 });
  tablesDB.listRows.mockImplementation(async ({ tableId }) => ({
    rows:
      tableId === 'activities'
        ? [{ $id: 'a' }, { $id: 'b' }]
        : [
            {
              $id: 'old-slot',
              presetId: 'p',
              activityId: 'a',
              weekday: 1,
              startMinute: 480,
              durationMin: 30,
              position: 0,
            },
          ],
  }));
  tablesDB.createRow.mockResolvedValue({});
  await presetsService.update('p', preset);
  expect(tablesDB.updateRow).toHaveBeenCalledWith(
    expect.objectContaining({
      tableId: 'presets',
      data: { name: 'Test week', revision: 2 },
      transactionId: 'tx',
    }),
  );
  expect(tablesDB.deleteRow).toHaveBeenCalledWith({
    databaseId: 'db',
    tableId: 'preset_slots',
    rowId: 'old-slot',
    transactionId: 'tx',
  });
  expect(tablesDB.createRow).toHaveBeenCalledTimes(4);
  expect(tablesDB.updateTransaction).toHaveBeenCalledWith({ transactionId: 'tx', commit: true });
});
