"use client";

import { MentorUpdateData } from "@/app/service/mentor";
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
import { TagInput } from "./tag-input";

interface ProfileEditFormProps {
    formData: MentorUpdateData;
    setFormData: React.Dispatch<React.SetStateAction<MentorUpdateData>>;
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

        // For numeric fields, convert string to number
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

    const handleFreeDaysChange = (days: string[]) => {
        setFormData(prev => ({
            ...prev,
            free_days: days.length > 0 ? days : null
        }));
    };

    const handleUniversityChange = (universities: string[]) => {
        // Only take the first university (limit to one)
        const university = universities.length > 0 ? universities[0] : null;
        setFormData(prev => ({
            ...prev,
            university
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="university" className="block text-sm font-medium">
                                    Университет
                                    {fieldErrors.university && (
                                        <span className="text-red-500 ml-1">*</span>
                                    )}
                                </label>
                                <TagInput
                                    value={formData.university ? [formData.university] : []}
                                    onChange={handleUniversityChange}
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
                                    placeholder="Введите название университета"
                                    error={fieldErrors.university}
                                    maxTags={1} // Limit to one university
                                />
                                <p className="text-sm text-gray-500">
                                    Введите название университета и нажмите Enter. Можно указать только один университет.
                                </p>
                            </div>
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
                            <label htmlFor="free_days" className="block text-sm font-medium">
                                Свободные дни
                            </label>
                            <TagInput
                                value={formData.free_days || []}
                                onChange={handleFreeDaysChange}
                                suggestions={[
                                    "Понедельник", "Вторник", "Среда", "Четверг",
                                    "Пятница", "Суббота", "Воскресенье"
                                ]}
                                placeholder="Выберите дни недели"
                                error={fieldErrors.free_days}
                            />
                            <p className="text-sm text-gray-500">
                                Нажмите Enter или пробел, чтобы добавить день
                            </p>
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