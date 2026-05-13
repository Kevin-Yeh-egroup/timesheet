import { NextResponse } from "next/server"
import type { SummaryInsight } from "@/lib/insights"

interface AISummaryRequest {
  insight?: SummaryInsight
}

function fallback(summary: string) {
  return NextResponse.json({ summary, source: "fallback" })
}

export async function POST(request: Request) {
  const { insight } = await request.json() as AISummaryRequest

  if (!insight) {
    return NextResponse.json({ error: "Missing insight" }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fallback(insight.fallbackSummary)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: [
                    "你是時間資產轉換系統的摘要助手。",
                    "請根據統計素材，生成一段繁體中文摘要，語氣溫和、支持、引導。",
                    "避免使用：評分、扣分、太少、不夠、浪費、機會成本、低效。",
                    "請使用：累積、配置、觀察、可以嘗試、逐步、持續。",
                    "摘要以 2 到 3 句為主，不要列點，不要誇張承諾。",
                    `摘要類型：${insight.title}`,
                    `期間：${insight.periodLabel}`,
                    `統計：${JSON.stringify(insight.stats)}`,
                    `重點：${insight.highlights.join("；")}`,
                    `建議素材：${insight.suggestions.join("；")}`,
                    `備援摘要：${insight.fallbackSummary}`,
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 220,
          },
        }),
      }
    )

    if (!response.ok) return fallback(insight.fallbackSummary)

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    return NextResponse.json({
      summary: summary || insight.fallbackSummary,
      source: summary ? "gemini" : "fallback",
    })
  } catch (error) {
    console.warn("Gemini summary failed", error)
    return fallback(insight.fallbackSummary)
  }
}
