"use client";

import { MentorsFeedHero } from "@/components/feed/feed-hero";
import { MentorsFeedList } from "@/components/feed/feed-list";
import { UserFeedHero } from "@/components/feed/user-feed-hero";
import { UserFeedList } from "@/components/feed/user-feed-list";
import { SearchInput } from "@/components/search-input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (auth.isAuthenticated !== undefined) {
      setIsAuthLoading(false);
    }
  }, [auth.isAuthenticated]);
  
  // Separate fetch functions for initial load and search
  const fetchInitialFeed = useCallback(async (page: number = currentPage) => {
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

  const fetchSearchResults = useCallback(async (page: number = 1, query: string) => {
    if (isAuthLoading || !query.trim()) return;
    
    setIsLoading(true);
    try {
      const data = isMentor
        ? await feedService.getUsersFeed(page, 10, query)
        : await feedService.getMentorsFeed(page, 10, query);
      
      setFeedData(data);
      setCurrentPage(data.page);
    } catch (error) {
      setError('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  }, [isMentor, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchInitialFeed();
    }
  }, [fetchInitialFeed, isAuthLoading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Use the appropriate fetch function based on whether we're searching or not
    if (searchQuery.trim()) {
      fetchSearchResults(page, searchQuery);
    } else {
      fetchInitialFeed(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchSearchResults(1, query);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const renderSearchInput = () => (
    <SearchInput
      value={searchQuery}
      onChange={handleSearchChange}
      onSearch={handleSearch}
    />
  );

  if (isMentor) {
    return (
      <>
        {renderSearchInput()}
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
        {renderSearchInput()}
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