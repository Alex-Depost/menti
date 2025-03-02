"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { MentorStudent, getMentorStudents } from "@/app/service/mentorship";
import { StudentCard } from "@/components/student-card";
import { StudentFilter } from "@/components/student-filter"; 
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<MentorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getMentorStudents();
      setStudents(data);
    } catch (error) {
      console.error("Ошибка при загрузке студентов:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Фильтрация по статусу
      if (statusFilter !== "all" && student.status !== statusFilter) {
        return false;
      }
      
      // Фильтрация по типу запроса
      if (requestTypeFilter !== "all" && student.request_type !== requestTypeFilter) {
        return false;
      }
      
      // Фильтрация по поисковому запросу
      if (
        searchQuery &&
        !student.user_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      return true;
    });
  }, [students, statusFilter, searchQuery, requestTypeFilter]);

  // Группировка студентов по статусу для вкладок
  const activeStudents = students.filter((student) => student.status === "active");
  const pendingStudents = students.filter((student) => student.status === "pending");
  const inactiveStudents = students.filter((student) => student.status === "inactive");

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-3 md:px-6 lg:px-8 flex items-center justify-center h-48 sm:h-64">
        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 sm:py-4 md:py-8 px-2 sm:px-3 md:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Мои студенты</h1>
        <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
          <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Пригласить студента
        </Button>
      </div>
      
      {students.length === 0 ? (
        <EmptyState
          title="У вас пока нет студентов"
          description="Здесь будут отображаться ваши студенты, когда кто-то примет ваше приглашение или вы одобрите входящий запрос."
          actionLabel="Найти студентов"
          actionHref="/app"
        />
      ) : (
        <>
          <StudentFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            requestTypeFilter={requestTypeFilter}
            setRequestTypeFilter={setRequestTypeFilter}
          />
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-3 sm:mb-4 w-full overflow-x-auto flex-nowrap justify-start sm:justify-center p-0.5 sm:p-1 h-8 sm:h-9 min-h-8">
              <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-auto">
                Все ({students.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-auto">
                Активные ({activeStudents.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-auto">
                Ожидают ({pendingStudents.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-[10px] sm:text-xs md:text-sm h-7 sm:h-auto">
                Приостановлены ({inactiveStudents.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {filteredStudents.length === 0 ? (
                <EmptyState
                  title="Ничего не найдено"
                  description="Попробуйте изменить параметры фильтрации"
                  actionLabel="Сбросить фильтры"
                  onAction={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                    setRequestTypeFilter("all");
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onStatusChange={fetchStudents}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active">
              {activeStudents.length === 0 ? (
                <EmptyState
                  title="Нет активных студентов"
                  description="У вас пока нет активных студентов"
                />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                  {activeStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onStatusChange={fetchStudents}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {pendingStudents.length === 0 ? (
                <EmptyState
                  title="Нет ожидающих студентов"
                  description="У вас нет студентов, ожидающих начала менторства"
                />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                  {pendingStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onStatusChange={fetchStudents}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inactive">
              {inactiveStudents.length === 0 ? (
                <EmptyState
                  title="Нет приостановленных студентов"
                  description="У вас нет приостановленных или неактивных студентов"
                />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                  {inactiveStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onStatusChange={fetchStudents}
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
