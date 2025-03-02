"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/app/service/auth"

interface SignupFormProps extends React.ComponentProps<"div"> {
  userType: "user" | "mentor"
}

export function SignupForm({
  className,
  userType,
  ...props
}: SignupFormProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (userType === "mentor") {
        await authService.registerMentor(name)
      } else {
        await authService.registerUser(name)
      }
      // Перенаправляем на главную страницу, так как токен уже установлен в authService
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при регистрации")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Зарегистрируйте новый аккаунт {userType === "mentor" ? "ментора" : "пользователя"}</CardTitle>
          <CardDescription>
            Введите своё имя ниже
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван Иванов"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Зарегистрироваться
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Уже есть аккаунт?{" "}
              <Link
                href={`/auth/signin?type=${userType}`}
                className="underline underline-offset-4"
              >
                Войти
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}