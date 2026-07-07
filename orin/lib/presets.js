import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';

const TABLE_ID = 'presets';

export const presetsService = {
  async create(preset) {
    try {
      const userId = await getCurrentUserId();
      const daySlots =
        typeof preset.daySlots === 'string'
          ? preset.daySlots
          : JSON.stringify(preset.daySlots ?? []);

      return await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: {
          userId,
          name: preset.name,
          description: preset.description ?? '',
          color: preset.color ?? '#8447FF',
          daySlots,
        },
        permissions: userDocumentPermissions(userId)
      });
    } catch (error) {
      console.error('Error creating preset:', error);
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
      console.error('Error listing presets:', error);
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
      console.error('Error getting preset:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const payload = { ...data };
      if (payload.daySlots && typeof payload.daySlots !== 'string') {
        payload.daySlots = JSON.stringify(payload.daySlots);
      }
      return await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id,
        data: payload
      });
    } catch (error) {
      console.error('Error updating preset:', error);
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
      console.error('Error deleting preset:', error);
      throw error;
    }
  },
};
