import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageBreak, Header, Footer,
  convertInchesToTwip,
} from "docx"
import { writeFileSync } from "fs"
import { join } from "path"

// ─── 顏色常數 ───────────────────────────────────
const BLUE   = "1E40AF"
const BLUE_L = "DBEAFE"
const GRAY   = "6B7280"
const GRAY_L = "F8FAFC"
const GREEN  = "16A34A"
const RED    = "DC2626"
const WHITE  = "FFFFFF"

// ─── 輔助函式 ───────────────────────────────────
const h1 = (text: string) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    border: { bottom: { color: BLUE, size: 12, style: BorderStyle.SINGLE } },
    run: { color: BLUE, bold: true, size: 44 },
  })

const h2 = (text: string) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 120 },
    border: { bottom: { color: BLUE_L, size: 6, style: BorderStyle.SINGLE } },
    run: { color: BLUE, bold: true, size: 28 },
  })

const h3 = (text: string) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
    run: { color: "1D4ED8", bold: true, size: 24 },
  })

const p = (text: string, opts?: { bold?: boolean; color?: string; size?: number }) =>
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, ...opts, size: opts?.size ?? 22, font: "Microsoft JhengHei" })],
  })

const bullet = (text: string, color?: string) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 21, color: color ?? "374151", font: "Microsoft JhengHei" })],
  })

const good = (text: string) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({ text: "✅ ", size: 21 }),
      new TextRun({ text, size: 21, color: GREEN, font: "Microsoft JhengHei" }),
    ],
  })

const bad = (text: string) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({ text: "❌ ", size: 21 }),
      new TextRun({ text, size: 21, color: RED, font: "Microsoft JhengHei" }),
    ],
  })

const code = (lines: string[]) =>
  new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { type: ShadingType.SOLID, color: "F1F5F9" },
    border: {
      left: { color: BLUE_L, size: 12, style: BorderStyle.SINGLE },
    },
    indent: { left: 240 },
    children: lines.flatMap((line, i) => [
      new TextRun({ text: line, font: "Consolas", size: 18, color: "1E293B", break: i > 0 ? 1 : 0 }),
    ]),
  })

const blank = () => new Paragraph({ spacing: { before: 80, after: 80 }, children: [] })

// ─── 表格輔助 ───────────────────────────────────
const cell = (text: string, opts?: { bold?: boolean; bg?: string; color?: string; width?: number }) =>
  new TableCell({
    width: opts?.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts?.bg ? { type: ShadingType.SOLID, color: opts.bg } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({
        text,
        bold: opts?.bold ?? false,
        size: 20,
        color: opts?.color ?? "374151",
        font: "Microsoft JhengHei",
      })],
    })],
  })

const headerRow = (cols: string[]) =>
  new TableRow({
    children: cols.map(c => cell(c, { bold: true, bg: BLUE_L, color: BLUE })),
  })

const dataRow = (cols: string[], shade?: boolean) =>
  new TableRow({
    children: cols.map(c => cell(c, shade ? { bg: "F9FAFB" } : undefined)),
  })

const mkTable = (headers: string[], rows: string[][], pct = 100) =>
  new Table({
    width: { size: pct, type: WidthType.PERCENTAGE },
    margins: { top: 80, bottom: 80 },
    rows: [
      headerRow(headers),
      ...rows.map((r, i) => dataRow(r, i % 2 === 1)),
    ],
  })

// ─── 文件建立 ───────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Microsoft JhengHei", size: 22, color: "1A1A2E" } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1.1),
          bottom: convertInchesToTwip(1.0),
          left: convertInchesToTwip(1.25),
          right: convertInchesToTwip(1.25),
        },
      },
    },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "時間資產轉換系統 — 規則文件", size: 18, color: GRAY, font: "Microsoft JhengHei" })],
            border: { bottom: { color: BLUE_L, size: 6, style: BorderStyle.SINGLE } },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "時間資產轉換系統規則文件 v1.0  ·  2026年4月28日", size: 18, color: GRAY, font: "Microsoft JhengHei" }),
            ],
          })],
        }),
      },
    children: [

      // ── 封面 ──────────────────────────────────
      blank(), blank(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "時間資產轉換系統", bold: true, size: 56, color: BLUE, font: "Microsoft JhengHei" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "規則文件", bold: true, size: 36, color: "1D4ED8", font: "Microsoft JhengHei" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [new TextRun({ text: "專案設計規範 · 語言守則 · 技術慣例 · AI 協作指引", size: 22, color: GRAY, font: "Microsoft JhengHei" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "最後更新：2026年4月28日  ·  v1.0", size: 20, color: GRAY, font: "Microsoft JhengHei" })],
      }),
      blank(),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. 產品核心哲學 ──────────────────────
      h1("1. 產品核心哲學"),
      p("此工具的唯一目標是幫助使用者："),
      bullet("看見自己的時間配置"),
      bullet("理解正在累積的能力與資源"),
      bullet("發現不同選擇的可能性"),
      bullet("慢慢靠近理想生活"),
      blank(),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { type: ShadingType.SOLID, color: "EFF6FF" },
        border: { left: { color: BLUE, size: 16, style: BorderStyle.SINGLE } },
        indent: { left: 200 },
        children: [new TextRun({
          text: "所有呈現以「觀察、理解、引導」為主，絕對禁止任何評分、檢討、責備的語氣。",
          bold: true, size: 22, color: BLUE, font: "Microsoft JhengHei",
        })],
      }),
      blank(),
      h3("三個核心概念轉換"),
      mkTable(
        ["輸入", "→", "輸出"],
        [
          ["每日時間記錄", "→", "六維能力分數"],
          ["能力分數",     "→", "未來可能性提示"],
          ["未來可能性",   "→", "具體的經濟效益說明"],
        ]
      ),

      // ── 2. 技術架構 ──────────────────────────
      h1("2. 技術架構"),
      mkTable(
        ["層次", "技術", "說明"],
        [
          ["框架",    "Next.js 16 App Router",          "Static Export，三個路由：/ /add /report"],
          ["語言",    "TypeScript 5.7",                  "ignoreBuildErrors: true（Vercel 部署用）"],
          ["UI 元件", "shadcn/ui（new-york）+ Radix",    "components.json 管理"],
          ["樣式",    "Tailwind CSS 4",                  "@import 'tailwindcss'，app/globals.css"],
          ["狀態",    "Zustand 5 + persist",             "localStorage key: time-records-storage"],
          ["圖表",    "Recharts 2.15",                   "WeeklyChart 用；CapabilityChart 用純 CSS"],
          ["日期",    "date-fns 4",                      "zhTW locale"],
          ["字型",    "Noto Sans TC",                    "400/500/600/700"],
          ["分析",    "@vercel/analytics",               "只在 production 載入"],
        ]
      ),

      // ── 3. 核心資料模型 ──────────────────────
      h1("3. 核心資料模型"),
      h3("TimeRecord 介面"),
      code([
        "interface TimeRecord {",
        "  id: string",
        "  date: string              // 'yyyy-MM-dd'",
        "  activity: string",
        "  category: Category",
        "  hours: number             // 0.5 起，step 0.5",
        "  difficulty: number        // 1–5",
        "  hasOutput: boolean",
        "  outputDescription?: string",
        "  assets: Asset[]",
        "  conversionStatus: ConversionStatus",
        "  createdAt: string",
        "}",
      ]),
      blank(),
      h3("型別枚舉"),
      mkTable(
        ["型別", "允許值"],
        [
          ["Category",         '"工作" | "學習" | "副業" | "人際" | "休息"'],
          ["ConversionStatus", '"尚未轉換" | "已開始嘗試" | "已有成果"'],
          ["IntangibleAsset",  '"體力" | "軟實力" | "硬實力"'],
          ["TangibleAsset",    '"存款增加" | "收入" | "工具/副業基礎"'],
        ]
      ),
      blank(),
      h3("難度標籤對照"),
      mkTable(
        ["數值", "標籤", "顏色"],
        [
          ["1–2", "輕鬆",    "text-muted-foreground（灰）"],
          ["3",   "中等",    "text-blue-500"],
          ["4–5", "較有挑戰","text-orange-500"],
        ]
      ),
      blank(),
      h3("資產累積點數公式"),
      code([
        "assetPoints = intangibleAssetCount × 1",
        "            + tangibleAssetCount   × 2",
        "            + outputRecordCount    × 1.5",
      ]),

      // ── 4. 六維能力系統 ──────────────────────
      h1("4. 六維能力系統"),
      p("六種能力對應使用者可用於解決經濟問題的核心資本：", { bold: true }),
      blank(),
      mkTable(
        ["能力", "Emoji", "計算原料", "softCap", "計算公式（raw score）"],
        [
          ["調整時間", "⏱️", "工作時數、類別多元性、紀錄筆數", "35", "workH×0.4 + avgCatPerDay×8 + records×0.5"],
          ["增加體力", "💪", "休息時數、運動關鍵字時數",        "20", "restH×1.0 + exerciseH×2.5"],
          ["強化能力", "🧱", "工作困難投入值、工作有產出筆數",  "50", "workDiffScore×0.5 + workWithOutput×5"],
          ["增加技能", "📚", "學習/副業困難投入值、硬實力標籤", "30", "learnDiff×1.0 + sideDiff×0.7 + hardSkill×2"],
          ["運用人脈", "🤝", "人際時數、人際有產出、軟實力標籤","20", "relH×2 + relOutput×8 + softSkill×1.5"],
          ["增加知識", "💡", "學習時數、學習困難投入值",        "25", "learnH×1.5 + learnDiff×0.8"],
        ]
      ),
      blank(),
      h3("Sigmoid 平滑公式"),
      code([
        "score = Math.round(100 × ratio / (1 + ratio))",
        "其中  ratio = rawScore / softCap",
        "",
        "// 特性：",
        "// ratio = 1 (rawScore = softCap) → score = 50%",
        "// ratio = 2                       → score ≈ 67%",
        "// ratio = 4                       → score ≈ 80%",
        "// 不會輕易達到 100%，也不會長期停在 0%",
      ]),
      blank(),
      h3("能力四個階段"),
      mkTable(
        ["分數", "調整時間", "增加體力", "強化能力", "增加技能", "運用人脈", "增加知識"],
        [
          ["0–29%",   "時間覺察", "基礎維持", "能力基礎", "技能探索", "人脈基礎", "知識積累"],
          ["30–59%",  "有意安排", "穩定儲備", "效率提升", "技能成型", "信任建立", "知識應用"],
          ["60–79%",  "靈活調配", "精力充沛", "競爭優勢", "斜槓雛形", "機會網絡", "深度洞察"],
          ["80–100%", "時間自主", "巔峰狀態", "領域專家", "技能套件", "人脈資本", "知識資產"],
        ]
      ),

      // ── 5. 時間歸因規則 ──────────────────────
      h1("5. 時間 → 能力歸因規則（圖表用）"),
      p("確保同一天時數不重複計算，合計 ≈ 當日實際總時數："),
      blank(),
      mkTable(
        ["類別", "⏱️ 調整", "💪 體力", "🧱 強化", "📚 技能", "🤝 人脈", "💡 知識"],
        [
          ["工作", "×0.3", "—",    "×0.7", "—",    "—",    "—"],
          ["休息", "—",    "×1.0", "—",    "—",    "—",    "—"],
          ["學習", "—",    "—",    "—",    "×0.5", "—",    "×0.5"],
          ["副業", "—",    "—",    "—",    "×1.0", "—",    "—"],
          ["人際", "—",    "—",    "—",    "—",    "×1.0", "—"],
        ]
      ),
      blank(),
      p("說明：工作時數分配給「調整時間 30%」+「強化能力 70%」；學習時數分配給「增加技能 50%」+「增加知識 50%」。"),

      // ── 6. UI 設計規範 ───────────────────────
      h1("6. UI 設計規範"),
      h3("六維能力配色系統"),
      mkTable(
        ["能力", "Tailwind Bar", "Tailwind Badge", "Recharts 色碼"],
        [
          ["⏱️ 調整時間", "bg-blue-500",   "bg-blue-100 text-blue-700",   "#3b82f6"],
          ["💪 增加體力", "bg-green-500",  "bg-green-100 text-green-700",  "#22c55e"],
          ["🧱 強化能力", "bg-orange-500", "bg-orange-100 text-orange-700","#f97316"],
          ["📚 增加技能", "bg-purple-500", "bg-purple-100 text-purple-700","#a855f7"],
          ["🤝 運用人脈", "bg-amber-500",  "bg-amber-100 text-amber-700",  "#f59e0b"],
          ["💡 增加知識", "bg-teal-500",   "bg-teal-100 text-teal-700",    "#14b8a6"],
        ]
      ),
      blank(),
      h3("24小時完整度顯示規則"),
      mkTable(
        ["完整度", "標籤", "顏色"],
        [
          ["≥ 100%", "完整記錄", "text-green-600"],
          ["70–99%", "大致完整", "text-blue-600"],
          ["< 70%",  "可補充",   "text-orange-500"],
        ]
      ),
      blank(),
      h3("新增成功回饋卡"),
      code([
        "<div className='rounded-lg border border-green-200 bg-green-50 px-4 py-3'>",
        "  ✨ 這段時間已記錄為你的累積",
        "</div>",
        "// 持續 4 秒後消失（setTimeout 4000ms）",
      ]),

      // ── 7. 語言與語氣守則 ────────────────────
      h1("7. 語言與語氣守則"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { type: ShadingType.SOLID, color: "FEF3C7" },
        border: { left: { color: "F59E0B", size: 16, style: BorderStyle.SINGLE } },
        indent: { left: 200 },
        children: [new TextRun({
          text: "絕對禁用詞彙：評分、扣分、太少、不夠、浪費、機會成本（負面）、低效、應該、必須",
          bold: true, size: 21, color: "92400E", font: "Microsoft JhengHei",
        })],
      }),
      blank(),
      h3("正向替換對照"),
      mkTable(
        ["❌ 禁用", "✅ 替換"],
        [
          ["尚未啟動",       "尚未轉換"],
          ["已產生收入或成果","已有成果"],
          ["潛在機會成本",   "資產累積點數"],
          ["低回報工作",     "恢復型時間"],
          ["你應該多運動",   "可以嘗試加入短時段的運動"],
          ["學習時數偏低",   "可以嘗試增加一些學習時間"],
          ["生產力",         "成長生產時間"],
        ]
      ),
      blank(),
      h3("建議語句開頭規範"),
      good("「可以嘗試…」「可以安排…」「可以加入…」"),
      good("「如果想要…，可以…」"),
      bad("「你應該…」「你必須…」「建議你一定要…」"),

      // ── 8. 觀察與建議模組 ────────────────────
      h1("8. 觀察與建議模組（昨日 / 本週 / 本月）"),
      h3("昨日 Tab"),
      bullet("計算函式：getYesterdayInsights(records) → YesterdayInsights"),
      bullet("顯示：24小時完整度 + 類別橫條圖 + 正向回饋 + 1條溫和建議"),
      bullet("建議優先順序：無休息 > 無學習/工作 > 類別單一 > 預設正向"),
      blank(),
      h3("本週 Tab"),
      bullet("計算函式：getWeeklyInsights(records) → WeeklyInsights"),
      bullet("日期範圍：今天往前推 6 天（含今天共 7 天），從 T00:00:00 起算"),
      bullet("顯示：本週時數、最投入日、有成果筆數、類別分布、觀察語句、1條建議"),
      blank(),
      h3("本月 Tab"),
      bullet("計算函式：getMonthTypology(metrics) + getMonthSuggestions(metrics)"),
      bullet("顯示：時間型態描述（1句）+ 系統觀察（1句）+ 建議（最多 3 條）"),
      blank(),
      h3("架構原則"),
      p("所有計算邏輯放 lib/types.ts，元件只做 UI 渲染："),
      code([
        "// ✅ 正確",
        "const insights = getYesterdayInsights(records)",
        "",
        "// ❌ 錯誤 — 不在元件內直接計算",
        "const recs = records.filter(r => r.date === yesterday)",
      ]),

      // ── 9. 匯出功能 ──────────────────────────
      h1("9. 匯出功能規格"),
      mkTable(
        ["格式", "實作方式", "檔名", "BOM"],
        [
          ["CSV",  "Blob + text/csv",              "時間資產紀錄_YYYYMM.csv", "✅"],
          ["Word", "HTML Blob + application/msword","時間資產報表_YYYYMM.doc", "✅"],
          ["PDF",  "window.print()",                "使用者另存",              "—"],
        ]
      ),
      blank(),
      h3("Word 報表必含區段"),
      bullet("① 本月摘要（總時數、困難投入值、資產點數、轉換率）"),
      bullet("② 本月時間型態觀察"),
      bullet("③ 努力紀錄清單（完整表格）"),
      bullet("④ 來月溫和建議"),
      bullet("⑤ 生成時間戳記"),
      blank(),
      h3("Word 樣式規範"),
      bullet("字型：Microsoft JhengHei / Noto Sans TC"),
      bullet("標題色：#1e40af"),
      bullet("卡片背景：#eff6ff"),
      bad("不使用紅色、橘色警示色"),

      // ── 10. 元件開發慣例 ─────────────────────
      h1("10. 元件開發慣例"),
      h3("計算層與 UI 層分離"),
      code([
        "// ✅ 正確：lib/types.ts 負責計算，元件只消費",
        "const capabilities = calculateCapabilities(records)",
        "const insights     = getWeeklyInsights(records)",
        "",
        "// ❌ 錯誤：不在元件內直接計算",
        "const workH = records.filter(r => r.category === '工作').reduce(...)",
      ]),
      blank(),
      h3("圖表技術選擇"),
      mkTable(
        ["情境", "技術", "範例元件"],
        [
          ["靜態橫條比較",  "純 CSS（Tailwind 寬度 %）", "capability-chart.tsx"],
          ["時間序列趨勢",  "Recharts",                  "weekly-chart.tsx"],
        ]
      ),
      blank(),
      h3("命名與結構規範"),
      bullet("元件檔案：kebab-case.tsx（如 daily-completion.tsx）"),
      bullet("導出：Named export（非 default export）"),
      bullet("Props 介面：元件名 + Props（如 DailyCompletionProps）"),
      bullet("所有使用 Zustand / useState / useEffect 的元件頂部必須加 \"use client\""),

      // ── 11. 規則檔案清單 ─────────────────────
      h1("11. 規則檔案清單（.cursor/rules/）"),
      mkTable(
        ["檔案", "alwaysApply", "globs", "用途"],
        [
          ["project-core.mdc",        "✅ true", "—",                                     "核心架構、資料模型、六維能力、歸因規則"],
          ["component-patterns.mdc",  "—",       "**/*.tsx",                              "元件設計規範、配色系統、語言守則"],
          ["reflection-insights.mdc", "—",       "components/reflection-insights.tsx",   "三個 Tab 的計算與語氣規則"],
          ["export-conventions.mdc",  "—",       "components/export-button.tsx",          "CSV / Word / PDF 匯出規格"],
        ]
      ),
      blank(), blank(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { color: BLUE_L, size: 6, style: BorderStyle.SINGLE } },
        spacing: { before: 200 },
        children: [new TextRun({
          text: "時間資產轉換與生活觀察系統  ·  規則文件 v1.0  ·  2026年4月28日",
          size: 18, color: GRAY, font: "Microsoft JhengHei",
        })],
      }),
    ],
  }],
})

// ─── 輸出 ───────────────────────────────────────
const outPath = join(process.cwd(), "public", "時間資產系統規則文件.docx")
Packer.toBuffer(doc).then(buf => {
  writeFileSync(outPath, buf)
  console.log("✅ 已輸出：", outPath)
})
