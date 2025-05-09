"use client";

import { FeedResponse } from "@/app/service/feed";
import { MentorCard } from "@/components/mentor-card";
import { Pagination } from "@/components/ui/pagination";
import { Users } from "lucide-react";

interface FeedListProps {
  isLoading: boolean;
  feedData: FeedResponse;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

export function MentorsFeedList({
  isLoading,
  feedData,
  currentPage,
  handlePageChange
}: FeedListProps) {
  return (
    <main id="mentors-list" className="container mx-auto px-4 py-8" data-tour="feed-list">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden border bg-card p-5">
              {/* Header section with mentor info */}
              <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                <div className="w-16 h-16 rounded-full bg-muted/60 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted/60 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-9 bg-muted/60 rounded animate-pulse w-24" />
              </div>

              {/* Resume content section */}
              <div className="mt-4 space-y-4">
                {/* Title and description */}
                <div className="space-y-2">
                  <div className="h-5 bg-muted/60 rounded animate-pulse w-1/2" />
                  <div className="space-y-1">
                    <div className="h-4 bg-muted/60 rounded animate-pulse w-full" />
                    <div className="h-4 bg-muted/60 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : feedData.items.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedData.items.map((item) => (
              <MentorCard key={item.id} item={item} />
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
            Попробуйте изменить параметры поиска, чтобы увидеть больше результатов
          </p>
        </div>
      )}
    </main>
  );
}