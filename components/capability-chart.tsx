"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import type { TimeRecord } from "@/lib/types"
import { calculateCapabilities } from "@/lib/types"

interface CapabilityChartProps {
  records: TimeRecord[]
}

const EXERCISE_KEYWORDS = ["運動", "健身", "跑步", "重訓", "瑜珈", "走路", "散步"]

// 每種能力的時間歸因權重與來源標籤
const CAPABILITY_HOUR_CONFIG = [
  {
    id: "timeManagement",
    name: "調整時間",
    emoji: "⏱️",
    sources: ["工作"],
    colorBar: "bg-blue-500",
    colorBg: "bg-blue-50",
    colorText: "text-blue-700",
    colorBadge: "bg-blue-100 text-blue-600",
    getHours: (r: TimeRecord) => r.category === "工作" ? r.hours * 0.4 : 0,
    hint: "工作時間培養時間調配與優先順序判斷",
  },
  {
    id: "physicalStrength",
    name: "增加體力",
    emoji: "💪",
    sources: ["休息"],
    colorBar: "bg-green-500",
    colorBg: "bg-green-50",
    colorText: "text-green-700",
    colorBadge: "bg-green-100 text-green-600",
    getHours: (r: TimeRecord) =>
      r.category === "休息" || EXERCISE_KEYWORDS.some(k => r.activity.includes(k))
        ? r.hours
        : 0,
    hint: "休息與運動時間直接轉化為精力與體能儲備",
  },
  {
    id: "coreSkills",
    name: "強化能力",
    emoji: "🧱",
    sources: ["工作"],
    colorBar: "bg-orange-500",
    colorBg: "bg-orange-50",
    colorText: "text-orange-700",
    colorBadge: "bg-orange-100 text-orange-600",
    getHours: (r: TimeRecord) => r.category === "工作" ? r.hours * 0.6 : 0,
    hint: "工作中的挑戰與產出直接強化核心執行能力",
  },
  {
    id: "newSkills",
    name: "增加技能",
    emoji: "📚",
    sources: ["學習", "副業"],
    colorBar: "bg-purple-500",
    colorBg: "bg-purple-50",
    colorText: "text-purple-700",
    colorBadge: "bg-purple-100 text-purple-600",
    getHours: (r: TimeRecord) =>
      r.category === "學習" ? r.hours * 0.5
      : r.category === "副業" ? r.hours * 0.8
      : 0,
    hint: "學習與副業時間最直接轉化為新技能積累",
  },
  {
    id: "network",
    name: "運用人脈",
    emoji: "🤝",
    sources: ["人際", "副業"],
    colorBar: "bg-amber-500",
    colorBg: "bg-amber-50",
    colorText: "text-amber-700",
    colorBadge: "bg-amber-100 text-amber-600",
    getHours: (r: TimeRecord) =>
      r.category === "人際" ? r.hours
      : r.category === "副業" ? r.hours * 0.2
      : 0,
    hint: "人際與副業時間建立信任、拓展連結",
  },
  {
    id: "knowledge",
    name: "增加知識",
    emoji: "💡",
    sources: ["學習"],
    colorBar: "bg-teal-500",
    colorBg: "bg-teal-50",
    colorText: "text-teal-700",
    colorBadge: "bg-teal-100 text-teal-600",
    getHours: (r: TimeRecord) => r.category === "學習" ? r.hours * 0.5 : 0,
    hint: "深度學習時間轉化為洞察力與知識資產",
  },
]

export function CapabilityChart({ records }: CapabilityChartProps) {
  const capabilities = calculateCapabilities(records)
  const capMap = Object.fromEntries(capabilities.map(c => [c.id, c]))

  // 計算每個能力的歸因時數
  const capHours = CAPABILITY_HOUR_CONFIG.map(cfg => ({
    ...cfg,
    hours: records.reduce((s, r) => s + cfg.getHours(r), 0),
    score: capMap[cfg.id]?.score ?? 0,
    levelLabel: capMap[cfg.id]?.currentStage.label ?? "—",
  }))

  const maxHours = Math.max(...capHours.map(c => c.hours), 1)
  const totalHours = records.reduce((s, r) => s + r.hours, 0)

  if (records.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-blue-500" />
            時間 → 能力分布
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-muted-foreground">新增紀錄後即可看見能力分析</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-blue-500" />
          時間 → 能力分布
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          你投入的 {totalHours.toFixed(1)} 小時，正在轉化為這六種能力
        </p>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {capHours.map(cap => {
          const hoursBarPct = maxHours > 0 ? (cap.hours / maxHours) * 100 : 0
          const scoreBarPct = cap.score

          return (
            <div key={cap.id} className="space-y-1.5">
              {/* 標題列：圖示、名稱、來源、時數、階段 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base leading-none shrink-0">{cap.emoji}</span>
                  <span className="text-sm font-medium">{cap.name}</span>
                  <div className="flex gap-1 flex-wrap">
                    {cap.sources.map(src => (
                      <span key={src} className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cap.colorBadge}`}>
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                  <span className="font-medium">{cap.hours.toFixed(1)}h</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cap.colorBadge}`}>
                    {cap.levelLabel}
                  </span>
                </div>
              </div>

              {/* 雙層進度條 */}
              <div className="space-y-1">
                {/* 時間投入 bar */}
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-[10px] text-muted-foreground text-right">時間</span>
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${cap.colorBar} opacity-60`}
                      style={{ width: `${hoursBarPct}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-[10px] text-muted-foreground text-right">
                    {hoursBarPct.toFixed(0)}%
                  </span>
                </div>
                {/* 能力累積 bar */}
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-[10px] text-muted-foreground text-right">能力</span>
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${cap.colorBar}`}
                      style={{ width: `${scoreBarPct}%` }}
                    />
                  </div>
                  <span className={`w-8 shrink-0 text-[10px] font-semibold text-right ${cap.colorText}`}>
                    {scoreBarPct}%
                  </span>
                </div>
              </div>

              {/* 說明提示 */}
              <p className="text-[10px] text-muted-foreground/70 pl-14">{cap.hint}</p>
            </div>
          )
        })}

        {/* 圖例說明 */}
        <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-8 rounded-full bg-gray-300 opacity-60" />
            <span>時間投入比例（相對最高能力）</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-8 rounded-full bg-gray-500" />
            <span>能力累積分數（0–100）</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
