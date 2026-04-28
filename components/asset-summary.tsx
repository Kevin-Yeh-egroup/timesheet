"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Brain, Coins } from "lucide-react"
import type { TimeRecord } from "@/lib/types"
import { getAssetSummary, getAISummary, calculateMetrics } from "@/lib/types"

interface AssetSummaryProps {
  records: TimeRecord[]
}

export function AssetSummary({ records }: AssetSummaryProps) {
  const summary = getAssetSummary(records)
  const metrics = calculateMetrics(records)
  const aiSummary = getAISummary(metrics, records)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-green-500" />
          資產累積觀察
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <Brain className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">無形資產</p>
            <p className="text-sm text-muted-foreground mt-0.5">{summary.intangible}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">有形資產</p>
            <p className="text-sm text-muted-foreground mt-0.5">{summary.tangible}</p>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-blue-600">系統觀察</span>
          </div>
          <p className="text-sm leading-relaxed text-blue-800">
            {aiSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
