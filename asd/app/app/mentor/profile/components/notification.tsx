"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

interface NotificationProps {
    type: "success" | "error";
    message: string;
}

export function Notification({ type, message }: NotificationProps) {
    const isSuccess = type === "success";
    
    return (
        <div className={`p-4 rounded-md flex items-start gap-3 ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isSuccess ? (
                <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
                <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <p>{message}</p>
        </div>
    );
}