// Date utility helpers for the Scheduler app

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return formatDate(monday);
};

export const getEndOfWeek = (date = new Date()) => {
  const start = new Date(getStartOfWeek(date));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return formatDate(end);
};

export const getWeekDates = (date = new Date()) => {
  const start = new Date(getStartOfWeek(date));
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(current.getDate() + i);
    weekDates.push(formatDate(current));
  }
  
  return weekDates;
};

export const getDayName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getShortDayName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

export const isToday = (date) => {
  const today = formatDate(new Date());
  return formatDate(date) === today;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const subtractDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};
