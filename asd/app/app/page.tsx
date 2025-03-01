"use client";

import { useEffect, useState } from "react";
import { authService } from "../service/auth";
import feedService, { FeedResponse } from "../service/feed";
import { MentorsFeedHeader } from "@/components/feed/feed-header";
import { MentorsFeedHero } from "@/components/feed/feed-hero";
import { MentorsFeedList } from "@/components/feed/feed-list";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const fetchFeed = async (page: number = currentPage) => {
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFeed(1);
  };

  return (
    <>
      <MentorsFeedHeader
        isAuthenticated={isAuthenticated}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      <MentorsFeedHero isAuthenticated={isAuthenticated} />
      <MentorsFeedList
        isLoading={isLoading}
        feedData={feedData}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
    </>
  );
}