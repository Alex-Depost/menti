import { authService } from "./auth";
import { API_URL, AVATAR_URL } from "./config";
import { uploadAvatar as apiUploadAvatar } from "@/app/api/profile";
import { removeNullFields } from "@/lib/utils";

export interface UserData {
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
    target_universities?: string[];
    description?: string;
    admission_type?: "ЕГЭ" | "олимпиады" | null;
}

export interface UserUpdateData {
    name?: string | null;
    telegram_link?: string | null;
    age?: number | null;
    email?: string | null;
    password?: string | null;
    description?: string | null;
    target_universities?: string[] | null;
    admission_type?: "ЕГЭ" | "олимпиады" | null;
}

export class UserService {
    async getCurrentUser(): Promise<UserData | null> {
        try {
            const token = authService.getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/auth/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();

            // Если у пользователя есть avatar_uuid, но нет avatar_url, добавляем его
            if (userData.avatar_uuid && !userData.avatar_url) {
                userData.avatar_url = `${AVATAR_URL}/${userData.avatar_uuid}`;
            }

            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    async uploadAvatar(file: File): Promise<UserData> {
        try {
            // Используем функцию из API для загрузки аватара
            await apiUploadAvatar(file);

            // Получаем обновленные данные пользователя
            const userData = await this.getCurrentUser() as UserData;

            return userData;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    async updateUserProfile(data: UserUpdateData): Promise<UserData> {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Не авторизован');
            }

            // Send data as is, including null values for cleared fields
            const response = await fetch(`${API_URL}/auth/users/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
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
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }
}

const userService = new UserService();
export default userService;