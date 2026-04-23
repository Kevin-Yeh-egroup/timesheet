"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AddRecordForm } from "@/components/add-record-form"
import { AIIntakeDemo, type AIParsedResult } from "@/components/ai-intake-demo"
import { QuickTemplates } from "@/components/quick-templates"

export default function AddPage() {
  const [prefillRecord, setPrefillRecord] = useState<AIParsedResult | null>(null)

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">新增紀錄</h1>
          <p className="text-sm text-muted-foreground">
            記錄你的時間投入與累積的資產
          </p>
        </header>

        <AIIntakeDemo onParsed={setPrefillRecord} />
        <QuickTemplates />
        <AddRecordForm prefill={prefillRecord} />
      </div>
    </AppShell>
  )
}
