import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';

const TABLE_ID = 'schedule';

export const scheduleService = {
  async create(slot) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: { ...slot, userId },
        permissions: userDocumentPermissions(userId)
      });
    } catch (error) {
      console.error('Error creating schedule slot:', error);
      throw error;
    }
  },

  async list(date) {
    try {
      const userId = await getCurrentUserId();
      const queries = [Query.equal('userId', userId)];
      if (date) {
        queries.push(Query.equal('date', date));
      }
      return await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: queries
      });
    } catch (error) {
      console.error('Error listing schedule slots:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      return await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id
      });
    } catch (error) {
      console.error('Error getting schedule slot:', error);
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
      console.error('Error updating schedule slot:', error);
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
      console.error('Error deleting schedule slot:', error);
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
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate),
        ]
      });
    } catch (error) {
      console.error('Error getting week schedule:', error);
      throw error;
    }
  },
};
