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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, X, Users, Sparkles } from "lucide-react"

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
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagClick = (tag: string) => {
    setTagFilter(tag);
    setCurrentPage(1);
    fetchFeed(1, tag);
    
    // Add to active tags if not already there
    if (!activeTags.includes(tag)) {
      setActiveTags([...activeTags, tag]);
    }
  };

  const handleTagSearch = () => {
    setCurrentPage(1);
    fetchFeed(1);
  };
  
  const handleRemoveTag = (tag: string) => {
    const newTags = activeTags.filter(t => t !== tag);
    setActiveTags(newTags);
    
    if (tagFilter === tag) {
      setTagFilter('');
      fetchFeed(1, '');
    }
  };
  
  const handleClearAllTags = () => {
    setActiveTags([]);
    setTagFilter('');
    fetchFeed(1, '');
  };

  // Get all unique tags from feed items
  const allTags = Array.from(
    new Set(
      feedData.items.flatMap(item => item.tags)
    )
  ).sort();

  return (
    <SidebarProvider>
      <MentorSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold hidden md:block">Найти ментора</h1>
                  <SearchInput
                    value={tagFilter}
                    onChange={setTagFilter}
                    onSearch={handleTagSearch}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="md:flex hidden items-center justify-center"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                
                {!authService.isAuthenticated() ? (
                  <Link 
                    href="/auth/signin" 
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Войти
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" className="text-sm">
                    Мой профиль
                  </Button>
                )}
              </div>
              
              {/* Active filters */}
              {activeTags.length > 0 && (
                <div className="flex items-center gap-2 py-1 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 flex-wrap">
                    {activeTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="flex items-center gap-1 py-1 px-2"
                      >
                        {tag}
                        <button 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {activeTags.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={handleClearAllTags}
                      >
                        Очистить все
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Filter dropdown */}
              {showFilters && (
                <div className="bg-card shadow-lg rounded-md p-3 border mt-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {allTags.map(tag => (
                    <Badge 
                      key={tag}
                      variant={tagFilter === tag ? "default" : "outline"}
                      className="cursor-pointer justify-center"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Hero section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Найдите своего идеального ментора</h1>
                <p className="text-muted-foreground text-lg mb-4">
                  Получите персональную поддержку от опытных профессионалов, которые помогут вам достичь ваших целей
                </p>
                <div className="flex gap-3">
                  <Button className="gap-2">
                    <Users className="h-4 w-4" />
                    Найти ментора
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Стать ментором
                  </Button>
                </div>
              </div>
              <div className="hidden md:block relative w-64 h-64">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary/70">Менторство</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
      </SidebarInset>
    </SidebarProvider>
  )
}