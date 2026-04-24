"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { WeeklyChart } from "@/components/weekly-chart"
import { MonthlyTable } from "@/components/monthly-table"
import { ExportButton } from "@/components/export-button"
import { ReflectionInsights } from "@/components/reflection-insights"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics, calculateTrackedHoursByDate } from "@/lib/types"

export default function ReportPage() {
  const [mounted, setMounted] = useState(false)
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
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayTrackedHours = calculateTrackedHoursByDate(records, yesterday)

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">月報表</h1>
            <p className="text-sm text-muted-foreground">
              {format(now, "yyyy年M月", { locale: zhTW })}
            </p>
          </div>
          <ExportButton records={monthRecords} />
        </header>

        <MetricsCards metrics={metrics} />
        <ReflectionInsights metrics={metrics} yesterdayTrackedHours={yesterdayTrackedHours} />
        <WeeklyChart records={records} />
        <MonthlyTable records={monthRecords} />
      </div>
    </AppShell>
  )
}
