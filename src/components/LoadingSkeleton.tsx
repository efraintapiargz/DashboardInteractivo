export interface LoadingSkeletonProps {
  lines?: number;
  showBlock?: boolean;
}

export function LoadingSkeleton({ lines = 3, showBlock = false }: LoadingSkeletonProps) {
  return (
    <div className="p-5" role="status" aria-label="Loading content">
      {showBlock && (
        <div className="w-full h-[200px] mb-3 rounded-lg bg-gradient-to-r from-border via-[#334155] to-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      )}
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 mb-3 rounded bg-gradient-to-r from-border via-[#334155] to-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] ${i === lines - 1 ? 'w-3/5' : ''}`}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
