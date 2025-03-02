"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MentorshipRequest, cancelMentorshipRequest } from "@/app/service/mentorship";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MentorshipRequestCardProps {
  request: MentorshipRequest;
  onStatusChange: () => void;
}

export function MentorshipRequestCard({ request, onStatusChange }: MentorshipRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-500">В ожидании</Badge>;
      case "accepted":
        return <Badge className="bg-green-500 hover:bg-green-500">Принято</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-500">Отклонено</Badge>;
      default:
        return null;
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Вы уверены, что хотите отменить этот запрос на менторство?")) {
      setIsLoading(true);
      try {
        const success = await cancelMentorshipRequest(request.id);
        if (success) {
          toast.success("Запрос на менторство успешно отменен");
          onStatusChange();
        } else {
          toast.error("Не удалось отменить запрос");
        }
      } catch (error) {
        toast.error("Произошла ошибка при отмене запроса");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formattedDate = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: true,
    locale: ru,
  });

  const mentorInitials = request.mentor_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="w-full mb-4 overflow-hidden hover:shadow-md transition-shadow border border-muted">
      <CardHeader className="p-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/10">
            <AvatarImage src={request.mentor_avatar} alt={request.mentor_name} />
            <AvatarFallback>{mentorInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg truncate">{request.mentor_name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{request.mentor_email}</p>
          </div>
          <div className="mt-1 sm:mt-0">{getStatusBadge(request.status)}</div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
        {request.specialization && (
          <p className="text-xs sm:text-sm mb-2">
            <span className="font-medium">Специализация:</span> {request.specialization}
          </p>
        )}
        {request.rating && (
          <p className="text-xs sm:text-sm mb-2">
            <span className="font-medium">Рейтинг:</span> {request.rating} / 5
          </p>
        )}
        {request.message && (
          <div className="mt-3 p-2 sm:p-3 bg-muted rounded-md text-xs sm:text-sm">
            <p className="font-medium mb-1">Сообщение:</p>
            <p className="break-words">{request.message}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">Отправлено {formattedDate}</p>
      </CardContent>
      {request.status === "pending" && (
        <CardFooter className="px-3 py-2 sm:px-4 sm:py-3 bg-muted/30 flex justify-center sm:justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading} 
            onClick={handleCancel}
            className="w-full sm:w-auto text-sm"
          >
            {isLoading ? "Отмена..." : "Отменить запрос"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 