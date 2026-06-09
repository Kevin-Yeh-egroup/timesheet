"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AIIntakeDemo, type AIParsedResult } from "@/components/ai-intake-demo"
import { AddRecordForm } from "@/components/add-record-form"
import { QuickTemplates } from "@/components/quick-templates"

export default function AIPage() {
  const [mounted, setMounted] = useState(false)
  const [prefillRecord, setPrefillRecord] = useState<AIParsedResult | null>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI 整理
          </h1>
          <p className="text-sm text-muted-foreground">
            用語音或文字描述一段時間，AI 可以幫你整理草稿；只有按「AI 整理」時才會把文字送到外部 AI 服務，不想送出就改用手動新增。
          </p>
        </header>
        <AIIntakeDemo onParsed={setPrefillRecord} />
        <QuickTemplates />
        <AddRecordForm prefill={prefillRecord} />
      </div>
    </AppShell>
  )
}
