"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Plus } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { DayTimeBlocks } from "@/components/day-time-blocks"
import { DailyCompletion } from "@/components/daily-completion"
import { RecordsCalendar } from "@/components/records-calendar"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTimeRecordStore } from "@/lib/store"
import { calculateTrackedHoursByDate } from "@/lib/types"
import { parseDateKey, toDateKey } from "@/lib/date-utils"

export default function TimePage() {
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [slot, setSlot] = useState<{ startTime?: string; endTime?: string }>({})
  const records = useTimeRecordStore((state) => state.records)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const trackedHours = calculateTrackedHoursByDate(records, selectedDate)
  const openAddRecord = (date: Date, startTime?: string, endTime?: string) => {
    setSelectedDate(date)
    setSlot({ startTime, endTime })
    setSheetOpen(true)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">時段盤點</h1>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "yyyy年M月d日（EEE）", { locale: zhTW })} · 觀察 24 小時配置
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={toDateKey(selectedDate)}
              max={toDateKey(new Date())}
              onChange={(event) => setSelectedDate(parseDateKey(event.target.value))}
              className="w-auto"
            />
            <Button onClick={() => openAddRecord(selectedDate)}>
              <Plus className="h-4 w-4" />
              新增紀錄
            </Button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <DailyCompletion trackedHours={trackedHours} label="這天" />
            <DayTimeBlocks
              records={records}
              selectedDate={selectedDate}
              onAddTimeSlot={openAddRecord}
            />
          </div>
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <RecordsCalendar
              records={records}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onAddDate={(date) => openAddRecord(date)}
            />
          </div>
        </div>
      </div>

      <RecordEntrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedDate={selectedDate}
        initialStartTime={slot.startTime}
        initialEndTime={slot.endTime}
      />
    </AppShell>
  )
}
