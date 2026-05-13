"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TimeRecord } from "./types"
import { buildDemoRecords } from "./demo-data"
import { parseDateKey } from "./date-utils"

interface TimeRecordStore {
  records: TimeRecord[]
  addRecord: (record: Omit<TimeRecord, "id" | "createdAt">) => void
  updateRecord: (id: string, updates: Omit<TimeRecord, "id" | "createdAt">) => void
  deleteRecord: (id: string) => void
  deleteRecords: (ids: string[]) => void
  clearRecords: () => void
  loadDemoRecords: () => void
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
      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id ? { ...record, ...updates } : record
          )
        }))
      },
      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id)
        }))
      },
      deleteRecords: (ids) => {
        const selected = new Set(ids)
        set((state) => ({
          records: state.records.filter((r) => !selected.has(r.id))
        }))
      },
      clearRecords: () => {
        set({ records: [] })
      },
      loadDemoRecords: () => {
        set({ records: buildDemoRecords() })
      },
      getMonthRecords: (year, month) => {
        const records = get().records
        return records.filter((r) => {
          const date = parseDateKey(r.date)
          return date.getFullYear() === year && date.getMonth() === month
        })
      }
    }),
    {
      name: "time-records-storage"
    }
  )
)
