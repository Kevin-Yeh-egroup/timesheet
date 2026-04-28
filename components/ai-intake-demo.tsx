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
import type { Asset, Category, ConversionStatus } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import { useTimeRecordStore } from "@/lib/store"
import { toast } from "sonner"

type IntakeMode = "text" | "voice"
type Phase = "idle" | "converting" | "done"

export interface AIParsedResult {
  activity: string
  category: Category
  hours: number
  difficulty: number
  assets: Asset[]
  hasOutput: boolean
  conversionStatus: ConversionStatus
  outputDescription?: string
}

interface BrowserSpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

const KEYWORD_MAP: Array<{ category: Category; words: string[] }> = [
  { category: "工作", words: ["上班", "客戶", "會議", "需求", "報告", "提案", "專案", "工作", "辦公"] },
  { category: "學習", words: ["學習", "閱讀", "課程", "練習", "研究", "讀書", "看書", "進修", "備課"] },
  { category: "副業", words: ["副業", "社群", "內容", "寫作", "拍片", "接案", "創作", "接稿", "接單"] },
  { category: "人際", words: ["朋友", "家人", "孩子", "伴侶", "交流", "聚會", "拜訪", "陪", "相處", "聊天"] },
  { category: "鍛鍊", words: ["運動", "健身", "跑步", "重訓", "瑜珈", "走路", "散步", "游泳", "騎車", "鍛鍊", "體能", "球", "爬山"] },
  { category: "休息", words: ["休息", "睡", "放空", "放鬆", "冥想", "午休", "躺"] },
]

function detectCategory(text: string): Category {
  const normalized = text.toLowerCase()
  return KEYWORD_MAP.find((item) =>
    item.words.some((word) => normalized.includes(word))
  )?.category ?? "工作"
}

function extractHours(text: string): number {
  const match =
    text.match(/(\d+(\.\d+)?)\s*(小時|hr|hrs|h\b)/i) ??
    text.match(/(\d+(\.\d+)?)/)
  if (match?.[1]) {
    const n = parseFloat(match[1])
    if (!Number.isNaN(n)) return Math.min(Math.max(n, 0.5), 16)
  }
  return 1
}

function extractActivity(text: string): string {
  const cleaned = text
    .replace(/^(今天|今日|剛剛|昨天|這段|這)/g, "")
    .replace(/(\d+(\.\d+)?)\s*(小時|hr|hrs|h\b)/gi, "")
    .replace(/[、，；;。\s]+/g, "")
    .trim()
  return cleaned.slice(0, 20) || text.slice(0, 20)
}

function parseSegment(seg: string): AIParsedResult {
  const category = detectCategory(seg)
  const hours = extractHours(seg)
  const normalized = seg.toLowerCase()

  const difficulty =
    normalized.includes("困難") || normalized.includes("挑戰") || normalized.includes("較難")
      ? 4
      : normalized.includes("輕鬆") || normalized.includes("簡單") || normalized.includes("容易")
      ? 2
      : 3

  const hasOutput = ["完成", "產出", "上架", "發布", "交付", "成果", "寫完", "做好"].some((k) =>
    seg.includes(k)
  )
  const conversionStatus: ConversionStatus = hasOutput ? "已開始嘗試" : "尚未轉換"

  const assets: Asset[] = []
  if (["學習", "副業", "工作"].includes(category)) assets.push("硬實力")
  if (["人際", "副業"].includes(category)) assets.push("軟實力")
  if (category === "休息") assets.push("體力")
  if (hasOutput) assets.push("工具/副業基礎")

  return {
    activity: extractActivity(seg) || category,
    category,
    hours,
    difficulty,
    assets: Array.from(new Set(assets)),
    hasOutput,
    conversionStatus,
    outputDescription: hasOutput ? "由快速輸入推測產出" : undefined,
  }
}

function parseMultipleRecords(rawInput: string): AIParsedResult[] {
  // Split by common natural-language delimiters
  const segments = rawInput
    .split(/[、，；;\n。]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)

  if (segments.length <= 1) {
    return [parseSegment(rawInput.trim())]
  }
  return segments.map(parseSegment)
}

const DEMO_SAMPLES = [
  "今天上班8小時、學習1小時、陪家人1小時、休息2小時",
  "上班9小時\n學習30分\n運動1小時\n朋友聚會2小時",
  "寫作副業2小時、讀書1小時、健身1小時",
]

const CAT_COLORS: Record<Category, string> = {
  工作: "bg-slate-100 text-slate-700 border-slate-200",
  學習: "bg-green-100 text-green-700 border-green-200",
  副業: "bg-purple-100 text-purple-700 border-purple-200",
  人際: "bg-amber-100 text-amber-700 border-amber-200",
  休息: "bg-blue-100 text-blue-700 border-blue-200",
  鍛鍊: "bg-lime-100 text-lime-700 border-lime-200",
}

const CAT_EMOJI: Record<Category, string> = {
  工作: "💼", 學習: "📚", 副業: "🌱", 人際: "💛", 休息: "🌿", 鍛鍊: "🏃",
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
        <span className="text-lg leading-none">{CAT_EMOJI[record.category]}</span>

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
                {CAT_EMOJI[c]} {c}
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
          className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((p) => !p)}
          aria-label="展開詳細"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          className="shrink-0 text-muted-foreground hover:text-red-500"
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

  const runConvert = (rawText: string) => {
    if (!rawText.trim()) return
    setPhase("converting")
    setProgress(0)
    setBatchSaved(false)

    const start = Date.now()
    const duration = 1800
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start
      const percent = Math.min((elapsed / duration) * 100, 100)
      setProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        const results = parseMultipleRecords(rawText)
        setParsedList(results)
        setInput("")
        setPhase("done")
        // 單筆：延用原本表單 prefill 行為
        if (results.length === 1) {
          onParsed(results[0])
          toast.success("已整理完成，帶入下方表單確認後儲存")
        } else {
          toast.success(`辨識出 ${results.length} 筆紀錄，確認後一鍵新增`)
        }
      }
    }, 60)
  }

  const handleConvert = () => { if (canSubmit) runConvert(input) }

  const handleQuickDemo = () => {
    const sample = DEMO_SAMPLES[Math.floor(Math.random() * DEMO_SAMPLES.length)]
    setInput(sample)
    runConvert(sample)
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
      addRecord({
        date: today,
        activity: r.activity,
        category: r.category,
        hours: r.hours,
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
                placeholder={"例如：上班8小時、學習1小時、陪家人1小時、休息2小時\n（用頓號或換行分隔可一次記錄多筆）"}
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
              正在辨識時間分類…
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
                      工作: "bg-slate-400",
                      學習: "bg-green-400",
                      副業: "bg-purple-400",
                      人際: "bg-amber-400",
                      休息: "bg-blue-400",
                      鍛鍊: "bg-lime-400",
                    }[r.category]}
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
