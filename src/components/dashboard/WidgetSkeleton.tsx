'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WidgetSkeletonProps {
  /** Card title */
  title?: string;
  /** Number of content lines to show */
  lines?: number;
  /** Show chart placeholder */
  hasChart?: boolean;
  /** Show list items */
  listItems?: number;
  /** Custom className */
  className?: string;
}

/**
 * Universal skeleton loading state for dashboard widgets
 */
export function WidgetSkeleton({
  title,
  lines = 3,
  hasChart = false,
  listItems = 0,
  className = '',
}: WidgetSkeletonProps) {
  return (
    <Card className={`card-spiritual ${className}`}>
      {title && (
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {/* Content lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        
        {/* Chart placeholder */}
        {hasChart && (
          <div className="flex items-center justify-center h-32 mt-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )}
        
        {/* List items */}
        {listItems > 0 && (
          <div className="space-y-2 mt-4">
            {Array.from({ length: listItems }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WidgetSkeleton;
