// Basic data models for the Scheduler app

export const Activity = {
  id: 'string',
  name: 'string',
  icon: 'string',
  color: 'string',
  category: 'string',
  defaultDuration: 'number'
};

export const Set = {
  id: 'string',
  name: 'string',
  activityIds: 'array'
};

export const Preset = {
  id: 'string',
  name: 'string',
  description: 'string',
  color: 'string',
  daySlots: 'array' // 7 entries, each an array of {activityId, hourStart, duration}
};

export const ScheduleSlot = {
  id: 'string',
  date: 'string', // ISO date string
  hourStart: 'number',
  duration: 'number',
  activityId: 'string',
  status: 'string' // 'upcoming' | 'done' | 'missed' | 'unscheduled'
};

export const CheckIn = {
  id: 'string',
  scheduleSlotId: 'string',
  status: 'string', // 'done' | 'missed'
  note: 'string',
  photoUrl: 'string',
  timestamp: 'string'
};

export const Achievement = {
  id: 'string',
  type: 'string',
  threshold: 'number',
  unlockedAt: 'string'
};
