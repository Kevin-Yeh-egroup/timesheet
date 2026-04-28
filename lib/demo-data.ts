import { format, subDays } from "date-fns"
import type { TimeRecord } from "./types"

type DemoRecordInput = Omit<TimeRecord, "id" | "createdAt">

function createDemoRecord(record: DemoRecordInput, index: number): TimeRecord {
  return {
    ...record,
    id: `demo-${index + 1}`,
    createdAt: new Date().toISOString()
  }
}

export function buildDemoRecords(): TimeRecord[] {
  const now = new Date()

  const records: DemoRecordInput[] = [
    {
      date: format(subDays(now, 1), "yyyy-MM-dd"),
      activity: "整理客戶需求與功能拆解",
      category: "工作",
      hours: 2.5,
      difficulty: 4,
      hasOutput: true,
      outputDescription: "完成需求文件 v1",
      assets: ["硬實力", "工具/副業基礎"],
      conversionStatus: "已開始嘗試"
    },
    {
      date: format(subDays(now, 2), "yyyy-MM-dd"),
      activity: "錄製 10 分鐘教學短片",
      category: "副業",
      hours: 1.5,
      difficulty: 4,
      hasOutput: true,
      outputDescription: "上架第一支短片",
      assets: ["軟實力", "收入"],
      conversionStatus: "已有成果"
    },
    {
      date: format(subDays(now, 3), "yyyy-MM-dd"),
      activity: "閱讀產品設計案例",
      category: "學習",
      hours: 1,
      difficulty: 2,
      hasOutput: false,
      assets: ["軟實力"],
      conversionStatus: "尚未轉換"
    },
    {
      date: format(subDays(now, 5), "yyyy-MM-dd"),
      activity: "健身與伸展恢復",
      category: "休息",
      hours: 1,
      difficulty: 3,
      hasOutput: false,
      assets: ["體力"],
      conversionStatus: "尚未轉換"
    },
    {
      date: format(subDays(now, 6), "yyyy-MM-dd"),
      activity: "與潛在合作夥伴交流",
      category: "人際",
      hours: 1.5,
      difficulty: 3,
      hasOutput: true,
      outputDescription: "確認一場合作直播",
      assets: ["軟實力", "收入"],
      conversionStatus: "已開始嘗試"
    },
    {
      date: format(subDays(now, 8), "yyyy-MM-dd"),
      activity: "重構資料匯出功能",
      category: "工作",
      hours: 3,
      difficulty: 5,
      hasOutput: true,
      outputDescription: "匯出速度提升 30%",
      assets: ["硬實力", "存款增加"],
      conversionStatus: "已有成果"
    },
    {
      date: format(subDays(now, 10), "yyyy-MM-dd"),
      activity: "練習簡報與 demo 流程",
      category: "學習",
      hours: 1,
      difficulty: 3,
      hasOutput: true,
      outputDescription: "完成一版 5 分鐘簡報",
      assets: ["軟實力", "工具/副業基礎"],
      conversionStatus: "已開始嘗試"
    }
  ]

  return records.map(createDemoRecord)
}
