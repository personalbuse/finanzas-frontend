import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function SkeletonBase({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClass = 'skeleton';
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'rectangular' ? 'rounded-lg' : 'rounded';
  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export const Skeleton = memo(SkeletonBase);

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-16 h-5" />
          </div>
          <Skeleton className="w-full h-4" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-8" />
            <Skeleton className="flex-1 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
