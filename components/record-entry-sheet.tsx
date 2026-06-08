"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, PenLine, Wand2 } from "lucide-react"
import { AIIntakeDemo, type AIParsedResult } from "@/components/ai-intake-demo"
import { AddRecordForm } from "@/components/add-record-form"
import { QuickTemplates } from "@/components/quick-templates"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  const [assistOpen, setAssistOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      setPrefillRecord(null)
      setAssistOpen(false)
    }
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
            先填一段最清楚的時間；想更快時，再打開 AI 或模板。
          </p>
        </SheetHeader>
        <div className="space-y-4 px-6 py-5">
          <Collapsible open={assistOpen} onOpenChange={setAssistOpen} className="rounded-xl border border-blue-100 bg-blue-50/50">
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="flex w-full justify-between px-3 text-blue-800 hover:bg-blue-50">
                <span className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  快速幫手：AI 一句話 / 常用模板
                </span>
                {assistOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 border-t border-blue-100 p-3">
              <AIIntakeDemo onParsed={setPrefillRecord} />
              <QuickTemplates initialDate={selectedDate} />
            </CollapsibleContent>
          </Collapsible>

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
