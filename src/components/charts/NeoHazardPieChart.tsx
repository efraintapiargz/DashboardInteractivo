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
  hazardous: '#ef4444',
  safe: '#22c55e',
} as const;

export function NeoHazardPieChart({
  hazardousCount,
  nonHazardousCount,
}: NeoHazardPieChartProps) {
  const total = hazardousCount + nonHazardousCount;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-text-secondary font-mono text-sm border border-dashed border-border rounded-lg" role="status">
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
      className="w-full min-h-[300px] animate-[fade-in_0.6s_ease-in-out]"
      aria-label={`Pie chart: ${hazardousCount} hazardous and ${nonHazardousCount} non-hazardous asteroids`}
      role="img"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={(props: PieLabelRenderProps) => {
              const name = String(props.name ?? '');
              const percent = Number(props.percent ?? 0);
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }}
            labelLine={{ stroke: '#94a3b8' }}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={colors[index]}
                stroke="none"
              />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
