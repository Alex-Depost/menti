"use client";

import { MentorsFeedHero } from "@/components/feed/feed-hero";
import { MentorsFeedList } from "@/components/feed/feed-list";
import { UserFeedHero } from "@/components/feed/user-feed-hero";
import { UserFeedList } from "@/components/feed/user-feed-list";
import { useAuth } from "@/hooks/use-auth";
import { useCallback, useEffect, useState } from "react";
import feedService, { FeedResponse } from "../service/feed";

export default function FeedPage() {
  const auth = useAuth();
  const { isMentor } = auth;
  
  // Feed state
  const [feedData, setFeedData] = useState<FeedResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (auth.isAuthenticated !== undefined) {
      setIsAuthLoading(false);
    }
  }, [auth.isAuthenticated]);
  
  const fetchFeed = useCallback(async (page: number = currentPage) => {
    if (isAuthLoading) return;
    
    setIsLoading(true);
    try {
      const data = isMentor
        ? await feedService.getUsersFeed(page, 10)
        : await feedService.getMentorsFeed(page, 10);
      
      setFeedData(data);
      setCurrentPage(data.page);
    } catch (error) {
      setError('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isMentor, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchFeed();
    }
  }, [fetchFeed, isMentor, isAuthLoading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFeed(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  if (isMentor) {
    return (
      <>
        <UserFeedHero />
        <UserFeedList
          isLoading={isLoading}
          feedData={feedData}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </>
    );
  } else {
    return (
      <>
        <MentorsFeedHero />
        <MentorsFeedList
          isLoading={isLoading}
          feedData={feedData}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      </>
    );
  }
}