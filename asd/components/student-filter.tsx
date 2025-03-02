"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StudentFilterProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  requestTypeFilter: string;
  setRequestTypeFilter: (type: string) => void;
}

export function StudentFilter({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  requestTypeFilter,
  setRequestTypeFilter
}: StudentFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
      <div className="w-full">
        <Input
          placeholder="Поиск по имени студента..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm h-8 sm:h-9"
          size={30}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full">
        <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs sm:text-sm">Все статусы</SelectItem>
              <SelectItem value="active" className="text-xs sm:text-sm">Активные</SelectItem>
              <SelectItem value="pending" className="text-xs sm:text-sm">Ожидают начала</SelectItem>
              <SelectItem value="inactive" className="text-xs sm:text-sm">Приостановленные</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
          <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
            <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
              <SelectValue placeholder="Тип запроса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs sm:text-sm">Все типы</SelectItem>
              <SelectItem value="incoming" className="text-xs sm:text-sm">Входящие</SelectItem>
              <SelectItem value="outgoing" className="text-xs sm:text-sm">Исходящие</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Button 
            variant="outline" 
            onClick={() => {
              setStatusFilter("all"); 
              setSearchQuery("");
              setRequestTypeFilter("all");
            }}
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
            size="sm"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </div>
  );
} 