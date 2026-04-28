"use client"

import { useState } from "react"
import { Download, FileText, Printer } from "lucide-react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TimeRecord, Metrics } from "@/lib/types"
import { getMonthTypology, getMonthSuggestions, getDifficultyLabel } from "@/lib/types"
import { toast } from "sonner"

interface ExportButtonProps {
  records: TimeRecord[]
  metrics?: Metrics
}

export function ExportButton({ records, metrics }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error("沒有紀錄可匯出")
      return
    }

    const headers = ["日期", "活動", "分類", "時數", "投入程度", "有成果", "成果說明", "累積資產", "轉換狀態"]
    const rows = records.map((r) => [
      r.date,
      r.activity,
      r.category,
      r.hours.toString(),
      getDifficultyLabel(r.difficulty),
      r.hasOutput ? "是" : "否",
      r.outputDescription || "",
      r.assets.join(" / "),
      r.conversionStatus,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const bom = "\uFEFF"
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `時間資產紀錄_${format(new Date(), "yyyyMM")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("CSV 檔案已匯出")
  }

  const handleExportWord = () => {
    if (records.length === 0) {
      toast.error("沒有紀錄可匯出")
      return
    }

    setExporting(true)
    const now = new Date()
    const monthLabel = format(now, "yyyy年M月", { locale: zhTW })
    const typology = metrics ? getMonthTypology(metrics) : ""
    const suggestions = metrics ? getMonthSuggestions(metrics) : []

    const rowsHtml = records.map((r) => `
      <tr>
        <td>${r.date}</td>
        <td>${r.activity}</td>
        <td>${r.category}</td>
        <td style="text-align:center">${r.hours}</td>
        <td style="text-align:center">${getDifficultyLabel(r.difficulty)}</td>
        <td style="text-align:center">${r.hasOutput ? "✓" : ""}</td>
        <td>${r.outputDescription || ""}</td>
        <td>${r.assets.join(" / ")}</td>
        <td>${r.conversionStatus}</td>
      </tr>
    `).join("")

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: "Microsoft JhengHei", "Noto Sans TC", sans-serif; margin: 2cm; color: #1a1a2e; }
  h1 { font-size: 22pt; color: #1e40af; margin-bottom: 4px; }
  h2 { font-size: 14pt; color: #1e40af; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #bfdbfe; padding-bottom: 4px; }
  h3 { font-size: 11pt; color: #374151; margin-top: 16px; margin-bottom: 6px; }
  p, li { font-size: 10.5pt; line-height: 1.8; color: #374151; }
  .subtitle { color: #6b7280; font-size: 10pt; margin-bottom: 20px; }
  .metrics-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
  .metric-card { border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; min-width: 140px; background: #eff6ff; }
  .metric-label { font-size: 9pt; color: #6b7280; }
  .metric-value { font-size: 16pt; font-weight: bold; color: #1e40af; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 8px; }
  th { background: #eff6ff; color: #1e40af; font-weight: 600; padding: 6px 8px; border: 1px solid #bfdbfe; text-align: left; }
  td { padding: 5px 8px; border: 1px solid #e5e7eb; }
  tr:nth-child(even) { background: #f9fafb; }
  .feedback-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 4px; margin: 8px 0; }
  .suggestion-item { margin: 4px 0; padding-left: 16px; }
  .suggestion-item::before { content: "◦ "; color: #3b82f6; }
</style>
</head>
<body>
<h1>時間資產月度報表</h1>
<p class="subtitle">${monthLabel} · ${records.length} 筆紀錄 · 由時間資產轉換系統產生</p>

<h2>本月摘要</h2>
<div class="metrics-grid">
  ${metrics ? `
  <div class="metric-card">
    <div class="metric-label">總投入時間</div>
    <div class="metric-value">${metrics.totalHours.toFixed(1)} 小時</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">困難投入值</div>
    <div class="metric-value">${metrics.difficultyScore.toFixed(0)}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">資產累積點數</div>
    <div class="metric-value">${metrics.assetPoints}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">成果轉換率</div>
    <div class="metric-value">${metrics.conversionRate.toFixed(0)}%</div>
  </div>
  ` : ""}
</div>

<h2>本月時間型態觀察</h2>
<div class="feedback-box"><p>${typology}</p></div>

<h2>努力紀錄清單</h2>
<table>
  <thead>
    <tr>
      <th>日期</th>
      <th>活動</th>
      <th>分類</th>
      <th>時數</th>
      <th>投入程度</th>
      <th>有成果</th>
      <th>成果說明</th>
      <th>累積資產</th>
      <th>轉換狀態</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
</table>

<h2>來月溫和建議</h2>
<div>
  ${suggestions.map(s => `<p class="suggestion-item">${s}</p>`).join("")}
</div>

<p style="margin-top: 32px; font-size: 9pt; color: #9ca3af;">
  本報表由「時間資產轉換與生活觀察系統」自動生成 · ${format(now, "yyyy/MM/dd HH:mm", { locale: zhTW })}
</p>
</body>
</html>`

    const bom = "\uFEFF"
    const blob = new Blob([bom + htmlContent], { type: "application/msword;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `時間資產報表_${format(new Date(), "yyyyMM")}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setExporting(false)
    toast.success("Word 報表已匯出")
  }

  const handlePrint = () => {
    if (records.length === 0) {
      toast.error("沒有紀錄可列印")
      return
    }
    window.print()
    toast.success("已開啟列印對話框，可選擇「另存為 PDF」")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          匯出報表
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          匯出 CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportWord}>
          <FileText className="mr-2 h-4 w-4" />
          匯出 Word (.doc)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          列印 / 另存 PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
