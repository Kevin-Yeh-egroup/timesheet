export type Category = "工作" | "學習" | "副業" | "人際" | "休息"

export type IntangibleAsset = "體力" | "軟實力" | "硬實力"
export type TangibleAsset = "存款增加" | "收入" | "工具/副業基礎"
export type Asset = IntangibleAsset | TangibleAsset

export type ConversionStatus = "尚未啟動" | "已開始嘗試" | "已產生收入或成果"

export interface TimeRecord {
  id: string
  date: string
  activity: string
  category: Category
  hours: number
  difficulty: number // 1-5
  hasOutput: boolean
  outputDescription?: string
  assets: Asset[]
  conversionStatus: ConversionStatus
  createdAt: string
}

export interface Metrics {
  totalHours: number
  difficultyScore: number // hours × difficulty
  avgDifficulty: number // weighted by hours, 1-5
  intangibleAssetCount: number
  tangibleAssetCount: number
  outputRecordCount: number
  conversionRate: number // percentage
  highDifficultyRatio: number // percentage of high difficulty (4-5) time
}

export const CATEGORIES: Category[] = ["工作", "學習", "副業", "人際", "休息"]

export const INTANGIBLE_ASSETS: IntangibleAsset[] = ["體力", "軟實力", "硬實力"]
export const TANGIBLE_ASSETS: TangibleAsset[] = ["存款增加", "收入", "工具/副業基礎"]
export const ALL_ASSETS: Asset[] = [...INTANGIBLE_ASSETS, ...TANGIBLE_ASSETS]

export const CONVERSION_STATUSES: ConversionStatus[] = [
  "尚未啟動",
  "已開始嘗試",
  "已產生收入或成果"
]

export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "低負擔"
  if (difficulty === 3) return "中等投入"
  return "高消耗 / 高挑戰"
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
      intangibleAssetCount: 0,
      tangibleAssetCount: 0,
      outputRecordCount: 0,
      conversionRate: 0,
      highDifficultyRatio: 0
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

  const recordsWithOutput = records.filter(r => r.hasOutput).length
  const conversionRate = (recordsWithOutput / records.length) * 100

  const highDifficultyHours = records
    .filter(r => r.difficulty >= 4)
    .reduce((sum, r) => sum + r.hours, 0)
  const highDifficultyRatio = totalHours > 0 ? (highDifficultyHours / totalHours) * 100 : 0

  return {
    totalHours,
    difficultyScore,
    avgDifficulty,
    intangibleAssetCount,
    tangibleAssetCount,
    outputRecordCount,
    conversionRate,
    highDifficultyRatio
  }
}

export function getAssetSummary(records: TimeRecord[]): { intangible: string; tangible: string } {
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
    intangible: topIntangible ? `本月主要累積在${topIntangible}` : "尚無無形資產累積",
    tangible: topTangible ? `已產生${topTangible}` : "尚無有形資產累積"
  }
}

export function getAISummary(metrics: Metrics, records: TimeRecord[]): string {
  if (records.length === 0) return "尚無紀錄，開始記錄你的努力吧！"
  
  const summaries: string[] = []
  
  if (metrics.conversionRate < 30) {
    summaries.push("本月投入時間多，但轉換為成果比例較低，可能卡在轉換階段")
  } else if (metrics.conversionRate >= 60) {
    summaries.push("已開始出現收入或成果，建議持續放大目前嘗試")
  }
  
  if (metrics.highDifficultyRatio > 50) {
    summaries.push("高難度投入比例較高，注意是否過度消耗，也可能正處於突破期")
  }
  
  if (summaries.length === 0) {
    summaries.push("保持穩定的投入節奏，持續累積資產")
  }
  
  return summaries.join("。")
}
