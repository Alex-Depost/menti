"use client"
import { authService } from "@/app/service/auth";
import { LoginForm } from "@/components/login-form";
import { TabsAuth } from "@/components/tabs-auth";
import { MetricsButton } from "@/components/metrics-button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Component that uses useSearchParams wrapped in Suspense
function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('type') === 'mentor' ? 'mentor' : 'user';

    // State for user authentication
    const [userError, setUserError] = useState<string | null>(null);
    const handleUserFormSubmit = async ({ login }: { login: string }) => {
        try {
            await authService.loginAsUser(login);
            router.push("/")
        } catch (error) {
            setUserError(error instanceof Error ? error.message : "Ошибка авторизации");
        }
    };

    // State for mentor authentication
    const [mentorError, setMentorError] = useState<string | null>(null);
    const handleMentorFormSubmit = async ({ login }: { login: string }) => {
        try {
            await authService.loginAsMentor(login);
            router.push("/")
        } catch (error) {
            setMentorError(error instanceof Error ? error.message : "Ошибка авторизации");
        }
    };

    return (
        <div className="animate-fadeIn">
            <TabsAuth
                defaultValue={defaultTab}
                renderUser={() => (
                    <div className="animate-slideUp">
                        <LoginForm
                            onFormSubmit={handleUserFormSubmit}
                            error={userError}
                            userType="user"
                        />
                    </div>
                )}
                renderMentor={() => (
                    <div className="animate-slideUp">
                        <LoginForm
                            onFormSubmit={handleMentorFormSubmit}
                            error={mentorError}
                            userType="mentor"
                        />
                    </div>
                )}
            />
        </div>
    );
}

export default function SignInPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-transparent to-gray-50/30">
            <MetricsButton />
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                <SignInContent />
            </Suspense>
        </div>
    )
}
