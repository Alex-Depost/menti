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
import { Check, Filter, Loader2, Mail, RefreshCw, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function UserInboxPage() {
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
    if (!isAuthenticated || !isUser) {
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


  const [contactInfo, setContactInfo] = useState<Record<number, { email: string; telegram_link?: string }>>({});

  const handleAccept = async (requestId: number) => {
    setProcessingRequestId(requestId);
    try {
      const result = await acceptMentorshipRequest(requestId);
      if (result && typeof result !== 'boolean') {
        toast.success("Заявка принята");
        // Update the request status in the UI
        setRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId ? { ...req, status: 'accepted' } : req
          )
        );
        // Store contact info
        setContactInfo(prev => ({
          ...prev,
          [requestId]: result.contact_info
        }));
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
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center">
            {requests.length === 0 ? (
              <>
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Loader2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Нет входящих заявок</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  У вас пока нет входящих заявок от менторов. Заявки появятся здесь, когда менторы захотят начать с вами сотрудничество.
                </p>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-2"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Проверить наличие заявок
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
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="text-sm text-green-600 font-medium">
                      Заявка принята
                    </div>
                    {contactInfo[request.id] && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `mailto:${contactInfo[request.id].email}?subject=Менторство&body=Здравствуйте! Я принял(а) вашу заявку на менторство. Давайте обсудим детали сотрудничества.`}
                          className="flex items-center"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Связаться по email
                        </Button>
                        {contactInfo[request.id].telegram_link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`${contactInfo[request.id].telegram_link}?text=Здравствуйте! Я принял(а) вашу заявку на менторство. Давайте обсудим детали сотрудничества.`, '_blank')}
                            className="flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm3.93 5.84l-1.68 8.275a.75.75 0 01-1.188.386l-2.079-1.629-1.192 1.19a.75.75 0 01-1.276-.544l.001-.033V12.4l4.844-4.305a.75.75 0 00-.915-1.177l-5.947 3.968-2.242-.899a.75.75 0 01-.094-1.32l11.75-6.05a.75.75 0 011.02 1.024z" />
                            </svg>
                            Связаться в Telegram
                          </Button>
                        )}
                      </div>
                    )}
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