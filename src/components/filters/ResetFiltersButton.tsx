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
      className="h-9 px-4 border border-slate-200 rounded-lg bg-white text-slate-600 text-sm cursor-pointer self-end hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/15"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Reset all filters to default values"
    >
      Reset Filters
    </button>
  );
}
