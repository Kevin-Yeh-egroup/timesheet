"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeRecord } from "@/lib/types"
import { getDailyRecordSummaries, getRecordsForCalendarDate } from "@/lib/insights"
import { toDateKey } from "@/lib/date-utils"

interface RecordsCalendarProps {
  records: TimeRecord[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onAddDate?: (date: Date) => void
}

export function RecordsCalendar({ records, selectedDate, onSelectDate, onAddDate }: RecordsCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(selectedDate)
  const summaries = useMemo(() => getDailyRecordSummaries(records), [records])
  const selectedRecords = useMemo(
    () => getRecordsForCalendarDate(records, selectedDate),
    [records, selectedDate]
  )
  const selectedSummary = summaries.get(toDateKey(selectedDate))

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-blue-500" />
          日期選擇
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          切換日期來查看當天的 24 小時配置。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            onSelect={(date) => date && onSelectDate(date)}
            disabled={{ after: new Date() }}
            modifiers={{
              recorded: (date) => {
                const summary = summaries.get(toDateKey(date))
                return Boolean(summary && summary.hours > 0 && summary.hours < 24)
              },
              complete: (date) => {
                const summary = summaries.get(toDateKey(date))
                return Boolean(summary && summary.hours >= 24)
              },
            }}
            modifiersClassNames={{
              recorded: "relative after:absolute after:bottom-1 after:h-1 after:w-1 after:rounded-full after:bg-blue-500",
              complete: "relative after:absolute after:bottom-1 after:h-1 after:w-1 after:rounded-full after:bg-green-500",
            }}
            className="rounded-md border"
          />
        </div>

        <div className="rounded-lg bg-muted/30 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {format(selectedDate, "M月d日（EEE）", { locale: zhTW })}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedSummary
                  ? `已記錄 ${selectedSummary.hours.toFixed(1)} 小時，共 ${selectedSummary.count} 筆`
                  : "這一天尚未有紀錄，可以從一件記得的事開始。"}
              </p>
            </div>
            <Button size="sm" onClick={() => (onAddDate ?? onSelectDate)(selectedDate)}>
              補記這天
            </Button>
          </div>

          {selectedRecords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedRecords.slice(0, 4).map((record) => (
                <span
                  key={record.id}
                  className="rounded-full bg-background px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {record.category} · {record.hours}h
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            已有紀錄
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            24 小時完整
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
