import { functions } from './appwrite';

export async function executeDataOperation(operation, data = {}) {
  const execution = await functions.createExecution({
    functionId: process.env.EXPO_PUBLIC_APPWRITE_DATA_FUNCTION_ID ?? 'orin-data',
    body: JSON.stringify({ operation, data }),
    async: false,
  });
  let response;
  try {
    response = JSON.parse(execution.responseBody);
  } catch {
    throw new Error('The Orin data Function did not return a response. Check its deployment.');
  }
  if (execution.responseStatusCode >= 400 || execution.status !== 'completed') {
    const error = new Error(response.message ?? 'The Orin data operation failed.');
    error.code = execution.responseStatusCode;
    throw error;
  }
  return response;
}
