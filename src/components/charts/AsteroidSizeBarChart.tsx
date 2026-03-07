import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { NeoObject } from '@/types';
import styles from './Chart.module.css';

export interface AsteroidSizeBarChartProps {
  neoList: NeoObject[];
}

interface ChartDatum {
  name: string;
  diameterMin: number;
  diameterMax: number;
  missDistanceKm: number;
}

const CHART_COLORS = {
  diameterMin: '#00d4ff',
  diameterMax: '#ffab00',
} as const;

const MAX_ASTEROIDS_DISPLAYED = 15;

/**
 * Transforms NEO data into chart-ready format
 */
function prepareChartData(neoList: NeoObject[]): ChartDatum[] {
  return neoList.slice(0, MAX_ASTEROIDS_DISPLAYED).map((neo) => ({
    name: neo.name.replace(/[()]/g, '').substring(0, 15),
    diameterMin: parseFloat(
      neo.estimated_diameter.kilometers.estimated_diameter_min.toFixed(4),
    ),
    diameterMax: parseFloat(
      neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(4),
    ),
    missDistanceKm:
      neo.close_approach_data.length > 0
        ? parseFloat(parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toFixed(0))
        : 0,
  }));
}

/**
 * Bar chart comparing estimated diameters of NEOs in the selected date range.
 * Uses Recharts BarChart with Tooltip and Legend.
 */
export function AsteroidSizeBarChart({ neoList }: AsteroidSizeBarChartProps) {
  if (neoList.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        No asteroid data available
      </div>
    );
  }

  const chartData = prepareChartData(neoList);

  return (
    <div
      className={styles.chartWrapper}
      aria-label="Bar chart comparing estimated diameters of near-Earth asteroids"
      role="img"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            tick={{ fontFamily: 'Space Mono, monospace' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tick={{ fontFamily: 'Space Mono, monospace' }}
            label={{
              value: 'Diameter (km)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#94a3b8', fontFamily: 'Space Mono, monospace', fontSize: 11 },
            }}
          />
          <Tooltip
            contentStyle={{
              background: '#0a0e1a',
              border: '1px solid #1e293b',
              borderRadius: 6,
              fontFamily: 'Space Mono, monospace',
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'Space Mono, monospace', fontSize: 12 }}
          />
          <Bar
            dataKey="diameterMin"
            name="Min Diameter (km)"
            fill={CHART_COLORS.diameterMin}
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="diameterMax"
            name="Max Diameter (km)"
            fill={CHART_COLORS.diameterMax}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
