import { useState, useCallback } from 'react';

const MAX_RANGE_DAYS = 30;

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

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
      if (daysBetween(start, end) > MAX_RANGE_DAYS) {
        setValidationError(
          `Date range cannot exceed ${MAX_RANGE_DAYS} days.`,
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
      className="flex flex-wrap gap-3 items-end"
      role="group"
      aria-label="Date range picker"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="start-date" className="text-xs font-medium text-slate-600">
          Fecha inicio
        </label>
        <input
          id="start-date"
          type="date"
          className="h-9 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          value={startDate}
          onChange={handleStartChange}
          aria-label="Start date"
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
      </div>

      <span className="text-slate-300 text-sm pb-1.5">—</span>

      <div className="flex flex-col gap-1">
        <label htmlFor="end-date" className="text-xs font-medium text-slate-600">
          Fecha fin
        </label>
        <input
          id="end-date"
          type="date"
          className="h-9 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          value={endDate}
          onChange={handleEndChange}
          aria-label="End date"
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
      </div>

      {validationError && (
        <p id={errorId} className="text-red-600 text-xs self-center" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
