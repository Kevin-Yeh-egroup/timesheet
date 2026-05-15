"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { BarChart3, Clock, LayoutDashboard, ListChecks, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "總覽", icon: LayoutDashboard },
  { href: "/insights", label: "摘要", icon: MessageCircle },
  { href: "/time", label: "時段", icon: Clock },
  { href: "/records", label: "紀錄", icon: ListChecks },
  { href: "/report", label: "報表", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString()
  const withCurrentParams = (href: string) => `${href}${queryString ? `?${queryString}` : ""}`

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-3 py-2">
        <div className="hidden shrink-0 rounded-full bg-[linear-gradient(135deg,#00695c_0%,#00897b_100%)] px-4 py-2 text-white shadow-sm md:block">
          <p className="text-xs font-bold leading-none">時間資源盤點助理</p>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={withCurrentParams(item.href)}
              className={cn(
                "flex min-w-16 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs transition-all hover:scale-[1.02] active:scale-[0.99] md:min-w-0 md:px-3.5 md:text-sm",
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
