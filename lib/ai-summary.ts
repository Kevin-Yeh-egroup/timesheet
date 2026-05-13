import type { SummaryInsight } from "@/lib/insights"

export interface AISummaryResponse {
  summary: string
  source: "gemini" | "fallback"
}

export async function generateAISummary(insight: SummaryInsight): Promise<AISummaryResponse> {
  try {
    const response = await fetch("/api/ai-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insight }),
    })

    if (!response.ok) throw new Error(`AI summary failed: ${response.status}`)

    return await response.json() as AISummaryResponse
  } catch (error) {
    console.warn("AI summary fallback used", error)
    return {
      summary: insight.fallbackSummary,
      source: "fallback",
    }
  }
}
