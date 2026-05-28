'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-card">
      <Skeleton className="h-4 w-[50%]" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
  );
}

export function SkeletonNumeros() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
        <Skeleton className="h-8 w-12 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
      <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
        <Skeleton className="h-8 w-12 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
      <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
        <Skeleton className="h-8 w-12 mx-auto mb-2" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    </div>
  );
}

export function SkeletonCiclos() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-background/50 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-12 mb-2" />
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}