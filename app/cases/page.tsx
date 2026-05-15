"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, FileText, Search, UsersRound } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function buildToolHref(caseId: string, caseName: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams.toString())
  params.set("audienceMode", "social-worker")
  params.set("authStatus", "registered")
  params.set("familyfinhealthCaseId", caseId)
  params.set("caseName", caseName)
  return `/?${params.toString()}`
}

export default function CasesPage() {
  const searchParams = useSearchParams()
  const query = new URLSearchParams(searchParams?.toString())
  const hasPlatformCase = query.has("familyfinhealthCaseId") || query.has("caseId")
  const platformCaseId = query.get("familyfinhealthCaseId") ?? query.get("caseId") ?? ""
  const platformCaseName = query.get("caseName") ?? "目前個案"
  const platformCaseHref = platformCaseId
    ? buildToolHref(platformCaseId, platformCaseName, query)
    : ""

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                社工版入口
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                先選擇服務對象，再開始時間資源盤點
              </h1>
              <p className="text-sm leading-7 text-slate-600">
                社工版用於協助服務對象記錄時間安排，建議從好理家在個案檔案或個案歷程紀要進入，
                系統會帶入個案脈絡並連動「歷史記時紀錄」。
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
              <UsersRound className="h-7 w-7" />
            </div>
          </div>
        </section>

        {hasPlatformCase && platformCaseHref ? (
          <Card className="border-emerald-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <FileText className="h-5 w-5 text-emerald-700" />
                已帶入個案
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-950">{platformCaseName}</p>
                <p className="mt-1 text-sm text-slate-600">個案 ID：{platformCaseId}</p>
              </div>
              <Button asChild className="rounded-full bg-emerald-700 hover:bg-emerald-800">
                <Link href={platformCaseHref}>
                  開始個案時間盤點
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50/80 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
              <div className="rounded-2xl bg-white p-2 text-amber-700">
                <Search className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-amber-950">尚未帶入個案資料</p>
                <p className="text-sm leading-6 text-amber-900/80">
                  目前工具端尚未直接串接個案清單 API。請從好理家在社工專區的個案檔案或
                  「個案歷程紀要／歷史記時紀錄」進入，才能帶入服務對象並開始紀錄。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
