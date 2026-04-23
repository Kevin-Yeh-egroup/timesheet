"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts"
import { format, subDays } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { TimeRecord, Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

interface WeeklyChartProps {
  records: TimeRecord[]
}

const COLORS: Record<Category, string> = {
  "工作": "#334155",
  "學習": "#059669",
  "副業": "#7c3aed",
  "人際": "#d97706",
  "休息": "#2563eb",
}

function WeeklyTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null

  const rows = payload
    .filter((item) => Number(item.value) > 0 && item.name)
    .map((item) => ({
      name: String(item.name) as Category,
      value: Number(item.value),
    }))

  if (rows.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "#111827",
        border: "1px solid #e5e7eb",
        borderRadius: "0.6rem",
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
        padding: "10px 12px",
        minWidth: "170px",
      }}
    >
      <div style={{ color: "#111827", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {rows.map((row) => (
          <div key={row.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
            <span style={{ color: COLORS[row.name], fontWeight: 600 }}>{row.name}</span>
            <span style={{ color: "#111827" }}>{row.value.toFixed(1)} 小時</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WeeklyChart({ records }: WeeklyChartProps) {
  // Generate last 7 days data
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dateStr = format(date, "yyyy-MM-dd")
    const dayRecords = records.filter((r) => r.date === dateStr)

    const result: Record<string, number | string> = {
      date: format(date, "M/d"),
      day: format(date, "EEE", { locale: zhTW }),
    }

    CATEGORIES.forEach((cat) => {
      result[cat] = dayRecords
        .filter((r) => r.category === cat)
        .reduce((sum, r) => sum + r.hours, 0)
    })
    return result
  })

  const hasData = data.some((d) =>
    CATEGORIES.some((cat) => (d[cat] as number) > 0)
  )

  if (!hasData) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">近 7 天時數分佈</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">尚無紀錄</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">近 7 天時數分佈</CardTitle>
      </CardHeader>
      <CardContent className="overflow-visible">
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.25 }}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ zIndex: 40, outline: "none" }}
              content={<WeeklyTooltip />}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {CATEGORIES.map((cat) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="a"
                fill={COLORS[cat]}
                stroke="hsl(var(--card))"
                strokeWidth={1}
                minPointSize={3}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
