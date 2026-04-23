"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Zap, TrendingUp, Target } from "lucide-react"
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
      title: "難度積分",
      value: metrics.difficultyScore.toFixed(0),
      icon: Zap,
      description: "時數 × 難度",
    },
    {
      title: "資產點數",
      value: metrics.assetPoints.toFixed(0),
      icon: TrendingUp,
      description: "累積資產值",
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
