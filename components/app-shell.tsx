"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, HeartHandshake, Plus, Sparkles, X } from "lucide-react"
import { Navigation } from "./navigation"
import { AISummaryPanel } from "@/components/ai-summary-panel"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { Button } from "@/components/ui/button"
import { getPlatformContextFromSearchParams } from "@/lib/platform-context"
import { useTimeRecordStore } from "@/lib/store"

export function AppShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const records = useTimeRecordStore((state) => state.records)
  const platformContext = getPlatformContextFromSearchParams(searchParams)
  const isSocialWorker = platformContext.audienceMode === "social-worker"

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.href =
      process.env.NEXT_PUBLIC_FAMILYFINHEALTH_URL ||
      "http://localhost:3000/toolbox/time-resource-inventory"
  }

  const openAddRecordToday = () => {
    setSelectedDate(new Date())
    setSheetOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fff8f3_0%,#ffffff_48%,#f4fbf8_100%)] text-slate-900">
      <Navigation />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-5">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white/85 p-3 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-fit border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4" />
              回到上一頁
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <HeartHandshake className="h-4 w-4 text-rose-400" />
              <span>{isSocialWorker ? "社工版時間資源盤點" : "好理家在時間資源盤點"}</span>
            </div>
          </div>
          {children}
        </div>
      </main>

      <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-3">
        {summaryOpen && (
          <div className="max-h-[70vh] w-[min(calc(100vw-2.5rem),420px)] overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-2 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-2 pt-1">
              <p className="text-sm font-bold text-slate-900">AI 時間摘要</p>
              <button
                type="button"
                aria-label="關閉 AI 時間摘要"
                onClick={() => setSummaryOpen(false)}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AISummaryPanel records={records} />
          </div>
        )}
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 shadow-lg transition-transform hover:bg-emerald-50 active:scale-95"
          aria-expanded={summaryOpen}
          onClick={() => setSummaryOpen((open) => !open)}
        >
          <Sparkles className="h-4 w-4" />
          AI 時間摘要
        </button>
      </div>

      <button
        className="fixed bottom-5 right-5 z-40 flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:bg-primary/90 active:scale-95"
        aria-label="新增一筆"
        onClick={openAddRecordToday}
      >
        <Plus className="h-4 w-4" />
        新增一筆
      </button>

      <RecordEntrySheet open={sheetOpen} onOpenChange={setSheetOpen} selectedDate={selectedDate} />
    </div>
  )
}
