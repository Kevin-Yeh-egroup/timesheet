"use client"

import { format } from "date-fns"
import { Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTimeRecordStore } from "@/lib/store"
import type { Category, Asset } from "@/lib/types"
import { ACTIVITY_PRESETS, calculateHoursFromTimeRange, getDefaultTimeRange, minutesToTimeString, timeStringToMinutes } from "@/lib/types"
import { toast } from "sonner"

interface QuickTemplate {
  category: Category
  activity: string
  hours: number
  difficulty: number
  assets: Asset[]
}

const QUICK_TEMPLATES: QuickTemplate[] = ACTIVITY_PRESETS.slice(0, 10).map((preset) => ({
  ...preset,
  hours: ["上班", "睡眠/午休"].includes(preset.activity) ? 2 : 1,
}))

export function QuickTemplates({ initialDate }: { initialDate?: Date }) {
  const addRecord = useTimeRecordStore((state) => state.addRecord)

  const handleQuickAdd = (template: QuickTemplate) => {
    const fallback = getDefaultTimeRange()
    const start = timeStringToMinutes(fallback.startTime) ?? 9 * 60
    const endTime = minutesToTimeString(Math.min(start + template.hours * 60, 24 * 60))
    const calculatedHours = calculateHoursFromTimeRange(fallback.startTime, endTime)
    addRecord({
      date: format(initialDate ?? new Date(), "yyyy-MM-dd"),
      activity: template.activity,
      category: template.category,
      hours: calculatedHours ?? template.hours,
      startTime: fallback.startTime,
      endTime,
      difficulty: template.difficulty,
      hasOutput: false,
      assets: template.assets,
      conversionStatus: "尚未轉換",
    })
    toast.success(`已新增「${template.activity}」`)
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4" />
          快速新增常見生活片段
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          先用常見情境快速補上一筆，細節之後仍可編輯。
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <Badge
              key={template.activity}
              variant="outline"
              className="cursor-pointer px-3 py-1.5 transition-all hover:bg-accent active:scale-95"
              onClick={() => handleQuickAdd(template)}
            >
              {template.activity} ({template.hours}h)
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
