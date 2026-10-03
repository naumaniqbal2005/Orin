export const TABLES = {
  profiles: 'profiles',
  activities: 'activities',
  presets: 'presets',
  presetSlots: 'preset_slots',
  scheduleSlots: 'schedule_slots',
  checkins: 'checkins',
};

export function timeToMinute(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    throw new Error('Use a time in HH:MM format.');
  }
  const [hour, minute] = value.split(':').map(Number);
  if (hour > 23 || minute > 59) throw new Error('Invalid time.');
  return hour * 60 + minute;
}

export function minuteToTime(value) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function pickFields(data, fields) {
  const unknown = Object.keys(data).filter((key) => !fields.includes(key));
  if (unknown.length) throw new Error(`Unsupported fields: ${unknown.join(', ')}`);
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}
