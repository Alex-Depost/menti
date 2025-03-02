"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IncomingMentorshipRequest, acceptMentorshipRequest, rejectMentorshipRequest } from "@/app/service/mentorship";
import { toast } from "sonner";
import { Check, X, MessageSquare, Clock } from "lucide-react";

interface RequestListProps {
  requests: IncomingMentorshipRequest[];
  onStatusChange: () => void;
  className?: string;
}

export function RequestList({ requests, onStatusChange, className }: RequestListProps) {
  const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);

  if (!requests || requests.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="py-2 px-2 sm:py-3 sm:px-3 md:py-4 md:px-4 pb-1.5 sm:pb-2">
          <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">Заявки пользователей</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Нет заявок от пользователей</p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "pending");
  const acceptedRequests = requests.filter(r => r.status === "accepted");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  const handleAccept = async (requestId: number) => {
    setLoadingRequestId(requestId);
    setLoadingAction("accept");
    
    try {
      const success = await acceptMentorshipRequest(requestId);
      if (success) {
        toast.success("Заявка принята успешно");
        onStatusChange();
      } else {
        toast.error("Не удалось принять заявку");
      }
    } catch (error) {
      toast.error("Произошла ошибка при принятии заявки");
    } finally {
      setLoadingRequestId(null);
      setLoadingAction(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setLoadingRequestId(requestId);
    setLoadingAction("reject");
    
    try {
      const success = await rejectMentorshipRequest(requestId);
      if (success) {
        toast.success("Заявка отклонена");
        onStatusChange();
      } else {
        toast.error("Не удалось отклонить заявку");
      }
    } catch (error) {
      toast.error("Произошла ошибка при отклонении заявки");
    } finally {
      setLoadingRequestId(null);
      setLoadingAction(null);
    }
  };

  const RequestItem = ({ request }: { request: IncomingMentorshipRequest }) => {
    const userInitials = request.user_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const formattedTime = formatDistanceToNow(new Date(request.created_at), {
      addSuffix: true,
      locale: ru,
    });

    const isLoading = loadingRequestId === request.id;

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "pending":
          return <Badge className="bg-yellow-500 hover:bg-yellow-500 text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">Ожидает</Badge>;
        case "accepted":
          return <Badge className="bg-green-500 hover:bg-green-500 text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">Принята</Badge>;
        case "rejected":
          return <Badge className="bg-red-500 hover:bg-red-500 text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">Отклонена</Badge>;
        default:
          return null;
      }
    };

    return (
      <div className="flex flex-col border rounded-md p-1.5 sm:p-2 md:p-3 mb-1.5 sm:mb-2 md:mb-3 hover:bg-muted/30">
        <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 border-2 border-primary/10">
            <AvatarImage src={request.user_avatar} alt={request.user_name} />
            <AvatarFallback className="text-[8px] sm:text-xs">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-between items-start">
              <div>
                <h3 className="font-semibold text-xs sm:text-sm truncate">{request.user_name}</h3>
                <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground truncate">{request.user_email}</p>
                <div className="flex items-center text-[8px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 gap-0.5 sm:gap-1">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>{formattedTime}</span>
                </div>
              </div>
              <div>{getStatusBadge(request.status)}</div>
            </div>
            
            {request.message && (
              <div className="mt-1 sm:mt-2 p-1 sm:p-1.5 md:p-2 bg-muted rounded-md text-[8px] sm:text-[10px] md:text-xs">
                <p className="text-muted-foreground mb-0.5">Сообщение:</p>
                <p>{request.message}</p>
              </div>
            )}
            
            {request.interests && request.interests.length > 0 && (
              <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                {request.interests.map((interest, i) => (
                  <Badge key={i} variant="secondary" className="text-[7px] sm:text-[8px] md:text-[10px] px-1 py-0">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {request.status === "pending" && (
          <div className="flex flex-wrap justify-end gap-1 sm:gap-1.5 md:gap-2 mt-1.5 sm:mt-2 md:mt-3">
            <Button 
              size="sm"
              className="h-6 sm:h-7 md:h-8 text-[8px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 md:px-3"
              variant="outline"
            >
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1" /> Написать
            </Button>
            <Button 
              size="sm"
              className="h-6 sm:h-7 md:h-8 text-[8px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 md:px-3 bg-red-500 hover:bg-red-600"
              onClick={() => handleReject(request.id)}
              disabled={isLoading}
            >
              {isLoading && loadingAction === "reject" ? (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <span className="animate-spin">◌</span> Отклонение...
                </span>
              ) : (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> Отклонить
                </span>
              )}
            </Button>
            <Button 
              size="sm"
              className="h-6 sm:h-7 md:h-8 text-[8px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 md:px-3 bg-green-500 hover:bg-green-600"
              onClick={() => handleAccept(request.id)}
              disabled={isLoading}
            >
              {isLoading && loadingAction === "accept" ? (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <span className="animate-spin">◌</span> Принятие...
                </span>
              ) : (
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> Принять
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="py-2 px-2 sm:py-3 sm:px-3 md:py-4 md:px-4 pb-1.5 sm:pb-2 md:pb-3">
        <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">Заявки пользователей</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start sm:justify-center p-0.5 sm:p-1 h-7 sm:h-8 md:h-9 min-h-7 mb-2 sm:mb-3 md:mb-4">
            <TabsTrigger value="pending" className="text-[8px] sm:text-[10px] md:text-xs h-6 sm:h-7 md:h-auto">
              Ожидают ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="text-[8px] sm:text-[10px] md:text-xs h-6 sm:h-7 md:h-auto">
              Принятые ({acceptedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-[8px] sm:text-[10px] md:text-xs h-6 sm:h-7 md:h-auto">
              Отклоненные ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {pendingRequests.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">Нет ожидающих заявок</p>
            ) : (
              pendingRequests.map(request => (
                <RequestItem key={request.id} request={request} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="accepted">
            {acceptedRequests.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">Нет принятых заявок</p>
            ) : (
              acceptedRequests.map(request => (
                <RequestItem key={request.id} request={request} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="rejected">
            {rejectedRequests.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">Нет отклоненных заявок</p>
            ) : (
              rejectedRequests.map(request => (
                <RequestItem key={request.id} request={request} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 