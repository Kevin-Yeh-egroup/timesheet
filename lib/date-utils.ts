import { addDays, endOfMonth, endOfYear, format, startOfMonth, startOfWeek, startOfYear, subDays } from "date-fns"

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`)
}

export function getToday(referenceDate = new Date()): Date {
  return parseDateKey(toDateKey(referenceDate))
}

export function getYesterday(referenceDate = new Date()): Date {
  return subDays(getToday(referenceDate), 1)
}

export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  let current = parseDateKey(toDateKey(start))
  const endKey = toDateKey(end)

  while (toDateKey(current) <= endKey) {
    dates.push(current)
    current = addDays(current, 1)
  }

  return dates
}

export function getPreviousWeekRange(referenceDate = new Date()): { start: Date; end: Date } {
  const thisWeekStart = startOfWeek(getToday(referenceDate), { weekStartsOn: 1 })
  return {
    start: subDays(thisWeekStart, 7),
    end: subDays(thisWeekStart, 1),
  }
}

export function getCurrentMonthRange(referenceDate = new Date()): { start: Date; end: Date } {
  const today = getToday(referenceDate)
  return {
    start: startOfMonth(today),
    end: endOfMonth(today),
  }
}

export function getPreviousYearRange(referenceDate = new Date()): { start: Date; end: Date } {
  const today = getToday(referenceDate)
  const previousYear = new Date(today.getFullYear() - 1, 0, 1)
  return {
    start: startOfYear(previousYear),
    end: endOfYear(previousYear),
  }
}

export function isMonday(date = new Date()): boolean {
  return getToday(date).getDay() === 1
}

export function isLastDayOfMonth(date = new Date()): boolean {
  return toDateKey(getToday(date)) === toDateKey(endOfMonth(getToday(date)))
}

export function isFirstDayOfYear(date = new Date()): boolean {
  const today = getToday(date)
  return today.getMonth() === 0 && today.getDate() === 1
}
