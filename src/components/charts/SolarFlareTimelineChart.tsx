import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ValueType, NameType, Payload } from 'recharts/types/component/DefaultTooltipContent';
import type { DonkiFlareResponse, FlareClass } from '@/types';

export interface SolarFlareTimelineChartProps {
  flares: DonkiFlareResponse[];
  filterClass?: FlareClass | null;
}

interface ChartDatum {
  time: string;
  classType: string;
  intensity: number;
  flareClass: string;
}

const FLARE_CLASS_COLORS: Record<string, string> = {
  C: '#22c55e',
  M: '#ffab00',
  X: '#ef4444',
};

function extractIntensity(classType: string): number {
  const match = classType.match(/[CMX](\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

function getBaseClass(classType: string): string {
  return classType.charAt(0).toUpperCase();
}

function prepareChartData(
  flares: DonkiFlareResponse[],
  filterClass?: FlareClass | null,
): ChartDatum[] {
  const filtered = filterClass
    ? flares.filter((f) => getBaseClass(f.classType) === filterClass)
    : flares;

  return filtered
    .sort((a, b) => new Date(a.peakTime).getTime() - new Date(b.peakTime).getTime())
    .map((flare) => ({
      time: new Date(flare.peakTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      }),
      classType: flare.classType,
      intensity: extractIntensity(flare.classType),
      flareClass: getBaseClass(flare.classType),
    }));
}

export function SolarFlareTimelineChart({
  flares,
  filterClass,
}: SolarFlareTimelineChartProps) {
  if (flares.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-text-secondary font-mono text-sm border border-dashed border-border rounded-lg" role="status">
        No solar flare data available
      </div>
    );
  }

  const chartData = prepareChartData(flares, filterClass);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-text-secondary font-mono text-sm border border-dashed border-border rounded-lg" role="status">
        No flares matching the selected class
      </div>
    );
  }

  const activeClasses = [...new Set(chartData.map((d) => d.flareClass))];

  return (
    <div
      className="w-full min-h-[300px] animate-[fade-in_0.6s_ease-in-out]"
      aria-label="Timeline chart showing solar flare intensity over time"
      role="img"
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={10}
            tick={{ fontFamily: 'Space Mono, monospace' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tick={{ fontFamily: 'Space Mono, monospace' }}
            label={{
              value: 'Intensity',
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
            formatter={(
              value: ValueType | undefined,
              _name: NameType | undefined,
              item: Payload<ValueType, NameType>,
            ) => {
              const payload = item.payload as ChartDatum | undefined;
              const classType = payload?.classType ?? '';
              return [`${classType} (${String(value ?? '')})`, 'Flare'];
            }}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'Space Mono, monospace', fontSize: 12 }}
          />
          {activeClasses.map((cls) => (
            <Line
              key={cls}
              type="monotone"
              dataKey="intensity"
              name={`Class ${cls}`}
              stroke={FLARE_CLASS_COLORS[cls] ?? '#94a3b8'}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
