"use client";

import React, { useState, useRef, useEffect } from "react";
import { MentorData, fetchMentorProfile } from "../api/auth";
import { MentorResumeData, createMentorResume, getMyResumes, updateMentorResume, uploadAvatar } from "../api/profile";

// Компонент режима просмотра
const ViewMode = ({ formData, setIsEditing, isLoading }: { 
  formData: { 
    name: string; 
    university: string; 
    description: string; 
    availableDays: string; 
    avatar: string;
  }; 
  setIsEditing: (value: boolean) => void;
  isLoading: boolean;
}) => (
  <div className="max-w-2xl mx-auto">
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center mb-6">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="Аватар пользователя" 
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Название</h3>
            <p className="mt-1 text-lg">{formData.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Университет</h3>
            <p className="mt-1 text-lg">{formData.university}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Описание</h3>
            <p className="mt-1 text-lg whitespace-pre-wrap">{formData.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Свободные дни</h3>
            <p className="mt-1 text-lg">{formData.availableDays}</p>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Редактировать
          </button>
        </>
      )}
    </div>
  </div>
);

// Компонент режима редактирования
const EditMode = ({ 
  formData, 
  handleChange,
  handleAvatarChange,
  handleSubmit,
  isSubmitting
}: { 
  formData: { 
    name: string; 
    university: string; 
    description: string; 
    availableDays: string; 
    avatar: string;
  }; 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col items-center">
          <div className="relative mb-4 group">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt="Аватар пользователя" 
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 cursor-pointer group-hover:opacity-80"
                onClick={() => fileInputRef.current?.click()}
              />
            ) : (
              <div 
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer group-hover:bg-gray-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <div 
              className="absolute bottom-0 right-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-sm text-gray-500 mb-4">Нажмите на изображение, чтобы изменить аватар</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Название
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="university" className="block text-sm font-medium text-gray-700">
            Университет
          </label>
          <input
            type="text"
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="availableDays" className="block text-sm font-medium text-gray-700">
            Свободные дни
          </label>
          <input
            type="text"
            id="availableDays"
            name="availableDays"
            value={formData.availableDays}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Например: Понедельник, Среда, Пятница"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md transition-colors ${isSubmitting 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorData | null>(null);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    description: "",
    availableDays: "",
    avatar: "",
  });

  // Загрузка данных профиля
  useEffect(() => {
    async function loadProfileData() {
      try {
        setIsLoading(true);
        
        // Загрузка данных профиля ментора
        const profileData = await fetchMentorProfile();
        setMentorProfile(profileData);
        
        // Загрузка резюме ментора
        const resumes = await getMyResumes();
        
        if (resumes && resumes.length > 0) {
          const resume = resumes[0]; // Берем первое резюме
          setResumeId(resume.id);
          
          setFormData({
            name: profileData.name || '',
            university: resume.university || '',
            description: resume.description || '',
            availableDays: '', // Это поле нужно будет добавить на бэкенде
            avatar: profileData.avatar_url || '',
          });
        } else {
          // Если резюме нет, то заполняем только данные из профиля
          setFormData({
            name: profileData.name || '',
            university: '',
            description: '',
            availableDays: '',
            avatar: profileData.avatar_url || '',
          });
        }
        
        setIsEditing(false); // После загрузки данных переходим в режим просмотра
      } catch (err) {
        console.error('Ошибка при загрузке данных профиля:', err);
        setError('Не удалось загрузить данные профиля. Пожалуйста, войдите в систему.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Временно показываем загруженную картинку пользователю до загрузки на сервер
        const localPreview = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          avatar: localPreview,
        }));
        
        // Загружаем аватарку на сервер
        const avatarUrl = await uploadAvatar(file);
        
        // Обновляем URL аватарки после загрузки на сервер
        setFormData((prev) => ({
          ...prev,
          avatar: avatarUrl,
        }));
        
      } catch (err) {
        console.error('Ошибка при загрузке аватарки:', err);
        alert('Не удалось загрузить аватарку. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Создаем или обновляем резюме
      const resumeData: MentorResumeData = {
        title: formData.name,
        university: formData.university,
        description: formData.description,
      };
      
      if (resumeId) {
        // Обновляем существующее резюме
        await updateMentorResume(resumeId, resumeData);
      } else {
        // Создаем новое резюме
        const newResume = await createMentorResume(resumeData);
        setResumeId(newResume.id);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка при сохранении данных:', err);
      setError('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Анкета ментора</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isEditing ? (
        <EditMode 
          formData={formData} 
          handleChange={handleChange}
          handleAvatarChange={handleAvatarChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <ViewMode 
          formData={formData} 
          setIsEditing={setIsEditing}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}