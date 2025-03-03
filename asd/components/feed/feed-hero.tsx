"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Users, LogIn, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function MentorsFeedHero() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const scrollToMentors = () => {
    const mentorsSection = document.getElementById('mentors-list');
    if (mentorsSection) {
      mentorsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {isAuthenticated
                ? "Персонализированный список менторов"
                : "Найдите своего идеального ментора"}
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              {isAuthenticated
                ? "Список менторов отфильтрован на основе вашего профиля и описания. Чем подробнее ваш профиль, тем точнее подбор менторов."
                : "Войдите в систему, чтобы получить персонализированные рекомендации менторов на основе вашего профиля."}
            </p>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <>
                  <Button className="gap-2" onClick={scrollToMentors}>
                    <Users className="h-4 w-4" />
                    Просмотреть менторов
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => router.push("/auth/signup?type=mentor")}>
                    <Sparkles className="h-4 w-4" />
                    Стать ментором
                  </Button>
                </>
              ) : (
                <>
                  <Button className="gap-2" onClick={() => router.push("/auth/signin")}>
                    <LogIn className="h-4 w-4" />
                    Войти
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={scrollToMentors}>
                    <Users className="h-4 w-4" />
                    Просмотреть всех менторов
                  </Button>
                </>
              )}
            </div>
            {isAuthenticated && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-2 rounded-md border border-primary/10">
                <Filter className="h-4 w-4 text-primary" />
                <span>Результаты отфильтрованы на основе вашего профиля</span>
              </div>
            )}
          </div>
          <div className="hidden md:block relative w-64 h-64">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 rounded-full border-2 border-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-primary/70">Менторство</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}