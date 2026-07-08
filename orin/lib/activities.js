import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';

const TABLE_ID = 'activities';

export const activitiesService = {
  async create(activity) {
    try {
      const userId = await getCurrentUserId();
      return await tablesDB.createRow({
        databaseId : DATABASE_ID,
        tableId : TABLE_ID,
        rowId : ID.unique(),
        data : {
          userId,
          name: activity.name,
          description: activity.description ?? '',
        },
        permissions : userDocumentPermissions(userId)
      })
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  async list() {
    try {
      console.log('Listing activities with DATABASE_ID:', DATABASE_ID, 'TABLE_ID:', TABLE_ID);
      const result = await tablesDB.listRows({
        databaseId : DATABASE_ID,
        tableId : TABLE_ID,
        queries : [
          Query.equal('userId', await getCurrentUserId())
        ]
      });
      console.log('List result:', result);
      return result;
    } catch (error) {
      console.error('Error listing activities:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
      console.error('Error getting activity:', error);
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
      console.error('Error updating activity:', error);
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
      console.error('Error deleting activity:', error);
      throw error;
    }
  },
};
