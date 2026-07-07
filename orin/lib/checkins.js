import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';

const TABLE_ID = 'checkins';

export const checkinsService = {
  async create(checkin) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: { ...checkin, userId },
        permissions: userDocumentPermissions(userId)
      });
    } catch (error) {
      console.error('Error creating check-in:', error);
      throw error;
    }
  },

  async list() {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [
          Query.equal('userId', userId),
        ]
      });
    } catch (error) {
      console.error('Error listing check-ins:', error);
      throw error;
    }
  },

  async getByScheduleSlot(scheduleSlotId) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [
          Query.equal('userId', userId),
          Query.equal('scheduleSlotId', scheduleSlotId),
        ]
      });
    } catch (error) {
      console.error('Error getting check-in by schedule slot:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id,
        data: data
      });
    } catch (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id
      });
    } catch (error) {
      console.error('Error deleting check-in:', error);
      throw error;
    }
  },

  async getWeekRange(startDate, endDate) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [
          Query.equal('userId', userId),
          Query.greaterThanEqual('timestamp', startDate),
          Query.lessThanEqual('timestamp', endDate),
        ]
      });
    } catch (error) {
      console.error('Error getting week check-ins:', error);
      throw error;
    }
  },
};
