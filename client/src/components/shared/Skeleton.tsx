import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-surface-elevated", className)}
      aria-hidden="true"
    />
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="flex items-center gap-16">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-4 w-8" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-12" />
        </div>
      </div>
      <Skeleton className="w-[300px] aspect-square rounded-2xl" />
    </div>
  );
}
