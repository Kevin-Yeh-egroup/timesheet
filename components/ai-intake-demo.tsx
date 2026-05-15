"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { Mic, Square, Sparkles, Wand2, CheckCircle2, X, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Category } from "@/lib/types"
import { CATEGORIES, CATEGORY_EMOJIS, calculateHoursFromTimeRange, getDefaultTimeRange, getPrimaryCategory, minutesToTimeString, timeStringToMinutes } from "@/lib/types"
import { useTimeRecordStore } from "@/lib/store"
import { parseTimeRecordsWithAI, type AIParsedResult } from "@/lib/ai-intake"
import { toast } from "sonner"

export type { AIParsedResult } from "@/lib/ai-intake"

type IntakeMode = "text" | "voice"
type Phase = "idle" | "converting" | "done"

interface BrowserSpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

const DEMO_SAMPLES = [
  "今天上班8小時、通勤聽英文30分、陪家人1小時、休息2小時",
  "上班9小時\n打掃整理30分\n運動1小時\n朋友聚會2小時",
  "寫作副業2小時、讀書1小時、陪長輩看診1小時",
]

const CAT_COLORS: Record<Category, string> = {
  做事: "bg-slate-100 text-slate-700 border-slate-200",
  照顧: "bg-rose-100 text-rose-700 border-rose-200",
  恢復: "bg-blue-100 text-blue-700 border-blue-200",
  連結: "bg-amber-100 text-amber-700 border-amber-200",
  探索: "bg-green-100 text-green-700 border-green-200",
  工作: "bg-slate-100 text-slate-700 border-slate-200",
  學習: "bg-green-100 text-green-700 border-green-200",
  副業: "bg-purple-100 text-purple-700 border-purple-200",
  人際: "bg-amber-100 text-amber-700 border-amber-200",
  休息: "bg-blue-100 text-blue-700 border-blue-200",
  鍛鍊: "bg-lime-100 text-lime-700 border-lime-200",
}

// ── 單筆可編輯卡片 ──────────────────────────────
interface EditableCardProps {
  record: AIParsedResult
  index: number
  onChange: (index: number, updated: Partial<AIParsedResult>) => void
  onRemove: (index: number) => void
}

function EditableCard({ record, index, onChange, onRemove }: EditableCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-lg border ${CAT_COLORS[record.category].replace("text-", "border-").split(" ").slice(-1)[0]} bg-white`}>
      {/* 主列 */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="text-lg leading-none">{CATEGORY_EMOJIS[record.category]}</span>

        {/* 活動名稱 */}
        <Input
          value={record.activity}
          onChange={(e) => onChange(index, { activity: e.target.value })}
          className="h-7 flex-1 border-transparent bg-transparent px-1 text-sm font-medium focus:border-input focus:bg-white"
          placeholder="活動名稱"
        />

        {/* 分類 select (compact) */}
        <Select
          value={record.category}
          onValueChange={(v) => onChange(index, { category: v as Category })}
        >
          <SelectTrigger className={`h-7 w-20 shrink-0 border-0 px-2 text-xs ${CAT_COLORS[record.category]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {CATEGORY_EMOJIS[c]} {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 時數 */}
        <div className="flex shrink-0 items-center gap-1">
          <Input
            type="number"
            min="0.5"
            step="0.5"
            value={record.hours}
            onChange={(e) => {
              const n = parseFloat(e.target.value)
              if (!Number.isNaN(n)) onChange(index, { hours: Math.min(Math.max(n, 0.5), 16) })
            }}
            className="h-7 w-14 border-transparent bg-transparent px-1 text-right text-sm focus:border-input focus:bg-white"
          />
          <span className="shrink-0 text-xs text-muted-foreground">時</span>
        </div>

        {/* 展開 / 刪除 */}
        <button
          type="button"
          className="ml-1 shrink-0 text-muted-foreground transition-transform hover:text-foreground active:scale-90"
          onClick={() => setExpanded((p) => !p)}
          aria-label="展開詳細"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          className="shrink-0 text-muted-foreground transition-transform hover:text-red-500 active:scale-90"
          onClick={() => onRemove(index)}
          aria-label="移除"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 展開後的附加資訊 */}
      {expanded && (
        <div className="border-t px-3 py-2.5 space-y-2">
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            {record.assets.map((a) => (
              <span key={a} className="rounded bg-muted px-1.5 py-0.5">#{a}</span>
            ))}
            {record.hasOutput && (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">有成果</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 主元件 ──────────────────────────────────────
export function AIIntakeDemo({ onParsed }: { onParsed: (result: AIParsedResult) => void }) {
  const addRecord = useTimeRecordStore((state) => state.addRecord)

  const [mode, setMode] = useState<IntakeMode>("text")
  const [input, setInput] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [parsedList, setParsedList] = useState<AIParsedResult[]>([])
  const [batchSaved, setBatchSaved] = useState(false)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  useEffect(() => {
    return () => { recognitionRef.current?.stop() }
  }, [])

  const canSubmit = useMemo(
    () => input.trim().length > 0 && phase !== "converting",
    [input, phase]
  )

  const totalHours = parsedList.reduce((s, r) => s + r.hours, 0)
  const isMulti = parsedList.length > 1

  const toggleRecording = () => {
    const SpeechCtor = (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition })
      .webkitSpeechRecognition
    if (!SpeechCtor) {
      toast.error("此瀏覽器不支援語音辨識，請改用文字輸入")
      return
    }
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }
    const recognition = new SpeechCtor()
    recognition.lang = "zh-TW"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ""
      setInput((prev) => [prev, transcript].filter(Boolean).join(" ").trim())
    }
    recognition.onerror = () => {
      toast.error("語音辨識失敗，請再試一次")
      setIsRecording(false)
    }
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    toast.success("開始語音輸入，說完再按一次停止")
  }

  const runConvert = async (rawText: string) => {
    if (!rawText.trim()) return
    setPhase("converting")
    setProgress(0)
    setBatchSaved(false)

    let progressValue = 0
    const timer = window.setInterval(() => {
      progressValue = Math.min(progressValue + 8, 88)
      setProgress(progressValue)
    }, 300)

    try {
      const { records: results, source } = await parseTimeRecordsWithAI(rawText)
      window.clearInterval(timer)
      setProgress(100)
      setParsedList(results)
      setInput("")
      setPhase("done")

      const sourceLabel = source === "gemini" ? "AI 已整理完成" : "已用本機規則整理完成"
      if (results.length === 1) {
        onParsed(results[0])
        toast.success(`${sourceLabel}，帶入下方表單確認後儲存`)
      } else {
        toast.success(`${sourceLabel}，辨識出 ${results.length} 筆紀錄`)
      }
    } catch (error) {
      window.clearInterval(timer)
      console.error(error)
      setPhase("idle")
      toast.error("整理時遇到狀況，請稍後再試或先用手動新增")
    }
  }

  const handleConvert = () => { if (canSubmit) void runConvert(input) }

  const handleQuickDemo = () => {
    const sample = DEMO_SAMPLES[Math.floor(Math.random() * DEMO_SAMPLES.length)]
    setInput(sample)
    void runConvert(sample)
  }

  const handleCardChange = (idx: number, updated: Partial<AIParsedResult>) => {
    setParsedList((prev) => prev.map((r, i) => (i === idx ? { ...r, ...updated } : r)))
  }

  const handleCardRemove = (idx: number) => {
    setParsedList((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length === 0) setPhase("idle")
      return next
    })
  }

  const handleSaveAll = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    parsedList.forEach((r) => {
      const fallback = getDefaultTimeRange()
      const fallbackStart = timeStringToMinutes(fallback.startTime) ?? 9 * 60
      const fallbackEnd = Math.min(fallbackStart + r.hours * 60, 24 * 60)
      const timeRange = r.startTime && r.endTime
        ? { startTime: r.startTime, endTime: r.endTime }
        : { startTime: fallback.startTime, endTime: minutesToTimeString(fallbackEnd) }
      const calculatedHours = calculateHoursFromTimeRange(timeRange.startTime, timeRange.endTime)
      addRecord({
        date: today,
        activity: r.activity,
        category: r.category,
        hours: calculatedHours ?? r.hours,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
        difficulty: r.difficulty,
        hasOutput: r.hasOutput,
        outputDescription: r.outputDescription,
        assets: r.assets,
        conversionStatus: r.conversionStatus,
      })
    })
    setBatchSaved(true)
    setParsedList([])
    setPhase("idle")
    toast.success(`✨ ${parsedList.length} 筆時間已記錄為你的累積`)
  }

  return (
    <Card className="border-blue-100 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          快速輸入（語音 / 一句話）
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          用一句話描述今天的時間，用頓號「、」或換行分隔，可一次辨識多筆
        </p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* 批次儲存成功回饋 */}
        {batchSaved && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              所有記錄已儲存為你的時間累積 ✨
            </p>
          </div>
        )}

        {/* 輸入區（解析前才顯示） */}
        {phase !== "done" && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as IntakeMode)}>
            <TabsList className="mb-3">
              <TabsTrigger value="text">文字輸入</TabsTrigger>
              <TabsTrigger value="voice">語音輸入</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="ai-text-input">今天的時間去哪兒了？</Label>
              <Textarea
                id="ai-text-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"例如：上班8小時、通勤聽英文30分、陪家人1小時、休息2小時\n（用頓號或換行分隔可一次記錄多筆）"}
                rows={3}
                className="resize-none bg-white"
              />
            </TabsContent>
            <TabsContent value="voice" className="space-y-2">
              <Label>語音描述今天的時間</Label>
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="按下麥克風開始錄音，或手動輸入"
                  rows={3}
                  className="resize-none bg-white"
                />
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                  className="shrink-0 h-auto"
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              {isRecording && (
                <p className="text-xs text-blue-600 animate-pulse">正在錄音中…說完請按停止</p>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* 整理中進度條 */}
        {phase === "converting" && (
          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Wand2 className="h-4 w-4 animate-pulse" />
              正在整理時間分類…
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* 多筆解析結果 */}
        {phase === "done" && parsedList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                辨識出 {parsedList.length} 筆紀錄
              </p>
              <span className="text-xs text-muted-foreground">
                共 {totalHours} 小時
              </span>
            </div>

            <div className="space-y-2">
              {parsedList.map((record, idx) => (
                <EditableCard
                  key={idx}
                  record={record}
                  index={idx}
                  onChange={handleCardChange}
                  onRemove={handleCardRemove}
                />
              ))}
            </div>

            {/* 分類色條摘要 */}
            {isMulti && (
              <div className="flex h-2 w-full overflow-hidden rounded-full">
                {parsedList.map((r, i) => (
                  <div
                    key={i}
                    className={{
                      做事: "bg-slate-400",
                      照顧: "bg-rose-400",
                      恢復: "bg-blue-400",
                      連結: "bg-amber-400",
                      探索: "bg-green-400",
                    }[getPrimaryCategory(r.category)]}
                    style={{ flex: r.hours }}
                    title={`${r.activity} ${r.hours}h`}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {isMulti ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => { setParsedList([]); setPhase("idle") }}
                  >
                    重新輸入
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 text-sm"
                    onClick={handleSaveAll}
                  >
                    全部新增（{parsedList.length} 筆）
                  </Button>
                </>
              ) : (
                <p className="w-full text-center text-xs text-green-700">
                  已帶入下方表單，確認後按「新增紀錄」儲存
                </p>
              )}
            </div>
          </div>
        )}

        {/* 底部按鈕（輸入階段） */}
        {phase !== "done" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleQuickDemo}
              disabled={phase === "converting"}
            >
              試用示範輸入
            </Button>
            <Button
              type="button"
              className="w-full"
              disabled={!canSubmit}
              onClick={handleConvert}
            >
              AI 整理
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
