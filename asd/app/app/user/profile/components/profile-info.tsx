"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserData } from "@/app/service/user";

interface ProfileInfoProps {
    userData: UserData | null;
}

export function ProfileInfo({ userData }: ProfileInfoProps) {
    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-2xl">
                            {userData?.name ? userData.name.substring(0, 2).toUpperCase() : "ПП"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle>{userData?.name || "Пользователь"}</CardTitle>
                <CardDescription>{userData?.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">ID пользователя</p>
                        <p>{userData?.id}</p>
                    </div>
                    {userData?.telegram_link && (
                        <div>
                            <p className="text-sm text-muted-foreground">Telegram</p>
                            <p>{userData.telegram_link}</p>
                        </div>
                    )}
                    {userData?.age && (
                        <div>
                            <p className="text-sm text-muted-foreground">Возраст</p>
                            <p>{userData.age} лет</p>
                        </div>
                    )}
                    {userData?.admission_type && (
                        <div>
                            <p className="text-sm text-muted-foreground">Тип поступления</p>
                            <p>{userData.admission_type}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-muted-foreground">Статус</p>
                        <p>{userData?.is_active ? "Активен" : "Неактивен"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}