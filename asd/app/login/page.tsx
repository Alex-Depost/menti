"use client"
import { LoginForm } from "@/components/login-form"
import authService from "../service/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [errorText, setError] = useState<string | null>(null);
  const handleFormSubmit = async ({ email, password }: { email: string; password: string; }) => {
    try {
      await authService.loginAsUser(email, password);
      router.push("/")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка авторизации");
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onFormSubmit={handleFormSubmit} error={errorText} />
      </div>
    </div>
  )
}
