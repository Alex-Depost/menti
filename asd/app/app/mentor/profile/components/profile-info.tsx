"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MentorData } from "@/app/service/mentor";
import { AvatarEditor } from "@/components/ui/avatar-editor";
import { AVATAR_URL } from "@/app/service/config";

interface ProfileInfoProps {
    mentorData: MentorData | null;
    onAvatarUpload: (file: File) => Promise<void>;
    uploadingAvatar: boolean;
}

export function ProfileInfo({ mentorData, onAvatarUpload, uploadingAvatar }: ProfileInfoProps) {
    const [dragActive, setDragActive] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение');
                return;
            }
            setSelectedFile(file);
            setIsAvatarEditorOpen(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите изображение');
                return;
            }
            setSelectedFile(file);
            setIsAvatarEditorOpen(true);
        }
    };

    const handleAvatarSave = async (blob: Blob) => {
        // Преобразуем Blob в File
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        
        // Вызываем обработчик загрузки
        await onAvatarUpload(file);
    };

    const openAvatarEditor = () => {
        setIsAvatarEditorOpen(true);
    };

    // Получаем инициалы из имени
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Информация о менторе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div 
                    className={`flex flex-col items-center ${dragActive ? 'opacity-70' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Avatar className="h-32 w-32 mb-4 cursor-pointer hover:opacity-90 transition-opacity" onClick={openAvatarEditor}>
                        {(mentorData?.avatar_url || mentorData?.avatar_uuid) && (
                            <AvatarImage
                                src={mentorData.avatar_url || `${AVATAR_URL}/${mentorData.avatar_uuid}`}
                                alt={mentorData?.name || "Аватар ментора"}
                            />
                        )}
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {mentorData?.name ? getInitials(mentorData.name) : 'М'}
                        </AvatarFallback>
                    </Avatar>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={openAvatarEditor}
                        disabled={uploadingAvatar}
                        className="mb-2"
                    >
                        {uploadingAvatar ? 'Загрузка...' : 'Изменить аватар'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Нажмите на аватар или перетащите изображение
                    </p>
                    
                    {/* Редактор аватара */}
                    <AvatarEditor
                        open={isAvatarEditorOpen}
                        onClose={() => setIsAvatarEditorOpen(false)}
                        onSave={handleAvatarSave}
                        aspectRatio={1}
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Имя</h3>
                        <p className="text-base">{mentorData?.name || 'Не указано'}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                        <p className="text-base">{mentorData?.email || 'Не указано'}</p>
                    </div>
                    
                    {mentorData?.telegram_link && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Telegram</h3>
                            <p className="text-base">{mentorData.telegram_link}</p>
                        </div>
                    )}
                    
                    {mentorData?.age && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Возраст</h3>
                            <p className="text-base">{mentorData.age} лет</p>
                        </div>
                    )}
                    
                    {mentorData?.university && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Университет</h3>
                            <p className="text-base">{mentorData.university}</p>
                        </div>
                    )}
                    
                    {mentorData?.title && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Должность</h3>
                            <p className="text-base">{mentorData.title}</p>
                        </div>
                    )}
                    
                    {mentorData?.free_days && mentorData.free_days.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Свободные дни</h3>
                            <p className="text-base">{mentorData.free_days.join(', ')}</p>
                        </div>
                    )}
                    
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Статус</h3>
                        <div className="flex items-center">
                            <span className={`h-2 w-2 rounded-full mr-2 ${mentorData?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <p className="text-base">{mentorData?.is_active ? 'Активен' : 'Неактивен'}</p>
                        </div>
                    </div>
                    
                    {mentorData?.created_at && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Дата регистрации</h3>
                            <p className="text-base">{new Date(mentorData.created_at).toLocaleDateString('ru-RU')}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}