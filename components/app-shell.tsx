"use client"

import { Navigation } from "./navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
