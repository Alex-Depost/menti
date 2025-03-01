"use client"
import { MentorSidebar } from "@/components/mentor-sidebar"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import Link from "next/link"
import authService from "./service/auth"
import { useState, useEffect } from "react"
import feedService, { FeedResponse } from "./service/feed"
import { MentorCard } from "@/components/mentor-card"
import { Pagination } from "@/components/ui/pagination"
import { SearchInput } from "@/components/search-input"

export default function Page() {
  const [feedData, setFeedData] = useState<FeedResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [tagFilter, setTagFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeed = async (page: number = currentPage, tag: string = tagFilter) => {
    setIsLoading(true);
    try {
      const data = await feedService.getFeed(page, 10, tag);
      setFeedData(data);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFeed(page);
  };

  const handleTagClick = (tag: string) => {
    setTagFilter(tag);
    setCurrentPage(1);
    fetchFeed(1, tag);
  };

  const handleTagSearch = () => {
    setCurrentPage(1);
    fetchFeed(1);
  };

  return (
    <SidebarProvider>
      <MentorSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold flex items-center gap-2">
                <SearchInput
                  value={tagFilter}
                  onChange={setTagFilter}
                  onSearch={handleTagSearch}
                />
              </div>
              {
                !authService.isAuthenticated() ?
                  <Link href="/auth/signin" className="flex items-center gap-1 hover:text-indigo-200">
                    Войти
                  </Link> : <p></p>
              }
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-video h-36 w-full rounded-lg bg-muted/50 animate-pulse"
              />
            ))
          ) : feedData.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <h3 className="text-xl font-medium">No mentors found</h3>
              <p className="text-muted-foreground mt-2">Try changing your search filters</p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}