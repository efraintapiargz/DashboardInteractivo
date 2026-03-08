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
  C: '#16a34a',
  M: '#d97706',
  X: '#dc2626',
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
      <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm" role="status">
        No solar flare data available
      </div>
    );
  }

  const chartData = prepareChartData(flares, filterClass);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-slate-400 text-sm" role="status">
        No flares matching the selected class
      </div>
    );
  }

  const activeClasses = [...new Set(chartData.map((d) => d.flareClass))];

  return (
    <div
      className="w-full h-[350px]"
      aria-label="Timeline chart showing solar flare intensity over time"
      role="img"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#a1a1aa"
            fontSize={9}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={11}
            label={{
              value: 'Intensity',
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
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} verticalAlign="top" align="right" />
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
