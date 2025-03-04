import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (query: string) => void;
}

export function SearchInput({ value, onChange, onSearch }: SearchInputProps) {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    // Update local state when prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onChange(inputValue);
            onSearch(inputValue);
        }
    };

    const handleClear = () => {
        setInputValue('');
        onChange('');
        onSearch('');
    };

    const handleSearchClick = () => {
        onChange(inputValue);
        onSearch(inputValue);
    };

    return (
        <div className="w-full sticky top-0 z-10" data-tour="search-input">
            <div className="bg-primary/5 border-b shadow-sm">
                <div className="container mx-auto">
                    <div className="flex items-center h-16 sm:h-18 px-2 sm:px-4 py-2">
                        <div className="w-full sm:w-auto sm:max-w-md lg:max-w-lg xl:max-w-xl">
                            <div className="relative flex items-center">
                                <div className="absolute left-2 sm:left-3 text-primary">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Нейро-поиск..."
                                    className="w-full pl-8 sm:pl-10 pr-16 sm:pr-24 py-4 sm:py-6 text-sm sm:text-base border border-primary/30 bg-background shadow-sm rounded-md focus-visible:ring-1 focus-visible:ring-primary min-h-[44px] sm:min-h-[48px]"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                                <div className="absolute right-1 flex items-center">
                                    {inputValue && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 sm:h-9 sm:w-9 mr-0 sm:mr-1 text-muted-foreground hover:text-foreground"
                                            onClick={handleClear}
                                        >
                                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleSearchClick}
                                        disabled={!inputValue.trim()}
                                        className="h-8 sm:h-9 text-xs sm:text-sm bg-primary hover:bg-primary/90 px-3 sm:px-4"
                                    >
                                        <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                                        <span className="hidden xs:inline">Поиск</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1"></div> {/* Spacer to push content to the left */}
                    </div>
                </div>
            </div>
        </div>
    );
}
