import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import userService from '@/app/service/user';
import mentorService from '@/app/service/mentor';

// Тип для данных профиля (общий для пользователя и ментора)
export type ProfileData = {
  email: string;
  name: string;
  id: number;
  is_active: boolean;
  login?: string;
  avatar_uuid?: string;
  avatar_url?: string | null;
};

export function useProfile() {
  const { isAuthenticated, isUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        let data = null;
        
        if (isUser) {
          data = await userService.getCurrentUser();
        } else {
          data = await mentorService.getCurrentMentor();
        }
        
        setProfileData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ошибка при загрузке данных профиля");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [isAuthenticated, isUser]);

  // Функция для получения инициалов из имени
  const getInitials = (name?: string): string => {
    if (!name) return "ПП";
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  // Получаем имя и инициалы для отображения
  const displayName = profileData?.name || "Пользователь";
  const initials = profileData ? getInitials(profileData.name) : "ПП";
  const avatarUrl = profileData?.avatar_url;

  return {
    profileData,
    loading,
    error,
    displayName,
    initials,
    avatarUrl
  };
}