"use client";

import notificationService from "@/app/service/notification";
import { AppSidebar } from "@/components/sidebar";
import { SidebarFloatingButton } from "@/components/sidebar-floating-button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();

    // Initialize notification service when the app layout mounts
    useEffect(() => {
        if (isAuthenticated) {
            // Start background checking for new messages
            notificationService.startBackgroundCheck();
            
            // Clean up when component unmounts
            return () => {
                notificationService.stopBackgroundCheck();
            };
        }
    }, [isAuthenticated]);

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