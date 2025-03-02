"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { UserData, UserUpdateData } from "@/app/service/user";
import { FormField } from "./form-field";
import { Notification } from "./notification";

interface ProfileEditFormProps {
    userData: UserData | null;
    formData: UserUpdateData;
    setFormData: React.Dispatch<React.SetStateAction<UserUpdateData>>;
    error: string | null;
    success: string | null;
    saving: boolean;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    fieldErrors?: Record<string, string>;
}

export function ProfileEditForm({
    userData,
    formData,
    setFormData,
    error,
    success,
    saving,
    onSubmit,
    fieldErrors = {}
}: ProfileEditFormProps) {
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Для числовых полей преобразуем строку в число
        if (name === "age") {
            setFormData(prev => ({
                ...prev,
                [name]: value ? parseInt(value, 10) : null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value || null
            }));
        }
    };

    const handleTargetUniversitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const universities = e.target.value.split(',').map(uni => uni.trim()).filter(Boolean);
        setFormData(prev => ({
            ...prev,
            target_universities: universities.length > 0 ? universities : null
        }));
    };

    const handleDescriptionChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            description: value || null
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Редактирование профиля</CardTitle>
                <CardDescription>
                    Обновите информацию о себе
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6">
                    {error && <Notification type="error" message={error} />}
                    {success && <Notification type="success" message={success} />}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                id="name"
                                label="Имя"
                                value={formData.name || ""}
                                onChange={handleChange}
                                placeholder="Ваше имя"
                                error={fieldErrors.name}
                            />
                            <FormField
                                id="email"
                                label="Email"
                                type="email"
                                value={formData.email || ""}
                                onChange={handleChange}
                                placeholder="example@mail.com"
                                error={fieldErrors.email}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                id="telegram_link"
                                label="Ссылка на Telegram"
                                value={formData.telegram_link || ""}
                                onChange={handleChange}
                                placeholder="@username"
                                error={fieldErrors.telegram_link}
                            />
                            <FormField
                                id="age"
                                label="Возраст"
                                type="number"
                                value={formData.age || ""}
                                onChange={handleChange}
                                placeholder="Ваш возраст"
                                error={fieldErrors.age}
                            />
                        </div>

                        <FormField
                            id="password"
                            label="Новый пароль"
                            type="password"
                            value={formData.password || ""}
                            onChange={handleChange}
                            placeholder="Оставьте пустым, чтобы не менять"
                            error={fieldErrors.password}
                        />

                        <Separator />

                        <div className="space-y-2">
                            <FormField
                                id="description"
                                label="Описание"
                                value={formData.description || ""}
                                onChange={() => {}}
                                error={fieldErrors.description}
                            >
                                <TiptapEditor
                                    value={formData.description || ''}
                                    onChange={handleDescriptionChange}
                                    placeholder="Расскажите о себе"
                                />
                            </FormField>
                        </div>

                        <FormField
                            id="target_universities"
                            label="Целевые университеты"
                            value={formData.target_universities?.join(", ") || ""}
                            onChange={handleTargetUniversitiesChange}
                            placeholder="МГУ, МФТИ, ВШЭ (через запятую)"
                            helpText="Укажите через запятую"
                            error={fieldErrors.target_universities}
                        />

                        <div className="space-y-2">
                            <FormField
                                id="admission_type"
                                label="Тип поступления"
                                value={formData.admission_type || ""}
                                onChange={handleChange}
                                error={fieldErrors.admission_type}
                            >
                                <select
                                    id="admission_type"
                                    name="admission_type"
                                    value={formData.admission_type || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="">Не выбрано</option>
                                    <option value="ЕГЭ">ЕГЭ</option>
                                    <option value="олимпиады">Олимпиады</option>
                                </select>
                            </FormField>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Отмена
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}