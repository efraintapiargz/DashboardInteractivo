import { useCallback } from 'react';
import { FLARE_CLASSES } from '@/types';
import type { FlareClass } from '@/types';
import styles from './EventTypeSelector.module.css';

export interface EventTypeSelectorProps {
  value: FlareClass | null;
  onChange: (value: FlareClass | null) => void;
}

const ALL_EVENTS_VALUE = '';

/**
 * Dropdown selector for filtering solar flare class (C, M, X).
 * Fully keyboard-navigable with proper ARIA attributes.
 */
export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = e.target.value;
      onChange(selected === ALL_EVENTS_VALUE ? null : (selected as FlareClass));
    },
    [onChange],
  );

  return (
    <div className={styles.selectorWrapper}>
      <label htmlFor="event-type-selector" className={styles.label}>
        Flare Class
      </label>
      <select
        id="event-type-selector"
        className={styles.select}
        value={value ?? ALL_EVENTS_VALUE}
        onChange={handleChange}
        aria-label="Filter by solar flare class"
      >
        <option value={ALL_EVENTS_VALUE}>All Classes</option>
        {FLARE_CLASSES.map((flareClass) => (
          <option key={flareClass} value={flareClass}>
            Class {flareClass}
          </option>
        ))}
      </select>
    </div>
  );
}
