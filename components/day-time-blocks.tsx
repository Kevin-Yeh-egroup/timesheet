"use client"

import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Clock, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditRecordDialog } from "@/components/edit-record-dialog"
import type { TimeRecord } from "@/lib/types"
import {
  getRecordTimeLabel,
  hasRecordTimeRange,
  minutesToTimeString,
  timeStringToMinutes,
} from "@/lib/types"
import { toDateKey } from "@/lib/date-utils"

interface DayTimeBlocksProps {
  records: TimeRecord[]
  selectedDate: Date
  onAddTimeSlot: (date: Date, startTime: string, endTime: string) => void
}

export function DayTimeBlocks({ records, selectedDate, onAddTimeSlot }: DayTimeBlocksProps) {
  const dateKey = toDateKey(selectedDate)
  const dayRecords = records.filter((record) => record.date === dateKey)
  const timedRecords = dayRecords.filter(hasRecordTimeRange)
  const untimedRecords = dayRecords.filter((record) => !hasRecordTimeRange(record))
  const hourHeight = 48

  const sortedTimedRecords = timedRecords
    .map((record) => {
      const start = timeStringToMinutes(record.startTime ?? "")
      const end = timeStringToMinutes(record.endTime ?? "")
      if (start === null || end === null) return null
      return { record, start, end }
    })
    .filter((item): item is { record: TimeRecord; start: number; end: number } => item !== null)
    .sort((a, b) => a.start - b.start)

  const timelineItems: Array<
    | { type: "gap"; start: number; end: number }
    | { type: "record"; start: number; end: number; record: TimeRecord }
  > = []
  let cursor = 0

  sortedTimedRecords.forEach(({ record, start, end }) => {
    while (cursor < start) {
      const next = Math.min(start, cursor + 60)
      timelineItems.push({ type: "gap", start: cursor, end: next })
      cursor = next
    }

    timelineItems.push({ type: "record", start, end, record })
    cursor = Math.max(cursor, end)
  })

  while (cursor < 24 * 60) {
    const next = Math.min(24 * 60, cursor + 60)
    timelineItems.push({ type: "gap", start: cursor, end: next })
    cursor = next
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-blue-500" />
          24 小時時段盤點
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {format(selectedDate, "yyyy年M月d日（EEE）", { locale: zhTW })}，點選空白時段可直接補記。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dayRecords.length > 0 && (
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-blue-950">這天已記錄的事件</p>
              <p className="text-xs text-blue-700">點擊事件可修改內容與時段</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dayRecords.map((record) => (
                <EditRecordDialog
                  key={record.id}
                  record={record}
                  trigger={
                    <button
                      type="button"
                      className="rounded-full border border-blue-100 bg-background px-2 py-1 text-left text-[11px] text-muted-foreground shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                    >
                      {record.category} · {record.activity} · {record.hours}h · {getRecordTimeLabel(record)}
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {untimedRecords.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-sm font-medium text-amber-900">已記錄，但尚未指定時段</p>
            <p className="mt-1 text-xs text-amber-800/80">
              這些紀錄已納入總時數；點上方事件即可補上開始與結束時間，補完後會出現在下方時間軸。
            </p>
          </div>
        )}

        <div className="space-y-1">
          {timelineItems.map((item) => {
            const startTime = minutesToTimeString(item.start)
            const endTime = minutesToTimeString(item.end)
            const height = Math.max(((item.end - item.start) / 60) * hourHeight, 40)

            return (
              <div
                key={`${item.type}-${startTime}-${endTime}-${item.type === "record" ? item.record.id : "gap"}`}
                className="grid grid-cols-[72px_1fr] gap-2"
              >
                <div
                  className="flex items-start justify-end pr-2 pt-1 text-xs font-medium text-muted-foreground"
                  style={{ minHeight: height }}
                >
                  {startTime}
                </div>

                {item.type === "gap" ? (
                  <div style={{ minHeight: height }}>
                    <button
                      type="button"
                      onClick={() => onAddTimeSlot(selectedDate, startTime, endTime)}
                      className="flex h-full min-h-10 w-full items-start rounded-md border bg-background px-2 py-1.5 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-accent/40 active:scale-[0.99]"
                    >
                      <span className="flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        可補記 {startTime}–{endTime}
                      </span>
                    </button>
                  </div>
                ) : (
                  <EditRecordDialog
                    record={item.record}
                    trigger={
                      <button
                        type="button"
                        className="flex min-h-10 w-full flex-col justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-xs text-blue-800 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-100 active:scale-[0.99]"
                        style={{ minHeight: height }}
                      >
                        <span className="block font-medium">
                          {item.record.category} · {item.record.activity}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-blue-700">
                          {getRecordTimeLabel(item.record)} · {item.record.hours}h · 點擊修改
                        </span>
                      </button>
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
