import { useCallback } from 'react';
import styles from './ResetFiltersButton.module.css';

export interface ResetFiltersButtonProps {
  onReset: () => void;
}

/**
 * Button to reset all dashboard filters to their defaults.
 * Accessible with keyboard focus ring and proper labeling.
 */
export function ResetFiltersButton({ onReset }: ResetFiltersButtonProps) {
  const handleClick = useCallback(() => {
    onReset();
  }, [onReset]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onReset();
      }
    },
    [onReset],
  );

  return (
    <button
      type="button"
      className={styles.resetButton}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Reset all filters to default values"
    >
      Reset Filters
    </button>
  );
}
