import { minuteToTime, timeToMinute } from './schema';

// Appwrite weekdays follow JavaScript: Sunday = 0.
export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function presetToSlots(preset) {
  const slots = [];
  for (let group = 0; group < (preset.daySlots ?? []).length; group++) {
    for (const day of preset.daySlots[group]) {
      const weekday = WEEKDAYS.indexOf(day);
      if (weekday < 0) throw new Error(`Invalid weekday: ${day}`);
      const timings = preset.timings?.[group] ?? [];
      const ids = preset.activityIds?.[group] ?? [];
      if (ids.length !== timings.length)
        throw new Error('Every preset slot needs a saved activity.');
      for (let position = 0; position < timings.length; position++) {
        const activityId = ids[position];
        if (!activityId || activityId.startsWith('default_')) {
          throw new Error(
            'Create the activity in your Activities tab before adding it to a preset.',
          );
        }
        const startMinute = timeToMinute(timings[position].start_time);
        const endMinute = timeToMinute(timings[position].end_time);
        const durationMin = (endMinute - startMinute + 1440) % 1440;
        if (durationMin < 1 || durationMin > 720) {
          throw new Error('Each preset activity must last between 1 minute and 12 hours.');
        }
        slots.push({ activityId, weekday, startMinute, durationMin, position });
      }
    }
  }
  if (new Set(slots.map((slot) => `${slot.weekday}:${slot.position}`)).size !== slots.length) {
    throw new Error('Each day must have a single schedule.');
  }
  return slots;
}

// Compatibility view for the existing editor and Timeline; arrays are never DB columns.
export function hydratePreset(preset, slots, activities) {
  const activityById = new Map(activities.map((activity) => [activity.$id, activity]));
  const result = { ...preset, daySlots: [], activities: [], activityIds: [], timings: [] };
  for (let weekday = 0; weekday < 7; weekday++) {
    const day = slots
      .filter((slot) => slot.weekday === weekday)
      .sort((a, b) => a.position - b.position);
    if (!day.length) continue;
    result.daySlots.push([WEEKDAYS[weekday]]);
    result.activityIds.push(day.map((slot) => slot.activityId));
    result.activities.push(
      day.map((slot) => activityById.get(slot.activityId)?.name ?? 'Unavailable activity'),
    );
    result.timings.push(
      day.map((slot) => ({
        start_time: minuteToTime(slot.startMinute),
        end_time: minuteToTime((slot.startMinute + slot.durationMin) % 1440),
      })),
    );
  }
  return result;
}
