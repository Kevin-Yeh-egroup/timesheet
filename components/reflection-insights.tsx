"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metrics } from "@/lib/types"

interface ReflectionInsightsProps {
  metrics: Metrics
  yesterdayTrackedHours: number
}

export function ReflectionInsights({ metrics, yesterdayTrackedHours }: ReflectionInsightsProps) {
  const yesterdayMissingHours = Math.max(0, 24 - yesterdayTrackedHours)

  const focusSuggestions: string[] = []
  if (metrics.learningHours < 12) {
    focusSuggestions.push("本月學習時數偏低，建議下月固定每週安排學習時段。")
  }
  if (metrics.exerciseHours < 8) {
    focusSuggestions.push("運動時數偏少，可用短時段運動來提高可持續性。")
  }
  if (metrics.relationshipHours < 8) {
    focusSuggestions.push("人際/家庭投入偏少，建議預留固定陪伴時段。")
  }
  if (metrics.potentialOpportunityCostHours >= 20) {
    focusSuggestions.push("機會成本偏高，建議減少低回報工作與被動休息時數。")
  }
  if (focusSuggestions.length === 0) {
    focusSuggestions.push("時間配置均衡，建議維持目前節奏並持續累積。")
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">24小時盤點與月反思</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          昨日已記錄 <span className="font-medium text-foreground">{yesterdayTrackedHours.toFixed(1)} 小時</span>
          ，尚有{" "}
          <span className="font-medium text-foreground">{yesterdayMissingHours.toFixed(1)} 小時</span>
          未盤點。
        </p>
        <p className="text-muted-foreground">
          本月生產力時數 {metrics.productiveHours.toFixed(1)} 小時（{metrics.productiveRatio.toFixed(0)}%）；
          潛在機會成本約 {metrics.potentialOpportunityCostHours.toFixed(1)} 小時。
        </p>
        <div className="space-y-1">
          {focusSuggestions.map((item) => (
            <p key={item}>- {item}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
