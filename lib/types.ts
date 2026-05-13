import { getYesterday, toDateKey } from "@/lib/date-utils"

export type Category = "工作" | "學習" | "副業" | "人際" | "休息" | "鍛鍊"

export type TimeValueType = "成長型" | "生產型" | "恢復型" | "關係型" | "彈性型"

export type IntangibleAsset = "體力" | "軟實力" | "硬實力"
export type TangibleAsset = "存款增加" | "收入" | "工具/副業基礎"
export type Asset = IntangibleAsset | TangibleAsset

export type ConversionStatus = "尚未轉換" | "已開始嘗試" | "已有成果"

export interface TimeRecord {
  id: string
  date: string
  activity: string
  category: Category
  hours: number
  startTime?: string
  endTime?: string
  difficulty: number // 1-5
  hasOutput: boolean
  outputDescription?: string
  assets: Asset[]
  conversionStatus: ConversionStatus
  createdAt: string
}

export interface Metrics {
  totalHours: number
  difficultyScore: number
  avgDifficulty: number
  assetPoints: number
  intangibleAssetCount: number
  tangibleAssetCount: number
  outputRecordCount: number
  conversionRate: number
  highDifficultyRatio: number
  productiveHours: number
  productiveRatio: number
  valuableTimeRatio: number
  restHours: number
  learningHours: number
  relationshipHours: number
  exerciseHours: number
}

export const CATEGORIES: Category[] = ["工作", "學習", "副業", "人際", "休息", "鍛鍊"]

export const INTANGIBLE_ASSETS: IntangibleAsset[] = ["體力", "軟實力", "硬實力"]
export const TANGIBLE_ASSETS: TangibleAsset[] = ["存款增加", "收入", "工具/副業基礎"]
export const ALL_ASSETS: Asset[] = [...INTANGIBLE_ASSETS, ...TANGIBLE_ASSETS]

export const CONVERSION_STATUSES: ConversionStatus[] = [
  "尚未轉換",
  "已開始嘗試",
  "已有成果"
]

export const TIME_OPTIONS: string[] = Array.from({ length: 49 }, (_, index) => {
  const totalMinutes = index * 30
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
})

export function isValidTimeString(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) || value === "24:00"
}

export function timeStringToMinutes(value: string): number | null {
  if (!isValidTimeString(value)) return null
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToTimeString(totalMinutes: number): string {
  const clamped = Math.min(Math.max(totalMinutes, 0), 24 * 60)
  const hours = Math.floor(clamped / 60)
  const minutes = clamped % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function calculateHoursFromTimeRange(startTime?: string, endTime?: string): number | null {
  if (!startTime || !endTime) return null
  const start = timeStringToMinutes(startTime)
  const end = timeStringToMinutes(endTime)
  if (start === null || end === null || end <= start) return null
  return Math.round(((end - start) / 60) * 2) / 2
}

export function getEndTimeOptions(startTime: string): string[] {
  const start = timeStringToMinutes(startTime)
  if (start === null) return TIME_OPTIONS.slice(1)
  return TIME_OPTIONS.filter((option) => {
    const minutes = timeStringToMinutes(option)
    return minutes !== null && minutes > start
  })
}

export function getDefaultTimeRange(referenceDate = new Date()): { startTime: string; endTime: string } {
  const roundedMinutes = Math.floor((referenceDate.getHours() * 60 + referenceDate.getMinutes()) / 30) * 30
  const startMinutes = Math.min(Math.max(roundedMinutes, 0), 23 * 60)
  const endMinutes = Math.min(startMinutes + 60, 24 * 60)
  return {
    startTime: minutesToTimeString(startMinutes),
    endTime: minutesToTimeString(endMinutes),
  }
}

export function hasRecordTimeRange(record: Pick<TimeRecord, "startTime" | "endTime">): boolean {
  return calculateHoursFromTimeRange(record.startTime, record.endTime) !== null
}

export function getRecordTimeLabel(record: Pick<TimeRecord, "startTime" | "endTime">): string {
  if (!hasRecordTimeRange(record)) return "尚未指定時段"
  return `${record.startTime}–${record.endTime}`
}

export function getTimeValueType(category: Category): TimeValueType {
  switch (category) {
    case "學習":
    case "副業":
      return "成長型"
    case "工作":
      return "生產型"
    case "休息":
    case "鍛鍊":
      return "恢復型"
    case "人際":
      return "關係型"
    default:
      return "彈性型"
  }
}

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "輕鬆"
  if (difficulty === 3) return "中等"
  return "較有挑戰"
}

export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return "text-muted-foreground"
  if (difficulty === 3) return "text-blue-500"
  return "text-orange-500"
}

export function calculateMetrics(records: TimeRecord[]): Metrics {
  if (records.length === 0) {
    return {
      totalHours: 0,
      difficultyScore: 0,
      avgDifficulty: 0,
      assetPoints: 0,
      intangibleAssetCount: 0,
      tangibleAssetCount: 0,
      outputRecordCount: 0,
      conversionRate: 0,
      highDifficultyRatio: 0,
      productiveHours: 0,
      productiveRatio: 0,
      valuableTimeRatio: 0,
      restHours: 0,
      learningHours: 0,
      relationshipHours: 0,
      exerciseHours: 0,
    }
  }

  const totalHours = records.reduce((sum, r) => sum + r.hours, 0)
  const difficultyScore = records.reduce((sum, r) => sum + r.hours * r.difficulty, 0)
  const avgDifficulty = totalHours > 0 ? difficultyScore / totalHours : 0

  let intangibleAssetCount = 0
  let tangibleAssetCount = 0
  let outputRecordCount = 0
  records.forEach((r) => {
    r.assets.forEach((asset) => {
      if (INTANGIBLE_ASSETS.includes(asset as IntangibleAsset)) {
        intangibleAssetCount += 1
      } else {
        tangibleAssetCount += 1
      }
    })
    if (r.hasOutput) outputRecordCount += 1
  })

  // 資產累積點數：無形資產×1、有形資產×2、有產出×1.5
  const assetPoints = Math.round(intangibleAssetCount * 1 + tangibleAssetCount * 2 + outputRecordCount * 1.5)

  const recordsWithOutput = records.filter(r => r.hasOutput).length
  const conversionRate = (recordsWithOutput / records.length) * 100

  const highDifficultyHours = records
    .filter(r => r.difficulty >= 4)
    .reduce((sum, r) => sum + r.hours, 0)
  const highDifficultyRatio = totalHours > 0 ? (highDifficultyHours / totalHours) * 100 : 0

  const productiveCategories: Category[] = ["工作", "學習", "副業", "人際"]
  const productiveHours = records
    .filter((r) => productiveCategories.includes(r.category))
    .reduce((sum, r) => sum + r.hours, 0)
  const productiveRatio = totalHours > 0 ? (productiveHours / totalHours) * 100 : 0

  const restHours = records
    .filter((r) => r.category === "休息")
    .reduce((sum, r) => sum + r.hours, 0)

  const learningHours = records
    .filter((r) => r.category === "學習")
    .reduce((sum, r) => sum + r.hours, 0)

  const relationshipHours = records
    .filter((r) => r.category === "人際")
    .reduce((sum, r) => sum + r.hours, 0)

  // 鍛鍊類別 + 舊資料關鍵字相容
  const exerciseKeywords = ["運動", "健身", "跑步", "重訓", "瑜珈", "走路", "散步"]
  const exerciseHours = records
    .filter((r) =>
      r.category === "鍛鍊" ||
      (r.category === "休息" && exerciseKeywords.some((k) => r.activity.includes(k)))
    )
    .reduce((sum, r) => sum + r.hours, 0)

  // 有價值時間比例：有刻意付出（難度≥2）且有產出或資產的時間
  const valuableHours = records
    .filter(r => r.difficulty >= 2 && (r.hasOutput || r.assets.length > 0))
    .reduce((sum, r) => sum + r.hours, 0)
  const valuableTimeRatio = totalHours > 0 ? (valuableHours / totalHours) * 100 : 0

  return {
    totalHours,
    difficultyScore,
    avgDifficulty,
    assetPoints,
    intangibleAssetCount,
    tangibleAssetCount,
    outputRecordCount,
    conversionRate,
    highDifficultyRatio,
    productiveHours,
    productiveRatio,
    valuableTimeRatio,
    restHours,
    learningHours,
    relationshipHours,
    exerciseHours,
  }
}

export function calculateTrackedHoursByDate(records: TimeRecord[], date: Date): number {
  const targetDate = toDateKey(date)
  return records
    .filter((r) => r.date === targetDate)
    .reduce((sum, r) => sum + r.hours, 0)
}

export function getCompletionInfo(trackedHours: number): {
  rate: number
  label: string
  message: string
  color: string
} {
  const rate = Math.min((trackedHours / 24) * 100, 100)
  if (rate >= 100) {
    return {
      rate: 100,
      label: "完整記錄",
      message: "今天的 24 小時已完整記錄，很棒！",
      color: "text-green-600",
    }
  }
  if (rate >= 70) {
    return {
      rate,
      label: "大致完整",
      message: `今天已記錄 ${trackedHours.toFixed(1)} 小時，幫助你更全面看見一天的配置。`,
      color: "text-blue-600",
    }
  }
  return {
    rate,
    label: "可補充",
    message: `今天還有一些時間可以補充記錄，幫助更完整看見一天的配置。`,
    color: "text-orange-500",
  }
}

export function getAssetSummary(records: TimeRecord[]): {
  intangible: string
  tangible: string
} {
  const intangibleCounts: Record<string, number> = {}
  const tangibleCounts: Record<string, number> = {}

  records.forEach(r => {
    r.assets.forEach(asset => {
      if (INTANGIBLE_ASSETS.includes(asset as IntangibleAsset)) {
        intangibleCounts[asset] = (intangibleCounts[asset] || 0) + 1
      } else {
        tangibleCounts[asset] = (tangibleCounts[asset] || 0) + 1
      }
    })
  })

  const topIntangible = Object.entries(intangibleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key)
    .join("與")

  const topTangible = Object.entries(tangibleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key)
    .join(" / ")

  return {
    intangible: topIntangible ? `本月主要累積在${topIntangible}` : "持續累積中",
    tangible: topTangible ? `已看見${topTangible}的累積` : "種子正在萌芽"
  }
}

export function getDailyFeedback(metrics: Metrics, records: TimeRecord[]): string {
  if (records.length === 0) return "開始記錄第一筆時間，讓自己看見每天的累積。"

  const feedbackOptions: string[] = []

  const hasWork = records.some(r => r.category === "工作")
  const hasRest = records.some(r => r.category === "休息")
  const hasLearning = records.some(r => r.category === "學習")
  const hasRelationship = records.some(r => r.category === "人際")
  const hasExercise = records.some(r => r.category === "鍛鍊")

  if (hasWork && hasRest) {
    feedbackOptions.push("今天的時間配置包含工作與休息，維持良好節奏。")
  }
  if (hasLearning) {
    feedbackOptions.push("今天有投入學習，正在累積未來的能力。")
  }
  if (hasRelationship) {
    feedbackOptions.push("今天照顧到了關係與人際，這也是很重要的投資。")
  }
  if (hasExercise) {
    feedbackOptions.push("今天有安排鍛鍊時間，體力正在穩定累積。")
  }
  if (metrics.conversionRate >= 50) {
    feedbackOptions.push("今天有不少時間轉化為具體成果，累積正在發生。")
  }
  if (metrics.highDifficultyRatio > 30) {
    feedbackOptions.push("今天挑戰了有難度的事情，這樣的投入很有價值。")
  }
  if (feedbackOptions.length === 0) {
    feedbackOptions.push("今天的安排已記錄下來，每一筆都是你的累積。")
  }

  return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]
}

export function getMonthTypology(metrics: Metrics): string {
  if (metrics.totalHours === 0) return "本月尚無紀錄，隨時可以開始。"

  if (metrics.productiveRatio < 40) {
    return "目前時間配置以休息與恢復為主，維持了生活節奏。"
  }
  if (metrics.learningHours / metrics.totalHours > 0.3) {
    return "本月有大量時間投入學習，正在快速累積新能力。"
  }
  if (metrics.conversionRate > 50) {
    return "本月有豐富的成果轉換，開始出現新的機會與嘗試。"
  }
  if (metrics.highDifficultyRatio > 40) {
    return "本月承擔了不少挑戰性任務，正處於能力突破期。"
  }
  return "目前時間配置以穩定生活為主，逐步增加成長投入。"
}

export function getMonthSuggestions(metrics: Metrics): string[] {
  const suggestions: string[] = []

  if (metrics.learningHours < 8) {
    suggestions.push("可以嘗試增加一些學習或探索的時間，哪怕每天只有 30 分鐘。")
  }
  if (metrics.relationshipHours < 5) {
    suggestions.push("可以為家人或朋友預留一些陪伴時間，關係也是重要的資產。")
  }
  if (metrics.conversionRate < 30) {
    suggestions.push("目前已有累積，可以逐步嘗試將學習或工作轉化為具體成果。")
  }
  if (metrics.exerciseHours < 4) {
    suggestions.push("體力是一切的基礎，可以嘗試加入短時段的運動或散步。")
  }
  if (suggestions.length === 0) {
    suggestions.push("目前節奏很好，繼續保持，讓累積自然發生。")
  }

  return suggestions.slice(0, 3)
}

// ─────────────────────────────────────────────
// 六維能力系統
// ─────────────────────────────────────────────

export interface CapabilityStage {
  minScore: number
  label: string
  description: string
  economic: string
}

export interface CapabilityScore {
  id: string
  name: string
  emoji: string
  score: number
  currentStage: CapabilityStage
  nextStage: CapabilityStage | null
  stages: CapabilityStage[]
}

function sigmoidScore(raw: number, softCap: number): number {
  if (raw <= 0) return 0
  const ratio = raw / softCap
  return Math.min(Math.round(100 * ratio / (1 + ratio)), 100)
}

const CAPABILITY_DEFS: Array<{
  id: string
  name: string
  emoji: string
  stages: CapabilityStage[]
  calc: (d: {
    workHours: number; workDiffScore: number; workWithOutput: number
    learningHours: number; learningDiffScore: number; sideDiffScore: number
    restHours: number; exerciseHours: number; relHours: number; relWithOutput: number
    softSkillCount: number; hardSkillCount: number; avgCategoriesPerDay: number; totalRecords: number
  }) => number
}> = [
  {
    id: "timeManagement", name: "調整時間", emoji: "⏱️",
    stages: [
      { minScore: 0,  label: "時間覺察", description: "開始觀察每天的時間分配，找到屬於自己的節奏", economic: "了解時間流向，減少無意識消耗" },
      { minScore: 30, label: "有意安排", description: "主動設定優先事項，不再被事情追著跑", economic: "每週多釋放 3–5 小時用於高價值活動" },
      { minScore: 60, label: "靈活調配", description: "時間節奏穩定，能在工作、學習、生活間自由切換", economic: "副業與學習時段有保障，收入成長通道打開" },
      { minScore: 80, label: "時間自主", description: "掌握時間主權，選擇對自己最有意義的投入", economic: "可承接更高單價工作，生活與收入彈性大幅提升" },
    ],
    calc: (d) => sigmoidScore(d.workHours * 0.4 + d.avgCategoriesPerDay * 8 + d.totalRecords * 0.5, 35),
  },
  {
    id: "physicalStrength", name: "增加體力", emoji: "💪",
    stages: [
      { minScore: 0,  label: "基礎維持", description: "維持日常精力，避免過度疲勞與消耗", economic: "保持基本工作能力，減少效率損耗" },
      { minScore: 30, label: "穩定儲備", description: "體能穩定，疲勞恢復加快，活力更持久", economic: "工作效率提升，每月有效時數增加" },
      { minScore: 60, label: "精力充沛", description: "充沛活力支撐高強度的學習與工作", economic: "可承接更多任務，副業投入有充足精力" },
      { minScore: 80, label: "巔峰狀態", description: "長期保持高效能，延長職涯的黃金期", economic: "健康本身即最大資產，省下醫療成本與職業壽命延長" },
    ],
    calc: (d) => sigmoidScore(d.restHours * 1.0 + d.exerciseHours * 2.5, 20),
  },
  {
    id: "coreSkills", name: "強化能力", emoji: "🧱",
    stages: [
      { minScore: 0,  label: "能力基礎", description: "在日常工作中積累基本執行與解決問題的能力", economic: "勝任現有工作，維持收入穩定" },
      { minScore: 30, label: "效率提升", description: "核心技能更熟練，用更短的時間完成更好的工作", economic: "談薪資有更強底氣，晉升機會增加" },
      { minScore: 60, label: "競爭優勢", description: "成為團隊中不可或缺的技術核心", economic: "年薪成長 10–20% 的實質可能性" },
      { minScore: 80, label: "領域專家", description: "深度技能成為個人品牌，高價值機會主動找上門", economic: "顧問、教學、演講等收入管道逐漸開啟" },
    ],
    calc: (d) => sigmoidScore(d.workDiffScore * 0.5 + d.workWithOutput * 5, 50),
  },
  {
    id: "newSkills", name: "增加技能", emoji: "📚",
    stages: [
      { minScore: 0,  label: "技能探索", description: "接觸新領域，為跨域發展建立基礎", economic: "職涯選擇增加，了解更多可能性" },
      { minScore: 30, label: "技能成型", description: "跨域能力逐漸實用，可應用於真實情境", economic: "接案、轉職、副業的機會開始浮現" },
      { minScore: 60, label: "斜槓雛形", description: "多項技能形成獨特組合，差異化競爭力成形", economic: "副業收入可達月薪的 10–30%" },
      { minScore: 80, label: "技能套件", description: "擁有可持續輸出的技能組合，多元變現成為可能", economic: "多元收入流成形，年收入比單一工作增加 30–50%" },
    ],
    calc: (d) => sigmoidScore(d.learningDiffScore * 1.0 + d.sideDiffScore * 0.7 + d.hardSkillCount * 2, 30),
  },
  {
    id: "network", name: "運用人脈", emoji: "🤝",
    stages: [
      { minScore: 0,  label: "人脈基礎", description: "建立基本人際連結，維持良好關係與印象", economic: "有基本轉介與口碑基礎" },
      { minScore: 30, label: "信任建立", description: "人際品質提升，信任感增強，具體合作機會出現", economic: "口碑引薦帶來客戶或工作機會" },
      { minScore: 60, label: "機會網絡", description: "人脈形成有價值的資訊與機會網絡", economic: "每年透過人脈獲得 2–5 個實質合作或工作機會" },
      { minScore: 80, label: "人脈資本", description: "人際連結自動帶來高品質機會，無需主動搜尋", economic: "人脈成為被動收入來源，機會自然流入" },
    ],
    calc: (d) => sigmoidScore(d.relHours * 2 + d.relWithOutput * 8 + d.softSkillCount * 1.5, 20),
  },
  {
    id: "knowledge", name: "增加知識", emoji: "💡",
    stages: [
      { minScore: 0,  label: "知識積累", description: "廣泛吸收新知，建立思考框架與判斷基礎", economic: "決策品質提升，減少常見錯誤" },
      { minScore: 30, label: "知識應用", description: "將所學應用於工作與生活，縮短學以致用的距離", economic: "工作品質提升，減少試錯成本" },
      { minScore: 60, label: "深度洞察", description: "在特定領域形成獨特觀點，能快速找到問題核心", economic: "知識輸出（寫作/教學）帶來新的收入機會" },
      { minScore: 80, label: "知識資產", description: "系統性知識形成護城河，成為他人願意付費請教的對象", economic: "知識產品化（課程/工具），創造持續性收入" },
    ],
    calc: (d) => sigmoidScore(d.learningHours * 1.5 + d.learningDiffScore * 0.8, 25),
  },
]

export function calculateCapabilities(records: TimeRecord[]): CapabilityScore[] {
  // 舊資料相容：休息類別中含運動關鍵字也計入體力
  const exerciseKeywords = ["運動", "健身", "跑步", "重訓", "瑜珈", "走路", "散步"]

  const workRecs = records.filter(r => r.category === "工作")
  const workHours = workRecs.reduce((s, r) => s + r.hours, 0)
  const workDiffScore = workRecs.reduce((s, r) => s + r.hours * r.difficulty, 0)
  const workWithOutput = workRecs.filter(r => r.hasOutput).length

  const learnRecs = records.filter(r => r.category === "學習")
  const learningHours = learnRecs.reduce((s, r) => s + r.hours, 0)
  const learningDiffScore = learnRecs.reduce((s, r) => s + r.hours * r.difficulty, 0)

  const sideDiffScore = records.filter(r => r.category === "副業").reduce((s, r) => s + r.hours * r.difficulty, 0)
  const restHours = records.filter(r => r.category === "休息").reduce((s, r) => s + r.hours, 0)

  // 鍛鍊類別直接計入；舊資料以關鍵字從休息中抓
  const exerciseHours = records
    .filter(r =>
      r.category === "鍛鍊" ||
      (r.category === "休息" && exerciseKeywords.some(k => r.activity.includes(k)))
    )
    .reduce((s, r) => s + r.hours, 0)

  const relRecs = records.filter(r => r.category === "人際")
  const relHours = relRecs.reduce((s, r) => s + r.hours, 0)
  const relWithOutput = relRecs.filter(r => r.hasOutput).length

  const softSkillCount = records.filter(r => r.assets.includes("軟實力")).length
  const hardSkillCount = records.filter(r => r.assets.includes("硬實力")).length

  const dateCategories: Record<string, Set<string>> = {}
  records.forEach(r => {
    if (!dateCategories[r.date]) dateCategories[r.date] = new Set()
    dateCategories[r.date].add(r.category)
  })
  const dayCount = Object.keys(dateCategories).length
  const avgCategoriesPerDay = dayCount > 0
    ? Object.values(dateCategories).reduce((s, v) => s + v.size, 0) / dayCount
    : 0

  const data = {
    workHours, workDiffScore, workWithOutput,
    learningHours, learningDiffScore, sideDiffScore,
    restHours, exerciseHours,
    relHours, relWithOutput,
    softSkillCount, hardSkillCount,
    avgCategoriesPerDay, totalRecords: records.length,
  }

  return CAPABILITY_DEFS.map(def => {
    const score = def.calc(data)
    const currentStage = [...def.stages].reverse().find(s => score >= s.minScore) ?? def.stages[0]
    const currentIdx = def.stages.findIndex(s => s === currentStage)
    const nextStage = currentIdx < def.stages.length - 1 ? def.stages[currentIdx + 1] : null

    return {
      id: def.id,
      name: def.name,
      emoji: def.emoji,
      score,
      currentStage,
      nextStage,
      stages: def.stages,
    }
  })
}

// ─────────────────────────────────────────────
// 昨日 / 本週 洞察
// ─────────────────────────────────────────────

export interface YesterdayInsights {
  trackedHours: number
  completionRate: number
  categoryBreakdown: { category: Category; hours: number }[]
  hasWork: boolean
  hasRest: boolean
  hasLearning: boolean
  hasRelationship: boolean
  hasExercise: boolean
  outputCount: number
}

export interface WeeklyInsights {
  totalHours: number
  mostActiveDayDate: string
  mostActiveDayHours: number
  categoryBreakdown: { category: Category; hours: number }[]
  weekRecordCount: number
  outputCount: number
}

export function getYesterdayInsights(records: TimeRecord[]): YesterdayInsights {
  const dateStr = toDateKey(getYesterday())
  const recs = records.filter(r => r.date === dateStr)
  const trackedHours = recs.reduce((s, r) => s + r.hours, 0)

  return {
    trackedHours,
    completionRate: Math.min((trackedHours / 24) * 100, 100),
    categoryBreakdown: CATEGORIES.map(cat => ({
      category: cat,
      hours: recs.filter(r => r.category === cat).reduce((s, r) => s + r.hours, 0),
    })).filter(x => x.hours > 0),
    hasWork: recs.some(r => r.category === "工作"),
    hasRest: recs.some(r => r.category === "休息"),
    hasLearning: recs.some(r => r.category === "學習"),
    hasRelationship: recs.some(r => r.category === "人際"),
    hasExercise: recs.some(r => r.category === "鍛鍊"),
    outputCount: recs.filter(r => r.hasOutput).length,
  }
}

export function getWeeklyInsights(records: TimeRecord[]): WeeklyInsights {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const weekRecs = records.filter(r => new Date(r.date + "T00:00:00") >= sevenDaysAgo)
  const totalHours = weekRecs.reduce((s, r) => s + r.hours, 0)

  const hoursByDate: Record<string, number> = {}
  weekRecs.forEach(r => { hoursByDate[r.date] = (hoursByDate[r.date] || 0) + r.hours })

  let mostActiveDayDate = ""
  let mostActiveDayHours = 0
  Object.entries(hoursByDate).forEach(([date, hours]) => {
    if (hours > mostActiveDayHours) { mostActiveDayHours = hours; mostActiveDayDate = date }
  })

  return {
    totalHours,
    mostActiveDayDate,
    mostActiveDayHours,
    categoryBreakdown: CATEGORIES.map(cat => ({
      category: cat,
      hours: weekRecs.filter(r => r.category === cat).reduce((s, r) => s + r.hours, 0),
    })).filter(x => x.hours > 0).sort((a, b) => b.hours - a.hours),
    weekRecordCount: weekRecs.length,
    outputCount: weekRecs.filter(r => r.hasOutput).length,
  }
}

export function getAISummary(metrics: Metrics, records: TimeRecord[]): string {
  if (records.length === 0) return "開始記錄你的時間，讓自己看見每天的努力與累積。"

  const summaries: string[] = []

  if (metrics.conversionRate >= 60) {
    summaries.push("已開始出現明確成果，建議持續這個節奏")
  } else if (metrics.conversionRate >= 30) {
    summaries.push("投入時間正在逐步轉化，繼續累積就會看見改變")
  } else {
    summaries.push("投入時間正在打下基礎，這是累積的必要過程")
  }

  if (metrics.highDifficultyRatio > 50) {
    summaries.push("本月挑戰了許多有難度的事，這是成長的重要信號")
  } else if (metrics.assetPoints > 10) {
    summaries.push("已累積了不少資產點數，努力正在具體化")
  }

  if (summaries.length === 0) {
    summaries.push("保持穩定的投入節奏，持續讓時間轉化為資產")
  }

  return summaries.join("，") + "。"
}
