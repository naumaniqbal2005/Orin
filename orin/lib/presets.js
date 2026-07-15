import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';

const TABLE_ID = 'presets';
//columns are : id, userId, name, activities, timings, daySlots
/* {
  "id": "preset123",
  "userId": "user456",
  "name": "Weekly Routine",
  "days": ["Monday", "Tuesday"],
  "activities": [
    ["Exercise", "Breakfast", "Commute"], 
    ["Yoga", "Work", "Dinner"]
  ],
  "timings": [
    ["07:00", "07:30", "08:00"], 
    ["06:30", "09:00", "19:00"]
  ],
  "createdAt": "2026-07-14T09:51:00Z",
  "updatedAt": "2026-07-14T09:51:00Z"
//} */
//dummy data

function deserializeRow(row) {
  if (!row) return row;
  const newRow = { ...row };
  if (newRow.activities) {
    newRow.activities = newRow.activities.map(str => {
      try { return JSON.parse(str); } catch { return []; }
    });
  }
  if (newRow.timings) {
    newRow.timings = newRow.timings.map(str => {
      try { return JSON.parse(str); } catch { return []; }
    });
  }
  if (newRow.daySlots) {
    newRow.daySlots = newRow.daySlots.map(str => {
      try { return JSON.parse(str); } catch { return []; }
    });
  }
  return newRow;
}

function serializeData(data) {
  const serialized = { ...data };
  if (serialized.activities !== undefined) {
    serialized.activities = (serialized.activities || []).map(group => JSON.stringify(group));
  }
  if (serialized.timings !== undefined) {
    serialized.timings = (serialized.timings || []).map(group => JSON.stringify(group));
  }
  if (serialized.daySlots !== undefined) {
    serialized.daySlots = (serialized.daySlots || []).map(group => JSON.stringify(group));
  }
  return serialized;
}

export const presetsService = {
  async create(preset) {
    try {
      const userId = await getCurrentUserId();
      const serializedData = serializeData({
        userId: userId,
        name: preset.name,
        activities: preset.activities,
        timings: preset.timings,
        daySlots: preset.daySlots
      });
      const result = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: serializedData,
        permissions: userDocumentPermissions(userId)
      });
      return deserializeRow(result);
    } catch (error) {
      console.error('Error creating preset:', error);
      throw error;
    }
  }, 
  async list() {
    try {
      const userId = await getCurrentUserId();
      const results = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        queries: [
          Query.equal('userId', userId)
        ]
      });
      if (results.rows || results.documents) {
        const list = results.rows || results.documents;
        results.rows = list.map(row => deserializeRow(row));
        results.documents = results.rows; // Ensure both are updated
      }
      return results;
    } catch (error) {
      console.error('Error listing presets:', error);
      throw error;
    }
  },
  async get(id) {
    try {
      const result = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: id
      });
      return deserializeRow(result);
    } catch (error) {
      console.error('Error getting preset:', error);
      throw error;
    }
  },

  async update(id, data){
    try{
      const serializedData = serializeData(data);
      const result = await tablesDB.updateRow({
        databaseId : DATABASE_ID,
        tableId : TABLE_ID,
        rowId : id,
        data : serializedData
      });
      return deserializeRow(result);
    }
    catch (error) {
      console.error('Error updating presets:', error);
      throw error; 
    }
  },

  async delete(id){
    try{
      return await tablesDB.deleteRow({
        databaseId : DATABASE_ID,
        tableId : TABLE_ID,
        rowId : id,
      });
    } 
    catch (error){
      console.error('Error deleting presets:', error);
      throw error; 
    }
  }, 
};
