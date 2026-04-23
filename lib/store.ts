"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TimeRecord } from "./types"

interface TimeRecordStore {
  records: TimeRecord[]
  addRecord: (record: Omit<TimeRecord, "id" | "createdAt">) => void
  deleteRecord: (id: string) => void
  getMonthRecords: (year: number, month: number) => TimeRecord[]
}

export const useTimeRecordStore = create<TimeRecordStore>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (record) => {
        const newRecord: TimeRecord = {
          ...record,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }
        set((state) => ({
          records: [newRecord, ...state.records]
        }))
      },
      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id)
        }))
      },
      getMonthRecords: (year, month) => {
        const records = get().records
        return records.filter((r) => {
          const date = new Date(r.date)
          return date.getFullYear() === year && date.getMonth() === month
        })
      }
    }),
    {
      name: "time-records-storage"
    }
  )
)
