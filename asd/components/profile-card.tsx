"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function ProfileCard() {
  const { profileData, loading, error, initials, avatarUrl } = useProfile();

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Загрузка профиля...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="text-center text-destructive">Ошибка</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Профиль не найден</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Информация о профиле отсутствует</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex flex-col items-center mb-4">
          <Avatar className="w-24 h-24 mb-2">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={profileData.name || "Аватар пользователя"} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-center">Профиль пользователя</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-muted-foreground">Email:</div>
          <div className="font-medium">{profileData.email}</div>
          
          <div className="text-muted-foreground">Имя:</div>
          <div className="font-medium">{profileData.name || "Не указано"}</div>
          
          <div className="text-muted-foreground">ID:</div>
          <div className="font-medium">{profileData.id}</div>
          
          <div className="text-muted-foreground">Статус:</div>
          <div className="font-medium">
            {profileData.is_active ? (
              <span className="text-green-600">Активен</span>
            ) : (
              <span className="text-red-600">Неактивен</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}