"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[9px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{title}</p>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{value}</h3>
            
            {trend && (
              <div className="flex items-center mt-0.5 sm:mt-1 md:mt-2">
                <span 
                  className={`text-[8px] sm:text-xs ${
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {trend.isPositive ? "+" : "-"}{trend.value}%
                </span>
                <span className="text-[7px] sm:text-[10px] md:text-xs text-muted-foreground ml-0.5 sm:ml-1">
                  с прошлого месяца
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="bg-primary/10 rounded-md p-1 sm:p-1.5 md:p-2">
              {icon}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground mt-1 sm:mt-2 md:mt-3">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 