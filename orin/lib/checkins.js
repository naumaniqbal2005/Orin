import { ID } from 'react-native-appwrite';
import { databases, DATABASE_ID } from './appwrite';

const COLLECTION_ID = 'checkins';

export const checkinsService = {
  async create(checkin) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        checkin
      );
    } catch (error) {
      console.error('Error creating check-in:', error);
      throw error;
    }
  },

  async list() {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    } catch (error) {
      console.error('Error listing check-ins:', error);
      throw error;
    }
  },

  async getByScheduleSlot(scheduleSlotId) {
    try {
      const queries = [`equal("scheduleSlotId", "${scheduleSlotId}")`];
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
    } catch (error) {
      console.error('Error getting check-in by schedule slot:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
    } catch (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error('Error deleting check-in:', error);
      throw error;
    }
  },

  async getWeekRange(startDate, endDate) {
    try {
      const queries = [
        `greaterThan("timestamp", "${startDate}")`,
        `lessThan("timestamp", "${endDate}")`
      ];
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
    } catch (error) {
      console.error('Error getting week check-ins:', error);
      throw error;
    }
  }
};
