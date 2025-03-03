"use client";

import {
  getOutgoingMentorshipRequestsForUI,
  MentorshipRequestDisplay,
  acceptMentorshipRequest,
  RequestApproveResponse
} from "@/app/service/mentorship";
import notificationService from "@/app/service/notification";
import { ReceiverCard } from "@/components/receiver-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Filter, Loader2, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function MentorOutgoingPage() {
  const router = useRouter();
  const { isAuthenticated, isUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MentorshipRequestDisplay[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactInfo, setContactInfo] = useState<Record<number, { email?: string; telegram_link?: string }>>({});

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadRequests = async () => {
    if (!isAuthenticated || isUser) {
      return;
    }

    try {
      setIsRefreshing(true);
      const data = await getOutgoingMentorshipRequestsForUI();
      setRequests(data);

      // Reset notification state for outgoing requests
      notificationService.resetNotificationState();

      // Extract contact info from accepted requests
      const contactInfoMap: Record<number, { email?: string; telegram_link?: string }> = {};

      data.filter(req => req.status === 'accepted').forEach(request => {
        try {
          // Only add contact info if email exists
          if (request.receiver) {
            const contactInfo: { email?: string; telegram_link?: string } = {};
            if (request.receiver.email) {
              contactInfo.email = request.receiver.email;
            }

            if (request.receiver.telegram_link) {
              contactInfo.telegram_link = request.receiver.telegram_link;
            }

            contactInfoMap[request.id] = contactInfo;
          } else if (request.receiver_email) {
            const contactInfo: { email: string; telegram_link?: string } = {
              email: request.receiver_email
            };

            contactInfoMap[request.id] = contactInfo;
          }
        } catch (error) {
          console.error(`Failed to get contact info for request ${request.id}:`, error);
        }
      });

      setContactInfo(contactInfoMap);
    } catch (err) {
      toast.error("Не удалось загрузить исходящие заявки");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [isAuthenticated, isUser, router]);

  const handleRefresh = () => {
    loadRequests();
  };

  // Filter and search functionality
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }

      // Search filter (case insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (request.receiver_name?.toLowerCase().includes(query) || false) ||
          (request.message.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  // Count requests by status
  const requestCounts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
  }, [requests]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-8">
        <h1 className="text-2xl font-bold mb-6">Исходящие заявки</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Исходящие заявки</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start md:self-auto"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Обновить
        </Button>
      </div>

      {/* Filter section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск по имени или сообщению..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Все заявки <Badge variant="outline" className="ml-2">{requestCounts.all}</Badge>
                  </SelectItem>
                  <SelectItem value="pending">
                    Ожидающие <Badge variant="outline" className="ml-2">{requestCounts.pending}</Badge>
                  </SelectItem>
                  <SelectItem value="accepted">
                    Принятые <Badge variant="outline" className="ml-2">{requestCounts.accepted}</Badge>
                  </SelectItem>
                  <SelectItem value="rejected">
                    Отклоненные <Badge variant="outline" className="ml-2">{requestCounts.rejected}</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center">
            {requests.length === 0 ? (
              <>
                <div className="rounded-full bg-muted p-3 mb-4">
                  <RefreshCw className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Нет исходящих заявок</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  У вас пока нет исходящих заявок к пользователям. Найдите интересующих вас пользователей и отправьте им заявку на менторство.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="mt-2"
                >
                  Перейти к поиску пользователей
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Нет совпадений</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Нет заявок, соответствующих выбранным фильтрам. Попробуйте изменить параметры поиска или фильтрации.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-4"
                >
                  Сбросить фильтры
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            return (
              <div key={request.id} className="space-y-2">
                <ReceiverCard
                  request={request}
                  showActions={false}
                  contactInfo={request.status === 'accepted' ? contactInfo[request.id] : undefined}
                />

                {request.status === 'pending' && (
                  <div className="mt-2 text-sm text-amber-600 font-medium text-right">
                    Ожидает ответа
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="mt-2 text-sm text-green-600 font-medium text-right">
                    Заявка принята
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="mt-2 text-sm text-muted-foreground text-right">
                    Заявка отклонена
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}