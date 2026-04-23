"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "總覽", icon: LayoutDashboard },
  { href: "/add", label: "新增", icon: PlusCircle },
  { href: "/report", label: "報表", icon: FileText },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:relative md:border-t-0 md:border-r md:bg-transparent">
      <div className="flex items-center justify-around py-2 md:flex-col md:items-stretch md:justify-start md:gap-1 md:p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs transition-colors md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm",
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
