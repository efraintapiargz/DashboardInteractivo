import { useState, useCallback } from 'react';

const MAX_NEO_RANGE_DAYS = 7;

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

// Difference in days between two date strings
function daysBetween(start: string, end: string): number {
  const msPerDay = 86_400_000;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / msPerDay);
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = useCallback(
    (start: string, end: string): boolean => {
      if (!start || !end) {
        setValidationError(null);
        return true;
      }
      if (new Date(end) < new Date(start)) {
        setValidationError('End date must be after start date.');
        return false;
      }
      if (daysBetween(start, end) > MAX_NEO_RANGE_DAYS) {
        setValidationError(
          `Date range cannot exceed ${MAX_NEO_RANGE_DAYS} days for NEO data.`,
        );
        return false;
      }
      setValidationError(null);
      return true;
    },
    [],
  );

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = e.target.value;
      if (validate(newStart, endDate)) {
        onStartDateChange(newStart);
      }
    },
    [endDate, onStartDateChange, validate],
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEnd = e.target.value;
      if (validate(startDate, newEnd)) {
        onEndDateChange(newEnd);
      }
    },
    [startDate, onEndDateChange, validate],
  );

  const errorId = 'date-range-error';

  return (
    <div
      className="flex flex-wrap gap-2 items-end"
      role="group"
      aria-label="Date range picker"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="start-date" className="font-mono text-xs uppercase tracking-wide text-text-secondary">
          Start Date
        </label>
        <input
          id="start-date"
          type="date"
          className="px-3 py-2 border border-border rounded-md bg-surface text-text-primary font-mono text-sm transition-colors focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/25 [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
          value={startDate}
          onChange={handleStartChange}
          aria-label="Start date"
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="end-date" className="font-mono text-xs uppercase tracking-wide text-text-secondary">
          End Date
        </label>
        <input
          id="end-date"
          type="date"
          className="px-3 py-2 border border-border rounded-md bg-surface text-text-primary font-mono text-sm transition-colors focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/25 [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
          value={endDate}
          onChange={handleEndChange}
          aria-label="End date"
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
      </div>

      {validationError && (
        <p id={errorId} className="text-error text-xs mt-1 font-sans" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
