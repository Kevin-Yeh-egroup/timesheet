"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowUpDown, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TimeRecord } from "@/lib/types"
import { CATEGORIES, getDifficultyLabel, getDifficultyColor } from "@/lib/types"
import { useTimeRecordStore } from "@/lib/store"
import { EditRecordDialog } from "@/components/edit-record-dialog"
import { toast } from "sonner"

interface MonthlyTableProps {
  records: TimeRecord[]
}

export function MonthlyTable({ records }: MonthlyTableProps) {
  const deleteRecord = useTimeRecordStore((state) => state.deleteRecord)
  const [sortBy, setSortBy] = useState<"date" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleSort = (field: "date" | "category") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }
    setSortBy(field)
    setSortOrder(field === "date" ? "desc" : "asc")
  }

  const sortedRecords = useMemo(() => {
    const categoryOrder = new Map(CATEGORIES.map((category, index) => [category, index]))
    return [...records].sort((a, b) => {
      if (sortBy === "date") {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime()
        return sortOrder === "asc" ? dateDiff : -dateDiff
      }
      const categoryCompare =
        (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0)
      return sortOrder === "asc" ? categoryCompare : -categoryCompare
    })
  }, [records, sortBy, sortOrder])

  const handleDelete = (id: string, activity: string) => {
    deleteRecord(id)
    toast.success(`「${activity}」已刪除`)
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">本月紀錄明細</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">尚無紀錄</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">本月紀錄明細</CardTitle>
          <span className="text-xs text-muted-foreground">{records.length} 筆</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 h-7 px-2"
                    onClick={() => handleSort("date")}
                  >
                    日期
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    {sortBy === "date" && (
                      <span className="text-[10px]">{sortOrder === "asc" ? "升" : "降"}</span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>活動</TableHead>
                <TableHead className="w-16">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 h-7 px-2"
                    onClick={() => handleSort("category")}
                  >
                    類別
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    {sortBy === "category" && (
                      <span className="text-[10px]">{sortOrder === "asc" ? "升" : "降"}</span>
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-16 text-right">時數</TableHead>
                <TableHead className="w-20">難度</TableHead>
                <TableHead className="w-24">資產</TableHead>
                <TableHead className="w-24">轉換</TableHead>
                <TableHead className="w-20 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <TableRow key={record.id} className="group">
                  <TableCell className="text-sm">
                    {format(new Date(record.date), "M/d", { locale: zhTW })}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-sm font-medium">
                    {record.hasOutput && (
                      <span className="mr-1 text-green-500">✓</span>
                    )}
                    {record.activity}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {record.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {record.hours}h
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs ${getDifficultyColor(record.difficulty)}`}>
                      {getDifficultyLabel(record.difficulty)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {record.assets.slice(0, 2).map((asset) => (
                        <Badge key={asset} variant="outline" className="text-xs">
                          {asset}
                        </Badge>
                      ))}
                      {record.assets.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{record.assets.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={record.conversionStatus === "已有成果" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {record.conversionStatus === "尚未轉換"
                        ? "尚未轉換"
                        : record.conversionStatus === "已開始嘗試"
                        ? "嘗試中"
                        : "已有成果"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* 編輯 */}
                      <EditRecordDialog record={record} />

                      {/* 刪除（確認對話框） */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>確認刪除</AlertDialogTitle>
                            <AlertDialogDescription>
                              刪除「{record.activity}」這筆紀錄後無法復原，確定要刪除嗎？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDelete(record.id, record.activity)}
                            >
                              刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
