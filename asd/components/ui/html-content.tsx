'use client';

import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

interface HtmlContentProps {
  html: string;
  className?: string;
}

export function HtmlContent({ html, className }: HtmlContentProps) {
  // Sanitize the HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html);
  
  return (
    <div 
      className={cn('prose prose-sm dark:prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
    />
  );
}