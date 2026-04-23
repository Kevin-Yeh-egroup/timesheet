"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { TimeRecord, Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"

interface CategoryChartProps {
  records: TimeRecord[]
}

const COLORS: Record<Category, string> = {
  "工作": "#64748b",
  "學習": "#10b981",
  "副業": "#8b5cf6",
  "人際": "#f59e0b",
  "休息": "#3b82f6",
}

export function CategoryChart({ records }: CategoryChartProps) {
  const data = CATEGORIES.map((category) => {
    const hours = records
      .filter((r) => r.category === category)
      .reduce((sum, r) => sum + r.hours, 0)
    return {
      name: category,
      value: hours,
      color: COLORS[category],
    }
  }).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">類別分佈</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">尚無紀錄</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">類別分佈</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} 小時`, "時數"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
