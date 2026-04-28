"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Plus, PenLine } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { CapabilityChart } from "@/components/capability-chart"
import { AssetSummary } from "@/components/asset-summary"
import { RecordsList } from "@/components/records-list"
import { DemoPresetCard } from "@/components/demo-preset-card"
import { ReflectionInsights } from "@/components/reflection-insights"
import { DailyCompletion } from "@/components/daily-completion"
import { FuturePossibilities } from "@/components/future-possibilities"
import { AIIntakeDemo, type AIParsedResult } from "@/components/ai-intake-demo"
import { AddRecordForm } from "@/components/add-record-form"
import { QuickTemplates } from "@/components/quick-templates"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics, calculateTrackedHoursByDate } from "@/lib/types"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prefillRecord, setPrefillRecord] = useState<AIParsedResult | null>(null)
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

  const handleParsed = (result: AIParsedResult) => {
    setPrefillRecord(result)
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
          {/* 桌機版「新增紀錄」按鈕 */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button className="hidden shrink-0 gap-2 md:flex">
                <Plus className="h-4 w-4" />
                新增紀錄
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-lg overflow-y-auto p-0">
              <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-blue-500" />
                  記錄時間
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  用一句話快速輸入，或手動填寫詳細紀錄
                </p>
              </SheetHeader>
              <div className="space-y-5 px-6 py-5">
                <AIIntakeDemo onParsed={handleParsed} />
                <QuickTemplates />
                <AddRecordForm prefill={prefillRecord} onSuccess={() => setSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <DemoPresetCard />

        {/* 今日24小時盤點 */}
        <DailyCompletion trackedHours={todayTrackedHours} label="今日" />

        {/* 指標卡片 */}
        <MetricsCards metrics={metrics} todayTrackedHours={todayTrackedHours} />

        {/* 每日觀察與月度建議 */}
        <ReflectionInsights
          metrics={metrics}
          records={records}
        />

        {/* 圖表 */}
        <div className="grid gap-4 md:grid-cols-2">
          <CapabilityChart records={monthRecords} />
          <AssetSummary records={monthRecords} />
        </div>

        {/* 未來可能性 */}
        <FuturePossibilities records={monthRecords} />

        {/* 最近紀錄 */}
        <RecordsList records={records} enableCategoryFilter />
      </div>

      {/* ── 浮動新增按鈕（手機版） ──────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-transform md:hidden"
            aria-label="新增紀錄"
          >
            <Plus className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto p-0 rounded-t-2xl">
          <SheetHeader className="sticky top-0 z-10 border-b bg-background px-5 py-4">
            <SheetTitle className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-blue-500" />
              記錄時間
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              用一句話快速輸入，或手動填寫詳細紀錄
            </p>
          </SheetHeader>
          <div className="space-y-5 px-5 py-5">
            <AIIntakeDemo onParsed={handleParsed} />
            <QuickTemplates />
            <AddRecordForm prefill={prefillRecord} onSuccess={() => setSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  )
}
