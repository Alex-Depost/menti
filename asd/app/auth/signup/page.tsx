"use client"
import { SignupForm } from "@/components/signup-form"
import { TabsAuth } from "@/components/tabs-auth"
import { useSearchParams } from "next/navigation"

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('type') === 'mentor' ? 'mentor' : 'user';

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <TabsAuth
                defaultValue={defaultTab}
                renderUser={(isActive) => (
                    <SignupForm userType="user" />
                )}
                renderMentor={(isActive) => (
                    <SignupForm userType="mentor" />
                )}
            />
        </div>
    )
}
