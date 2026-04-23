"use client"

import { format } from "date-fns"
import { Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTimeRecordStore } from "@/lib/store"
import type { Category, Asset } from "@/lib/types"
import { toast } from "sonner"

interface QuickTemplate {
  category: Category
  activity: string
  hours: number
  difficulty: number
  assets: Asset[]
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  { category: "學習", activity: "閱讀書籍", hours: 1, difficulty: 2, assets: ["軟實力"] },
  { category: "學習", activity: "線上課程", hours: 1.5, difficulty: 3, assets: ["硬實力"] },
  { category: "副業", activity: "寫作創作", hours: 1, difficulty: 4, assets: ["軟實力", "工具/副業基礎"] },
  { category: "副業", activity: "經營社群", hours: 0.5, difficulty: 2, assets: ["工具/副業基礎"] },
  { category: "人際", activity: "與朋友聚會", hours: 2, difficulty: 1, assets: ["體力"] },
  { category: "休息", activity: "運動健身", hours: 1, difficulty: 3, assets: ["體力"] },
]

export function QuickTemplates() {
  const addRecord = useTimeRecordStore((state) => state.addRecord)

  const handleQuickAdd = (template: QuickTemplate) => {
    addRecord({
      date: format(new Date(), "yyyy-MM-dd"),
      activity: template.activity,
      category: template.category,
      hours: template.hours,
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
          快速新增
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <Badge
              key={template.activity}
              variant="outline"
              className="cursor-pointer px-3 py-1.5 transition-colors hover:bg-accent"
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
