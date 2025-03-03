"use client";

import {
  acceptMentorshipRequest,
  getIncomingMentorshipRequestsForUI,
  MentorshipRequestDisplay,
  rejectMentorshipRequest
} from "@/app/service/mentorship";
import { SenderCard } from "@/components/sender-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Check, Filter, Loader2, RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function MentorInboxPage() {
  const router = useRouter();
  const { isAuthenticated, isUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MentorshipRequestDisplay[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRequests = async () => {
    if (!isAuthenticated || isUser) {
      return;
    }

    try {
      setIsRefreshing(true);
      const data = await getIncomingMentorshipRequestsForUI();
      setRequests(data);
    } catch (err) {
      toast.error("Не удалось загрузить входящие заявки");
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
          (request.sender_name?.toLowerCase().includes(query) || false) ||
          (request.sender_email?.toLowerCase().includes(query) || false) ||
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
        <h1 className="text-2xl font-bold mb-6">Входящие заявки</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Входящие заявки</h1>
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
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              {requests.length === 0
                ? "У вас пока нет входящих заявок от пользователей"
                : "Нет заявок, соответствующих выбранным фильтрам"}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const isProcessing = processingRequestId === request.id;

            return (
              <div key={request.id} className="space-y-2">
                <SenderCard request={request} showActions={false} />

                {request.status === 'pending' && (
                  <div className="flex justify-end gap-2 mt-2">
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