import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId } from './auth';
import { executeDataOperation } from './backend';
import { pickFields, TABLES } from './schema';

const PROFILE_FIELDS = [
  'handle',
  'timeZone',
  'locale',
  'wakeMinute',
  'sleepMinute',
  'weekStartsOn',
  'activePresetId',
  'onboardingVersion',
];
const initializing = new Map();

export const userService = {
  // The Function derives the account ID and creates an owner-only profile once.
  async create(profile = {}) {
    const userId = await getCurrentUserId();
    if (!initializing.has(userId)) {
      const operation = executeDataOperation('profiles.ensure', {
        ...pickFields(profile, PROFILE_FIELDS),
        timeZone: profile.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).finally(() => initializing.delete(userId));
      initializing.set(userId, operation);
    }
    return initializing.get(userId);
  },

  async get() {
    const userId = await getCurrentUserId();
    try {
      return await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.profiles,
        rowId: userId,
      });
    } catch (error) {
      if (error.type !== 'row_not_found' && error.type !== 'document_not_found') throw error;
      return this.create();
    }
  },

  async update(data) {
    const profile = await this.get();
    return tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLES.profiles,
      rowId: profile.$id,
      data: pickFields(data, PROFILE_FIELDS),
    });
  },
};
