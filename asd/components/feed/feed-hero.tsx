"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export function MentorsFeedHero() {
  const router = useRouter();

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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Найдите своего идеального ментора</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Получите персональную поддержку от опытных профессионалов, которые помогут вам достичь ваших целей
            </p>
            <div className="flex gap-3">
              <Button className="gap-2" onClick={scrollToMentors}>
                <Users className="h-4 w-4" />
                Найти ментора
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => router.push("/auth/signup?type=mentor")}>
                <Sparkles className="h-4 w-4" />
                Стать ментором
              </Button>
            </div>
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