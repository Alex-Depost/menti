"use client";

import { authService } from "@/app/service/auth";
import notificationService from "@/app/service/notification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { BookOpen, Home, LogOut, MessageSquare, Search, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

// Navigation link that closes sidebar on mobile when clicked
function NavLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();
  
  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`nav-button ${isActive ? 'nav-button-active' : ''} ${className}`} 
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isUser } = useAuth();
  const { profileData, displayName, initials, avatarUrl } = useProfile();
  const { setOpenMobile } = useSidebar();
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  // Start background notification check when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.startBackgroundCheck();
      
      // Listen for new inbox messages
      const handleNewMessages = (event: CustomEvent) => {
        setNewMessagesCount(event.detail.count);
      };
      
      // Listen for reset notifications
      const handleResetNotifications = () => {
        setNewMessagesCount(0);
      };
      
      // Add event listeners
      window.addEventListener('new-inbox-messages', handleNewMessages as EventListener);
      window.addEventListener('reset-inbox-notifications', handleResetNotifications);
      
      // Clean up
      return () => {
        notificationService.stopBackgroundCheck();
        window.removeEventListener('new-inbox-messages', handleNewMessages as EventListener);
        window.removeEventListener('reset-inbox-notifications', handleResetNotifications);
      };
    }
  }, [isAuthenticated]);
  
  // Reset notifications when navigating to inbox
  useEffect(() => {
    if (pathname === "/app/user/inbox" || pathname === "/app/mentor/inbox") {
      setNewMessagesCount(0);
      notificationService.resetNotificationState();
    }
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/signin");
    setOpenMobile(false);
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
                  <NavLink href="/app" className="flex items-center gap-3">
                    <Home className={`h-4 w-4 ${pathname === "/app" ? "" : "text-muted-foreground"}`} />
                    <span>Главная</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === "/auth/signin" ? "bg-primary/10 text-primary" : "hover:text-primary"}`}>
                  <NavLink href="/auth/signin" className="flex items-center gap-3">
                    <User className={`h-4 w-4 ${pathname === "/auth/signin" ? "" : "text-muted-foreground"}`} />
                    <span>Войти</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : isUser ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app" className="flex gap-3 w-full">
                    <Home className={`h-4 w-4 ${pathname === "/app" ? "" : "text-muted-foreground"}`} />
                    <span>Все менторы</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/user/inbox" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app/user/inbox" className="flex gap-3 w-full">
                    <MessageSquare className={`h-4 w-4 ${pathname === "/app/user/inbox" ? "" : "text-muted-foreground"}`} />
                    <span>Входящие заявки</span>
                    {newMessagesCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {newMessagesCount}
                      </Badge>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/user/outgoing" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app/user/outgoing" className="flex gap-3 w-full">
                    <BookOpen className={`h-4 w-4 ${pathname === "/app/user/outgoing" ? "" : "text-muted-foreground"}`} />
                    <span>Исходящие заявки</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/user/profile" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app/user/profile" className="flex gap-3 w-full">
                    <User className={`h-4 w-4 ${pathname === "/app/user/profile" ? "" : "text-muted-foreground"}`} />
                    <span>Профиль</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/search" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app" className="flex gap-3 w-full">
                    <Search className={`h-4 w-4 ${pathname === "/app/search" ? "" : "text-muted-foreground"}`} />
                    <span>Поиск менти</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/mentor/inbox" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app/mentor/inbox" className="flex gap-3 w-full">
                    <MessageSquare className={`h-4 w-4 ${pathname === "/app/mentor/inbox" ? "" : "text-muted-foreground"}`} />
                    <span>Входящие заявки</span>
                    {newMessagesCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {newMessagesCount}
                      </Badge>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/mentor/outgoing" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app/mentor/outgoing" className="flex gap-3 w-full">
                    <BookOpen className={`h-4 w-4 ${pathname === "/app/mentor/outgoing" ? "" : "text-muted-foreground"}`} />
                    <span>Исходящие заявки</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={`w-full flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/mentor/profile" ? "bg-primary/10 text-primary" : ""}`}>
                  <NavLink href="/app/mentor/profile" className="flex gap-3 w-full">
                    <User className={`h-4 w-4 ${pathname === "/app/mentor/profile" ? "" : "text-muted-foreground"}`} />
                    <span>Профиль</span>
                  </NavLink>
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
                  <SidebarMenuButton asChild className={`w-full flex gap-3 text-sm font-medium px-3 py-2.5 rounded-lg ${pathname === "/app/settings" ? "bg-primary/10 text-primary" : ""}`}>
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
