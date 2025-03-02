"use client";

import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Filter } from "lucide-react";

interface UserFeedHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  handleSearch: () => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

export function UserFeedHeader({
  searchQuery,
  setSearchQuery,
  handleSearch,
  showFilters,
  setShowFilters
}: UserFeedHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:flex" />
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
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
        </div>
      </div>
    </header>
  );
}