export type AuthStatus = "guest" | "registered"
export type AudienceMode = "public" | "social-worker"

export type PlatformContext = {
  authStatus: AuthStatus
  audienceMode: AudienceMode
  currentCaseId?: string
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

export function resolveToolEntryPath(
  context: PlatformContext,
  options: { guideCompleted?: boolean } = {}
) {
  if (context.authStatus === "guest" && !options.guideCompleted) {
    return context.guidePath
  }

  if (context.audienceMode === "social-worker") {
    return context.currentCaseId
      ? `${context.caseToolBasePath}/${context.currentCaseId}/time-assets`
      : context.caseListPath
  }

  return context.publicToolPath
}
