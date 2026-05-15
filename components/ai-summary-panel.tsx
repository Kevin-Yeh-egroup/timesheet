"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeRecord } from "@/lib/types"
import { generateAISummary } from "@/lib/ai-summary"
import { getActiveSummaryInsights, type SummaryInsight } from "@/lib/insights"

interface AISummaryPanelProps {
  records: TimeRecord[]
}

interface SummaryState {
  summary: string
  source: "gemini" | "fallback"
  loading: boolean
}

const PERIOD_LABELS: Record<SummaryInsight["period"], string> = {
  day: "昨日",
  week: "週統整",
  month: "月摘要",
  year: "年回顧",
}

function stripRepeatedPeriodLabel(summary: string, periodLabel: string) {
  return summary
    .replace(new RegExp(`^${periodLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`), "")
    .trim()
}

export function AISummaryPanel({ records }: AISummaryPanelProps) {
  const insights = useMemo(() => getActiveSummaryInsights(records), [records])
  const [summaries, setSummaries] = useState<Record<string, SummaryState>>({})

  useEffect(() => {
    let cancelled = false

    setSummaries((prev) => {
      const next = { ...prev }
      insights.forEach((insight) => {
        if (!next[insight.id]) {
          next[insight.id] = {
            summary: insight.fallbackSummary,
            source: "fallback",
            loading: true,
          }
        }
      })
      return next
    })

    insights.forEach((insight) => {
      void generateAISummary(insight).then((result) => {
        if (cancelled) return
        setSummaries((prev) => ({
          ...prev,
          [insight.id]: {
            summary: result.summary,
            source: result.source,
            loading: false,
          },
        }))
      })
    })

    return () => {
      cancelled = true
    }
  }, [insights])

  return (
    <Card className="border-blue-100 bg-blue-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          AI 時間摘要
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          開啟工具時先回顧前一天；週一、月底與年初會補上更長週期的整理。
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const state = summaries[insight.id]
          const summaryText = stripRepeatedPeriodLabel(
            state?.summary ?? insight.fallbackSummary,
            insight.periodLabel
          )
          return (
            <div key={insight.id} className="rounded-lg border bg-white/80 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.periodLabel}</p>
                </div>
                <Badge variant="outline">
                  {PERIOD_LABELS[insight.period]}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {state?.loading ? "正在整理這段時間的配置與累積..." : summaryText}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {insight.highlights.slice(0, 3).map((highlight) => (
                  <span key={highlight} className="rounded-full bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
