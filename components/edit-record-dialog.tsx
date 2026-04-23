"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
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
import {
  ALL_ASSETS,
  CATEGORIES,
  CONVERSION_STATUSES,
  getDifficultyLabel,
  type Asset,
  type Category,
  type ConversionStatus,
  type TimeRecord
} from "@/lib/types"
import { toast } from "sonner"

export function EditRecordDialog({ record }: { record: TimeRecord }) {
  const updateRecord = useTimeRecordStore((state) => state.updateRecord)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(parseISO(record.date))
  const [activity, setActivity] = useState(record.activity)
  const [category, setCategory] = useState<Category>(record.category)
  const [hours, setHours] = useState(record.hours.toString())
  const [difficulty, setDifficulty] = useState(record.difficulty)
  const [hasOutput, setHasOutput] = useState(record.hasOutput)
  const [outputDescription, setOutputDescription] = useState(record.outputDescription ?? "")
  const [assets, setAssets] = useState<Asset[]>(record.assets)
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>(record.conversionStatus)

  useEffect(() => {
    if (!open) return
    setDate(parseISO(record.date))
    setActivity(record.activity)
    setCategory(record.category)
    setHours(record.hours.toString())
    setDifficulty(record.difficulty)
    setHasOutput(record.hasOutput)
    setOutputDescription(record.outputDescription ?? "")
    setAssets(record.assets)
    setConversionStatus(record.conversionStatus)
  }, [open, record])

  const toggleAsset = (asset: Asset) => {
    setAssets((prev) => (prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity.trim()) {
      toast.error("請輸入活動內容")
      return
    }

    updateRecord(record.id, {
      date: format(date, "yyyy-MM-dd"),
      activity: activity.trim(),
      category,
      hours: parseFloat(hours) || 1,
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
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Pencil className="h-4 w-4" />
        </Button>
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
          <div className="space-y-2">
            <Label>難度 / 消耗程度：{difficulty} - {getDifficultyLabel(difficulty)}</Label>
            <Slider value={[difficulty]} onValueChange={([v]) => setDifficulty(v)} min={1} max={5} step={1} />
          </div>
          <div className="space-y-2">
            <Label>累積資產 (可多選)</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_ASSETS.map((asset) => (
                <Badge
                  key={asset}
                  variant={assets.includes(asset) ? "default" : "outline"}
                  className="cursor-pointer"
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
            <Label htmlFor={`has-output-${record.id}`}>這段時間有具體產出</Label>
          </div>
          {hasOutput && (
            <div className="space-y-2">
              <Label htmlFor={`output-${record.id}`}>產出說明</Label>
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
