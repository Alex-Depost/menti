"use client"
import { SignupForm } from "@/components/signup-form"
import { TabsAuth } from "@/components/tabs-auth"
import { MetricsButton } from "@/components/metrics-button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

// Component that uses useSearchParams wrapped in Suspense
function SignUpContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('type') === 'mentor' ? 'mentor' : 'user';

    return (
        <div className="animate-fadeIn">
            <TabsAuth
                defaultValue={defaultTab}
                renderUser={() => (
                    <div className="animate-slideUp">
                        <SignupForm userType="user" />
                    </div>
                )}
                renderMentor={() => (
                    <div className="animate-slideUp">
                        <SignupForm userType="mentor" />
                    </div>
                )}
            />
        </div>
    );
}

export default function SignUpPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-transparent to-gray-50/30">
            <MetricsButton />
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                <SignUpContent />
            </Suspense>
        </div>
    )
}
