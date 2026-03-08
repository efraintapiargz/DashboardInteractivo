import { useCallback } from 'react';
import { FLARE_CLASSES } from '@/types';
import type { FlareClass } from '@/types';

export interface EventTypeSelectorProps {
  value: FlareClass | null;
  onChange: (value: FlareClass | null) => void;
}

const ALL_EVENTS_VALUE = '';

export function EventTypeSelector({ value, onChange }: EventTypeSelectorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = e.target.value;
      onChange(selected === ALL_EVENTS_VALUE ? null : (selected as FlareClass));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="event-type-selector" className="text-xs font-medium text-slate-600">
        Clase de llamarada
      </label>
      <select
        id="event-type-selector"
        className="h-9 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-8 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2352525b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")" }}
        value={value ?? ALL_EVENTS_VALUE}
        onChange={handleChange}
        aria-label="Filter by solar flare class"
      >
        <option value={ALL_EVENTS_VALUE}>Todas las clases</option>
        {FLARE_CLASSES.map((flareClass) => (
          <option key={flareClass} value={flareClass}>
            Clase {flareClass}
          </option>
        ))}
      </select>
    </div>
  );
}
