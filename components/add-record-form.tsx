"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check, Sparkles } from "lucide-react"
import { zhTW } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useTimeRecordStore } from "@/lib/store"
import {
  CATEGORIES,
  CATEGORY_EMOJIS,
  CONVERSION_STATUSES,
  DISPLAY_ASSETS,
  TIME_OPTIONS,
  calculateHoursFromTimeRange,
  getDefaultTimeRange,
  getEndTimeOptions,
  getPresetsByCategory,
  isValidTimeString,
  suggestAssetsForRecord,
  timeStringToMinutes,
  type Category,
  type Asset,
  type ConversionStatus,
} from "@/lib/types"
import { toast } from "sonner"
import type { AIParsedResult } from "@/components/ai-intake-demo"

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "輕鬆", color: "text-gray-500" },
  2: { label: "輕鬆", color: "text-gray-500" },
  3: { label: "中等", color: "text-blue-500" },
  4: { label: "較有挑戰", color: "text-orange-500" },
  5: { label: "較有挑戰", color: "text-orange-600" },
}

export function AddRecordForm({
  prefill,
  initialDate,
  initialStartTime,
  initialEndTime,
  onSuccess,
}: {
  prefill?: AIParsedResult | null
  initialDate?: Date
  initialStartTime?: string
  initialEndTime?: string
  onSuccess?: () => void
}) {
  const addRecord = useTimeRecordStore((state) => state.addRecord)

  const [date, setDate] = useState<Date>(initialDate ?? new Date())
  const initialTimeRange = getDefaultTimeRange()
  const [activity, setActivity] = useState("")
  const [category, setCategory] = useState<Category>("做事")
  const [hours, setHours] = useState("1")
  const [startTime, setStartTime] = useState(initialStartTime ?? initialTimeRange.startTime)
  const [endTime, setEndTime] = useState(initialEndTime ?? initialTimeRange.endTime)
  const [difficulty, setDifficulty] = useState(3)
  const [hasOutput, setHasOutput] = useState(false)
  const [outputDescription, setOutputDescription] = useState("")
  const [assets, setAssets] = useState<Asset[]>([])
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>("尚未轉換")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (initialDate) setDate(initialDate)
  }, [initialDate])

  useEffect(() => {
    const fallback = getDefaultTimeRange()
    setStartTime(initialStartTime ?? fallback.startTime)
    setEndTime(initialEndTime ?? fallback.endTime)
  }, [initialStartTime, initialEndTime])

  useEffect(() => {
    const calculatedHours = calculateHoursFromTimeRange(startTime, endTime)
    if (calculatedHours !== null) setHours(calculatedHours.toString())
  }, [startTime, endTime])

  useEffect(() => {
    const start = timeStringToMinutes(startTime)
    const end = timeStringToMinutes(endTime)
    if (start !== null && end !== null && end <= start) {
      const nextEnd = getEndTimeOptions(startTime)[0]
      if (nextEnd) setEndTime(nextEnd)
    }
  }, [startTime, endTime])

  useEffect(() => {
    if (!prefill) return
    setDate(initialDate ?? new Date())
    setActivity(prefill.activity)
    setCategory(prefill.category)
    setHours(prefill.hours.toString())
    const fallback = getDefaultTimeRange()
    setStartTime(prefill.startTime ?? initialStartTime ?? fallback.startTime)
    setEndTime(prefill.endTime ?? initialEndTime ?? fallback.endTime)
    setDifficulty(prefill.difficulty)
    setHasOutput(prefill.hasOutput)
    setOutputDescription(prefill.outputDescription ?? "")
    setAssets(prefill.assets)
    setConversionStatus(prefill.conversionStatus)
  }, [prefill, initialDate, initialStartTime, initialEndTime])

  const toggleAsset = (asset: Asset) => {
    setAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    )
  }

  const categoryPresets = getPresetsByCategory(category)
  const suggestedAssets = suggestAssetsForRecord(category, activity)

  const applyPreset = (preset: { activity: string; difficulty: number; assets: Asset[] }) => {
    setActivity(preset.activity)
    setDifficulty(preset.difficulty)
    setAssets(preset.assets)
  }

  const applySuggestedAssets = () => {
    setAssets(suggestedAssets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity.trim()) {
      toast.error("請輸入活動內容")
      return
    }

    const calculatedHours = calculateHoursFromTimeRange(startTime, endTime)
    if (!startTime || !endTime || !isValidTimeString(startTime) || !isValidTimeString(endTime) || calculatedHours === null) {
      toast.error("請選擇開始與結束時段，且結束時間需晚於開始時間")
      return
    }

    setIsSubmitting(true)

    addRecord({
      date: format(date, "yyyy-MM-dd"),
      activity: activity.trim(),
      category,
      hours: calculatedHours ?? (parseFloat(hours) || 1),
      startTime,
      endTime,
      difficulty,
      hasOutput,
      outputDescription: hasOutput ? outputDescription : undefined,
      assets,
      conversionStatus,
    })

    // Reset form
    const fallback = getDefaultTimeRange()
    setActivity("")
    setHours("1")
    setStartTime(fallback.startTime)
    setEndTime(fallback.endTime)
    setDifficulty(3)
    setHasOutput(false)
    setOutputDescription("")
    setAssets([])
    setConversionStatus("尚未轉換")
    setIsSubmitting(false)
    setJustAdded(true)

    setTimeout(() => setJustAdded(false), 4000)
    if (onSuccess) setTimeout(onSuccess, 1200)
  }

  const diffInfo = DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS[3]

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">手動新增時間紀錄</CardTitle>
        <p className="text-sm text-muted-foreground">
          建議每天固定時段（例如晚間 21:00）回顧並記錄一天的時間去向。
        </p>
      </CardHeader>
      <CardContent>

        {/* 新增成功回饋卡 */}
        {justAdded && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <Sparkles className="h-4 w-4 shrink-0 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              這段時間已記錄為你的累積 ✨
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <Label>日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy年M月d日 (EEE)", { locale: zhTW }) : "選擇日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div>
              <Label>時段</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                請選擇開始與結束時間，系統會自動換算時數。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs text-muted-foreground">開始</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="startTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.slice(0, -1).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-xs text-muted-foreground">結束</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="endTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getEndTimeOptions(startTime).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <Label htmlFor="activity">活動內容</Label>
            <Input
              id="activity"
              placeholder="例如：通勤聽英文 podcast、陪長輩看診、整理房間"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>

          {/* Category & Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>生活情境</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_EMOJIS[cat] || ""} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">時數</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">常見情境</Label>
              <span className="text-xs text-muted-foreground">可點選帶入，也可略過</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryPresets.map((preset) => (
                <Badge
                  key={preset.activity}
                  variant="outline"
                  className="cursor-pointer transition-all hover:bg-accent active:scale-95"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.activity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>這件事的投入程度</Label>
              <span className={`text-sm font-medium ${diffInfo.color}`}>
                {difficulty} — {diffInfo.label}
              </span>
            </div>
            <Slider
              value={[difficulty]}
              onValueChange={([v]) => setDifficulty(v)}
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>輕鬆</span>
              <span>中等</span>
              <span>較有挑戰</span>
            </div>
          </div>

          {/* Assets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>這段時間累積了什麼？（可多選）</Label>
              {suggestedAssets.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={applySuggestedAssets}>
                  套用建議
                </Button>
              )}
            </div>
            {suggestedAssets.length > 0 && (
              <p className="text-xs text-muted-foreground">
                建議：{suggestedAssets.join("、")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {DISPLAY_ASSETS.map((asset) => (
                <Badge
                  key={asset}
                  variant={assets.includes(asset) ? "default" : "outline"}
                  className="cursor-pointer transition-all active:scale-95"
                  onClick={() => toggleAsset(asset)}
                >
                  {assets.includes(asset) && <Check className="mr-1 h-3 w-3" />}
                  {asset}
                </Badge>
              ))}
            </div>
          </div>

          {/* Has Output */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasOutput"
              checked={hasOutput}
              onCheckedChange={(checked) => setHasOutput(checked === true)}
            />
            <Label htmlFor="hasOutput" className="cursor-pointer">
              這段時間有留下成果、感受或完成一件事
            </Label>
          </div>

          {/* Output Description */}
          {hasOutput && (
            <div className="space-y-2">
              <Label htmlFor="outputDesc">成果或感受（選填）</Label>
              <Textarea
                id="outputDesc"
                placeholder="例如：完成一篇文章草稿、身體有恢復、想法更清楚"
                value={outputDescription}
                onChange={(e) => setOutputDescription(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Conversion Status */}
          <div className="space-y-2">
            <Label>目前的轉換狀態</Label>
            <Select
              value={conversionStatus}
              onValueChange={(v) => setConversionStatus(v as ConversionStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONVERSION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "儲存中…" : "新增紀錄"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
