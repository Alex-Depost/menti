"use client"
import { MentorSidebar } from "@/components/mentor-sidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import Link from "next/link"
import authService from "./service/auth"

export default function Page() {
  return (
    <SidebarProvider>
      <MentorSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold flex items-center gap-2">
                SEARCH WILL BE HERE
              </div>
              {
                !authService.isAuthenticated() ?
                  <Link href="/auth/signin" className="flex items-center gap-1 hover:text-indigo-200">
                    Войти
                  </Link> : <p></p>
              }
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video h-12 w-full rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}