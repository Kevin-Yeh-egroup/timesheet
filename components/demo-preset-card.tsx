"use client"

import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          Demo 快速場景
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          一鍵載入 7 筆範例紀錄（含工作、學習、副業、人際、休息、鍛鍊），可立即展示總覽與報表。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleLoadDemo}>載入 Demo 資料</Button>
          <Button variant="outline" onClick={handleReset}>
            清空資料
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">目前共有 {records.length} 筆紀錄</p>
      </CardContent>
    </Card>
  )
}
