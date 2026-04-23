"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Mic, Square, Sparkles, Wand2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    { category: "工作", words: ["客戶", "會議", "需求", "報告", "提案", "專案"] },
    { category: "學習", words: ["學習", "閱讀", "課程", "練習", "研究"] },
    { category: "副業", words: ["副業", "社群", "內容", "寫作", "拍片", "接案"] },
    { category: "人際", words: ["朋友", "家人", "交流", "聚會", "拜訪"] },
    { category: "休息", words: ["休息", "睡", "運動", "散步", "放空"] }
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
      hours = Math.min(Math.max(parsed, 0.5), 8)
    }
  }

  const difficulty = normalized.includes("困難") || normalized.includes("挑戰")
    ? 4
    : normalized.includes("輕鬆") || normalized.includes("簡單")
    ? 2
    : 3

  const hasOutput = ["完成", "產出", "上架", "發布", "交付", "成果"].some((k) => text.includes(k))
  const conversionStatus: ConversionStatus = hasOutput ? "已開始嘗試" : "尚未啟動"

  const assets: Asset[] = []
  if (["學習", "副業", "工作"].includes(category)) assets.push("硬實力")
  if (["人際", "副業"].includes(category)) assets.push("軟實力")
  if (category === "休息") assets.push("體力")
  if (hasOutput) assets.push("工具/副業基礎")

  return {
    activity: text || "AI 自動建立活動",
    category,
    hours,
    difficulty,
    assets: Array.from(new Set(assets)),
    hasOutput,
    conversionStatus,
    outputDescription: hasOutput ? "由 AI 輸入流程推測產出" : undefined
  }
}

const DEMO_SAMPLES = [
  "今天花 2 小時整理客戶需求並完成初版提案",
  "晚上用 1.5 小時製作副業短影片並已上架",
  "花 1 小時閱讀課程內容，整理了學習重點"
]

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
    const duration = 4000
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
        toast.success("AI 已完成分類，已帶入下方新增紀錄")
      }
    }, 120)
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

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI 智慧輸入（Demo 概念）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as IntakeMode)}>
          <TabsList>
            <TabsTrigger value="text">文字輸入</TabsTrigger>
            <TabsTrigger value="voice">語音輸入</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-2">
            <Label htmlFor="ai-text-input">一句話描述今天做了什麼</Label>
            <Input
              id="ai-text-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：今天花 2 小時整理客戶需求並完成初版提案"
            />
          </TabsContent>
          <TabsContent value="voice" className="space-y-2">
            <Label htmlFor="ai-voice-text">語音轉文字內容</Label>
            <div className="flex gap-2">
              <Input
                id="ai-voice-text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="按下開始錄音，或手動補上內容"
              />
              <Button type="button" variant={isRecording ? "destructive" : "outline"} onClick={toggleRecording}>
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {phase === "converting" && (
          <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wand2 className="h-4 w-4 animate-pulse" />
              AI 正在分析與分類中（約 4 秒）
            </div>
            <Progress value={progress} />
          </div>
        )}

        {phase === "done" && lastParsed && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <p className="font-medium">已建立紀錄：{lastParsed.activity}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{lastParsed.category}</Badge>
              <Badge variant="outline">{lastParsed.hours} 小時</Badge>
              <Badge variant="outline">難度 {lastParsed.difficulty}</Badge>
            </div>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={handleQuickDemo} disabled={phase === "converting"}>
            一鍵啟動示意（免輸入）
          </Button>
          <Button type="button" className="w-full" disabled={!canSubmit} onClick={handleConvert}>
            送出並啟動 AI 轉換
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
