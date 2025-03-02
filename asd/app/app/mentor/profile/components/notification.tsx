"use client";

interface NotificationProps {
    type: "error" | "success";
    message: string | null;
}

export function Notification({ type, message }: NotificationProps) {
    if (!message) return null;

    const styles = {
        error: "bg-red-50 p-4 rounded-md text-red-600 text-sm",
        success: "bg-green-50 p-4 rounded-md text-green-600 text-sm"
    };

    return (
        <div className={styles[type]}>
            {message}
        </div>
    );
}