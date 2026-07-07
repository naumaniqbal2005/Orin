// Basic data models for the Scheduler app
// Appwrite auto-adds $id, $createdAt, $updatedAt on every document.

export const Activity = {
  id: 'string',
  userId: 'string',
  name: 'string',
  description: 'string',
};

export const Preset = {
  id: 'string',
  userId: 'string',
  name: 'string',
  description: 'string',
  color: 'string',
  daySlots: 'string', // JSON: 7 entries, each an array of { activityId, hourStart, duration }
};

export const ScheduleSlot = {
  id: 'string',
  userId: 'string',
  date: 'string', // ISO date YYYY-MM-DD
  hourStart: 'number',
  duration: 'number',
  activityId: 'string',
  status: 'string', // 'upcoming' | 'done' | 'missed' | 'unscheduled'
};

export const CheckIn = {
  id: 'string',
  userId: 'string',
  scheduleSlotId: 'string',
  status: 'string', // 'done' | 'missed'
  note: 'string',
  photoUrl: 'string',
  timestamp: 'string',
};

export const Achievement = {
  id: 'string',
  userId: 'string',
  type: 'string',
  threshold: 'number',
  unlockedAt: 'string',
};
