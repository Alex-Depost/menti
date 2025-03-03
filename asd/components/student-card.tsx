"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MentorStudent, pauseStudentMentorship, endStudentMentorship } from "@/app/service/mentorship";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Calendar, Clock, PauseCircle, XCircle, MessageSquare } from "lucide-react";

interface StudentCardProps {
  student: MentorStudent;
  onStatusChange: () => void;
}

export function StudentCard({ student, onStatusChange }: StudentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<"pause" | "end" | null>(null);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-500 text-[10px] sm:text-xs">Ожидает начала</Badge>;
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-500 text-[10px] sm:text-xs">Активный</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500 hover:bg-gray-500 text-[10px] sm:text-xs">Приостановлен</Badge>;
      default:
        return null;
    }
  };

  const handlePause = async () => {
    if (window.confirm("Вы уверены, что хотите приостановить менторство этого студента?")) {
      setIsLoading(true);
      setActionType("pause");
      try {
        const success = await pauseStudentMentorship(student.id);
        if (success) {
          toast.success("Менторство студента приостановлено");
          onStatusChange();
        } else {
          toast.error("Не удалось приостановить менторство");
        }
      } catch (error) {
        toast.error("Произошла ошибка при приостановке менторства");
      } finally {
        setIsLoading(false);
        setActionType(null);
      }
    }
  };

  const handleEnd = async () => {
    if (window.confirm("Вы уверены, что хотите завершить менторство этого студента?")) {
      setIsLoading(true);
      setActionType("end");
      try {
        const success = await endStudentMentorship(student.id);
        if (success) {
          toast.success("Менторство студента завершено");
          onStatusChange();
        } else {
          toast.error("Не удалось завершить менторство");
        }
      } catch (error) {
        toast.error("Произошла ошибка при завершении менторства");
      } finally {
        setIsLoading(false);
        setActionType(null);
      }
    }
  };

  const formattedStartDate = formatDistanceToNow(new Date(student.started_at), {
    addSuffix: true,
    locale: ru,
  });

  const formattedLastActivity = student.last_activity 
    ? formatDistanceToNow(new Date(student.last_activity), {
        addSuffix: true,
        locale: ru,
      })
    : "Нет данных";

  const userInitials = student.user_name
    ? student.user_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"; // Default initial if user_name is undefined

  const progressPercentage = student.progress 
    ? Math.round((student.progress.completed_sessions / student.progress.total_sessions) * 100)
    : 0;

  const formattedNextSession = student.progress?.next_session_date
    ? format(new Date(student.progress.next_session_date), "dd MMM yyyy, HH:mm", { locale: ru })
    : "Не запланировано";

  return (
    <Card className="w-full mb-3 overflow-hidden hover:shadow-md transition-shadow border border-muted">
      <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-primary/10">
            <AvatarImage src={student.user_avatar} alt={student.user_name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{student.user_name}</h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{student.user_email}</p>
          </div>
          <div className="mt-1 sm:mt-0">{getStatusBadge(student.status)}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 sm:p-3 md:p-4 pt-1 sm:pt-2 md:pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Начало менторства:</p>
            <p className="text-[10px] sm:text-xs md:text-sm font-medium">{formattedStartDate}</p>
          </div>
          
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Последняя активность:</p>
            <p className="text-[10px] sm:text-xs md:text-sm font-medium">{formattedLastActivity}</p>
          </div>
        </div>
        
        {student.interests && student.interests.length > 0 && (
          <div className="mb-2 sm:mb-3">
            <p className="text-[10px] sm:text-xs md:text-sm font-medium mb-0.5 sm:mb-1">Интересы:</p>
            <div className="flex flex-wrap gap-1">
              {student.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="mr-1 mb-1 text-[8px] sm:text-[10px] md:text-xs px-1.5 py-0 sm:px-2 sm:py-0">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {student.experience_level && (
          <p className="text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3">
            <span className="font-medium">Уровень опыта:</span>{" "}
            {student.experience_level === "beginner" && "Начинающий"}
            {student.experience_level === "intermediate" && "Средний"}
            {student.experience_level === "advanced" && "Продвинутый"}
          </p>
        )}
        
        {student.progress && (
          <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 md:p-3 bg-muted rounded-md text-[10px] sm:text-xs md:text-sm">
            <div className="flex justify-between mb-0.5 sm:mb-1">
              <p className="font-medium">Прогресс сессий:</p>
              <p>{student.progress.completed_sessions} из {student.progress.total_sessions}</p>
            </div>
            
            <Progress 
              value={progressPercentage} 
              className="h-1.5 sm:h-2 mb-2 sm:mb-3" 
            />
            
            <div className="flex items-center text-[8px] sm:text-[10px] md:text-xs gap-1 mt-1 sm:mt-2">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
              <span>Следующая сессия: {formattedNextSession}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center text-[8px] sm:text-[10px] md:text-xs text-muted-foreground mt-2 sm:mt-3 gap-2 sm:gap-3">
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>Начало {formattedStartDate}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[8px] sm:text-[10px] h-3 sm:h-4 px-1">
              {student.request_type === "incoming" ? "Входящий запрос" : "Исходящий запрос"}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      {student.status !== "inactive" && (
        <CardFooter className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 bg-muted/30 flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-blue-500 hover:bg-blue-500 hover:text-white text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Написать
          </Button>
          
          {student.status === "active" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-500 hover:bg-yellow-500 hover:text-white flex-1 sm:flex-initial text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                disabled={isLoading} 
                onClick={handlePause}
              >
                {isLoading && actionType === "pause" ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">◌</span> Приостановка...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <PauseCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Приостановить
                  </span>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-500 hover:bg-red-500 hover:text-white flex-1 sm:flex-initial text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                disabled={isLoading} 
                onClick={handleEnd}
              >
                {isLoading && actionType === "end" ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">◌</span> Завершение...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Завершить
                  </span>
                )}
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 