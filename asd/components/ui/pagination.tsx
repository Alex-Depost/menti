import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

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
        <div className="flex items-center justify-center space-x-1.5 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 rounded-md transition-all hover:bg-muted"
                aria-label="Предыдущая страница"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {currentPage > 3 && totalPages > 5 && (
                <>
                    <Button 
                        variant={currentPage === 1 ? "default" : "outline"}
                        onClick={() => onPageChange(1)}
                        className="h-9 w-9 rounded-md font-medium text-sm"
                        aria-label="Перейти на страницу 1"
                    >
                        1
                    </Button>
                    {currentPage > 4 && (
                        <span className="flex items-center justify-center w-9 h-9">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </span>
                    )}
                </>
            )}

            {pages.map(page => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => onPageChange(page)}
                    className={`h-9 w-9 rounded-md font-medium text-sm ${
                        currentPage === page 
                            ? 'shadow-sm' 
                            : 'hover:bg-muted transition-colors'
                    }`}
                    aria-label={`Перейти на страницу ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                >
                    {page}
                </Button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
                <>
                    {currentPage < totalPages - 3 && (
                        <span className="flex items-center justify-center w-9 h-9">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </span>
                    )}
                    <Button 
                        variant="outline" 
                        onClick={() => onPageChange(totalPages)}
                        className="h-9 w-9 rounded-md font-medium text-sm"
                        aria-label={`Перейти на страницу ${totalPages}`}
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 rounded-md transition-all hover:bg-muted"
                aria-label="Следующая страница"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
