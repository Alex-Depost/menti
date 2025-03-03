"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserFeedHero() {
  const router = useRouter();

  const scrollToMenti = () => {
    const mentiSection = document.getElementById('menti-list');
    if (mentiSection) {
      mentiSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 border-b">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Найдите единомышленников</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Общайтесь с другими пользователями, делитесь опытом и находите новые возможности для сотрудничества
            </p>
            <div className="flex gap-3">
              <Button className="gap-2" onClick={scrollToMenti}>
                <Users className="h-4 w-4" />
                Найти менти
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => router.push("/app/mentor/profile")}>
                <Sparkles className="h-4 w-4" />
                Обновить профиль
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative w-64 h-64">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-500/70">Сообщество</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}