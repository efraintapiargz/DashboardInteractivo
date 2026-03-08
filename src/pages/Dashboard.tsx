import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import type { FlareClass } from '@/types';
import { useNeoFeed } from '@/hooks/useNeoFeed';
import { useSolarFlares } from '@/hooks/useSolarFlares';
import { useDebounce } from '@/hooks/useDebounce';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { EventTypeSelector } from '@/components/filters/EventTypeSelector';
import { ResetFiltersButton } from '@/components/filters/ResetFiltersButton';
import ApodCard from '@/components/ApodCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const AsteroidSizeBarChart = lazy(() =>
  import('@/components/charts/AsteroidSizeBarChart').then((m) => ({
    default: m.AsteroidSizeBarChart,
  })),
);
const SolarFlareTimelineChart = lazy(() =>
  import('@/components/charts/SolarFlareTimelineChart').then((m) => ({
    default: m.SolarFlareTimelineChart,
  })),
);
const NeoHazardPieChart = lazy(() =>
  import('@/components/charts/NeoHazardPieChart').then((m) => ({
    default: m.NeoHazardPieChart,
  })),
);

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState(daysAgoStr(3));
  const [endDate, setEndDate] = useState(todayStr());
  const [eventType, setEventType] = useState<FlareClass | null>(null);

  // Debounce dates 600ms to avoid firing requests on every keystroke/change
  const debouncedStart = useDebounce(startDate, 600);
  const debouncedEnd = useDebounce(endDate, 600);

  const neo = useNeoFeed(debouncedStart, debouncedEnd);
  const flares = useSolarFlares(debouncedStart, debouncedEnd);

  const neoSummary = useMemo(
    () => ({
      total: neo.stats.totalCount,
      hazardous: neo.stats.hazardousCount,
      avgDiameter: neo.stats.averageDiameterKm.toFixed(2),
      flareCount: flares.data.length,
    }),
    [neo.stats, flares.data.length],
  );

  const chartFallback = useMemo(
    () => <LoadingSkeleton showBlock lines={2} />,
    [],
  );

  const handleReset = useCallback(() => {
    setStartDate(daysAgoStr(3));
    setEndDate(todayStr());
    setEventType(null);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div role="status" aria-live="polite" className="sr-only">
        {neo.isLoading || flares.isLoading
          ? 'Loading dashboard data…'
          : `Loaded ${neoSummary.total} asteroids and ${neoSummary.flareCount} solar flares.`}
      </div>

      <header
        className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 bg-bg/85 backdrop-blur-md border-b border-border max-sm:flex-col max-sm:h-auto max-sm:py-3 max-sm:gap-2"
        role="banner"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold bg-gradient-to-br from-accent-cyan to-accent-amber bg-clip-text text-transparent">
            NASA Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[0.7rem] text-success uppercase tracking-wide" aria-live="polite">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulse-dot_2s_ease-in-out_infinite]" />
            Live
          </span>
        </div>
      </header>

      <nav
        className="flex flex-wrap items-end gap-4 px-4 py-4 bg-surface border-b border-border max-sm:flex-col max-sm:items-stretch"
        aria-label="Dashboard filters"
      >
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <EventTypeSelector value={eventType} onChange={setEventType} />
        <ResetFiltersButton onReset={handleReset} />
      </nav>

      <main id="main-content" className="flex-1 p-4 animate-[fade-in_0.4s_ease-in-out]">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <ErrorBoundary>
              <ApodCard />
            </ErrorBoundary>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="bg-surface border border-border rounded-xl p-5 animate-[fade-in_0.6s_ease-in-out]">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-sans text-sm font-semibold text-text-primary uppercase tracking-wide">
                  NEO Summary
                </h2>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                <StatCard value={neoSummary.total} label="Total Asteroids" />
                <StatCard value={neoSummary.hazardous} label="Hazardous" />
                <StatCard value={neoSummary.avgDiameter} label="Avg Diameter (km)" />
                <StatCard value={neoSummary.flareCount} label="Solar Flares" />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <ErrorBoundary>
              <div className="bg-surface border border-border rounded-xl p-5 animate-[fade-in_0.6s_ease-in-out]">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-sans text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Asteroid Sizes
                  </h2>
                </div>
                {neo.isLoading ? (
                  <LoadingSkeleton showBlock lines={2} />
                ) : (
                  <Suspense fallback={chartFallback}>
                    <AsteroidSizeBarChart neoList={neo.neoList} />
                  </Suspense>
                )}
              </div>
            </ErrorBoundary>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <ErrorBoundary>
              <div className="bg-surface border border-border rounded-xl p-5 animate-[fade-in_0.6s_ease-in-out]">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-sans text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Hazard Classification
                  </h2>
                </div>
                {neo.isLoading ? (
                  <LoadingSkeleton showBlock lines={2} />
                ) : (
                  <Suspense fallback={chartFallback}>
                    <NeoHazardPieChart
                      hazardousCount={neo.stats.hazardousCount}
                      nonHazardousCount={neo.stats.nonHazardousCount}
                    />
                  </Suspense>
                )}
              </div>
            </ErrorBoundary>
          </div>

          <div className="col-span-12">
            <ErrorBoundary>
              <div className="bg-surface border border-border rounded-xl p-5 animate-[fade-in_0.6s_ease-in-out]">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-sans text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Solar Flare Timeline
                  </h2>
                </div>
                {flares.isLoading ? (
                  <LoadingSkeleton showBlock lines={2} />
                ) : (
                  <Suspense fallback={chartFallback}>
                    <SolarFlareTimelineChart flares={flares.data} filterClass={eventType} />
                  </Suspense>
                )}
              </div>
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <footer className="px-4 py-4 text-center border-t border-border font-mono text-[0.7rem] text-text-tertiary" role="contentinfo">
        Powered by{' '}
        <a
          className="text-accent-cyan no-underline hover:underline"
          href="https://api.nasa.gov"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA Open APIs
        </a>
      </footer>
    </>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="p-4 bg-surface-alt border border-border rounded-lg text-center">
      <div className="font-mono text-2xl font-bold text-accent-cyan">{value}</div>
      <div className="font-sans text-xs text-text-secondary uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
