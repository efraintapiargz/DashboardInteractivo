import { render, screen } from '@testing-library/react';
import { AsteroidSizeBarChart } from '@/components/charts/AsteroidSizeBarChart';
import type { NeoObject } from '@/types';

// Recharts uses ResizeObserver internally
beforeAll(() => {
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const DIAMETER_STUB = {
  estimated_diameter_min: 0.05,
  estimated_diameter_max: 0.12,
};

function makeMockNeo(overrides: Partial<NeoObject> = {}): NeoObject {
  return {
    id: '1',
    neo_reference_id: '1',
    name: 'Test Asteroid',
    nasa_jpl_url: 'https://example.com',
    absolute_magnitude_h: 22.0,
    is_potentially_hazardous_asteroid: false,
    is_sentry_object: false,
    estimated_diameter: {
      kilometers: DIAMETER_STUB,
      meters: DIAMETER_STUB,
      miles: DIAMETER_STUB,
      feet: DIAMETER_STUB,
    },
    close_approach_data: [
      {
        close_approach_date: '2024-01-01',
        close_approach_date_full: '2024-Jan-01 12:00',
        epoch_date_close_approach: 1704067200000,
        relative_velocity: {
          kilometers_per_second: '14',
          kilometers_per_hour: '50000',
          miles_per_hour: '31000',
        },
        miss_distance: {
          astronomical: '0.01',
          lunar: '4.5',
          kilometers: '2000000',
          miles: '1200000',
        },
        orbiting_body: 'Earth',
      },
    ],
    ...overrides,
  };
}

describe('AsteroidSizeBarChart', () => {
  it('renders empty state when neoList is empty', () => {
    render(<AsteroidSizeBarChart neoList={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('No asteroid data available');
  });

  it('renders the chart with aria-label when data is provided', () => {
    const neoList = [
      makeMockNeo({ id: '1', name: 'Asteroid Alpha' }),
      makeMockNeo({ id: '2', name: 'Asteroid Beta' }),
    ];

    render(<AsteroidSizeBarChart neoList={neoList} />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Bar chart comparing estimated diameters of near-Earth asteroids',
    );
  });
});
