"use client";

import { MentorsFeedHeader } from "@/components/feed/feed-header";
import { MentorsFeedHero } from "@/components/feed/feed-hero";
import { MentorsFeedList } from "@/components/feed/feed-list";
import { useCallback, useEffect, useState } from "react";
import feedService, { FeedResponse } from "../service/feed";

export default function FeedPage() {
  const [feedData, setFeedData] = useState<FeedResponse>({
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const fetchFeed = useCallback(async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const data = await feedService.getFeed(page, 10);
      setFeedData(data);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFeed(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFeed(1);
  };

  return (
    <>
      <MentorsFeedHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
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