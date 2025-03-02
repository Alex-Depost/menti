"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { IncomingMentorshipRequest, getIncomingMentorshipRequests } from "@/app/service/mentorship";
import { IncomingRequestCard } from "@/components/incoming-request-card";
import { MentorshipFilter } from "@/components/mentorship-filter"; 
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IncomingMentorshipPage() {
  const [requests, setRequests] = useState<IncomingMentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getIncomingMentorshipRequests();
      setRequests(data);
    } catch (error) {
      console.error("Ошибка при загрузке входящих запросов на менторство:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Фильтрация по статусу
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }
      
      // Фильтрация по поисковому запросу
      if (
        searchQuery &&
        !request.user_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  // Группировка запросов по статусу для вкладок
  const pendingRequests = requests.filter((req) => req.status === "pending");
  const acceptedRequests = requests.filter((req) => req.status === "accepted");
  const rejectedRequests = requests.filter((req) => req.status === "rejected");

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-3 sm:py-8 sm:px-6 lg:px-8 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Входящие запросы на менторство</h1>
      
      {requests.length === 0 ? (
        <EmptyState
          title="Запросов пока нет"
          description="У вас еще нет входящих запросов на менторство от пользователей."
          actionLabel="На главную"
          actionHref="/app"
        />
      ) : (
        <>
          <MentorshipFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start sm:justify-center p-0.5 sm:p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Все ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Ожидающие ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="text-xs sm:text-sm">
                Принятые ({acceptedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs sm:text-sm">
                Отклоненные ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredRequests.length === 0 ? (
                <EmptyState
                  title="Ничего не найдено"
                  description="Попробуйте изменить параметры фильтрации"
                  actionLabel="Сбросить фильтры"
                  onAction={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {filteredRequests.map((request) => (
                    <IncomingRequestCard
                      key={request.id}
                      request={request}
                      onStatusChange={fetchRequests}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <EmptyState
                  title="Нет ожидающих запросов"
                  description="У вас нет запросов на менторство в статусе ожидания"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {pendingRequests.map((request) => (
                    <IncomingRequestCard
                      key={request.id}
                      request={request}
                      onStatusChange={fetchRequests}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="accepted">
              {acceptedRequests.length === 0 ? (
                <EmptyState
                  title="Нет принятых запросов"
                  description="У вас еще нет принятых запросов на менторство"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {acceptedRequests.map((request) => (
                    <IncomingRequestCard
                      key={request.id}
                      request={request}
                      onStatusChange={fetchRequests}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rejected">
              {rejectedRequests.length === 0 ? (
                <EmptyState
                  title="Нет отклоненных запросов"
                  description="У вас нет отклоненных запросов на менторство"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {rejectedRequests.map((request) => (
                    <IncomingRequestCard
                      key={request.id}
                      request={request}
                      onStatusChange={fetchRequests}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}