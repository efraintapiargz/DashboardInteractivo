import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

export interface NeoHazardPieChartProps {
  hazardousCount: number;
  nonHazardousCount: number;
}

interface PieDatum {
  name: string;
  value: number;
}

const PIE_COLORS = {
  hazardous: '#dc2626',
  safe: '#16a34a',
} as const;

export function NeoHazardPieChart({
  hazardousCount,
  nonHazardousCount,
}: NeoHazardPieChartProps) {
  const total = hazardousCount + nonHazardousCount;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm" role="status">
        No asteroid data available
      </div>
    );
  }

  const data: PieDatum[] = [
    { name: 'Hazardous', value: hazardousCount },
    { name: 'Non-Hazardous', value: nonHazardousCount },
  ];

  const colors = [PIE_COLORS.hazardous, PIE_COLORS.safe];

  return (
    <div
      className="w-full h-[300px]"
      aria-label={`Pie chart: ${hazardousCount} hazardous and ${nonHazardousCount} non-hazardous asteroids`}
      role="img"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={(props: PieLabelRenderProps) => {
              const name = String(props.name ?? '');
              const percent = Number(props.percent ?? 0);
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }}
            labelLine={{ stroke: '#a1a1aa' }}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={colors[index]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: 4,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
