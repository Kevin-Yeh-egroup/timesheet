"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Zap, Boxes, Target, TrendingUp, Star } from "lucide-react"
import type { Metrics } from "@/lib/types"

interface MetricsCardsProps {
  metrics: Metrics
  todayTrackedHours?: number
}

export function MetricsCards({ metrics, todayTrackedHours }: MetricsCardsProps) {
  const completionRate = todayTrackedHours !== undefined
    ? Math.min((todayTrackedHours / 24) * 100, 100)
    : null

  const cards = [
    {
      title: "總投入時間",
      value: `${metrics.totalHours.toFixed(1)} 小時`,
      icon: Clock,
      description: "本月累計，每一小時都是資產",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "困難投入值",
      value: `${metrics.difficultyScore.toFixed(0)}`,
      icon: Zap,
      description: `時間×難度的累積 · 挑戰比例 ${metrics.highDifficultyRatio.toFixed(0)}%`,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "資產累積點數",
      value: `${metrics.assetPoints}`,
      icon: Boxes,
      description: `無形 ${metrics.intangibleAssetCount} 項 · 有形 ${metrics.tangibleAssetCount} 項 · 有產出 ${metrics.outputRecordCount} 筆`,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "成果轉換率",
      value: `${metrics.conversionRate.toFixed(0)}%`,
      icon: Target,
      description: "有具體產出的活動比例",
      color: "text-blue-600",
      bg: "bg-blue-600/10",
    },
    {
      title: "成長生產時間",
      value: `${metrics.productiveHours.toFixed(1)} 小時`,
      icon: TrendingUp,
      description: `工作 / 學習 / 副業 / 人際 · 佔比 ${metrics.productiveRatio.toFixed(0)}%`,
      color: "text-green-600",
      bg: "bg-green-600/10",
    },
    {
      title: completionRate !== null ? "今日記錄完整度" : "有效投入比例",
      value: completionRate !== null
        ? `${completionRate.toFixed(0)}%`
        : `${metrics.valuableTimeRatio.toFixed(0)}%`,
      icon: Star,
      description: completionRate !== null
        ? `今天已記錄 ${todayTrackedHours?.toFixed(1)} 小時`
        : "有意識投入且帶來資產的時間",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50 transition-shadow hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold md:text-2xl ${card.color}`}>{card.value}</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
