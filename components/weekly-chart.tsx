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
} from "recharts"
import { format, subDays } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { TimeRecord, Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"

interface WeeklyChartProps {
  records: TimeRecord[]
}

const COLORS: Record<Category, string> = {
  "工作": "#64748b",
  "學習": "#10b981",
  "副業": "#8b5cf6",
  "人際": "#f59e0b",
  "休息": "#3b82f6",
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
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
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
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} 小時`,
                name,
              ]}
            />
            <Legend />
            {CATEGORIES.map((cat) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="a"
                fill={COLORS[cat]}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
