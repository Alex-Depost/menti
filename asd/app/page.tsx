"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем пользователя на страницу feed
    router.push("/app");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-semibold mb-2">Загрузка...</h1>
        <p className="text-muted-foreground">Перенаправление на страницу</p>
      </div>
    </div>
  );
}