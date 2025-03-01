"use client";

import { FeedResponse } from "@/app/service/feed";
import { MentorCard } from "@/components/mentor-card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Users, X } from "lucide-react";

interface FeedListProps {
  isLoading: boolean;
  feedData: FeedResponse;
  currentPage: number;
  handlePageChange: (page: number) => void;
  handleTagClick: (tag: string) => void;
  activeTags: string[];
  handleClearAllTags: () => void;
}

export function MentorsFeedList({
  isLoading,
  feedData,
  currentPage,
  handlePageChange,
  handleTagClick,
  activeTags,
  handleClearAllTags
}: FeedListProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden border bg-card">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted/60 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted/60 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted/60 rounded animate-pulse w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted/60 rounded animate-pulse w-2/3" />
                </div>
                <div className="flex gap-1.5 pt-2">
                  <div className="h-5 bg-muted/60 rounded-full animate-pulse w-16" />
                  <div className="h-5 bg-muted/60 rounded-full animate-pulse w-20" />
                  <div className="h-5 bg-muted/60 rounded-full animate-pulse w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feedData.items.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedData.items.map((item) => (
              <MentorCard key={item.id} item={item} onTagClick={handleTagClick} />
            ))}
          </div>
          {feedData.pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={feedData.pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-xl border border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <h3 className="text-xl font-medium mb-2">Менторы не найдены</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Попробуйте изменить параметры поиска или очистить фильтры, чтобы увидеть больше результатов
          </p>
          {activeTags.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAllTags}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Очистить все фильтры
            </Button>
          )}
        </div>
      )}
    </main>
  );
}