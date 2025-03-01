import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
}

export function SearchInput({ value, onChange, onSearch }: SearchInputProps) {
    const [inputValue, setInputValue] = useState(value);

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
        <div className="relative flex w-full max-w-xs items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search by tag..."
                className="w-full pl-8 pr-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {inputValue && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-full"
                    onClick={handleClear}
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </Button>
            )}
        </div>
    );
}
