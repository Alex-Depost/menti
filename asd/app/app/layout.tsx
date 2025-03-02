"use client";

import { AppSidebar } from "@/components/sidebar";
import { SidebarFloatingButton } from "@/components/sidebar-floating-button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarFloatingButton />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}