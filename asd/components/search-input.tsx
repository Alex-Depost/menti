import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
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
            onSearch();
        }
    };

    const handleClear = () => {
        setInputValue('');
        onChange('');
        onSearch();
    };

    return (
        <div className={`relative flex w-full max-w-xs items-center transition-all duration-200 ${isFocused ? 'ring-2 ring-primary/20 rounded-md' : ''}`}>
            <div className={`absolute left-2.5 transition-all duration-200 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`}>
                <Search className="h-4 w-4" />
            </div>
            <Input
                type="text"
                placeholder="Поиск по тегам..."
                className="w-full pl-8 pr-10 border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {inputValue && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-full hover:bg-transparent"
                    onClick={handleClear}
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
            )}
        </div>
    );
}
