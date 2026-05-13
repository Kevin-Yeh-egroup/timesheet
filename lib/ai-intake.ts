import type { Asset, Category, ConversionStatus } from "@/lib/types"
import { calculateHoursFromTimeRange, isValidTimeString, minutesToTimeString } from "@/lib/types"

export interface AIParsedResult {
  activity: string
  category: Category
  hours: number
  startTime?: string
  endTime?: string
  difficulty: number
  assets: Asset[]
  hasOutput: boolean
  conversionStatus: ConversionStatus
  outputDescription?: string
}

interface AIParseResponse {
  records: AIParsedResult[]
}

export type AIParseSource = "gemini" | "local"

export interface AIParseResult {
  source: AIParseSource
  records: AIParsedResult[]
}

const CATEGORIES: Category[] = ["工作", "學習", "副業", "人際", "休息", "鍛鍊"]
const ASSETS: Asset[] = ["體力", "軟實力", "硬實力", "存款增加", "收入", "工具/副業基礎"]
const CONVERSION_STATUSES: ConversionStatus[] = ["尚未轉換", "已開始嘗試", "已有成果"]

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
  const hourMatch = text.match(/(\d+(\.\d+)?)\s*(小時|hr|hrs|h\b)/i)
  if (hourMatch?.[1]) {
    const n = parseFloat(hourMatch[1])
    if (!Number.isNaN(n)) return Math.min(Math.max(n, 0.5), 16)
  }

  const minuteMatch = text.match(/(\d+(\.\d+)?)\s*(分鐘|分|mins?|m\b)/i)
  if (minuteMatch?.[1]) {
    const n = parseFloat(minuteMatch[1]) / 60
    if (!Number.isNaN(n)) return Math.min(Math.max(Math.round(n * 2) / 2, 0.5), 16)
  }

  const numberMatch = text.match(/(\d+(\.\d+)?)/)
  if (numberMatch?.[1]) {
    const n = parseFloat(numberMatch[1])
    if (!Number.isNaN(n)) return Math.min(Math.max(n, 0.5), 16)
  }

  return 1
}

function extractActivity(text: string): string {
  const cleaned = text
    .replace(/^(今天|今日|剛剛|昨天|這段|這)/g, "")
    .replace(/(\d+(\.\d+)?)\s*(小時|hr|hrs|h\b|分鐘|分|mins?|m\b)/gi, "")
    .replace(/[、，；;。\s]+/g, "")
    .trim()
  return cleaned.slice(0, 20) || text.slice(0, 20)
}

function extractTimeRange(text: string): { startTime?: string; endTime?: string } {
  const colonMatch = text.match(/([0-2]?\d:[0-5]\d)\s*(?:-|到|至|~|～)\s*([0-2]?\d:[0-5]\d|24:00)/)
  if (colonMatch?.[1] && colonMatch[2]) {
    const normalize = (value: string) => {
      const [hour, minute] = value.split(":")
      return `${hour.padStart(2, "0")}:${minute}`
    }
    return {
      startTime: normalize(colonMatch[1]),
      endTime: normalize(colonMatch[2]),
    }
  }

  const hourMatch = text.match(/([0-2]?\d)\s*點\s*(?:到|至|-|~|～)\s*([0-2]?\d)\s*點/)
  if (hourMatch?.[1] && hourMatch[2]) {
    return {
      startTime: minutesToTimeString(Number(hourMatch[1]) * 60),
      endTime: minutesToTimeString(Number(hourMatch[2]) * 60),
    }
  }

  return {}
}

function parseSegment(seg: string): AIParsedResult {
  const category = detectCategory(seg)
  const timeRange = extractTimeRange(seg)
  const rangeHours = calculateHoursFromTimeRange(timeRange.startTime, timeRange.endTime)
  const hours = rangeHours ?? extractHours(seg)
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
  if (category === "休息" || category === "鍛鍊") assets.push("體力")
  if (hasOutput) assets.push("工具/副業基礎")

  return {
    activity: extractActivity(seg) || category,
    category,
    hours,
    startTime: timeRange.startTime,
    endTime: timeRange.endTime,
    difficulty,
    assets: Array.from(new Set(assets)),
    hasOutput,
    conversionStatus,
    outputDescription: hasOutput ? "由快速輸入推測產出" : undefined,
  }
}

function parseMultipleRecordsLocally(rawInput: string): AIParsedResult[] {
  const segments = rawInput
    .split(/[、，；;\n。]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)

  if (segments.length <= 1) {
    return [parseSegment(rawInput.trim())]
  }

  return segments.map(parseSegment)
}

function clampHours(hours: number): number {
  if (!Number.isFinite(hours)) return 1
  return Math.min(Math.max(Math.round(hours * 2) / 2, 0.5), 16)
}

function normalizeRecord(record: Partial<AIParsedResult>, fallbackText: string): AIParsedResult {
  const category = CATEGORIES.includes(record.category as Category)
    ? record.category as Category
    : detectCategory(record.activity || fallbackText)

  const assets = Array.isArray(record.assets)
    ? Array.from(new Set(record.assets.filter((asset): asset is Asset => ASSETS.includes(asset as Asset))))
    : []

  const hasOutput = Boolean(record.hasOutput)
  const startTime = record.startTime && isValidTimeString(record.startTime) ? record.startTime : undefined
  const endTime = record.endTime && isValidTimeString(record.endTime) ? record.endTime : undefined
  const rangeHours = calculateHoursFromTimeRange(startTime, endTime)
  const conversionStatus = CONVERSION_STATUSES.includes(record.conversionStatus as ConversionStatus)
    ? record.conversionStatus as ConversionStatus
    : hasOutput
      ? "已開始嘗試"
      : "尚未轉換"

  return {
    activity: (record.activity || extractActivity(fallbackText) || category).slice(0, 40),
    category,
    hours: rangeHours ?? clampHours(Number(record.hours)),
    startTime: rangeHours !== null ? startTime : undefined,
    endTime: rangeHours !== null ? endTime : undefined,
    difficulty: Math.min(Math.max(Math.round(Number(record.difficulty) || 3), 1), 5),
    assets,
    hasOutput,
    conversionStatus,
    outputDescription: hasOutput ? record.outputDescription : undefined,
  }
}

function extractJson(text: string): AIParseResponse {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
  return JSON.parse(cleaned) as AIParseResponse
}

async function parseWithGemini(rawInput: string, apiKey: string): Promise<AIParsedResult[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "你是時間資產轉換系統的整理助手。",
                  "請把使用者輸入的中文語音轉文字或文字描述，整理成一到多筆時間紀錄。",
                  "分類只能是：工作、學習、副業、人際、休息、鍛鍊。",
                  "assets 只能從：體力、軟實力、硬實力、存款增加、收入、工具/副業基礎 中選擇，可為空陣列。",
                  "difficulty 是 1 到 5，語氣保持觀察與支持，不要使用評分、扣分、浪費、低效等概念。",
                  "conversionStatus 只能是：尚未轉換、已開始嘗試、已有成果。",
                  "若輸入包含多個事件，請拆成多筆 records。",
                  "只回傳 JSON，不要加說明文字。",
                  `使用者輸入：${rawInput}`,
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              records: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    activity: { type: "STRING" },
                    category: { type: "STRING", enum: CATEGORIES },
                    hours: { type: "NUMBER" },
                    startTime: { type: "STRING" },
                    endTime: { type: "STRING" },
                    difficulty: { type: "NUMBER" },
                    assets: { type: "ARRAY", items: { type: "STRING", enum: ASSETS } },
                    hasOutput: { type: "BOOLEAN" },
                    conversionStatus: { type: "STRING", enum: CONVERSION_STATUSES },
                    outputDescription: { type: "STRING" },
                  },
                  required: ["activity", "category", "hours", "difficulty", "assets", "hasOutput", "conversionStatus"],
                },
              },
            },
            required: ["records"],
          },
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API failed: ${response.status}`)
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini API returned no text")

  const parsed = extractJson(text)
  if (!Array.isArray(parsed.records) || parsed.records.length === 0) {
    throw new Error("Gemini API returned no records")
  }

  return parsed.records.map((record) => normalizeRecord(record, rawInput))
}

export async function parseTimeRecordsWithAI(rawInput: string): Promise<AIParseResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (apiKey) {
    try {
      return {
        source: "gemini",
        records: await parseWithGemini(rawInput, apiKey),
      }
    } catch (error) {
      console.warn("Gemini parsing failed, falling back to local parser", error)
    }
  }

  return {
    source: "local",
    records: parseMultipleRecordsLocally(rawInput),
  }
}
