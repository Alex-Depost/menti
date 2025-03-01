"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar"
import { MessageSquare, Search, User, Home, Settings, LogOut } from "lucide-react"
import * as React from "react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { authService } from "@/app/service/auth"
import { useRouter } from "next/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/signin");
  };

  return (
    <Sidebar className="border-r bg-card/50 min-h-screen" {...props}>
      <SidebarContent className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center text-center px-4 py-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center text-primary text-xl font-bold mb-4 ring-4 ring-background shadow-sm">
            ИВ
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Иван Васильев</h3>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 border-primary/20">
            Ментор
          </span>
        </div>

        <Separator className="bg-muted/60" />

        <SidebarMenu className="space-y-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 hover:text-primary"}`}>
              <Link href="/app" className="flex items-center gap-3">
                <Home className={`h-4 w-4 ${pathname === "/app" ? "" : "text-muted-foreground"}`} />
                <span>Главная</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/dashboard" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 hover:text-primary"}`}>
              <Link href="/app/dashboard" className="flex items-center gap-3">
                <MessageSquare className={`h-4 w-4 ${pathname === "/app/dashboard" ? "" : "text-muted-foreground"}`} />
                <span>Мои отклики</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/search" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 hover:text-primary"}`}>
              <Link href="/app/search" className="flex items-center gap-3">
                <Search className={`h-4 w-4 ${pathname === "/app/search" ? "" : "text-muted-foreground"}`} />
                <span>Поиск менти</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/profile" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 hover:text-primary"}`}>
              <Link href="/app/profile" className="flex items-center gap-3">
                <User className={`h-4 w-4 ${pathname === "/app/profile" ? "" : "text-muted-foreground"}`} />
                <span>Профиль</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-auto pt-6">
          <Separator className="bg-muted/60 mb-4" />
          <SidebarMenu className="space-y-1.5">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/settings" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 hover:text-primary"}`}>
                <Link href="/app/settings" className="flex items-center gap-3">
                  <Settings className={`h-4 w-4 ${pathname === "/app/settings" ? "" : "text-muted-foreground"}`} />
                  <span>Настройки</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <span>Выйти</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarRail className="bg-muted/30" />
    </Sidebar>
  )
}
