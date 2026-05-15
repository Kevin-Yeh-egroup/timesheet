"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, BarChart3, CalendarCheck, Clock3, ListChecks, MessageCircle, Sparkles } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  {
    title: "先補上一段時間",
    description: "從今天最清楚的一段開始，例如工作、照顧、學習、休息或人際互動。",
    icon: Clock3,
  },
  {
    title: "標記活動帶來什麼",
    description: "選擇能力、體力、知識、人脈或具體產出，讓時間不只是一筆紀錄。",
    icon: Sparkles,
  },
  {
    title: "回到總覽觀察安排",
    description: "看見時間分配、24 小時完整度，以及哪些安排正在支持改變。",
    icon: BarChart3,
  },
]

const previewCards = [
  {
    title: "總覽畫面",
    icon: BarChart3,
    bullets: ["本月累計時數", "今日記錄完整度", "能力與休息提示"],
  },
  {
    title: "新增紀錄",
    icon: CalendarCheck,
    bullets: ["日期與時段", "活動類別", "帶來的能力或產出"],
  },
  {
    title: "紀錄管理",
    icon: ListChecks,
    bullets: ["篩選與回顧", "編輯既有紀錄", "避免重複補記"],
  },
  {
    title: "摘要提醒",
    icon: MessageCircle,
    bullets: ["昨日未補時段", "週期觀察", "下一步調整建議"],
  },
]

export default function DemoPage() {
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString()
  const overviewHref = `/${queryString ? `?${queryString}` : ""}`
  const timeHref = `/time${queryString ? `?${queryString}` : ""}`

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 p-6 md:p-8">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                第一次使用說明
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  先看操作方式，再開始正式紀錄
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  這個頁面只提供操作說明與畫面示意，不會載入範例資料，也不會新增到你的正式時間紀錄。
                  看完後可以回到總覽，從自己真實的一段時間開始盤點。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="rounded-full bg-emerald-700 hover:bg-emerald-800">
                  <Link href={overviewHref}>
                    回到總覽開始使用
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-emerald-200 text-emerald-800 hover:bg-emerald-50">
                  <Link href={timeHref}>查看時段盤點</Link>
                </Button>
              </div>
            </div>
            <div className="bg-[linear-gradient(135deg,#00695c_0%,#00897b_55%,#f7a08b_100%)] p-6 text-white md:p-8">
              <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
                <p className="text-sm font-bold text-emerald-50">畫面示意</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                    <p className="text-xs font-bold text-emerald-700">今日記錄完整度</p>
                    <div className="mt-3 h-3 rounded-full bg-emerald-50">
                      <div className="h-3 w-2/3 rounded-full bg-emerald-600" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">已看見 16 小時的時間安排</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/95 p-4 text-slate-900 shadow-sm">
                      <p className="text-xs text-slate-500">能力提升</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-700">5.5h</p>
                    </div>
                    <div className="rounded-2xl bg-white/95 p-4 text-slate-900 shadow-sm">
                      <p className="text-xs text-slate-500">休息恢復</p>
                      <p className="mt-1 text-2xl font-bold text-rose-500">7h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-emerald-100 bg-white shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <step.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-slate-950">
                  {index + 1}. {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">主要畫面會看到什麼</h2>
            <p className="mt-1 text-sm text-slate-600">
              以下是功能畫面的重點摘要，方便你先理解再開始操作。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {previewCards.map((item) => (
              <Card key={item.title} className="border-emerald-100 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-rose-50 p-2 text-rose-500">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-950">{item.title}</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>・{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
