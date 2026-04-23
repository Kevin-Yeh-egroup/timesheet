"use client"

import { Download } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import type { TimeRecord } from "@/lib/types"
import { toast } from "sonner"

interface ExportButtonProps {
  records: TimeRecord[]
}

export function ExportButton({ records }: ExportButtonProps) {
  const handleExport = () => {
    if (records.length === 0) {
      toast.error("沒有紀錄可匯出")
      return
    }

    // Create CSV content
    const headers = [
      "日期",
      "活動",
      "類別",
      "時數",
      "難度",
      "有產出",
      "產出說明",
      "累積資產",
      "轉換狀態",
    ]

    const rows = records.map((r) => [
      r.date,
      r.activity,
      r.category,
      r.hours.toString(),
      r.difficulty.toString(),
      r.hasOutput ? "是" : "否",
      r.outputDescription || "",
      r.assets.join("/"),
      r.conversionStatus,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    // Add BOM for Excel compatibility
    const bom = "\uFEFF"
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `時間盤點表_${format(new Date(), "yyyyMMdd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("已匯出 CSV 檔案")
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      匯出 CSV
    </Button>
  )
}
