"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as React from "react";
import { MentorshipRequestError, sendMentorshipRequest } from "@/app/service/mentorship";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

interface UserRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

export function UserRequestDialog({
  isOpen,
  onClose,
  userId,
  userName,
}: UserRequestDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Пожалуйста, введите сообщение для пользователя");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // When a mentor sends a request to a user, the receiver type should be 'user'
      const response = await sendMentorshipRequest(userId, message, 'user');
      
      if (response) {
        toast.success("Запрос успешно отправлен");
        onClose();
        setMessage("");
      } else {
        toast.error("Не удалось отправить запрос");
      }
    } catch (error) {
      console.error("Error sending user request:", error);
      
      // Handle specific error for existing request
      if (error instanceof MentorshipRequestError && error.code === 'EXISTING_REQUEST') {
        toast.error("У вас уже есть активная заявка к этому пользователю");
      } else {
        toast.error("Произошла ошибка при отправке запроса");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Запрос на менторство</DialogTitle>
          <DialogDescription>
            Отправьте запрос пользователю {userName} с предложением менторства и описанием того, чем вы можете помочь.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="message">Сообщение для пользователя</Label>
            <Textarea
              id="message"
              placeholder="Расскажите, чем вы можете помочь пользователю, ваш опыт и подход к менторству..."
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
            <Button type="submit" disabled={isSubmitting}>
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