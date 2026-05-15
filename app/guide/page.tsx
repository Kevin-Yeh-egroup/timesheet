"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Database,
  LineChart,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PLATFORM_PATHS } from "@/lib/platform-context"

const stats = [
  { value: "24h", label: "一天安排", description: "看見時間實際用在哪裡" },
  { value: "6", label: "能力面向", description: "觀察能力、休息與支持" },
  { value: "3", label: "改變狀態", description: "記錄從嘗試到有成果" },
  { value: "歷史", label: "登入保存", description: "登入後可回顧過去紀錄" },
]

const features = [
  {
    title: "記下時間怎麼被安排",
    description: "把工作、照顧、學習、人際與休息分段記下來，先看見一天的真實樣子。",
    icon: Clock,
  },
  {
    title: "AI 協助把描述整理成紀錄",
    description: "用文字或語音說明一天，AI 先整理成草稿，你確認後再加入紀錄。",
    icon: Sparkles,
  },
  {
    title: "看見能力與休息是否被支持",
    description: "從時間安排中觀察體力、技能、知識、人脈與休息恢復，找到可以調整的地方。",
    icon: Brain,
  },
  {
    title: "用報表回顧一段時間",
    description: "用圖表與明細回顧一週或一個月，幫助你看見改變前後的差異。",
    icon: BarChart3,
  },
  {
    title: "摘要與溫和提醒",
    description: "整理近期紀錄，提醒還可以補上的片段，讓時間安排更完整。",
    icon: MessageCircle,
  },
  {
    title: "登入後累積歷史紀錄",
    description: "註冊登入後，才能保留歷史記時紀錄，方便長期回顧與安排。",
    icon: ShieldCheck,
  },
]

const steps = [
  {
    label: "01",
    title: "先記下一段時間",
    description: "從今天最清楚的一段開始，寫下時間、類別與這段安排帶來的感受。",
    icon: ListChecks,
  },
  {
    label: "02",
    title: "看看它支持了什麼",
    description: "透過總覽與圖表，看見哪些時間正在支持能力提升、休息恢復或人際支持。",
    icon: LineChart,
  },
  {
    label: "03",
    title: "再決定下一步安排",
    description: "用摘要與報表回顧近期節奏，選擇下一個比較可行的調整。",
    icon: CalendarCheck,
  },
]

const audiences = [
  { title: "想知道時間用去哪裡的人", description: "從每天幾筆紀錄開始，逐步看見生活、工作與休息的安排。" },
  { title: "正在累積能力的人", description: "把學習、工作與嘗試中的行動連到技能、知識與成果觀察。" },
  { title: "需要整理生活節奏的人", description: "透過休息、人際與照顧紀錄，理解哪些安排能幫助恢復。" },
  { title: "想做週期回顧的人", description: "用摘要與報表整理一段時間以來的變化，幫助下一步安排。" },
]

const faqs = [
  {
    question: "時間資源盤點助理適合怎麼開始？",
    answer: "可以先記錄今天最清楚的幾段時間，例如工作、照顧、學習、休息或人際互動。累積幾天後，再回到總覽與報表觀察安排。",
  },
  {
    question: "一定要把 24 小時都記滿嗎？",
    answer: "建議盡量記滿，這樣才看得到一天的時間具體如何運用。如果一開始想不起來，也可以先從最清楚的片段開始補。",
  },
  {
    question: "為什麼需要紀錄時間？",
    answer: "因為改變不只和金錢有關，也和時間安排有關。記錄後比較容易看見哪些時間正在增加能力、哪些時間真的讓你休息，讓下一步調整更有依據。",
  },
  {
    question: "AI 整理會直接新增紀錄嗎？",
    answer: "不會直接替你送出。AI 會先產生可確認的內容，你可以調整類別、時間與描述，再決定是否新增到紀錄中。",
  },
  {
    question: "註冊登入有什麼好處？",
    answer: "註冊登入後可以保留歷史記時紀錄，之後才能回顧不同時期的時間安排，也更方便做時間上的調整。",
  },
]

export default function GuidePage() {
  const searchParams = useSearchParams()
  const entryParams = new URLSearchParams(searchParams?.toString())
  entryParams.set("from", "guide")
  const guideToolEntryHref = `${PLATFORM_PATHS.toolEntry}?${entryParams.toString()}`

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 md:py-10">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
                <BookOpen className="h-4 w-4" />
                時間資源盤點助理使用說明
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  先看見時間怎麼安排，再找到可以改變的地方
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  時間資源盤點助理協助你記錄每天的時間安排，回顧哪些時間支持能力提升，
                  哪些時間帶來休息恢復，讓下一步調整更清楚。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={guideToolEntryHref}>
                    立即開始整理
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">了解功能</Link>
                </Button>
              </div>
            </div>

            <Card className="border-blue-100 bg-white/90 shadow-lg">
              <CardHeader>
                <CardDescription>盤點示意</CardDescription>
                <CardTitle className="text-xl">從一天安排看見生活輪廓</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "學習", value: "32%", color: "bg-purple-500" },
                    { label: "工作", value: "41%", color: "bg-blue-500" },
                    { label: "休息", value: "18%", color: "bg-green-500" },
                    { label: "人際", value: "9%", color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/50 bg-card p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className={`${item.color} h-full rounded-full`} style={{ width: item.value }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-blue-800">
                    <Sparkles className="h-4 w-4" />
                    你可以這樣觀察
                  </div>
                  <p className="mt-2 text-sm leading-6 text-blue-900/80">
                    這段時間的學習與工作可能正在支持能力累積，也可以觀察休息是否真的讓體力恢復。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label} className="border-blue-100">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">{item.value}</div>
                <div className="mt-2 font-semibold">{item.label}</div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="features" className="scroll-mt-6 space-y-4">
          <SectionHeading
            eyebrow="核心功能"
            title="從記錄到回顧，陪你看見時間安排"
            description="不需要一次做到完美，先留下可回顧的紀錄，之後再慢慢調整。"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="leading-6">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Card className="border-blue-100 bg-blue-50/60">
            <CardHeader>
              <CardDescription>為什麼需要時間盤點</CardDescription>
              <CardTitle className="text-2xl">你記錄的不只是行程，而是生活可以調整的線索</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                很多安排在當下不一定立刻看見效果，但持續記錄後，你會更容易觀察哪些時間正在支持能力提升，哪些時間真的帶來休息。
              </p>
              <div className="space-y-3">
                {["用分類理解時間安排", "用感受觀察投入狀態", "用紀錄找出下一步可以調整的方向"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <SectionHeading
              eyebrow="使用流程"
              title="三步驟開始累積"
              description="先記錄，再觀察，最後回到生活中調整。"
            />
            <div className="grid gap-4">
              {steps.map((step) => (
                <Card key={step.label} className="border-border/50">
                  <CardContent className="flex gap-4 pt-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-600">{step.label}</div>
                      <h3 className="mt-1 font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeading
            eyebrow="適合情境"
            title="找到你的盤點起點"
            description="不需要一次整理所有資料，從最貼近你的情境開始就可以。"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <Card key={audience.title} className="border-border/50">
                <CardContent className="pt-6">
                  <Database className="mb-4 h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{audience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="常見問題"
            title="有疑問，可以從這裡開始"
            description="整理使用前最常需要確認的幾件事。"
          />
          <Card className="border-border/50">
            <CardContent className="pt-2">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="leading-6 text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">從今天的一段時間開始記錄</h2>
              <p className="mt-3 text-sm leading-6 text-white/85">
                一筆紀錄就是一個可回顧的線索。先寫下今天最有印象的時間片段，讓未來的你更容易看見可以調整的地方。
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link href={guideToolEntryHref}>
                開始整理
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-sm font-semibold text-blue-600">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
    </div>
  )
}
