import { ID } from 'react-native-appwrite';
import { databases, DATABASE_ID } from './appwrite';

const COLLECTION_ID = 'schedule';

export const scheduleService = {
  async create(slot) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        slot
      );
    } catch (error) {
      console.error('Error creating schedule slot:', error);
      throw error;
    }
  },

  async list(date) {
    try {
      // Filter slots by date if provided
      const queries = date ? [`equal("date", "${date}")`] : [];
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
    } catch (error) {
      console.error('Error listing schedule slots:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error('Error getting schedule slot:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
    } catch (error) {
      console.error('Error updating schedule slot:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error('Error deleting schedule slot:', error);
      throw error;
    }
  },

  async getWeekRange(startDate, endDate) {
    try {
      // Get all slots within a date range
      const queries = [
        `greaterThan("date", "${startDate}")`,
        `lessThan("date", "${endDate}")`
      ];
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
    } catch (error) {
      console.error('Error getting week schedule:', error);
      throw error;
    }
  }
};
