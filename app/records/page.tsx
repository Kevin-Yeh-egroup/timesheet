"use client"

import { useEffect, useState } from "react"
import { ListChecks, Plus } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { RecordsList } from "@/components/records-list"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { Button } from "@/components/ui/button"
import { useTimeRecordStore } from "@/lib/store"

export default function RecordsPage() {
  const [mounted, setMounted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
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

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <ListChecks className="h-5 w-5 text-blue-500" />
              時間紀錄
            </h1>
            <p className="text-sm text-muted-foreground">
              查看、篩選與編輯已累積的時間紀錄。
            </p>
          </div>
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            新增
          </Button>
        </header>
        <RecordsList records={records} enableCategoryFilter />
      </div>

      <RecordEntrySheet open={sheetOpen} onOpenChange={setSheetOpen} selectedDate={new Date()} />
    </AppShell>
  )
}
