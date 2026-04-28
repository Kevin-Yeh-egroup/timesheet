"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { WeeklyChart } from "@/components/weekly-chart"
import { MonthlyTable } from "@/components/monthly-table"
import { ExportButton } from "@/components/export-button"
import { AssetSummary } from "@/components/asset-summary"
import { CapabilityChart } from "@/components/capability-chart"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics, getMonthTypology, getMonthSuggestions } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Layers, MessageSquare } from "lucide-react"

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
  const typology = getMonthTypology(metrics)
  const suggestions = getMonthSuggestions(metrics)

  // 資產累積摘要（無形 vs 有形）
  const intangibleBreakdown = [
    { label: "體力", count: monthRecords.filter(r => r.assets.includes("體力")).length },
    { label: "軟實力", count: monthRecords.filter(r => r.assets.includes("軟實力")).length },
    { label: "硬實力", count: monthRecords.filter(r => r.assets.includes("硬實力")).length },
  ].filter(x => x.count > 0)

  const tangibleBreakdown = [
    { label: "收入", count: monthRecords.filter(r => r.assets.includes("收入")).length },
    { label: "存款增加", count: monthRecords.filter(r => r.assets.includes("存款增加")).length },
    { label: "工具/副業基礎", count: monthRecords.filter(r => r.assets.includes("工具/副業基礎")).length },
  ].filter(x => x.count > 0)

  return (
    <AppShell>
      <div className="space-y-6" id="report-content">
        {/* 報表標題列 */}
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">月度報表</h1>
            <p className="text-sm text-muted-foreground">
              {format(now, "yyyy年M月", { locale: zhTW })} · {monthRecords.length} 筆紀錄
            </p>
          </div>
          <ExportButton records={monthRecords} metrics={metrics} />
        </header>

        {/* 1. 本月摘要 */}
        <MetricsCards metrics={metrics} />

        {/* 2. 時間分配圖表 */}
        <div className="grid gap-4 md:grid-cols-2">
          <CapabilityChart records={monthRecords} />
          <WeeklyChart records={records} />
        </div>

        {/* 3. 資產累積摘要 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-blue-500" />
              本月資產累積摘要
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 無形資產 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">無形資產</p>
                {intangibleBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {intangibleBreakdown.map(({ label, count }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full bg-blue-200" style={{ width: `${Math.min(count * 20, 80)}px` }}>
                            <div className="h-full rounded-full bg-blue-500" style={{ width: "100%" }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{count} 筆</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">尚無記錄</p>
                )}
              </div>
              {/* 有形資產 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">有形資產</p>
                {tangibleBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {tangibleBreakdown.map(({ label, count }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full bg-green-200" style={{ width: `${Math.min(count * 20, 80)}px` }}>
                            <div className="h-full rounded-full bg-green-500" style={{ width: "100%" }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{count} 筆</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">持續累積中</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. 時間型態描述 + 下月建議 */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              本月觀察與來月建議
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 時間型態描述 */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-blue-600">本月時間型態</span>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{typology}</p>
            </div>

            {/* 下月溫和建議 */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">來月的溫和建議</p>
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 5. 努力紀錄清單 */}
        <MonthlyTable records={monthRecords} />
      </div>
    </AppShell>
  )
}
