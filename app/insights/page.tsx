"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AISummaryPanel } from "@/components/ai-summary-panel"
import { ReflectionInsights } from "@/components/reflection-insights"
import { TimeReminderCard } from "@/components/time-reminder-card"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics } from "@/lib/types"

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const records = useTimeRecordStore((state) => state.records)
  const getMonthRecords = useTimeRecordStore((state) => state.getMonthRecords)

  useEffect(() => setMounted(true), [])

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
  const metrics = calculateMetrics(getMonthRecords(now.getFullYear(), now.getMonth()))
  const openAddRecord = (date: Date) => {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            摘要與提醒
          </h1>
          <p className="text-sm text-muted-foreground">
            回顧前一天、週期整理與可補充的時間片段。
          </p>
        </header>
        <TimeReminderCard records={records} onAddRecord={openAddRecord} />
        <AISummaryPanel records={records} />
        <ReflectionInsights metrics={metrics} records={records} />
      </div>

      <RecordEntrySheet open={sheetOpen} onOpenChange={setSheetOpen} selectedDate={selectedDate} />
    </AppShell>
  )
}
