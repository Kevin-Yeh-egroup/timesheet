"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Clock, LayoutDashboard, ListChecks, MessageCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "總覽", icon: LayoutDashboard },
  { href: "/time", label: "時段", icon: Clock },
  { href: "/ai", label: "AI 整理", icon: Sparkles },
  { href: "/insights", label: "摘要", icon: MessageCircle },
  { href: "/records", label: "紀錄", icon: ListChecks },
  { href: "/report", label: "報表", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:relative md:w-56 md:shrink-0 md:border-t-0 md:border-r md:bg-transparent">
      <div className="flex items-center justify-start gap-1 overflow-x-auto px-2 py-2 md:sticky md:top-0 md:flex-col md:items-stretch md:justify-start md:overflow-visible md:p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-16 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-all hover:scale-[1.02] active:scale-95 md:min-w-0 md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
