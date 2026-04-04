import { format, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEE, MMM d')
}

export function formatShortDate(dateStr: string): string {
  return format(new Date(dateStr + 'T12:00:00'), 'MMM d')
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getDayIndex(date: Date = new Date()): number {
  // 0 = Monday, 6 = Sunday
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DAY_FULL_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getDayName(dayIndex: number, short = true): string {
  return short ? DAY_NAMES[dayIndex] : DAY_FULL_NAMES[dayIndex]
}
