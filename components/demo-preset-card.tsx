"use client"

import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTimeRecordStore } from "@/lib/store"
import { toast } from "sonner"

export function DemoPresetCard() {
  const records = useTimeRecordStore((state) => state.records)
  const loadDemoRecords = useTimeRecordStore((state) => state.loadDemoRecords)
  const clearRecords = useTimeRecordStore((state) => state.clearRecords)

  const handleLoadDemo = () => {
    loadDemoRecords()
    toast.success("已載入 Demo 範例資料")
  }

  const handleReset = () => {
    clearRecords()
    toast.success("已清空所有紀錄")
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">第一次使用？可以先看一組示範案例</p>
            <p className="text-xs text-muted-foreground">
              載入範例紀錄，快速觀察總覽、報表與時間累積呈現。
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            目前 {records.length} 筆
          </span>
          <Button size="sm" onClick={handleLoadDemo}>
            載入示範案例
          </Button>
          {records.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleReset}>
              清空
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
