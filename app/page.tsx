"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { BarChart3, Clock, ListChecks, MessageCircle, Plus, Sparkles } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { RecordsList } from "@/components/records-list"
import { DemoPresetCard } from "@/components/demo-preset-card"
import { DailyCompletion } from "@/components/daily-completion"
import { TimeReminderCard } from "@/components/time-reminder-card"
import { AISummaryPanel } from "@/components/ai-summary-panel"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { Button } from "@/components/ui/button"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics, calculateTrackedHoursByDate } from "@/lib/types"

const featureLinks = [
  { href: "/time", title: "時段盤點", description: "看見 24 小時哪些時段已被記錄", icon: Clock },
  { href: "/ai", title: "AI 整理", description: "用語音或文字快速整理時間", icon: Sparkles },
  { href: "/insights", title: "摘要與提醒", description: "回顧昨日、週期摘要與提醒", icon: MessageCircle },
  { href: "/records", title: "時間紀錄", description: "篩選、編輯與管理紀錄", icon: ListChecks },
  { href: "/report", title: "月報表", description: "查看圖表、明細與匯出", icon: BarChart3 },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
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
  const monthRecords = getMonthRecords(now.getFullYear(), now.getMonth())
  const metrics = calculateMetrics(monthRecords)
  const todayTrackedHours = calculateTrackedHoursByDate(records, now)

  const openAddRecordForDate = (date: Date) => {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  const openAddRecordToday = () => {
    openAddRecordForDate(new Date())
  }

  return (
    <AppShell>
      <div className="space-y-6">

        {/* ── 標題列 ─────────────────────── */}
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">時間資產總覽</h1>
            <p className="text-sm text-muted-foreground">
              {format(now, "yyyy年M月", { locale: zhTW })} · 共 {monthRecords.length} 筆紀錄 · 看見你的累積
            </p>
          </div>
          <Button className="hidden shrink-0 gap-2 md:flex" onClick={openAddRecordToday}>
            <Plus className="h-4 w-4" />
            新增紀錄
          </Button>
        </header>

        <DemoPresetCard />

        <TimeReminderCard records={records} onAddRecord={openAddRecordForDate} />

        <div className="grid gap-4 lg:grid-cols-2">
          <DailyCompletion trackedHours={todayTrackedHours} label="今日" />
          <AISummaryPanel records={records} />
        </div>

        <MetricsCards metrics={metrics} todayTrackedHours={todayTrackedHours} />

        <section className="grid gap-3 md:grid-cols-2">
          {featureLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-transform group-hover:scale-105">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <RecordsList records={records} enableCategoryFilter />
      </div>

      {/* ── 浮動新增按鈕（手機版） ──────── */}
      <button
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:bg-primary/90 active:scale-95 md:hidden"
        aria-label="新增紀錄"
        onClick={openAddRecordToday}
      >
        <Plus className="h-6 w-6" />
      </button>
      <RecordEntrySheet open={sheetOpen} onOpenChange={setSheetOpen} selectedDate={selectedDate} />
    </AppShell>
  )
}
