export type AuthStatus = "guest" | "registered"
export type AudienceMode = "public" | "social-worker"

export type PlatformContext = {
  authStatus: AuthStatus
  audienceMode: AudienceMode
  currentCaseId?: string
  caseName?: string
  guidePath: string
  publicToolPath: string
  toolEntryPath: string
  caseListPath: string
  caseToolBasePath: string
}

export const PLATFORM_PATHS = {
  guide: "/guide",
  toolEntry: "/tool",
  publicTool: "/",
  caseList: "/cases",
  caseToolBase: "/cases",
} as const

const DEFAULT_PLATFORM_CONTEXT: PlatformContext = {
  authStatus: "guest",
  audienceMode: "public",
  guidePath: PLATFORM_PATHS.guide,
  publicToolPath: PLATFORM_PATHS.publicTool,
  toolEntryPath: PLATFORM_PATHS.toolEntry,
  caseListPath: PLATFORM_PATHS.caseList,
  caseToolBasePath: PLATFORM_PATHS.caseToolBase,
}

function isAuthStatus(value: string | undefined): value is AuthStatus {
  return value === "guest" || value === "registered"
}

function isAudienceMode(value: string | undefined): value is AudienceMode {
  return value === "public" || value === "social-worker"
}

export function getPlatformContext(overrides: Partial<PlatformContext> = {}): PlatformContext {
  const envAuthStatus = process.env.NEXT_PUBLIC_TIME_TRACKER_AUTH_STATUS
  const envAudienceMode = process.env.NEXT_PUBLIC_TIME_TRACKER_AUDIENCE_MODE

  return {
    ...DEFAULT_PLATFORM_CONTEXT,
    authStatus: isAuthStatus(envAuthStatus) ? envAuthStatus : DEFAULT_PLATFORM_CONTEXT.authStatus,
    audienceMode: isAudienceMode(envAudienceMode) ? envAudienceMode : DEFAULT_PLATFORM_CONTEXT.audienceMode,
    ...overrides,
  }
}

type SearchParamsLike = {
  get: (name: string) => string | null
}

export function getPlatformContextFromSearchParams(
  searchParams: SearchParamsLike | null | undefined,
  overrides: Partial<PlatformContext> = {}
): PlatformContext {
  const baseContext = getPlatformContext(overrides)
  const authStatus = searchParams?.get("authStatus") ?? undefined
  const audienceMode = searchParams?.get("audienceMode") ?? undefined
  const currentCaseId =
    searchParams?.get("familyfinhealthCaseId") ??
    searchParams?.get("caseId") ??
    undefined
  const caseName = searchParams?.get("caseName") ?? undefined

  return {
    ...baseContext,
    authStatus: isAuthStatus(authStatus) ? authStatus : baseContext.authStatus,
    audienceMode: isAudienceMode(audienceMode) ? audienceMode : baseContext.audienceMode,
    currentCaseId,
    caseName,
  }
}

export function resolveToolEntryPath(
  context: PlatformContext,
  options: { guideCompleted?: boolean } = {}
) {
  if (context.authStatus === "guest" && !options.guideCompleted) {
    return context.guidePath
  }

  if (context.audienceMode === "social-worker") {
    if (!context.currentCaseId) return context.caseListPath

    const params = new URLSearchParams({
      audienceMode: "social-worker",
      authStatus: context.authStatus,
      familyfinhealthCaseId: context.currentCaseId,
    })
    if (context.caseName) params.set("caseName", context.caseName)

    return `${context.publicToolPath}?${params.toString()}`
  }

  return context.publicToolPath
}
