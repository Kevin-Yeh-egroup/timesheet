"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTimeRecordStore } from "@/lib/store"

interface DemoPresetCardProps {
  isSocialWorker?: boolean
}

export function DemoPresetCard({ isSocialWorker = false }: DemoPresetCardProps) {
  const searchParams = useSearchParams()
  const records = useTimeRecordStore((state) => state.records)
  const demoHref = `/demo${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isSocialWorker ? "協助個案填寫前，可以先看操作說明" : "第一次使用？可以先看操作說明"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSocialWorker
                ? "說明頁會示範如何陪同服務對象補齊一天安排，並觀察休息、能力與支持資源，不會新增或污染個案正式紀錄。"
                : "先進入獨立說明頁看操作流程與畫面示意，不會新增或污染你的正式紀錄。"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            目前 {records.length} 筆
          </span>
          <Button asChild size="sm">
            <Link href={demoHref}>
              查看操作說明
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
