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
import { baseRegister } from "@/app/service/login"

interface SignupFormProps extends React.ComponentProps<"div"> {
  userType: "user" | "mentor"
}

export function SignupForm({
  className,
  userType,
  ...props
}: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const path = userType === "mentor" ? "/auth/mentors/signup" : "/auth/users/signup"
      await baseRegister(email, password, path)
      router.push("/auth/signin")
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
            Введите свой E-mail ниже
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                href="/auth/signin"
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