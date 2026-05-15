"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import type { TimeRecord } from "@/lib/types"
import { calculateCapabilities, getPrimaryCategory } from "@/lib/types"

interface CapabilityChartProps {
  records: TimeRecord[]
}

// 每種能力的時間歸因權重與來源標籤
const CAPABILITY_HOUR_CONFIG = [
  {
    id: "timeManagement",
    name: "調整時間",
    emoji: "⏱️",
    sources: ["做事"],
    colorBar: "bg-blue-500",
    colorBg: "bg-blue-50",
    colorText: "text-blue-700",
    colorBadge: "bg-blue-100 text-blue-600",
    getHours: (r: TimeRecord) => getPrimaryCategory(r.category) === "做事" ? r.hours * 0.4 : 0,
    hint: "做事時間培養時間調配與優先順序判斷",
  },
  {
    id: "physicalStrength",
    name: "增加體力",
    emoji: "💪",
    sources: ["恢復"],
    colorBar: "bg-green-500",
    colorBg: "bg-green-50",
    colorText: "text-green-700",
    colorBadge: "bg-green-100 text-green-600",
    getHours: (r: TimeRecord) =>
      getPrimaryCategory(r.category) === "恢復" ? r.hours : 0,
    hint: "休息、運動與看診等恢復時間，正在累積體力與穩定節奏",
  },
  {
    id: "coreSkills",
    name: "強化能力",
    emoji: "🧱",
    sources: ["做事"],
    colorBar: "bg-orange-500",
    colorBg: "bg-orange-50",
    colorText: "text-orange-700",
    colorBadge: "bg-orange-100 text-orange-600",
    getHours: (r: TimeRecord) => getPrimaryCategory(r.category) === "做事" ? r.hours * 0.6 : 0,
    hint: "做事中的挑戰與完成，會逐步強化核心執行能力",
  },
  {
    id: "newSkills",
    name: "增加技能",
    emoji: "📚",
    sources: ["探索"],
    colorBar: "bg-purple-500",
    colorBg: "bg-purple-50",
    colorText: "text-purple-700",
    colorBadge: "bg-purple-100 text-purple-600",
    getHours: (r: TimeRecord) =>
      getPrimaryCategory(r.category) === "探索" ? r.hours * 0.7
      : 0,
    hint: "閱讀、課程、創作與副業準備，會逐步轉化為新技能",
  },
  {
    id: "network",
    name: "運用人脈",
    emoji: "🤝",
    sources: ["連結", "照顧"],
    colorBar: "bg-amber-500",
    colorBg: "bg-amber-50",
    colorText: "text-amber-700",
    colorBadge: "bg-amber-100 text-amber-600",
    getHours: (r: TimeRecord) =>
      getPrimaryCategory(r.category) === "連結" || getPrimaryCategory(r.category) === "照顧" ? r.hours
      : 0,
    hint: "陪伴、照顧、社區與朋友互動都在建立支持與信任",
  },
  {
    id: "knowledge",
    name: "增加知識",
    emoji: "💡",
    sources: ["探索"],
    colorBar: "bg-teal-500",
    colorBg: "bg-teal-50",
    colorText: "text-teal-700",
    colorBadge: "bg-teal-100 text-teal-600",
    getHours: (r: TimeRecord) => getPrimaryCategory(r.category) === "探索" ? r.hours * 0.5 : 0,
    hint: "探索時間轉化為理解、洞察與知識資產",
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
