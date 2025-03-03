"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AVATAR_URL } from "@/app/service/config";
import {
  getOutgoingMentorshipRequestsForUI,
  MentorshipRequestDisplay,
  cancelMentorshipRequest
} from "@/app/service/mentorship";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

export default function UserOutgoingPage() {
  const router = useRouter();
  const { isAuthenticated, isUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MentorshipRequestDisplay[]>([]);
  const [cancellingRequestId, setCancellingRequestId] = useState<number | null>(null);

  useEffect(() => {
    async function loadRequests() {
      if (!isAuthenticated || !isUser) {
        return;
      }

      try {
        const data = await getOutgoingMentorshipRequestsForUI();
        setRequests(data);
      } catch (err) {
        toast.error("Не удалось загрузить исходящие заявки");
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

  const handleCancel = async (requestId: number) => {
    setCancellingRequestId(requestId);
    try {
      const success = await cancelMentorshipRequest(requestId);
      if (success) {
        toast.success("Заявка отменена");
        // Update the request status in the UI
        setRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId ? { ...req, status: 'rejected' } : req
          )
        );
      } else {
        toast.error("Не удалось отменить заявку");
      }
    } catch (error) {
      toast.error("Произошла ошибка при отмене заявки");
      console.error(error);
    } finally {
      setCancellingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Исходящие заявки</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Исходящие заявки</h1>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              У вас пока нет исходящих заявок к менторам
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const avatarColor = generatePastelColor(request.receiver_name || '');

            return (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border border-border/50">
                      {request.receiver_avatar && (
                        <AvatarImage
                          src={`${AVATAR_URL}/${request.receiver_avatar}`}
                          alt={request.receiver_name || ''}
                        />
                      )}
                      <AvatarFallback
                        className="text-primary-foreground text-sm font-medium"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(request.receiver_name || '')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{request.receiver_name}</h3>
                          {request.receiver_description && (
                            <p className="text-sm font-medium text-primary mt-1">{request.receiver_description}</p>
                          )}
                          {request.receiver_university && (
                            <p className="text-sm text-muted-foreground mt-1">{request.receiver_university}</p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-muted/30 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          {request.status === 'pending' && (
                            <div className="text-sm text-amber-600 font-medium">
                              Ожидает ответа
                            </div>
                          )}

                          {request.status === 'accepted' && (
                            <div className="text-sm text-green-600 font-medium">
                              Заявка принята
                            </div>
                          )}

                          {request.status === 'rejected' && (
                            <div className="text-sm text-muted-foreground">
                              Заявка отклонена
                            </div>
                          )}
                        </div>
                      </div>
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