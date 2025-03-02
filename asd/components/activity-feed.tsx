"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorDashboardStats } from "@/app/service/mentorship";

interface ActivityFeedProps {
  activities: MentorDashboardStats["recentActivity"];
  className?: string;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-1.5 sm:pb-2 px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">Последние активности</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
          <p className="text-xs text-muted-foreground">Нет недавних активностей</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="py-2 px-2 sm:py-3 sm:px-3 md:py-4 md:px-4 pb-1.5 sm:pb-2">
        <CardTitle className="text-base sm:text-lg md:text-xl font-semibold">Последние активности</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity, index) => {
            const formattedTime = formatDistanceToNow(new Date(activity.date), {
              addSuffix: true,
              locale: ru,
            });

            const getActivityColor = (action: string) => {
              if (action.includes("Новый запрос")) return "text-blue-500";
              if (action.includes("принят")) return "text-green-500";
              if (action.includes("отклонен")) return "text-red-500";
              if (action.includes("завершена")) return "text-purple-500";
              if (action.includes("приостановлено")) return "text-yellow-500";
              return "text-muted-foreground";
            };
            
            return (
              <div 
                key={index} 
                className="flex flex-col py-1.5 px-2 sm:py-2 sm:px-3 md:py-3 md:px-4 hover:bg-muted/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] sm:text-xs md:text-sm font-medium truncate ${getActivityColor(activity.action)}`}>
                      {activity.action}
                    </p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground truncate">
                      {activity.user}
                    </p>
                  </div>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground ml-1 sm:ml-2 whitespace-nowrap">
                    {formattedTime}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 