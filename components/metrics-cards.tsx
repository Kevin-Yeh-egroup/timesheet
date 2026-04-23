"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Zap, Boxes, Target } from "lucide-react"
import type { Metrics } from "@/lib/types"

interface MetricsCardsProps {
  metrics: Metrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "總投入時數",
      value: `${metrics.totalHours.toFixed(1)} 小時`,
      icon: Clock,
      description: "本月累計",
    },
    {
      title: "平均難度",
      value: `${metrics.avgDifficulty.toFixed(1)}/5`,
      icon: Zap,
      description: `以時數加權 · 高難度 ${metrics.highDifficultyRatio.toFixed(0)}%`,
    },
    {
      title: "資產與產出項目數",
      value: `${metrics.intangibleAssetCount + metrics.tangibleAssetCount + metrics.outputRecordCount}`,
      icon: Boxes,
      description: `無形 ${metrics.intangibleAssetCount} / 有形 ${metrics.tangibleAssetCount} / 有產出 ${metrics.outputRecordCount}`,
    },
    {
      title: "轉換率",
      value: `${metrics.conversionRate.toFixed(0)}%`,
      icon: Target,
      description: "產出比例",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold md:text-2xl">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
