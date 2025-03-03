import { uploadAvatar as apiUploadAvatar } from "@/app/api/profile";
import { authService } from "./auth";
import { API_URL, AVATAR_URL } from "./config";

export interface MentorData {
    email: string;
    name: string;
    id: number;
    is_active: boolean;
    login?: string;
    avatar_uuid?: string;
    avatar_url?: string;
    telegram_link?: string;
    age?: number;
    created_at?: string;
    updated_at?: string;
    description?: string;
    university?: string;
    title?: string;
    free_days?: string[];
    admission_type?: "ЕГЭ" | "олимпиады" | null;
}

export interface MentorUpdateData {
    name?: string | null;
    telegram_link?: string | null;
    age?: number | null;
    email?: string | null;
    password?: string | null;
    description?: string | null;
    university?: string | null;
    free_days?: string[] | null;
    admission_type?: "ЕГЭ" | "олимпиады" | null;
}

export class MentorService {
    async getCurrentMentor(): Promise<MentorData | null> {
        try {
            const token = authService.getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/auth/mentors/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Session expired, log the user out
                    await authService.logout();
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                throw new Error('Failed to fetch mentor data');
            }

            const mentorData = await response.json();
            
            // Если у ментора есть avatar_uuid, но нет avatar_url, добавляем его
            if (mentorData.avatar_uuid && !mentorData.avatar_url) {
                mentorData.avatar_url = `${AVATAR_URL}/${mentorData.avatar_uuid}`;
            }

            return mentorData;
        } catch (error) {
            throw new Error('Ошибка при получении данных ментора');
        }
    }

    async uploadAvatar(file: File): Promise<MentorData> {
        try {
            // Используем функцию из API для загрузки аватара
            await apiUploadAvatar(file);
            
            // Получаем обновленные данные ментора
            const mentorData = await this.getCurrentMentor() as MentorData;
            
            return mentorData;
        } catch (error: any) {
            // Check if this is a session expired error
            if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
                // Just rethrow the error as it's already handled
                throw error;
            }
            throw new Error('Ошибка при загрузке аватара');
        }
    }

    async updateMentorProfile(data: MentorUpdateData): Promise<MentorData> {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Не авторизован');
            }

            // Remove null fields from the data before sending

            const response = await fetch(`${API_URL}/auth/mentors/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Session expired, log the user out
                    await authService.logout();
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                
                const errorData = await response.json();
                
                // Handle complex error structure
                if (errorData.detail && Array.isArray(errorData.detail)) {
                    // Extract field-specific errors
                    const fieldErrors: Record<string, string> = {};
                    const errorMessages = errorData.detail.map((error: any) => {
                        // Get the field name from the location path
                        if (error.loc && error.loc.length > 1) {
                            const fieldName = error.loc[1];
                            fieldErrors[fieldName] = error.msg;
                        }
                        return error.msg;
                    });
                    
                    // Create a structured error object with both message and field errors
                    const structuredError: any = new Error(errorMessages.join(', '));
                    structuredError.fieldErrors = fieldErrors;
                    throw structuredError;
                }
                
                throw new Error(typeof errorData.detail === 'string' ? errorData.detail : 'Ошибка при обновлении профиля');
            }

            return await response.json();
        } catch (error: any) {
            // If the error already has fieldErrors (from our structured error), preserve it
            if (error.fieldErrors) {
                throw error;
            }
            // Otherwise throw a generic error
            throw new Error('Ошибка при обновлении профиля');
        }
    }
}

const mentorService = new MentorService();
export default mentorService;
