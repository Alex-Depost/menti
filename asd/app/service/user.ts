import { authService } from "./auth";
import { API_URL } from "./config";

export interface UserData {
    email: string;
    name: string;
    id: number;
    is_active: boolean;
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

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    async updateUserProfile(data: UserUpdateData): Promise<UserData> {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error('Не авторизован');
            }

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
                throw new Error(errorData.detail || 'Ошибка при обновлении профиля');
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