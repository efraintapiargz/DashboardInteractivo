import { useCallback } from 'react';

export interface ResetFiltersButtonProps {
  onReset: () => void;
}

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
      className="px-4 py-2 border border-border rounded-md bg-transparent text-accent-amber font-mono text-xs uppercase tracking-wide cursor-pointer transition-colors self-end hover:bg-accent-amber/10 hover:border-accent-amber focus-visible:outline-none focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/25"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Reset all filters to default values"
    >
      Reset Filters
    </button>
  );
}
