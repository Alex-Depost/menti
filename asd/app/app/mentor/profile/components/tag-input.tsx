"use client";

import React, { useState, useRef, KeyboardEvent, useEffect, FormEvent } from 'react';
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown, Plus } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  error?: string;
  maxTags?: number; // Maximum number of tags allowed
}

export function TagInput({
  value = [],
  onChange,
  suggestions,
  placeholder = "Добавить...",
  error,
  maxTags
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1); // Start with no active suggestion
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavigatingWithKeys, setIsNavigatingWithKeys] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "" && !isDropdownOpen) {
      setFilteredSuggestions([]);
      return;
    }
    
    // If dropdown is open, show all available suggestions that aren't already selected
    if (isDropdownOpen) {
      setFilteredSuggestions(suggestions.filter(suggestion => !value.includes(suggestion)));
      return;
    }
    
    // Otherwise filter based on input text
    const filtered = suggestions.filter(
      suggestion => suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
                   !value.includes(suggestion)
    );
    setFilteredSuggestions(filtered);
    
    // Reset active suggestion when not navigating with keys
    if (!isNavigatingWithKeys) {
      setActiveSuggestion(-1);
    }
    
    // Reset navigation state when input changes
    setIsNavigatingWithKeys(false);
  }, [inputValue, suggestions, value, isDropdownOpen, isNavigatingWithKeys]);

  const addTag = (tag: string) => {
    if (tag.trim() !== "" && !value.includes(tag)) {
      // Check if adding this tag would exceed the maximum
      if (maxTags !== undefined && value.length >= maxTags) {
        // If maxTags is set and we've reached the limit, replace the existing tag
        const newTags = [tag];
        onChange(newTags);
      } else {
        // Otherwise add the tag to the existing ones
        const newTags = [...value, tag];
        onChange(newTags);
      }
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  // Handle form submission (for mobile Enter key)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      addCurrentTag();
    }
  };

  // Add current input as tag
  const addCurrentTag = () => {
    if (inputValue.trim() === "") return;
    
    if (showSuggestions && filteredSuggestions.length > 0 && activeSuggestion >= 0) {
      // Add the selected suggestion
      addTag(filteredSuggestions[activeSuggestion]);
    } else {
      // Add the current input value as a tag
      addTag(inputValue.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag only on Enter, not on Space (to allow multi-word tags)
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      addCurrentTag();
    }
    
    // Add tag on comma (for comma-separated input)
    else if (e.key === "," && inputValue.trim() !== "") {
      e.preventDefault();
      // Remove the comma and add the tag
      addTag(inputValue.trim());
    }
    
    // Remove last tag on Backspace if input is empty
    else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
    
    // Navigate through suggestions
    else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setIsNavigatingWithKeys(true);
      setActiveSuggestion(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    }
    
    else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setIsNavigatingWithKeys(true);
      setActiveSuggestion(prev =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    }
    
    // Close suggestions on Escape
    else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setShowSuggestions(!isDropdownOpen);
    if (!isDropdownOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex flex-wrap gap-2 p-2 border rounded-md min-h-10 ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
            {tag}
            <X
              size={14}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            />
          </Badge>
        ))}
        
        <div className="flex flex-grow items-center relative">
          <div className="flex-grow overflow-hidden pr-20" onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim() !== "") {
              e.preventDefault();
              addCurrentTag();
            }
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
                setIsDropdownOpen(false);
              }}
              onFocus={() => {
                setShowSuggestions(true);
                setIsDropdownOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ""}
              className="w-full outline-none bg-transparent text-ellipsis overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              // Disable input if we've reached the maximum number of tags
              disabled={maxTags !== undefined && value.length >= maxTags}
            />
          </div>
          
          {/* Add button for mobile users */}
          {inputValue.trim() !== "" && (
            <button
              type="button"
              className="absolute right-8 p-1 rounded-md hover:bg-gray-100 focus:outline-none"
              aria-label="Add tag"
              onClick={(e) => {
                e.preventDefault();
                addCurrentTag();
              }}
            >
              <Plus size={18} />
            </button>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
            className="absolute right-0 p-1 rounded-md hover:bg-gray-100 focus:outline-none"
            aria-label="Show options"
          >
            <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      
      {(showSuggestions || isDropdownOpen) && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                isNavigatingWithKeys && index === activeSuggestion ? 'bg-gray-100' : ''
              }`}
              onClick={() => addTag(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}