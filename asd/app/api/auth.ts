import { API_URL } from "../service/config";
import { removeNullFields } from "@/lib/utils";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface MentorData {
  email: string;
  name: string;
  id: number;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorResume {
  university: string;
  title: string;
  description: string;
  id: number;
  mentor_id: number;
  created_at: string;
  updated_at: string;
}

// Функция для авторизации ментора
export async function loginMentor(email: string, password: string): Promise<LoginResponse> {
  // Remove null fields from the login data
  const loginData = removeNullFields({ email, password });
  
  const response = await fetch(`${API_URL}/auth/mentors/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });
  
  if (!response.ok) {
    throw new Error('Ошибка авторизации. Проверьте логин и пароль.');
  }
  
  const data = await response.json();
  // Сохраняем токен в localStorage
  localStorage.setItem('token', data.access_token);
  return data;
}

// Функция для получения данных авторизованного ментора
export async function fetchMentorProfile(): Promise<MentorData> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const response = await fetch(`${API_URL}/auth/mentors/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Токен истек или недействителен');
    }
    throw new Error('Не удалось получить данные профиля');
  }
  
  return await response.json();
}

// Проверка авторизации
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

// Выход из системы
export function logout(): void {
  localStorage.removeItem('token');
}

// Получение Bearer токена
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
} 