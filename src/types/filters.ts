import type { FlareClass } from './donki';

/**
 * Dashboard filter state interface
 */
export interface DashboardFilters {
  readonly dateRange: {
    readonly startDate: string;
    readonly endDate: string;
  };
  readonly selectedAsteroid: string | null;
  readonly eventType: FlareClass | null;
}
