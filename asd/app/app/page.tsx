"use client";

import { MentorsFeedHeader } from "@/components/feed/feed-header";
import { MentorsFeedHero } from "@/components/feed/feed-hero";
import { MentorsFeedList } from "@/components/feed/feed-list";
import { UserFeedHeader } from "@/components/feed/user-feed-header";
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Check if auth is initialized
  useEffect(() => {
    // We consider auth loaded once we have a definitive value for isAuthenticated
    // This prevents the initial default state from triggering API calls
    if (auth.isAuthenticated !== undefined) {
      setIsAuthLoading(false);
    }
  }, [auth.isAuthenticated]);
  
  // Fetch feed based on user type
  const fetchFeed = useCallback(async (page: number = currentPage) => {
    // Don't fetch if auth is still loading
    if (isAuthLoading) return;
    
    setIsLoading(true);
    try {
      // If user is a mentor, show users feed
      // If user is a regular user, show mentors feed
      const data = isMentor
        ? await feedService.getUsersFeed(page, 10)
        : await feedService.getMentorsFeed(page, 10);
      
      setFeedData(data);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isMentor, isAuthLoading]);

  // Load initial data and refetch when auth state changes
  useEffect(() => {
    if (!isAuthLoading) {
      fetchFeed();
    }
    // Adding isAuthLoading to the dependency array ensures we only fetch
    // after auth state is determined
  }, [fetchFeed, isMentor, isAuthLoading]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchFeed(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchFeed(1);
  };

  // Render appropriate components based on user type
  if (isMentor) {
    // Mentors see users
    return (
      <>
        <UserFeedHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
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
    // Users see mentors
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
}