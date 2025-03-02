"use client";

import { useRef } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/app/service/user";
import { AVATAR_URL } from "@/app/service/config";

interface ProfileInfoProps {
    userData: UserData | null;
    onAvatarUpload?: (file: File) => Promise<void>;
    uploadingAvatar?: boolean;
}

export function ProfileInfo({ userData, onAvatarUpload, uploadingAvatar = false }: ProfileInfoProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onAvatarUpload) return;

        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        // Вызываем обработчик
        onAvatarUpload(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex flex-col items-center mb-4">
                    <Avatar className="w-24 h-24 mb-2">
                        {userData?.avatar_uuid && (
                            <AvatarImage
                                key={userData.avatar_uuid}
                                src={`${AVATAR_URL}/${userData.avatar_uuid}`}
                                alt={userData?.name || "Аватар пользователя"}
                            />
                        )}
                        <AvatarFallback className="text-2xl">
                            {userData?.name ? userData.name.substring(0, 2).toUpperCase() : "ПП"}
                        </AvatarFallback>
                    </Avatar>

                    {onAvatarUpload && (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                disabled={uploadingAvatar}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                                {uploadingAvatar ? "Загрузка..." : "Изменить аватар"}
                            </button>
                        </>
                    )}
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