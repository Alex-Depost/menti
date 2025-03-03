'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface TourButtonProps {
  onClick: () => void;
  className?: string;
  tooltipText?: string;
}

export const TourButton: React.FC<TourButtonProps> = ({
  onClick,
  className = '',
  tooltipText = 'Start Tour',
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full ${className}`}
          onClick={onClick}
          aria-label="Start tour"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};