"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AVATAR_URL } from "@/app/service/config";
import { 
  getIncomingMentorshipRequestsForUI, 
  MentorshipRequestDisplay, 
  acceptMentorshipRequest, 
  rejectMentorshipRequest 
} from "@/app/service/mentorship";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export default function MentorInboxPage() {
  const router = useRouter();
  const { isAuthenticated, isUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MentorshipRequestDisplay[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  useEffect(() => {
    async function loadRequests() {
      if (!isAuthenticated || isUser) {
        return;
      }

      try {
        const data = await getIncomingMentorshipRequestsForUI();
        setRequests(data);
      } catch (err) {
        toast.error("Не удалось загрузить входящие заявки");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [isAuthenticated, isUser, router]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a consistent pastel color based on the name
  const generatePastelColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate pastel color (higher lightness, lower saturation)
    const h = hash % 360;
    return `hsl(${h}, 70%, 85%)`;
  };

  const handleAccept = async (requestId: number) => {
    setProcessingRequestId(requestId);
    try {
      const success = await acceptMentorshipRequest(requestId);
      if (success) {
        toast.success("Заявка принята");
        // Update the request status in the UI
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === requestId ? { ...req, status: 'accepted' } : req
          )
        );
      } else {
        toast.error("Не удалось принять заявку");
      }
    } catch (error) {
      toast.error("Произошла ошибка при обработке заявки");
      console.error(error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setProcessingRequestId(requestId);
    try {
      const success = await rejectMentorshipRequest(requestId);
      if (success) {
        toast.success("Заявка отклонена");
        // Update the request status in the UI
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === requestId ? { ...req, status: 'rejected' } : req
          )
        );
      } else {
        toast.error("Не удалось отклонить заявку");
      }
    } catch (error) {
      toast.error("Произошла ошибка при обработке заявки");
      console.error(error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-8">
        <h1 className="text-2xl font-bold mb-6">Входящие заявки</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-6">Входящие заявки</h1>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              У вас пока нет входящих заявок от пользователей
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const avatarColor = generatePastelColor(request.sender_name || '');
            const isProcessing = processingRequestId === request.id;
            
            return (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border border-border/50">
                      {request.sender_avatar && (
                        <AvatarImage
                          src={`${AVATAR_URL}/${request.sender_avatar}`}
                          alt={request.sender_name || ''}
                        />
                      )}
                      <AvatarFallback
                        className="text-primary-foreground text-sm font-medium"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(request.sender_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.sender_name}</h3>
                          <p className="text-sm text-muted-foreground">{request.sender_email}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-muted/50 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                            Отклонить
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                            Принять
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'accepted' && (
                        <div className="mt-4 text-sm text-green-600 font-medium">
                          Заявка принята
                        </div>
                      )}
                      
                      {request.status === 'rejected' && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          Заявка отклонена
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}