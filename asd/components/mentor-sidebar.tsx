import * as React from "react"
import { MessageSquare, Search, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

export function MentorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r bg-gray-50 min-h-screen" {...props}>
      <SidebarContent className="px-6 py-8 space-y-8">
        <div className="flex flex-col items-center text-center px-4 py-10">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mb-3">
            АВАТАР
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Иван Васильев</h3>
          <p className="text-gray-500 text-sm">Ментор</p>
        </div>

        <SidebarMenu className="space-y-3">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full flex items-center gap-4 text-base font-medium px-5 py-4 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <a href="#" className="flex items-center gap-4">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Мои отклики</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full flex items-center gap-4 text-base font-medium px-5 py-4 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <a href="#" className="flex items-center gap-4">
                <Search className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Поиск менти</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full flex items-center gap-4 text-base font-medium px-5 py-4 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <a href="#" className="flex items-center gap-4">
                <User className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">Профиль</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail className="bg-gray-100" />
    </Sidebar>
  )
}
