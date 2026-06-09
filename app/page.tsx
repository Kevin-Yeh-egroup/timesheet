"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { ArrowRight, BookOpen, CheckCircle2, Clock3, PlusCircle, Share2, Sparkles, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { MetricsCards } from "@/components/metrics-cards"
import { RecordsList } from "@/components/records-list"
import { DailyCompletion } from "@/components/daily-completion"
import { TimeReminderCard } from "@/components/time-reminder-card"
import { RecordEntrySheet } from "@/components/record-entry-sheet"
import { Button } from "@/components/ui/button"
import { useTimeRecordStore } from "@/lib/store"
import { calculateMetrics, calculateTrackedHoursByDate } from "@/lib/types"
import { getPlatformContextFromSearchParams } from "@/lib/platform-context"

const firstRunSteps = [
  {
    title: "選一段時間",
    description: "不用填滿 24 小時，先從最清楚的一段開始。",
    icon: Clock3,
  },
  {
    title: "寫發生什麼",
    description: "像記帳一樣，留下活動名稱與生活情境。",
    icon: Sparkles,
  },
  {
    title: "按新增紀錄",
    description: "完成第一筆後，就能看見今天掌握了多少時間。",
    icon: CheckCircle2,
  },
]

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardPageContent />
    </Suspense>
  )
}

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function DashboardPageContent() {
  const searchParams = useSearchParams()
  const startIntent = searchParams?.get("start")
  const [mounted, setMounted] = useState(false)
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false)
  const [reminderDate, setReminderDate] = useState<Date>(new Date())
  const records = useTimeRecordStore((state) => state.records)
  const getMonthRecords = useTimeRecordStore((state) => state.getMonthRecords)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || startIntent !== "record") return

    setReminderDate(new Date())
    setReminderSheetOpen(true)
  }, [mounted, startIntent])

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const now = new Date()
  const todayKey = format(now, "yyyy-MM-dd")
  const platformContext = getPlatformContextFromSearchParams(searchParams)
  const isSocialWorker = platformContext.audienceMode === "social-worker"
  const caseName = searchParams?.get("caseName")
  const queryString = searchParams?.toString()
  const withCurrentParams = (href: string) => `${href}${queryString ? `?${queryString}` : ""}`
  const monthRecords = getMonthRecords(now.getFullYear(), now.getMonth())
  const metrics = calculateMetrics(monthRecords)
  const todayTrackedHours = calculateTrackedHoursByDate(records, now)
  const hasRecords = records.length > 0
  const todayRecords = records.filter((record) => record.date === todayKey)

  const topShareRecord = todayRecords[0] ?? monthRecords[0]
  const shareScope = todayRecords.length > 0 ? "今天" : "最近"
  const shareHours = todayRecords.length > 0 ? todayTrackedHours : metrics.totalHours
  const shareActivity = topShareRecord ? `，其中一段是「${topShareRecord.activity}」` : ""
  const shareText = `我${shareScope}已掌握 ${shareHours.toFixed(1)} 小時${shareActivity}。先記一段時間，就更清楚自己的生活節奏。`

  const openAddRecordForDate = (date: Date) => {
    setReminderDate(date)
    setReminderSheetOpen(true)
  }

  const openAddRecordToday = () => {
    openAddRecordForDate(now)
  }

  const shareProgress = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
        return
      }

      await navigator.clipboard.writeText(shareText)
      toast.success("已複製分享文字")
    } catch {
      toast.error("目前無法分享，請稍後再試")
    }
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {isSocialWorker ? "社工陪填版" : "我的時間盤點"}
                </span>
                {isSocialWorker && caseName && (
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                    個案：{caseName}
                  </span>
                )}
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  先完成一筆就好
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {isSocialWorker ? "先陪他補上一段時間" : "先補上一段時間，就能開始掌握每一天"}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  不用先理解全部功能。選時間、寫活動、按新增紀錄；完成後再看摘要與報表，慢慢找出自己的時間節奏。
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={openAddRecordToday} size="lg" className="justify-center">
                  <PlusCircle className="h-4 w-4" />
                  {hasRecords ? "新增一筆時間" : "新增第一筆"}
                </Button>
                <Button asChild variant="outline" size="lg" className="justify-center">
                  <Link href={withCurrentParams("/guide")}>
                    <BookOpen className="h-4 w-4" />
                    30 秒看懂
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="justify-center text-emerald-800 hover:text-emerald-900">
                  <Link href={withCurrentParams("/ai")}>
                    <Wand2 className="h-4 w-4" />
                    用一句話整理
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {firstRunSteps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">STEP {index + 1}</p>
                      <p className="text-sm font-semibold text-slate-950">{step.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {hasRecords && (
          <section className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-900">今天的時間掌握感</p>
                <p className="mt-1 text-sm leading-6 text-sky-800/80">
                  已掌握 {todayTrackedHours.toFixed(1)} 小時。覺得有收穫時，可以把這句小成果分享出去。
                </p>
              </div>
              <Button type="button" variant="outline" onClick={shareProgress} className="bg-white">
                <Share2 className="h-4 w-4" />
                分享亮點
              </Button>
            </div>
          </section>
        )}

        {!hasRecords && (
          <section className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900">第一個小任務：只記一段最清楚的時間</p>
                <p className="mt-1 text-sm leading-6 text-amber-800/80">
                  例如「09:00-12:00 上班整理資料」。不用完美，先讓畫面有你的第一筆資料。
                </p>
              </div>
              <Button type="button" onClick={openAddRecordToday} className="shrink-0">
                <ArrowRight className="h-4 w-4" />
                直接開始
              </Button>
            </div>
          </section>
        )}

        <div className="space-y-4">
          {hasRecords && (
            <TimeReminderCard
              records={records}
              onAddRecord={openAddRecordForDate}
              isSocialWorker={isSocialWorker}
            />
          )}

          <DailyCompletion trackedHours={todayTrackedHours} label="今日" />
          {hasRecords && <MetricsCards metrics={metrics} todayTrackedHours={todayTrackedHours} />}
        </div>

        <RecordsList records={records} enableCategoryFilter />
      </div>
      <RecordEntrySheet
        open={reminderSheetOpen}
        onOpenChange={setReminderSheetOpen}
        selectedDate={reminderDate}
      />
    </AppShell>
  )
}
