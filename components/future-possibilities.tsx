"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles } from "lucide-react"
import type { CapabilityScore } from "@/lib/types"
import { calculateCapabilities } from "@/lib/types"
import type { TimeRecord } from "@/lib/types"

interface FuturePossibilitiesProps {
  records: TimeRecord[]
}

const STAGE_COLORS = [
  "bg-gray-200 text-gray-500",
  "bg-blue-100 text-blue-600",
  "bg-blue-400 text-white",
  "bg-blue-600 text-white",
]

const PROGRESS_COLORS: Record<string, string> = {
  timeManagement: "bg-blue-500",
  physicalStrength: "bg-green-500",
  coreSkills: "bg-orange-500",
  newSkills: "bg-purple-500",
  network: "bg-amber-500",
  knowledge: "bg-teal-500",
}

const CARD_ACCENT: Record<string, { border: string; bg: string; dot: string; badge: string }> = {
  timeManagement: { border: "border-blue-100",   bg: "bg-blue-50/40",   dot: "bg-blue-400",   badge: "bg-blue-100 text-blue-700" },
  physicalStrength:{ border: "border-green-100", bg: "bg-green-50/40",  dot: "bg-green-400",  badge: "bg-green-100 text-green-700" },
  coreSkills:      { border: "border-orange-100",bg: "bg-orange-50/30", dot: "bg-orange-400", badge: "bg-orange-100 text-orange-700" },
  newSkills:       { border: "border-purple-100",bg: "bg-purple-50/30", dot: "bg-purple-400", badge: "bg-purple-100 text-purple-700" },
  network:         { border: "border-amber-100", bg: "bg-amber-50/30",  dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-700" },
  knowledge:       { border: "border-teal-100",  bg: "bg-teal-50/30",   dot: "bg-teal-400",   badge: "bg-teal-100 text-teal-700" },
}

function MilestonePath({ capability }: { capability: CapabilityScore }) {
  const currentIdx = capability.stages.findIndex(s => s === capability.currentStage)

  return (
    <div className="relative mt-3">
      {/* 連線 */}
      <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-200" />
      <div
        className={`absolute top-3 left-3 h-0.5 transition-all ${PROGRESS_COLORS[capability.id]}`}
        style={{ width: `calc(${(currentIdx / (capability.stages.length - 1)) * 100}% * (1 - 6px / 100%))` }}
      />
      {/* 節點 */}
      <div className="relative flex justify-between">
        {capability.stages.map((stage, i) => {
          const isDone = i < currentIdx
          const isCurrent = i === currentIdx
          return (
            <div key={stage.label} className="flex flex-col items-center gap-1" style={{ width: "25%" }}>
              <div
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? `${PROGRESS_COLORS[capability.id]} text-white ring-2 ring-offset-1 ring-blue-300`
                    : isDone
                    ? `${PROGRESS_COLORS[capability.id]} text-white opacity-60`
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`text-center text-[9px] leading-tight ${
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CapabilityCard({ capability }: { capability: CapabilityScore }) {
  const accent = CARD_ACCENT[capability.id] ?? CARD_ACCENT.timeManagement

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${accent.border} ${accent.bg}`}>
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{capability.emoji}</span>
          <span className="text-sm font-semibold">{capability.name}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${accent.badge}`}>
          {capability.currentStage.label}
        </span>
      </div>

      {/* 進度條 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>累積程度</span>
          <span className="font-medium">{capability.score}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${PROGRESS_COLORS[capability.id]}`}
            style={{ width: `${capability.score}%` }}
          />
        </div>
      </div>

      {/* 里程碑路徑 */}
      <MilestonePath capability={capability} />

      {/* 當前階段描述 */}
      <p className="text-xs text-muted-foreground leading-relaxed pt-1">
        {capability.currentStage.description}
      </p>

      {/* 下一階段預覽 */}
      {capability.nextStage && (
        <div className="rounded-lg bg-white/70 border border-white px-3 py-2">
          <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">解鎖中 → {capability.nextStage.label}</p>
          <p className="text-xs text-muted-foreground">{capability.nextStage.description}</p>
        </div>
      )}

      {/* 經濟效益 */}
      <div className={`flex items-start gap-1.5 rounded-lg px-3 py-2 ${accent.badge} bg-opacity-50`}>
        <span className="text-xs shrink-0">💰</span>
        <p className="text-xs leading-relaxed">{capability.currentStage.economic}</p>
      </div>
    </div>
  )
}

export function FuturePossibilities({ records }: FuturePossibilitiesProps) {
  if (records.length === 0) return null

  const capabilities = calculateCapabilities(records)
  const topCaps = [...capabilities].sort((a, b) => b.score - a.score)
  const totalScore = Math.round(capabilities.reduce((s, c) => s + c.score, 0) / capabilities.length)

  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          如果維持目前的時間配置
        </CardTitle>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            以下是根據你的時間配置，推算出正在累積的 6 種核心能力
          </p>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="text-xs text-muted-foreground">整體累積</span>
            <span className="text-sm font-bold text-blue-600">{totalScore}%</span>
          </div>
        </div>
        {/* 整體進度概覽條 */}
        <div className="mt-2 space-y-1.5">
          {topCaps.slice(0, 3).map(c => (
            <div key={c.id} className="flex items-center gap-2">
              <span className="w-16 text-right text-[11px] text-muted-foreground shrink-0">{c.name}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${PROGRESS_COLORS[c.id]}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <span className="w-8 text-[11px] text-muted-foreground shrink-0">{c.score}%</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 6 能力卡片 grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(cap => (
            <CapabilityCard key={cap.id} capability={cap} />
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 border-t pt-3 text-center">
          以上為系統根據時間配置所做的推算，每個人的情況不同，僅供參考與探索。
        </p>
      </CardContent>
    </Card>
  )
}
