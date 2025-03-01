import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        if (totalPages <= 5) return i + 1;

        if (currentPage <= 3) return i + 1;
        if (currentPage >= totalPages - 2) return totalPages - 4 + i;

        return currentPage - 2 + i;
    });

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {currentPage > 3 && totalPages > 5 && (
                <>
                    <Button variant="outline" onClick={() => onPageChange(1)}>
                        1
                    </Button>
                    {currentPage > 4 && <span className="mx-1">...</span>}
                </>
            )}

            {pages.map(page => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
                <>
                    {currentPage < totalPages - 3 && <span className="mx-1">...</span>}
                    <Button variant="outline" onClick={() => onPageChange(totalPages)}>
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
