import { format, parseISO } from 'date-fns'

export const formatStandardDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  // Force local parsing to avoid timezone shift for YYYY-MM-DD
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  // Actually, if dateStr is exactly "2026-09-24", doing new Date() might offset it.
  // We can just split it and assemble if it's YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  
  // If it's a full ISO string
  if (dateStr.includes('T')) {
    const [datePart] = dateStr.split('T');
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  }
  
  return format(dateObj, 'dd/MM/yyyy');
}

export const formatStandardTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '';
  // usually timeStr comes as "14:00" or "14:00:00"
  try {
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}
