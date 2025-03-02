"use client";

import { authService } from "@/app/service/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { BookOpen, Home, LogOut, MessageSquare, Search, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isUser } = useAuth();
  const { profileData, displayName, initials, avatarUrl } = useProfile();

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/signin");
  };

  return (
    <Sidebar className="border-r bg-card/50 min-h-screen" {...props}>
      <SidebarContent className="px-4 py-6 space-y-6">
        {isAuthenticated ? (
          <div className="flex flex-col items-center text-center px-4 py-6">
            <Avatar className="h-20 w-20 mb-4 ring-4 ring-background shadow-sm">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-bold text-foreground mb-1">{displayName}</h3>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 border-primary/20">
              {isUser ? 'Пользователь' : 'Ментор'}
            </span>
            {profileData?.login && (
              <span className="text-xs text-muted-foreground mt-1">{profileData.login}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center px-4 py-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Менторинг</h2>
            <p className="text-sm text-muted-foreground mt-1">Найдите своего ментора</p>
          </div>
        )}

        <Separator className="bg-muted/60" />

        <SidebarMenu className="space-y-1.5">
          {!isAuthenticated ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app" className="flex items-center gap-3">
                    <Home className={`h-4 w-4 ${pathname === "/app" ? "" : "text-muted-foreground"}`} />
                    <span>Главная</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/auth/signin" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/auth/signin" className="flex items-center gap-3">
                    <User className={`h-4 w-4 ${pathname === "/auth/signin" ? "" : "text-muted-foreground"}`} />
                    <span>Войти</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : isUser ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app" className="flex gap-3">
                    <Home className={`h-4 w-4 ${pathname === "/app" ? "" : "text-muted-foreground"}`} />
                    <span>Все менторы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname.startsWith("/app/user/inbox") ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app/user/inbox" className="flex gap-3">
                    <BookOpen className={`h-4 w-4 ${pathname.startsWith("/app/user/inbox") ? "" : "text-muted-foreground"}`} />
                    <span>Заявки на менторство</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname.startsWith("/app/user/outgoing") ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app/user/outgoing" className="flex gap-3">
                    <BookOpen className={`h-4 w-4 ${pathname.startsWith("/app/user/outgoing") ? "" : "text-muted-foreground"}`} />
                    <span>Мои отклики</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/user/profile" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app/user/profile" className="flex gap-3">
                    <User className={`h-4 w-4 ${pathname === "/app/user/profile" ? "" : "text-muted-foreground"}`} />
                    <span>Профиль</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/search" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app" className="flex gap-3">
                    <Search className={`h-4 w-4 ${pathname === "/app/search" ? "" : "text-muted-foreground"}`} />
                    <span>Поиск менти</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/dashboard" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app/mentor/dashboard" className="flex gap-3">
                    <MessageSquare className={`h-4 w-4 ${pathname === "/app/dashboard" ? "" : "text-muted-foreground"}`} />
                    <span>Заявки на менторство</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname.startsWith("/app/students") ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app/mentor/students" className="flex gap-3">
                    <Users className={`h-4 w-4 ${pathname.startsWith("/app/students") ? "" : "text-muted-foreground"}`} />
                    <span>Мои студенты</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/mentor/profile" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <Link href="/app/mentor/profile" className="flex gap-3">
                    <User className={`h-4 w-4 ${pathname === "/app/mentor/profile" ? "" : "text-muted-foreground"}`} />
                    <span>Профиль</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>

        <div className="mt-auto pt-6">
          <Separator className="bg-muted/60 mb-4" />
          <SidebarMenu className="space-y-1.5">
            {isAuthenticated && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/app/settings" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all">
                    <button onClick={handleLogout} className="flex gap-3 w-full text-left">
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                      <span>Выйти</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarRail className="bg-muted/30" />
    </Sidebar>
  )
}
