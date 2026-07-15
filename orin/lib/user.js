import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';

const TABLE_ID = 'user';

export const userService = {
  async create(profile = {}) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: userId,
        data: {
          wakeup_time: profile.wakeup_time ?? null,
          sleep_time: profile.sleep_time ?? null,
        },
        permissions: userDocumentPermissions(userId),
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async get() {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: userId,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  async update({ wakeup_time, sleep_time }) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: userId,
        data: { wakeup_time, sleep_time },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};