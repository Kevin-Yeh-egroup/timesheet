"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock } from "lucide-react"
import { getCompletionInfo } from "@/lib/types"

interface DailyCompletionProps {
  trackedHours: number
  label?: string
}

export function DailyCompletion({ trackedHours, label = "今日" }: DailyCompletionProps) {
  const info = getCompletionInfo(trackedHours)
  const remaining = Math.max(0, 24 - trackedHours)

  const segments = [
    { label: "已記錄", hours: trackedHours, color: "bg-blue-500" },
    { label: "待補充", hours: remaining, color: "bg-gray-200" },
  ]

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-blue-500" />
          {label} 24 小時盤點
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 進度條 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">已記錄時數</span>
            <span className={`font-semibold ${info.color}`}>
              {trackedHours.toFixed(1)} / 24 小時
            </span>
          </div>
          <Progress value={info.rate} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {info.rate >= 100 ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {info.label}
            </span>
            <span>{info.rate.toFixed(0)}% 已完成</span>
          </div>
        </div>

        {/* 完整度說明 */}
        <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
          {info.message}
        </p>

        {/* 分區說明 */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">已記錄 {trackedHours.toFixed(1)} 小時</span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-200 border border-gray-300" />
              <span className="text-muted-foreground">尚可補充 {remaining.toFixed(1)} 小時</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
