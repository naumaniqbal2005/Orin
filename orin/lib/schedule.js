import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId } from './auth';
import { executeDataOperation } from './backend';
import { TABLES, pickFields } from './schema';

const UPDATE_FIELDS = [
  'localDate',
  'timeZone',
  'startsAt',
  'endsAt',
  'startMinute',
  'durationMin',
  'activityNameSnapshot',
  'categorySnapshot',
  'iconKeySnapshot',
  'colorTokenSnapshot',
  'moveSequence',
  'status',
  'revision',
  'clientMutationId',
];

export const scheduleService = {
  create(slot) {
    return executeDataOperation('schedule.create', { clientMutationId: ID.unique(), ...slot });
  },
  async list(localDate) {
    const queries = [Query.equal('userId', await getCurrentUserId())];
    if (localDate) queries.push(Query.equal('localDate', localDate));
    return tablesDB.listRows({ databaseId: DATABASE_ID, tableId: TABLES.scheduleSlots, queries });
  },
  get(id) {
    return tablesDB.getRow({ databaseId: DATABASE_ID, tableId: TABLES.scheduleSlots, rowId: id });
  },
  update(id, data) {
    return tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLES.scheduleSlots,
      rowId: id,
      data: pickFields(data, UPDATE_FIELDS),
    });
  },
  // Dated history stays in place; the schema grants owners update, not delete.
  delete(id) {
    return this.update(id, { status: 'canceled' });
  },
  async getWeekRange(startDate, endDate) {
    return tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLES.scheduleSlots,
      queries: [
        Query.equal('userId', await getCurrentUserId()),
        Query.greaterThanEqual('localDate', startDate),
        Query.lessThanEqual('localDate', endDate),
      ],
    });
  },
};
