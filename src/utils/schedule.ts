export type ClassSessionSchedule = {
  class_number: number;
  date: string; // YYYY-MM-DD
  start_datetime: Date; // Exact start timestamp
  end_datetime: Date; // Exact end timestamp
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Computes the exact dates and times for each class session based on the batch schedule.
 */
export function computeClassSchedule(
  startDate: string | null | undefined,
  scheduleDays: string[], // e.g. ["Sunday", "Tuesday"]
  startTime: string,      // e.g. "14:00"
  endTime: string,        // e.g. "14:30"
  totalClasses: number
): ClassSessionSchedule[] {
  if (!startDate || !scheduleDays || scheduleDays.length === 0 || totalClasses <= 0) return [];

  const sessions: ClassSessionSchedule[] = [];
  
  // Parse the start date (ignoring timezones by using local YYYY-MM-DD)
  // We'll create a local date at noon to avoid timezone shift issues on day calculation
  const [year, month, day] = startDate.split('-').map(Number);
  const currentDate = new Date(year, month - 1, day, 12, 0, 0);

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let classesScheduled = 0;
  
  // Advance day by day until we schedule all classes
  while (classesScheduled < totalClasses) {
    const currentDayName = DAYS_OF_WEEK[currentDate.getDay()];
    
    if (scheduleDays.includes(currentDayName)) {
      classesScheduled++;
      
      const sessionDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      // Create accurate Date objects for start and end times in local timezone
      const startDatetime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), startHour, startMin, 0);
      const endDatetime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), endHour, endMin, 0);

      sessions.push({
        class_number: classesScheduled,
        date: sessionDateStr,
        start_datetime: startDatetime,
        end_datetime: endDatetime
      });
    }

    // Advance to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessions;
}
