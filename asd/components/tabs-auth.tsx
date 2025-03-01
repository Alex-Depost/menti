"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface TabsAuthProps extends React.ComponentProps<"div"> {
    defaultValue?: "user" | "mentor"
    renderUser: (isActive: boolean) => React.ReactNode
    renderMentor: (isActive: boolean) => React.ReactNode
}

export function TabsAuth({
    className,
    defaultValue = "user",
    renderUser,
    renderMentor,
    ...props
}: TabsAuthProps) {
    const [activeTab, setActiveTab] = useState<string>(defaultValue)

    return (
        <div className={cn("w-full max-w-sm", className)} {...props}>
            <div className="w-full">
                <div className="flex w-full mb-4 rounded-md bg-muted p-1">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={cn(
                            "flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            activeTab === "user"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Я пользователь
                    </button>
                    <button
                        onClick={() => setActiveTab("mentor")}
                        className={cn(
                            "flex w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            activeTab === "mentor"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Я ментор
                    </button>
                </div>
                <div className="mt-2">
                    {activeTab === "user" && renderUser(true)}
                    {activeTab === "mentor" && renderMentor(true)}
                </div>
            </div>
        </div>
    )
}
