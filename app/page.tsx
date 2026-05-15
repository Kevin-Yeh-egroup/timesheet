"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { BookOpen, Sparkles } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { RecordsList } from "@/components/records-list"
import { DailyCompletion } from "@/components/daily-completion"
import { TimeReminderCard } from "@/components/time-reminder-card"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { Button } from "@/components/ui/button"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics, calculateTrackedHoursByDate } from "@/lib/types"
import { getPlatformContextFromSearchParams } from "@/lib/platform-context"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false)
  const [reminderDate, setReminderDate] = useState<Date>(new Date())
  const records = useTimeRecordStore((state) => state.records)
  const getMonthRecords = useTimeRecordStore((state) => state.getMonthRecords)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const now = new Date()
  const platformContext = getPlatformContextFromSearchParams(searchParams)
  const isSocialWorker = platformContext.audienceMode === "social-worker"
  const caseName = searchParams?.get("caseName")
  const queryString = searchParams?.toString()
  const withCurrentParams = (href: string) => `${href}${queryString ? `?${queryString}` : ""}`
  const monthRecords = getMonthRecords(now.getFullYear(), now.getMonth())
  const metrics = calculateMetrics(monthRecords)
  const todayTrackedHours = calculateTrackedHoursByDate(records, now)

  const openAddRecordForDate = (date: Date) => {
    setReminderDate(date)
    setReminderSheetOpen(true)
  }

  return (
    <AppShell>
      <div className="space-y-6">

        <div className="space-y-4">
          {/* ── 標題列 ─────────────────────── */}
          <header className="rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {isSocialWorker ? "社工版" : "一般民眾版"}
                  </span>
                  {isSocialWorker && caseName && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                      個案：{caseName}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                  {isSocialWorker ? "個案時間資源盤點總覽" : "時間資源盤點總覽"}
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {format(now, "yyyy年M月", { locale: zhTW })} · 共 {monthRecords.length} 筆紀錄 ·
                  {isSocialWorker
                    ? " 協助服務對象看見時間安排、休息與能力累積"
                    : " 看見你的時間安排、能力提升與休息恢復"}
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-emerald-700">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {isSocialWorker
                    ? "協助個案填寫前，可先看操作說明；工具會示範如何陪同服務對象補齊一天安排，不會新增或污染個案正式紀錄。"
                    : "第一次使用可先看操作說明；說明頁只提供流程與畫面示意，不會新增或污染正式紀錄。"}
                </p>
              </div>
              <div className="hidden shrink-0 gap-2 md:flex">
                <Button asChild variant="outline">
                  <Link href={withCurrentParams("/guide")}>
                    <BookOpen className="h-4 w-4" />
                    使用說明
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            <TimeReminderCard
              records={records}
              onAddRecord={openAddRecordForDate}
              isSocialWorker={isSocialWorker}
            />

            <DailyCompletion trackedHours={todayTrackedHours} label="今日" />
            <MetricsCards metrics={metrics} todayTrackedHours={todayTrackedHours} />
          </div>
        </div>

        <RecordsList records={records} enableCategoryFilter />
      </div>
      <RecordEntrySheet
        open={reminderSheetOpen}
        onOpenChange={setReminderSheetOpen}
        selectedDate={reminderDate}
      />
    </AppShell>
  )
}
