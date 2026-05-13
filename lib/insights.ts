import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { Category, TimeRecord } from "@/lib/types"
import { CATEGORIES, calculateMetrics } from "@/lib/types"
import {
  getCurrentMonthRange,
  getDateRange,
  getPreviousWeekRange,
  getPreviousYearRange,
  getToday,
  getYesterday,
  isFirstDayOfYear,
  isLastDayOfMonth,
  isMonday,
  parseDateKey,
  toDateKey,
} from "@/lib/date-utils"

export type SummaryPeriod = "day" | "week" | "month" | "year"

export interface SummaryInsight {
  id: string
  period: SummaryPeriod
  title: string
  periodLabel: string
  fallbackSummary: string
  highlights: string[]
  suggestions: string[]
  stats: {
    recordCount: number
    totalHours: number
    completionRate?: number
    outputCount: number
    topCategory?: Category
  }
}

export interface TimeReminder {
  id: string
  title: string
  message: string
  date: Date
  dateKey: string
  remainingHours: number
}

export interface DailyRecordSummary {
  dateKey: string
  count: number
  hours: number
  completionRate: number
}

function recordsInRange(records: TimeRecord[], start: Date, end: Date): TimeRecord[] {
  const startKey = toDateKey(start)
  const endKey = toDateKey(end)
  return records.filter((record) => record.date >= startKey && record.date <= endKey)
}

function recordsOnDate(records: TimeRecord[], date: Date): TimeRecord[] {
  const dateKey = toDateKey(date)
  return records.filter((record) => record.date === dateKey)
}

function categoryBreakdown(records: TimeRecord[]): Array<{ category: Category; hours: number }> {
  return CATEGORIES
    .map((category) => ({
      category,
      hours: records
        .filter((record) => record.category === category)
        .reduce((sum, record) => sum + record.hours, 0),
    }))
    .filter((item) => item.hours > 0)
    .sort((a, b) => b.hours - a.hours)
}

function buildFallbackSummary(period: SummaryPeriod, records: TimeRecord[], periodLabel: string): string {
  if (records.length === 0) {
    return `${periodLabel}尚未留下紀錄，可以從一兩件記得的事情開始補充。`
  }

  const metrics = calculateMetrics(records)
  const top = categoryBreakdown(records)[0]
  const outputText = metrics.outputRecordCount > 0
    ? `，其中 ${metrics.outputRecordCount} 筆已有具體成果`
    : ""

  if (period === "day") {
    return `${periodLabel}已記錄 ${metrics.totalHours.toFixed(1)} 小時，主要累積在${top?.category ?? "多個面向"}${outputText}。`
  }

  return `${periodLabel}共記錄 ${metrics.totalHours.toFixed(1)} 小時，主要配置在${top?.category ?? "多個面向"}${outputText}，這些紀錄正在幫助你看見累積。`
}

function buildSuggestions(records: TimeRecord[], totalDays: number): string[] {
  if (records.length === 0) return ["可以先補上一段印象最清楚的時間，讓紀錄慢慢完整。"]

  const metrics = calculateMetrics(records)
  const suggestions: string[] = []
  const averageHours = metrics.totalHours / Math.max(totalDays, 1)

  if (averageHours < 4) suggestions.push("可以從每天幾個固定時段開始記錄，逐步看見時間配置。")
  if (metrics.restHours === 0) suggestions.push("也可以補充休息或恢復時間，讓一天的配置更完整。")
  if (metrics.learningHours === 0) suggestions.push("若有閱讀、研究或練習，也可以記成學習累積。")
  if (metrics.outputRecordCount === 0) suggestions.push("已有投入時，可以觀察哪些活動開始形成具體成果。")

  return suggestions.length > 0 ? suggestions.slice(0, 3) : ["目前紀錄節奏穩定，可以持續用同樣方式累積。"]
}

function buildSummaryInsight(
  period: SummaryPeriod,
  title: string,
  periodLabel: string,
  records: TimeRecord[],
  totalDays: number
): SummaryInsight {
  const metrics = calculateMetrics(records)
  const breakdown = categoryBreakdown(records)
  const topCategory = breakdown[0]?.category
  const highlights = [
    `共記錄 ${metrics.totalHours.toFixed(1)} 小時`,
    `留下 ${records.length} 筆時間紀錄`,
    topCategory ? `主要配置在${topCategory}` : "尚未形成明顯配置",
    metrics.outputRecordCount > 0 ? `${metrics.outputRecordCount} 筆已有具體成果` : "持續累積基礎中",
  ]

  return {
    id: `${period}-${periodLabel}`,
    period,
    title,
    periodLabel,
    fallbackSummary: buildFallbackSummary(period, records, periodLabel),
    highlights,
    suggestions: buildSuggestions(records, totalDays),
    stats: {
      recordCount: records.length,
      totalHours: metrics.totalHours,
      completionRate: period === "day" ? Math.min((metrics.totalHours / 24) * 100, 100) : undefined,
      outputCount: metrics.outputRecordCount,
      topCategory,
    },
  }
}

export function getActiveSummaryInsights(records: TimeRecord[], referenceDate = new Date()): SummaryInsight[] {
  const yesterday = getYesterday(referenceDate)
  const summaries = [
    buildSummaryInsight(
      "day",
      "前一天摘要",
      format(yesterday, "M月d日（EEE）", { locale: zhTW }),
      recordsOnDate(records, yesterday),
      1
    ),
  ]

  if (isMonday(referenceDate)) {
    const range = getPreviousWeekRange(referenceDate)
    summaries.push(
      buildSummaryInsight(
        "week",
        "上週統整摘要",
        `${format(range.start, "M月d日", { locale: zhTW })} - ${format(range.end, "M月d日", { locale: zhTW })}`,
        recordsInRange(records, range.start, range.end),
        7
      )
    )
  }

  if (isLastDayOfMonth(referenceDate)) {
    const range = getCurrentMonthRange(referenceDate)
    summaries.push(
      buildSummaryInsight(
        "month",
        "本月摘要",
        format(range.start, "yyyy年M月", { locale: zhTW }),
        recordsInRange(records, range.start, range.end),
        getDateRange(range.start, range.end).length
      )
    )
  }

  if (isFirstDayOfYear(referenceDate)) {
    const range = getPreviousYearRange(referenceDate)
    summaries.push(
      buildSummaryInsight(
        "year",
        "年度回顧",
        format(range.start, "yyyy年", { locale: zhTW }),
        recordsInRange(records, range.start, range.end),
        getDateRange(range.start, range.end).length
      )
    )
  }

  return summaries
}

export function getTimeReminders(records: TimeRecord[], referenceDate = new Date()): TimeReminder[] {
  const today = getToday(referenceDate)
  const yesterday = getYesterday(referenceDate)
  const todayRecords = recordsOnDate(records, today)
  const yesterdayHours = recordsOnDate(records, yesterday).reduce((sum, record) => sum + record.hours, 0)
  const reminders: TimeReminder[] = []

  if (todayRecords.length === 0) {
    reminders.push({
      id: "today-empty",
      title: "今天還可以開始記錄",
      message: "像記帳一樣，先補上一段最清楚的時間，就能慢慢看見今天的配置。",
      date: today,
      dateKey: toDateKey(today),
      remainingHours: 24,
    })
  }

  if (yesterdayHours < 24) {
    reminders.push({
      id: "yesterday-incomplete",
      title: "昨天還有時間可以補充",
      message: `昨天已記錄 ${yesterdayHours.toFixed(1)} 小時，還可以補上記得的片段，讓累積更完整。`,
      date: yesterday,
      dateKey: toDateKey(yesterday),
      remainingHours: Math.max(0, 24 - yesterdayHours),
    })
  }

  return reminders
}

export function getDailyRecordSummaries(records: TimeRecord[]): Map<string, DailyRecordSummary> {
  const summaries = new Map<string, DailyRecordSummary>()

  records.forEach((record) => {
    const current = summaries.get(record.date) ?? {
      dateKey: record.date,
      count: 0,
      hours: 0,
      completionRate: 0,
    }
    current.count += 1
    current.hours += record.hours
    current.completionRate = Math.min((current.hours / 24) * 100, 100)
    summaries.set(record.date, current)
  })

  return summaries
}

export function getRecordsForCalendarDate(records: TimeRecord[], date: Date): TimeRecord[] {
  return recordsOnDate(records, parseDateKey(toDateKey(date)))
}
