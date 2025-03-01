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
  const [tagFilter, setTagFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

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
    <>
      <MentorsFeedHeader
        isAuthenticated={isAuthenticated}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        handleTagSearch={handleTagSearch}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeTags={activeTags}
        handleRemoveTag={handleRemoveTag}
        handleClearAllTags={handleClearAllTags}
        allTags={allTags}
        handleTagClick={handleTagClick}
      />

      <MentorsFeedHero />

      <MentorsFeedList
        isLoading={isLoading}
        feedData={feedData}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        handleTagClick={handleTagClick}
        activeTags={activeTags}
        handleClearAllTags={handleClearAllTags}
      />
    </>
  );
}