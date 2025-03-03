"use client"

import Link from "next/link"
import { BarChart2 } from "lucide-react"

export function MetricsButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        href="/grafana/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Метрики сайта"
      >
        <BarChart2 size={20} className="sm:mr-2" />
        <span className="hidden sm:inline text-sm font-medium">Метрики</span>
      </Link>
    </div>
  )
} 