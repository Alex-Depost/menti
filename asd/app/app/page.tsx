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
  const fetchInitialFeed = useCallback(async (page: number) => {
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
  }, [isMentor, isAuthLoading]);

  const fetchSearchResults = useCallback(async (page: number, query: string) => {
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

  // This effect handles all data fetching based on current state
  useEffect(() => {
    if (isAuthLoading) return;
    
    // This will run on initial load and whenever searchQuery or currentPage changes
    if (searchQuery.trim()) {
      fetchSearchResults(currentPage, searchQuery);
    } else {
      fetchInitialFeed(currentPage);
    }
  }, [fetchInitialFeed, fetchSearchResults, isAuthLoading, searchQuery, currentPage]);

  const handlePageChange = (page: number) => {
    // Just update the page state - the useEffect will handle the data fetching
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // No need to call fetchSearchResults directly
    // The useEffect will handle it when searchQuery changes
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