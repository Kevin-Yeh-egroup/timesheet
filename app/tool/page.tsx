import { redirect } from "next/navigation"
import { getPlatformContext, resolveToolEntryPath } from "@/lib/platform-context"

type ToolEntryPageProps = {
  searchParams?: Promise<{
    from?: string
    authStatus?: string
    audienceMode?: string
    familyfinhealthCaseId?: string
    caseId?: string
    caseName?: string
  }>
}

export default async function ToolEntryPage({ searchParams }: ToolEntryPageProps) {
  const params = await searchParams
  const platformContext = getPlatformContext({
    authStatus: params?.authStatus === "registered" ? "registered" : params?.authStatus === "guest" ? "guest" : undefined,
    audienceMode: params?.audienceMode === "social-worker" ? "social-worker" : params?.audienceMode === "public" ? "public" : undefined,
    currentCaseId: params?.familyfinhealthCaseId ?? params?.caseId,
    caseName: params?.caseName,
  })
  const destination = resolveToolEntryPath(platformContext, {
    guideCompleted: params?.from === "guide",
  })

  redirect(destination)
}
