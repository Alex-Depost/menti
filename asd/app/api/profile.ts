import { getAuthToken } from './auth';

const API_URL = 'http://localhost:8000'; // Базовый URL API - замените на свой

export interface MentorResumeData {
  university: string;
  title: string;
  description: string;
  id?: number;
}

// Получение всех резюме ментора
export async function getMyResumes() {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const response = await fetch(`${API_URL}/mentors/resumes/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  if (!response.ok) {
    throw new Error('Не удалось получить список резюме');
  }
  
  return await response.json();
}

// Получение конкретного резюме ментора
export async function getMentorResume(resumeId: number) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const response = await fetch(`${API_URL}/mentors/resumes/${resumeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  if (!response.ok) {
    throw new Error('Не удалось получить резюме');
  }
  
  return await response.json();
}

// Создание нового резюме
export async function createMentorResume(resumeData: MentorResumeData) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const response = await fetch(`${API_URL}/mentors/resumes/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resumeData),
  });
  
  if (!response.ok) {
    throw new Error('Не удалось создать резюме');
  }
  
  return await response.json();
}

// Обновление существующего резюме
export async function updateMentorResume(resumeId: number, resumeData: Partial<MentorResumeData>) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const response = await fetch(`${API_URL}/mentors/resumes/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resumeData),
  });
  
  if (!response.ok) {
    throw new Error('Не удалось обновить резюме');
  }
  
  return await response.json();
}

// Загрузка аватарки
export async function uploadAvatar(file: File): Promise<string> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/me/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Не удалось загрузить аватарку');
  }
  
  const data = await response.json();
  return data.avatar_url || '';
}

// Удаление аватарки
export async function removeAvatar() {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }
  
  const response = await fetch(`${API_URL}/me/avatar`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Не удалось удалить аватарку');
  }
  
  return true;
} 