"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Mic, Square, Sparkles, Wand2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Asset, Category, ConversionStatus } from "@/lib/types"
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

function parseToRecord(rawInput: string): AIParsedResult {
  const text = rawInput.trim()
  const normalized = text.toLowerCase()

  const keywordMap: Array<{ category: Category; words: string[] }> = [
    { category: "工作", words: ["上班", "客戶", "會議", "需求", "報告", "提案", "專案", "工作"] },
    { category: "學習", words: ["學習", "閱讀", "課程", "練習", "研究", "讀書", "看書"] },
    { category: "副業", words: ["副業", "社群", "內容", "寫作", "拍片", "接案", "創作"] },
    { category: "人際", words: ["朋友", "家人", "孩子", "伴侶", "交流", "聚會", "拜訪", "陪", "相處"] },
    { category: "休息", words: ["休息", "睡", "運動", "散步", "放空", "放鬆", "健身", "冥想"] }
  ]

  const matchedCategory = keywordMap.find((item) =>
    item.words.some((word) => normalized.includes(word))
  )?.category
  const category: Category = matchedCategory ?? "學習"

  let hours = 1
  const hourMatch = text.match(/(\d+(\.\d+)?)\s*(小時|hr|hrs|h)/i) ?? text.match(/(\d+(\.\d+)?)/)
  if (hourMatch?.[1]) {
    const parsed = parseFloat(hourMatch[1])
    if (!Number.isNaN(parsed)) {
      hours = Math.min(Math.max(parsed, 0.5), 12)
    }
  }

  const difficulty = normalized.includes("困難") || normalized.includes("挑戰") || normalized.includes("較難")
    ? 4
    : normalized.includes("輕鬆") || normalized.includes("簡單") || normalized.includes("容易")
    ? 2
    : 3

  const hasOutput = ["完成", "產出", "上架", "發布", "交付", "成果", "寫完", "做好"].some((k) => text.includes(k))
  const conversionStatus: ConversionStatus = hasOutput ? "已開始嘗試" : "尚未轉換"

  const assets: Asset[] = []
  if (["學習", "副業", "工作"].includes(category)) assets.push("硬實力")
  if (["人際", "副業"].includes(category)) assets.push("軟實力")
  if (category === "休息") assets.push("體力")
  if (hasOutput) assets.push("工具/副業基礎")

  return {
    activity: text.length > 30 ? text.slice(0, 30) + "…" : text || "今日活動",
    category,
    hours,
    difficulty,
    assets: Array.from(new Set(assets)),
    hasOutput,
    conversionStatus,
    outputDescription: hasOutput ? "由快速輸入推測產出" : undefined
  }
}

const DEMO_SAMPLES = [
  "今天上班 8 小時、學習 1 小時、陪家人 1 小時、休息 2 小時",
  "晚上用 1.5 小時製作副業短影片並已上架",
  "花 1 小時閱讀課程內容，整理了學習重點"
]

const TIME_VALUE_COLORS: Record<string, string> = {
  "工作": "bg-slate-100 text-slate-700",
  "學習": "bg-green-100 text-green-700",
  "副業": "bg-purple-100 text-purple-700",
  "人際": "bg-amber-100 text-amber-700",
  "休息": "bg-blue-100 text-blue-700",
}

export function AIIntakeDemo({ onParsed }: { onParsed: (result: AIParsedResult) => void }) {
  const [mode, setMode] = useState<IntakeMode>("text")
  const [input, setInput] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [lastParsed, setLastParsed] = useState<AIParsedResult | null>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const canSubmit = useMemo(() => input.trim().length > 0 && phase !== "converting", [input, phase])

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

    const start = Date.now()
    const duration = 3000
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start
      const percent = Math.min((elapsed / duration) * 100, 100)
      setProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        const parsed = parseToRecord(rawText)
        onParsed(parsed)
        setLastParsed(parsed)
        setInput("")
        setPhase("done")
        toast.success("已整理完成，帶入下方紀錄表單")
      }
    }, 80)
  }

  const handleConvert = () => {
    if (!canSubmit) return
    runConvert(input)
  }

  const handleQuickDemo = () => {
    const sample = DEMO_SAMPLES[Math.floor(Math.random() * DEMO_SAMPLES.length)]
    setInput(sample)
    runConvert(sample)
  }

  const difficultyLabel = (d: number) => d <= 2 ? "輕鬆" : d === 3 ? "中等" : "較有挑戰"

  return (
    <Card className="border-blue-100 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-500" />
          快速輸入（語音 / 一句話）
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          用一句話描述今天做了什麼，系統自動整理為結構化紀錄
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
              placeholder="例如：今天上班8小時、學習1小時、陪家人1小時、休息2小時"
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

        {phase === "converting" && (
          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Wand2 className="h-4 w-4 animate-pulse" />
              正在整理你的時間紀錄…
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {phase === "done" && lastParsed && (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800">解析結果預覽</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{lastParsed.activity}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className={`text-xs border-0 ${TIME_VALUE_COLORS[lastParsed.category] || ""}`}>
                  {lastParsed.category}
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  {lastParsed.hours} 小時
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  {difficultyLabel(lastParsed.difficulty)}
                </Badge>
                {lastParsed.hasOutput && (
                  <Badge variant="outline" className="text-xs bg-white text-green-700 border-green-300">
                    有產出
                  </Badge>
                )}
              </div>
              {lastParsed.assets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {lastParsed.assets.map(a => (
                    <span key={a} className="text-xs text-muted-foreground">#{a}</span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-green-700">已帶入下方表單，請確認後按「新增紀錄」儲存</p>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={handleQuickDemo} disabled={phase === "converting"}>
            試用示範輸入
          </Button>
          <Button type="button" className="w-full" disabled={!canSubmit} onClick={handleConvert}>
            AI 整理
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
