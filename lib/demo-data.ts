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
      category: "做事",
      hours: 2.5,
      startTime: "09:00",
      endTime: "11:30",
      difficulty: 4,
      hasOutput: true,
      outputDescription: "完成需求文件 v1",
      assets: ["技能熟練", "工具流程"],
      conversionStatus: "已開始嘗試"
    },
    {
      date: format(subDays(now, 2), "yyyy-MM-dd"),
      activity: "錄製 10 分鐘教學短片",
      category: "探索",
      hours: 1.5,
      startTime: "20:00",
      endTime: "21:30",
      difficulty: 4,
      hasOutput: true,
      outputDescription: "上架第一支短片",
      assets: ["作品成果", "收入增加"],
      conversionStatus: "已有成果"
    },
    {
      date: format(subDays(now, 3), "yyyy-MM-dd"),
      activity: "閱讀產品設計案例",
      category: "探索",
      hours: 1,
      startTime: "07:30",
      endTime: "08:30",
      difficulty: 2,
      hasOutput: false,
      assets: ["知識理解"],
      conversionStatus: "尚未轉換"
    },
    {
      date: format(subDays(now, 5), "yyyy-MM-dd"),
      activity: "健身與伸展恢復",
      category: "恢復",
      hours: 1,
      startTime: "18:00",
      endTime: "19:00",
      difficulty: 3,
      hasOutput: false,
      assets: ["體力健康"],
      conversionStatus: "尚未轉換"
    },
    {
      date: format(subDays(now, 6), "yyyy-MM-dd"),
      activity: "與潛在合作夥伴交流",
      category: "連結",
      hours: 1.5,
      startTime: "12:00",
      endTime: "13:30",
      difficulty: 3,
      hasOutput: true,
      outputDescription: "確認一場合作直播",
      assets: ["人際連結", "收入增加"],
      conversionStatus: "已開始嘗試"
    },
    {
      date: format(subDays(now, 8), "yyyy-MM-dd"),
      activity: "重構資料匯出功能",
      category: "做事",
      hours: 3,
      startTime: "14:00",
      endTime: "17:00",
      difficulty: 5,
      hasOutput: true,
      outputDescription: "匯出速度提升 30%",
      assets: ["技能熟練", "存款增加"],
      conversionStatus: "已有成果"
    },
    {
      date: format(subDays(now, 10), "yyyy-MM-dd"),
      activity: "練習簡報與 demo 流程",
      category: "探索",
      hours: 1,
      difficulty: 3,
      hasOutput: true,
      outputDescription: "完成一版 5 分鐘簡報",
      assets: ["技能熟練", "工具流程"],
      conversionStatus: "已開始嘗試"
    }
  ]

  return records.map(createDemoRecord)
}
