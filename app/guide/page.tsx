import Link from "next/link"
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

const GUIDE_TOOL_ENTRY_HREF = `${PLATFORM_PATHS.toolEntry}?from=guide`

const stats = [
  { value: "24h", label: "一天配置", description: "用時段看見每段投入" },
  { value: "6", label: "能力面向", description: "觀察時間帶來的累積" },
  { value: "3", label: "轉換狀態", description: "記錄從嘗試到成果" },
  { value: "本機", label: "資料保存", description: "紀錄保存在你的瀏覽器" },
]

const features = [
  {
    title: "快速記錄時間投入",
    description: "新增工作、學習、副業、人際與休息等紀錄，逐步整理一天的時間配置。",
    icon: Clock,
  },
  {
    title: "AI 協助整理描述",
    description: "用文字或語音描述一天，先產生可確認的時間紀錄，再由你調整內容。",
    icon: Sparkles,
  },
  {
    title: "六維能力觀察",
    description: "把時間投入歸因到調整時間、增加體力、強化能力、增加技能、運用人脈與增加知識。",
    icon: Brain,
  },
  {
    title: "月報表與明細匯出",
    description: "用圖表與表格回顧月份累積，也能匯出文件，方便整理與分享。",
    icon: BarChart3,
  },
  {
    title: "摘要與溫和提醒",
    description: "整理近期紀錄，提示還可以補充觀察的時間片段，讓回顧更完整。",
    icon: MessageCircle,
  },
  {
    title: "本機保存紀錄",
    description: "資料儲存在瀏覽器 localStorage，適合先從個人盤點開始累積。",
    icon: ShieldCheck,
  },
]

const steps = [
  {
    label: "01",
    title: "輸入時間紀錄",
    description: "從新增頁、AI 整理或快速模板開始，寫下時間、類別、難度與當下的轉換狀態。",
    icon: ListChecks,
  },
  {
    label: "02",
    title: "確認資產累積",
    description: "透過總覽與能力圖表，看見不同投入如何慢慢轉成體力、技能、知識或收入基礎。",
    icon: LineChart,
  },
  {
    label: "03",
    title: "回顧並調整配置",
    description: "在月報表與摘要中觀察近期節奏，選擇下一段可以嘗試的安排。",
    icon: CalendarCheck,
  },
]

const audiences = [
  { title: "想建立時間紀錄的人", description: "從每天幾筆紀錄開始，逐步看見生活與工作的配置。" },
  { title: "正在累積能力的人", description: "把學習、副業與工作投入連到技能、知識與成果觀察。" },
  { title: "需要整理生活節奏的人", description: "透過休息、人際與工作紀錄，理解不同面向的安排。" },
  { title: "想做週期回顧的人", description: "用月報表與匯出資料，整理一段時間以來的變化。" },
]

const faqs = [
  {
    question: "時間盤點表適合怎麼開始？",
    answer: "可以先記錄今天最清楚的幾段時間，例如工作、學習、休息或人際互動。累積幾天後，再回到總覽與月報表觀察配置。",
  },
  {
    question: "一定要把 24 小時都記滿嗎？",
    answer: "不需要一次完成。完整紀錄能幫助你更全面地觀察一天，但從容易回想的片段開始，也能慢慢形成可回顧的累積。",
  },
  {
    question: "六維能力分數代表什麼？",
    answer: "它是把時間投入轉成觀察指標，協助你理解不同類別如何支持調整時間、體力、能力、技能、人脈與知識。",
  },
  {
    question: "AI 整理會直接新增紀錄嗎？",
    answer: "AI 整理會先產生可確認的內容，你仍可以調整類別、時間與描述，再決定是否新增到紀錄中。",
  },
  {
    question: "我的資料會存在哪裡？",
    answer: "目前紀錄保存在瀏覽器的 localStorage。若更換瀏覽器或清除網站資料，建議先使用報表匯出保存需要回顧的內容。",
  },
]

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 md:py-10">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
                <BookOpen className="h-4 w-4" />
                時間資產轉換系統說明
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  看見時間如何逐步累積成你的資產
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  時間盤點表協助你記錄每天的投入，理解時間配置與能力、體力、知識、人脈和成果之間的連結。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={GUIDE_TOOL_ENTRY_HREF}>
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
                <CardDescription>本月觀察示意</CardDescription>
                <CardTitle className="text-xl">你的時間累積正在形成輪廓</CardTitle>
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
                    溫和洞察
                  </div>
                  <p className="mt-2 text-sm leading-6 text-blue-900/80">
                    這段時間的學習與工作紀錄正在支持能力累積，也可以繼續觀察休息如何幫助體力恢復。
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
            title="從記錄到回顧，陪你看見時間配置"
            description="功能設計聚焦在日常可持續使用，讓每一筆紀錄都能成為未來回顧的素材。"
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
              <CardTitle className="text-2xl">你記錄的不只是行程，而是正在形成的能力資產</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                很多投入在當下不一定立刻看見成果，但持續記錄後，你會更容易觀察哪些時間正在支持體力、技能、知識與可延伸的可能性。
              </p>
              <div className="space-y-3">
                {["用分類理解時間配置", "用難度標籤觀察投入感受", "用轉換狀態記下正在嘗試的方向"].map((item) => (
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
              description="先記錄，再確認，最後用報表回顧。"
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
                一筆紀錄就是一個可回顧的累積。先寫下今天最有印象的時間片段，讓未來的你更容易看見正在形成的配置。
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link href={GUIDE_TOOL_ENTRY_HREF}>
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
