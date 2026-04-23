"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Coins, Brain } from "lucide-react"
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
          <Sparkles className="h-4 w-4" />
          資產總結
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <Brain className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium">無形資產</p>
            <p className="text-sm text-muted-foreground">{summary.intangible}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium">有形資產</p>
            <p className="text-sm text-muted-foreground">{summary.tangible}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              AI 摘要
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {aiSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
