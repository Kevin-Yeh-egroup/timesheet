"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import type { Metrics, TimeRecord, YesterdayInsights, WeeklyInsights } from "@/lib/types"
import {
  getDailyFeedback, getMonthSuggestions, getMonthTypology,
  getCompletionInfo, calculateMetrics, getYesterdayInsights, getWeeklyInsights,
} from "@/lib/types"
import { getYesterday, toDateKey } from "@/lib/date-utils"

interface ReflectionInsightsProps {
  metrics: Metrics
  records: TimeRecord[]
}

const CATEGORY_COLORS: Record<string, string> = {
  "做事": "bg-blue-400",
  "照顧": "bg-rose-400",
  "恢復": "bg-slate-400",
  "連結": "bg-amber-400",
  "探索": "bg-green-400",
  "工作": "bg-blue-400",
  "學習": "bg-green-400",
  "副業": "bg-orange-400",
  "人際": "bg-amber-400",
  "休息": "bg-slate-400",
  "鍛鍊": "bg-lime-400",
}

// ─── 昨日 Tab ───────────────────────────────
function YesterdayTab({ insights, records }: { insights: YesterdayInsights; records: TimeRecord[] }) {
  const completionInfo = getCompletionInfo(insights.trackedHours)
  const yesterdayRecs = (() => {
    const ds = toDateKey(getYesterday())
    return records.filter(r => r.date === ds)
  })()
  const metrics = calculateMetrics(yesterdayRecs)
  const feedback = getDailyFeedback(metrics, yesterdayRecs)

  // 溫和建議
  const suggestion = (() => {
    if (insights.trackedHours === 0) return "今天可以嘗試記錄昨天的時間，讓累積更清晰。"
    if (!insights.hasRest && !insights.hasExercise) return "昨天看起來還沒有恢復類的記錄，今天可以留一點時間給身體或情緒安定。"
    if (!insights.hasRest && insights.hasExercise) return "昨天有運動很好，也可以安排一些放鬆的休息時間，讓身體充分恢復。"
    if (!insights.hasLearning && !insights.hasWork) return "昨天主要在恢復或照顧生活，今天可以加入一點做事或探索的投入。"
    if (insights.categoryBreakdown.length === 1) return "昨天集中在單一類別，今天可以嘗試加入其他面向的時間。"
    return "昨天的配置不錯，今天繼續保持這樣的節奏。"
  })()

  return (
    <div className="space-y-4">
      {/* 24小時完整度 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">昨日記錄完整度</span>
          <span className={`text-xs font-semibold ${completionInfo.color}`}>
            {insights.trackedHours.toFixed(1)} / 24 小時
          </span>
        </div>
        <Progress value={completionInfo.rate} className="h-2.5" />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{completionInfo.label}</span>
          <span>{completionInfo.rate.toFixed(0)}%</span>
        </div>
      </div>

      {/* 類別分布 mini-bar */}
      {insights.categoryBreakdown.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">昨日時間分配</p>
          {insights.categoryBreakdown.map(({ category, hours }) => (
            <div key={category} className="flex items-center gap-2">
              <span className="w-8 text-right text-[11px] text-muted-foreground shrink-0">{category}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[category] ?? "bg-gray-400"}`}
                  style={{ width: `${Math.min((hours / 24) * 100, 100)}%` }}
                />
              </div>
              <span className="w-10 text-[11px] text-muted-foreground shrink-0 text-right">{hours}h</span>
            </div>
          ))}
        </div>
      )}

      {/* 正向回饋 */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-sm text-blue-800 leading-relaxed">💡 {feedback}</p>
      </div>

      {/* 溫和建議 */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
        {suggestion}
      </div>
    </div>
  )
}

// ─── 本週 Tab ───────────────────────────────
function WeekTab({ insights, records }: { insights: WeeklyInsights; records: TimeRecord[] }) {
  const weekRecs = (() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    return records.filter(r => new Date(r.date + "T00:00:00") >= sevenDaysAgo)
  })()
  const weekMetrics = calculateMetrics(weekRecs)

  const mostActiveDayLabel = insights.mostActiveDayDate
    ? format(new Date(insights.mostActiveDayDate + "T12:00:00"), "M月d日（EEE）", { locale: zhTW })
    : "—"

  const mainObs = (() => {
    if (insights.totalHours === 0) return "本週尚無紀錄，隨時可以開始。"
    if (insights.totalHours > 30) return `本週投入充實，共記錄 ${insights.totalHours.toFixed(1)} 小時，很棒！`
    if (insights.outputCount > 2) return `本週有 ${insights.outputCount} 筆有成果的活動，累積正在發生。`
    if (insights.weekRecordCount >= 3) return `本週已記錄 ${insights.weekRecordCount} 筆，保持記錄的習慣很重要。`
    return `本週開始累積，繼續下去就能看見變化。`
  })()

  const suggestion = (() => {
    const exerciseHours = weekRecs.filter(r => ["運動", "健身", "跑步", "走路", "散步"].some(k => r.activity.includes(k))).reduce((s, r) => s + r.hours, 0)
    if (weekMetrics.restHours < 3 && exerciseHours < 1) return "本週恢復與運動時間較少，可以安排一些散步、睡眠或放鬆活動。"
    if (weekMetrics.learningHours < 2) return "可以嘗試在本週加入一些探索時間，例如閱讀、聽課或整理想法。"
    if (weekMetrics.relationshipHours === 0) return "本週還沒有連結或照顧的記錄，可以安排一些與家人、朋友或社區互動的時間。"
    return "本週節奏不錯，繼續保持。"
  })()

  return (
    <div className="space-y-4">
      {/* 本週總覽數字 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "本週時數", value: `${insights.totalHours.toFixed(1)}h` },
          { label: "最投入日", value: mostActiveDayLabel },
          { label: "有成果", value: `${insights.outputCount} 筆` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-muted/30 p-2.5 text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* 類別時數分布 */}
      {insights.categoryBreakdown.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">本週時間分配</p>
          {insights.categoryBreakdown.map(({ category, hours }) => {
            const pct = insights.totalHours > 0 ? (hours / insights.totalHours) * 100 : 0
            return (
              <div key={category} className="flex items-center gap-2">
                <span className="w-8 text-right text-[11px] text-muted-foreground shrink-0">{category}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${CATEGORY_COLORS[category] ?? "bg-gray-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-14 text-[11px] text-muted-foreground shrink-0 text-right">{hours.toFixed(1)}h ({pct.toFixed(0)}%)</span>
              </div>
            )
          })}
        </div>
      )}

      {/* 本週觀察 */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-sm text-blue-800 leading-relaxed">💡 {mainObs}</p>
      </div>

      {/* 本週建議 */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
        {suggestion}
      </div>
    </div>
  )
}

// ─── 本月 Tab ───────────────────────────────
function MonthTab({ metrics, records }: { metrics: Metrics; records: TimeRecord[] }) {
  const typology = getMonthTypology(metrics)
  const suggestions = getMonthSuggestions(metrics)
  const dailyFeedback = getDailyFeedback(metrics, records)

  return (
    <div className="space-y-4">
      {/* 本月型態描述 */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs font-semibold text-blue-600 mb-1">本月時間型態</p>
        <p className="text-sm text-blue-800 leading-relaxed">{typology}</p>
      </div>

      {/* 系統觀察一句話 */}
      <div className="rounded-lg bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground leading-relaxed">💡 {dailyFeedback}</p>
      </div>

      {/* 本月建議 */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">來月的溫和建議</p>
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── 主元件 ───────────────────────────────
export function ReflectionInsights({ metrics, records }: ReflectionInsightsProps) {
  const yesterdayInsights = getYesterdayInsights(records)
  const weeklyInsights = getWeeklyInsights(records)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-blue-500" />
          觀察與建議
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="yesterday">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="yesterday" className="flex-1">昨日</TabsTrigger>
            <TabsTrigger value="week" className="flex-1">本週</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">本月</TabsTrigger>
          </TabsList>

          <TabsContent value="yesterday">
            <YesterdayTab insights={yesterdayInsights} records={records} />
          </TabsContent>

          <TabsContent value="week">
            <WeekTab insights={weeklyInsights} records={records} />
          </TabsContent>

          <TabsContent value="month">
            <MonthTab metrics={metrics} records={records} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
