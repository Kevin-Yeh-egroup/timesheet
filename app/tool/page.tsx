import { redirect } from "next/navigation"
import { getPlatformContext, resolveToolEntryPath } from "@/lib/platform-context"

type ToolEntryPageProps = {
  searchParams?: Promise<{
    from?: string
  }>
}

export default async function ToolEntryPage({ searchParams }: ToolEntryPageProps) {
  const params = await searchParams
  const platformContext = getPlatformContext()
  const destination = resolveToolEntryPath(platformContext, {
    guideCompleted: params?.from === "guide",
  })

  redirect(destination)
}
