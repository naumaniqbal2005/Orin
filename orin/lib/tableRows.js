import { Query } from 'react-native-appwrite';
import { tablesDB, DATABASE_ID } from './appwrite';

// Cursor pagination prevents losing the rest of a weekly preset after row 25.
export async function listAllRows(tableId, queries = []) {
  const rows = [];
  let cursor;
  do {
    const page = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId,
      queries: [...queries, Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    rows.push(...page.rows);
    cursor = page.rows.length === 100 ? page.rows[page.rows.length - 1].$id : null;
  } while (cursor);
  return rows;
}

export async function withTransaction(work) {
  const transaction = await tablesDB.createTransaction({ ttl: 120 });
  try {
    const result = await work(transaction.$id);
    await tablesDB.updateTransaction({ transactionId: transaction.$id, commit: true });
    return result;
  } catch (error) {
    try {
      await tablesDB.updateTransaction({ transactionId: transaction.$id, rollback: true });
    } catch {
      // Preserve the original failure; uncommitted transactions also expire.
    }
    throw error;
  }
}
