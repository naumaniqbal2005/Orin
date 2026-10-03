import { ID, Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';
import { getCurrentUserId, userDocumentPermissions } from './auth';
import { TABLES, pickFields } from './schema';
import { listAllRows, withTransaction } from './tableRows';
import { hydratePreset, presetToSlots } from './presetMapping';

const METADATA_FIELDS = ['name', 'description', 'colorToken', 'archivedAt'];

async function loadRelations(userId, presetId) {
  const [slots, activities] = await Promise.all([
    listAllRows(TABLES.presetSlots, [
      Query.equal('userId', userId),
      ...(presetId ? [Query.equal('presetId', presetId)] : []),
    ]),
    listAllRows(TABLES.activities, [Query.equal('userId', userId)]),
  ]);
  return { slots, activities };
}

async function validateActivities(slots, userId) {
  const activities = await listAllRows(TABLES.activities, [Query.equal('userId', userId)]);
  const owned = new Set(
    activities.filter((activity) => !activity.archivedAt).map((activity) => activity.$id),
  );
  if (slots.some((slot) => !owned.has(slot.activityId))) {
    throw new Error('A selected activity is unavailable. Choose an activity from your library.');
  }
}

function metadata(data) {
  const { daySlots, activities, activityIds, timings, ...fields } = data;
  return pickFields(fields, METADATA_FIELDS);
}

function guardTransactionSize(operations) {
  if (operations > 100)
    throw new Error(
      'This save exceeds the Free plan transaction limit (100 row changes). Reduce the number of slots.',
    );
}

async function writeSlots(presetId, slots, userId, transactionId) {
  for (const slot of slots) {
    await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLES.presetSlots,
      rowId: ID.unique(),
      data: { ...slot, presetId, userId },
      permissions: userDocumentPermissions(userId),
      transactionId,
    });
  }
}

export const presetsService = {
  async create(preset) {
    const userId = await getCurrentUserId();
    const slots = presetToSlots(preset);
    guardTransactionSize(1 + slots.length);
    await validateActivities(slots, userId);
    const presetId = ID.unique();
    await withTransaction(async (transactionId) => {
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.presets,
        rowId: presetId,
        data: { ...metadata(preset), userId },
        permissions: userDocumentPermissions(userId),
        transactionId,
      });
      await writeSlots(presetId, slots, userId, transactionId);
    });
    return this.get(presetId);
  },

  async list() {
    const userId = await getCurrentUserId();
    const [presets, { slots, activities }] = await Promise.all([
      listAllRows(TABLES.presets, [Query.equal('userId', userId)]),
      loadRelations(userId),
    ]);
    const rows = presets.map((preset) =>
      hydratePreset(
        preset,
        slots.filter((slot) => slot.presetId === preset.$id),
        activities,
      ),
    );
    return { rows, total: rows.length };
  },

  async get(id) {
    const userId = await getCurrentUserId();
    const [preset, { slots, activities }] = await Promise.all([
      tablesDB.getRow({ databaseId: DATABASE_ID, tableId: TABLES.presets, rowId: id }),
      loadRelations(userId, id),
    ]);
    if (preset.userId !== userId) throw new Error('Preset is unavailable.');
    return hydratePreset(preset, slots, activities);
  },

  async update(id, data) {
    const current = await this.get(id);
    const userId = await getCurrentUserId();
    const replacesSlots = ['daySlots', 'activityIds', 'timings'].some(
      (field) => data[field] !== undefined,
    );
    const oldSlots = replacesSlots
      ? await listAllRows(TABLES.presetSlots, [
          Query.equal('userId', userId),
          Query.equal('presetId', id),
        ])
      : [];
    const slots = replacesSlots ? presetToSlots({ ...current, ...data }) : [];
    guardTransactionSize(1 + oldSlots.length + slots.length);
    if (replacesSlots) await validateActivities(slots, userId);
    await withTransaction(async (transactionId) => {
      // Reading inside the transaction detects concurrent edits when committing.
      const latest = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.presets,
        rowId: id,
        transactionId,
      });
      if (latest.revision !== current.revision)
        throw new Error('This preset changed. Reload before saving.');
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.presets,
        rowId: id,
        data: { ...metadata(data), revision: current.revision + 1 },
        transactionId,
      });
      for (const slot of oldSlots) {
        await tablesDB.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLES.presetSlots,
          rowId: slot.$id,
          transactionId,
        });
      }
      if (replacesSlots) await writeSlots(id, slots, userId, transactionId);
    });
    return this.get(id);
  },

  async delete(id) {
    await this.get(id);
    const userId = await getCurrentUserId();
    const slots = await listAllRows(TABLES.presetSlots, [
      Query.equal('userId', userId),
      Query.equal('presetId', id),
    ]);
    guardTransactionSize(1 + slots.length);
    return withTransaction(async (transactionId) => {
      for (const slot of slots) {
        await tablesDB.deleteRow({
          databaseId: DATABASE_ID,
          tableId: TABLES.presetSlots,
          rowId: slot.$id,
          transactionId,
        });
      }
      return tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.presets,
        rowId: id,
        transactionId,
      });
    });
  },
};
