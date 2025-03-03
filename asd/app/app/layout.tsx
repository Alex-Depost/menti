"use client";

import notificationService from "@/app/service/notification";
import { AppSidebar } from "@/components/sidebar";
import { SidebarFloatingButton } from "@/components/sidebar-floating-button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TourModal } from "@/components/tour-guide";
import { Step } from "@/types/joyride";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect } from "react";

// Define tour steps
const userTourSteps: Step[] = [
    {
        target: 'body',
        content: 'Добро пожаловать в приложение! Давайте познакомимся с основными функциями.',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '.nav-button:nth-child(1)',
        content: 'Здесь вы можете просмотреть список всех доступных менторов.',
        placement: 'right',
    },
    {
        target: '.nav-button:nth-child(2)',
        content: 'Здесь вы можете просмотреть входящие заявки на менторство.',
        placement: 'right',
        offset: 10,
        event: 'click',
        disableBeacon: false,
        disableOverlayClose: true,
        spotlightClicks: true,
        spotlightPadding: 10,
        showProgress: true,
        showSkipButton: true,
    },
    {
        target: '.nav-button:nth-child(3)',
        content: 'Здесь вы можете просмотреть ваши исходящие заявки на менторство.',
        placement: 'right',
    },
    {
        target: '.nav-button:nth-child(4)',
        content: 'Здесь вы можете редактировать свой профиль и настройки.',
        placement: 'right',
    }
];

const mentorTourSteps: Step[] = [
    {
        target: 'body',
        content: 'Добро пожаловать в приложение! Давайте познакомимся с основными функциями.',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '.nav-button:nth-child(1)',
        content: 'Здесь вы можете искать потенциальных менти.',
        placement: 'right',
    },
    {
        target: '.nav-button:nth-child(2)',
        content: 'Здесь вы можете просмотреть входящие заявки от менти.',
        placement: 'right',
        offset: 10,
        event: 'click',
        disableBeacon: false,
        disableOverlayClose: true,
        spotlightClicks: true,
        spotlightPadding: 10,
        showProgress: true,
        showSkipButton: true,
    },
    {
        target: '.nav-button:nth-child(3)',
        content: 'Здесь вы можете просмотреть ваши исходящие заявки к менти.',
        placement: 'right',
    },
    {
        target: '.nav-button:nth-child(4)',
        content: 'Здесь вы можете редактировать свой профиль и настройки.',
        placement: 'right',
    }
];

export default function AppLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isUser } = useAuth();

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

    // Select the appropriate tour steps based on user role
    const tourSteps = isUser ? userTourSteps : mentorTourSteps;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarFloatingButton />
            <SidebarInset>
                {children}
            </SidebarInset>
            {isAuthenticated && (
                <TourModal
                    tourId={isUser ? "user-onboarding" : "mentor-onboarding"}
                    steps={tourSteps}
                />
            )}
        </SidebarProvider>
    );
}