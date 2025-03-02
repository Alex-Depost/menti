"use client";

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  error?: string;
}

export function TagInput({
  value = [],
  onChange,
  suggestions,
  placeholder = "Добавить...",
  error
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    setActiveSuggestion(0);
  }, [inputValue, suggestions, value, isDropdownOpen]);

  const addTag = (tag: string) => {
    if (tag.trim() !== "" && !value.includes(tag)) {
      const newTags = [...value, tag];
      onChange(newTags);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or Space
    if ((e.key === "Enter" || e.key === " ") && inputValue.trim() !== "") {
      e.preventDefault();
      
      if (showSuggestions && filteredSuggestions.length > 0) {
        // Add the selected suggestion
        addTag(filteredSuggestions[activeSuggestion]);
      } else {
        // Add the current input value as a tag
        addTag(inputValue.trim());
      }
    }
    
    // Remove last tag on Backspace if input is empty
    else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
    
    // Navigate through suggestions
    else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    }
    
    else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
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
        
        <div className="flex flex-grow items-center">
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
            className="flex-grow min-w-[120px] outline-none bg-transparent"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
            className="ml-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none"
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
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${index === activeSuggestion ? 'bg-gray-100' : ''}`}
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