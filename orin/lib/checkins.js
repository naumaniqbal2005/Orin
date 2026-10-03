import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId } from './auth';
import { executeDataOperation } from './backend';
import { TABLES, pickFields } from './schema';

const UPDATE_FIELDS = [
  'outcome',
  'actualDurationMin',
  'reasonCodes',
  'note',
  'occurredAt',
  'clientMutationId',
];

export const checkinsService = {
  create(checkin) {
    return executeDataOperation('checkins.create', { clientMutationId: ID.unique(), ...checkin });
  },
  async list() {
    return tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLES.checkins,
      queries: [Query.equal('userId', await getCurrentUserId())],
    });
  },
  async getByScheduleSlot(scheduleSlotId) {
    return tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLES.checkins,
      queries: [
        Query.equal('userId', await getCurrentUserId()),
        Query.equal('scheduleSlotId', scheduleSlotId),
      ],
    });
  },
  update(id, data) {
    return tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLES.checkins,
      rowId: id,
      data: pickFields(data, UPDATE_FIELDS),
    });
  },
  delete(id) {
    return tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.checkins, rowId: id });
  },
  async getWeekRange(startDate, endDate) {
    return tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLES.checkins,
      queries: [
        Query.equal('userId', await getCurrentUserId()),
        Query.greaterThanEqual('occurredAt', startDate),
        Query.lessThanEqual('occurredAt', endDate),
      ],
    });
  },
};
