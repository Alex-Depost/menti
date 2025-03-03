"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as React from "react";
import { sendMentorshipRequest } from "@/app/service/mentorship";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Пожалуйста, введите сообщение для ментора");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // When a user sends a request to a mentor, the receiver type should be 'mentor'
      const response = await sendMentorshipRequest(mentorId, message, 'mentor');
      
      if (response) {
        toast.success("Запрос на менторство успешно отправлен");
        onClose();
        setMessage("");
      } else {
        toast.error("Не удалось отправить запрос на менторство");
      }
    } catch (error) {
      console.error("Error sending mentorship request:", error);
      toast.error("Произошла ошибка при отправке запроса");
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
            Отправьте запрос ментору {mentorName} с кратким описанием ваших целей и ожиданий.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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