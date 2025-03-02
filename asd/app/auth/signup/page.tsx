"use client"
import { SignupForm } from "@/components/signup-form"
import { TabsAuth } from "@/components/tabs-auth"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

// Component that uses useSearchParams wrapped in Suspense
function SignUpContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('type') === 'mentor' ? 'mentor' : 'user';

    return (
        <TabsAuth
            defaultValue={defaultTab}
            renderUser={() => (
                <SignupForm userType="user" />
            )}
            renderMentor={() => (
                <SignupForm userType="mentor" />
            )}
        />
    );
}

export default function SignUpPage() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <Suspense fallback={<div>Loading...</div>}>
                <SignUpContent />
            </Suspense>
        </div>
    )
}
