"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import userService, { UserData, UserUpdateData } from "@/app/service/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserProfilePage() {
    const { isAuthenticated, isUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<UserUpdateData>({});
    const [error, setError] = useState<string | null>(null);
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
            } catch (err) {
                setError("Не удалось загрузить данные профиля");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadUserData();
    }, [isAuthenticated, isUser, router]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            // Удаляем пустые поля перед отправкой
            const dataToSend: UserUpdateData = {};
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined) {
                    dataToSend[key as keyof UserUpdateData] = value;
                }
            });

            const updatedUser = await userService.updateUserProfile(dataToSend);
            setUserData(updatedUser);
            setSuccess("Профиль успешно обновлен");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка при обновлении профиля");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-center">Загрузка профиля...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
            <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Левая колонка - информация о профиле */}
                <div className="md:col-span-1">
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
                </div>

                {/* Правая колонка - форма редактирования */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Редактирование профиля</CardTitle>
                            <CardDescription>
                                Обновите информацию о себе
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 p-4 rounded-md text-green-600 text-sm">
                                        {success}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Имя</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name || ""}
                                                onChange={handleChange}
                                                placeholder="Ваше имя"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={handleChange}
                                                placeholder="example@mail.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="telegram_link">Ссылка на Telegram</Label>
                                            <Input
                                                id="telegram_link"
                                                name="telegram_link"
                                                value={formData.telegram_link || ""}
                                                onChange={handleChange}
                                                placeholder="@username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="age">Возраст</Label>
                                            <Input
                                                id="age"
                                                name="age"
                                                type="number"
                                                value={formData.age || ""}
                                                onChange={handleChange}
                                                placeholder="Ваш возраст"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Новый пароль</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            onChange={handleChange}
                                            placeholder="Оставьте пустым, чтобы не менять"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Описание</Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleChange}
                                            placeholder="Расскажите о себе"
                                            className="w-full min-h-[100px] p-2 border rounded-md"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="target_universities">Целевые университеты</Label>
                                        <Input
                                            id="target_universities"
                                            name="target_universities"
                                            value={formData.target_universities?.join(", ") || ""}
                                            onChange={handleTargetUniversitiesChange}
                                            placeholder="МГУ, МФТИ, ВШЭ (через запятую)"
                                        />
                                        <p className="text-xs text-muted-foreground">Укажите через запятую</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="admission_type">Тип поступления</Label>
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
                </div>
            </div>
        </div>
    );
}