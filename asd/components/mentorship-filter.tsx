"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface MentorshipFilterProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function MentorshipFilter({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
}: MentorshipFilterProps) {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      <div className="w-full">
        <Input
          placeholder="Поиск по имени ментора..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm"
          size={30}
        />
      </div>
      <div className="flex flex-wrap gap-2 w-full">
        <div className="flex-1 min-w-[160px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full text-sm h-9">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все запросы</SelectItem>
              <SelectItem value="pending">В ожидании</SelectItem>
              <SelectItem value="accepted">Принятые</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={() => {
              setStatusFilter("all"); 
              setSearchQuery("");
            }}
            className="h-9 px-3 text-sm whitespace-nowrap"
            size="sm"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </div>
  );
} 