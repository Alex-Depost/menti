"use client";

import { UserUpdateData } from "@/app/service/user";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { useRouter } from "next/navigation";
import { FormField } from "./form-field";
import { Notification } from "./notification";
import { TagInput } from "@/app/app/mentor/profile/components/tag-input";

interface ProfileEditFormProps {
    formData: UserUpdateData;
    setFormData: React.Dispatch<React.SetStateAction<UserUpdateData>>;
    error: string | null;
    success: string | null;
    saving: boolean;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    fieldErrors?: Record<string, string>;
}

export function ProfileEditForm({
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

    const handleTargetUniversitiesChange = (universities: string[]) => {
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
                                placeholder="t.me/username или https://t.me/username"
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
                                onChange={() => { }}
                                error={fieldErrors.description}
                            >
                                <TiptapEditor
                                    value={formData.description || ''}
                                    onChange={handleDescriptionChange}
                                />
                            </FormField>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="target_universities" className="block text-sm font-medium">
                                Целевые университеты
                                {fieldErrors.target_universities && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            <TagInput
                                value={formData.target_universities || []}
                                onChange={handleTargetUniversitiesChange}
                                suggestions={[
                                    "МГУ",
                                    "МФТИ",
                                    "ВШЭ",
                                    "МГТУ им. Баумана",
                                    "Санкт-Петербургский государственный университет",
                                    "ИТМО",
                                    "Новосибирский государственный университет",
                                    "Томский государственный университет",
                                    "РАНХиГС",
                                    "МГИМО"
                                ]}
                                placeholder="Добавьте университет и нажмите Enter"
                                error={fieldErrors.target_universities}
                            />
                            <p className="text-sm text-gray-500">
                                Введите название университета и нажмите Enter. Для университетов с несколькими словами просто продолжайте печатать.
                            </p>
                        </div>

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