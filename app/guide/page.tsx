"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, CheckCircle2, Clock3, PenLine, Share2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLATFORM_PATHS } from "@/lib/platform-context"

const steps = [
  {
    title: "選一段時間",
    description: "先從最有印象的一段開始，例如 09:00-12:00。",
    icon: Clock3,
  },
  {
    title: "寫一句活動",
    description: "像記帳一樣寫下你做了什麼，不用寫得很完整。",
    icon: PenLine,
  },
  {
    title: "按新增紀錄",
    description: "完成後，總覽會開始顯示你掌握了多少時間。",
    icon: CheckCircle2,
  },
]

const examples = [
  "09:00-12:00 上班整理資料",
  "18:30-19:30 散步，讓身體恢復",
  "21:00-22:00 看影片學英文",
]

const meaningCards = [
  {
    title: "簡單",
    description: "第一筆只要時間、活動、情境三件事。",
  },
  {
    title: "好玩",
    description: "把一天拆成小片段，像收集自己的時間線索。",
  },
  {
    title: "有意義",
    description: "你會看見哪些時間正在支持能力、休息或關係。",
  },
  {
    title: "可分享",
    description: "完成紀錄後，可以分享今天的時間亮點。",
  },
]

export default function GuidePage() {
  return (
    <Suspense fallback={<GuideLoading />}>
      <GuidePageContent />
    </Suspense>
  )
}

function GuideLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function GuidePageContent() {
  const searchParams = useSearchParams()
  const [exampleHighlighted, setExampleHighlighted] = useState(false)
  const entryParams = new URLSearchParams(searchParams?.toString())
  entryParams.set("from", "guide")
  entryParams.set("start", "record")
  const guideToolEntryHref = `${PLATFORM_PATHS.toolEntry}?${entryParams.toString()}`

  const showExamples = () => {
    document.getElementById("example")?.scrollIntoView({ behavior: "smooth", block: "center" })
    setExampleHighlighted(true)
    window.setTimeout(() => setExampleHighlighted(false), 1600)
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_42%,#f6fbf7_100%)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:py-8">
        <section className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              30 秒開始
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                不用學系統，先記一段時間就好
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                這個工具不是要你交作業，而是幫你看見時間去哪裡。先完成第一筆，之後再慢慢補齊、回顧、分享自己的時間亮點。
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild size="lg" className="justify-center">
                <Link href={guideToolEntryHref}>
                  開始新增第一筆
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button type="button" variant="outline" size="lg" className="justify-center bg-white" onClick={showExamples}>
                  先看填寫範例
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-700">STEP {index + 1}</p>
                    <h2 className="font-semibold text-slate-950">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="example" className="grid scroll-mt-8 gap-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className={`rounded-2xl border bg-blue-50/70 p-5 transition-all duration-300 ${
              exampleHighlighted ? "border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" : "border-blue-100"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <Wand2 className="h-4 w-4" />
              可以直接這樣填
            </div>
            <div className="mt-4 space-y-2">
              {examples.map((example) => (
                <div key={example} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                  {example}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-blue-900/75">
              如果懶得分欄填，也可以打開「快速幫手」，用一句話讓 AI 先幫你整理成草稿。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {meaningCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-700 p-5 text-white shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                <Share2 className="h-4 w-4" />
                完成後的小回饋
              </div>
              <p className="mt-2 text-xl font-bold">你不是在填表，你是在把時間拿回自己手上。</p>
              <p className="mt-1 text-sm leading-6 text-emerald-50/85">
                先完成一筆，總覽會出現時間掌握感；有收穫時，再分享今天的亮點。
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link href={guideToolEntryHref}>
                我知道了，開始
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
