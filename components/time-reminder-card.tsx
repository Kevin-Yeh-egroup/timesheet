"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, BellRing, CalendarPlus } from "lucide-react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { TimeRecord } from "@/lib/types"
import { getTimeReminders } from "@/lib/insights"

interface TimeReminderCardProps {
  records: TimeRecord[]
  onAddRecord: (date: Date) => void
  isSocialWorker?: boolean
}

function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported"
  return Notification.permission
}

export function TimeReminderCard({ records, onAddRecord, isSocialWorker = false }: TimeReminderCardProps) {
  const reminders = useMemo(() => getTimeReminders(records), [records])
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported")

  useEffect(() => {
    setPermission(getNotificationPermission())
  }, [])

  useEffect(() => {
    if (permission !== "granted" || reminders.length === 0) return

    const today = format(new Date(), "yyyy-MM-dd")
    const reminderKey = `time-reminder-notified-${today}-${reminders.map((item) => item.id).join("-")}`
    if (window.localStorage.getItem(reminderKey)) return

    const firstReminder = reminders[0]
    new Notification(firstReminder.title, {
      body: firstReminder.message,
      tag: "time-record-reminder",
    })
    window.localStorage.setItem(reminderKey, "true")
  }, [permission, reminders])

  const requestPermission = async () => {
    if (getNotificationPermission() === "unsupported") return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  if (reminders.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50/70">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">時間記錄提醒</p>
              <p className="text-xs text-amber-800/80">
                {isSocialWorker
                  ? "可陪同服務對象補上仍記得的時間片段，讓個案歷程更完整。"
                  : "像記帳一樣，固定補上一點時間，會更容易看見累積。"}
              </p>
            </div>
          </div>
          {permission === "default" && (
            <Button size="sm" variant="outline" onClick={requestPermission} className="shrink-0 bg-white/70">
              <Bell className="mr-1.5 h-3.5 w-3.5" />
              開啟通知
            </Button>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="rounded-lg border border-amber-200 bg-white/75 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {reminder.message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {format(reminder.date, "M月d日（EEE）", { locale: zhTW })}
                  </p>
                </div>
                <Button size="sm" onClick={() => onAddRecord(reminder.date)} className="shrink-0">
                  <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                  補記
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
