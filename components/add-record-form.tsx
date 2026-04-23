"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check } from "lucide-react"
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
  ALL_ASSETS,
  CONVERSION_STATUSES,
  getDifficultyLabel,
  type Category,
  type Asset,
  type ConversionStatus,
} from "@/lib/types"
import { toast } from "sonner"

export function AddRecordForm() {
  const addRecord = useTimeRecordStore((state) => state.addRecord)

  const [date, setDate] = useState<Date>(new Date())
  const [activity, setActivity] = useState("")
  const [category, setCategory] = useState<Category>("學習")
  const [hours, setHours] = useState("1")
  const [difficulty, setDifficulty] = useState(3)
  const [hasOutput, setHasOutput] = useState(false)
  const [outputDescription, setOutputDescription] = useState("")
  const [assets, setAssets] = useState<Asset[]>([])
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>("尚未轉換")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleAsset = (asset: Asset) => {
    setAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity.trim()) {
      toast.error("請輸入活動內容")
      return
    }

    setIsSubmitting(true)

    addRecord({
      date: format(date, "yyyy-MM-dd"),
      activity: activity.trim(),
      category,
      hours: parseFloat(hours) || 1,
      difficulty,
      hasOutput,
      outputDescription: hasOutput ? outputDescription : undefined,
      assets,
      conversionStatus,
    })

    toast.success("紀錄已新增")

    // Reset form
    setActivity("")
    setHours("1")
    setDifficulty(3)
    setHasOutput(false)
    setOutputDescription("")
    setAssets([])
    setConversionStatus("尚未轉換")
    setIsSubmitting(false)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">新增時間紀錄</CardTitle>
      </CardHeader>
      <CardContent>
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

          {/* Activity */}
          <div className="space-y-2">
            <Label htmlFor="activity">活動內容</Label>
            <Input
              id="activity"
              placeholder="例如：閱讀《原子習慣》30頁"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>

          {/* Category & Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>類別</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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

          {/* Difficulty */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>難度 / 消耗程度</Label>
              <span className="text-sm text-muted-foreground">
                {difficulty} - {getDifficultyLabel(difficulty)}
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
          </div>

          {/* Assets */}
          <div className="space-y-3">
            <Label>累積的資產 (可多選)</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_ASSETS.map((asset) => (
                <Badge
                  key={asset}
                  variant={assets.includes(asset) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
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
              這段時間有具體產出
            </Label>
          </div>

          {/* Output Description */}
          {hasOutput && (
            <div className="space-y-2">
              <Label htmlFor="outputDesc">產出說明</Label>
              <Textarea
                id="outputDesc"
                placeholder="例如：完成一篇文章草稿"
                value={outputDescription}
                onChange={(e) => setOutputDescription(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Conversion Status */}
          <div className="space-y-2">
            <Label>轉換狀態</Label>
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
            {isSubmitting ? "儲存中..." : "新增紀錄"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
