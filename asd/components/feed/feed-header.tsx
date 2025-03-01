"use client";

import { SearchInput } from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Filter, X } from "lucide-react";

interface FeedHeaderProps {
  isAuthenticated: boolean;
  tagFilter: string;
  setTagFilter: (value: string) => void;
  handleTagSearch: () => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  activeTags: string[];
  handleRemoveTag: (tag: string) => void;
  handleClearAllTags: () => void;
  allTags: string[];
  handleTagClick: (tag: string) => void;
}

export function MentorsFeedHeader({
  isAuthenticated,
  tagFilter,
  setTagFilter,
  handleTagSearch,
  showFilters,
  setShowFilters,
  activeTags,
  handleRemoveTag,
  handleClearAllTags,
  allTags,
  handleTagClick
}: FeedHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:flex" />
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
  );
}