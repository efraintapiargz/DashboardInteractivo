import { useState, useCallback } from 'react';
import styles from './DateRangePicker.module.css';

const MAX_NEO_RANGE_DAYS = 7;

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

/**
 * Computes the difference in days between two date strings
 */
function daysBetween(start: string, end: string): number {
  const msPerDay = 86_400_000;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return Math.round((endMs - startMs) / msPerDay);
}

/**
 * DateRangePicker — two date inputs with validation (max 7 days for NEO).
 * Fully keyboard-navigable with proper ARIA attributes.
 */
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
      className={styles.dateRangePicker}
      role="group"
      aria-label="Date range picker"
    >
      <div className={styles.fieldGroup}>
        <label htmlFor="start-date" className={styles.label}>
          Start Date
        </label>
        <input
          id="start-date"
          type="date"
          className={styles.input}
          value={startDate}
          onChange={handleStartChange}
          aria-label="Start date"
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="end-date" className={styles.label}>
          End Date
        </label>
        <input
          id="end-date"
          type="date"
          className={styles.input}
          value={endDate}
          onChange={handleEndChange}
          aria-label="End date"
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? 'true' : undefined}
        />
      </div>

      {validationError && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
