"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import userService, { UserData, UserUpdateData } from "@/app/service/user";

// Импортируем созданные компоненты
import { LoadingProfile } from "./components/loading-profile";
import { ProfileInfo } from "./components/profile-info";
import { ProfileEditForm } from "./components/profile-edit-form";

export default function UserProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<UserUpdateData>({});
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function loadUserData() {
            if (!isAuthenticated || !isUser) {
                return;
            }

            try {
                const data = await userService.getCurrentUser();
                setUserData(data);
                // Инициализируем форму данными пользователя
                if (data) {
                    setFormData({
                        name: data.name || null,
                        email: data.email || null,
                        telegram_link: data.telegram_link || null,
                        age: data.age || null,
                        description: data.description || null,
                        target_universities: data.target_universities || null,
                        admission_type: data.admission_type || null
                    });
                }
            } catch (error) {
                setError('Ошибка при загрузке данных профиля');
            } finally {
                setLoading(false);
            }
        }

        loadUserData();
    }, [isAuthenticated, isUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setSuccess(null);
        setSaving(true);

        try {
            // Подготавливаем данные для отправки
            const dataToSend: UserUpdateData = {};
            Object.entries(formData).forEach(([key, value]) => {
                // Проверяем, что значение не undefined
                if (value !== undefined) {
                    // Если значение - пустая строка, отправляем null
                    if (value === "") {
                        dataToSend[key as keyof UserUpdateData] = null;
                    } else {
                        dataToSend[key as keyof UserUpdateData] = value;
                    }
                }
            });

            const updatedUser = await userService.updateUserProfile(dataToSend);
            setUserData(updatedUser);
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
            const updatedUser = await userService.uploadAvatar(file);
            setUserData(updatedUser);
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
            <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Левая колонка - информация о профиле */}
                <div className="md:col-span-1">
                    <ProfileInfo
                        userData={userData}
                        onAvatarUpload={handleAvatarUpload}
                        uploadingAvatar={uploadingAvatar}
                    />
                </div>

                {/* Правая колонка - форма редактирования */}
                <div className="md:col-span-2">
                    <ProfileEditForm
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