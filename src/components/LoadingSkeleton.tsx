import styles from './LoadingSkeleton.module.css';

export interface LoadingSkeletonProps {
  /** Number of text lines to render (default 3) */
  lines?: number;
  /** Whether to show a large block placeholder (e.g. for charts) */
  showBlock?: boolean;
}

/**
 * Animated pulse skeleton used as a placeholder while data loads.
 */
export function LoadingSkeleton({ lines = 3, showBlock = false }: LoadingSkeletonProps) {
  return (
    <div className={styles.skeletonWrapper} role="status" aria-label="Loading content">
      {showBlock && <div className={styles.skeletonBlock} />}
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={
            i === lines - 1 ? styles.skeletonLineShort : styles.skeletonLine
          }
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
