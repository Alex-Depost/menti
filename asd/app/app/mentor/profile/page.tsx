"use client";

import mentorService, { MentorData, MentorUpdateData } from "@/app/service/mentor";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import components
import { LoadingProfile } from "@/app/app/mentor/profile/components/loading-profile";
import { ProfileEditForm } from "@/app/app/mentor/profile/components/profile-edit-form";
import { ProfileInfo } from "@/app/app/mentor/profile/components/profile-info";

export default function MentorProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [mentorData, setMentorData] = useState<MentorData | null>(null);
    const [formData, setFormData] = useState<MentorUpdateData>({});
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function loadMentorData() {
            if (!isAuthenticated || isUser) {
                return;
            }

            try {
                const data = await mentorService.getCurrentMentor();
                setMentorData(data);
                // Initialize form with mentor data
                if (data) {
                    setFormData({
                        name: data.name || null,
                        email: data.email || null,
                        telegram_link: data.telegram_link || null,
                        age: data.age || null,
                        description: data.description || null,
                        university: data.university || null,
                        free_days: data.free_days || null,
                        admission_type: data.admission_type || null
                    });
                }
            } catch (error) {
                setError('Ошибка при загрузке данных профиля');
            } finally {
                setLoading(false);
            }
        }

        loadMentorData();
    }, [isAuthenticated, isUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setSuccess(null);
        setSaving(true);

        try {
            const updatedMentor = await mentorService.updateMentorProfile(formData);
            setMentorData(updatedMentor);
            setSuccess("Профиль успешно обновлен");
        } catch (err: any) {
            // Check if error has fieldErrors
            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
                setError("Пожалуйста, исправьте ошибки в форме");
            } else {
                setError(err instanceof Error ? err.message : "Произошла ошибка при обновлении профиля");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        setError(null);
        setSuccess(null);
        setUploadingAvatar(true);

        try {
            const updatedMentor = await mentorService.uploadAvatar(file);
            setMentorData(updatedMentor);
            setSuccess("Аватар успешно обновлен");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке аватара");
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return <LoadingProfile />;
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
            <h1 className="text-2xl font-bold mb-6">Профиль ментора</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - profile info */}
                <div className="md:col-span-1">
                    <ProfileInfo
                        mentorData={mentorData}
                        onAvatarUpload={handleAvatarUpload}
                        uploadingAvatar={uploadingAvatar}
                    />
                </div>

                {/* Right column - edit form */}
                <div className="md:col-span-2">
                    <ProfileEditForm
                        formData={formData}
                        setFormData={setFormData}
                        error={error}
                        fieldErrors={fieldErrors}
                        success={success}
                        saving={saving}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}