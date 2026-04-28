"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { TimeRecord, Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"

interface CategoryChartProps {
  records: TimeRecord[]
}

// 藍=穩定(工作)、綠=成果(學習)、橘=挑戰(副業)、金=關係(人際)、灰藍=恢復(休息)
const COLORS: Record<Category, string> = {
  "工作": "#3b82f6",
  "學習": "#10b981",
  "副業": "#f97316",
  "人際": "#f59e0b",
  "休息": "#94a3b8",
}

const CUSTOM_LABELS: Record<Category, string> = {
  "工作": "工作（生產型）",
  "學習": "學習（成長型）",
  "副業": "副業（成長型）",
  "人際": "人際（關係型）",
  "休息": "休息（恢復型）",
}

export function CategoryChart({ records }: CategoryChartProps) {
  const data = CATEGORIES.map((category) => {
    const hours = records
      .filter((r) => r.category === category)
      .reduce((sum, r) => sum + r.hours, 0)
    return {
      name: category,
      fullName: CUSTOM_LABELS[category],
      value: hours,
      color: COLORS[category],
    }
  }).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">時間配置分布</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-muted-foreground">新增紀錄後即可看見配置分析</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">時間配置分布</CardTitle>
        <p className="text-xs text-muted-foreground">每種類型的時間都在累積不同資產</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} 小時`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
            />
            <Legend
              formatter={(value) => value}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
