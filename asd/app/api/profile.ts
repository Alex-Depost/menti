import { API_URL } from '../service/config';
import { getAuthToken, logout } from './auth';
import { removeNullFields } from '@/lib/utils';

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
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
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
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
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
  
  // Remove null fields from the data before sending
  const cleanData = removeNullFields(resumeData);
  
  const response = await fetch(`${API_URL}/mentors/resumes/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanData),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
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
  
  // Remove null fields from the data before sending
  const cleanData = removeNullFields(resumeData);
  
  const response = await fetch(`${API_URL}/mentors/resumes/${resumeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cleanData),
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
    throw new Error('Не удалось обновить резюме');
  }
  
  return await response.json();
}

// Загрузка аватарки
export async function uploadAvatar(file: File): Promise<void> {
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
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
    throw new Error('Не удалось загрузить аватарку');
  }
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
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
    throw new Error('Не удалось удалить аватарку');
  }
  
  return true;
} 