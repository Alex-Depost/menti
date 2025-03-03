"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as React from "react";
import { MentorshipRequestError, sendMentorshipRequest } from "@/app/service/mentorship";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import userService from "@/app/service/user";

// Custom Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

interface MentorshipRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: number;
  mentorName: string;
}

export function MentorshipRequestDialog({
  isOpen,
  onClose,
  mentorId,
  mentorName,
}: MentorshipRequestDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    telegram: "",
    email: ""
  });
  const [showContactFields, setShowContactFields] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasValidContactInfo, setHasValidContactInfo] = useState(false);

  useEffect(() => {
    // При открытии диалога проверяем наличие контактной информации в профиле пользователя (отправитель)
    const checkContactInfo = async () => {
      if (!isOpen) return;
      
      try {
        const userProfile = await userService.getCurrentUser();
        
        // Проверяем, есть ли контактная информация в профиле
        const hasContactInfo = !!(userProfile?.telegram_link || userProfile?.email);
        
        // Показываем поля для ввода только если нет контактной информации
        setShowContactFields(!hasContactInfo);
        
        // Заполняем имеющиеся данные, если они есть
        if (userProfile?.telegram_link) {
          setContactInfo(prev => ({ ...prev, telegram: userProfile.telegram_link || "" }));
        }
        if (userProfile?.email) {
          setContactInfo(prev => ({ ...prev, email: userProfile.email || "" }));
        }
        
        // Устанавливаем состояние валидности контактной информации
        setHasValidContactInfo(hasContactInfo);
      } catch (error) {
        // В случае ошибки лучше показать поля, чтобы пользователь мог ввести данные
        setShowContactFields(true);
        setHasValidContactInfo(false);
      }
    };
    
    checkContactInfo();
  }, [isOpen]);

  // Проверяем валидность контактной информации при её изменении
  useEffect(() => {
    if (!showContactFields) {
      // Если поля не отображаются, значит контактная информация уже есть в профиле
      return;
    }

    const hasTelegram = !!contactInfo.telegram.trim();
    const hasEmail = !!contactInfo.email.trim();
    const isEmailValid = !contactInfo.email.trim() || isValidEmail(contactInfo.email);
    
    // Контактная информация валидна, если есть хотя бы одно заполненное поле и email (если указан) валиден
    setHasValidContactInfo((hasTelegram || hasEmail) && isEmailValid);
    
    // Сбрасываем ошибки полей при изменении значений
    setFieldErrors({});
  }, [contactInfo, showContactFields]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Валидация сообщения
    if (!message.trim()) {
      toast.error("Пожалуйста, введите сообщение для ментора");
      return;
    }

    // Валидация контактной информации, если поля отображаются
    if (showContactFields) {
      if (!contactInfo.telegram.trim() && !contactInfo.email.trim()) {
        toast.error("Пожалуйста, укажите хотя бы один способ связи");
        return;
      }

      if (contactInfo.email && !isValidEmail(contactInfo.email)) {
        toast.error("Пожалуйста, укажите корректный email");
        return;
      }
    }
    
    // Сбрасываем ошибки полей перед отправкой
    setFieldErrors({});
    setIsSubmitting(true);
    
    try {
      // Сначала обновляем контактную информацию в профиле, если она отсутствовала
      if (showContactFields) {
        try {
          // Используем PATCH запрос для обновления только контактной информации
          await userService.updateUserProfile({
            telegram_link: contactInfo.telegram || null,
            email: contactInfo.email || null
          });
          
          // Сообщаем пользователю, что контактная информация была сохранена
          toast.success("Контактная информация сохранена в вашем профиле");
          
          // Устанавливаем флаг, что теперь у пользователя есть контактная информация
          setHasValidContactInfo(true);
        } catch (error: any) {
          // Если есть структурированные ошибки полей, отображаем их
          if (error.fieldErrors) {
            setFieldErrors(error.fieldErrors);
            toast.error("Пожалуйста, исправьте ошибки в контактной информации");
            return; // Прерываем выполнение, не отправляем запрос на менторство
          } else {
            // Общая ошибка
            toast.error("Не удалось сохранить контактную информацию");
            return; // Прерываем выполнение, не отправляем запрос на менторство
          }
        }
      }

      // Отправляем запрос ментору (receiver_type = 'mentor') только если контактная информация валидна
      const response = await sendMentorshipRequest(mentorId, message, 'mentor');
      
      if (response) {
        toast.success("Запрос на менторство успешно отправлен");
        onClose();
        setMessage("");
        setContactInfo({ telegram: "", email: "" });
        setFieldErrors({});
      } else {
        toast.error("Не удалось отправить запрос на менторство");
      }
    } catch (error) {
      // Display the exact error message from the server
      toast.error(error instanceof Error ? error.message : "Ошибка при отправке запроса");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Простая валидация email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Запрос на менторство</DialogTitle>
          <DialogDescription>
            Отправьте запрос ментору {mentorName} с кратким описанием ваших целей и ожиданий.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {showContactFields && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  placeholder="t.me/username"
                  value={contactInfo.telegram}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, telegram: e.target.value }))}
                  disabled={isSubmitting}
                  className={fieldErrors.telegram_link ? "border-red-500" : ""}
                />
                {fieldErrors.telegram_link && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {fieldErrors.telegram_link}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isSubmitting}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {fieldErrors.email}
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Укажите хотя бы один способ связи. Эта информация будет сохранена в вашем профиле.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение для ментора</Label>
            <Textarea
              id="message"
              placeholder="Расскажите о своих целях, опыте и чему хотите научиться..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (showContactFields && !hasValidContactInfo)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить запрос"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}