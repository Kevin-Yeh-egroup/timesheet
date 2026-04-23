"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, Circle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { Category, TimeRecord } from "@/lib/types"
import { CATEGORIES, getDifficultyLabel, getDifficultyColor } from "@/lib/types"
import { useTimeRecordStore } from "@/lib/store"
import { EditRecordDialog } from "@/components/edit-record-dialog"
import { toast } from "sonner"

interface RecordsListProps {
  records: TimeRecord[]
  showDate?: boolean
  enableCategoryFilter?: boolean
}

export function RecordsList({ records, showDate = true, enableCategoryFilter = false }: RecordsListProps) {
  const deleteRecord = useTimeRecordStore((state) => state.deleteRecord)
  const deleteRecords = useTimeRecordStore((state) => state.deleteRecords)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<Category | "全部">("全部")
  const visibleRecords = useMemo(() => {
    const filtered =
      activeCategory === "全部" ? records : records.filter((record) => record.category === activeCategory)
    return filtered.slice(0, 10)
  }, [records, activeCategory])

  const handleDelete = (id: string) => {
    deleteRecord(id)
    setSelectedIds((prev) => prev.filter((item) => item !== id))
    toast.success("紀錄已刪除")
  }

  const allVisibleIds = visibleRecords.map((record) => record.id)
  const isAllVisibleSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id))

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return [...prev, id]
      return prev.filter((item) => item !== id)
    })
  }

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)))
      return
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])))
  }

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return
    deleteRecords(selectedIds)
    toast.success(`已批次刪除 ${selectedIds.length} 筆紀錄`)
    setSelectedIds([])
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">最近紀錄</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">尚無紀錄，開始記錄你的時間吧</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-base">最近紀錄</CardTitle>
            {enableCategoryFilter && (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={activeCategory === "全部" ? "default" : "outline"}
                  onClick={() => setActiveCategory("全部")}
                >
                  全部
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={activeCategory === category ? "default" : "outline"}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={isAllVisibleSelected} onCheckedChange={(v) => toggleSelectAllVisible(v === true)} />
              <span>全選</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={handleBatchDelete}
            >
              批次刪除 ({selectedIds.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleRecords.map((record) => (
          <div
            key={record.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/50 p-3"
          >
            <Checkbox
              checked={selectedIds.includes(record.id)}
              onCheckedChange={(checked) => toggleSelect(record.id, checked === true)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {record.category}
                </Badge>
                <span className={`text-xs ${getDifficultyColor(record.difficulty)}`}>
                  {getDifficultyLabel(record.difficulty)}
                </span>
              </div>
              <p className="text-sm font-medium">{record.activity}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {showDate && (
                  <span>
                    {format(new Date(record.date), "M/d (EEE)", { locale: zhTW })}
                  </span>
                )}
                <span>{record.hours} 小時</span>
                <span className="flex items-center gap-1">
                  {record.hasOutput ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  {record.hasOutput ? "有產出" : "無產出"}
                </span>
              </div>
              {record.assets.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {record.assets.map((asset) => (
                    <Badge key={asset} variant="outline" className="text-xs">
                      {asset}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <EditRecordDialog record={record} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(record.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
