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
  diameterMin: '#2563eb',
  diameterMax: '#7c3aed',
} as const;

const MAX_ASTEROIDS_DISPLAYED = 10;

function prepareChartData(neoList: NeoObject[]): ChartDatum[] {
  return neoList.slice(0, MAX_ASTEROIDS_DISPLAYED).map((neo) => ({
    name: neo.name.replace(/[()]/g, '').substring(0, 12),
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

export function AsteroidSizeBarChart({ neoList }: AsteroidSizeBarChartProps) {
  if (neoList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm" role="status">
        No asteroid data available
      </div>
    );
  }

  const chartData = prepareChartData(neoList);

  return (
    <div
      className="w-full h-[350px]"
      aria-label="Bar chart comparing estimated diameters of near-Earth asteroids"
      role="img"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#a1a1aa"
            fontSize={9}
            angle={-40}
            textAnchor="end"
            interval={0}
            height={70}
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={11}
            label={{
              value: 'Diameter (km)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#71717a', fontSize: 11 },
            }}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: 4,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} verticalAlign="top" align="right" />
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
