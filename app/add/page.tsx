"use client"

import { AppShell } from "@/components/app-shell"
import { AddRecordForm } from "@/components/add-record-form"
import { QuickTemplates } from "@/components/quick-templates"

export default function AddPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">新增紀錄</h1>
          <p className="text-sm text-muted-foreground">
            記錄你的時間投入與累積的資產
          </p>
        </header>

        <QuickTemplates />
        <AddRecordForm />
      </div>
    </AppShell>
  )
}
