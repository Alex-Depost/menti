import authService from "./auth";
import { API_URL } from "./config";

export interface MentorData {
    email: string;
    name: string;
    id: number;
    is_active: boolean;
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
                throw new Error('Failed to fetch mentor data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching mentor data:', error);
            return null;
        }
    }
}

const mentorService = new MentorService();
export default mentorService;
