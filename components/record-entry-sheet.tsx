"use client"

import { useEffect, useState } from "react"
import { PenLine } from "lucide-react"
import { AIIntakeDemo, type AIParsedResult } from "@/components/ai-intake-demo"
import { AddRecordForm } from "@/components/add-record-form"
import { QuickTemplates } from "@/components/quick-templates"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface RecordEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date
  initialStartTime?: string
  initialEndTime?: string
  side?: "right" | "bottom"
}

export function RecordEntrySheet({
  open,
  onOpenChange,
  selectedDate,
  initialStartTime,
  initialEndTime,
  side = "right",
}: RecordEntrySheetProps) {
  const [prefillRecord, setPrefillRecord] = useState<AIParsedResult | null>(null)

  useEffect(() => {
    if (!open) setPrefillRecord(null)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={
          side === "bottom"
            ? "h-[92dvh] overflow-y-auto rounded-t-2xl p-0"
            : "w-full max-w-lg overflow-y-auto p-0"
        }
      >
        <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-blue-500" />
            新增一筆
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            可用 AI 文字或語音快速整理，也可以手動填寫詳細紀錄
          </p>
        </SheetHeader>
        <div className="space-y-5 px-6 py-5">
          <AIIntakeDemo onParsed={setPrefillRecord} />
          <QuickTemplates initialDate={selectedDate} />
          <AddRecordForm
            prefill={prefillRecord}
            initialDate={selectedDate}
            initialStartTime={initialStartTime}
            initialEndTime={initialEndTime}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
