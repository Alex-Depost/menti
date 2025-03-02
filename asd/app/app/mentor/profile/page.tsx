"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AuthType } from "@/app/service/auth";
import mentorService, { MentorData, MentorUpdateData } from "@/app/service/mentor";

// Импортируем созданные компоненты
import { LoadingProfile } from "./components/loading-profile";
import { ProfileInfo } from "./components/profile-info";
import { ProfileEditForm } from "./components/profile-edit-form";

export default function MentorProfilePage() {
    const router = useRouter();
    const { isAuthenticated, authType } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [mentorData, setMentorData] = useState<MentorData | null>(null);
    const [formData, setFormData] = useState<MentorUpdateData>({});
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function loadMentorData() {
            if (!isAuthenticated || authType !== AuthType.mentor) {
                return;
            }

            try {
                const data = await mentorService.getCurrentMentor();
                setMentorData(data);
                // Инициализируем форму данными ментора
                if (data) {
                    setFormData({
                        name: data.name || null,
                        email: data.email || null,
                        telegram_link: data.telegram_link || null,
                        age: data.age || null,
                        description: data.description || null
                    });
                }
            } catch (err) {
                setError("Не удалось загрузить данные профиля");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadMentorData();
    }, [isAuthenticated, authType, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setSuccess(null);
        setSaving(true);

        try {
            // Удаляем пустые поля перед отправкой
            const dataToSend: MentorUpdateData = {};
            Object.entries(formData).forEach(([key, value]) => {
                // Проверяем, что значение не undefined, не null и не пустая строка
                if (value !== undefined && value !== null && value !== "") {
                    dataToSend[key as keyof MentorUpdateData] = value;
                }
            });

            const updatedMentor = await mentorService.updateMentorProfile(dataToSend);
            setMentorData(updatedMentor);
            setSuccess("Профиль успешно обновлен");
        } catch (err: any) {
            // Проверяем, есть ли у ошибки поле fieldErrors
            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
                setError("Пожалуйста, исправьте ошибки в форме");
            } else {
                setError(err instanceof Error ? err.message : "Произошла ошибка при обновлении профиля");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        setError(null);
        setSuccess(null);
        setUploadingAvatar(true);

        try {
            const updatedMentor = await mentorService.uploadAvatar(file);
            setMentorData(updatedMentor);
            setSuccess("Аватар успешно обновлен");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке аватара");
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return <LoadingProfile />;
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
            <h1 className="text-2xl font-bold mb-6">Профиль ментора</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Левая колонка - информация о профиле */}
                <div className="md:col-span-1">
                    <ProfileInfo
                        mentorData={mentorData}
                        onAvatarUpload={handleAvatarUpload}
                        uploadingAvatar={uploadingAvatar}
                    />
                </div>

                {/* Правая колонка - форма редактирования */}
                <div className="md:col-span-2">
                    <ProfileEditForm
                        mentorData={mentorData}
                        formData={formData}
                        setFormData={setFormData}
                        error={error}
                        fieldErrors={fieldErrors}
                        success={success}
                        saving={saving}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}