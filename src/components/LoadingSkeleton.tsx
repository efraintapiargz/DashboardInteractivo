export interface LoadingSkeletonProps {
  lines?: number;
  showBlock?: boolean;
}

export function LoadingSkeleton({ lines = 3, showBlock = false }: LoadingSkeletonProps) {
  return (
    <div className="p-4" role="status" aria-label="Loading content">
      {showBlock && (
        <div className="w-full h-[180px] mb-3 rounded bg-gradient-to-r from-bg via-border to-bg bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      )}
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-3.5 mb-2.5 rounded bg-gradient-to-r from-bg via-border to-bg bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${i === lines - 1 ? 'w-3/5' : ''}`}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
