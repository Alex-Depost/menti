"use client";

import notificationService from "@/app/service/notification";
import { AppSidebar } from "@/components/sidebar";
import { SidebarFloatingButton } from "@/components/sidebar-floating-button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TourModal } from "@/components/tour-guide";
import { Step } from "@/types/joyride";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect, useMemo } from "react";

// Mobile tour steps for users - with page navigation
const userTourSteps: Step[] = [
    {
        target: 'body',
        content: 'Добро пожаловать в приложение! Давайте познакомимся с основными функциями.',
        placement: 'center',
        disableBeacon: true,
        action: 'navigate',
        path: '/app',
    },
    {
        target: '[data-tour="feed-hero"]',
        content: 'Это главная страница, где вы можете находить менторов и отправлять им заявки на менторство.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="feed-list"]',
        content: 'Здесь отображаются доступные менторы. Вы можете просмотреть их профили и отправить заявку на менторство.',
        placement: 'top',
    },
    {
        target: 'body',
        content: 'Теперь давайте посмотрим на раздел "Входящие", где вы можете просматривать заявки на менторство от других пользователей.',
        placement: 'center',
        action: 'navigate',
        path: '/app/user/inbox',
    },
    {
        target: 'body',
        content: 'Теперь перейдем в раздел "Исходящие", где вы можете отслеживать статус ваших заявок на менторство.',
        placement: 'center',
        action: 'navigate',
        path: '/app/user/outgoing',
    },
    {
        target: 'body',
        content: 'И наконец, давайте посмотрим на ваш профиль, где вы можете редактировать свои данные и настройки.',
        placement: 'center',
        action: 'navigate',
        path: '/app/user/profile',
    },
    {
        target: '[data-tour="profile-info"]',
        content: 'Здесь вы можете изменить свой аватар.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="profile-edit-form"]',
        content: 'Заполните все поля профиля, чтобы система могла подбирать для вас наиболее подходящих менторов.',
        placement: 'center',
    },
    {
        target: 'body',
        content: 'После заполнения профиля система будет использовать нейропоиск при выдаче ленты менторов, что поможет находить наиболее подходящих для вас специалистов.',
        placement: 'center',
    }
];

// Mobile tour steps for mentors - with page navigation
const mentorTourSteps: Step[] = [
    {
        target: 'body',
        content: 'Добро пожаловать в приложение! Давайте познакомимся с основными функциями.',
        placement: 'center',
        disableBeacon: true,
        action: 'navigate',
        path: '/app',
    },
    {
        target: '[data-tour="user-feed-hero"]',
        content: 'Это главная страница, где вы можете находить потенциальных менти и предлагать им менторство.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="user-feed-list"]',
        content: 'Здесь отображаются потенциальные менти. Вы можете просмотреть их профили и предложить им менторство.',
        placement: 'top',
    },
    {
        target: 'body',
        content: 'Теперь давайте посмотрим на раздел "Входящие", где вы можете просматривать заявки на менторство от потенциальных менти.',
        placement: 'center',
        action: 'navigate',
        path: '/app/mentor/inbox',
    },
    {
        target: 'body',
        content: 'Теперь перейдем в раздел "Исходящие", где вы можете отслеживать статус ваших заявок к менти.',
        placement: 'center',
        action: 'navigate',
        path: '/app/mentor/outgoing',
    },
    {
        target: 'body',
        content: 'И наконец, давайте посмотрим на ваш профиль, где вы можете редактировать свои данные и настройки менторства.',
        placement: 'center',
        action: 'navigate',
        path: '/app/mentor/profile',
    },
    {
        target: '[data-tour="profile-info"]',
        content: 'Здесь вы можете изменить свой аватар.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="profile-edit-form"]',
        content: 'Заполните все поля профиля, чтобы система могла подбирать для вас наиболее подходящих менти.',
        placement: 'center',
    },
    {
        target: 'body',
        content: 'После заполнения профиля система будет использовать нейропоиск при выдаче ленты менти, что поможет находить наиболее подходящих для вас учеников.',
        placement: 'center',
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

    // Use mobile tour steps for all devices as they provide a better experience
    const tourSteps = useMemo(() => {
        return isUser ? userTourSteps : mentorTourSteps;
    }, [isUser]);

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