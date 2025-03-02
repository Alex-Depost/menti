"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { IncomingMentorshipRequest, acceptMentorshipRequest, rejectMentorshipRequest } from "@/app/service/mentorship";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

interface IncomingRequestCardProps {
  request: IncomingMentorshipRequest;
  onStatusChange: () => void;
}

export function IncomingRequestCard({ request, onStatusChange }: IncomingRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  
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

  const handleAccept = async () => {
    if (window.confirm("Вы уверены, что хотите принять этот запрос на менторство?")) {
      setIsLoading(true);
      setActionType("accept");
      try {
        const success = await acceptMentorshipRequest(request.id);
        if (success) {
          toast.success("Запрос на менторство принят");
          onStatusChange();
        } else {
          toast.error("Не удалось принять запрос");
        }
      } catch (error) {
        toast.error("Произошла ошибка при принятии запроса");
      } finally {
        setIsLoading(false);
        setActionType(null);
      }
    }
  };

  const handleReject = async () => {
    if (window.confirm("Вы уверены, что хотите отклонить этот запрос на менторство?")) {
      setIsLoading(true);
      setActionType("reject");
      try {
        const success = await rejectMentorshipRequest(request.id);
        if (success) {
          toast.success("Запрос на менторство отклонен");
          onStatusChange();
        } else {
          toast.error("Не удалось отклонить запрос");
        }
      } catch (error) {
        toast.error("Произошла ошибка при отклонении запроса");
      } finally {
        setIsLoading(false);
        setActionType(null);
      }
    }
  };

  const formattedDate = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: true,
    locale: ru,
  });

  const userInitials = request.user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="w-full mb-4 overflow-hidden hover:shadow-md transition-shadow border border-muted">
      <CardHeader className="p-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/10">
            <AvatarImage src={request.user_avatar} alt={request.user_name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg truncate">{request.user_name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{request.user_email}</p>
          </div>
          <div className="mt-1 sm:mt-0">{getStatusBadge(request.status)}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
        {request.interests && request.interests.length > 0 && (
          <div className="mb-3">
            <p className="text-xs sm:text-sm font-medium mb-1">Интересы:</p>
            <div className="flex flex-wrap gap-1">
              {request.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {request.experience_level && (
          <p className="text-xs sm:text-sm mb-3">
            <span className="font-medium">Уровень опыта:</span>{" "}
            {request.experience_level === "beginner" && "Начинающий"}
            {request.experience_level === "intermediate" && "Средний"}
            {request.experience_level === "advanced" && "Продвинутый"}
          </p>
        )}
        
        {request.message && (
          <div className="mt-2 p-2 sm:p-3 bg-muted rounded-md text-xs sm:text-sm">
            <p className="font-medium mb-1">Сообщение:</p>
            <p className="break-words">{request.message}</p>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-3">Получено {formattedDate}</p>
      </CardContent>
      
      {request.status === "pending" && (
        <CardFooter className="px-3 py-2 sm:px-4 sm:py-3 bg-muted/30 flex flex-wrap gap-2 justify-center sm:justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-500 hover:bg-red-500 hover:text-white flex-1 sm:flex-initial"
            disabled={isLoading} 
            onClick={handleReject}
          >
            {isLoading && actionType === "reject" ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">◌</span> Отклонение...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Отклонить
              </span>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="border-green-500 hover:bg-green-500 hover:text-white flex-1 sm:flex-initial"
            disabled={isLoading} 
            onClick={handleAccept}
          >
            {isLoading && actionType === "accept" ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">◌</span> Принятие...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Принять
              </span>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 