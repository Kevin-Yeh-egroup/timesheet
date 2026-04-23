"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, Circle } from "lucide-react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { TimeRecord } from "@/lib/types"
import { getDifficultyLabel, getDifficultyColor } from "@/lib/types"
import { useTimeRecordStore } from "@/lib/store"
import { toast } from "sonner"

interface RecordsListProps {
  records: TimeRecord[]
  showDate?: boolean
}

export function RecordsList({ records, showDate = true }: RecordsListProps) {
  const deleteRecord = useTimeRecordStore((state) => state.deleteRecord)

  const handleDelete = (id: string) => {
    deleteRecord(id)
    toast.success("紀錄已刪除")
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
        <CardTitle className="text-base">最近紀錄</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.slice(0, 10).map((record) => (
          <div
            key={record.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/50 p-3"
          >
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
