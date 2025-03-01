/*import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold flex items-center gap-2">
                Name
              </div>
              <a href="/profile" className="flex items-center gap-1 hover:text-indigo-200">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" className="h-10 w-10" alt="@shadcn"/>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
                Профиль
              </a>
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
}*/

import React from "react";

const MentorCard = () => (
  <div className="bg-gray-200 p-6 rounded-lg w-[800px] h-[300px] flex flex-col justify-center">
    <div className="flex items-center space-x-6">
      <div className="w-16 h-16 bg-red-400 rounded" />
      <span className="text-gray-700 text-lg">имя ментора</span>
    </div>
    <div className="bg-red-200 p-6 mt-4 rounded text-lg">информация о менторе</div>
  </div>
);

const Sidebar = () => (
  <div className="bg-gray-300 p-6 h-full w-80 flex flex-col space-y-6">
    <h1 className="text-xl font-bold">Название сайта</h1>
    <button className="bg-white p-3 rounded">забронированные встречи</button>
    <button className="bg-white p-3 rounded">искать ментора</button>
  </div>
);

const Header = () => (
  <div className="bg-gray-300 p-4 flex justify-between items-center">
    <div className="flex items-center">
      <span className="mr-2">имя</span>
      <div className="w-10 h-10 bg-gray-700 rounded-full" />
    </div>
  </div>
);

const MentorPage = () => {
  return (
    <div className="flex h-screen bg-gray-400">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          <MentorCard />
          <MentorCard />
        </div>
      </div>
    </div>
  );
};

export default MentorPage;