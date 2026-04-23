"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { CategoryChart } from "@/components/category-chart"
import { AssetSummary } from "@/components/asset-summary"
import { RecordsList } from "@/components/records-list"
import { DemoPresetCard } from "@/components/demo-preset-card"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics } from "@/lib/types"

export default function DashboardPage() {
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

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">時間盤點表</h1>
          <p className="text-sm text-muted-foreground">
            {format(now, "yyyy年M月", { locale: zhTW })} · 共 {monthRecords.length} 筆紀錄
          </p>
        </header>

        <DemoPresetCard />

        <MetricsCards metrics={metrics} />

        <div className="grid gap-4 md:grid-cols-2">
          <CategoryChart records={monthRecords} />
          <AssetSummary records={monthRecords} />
        </div>

        <RecordsList records={records} />
      </div>
    </AppShell>
  )
}
