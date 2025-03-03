"use client";

import {
  getIncomingMentorshipRequestsForUI,
  getMentorDashboardStats,
  IncomingMentorshipRequest
} from "@/app/service/mentorship";
import { RequestList } from "@/components/request-list";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Mail, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function MentorDashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getMentorDashboardStats>> | null>(null);
  const [requests, setRequests] = useState<IncomingMentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashboardStats, incomingRequests] = await Promise.all([
        getMentorDashboardStats(),
        getIncomingMentorshipRequestsForUI()
      ]);

      setStats(dashboardStats);
      setRequests(incomingRequests);
    } catch (error) {
      console.error("Ошибка при загрузке данных панели управления:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-3 sm:py-4 md:py-8 px-2 sm:px-3 md:px-6 lg:px-8 flex items-center justify-center h-40 sm:h-48 md:h-64">
        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 sm:py-3 md:py-8 px-2 sm:px-3 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 md:mb-6 gap-1.5 sm:gap-2 md:gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Панель управления ментора</h1>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-6">
        <StatCard
          title="Всего студентов"
          value={stats?.totalStudents ?? 0}
          icon={<Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />}
          className="col-span-1"
        />
        <StatCard
          title="Всего заявок"
          value={stats?.totalRequests ?? 0}
          icon={<Mail className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500" />}
          className="col-span-1"
        />
        <StatCard
          title="Ожидающих заявок"
          value={stats?.pendingRequests ?? 0}
          icon={<XCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500" />}
          className="col-span-1"
        />
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-6">
        {/* Список заявок */}
        <div>
          <RequestList
            requests={requests}
            onStatusChange={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  );
}
