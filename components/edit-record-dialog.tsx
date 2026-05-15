"use client"

import { useEffect, useState, type ReactNode } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check, Pencil } from "lucide-react"
import { zhTW } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTimeRecordStore } from "@/lib/store"
import { parseDateKey } from "@/lib/date-utils"
import {
  CATEGORY_EMOJIS,
  CATEGORIES,
  CONVERSION_STATUSES,
  DISPLAY_ASSETS,
  TIME_OPTIONS,
  calculateHoursFromTimeRange,
  getDefaultTimeRange,
  getDifficultyLabel,
  getEndTimeOptions,
  getPresetsByCategory,
  isValidTimeString,
  suggestAssetsForRecord,
  timeStringToMinutes,
  type Asset,
  type Category,
  type ConversionStatus,
  type TimeRecord
} from "@/lib/types"
import { toast } from "sonner"

export function EditRecordDialog({ record, trigger }: { record: TimeRecord; trigger?: ReactNode }) {
  const updateRecord = useTimeRecordStore((state) => state.updateRecord)
  const [open, setOpen] = useState(false)
  const initialTimeRange = getDefaultTimeRange()
  const [date, setDate] = useState<Date>(parseDateKey(record.date))
  const [activity, setActivity] = useState(record.activity)
  const [category, setCategory] = useState<Category>(record.category)
  const [hours, setHours] = useState(record.hours.toString())
  const [startTime, setStartTime] = useState(record.startTime ?? initialTimeRange.startTime)
  const [endTime, setEndTime] = useState(record.endTime ?? initialTimeRange.endTime)
  const [difficulty, setDifficulty] = useState(record.difficulty)
  const [hasOutput, setHasOutput] = useState(record.hasOutput)
  const [outputDescription, setOutputDescription] = useState(record.outputDescription ?? "")
  const [assets, setAssets] = useState<Asset[]>(record.assets)
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>(record.conversionStatus)

  useEffect(() => {
    if (!open) return
    setDate(parseDateKey(record.date))
    setActivity(record.activity)
    setCategory(record.category)
    setHours(record.hours.toString())
    const fallback = getDefaultTimeRange()
    setStartTime(record.startTime ?? fallback.startTime)
    setEndTime(record.endTime ?? fallback.endTime)
    setDifficulty(record.difficulty)
    setHasOutput(record.hasOutput)
    setOutputDescription(record.outputDescription ?? "")
    setAssets(record.assets)
    setConversionStatus(record.conversionStatus)
  }, [open, record])

  const toggleAsset = (asset: Asset) => {
    setAssets((prev) => (prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]))
  }

  const categoryPresets = getPresetsByCategory(category)
  const suggestedAssets = suggestAssetsForRecord(category, activity)
  const visibleAssets = Array.from(new Set([...DISPLAY_ASSETS, ...assets]))

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

  const handleSave = (e: React.FormEvent) => {
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

    updateRecord(record.id, {
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
      conversionStatus
    })
    toast.success("紀錄已更新")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>編輯紀錄</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "yyyy年M月d日 (EEE)", { locale: zhTW })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div>
              <Label>時段</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                請選擇開始與結束時間；系統會自動換算時數。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`start-time-${record.id}`} className="text-xs text-muted-foreground">開始</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id={`start-time-${record.id}`}>
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
                <Label htmlFor={`end-time-${record.id}`} className="text-xs text-muted-foreground">結束</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id={`end-time-${record.id}`}>
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
          <div className="space-y-2">
            <Label htmlFor={`activity-${record.id}`}>活動內容</Label>
            <Input
              id={`activity-${record.id}`}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="活動內容"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>生活情境</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_EMOJIS[cat]} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`hours-${record.id}`}>時數</Label>
              <Input
                id={`hours-${record.id}`}
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
                  onClick={() => {
                    setActivity(preset.activity)
                    setDifficulty(preset.difficulty)
                    setAssets(preset.assets)
                  }}
                >
                  {preset.activity}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>難度 / 消耗程度：{difficulty} - {getDifficultyLabel(difficulty)}</Label>
            <Slider value={[difficulty]} onValueChange={([v]) => setDifficulty(v)} min={1} max={5} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>累積資產 (可多選)</Label>
              {suggestedAssets.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setAssets(suggestedAssets)}>
                  套用建議
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {visibleAssets.map((asset) => (
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
          <div className="flex items-center gap-2">
            <Checkbox
              id={`has-output-${record.id}`}
              checked={hasOutput}
              onCheckedChange={(checked) => setHasOutput(checked === true)}
            />
            <Label htmlFor={`has-output-${record.id}`}>這段時間有留下成果、感受或完成一件事</Label>
          </div>
          {hasOutput && (
            <div className="space-y-2">
              <Label htmlFor={`output-${record.id}`}>成果或感受</Label>
              <Textarea
                id={`output-${record.id}`}
                value={outputDescription}
                onChange={(e) => setOutputDescription(e.target.value)}
                rows={2}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>轉換狀態</Label>
            <Select value={conversionStatus} onValueChange={(v) => setConversionStatus(v as ConversionStatus)}>
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
          <Button type="submit" className="w-full">
            儲存變更
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
