"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from "recharts"
import { format, subDays } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { TimeRecord } from "@/lib/types"
import { getPrimaryCategory } from "@/lib/types"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

interface WeeklyChartProps {
  records: TimeRecord[]
}

// 六維能力定義：名稱、顏色、每筆紀錄的時數歸因函式
// 歸因規則確保同一天的時數合計 ≈ 當日實際總時數（無重複計算）
const exerciseKeywords = ["運動", "健身", "跑步", "重訓", "瑜珈", "走路", "散步"]
const learningKeywords = ["學習", "閱讀", "讀書", "課程", "研究", "證照", "聽課"]
const sideKeywords = ["副業", "創作", "寫作", "拍片", "社群", "接案", "作品"]

// 恢復 → 增加體力；做事 → 調整時間 + 強化能力；探索 → 技能/知識
const CAPABILITIES = [
  {
    key: "調整時間",
    color: "#3b82f6",
    emoji: "⏱️",
    getHours: (r: TimeRecord) => getPrimaryCategory(r.category) === "做事" ? r.hours * 0.3 : 0,
  },
  {
    key: "增加體力",
    color: "#22c55e",
    emoji: "💪",
    getHours: (r: TimeRecord) =>
      getPrimaryCategory(r.category) === "恢復" ? r.hours : 0,
  },
  {
    key: "強化能力",
    color: "#f97316",
    emoji: "🧱",
    getHours: (r: TimeRecord) => getPrimaryCategory(r.category) === "做事" ? r.hours * 0.7 : 0,
  },
  {
    key: "增加技能",
    color: "#a855f7",
    emoji: "📚",
    getHours: (r: TimeRecord) =>
      sideKeywords.some(k => r.activity.includes(k)) ? r.hours
      : getPrimaryCategory(r.category) === "探索" ? r.hours * 0.5
      : 0,
  },
  {
    key: "運用人脈",
    color: "#f59e0b",
    emoji: "🤝",
    getHours: (r: TimeRecord) =>
      getPrimaryCategory(r.category) === "連結" || getPrimaryCategory(r.category) === "照顧" ? r.hours : 0,
  },
  {
    key: "增加知識",
    color: "#14b8a6",
    emoji: "💡",
    getHours: (r: TimeRecord) =>
      learningKeywords.some(k => r.activity.includes(k)) || getPrimaryCategory(r.category) === "探索"
        ? r.hours * 0.5
        : exerciseKeywords.some(k => r.activity.includes(k))
          ? 0
          : 0,
  },
] as const

type CapKey = typeof CAPABILITIES[number]["key"]

const COLOR_MAP = Object.fromEntries(
  CAPABILITIES.map(c => [c.key, c.color])
) as Record<CapKey, string>

function WeeklyTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null

  const rows = payload
    .filter(item => Number(item.value) > 0)
    .map(item => ({ name: String(item.name) as CapKey, value: Number(item.value) }))
    .reverse()

  if (rows.length === 0) return null

  const total = rows.reduce((s, r) => s + r.value, 0)

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "0.6rem",
      boxShadow: "0 12px 28px rgba(15,23,42,0.15)",
      padding: "10px 14px",
      minWidth: "180px",
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#111827" }}>
        {label}
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {rows.map(row => {
          const cap = CAPABILITIES.find(c => c.key === row.name)
          return (
            <div key={row.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
              <span style={{ color: COLOR_MAP[row.name], fontWeight: 600 }}>
                {cap?.emoji} {row.name}
              </span>
              <span style={{ color: "#374151" }}>{row.value.toFixed(1)}h</span>
            </div>
          )
        })}
      </div>
      <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
        <span>合計</span>
        <span style={{ fontWeight: 600, color: "#111827" }}>{total.toFixed(1)}h</span>
      </div>
    </div>
  )
}

// 自訂 Legend，加上 emoji
function CustomLegend() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", justifyContent: "center", marginTop: 6 }}>
      {CAPABILITIES.map(cap => (
        <div key={cap.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: cap.color, flexShrink: 0 }} />
          <span style={{ color: "#6b7280" }}>{cap.emoji} {cap.key}</span>
        </div>
      ))}
    </div>
  )
}

export function WeeklyChart({ records }: WeeklyChartProps) {
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, "yyyy-MM-dd")
    const dayRecords = records.filter(r => r.date === dateStr)

    const row: Record<string, number | string> = {
      date: format(date, "M/d"),
      day: format(date, "EEE", { locale: zhTW }),
    }

    CAPABILITIES.forEach(cap => {
      row[cap.key] = parseFloat(
        dayRecords.reduce((s, r) => s + cap.getHours(r), 0).toFixed(2)
      )
    })

    return row
  })

  const hasData = data.some(d =>
    CAPABILITIES.some(cap => (d[cap.key] as number) > 0)
  )

  if (!hasData) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">近 7 天能力累積趨勢</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-muted-foreground">尚無紀錄</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">近 7 天能力累積趨勢</CardTitle>
        <p className="text-xs text-muted-foreground">每日時間依六種能力歸因，觀察每天的累積重心</p>
      </CardHeader>
      <CardContent className="overflow-visible">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}h`}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.2 }}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ zIndex: 40, outline: "none" }}
              content={<WeeklyTooltip />}
            />
            <Legend content={<CustomLegend />} />
            {CAPABILITIES.map(cap => (
              <Bar
                key={cap.key}
                dataKey={cap.key}
                stackId="cap"
                fill={cap.color}
                stroke="hsl(var(--card))"
                strokeWidth={0.8}
                radius={cap.key === "調整時間" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
