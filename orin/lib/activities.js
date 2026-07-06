import { ID } from 'react-native-appwrite';
import { databases, DATABASE_ID } from './appwrite';

const COLLECTION_ID = 'activities';

export const activitiesService = {
  async create(activity) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        activity
      );
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  async list() {
    try {
      return await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    } catch (error) {
      console.error('Error listing activities:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error('Error getting activity:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      return await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }
};
