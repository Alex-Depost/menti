"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, BarChart3, Mail, CheckCircle, XCircle, BookOpenCheck } from "lucide-react";
import {
  getMentorDashboardStats,
  getIncomingMentorshipRequests,
  getIncomingMentorshipRequestsForUI,
  IncomingMentorshipRequest
} from "@/app/service/mentorship";
import { StatCard } from "@/components/stat-card";
import { ActivityFeed } from "@/components/activity-feed";
import { RequestList } from "@/components/request-list";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto justify-end mt-1 sm:mt-0">
          <Button size="sm" className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3" variant="outline">
            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1" /> Отчеты
          </Button>
          <Button size="sm" className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9 px-1.5 sm:px-2 md:px-3">
            <BookOpenCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1" /> Создать урок
          </Button>
        </div>
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
          title="Активных студентов"
          value={stats?.activeStudents ?? 0}
          icon={<CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500" />}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
        {/* Список заявок (на мобильных устройствах показываем первым) */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <RequestList 
            requests={requests} 
            onStatusChange={fetchDashboardData} 
          />
        </div>

        {/* Лента активности (на мобильных устройствах показываем вторым) */}
        <div className="order-1 lg:order-2 mb-2 lg:mb-0">
          <ActivityFeed activities={stats?.recentActivity ?? []} />
        </div>
      </div>
    </div>
  );
}
