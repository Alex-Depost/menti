"use client";

import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentorData } from "@/app/service/mentor";
import { AVATAR_URL } from "@/app/service/config";
import { AvatarEditor } from "@/components/ui/avatar-editor";

interface ProfileInfoProps {
    mentorData: MentorData | null;
    onAvatarUpload?: (file: File) => Promise<void>;
    uploadingAvatar?: boolean;
}

export function ProfileInfo({ mentorData, onAvatarUpload, uploadingAvatar = false }: ProfileInfoProps) {
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

    const handleAvatarSave = async (blob: Blob) => {
        if (!onAvatarUpload) return;
        
        // Convert Blob to File
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        
        // Call upload handler
        await onAvatarUpload(file);
    };
    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex flex-col items-center mb-4">
                    <Avatar className="w-24 h-24 mb-2">
                        {(mentorData?.avatar_url || mentorData?.avatar_uuid) && (
                            <AvatarImage
                                key={mentorData.avatar_uuid}
                                src={mentorData.avatar_url || `${AVATAR_URL}/${mentorData.avatar_uuid}`}
                                alt={mentorData?.name || "Аватар ментора"}
                            />
                        )}
                        <AvatarFallback className="text-2xl">
                            {mentorData?.name ? mentorData.name.substring(0, 2).toUpperCase() : "МН"}
                        </AvatarFallback>
                    </Avatar>

                    {onAvatarUpload && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsAvatarEditorOpen(true)}
                                disabled={uploadingAvatar}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                                {uploadingAvatar ? "Загрузка..." : "Изменить аватар"}
                            </button>
                            
                            {/* Avatar editor */}
                            <AvatarEditor
                                open={isAvatarEditorOpen}
                                onClose={() => setIsAvatarEditorOpen(false)}
                                onSave={handleAvatarSave}
                                aspectRatio={1}
                            />
                        </>
                    )}
                </div>
                <CardTitle>{mentorData?.name || "Ментор"}</CardTitle>
                <CardDescription>{mentorData?.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">ID ментора</p>
                        <p>{mentorData?.id}</p>
                    </div>
                    {mentorData?.telegram_link && (
                        <div>
                            <p className="text-sm text-muted-foreground">Telegram</p>
                            <p>{mentorData.telegram_link}</p>
                        </div>
                    )}
                    {mentorData?.age && (
                        <div>
                            <p className="text-sm text-muted-foreground">Возраст</p>
                            <p>{mentorData.age} лет</p>
                        </div>
                    )}
                    {mentorData?.university && (
                        <div>
                            <p className="text-sm text-muted-foreground">Университет</p>
                            <p>{mentorData.university}</p>
                        </div>
                    )}
                    {mentorData?.title && (
                        <div>
                            <p className="text-sm text-muted-foreground">Должность</p>
                            <p>{mentorData.title}</p>
                        </div>
                    )}
                    {mentorData?.free_days && mentorData.free_days.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground">Свободные дни</p>
                            <p>{mentorData.free_days.join(", ")}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-muted-foreground">Статус</p>
                        <p>{mentorData?.is_active ? "Активен" : "Неактивен"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}