import { authService } from "./auth";
import { API_URL } from "./config";

export interface UserData {
    email: string;
    name: string;
    id: number;
    is_active: boolean;
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
}

const userService = new UserService();
export default userService;