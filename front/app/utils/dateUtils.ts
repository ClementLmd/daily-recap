export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.getFullYear(), d.getMonth(), diff);
};

export const getMonthStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  // Set all times to midnight UTC to compare only dates
  const compareDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const compareStart = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const compareEnd = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

  return compareDate >= compareStart && compareDate <= compareEnd;
};
