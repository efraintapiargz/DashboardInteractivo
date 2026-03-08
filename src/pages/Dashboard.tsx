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
  const [startDate, setStartDate] = useState(daysAgoStr(30));
  const [endDate, setEndDate] = useState(todayStr());
  const [eventType, setEventType] = useState<FlareClass | null>(null);

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
    setStartDate(daysAgoStr(30));
    setEndDate(todayStr());
    setEventType(null);
  }, []);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div role="status" aria-live="polite" className="sr-only">
        {neo.isLoading || flares.isLoading
          ? 'Loading dashboard data…'
          : `Loaded ${neoSummary.total} asteroids and ${neoSummary.flareCount} solar flares.`}
      </div>

      {/* ── Header (dark) ── */}
      <header className="sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }} role="banner">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              NASA Dashboard
            </h1>
          </div>
          {(neo.isLoading || flares.isLoading) && (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Cargando datos...
            </span>
          )}
        </div>
      </header>

      {/* ── Filters bar ── */}
      <div className="w-full border-b" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-end gap-3 mb-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <EventTypeSelector value={eventType} onChange={setEventType} />
            <ResetFiltersButton onReset={handleReset} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecciona un rango de fechas (máx. 30 días) para consultar asteroides cercanos y actividad solar.
            Usa el filtro de clase para ver solo llamaradas C, M o X en la línea de tiempo.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          {/* ── Section: Métricas clave ── */}
          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                value={neoSummary.total}
                label="Asteroides detectados"
                accentColor="#6366f1"
              />
              <StatCard
                value={neoSummary.hazardous}
                label="Potencialmente peligrosos"
                accentColor="#ef4444"
              />
              <StatCard
                value={`${neoSummary.avgDiameter} km`}
                label="Diámetro promedio"
                accentColor="#0ea5e9"
              />
              <StatCard
                value={neoSummary.flareCount}
                label="Llamaradas solares"
                accentColor="#f59e0b"
              />
            </div>
          </section>

          {/* ── Section: Imagen del día + Riesgo ── */}
          <section>
            <SectionHeader title="Exploración espacial" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
              <div className="lg:col-span-8">
                <ErrorBoundary>
                  <ApodCard />
                </ErrorBoundary>
              </div>

              <div className="lg:col-span-4 flex flex-col">
                <div className="bg-white rounded-2xl p-6 flex-1" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                    <h2 className="text-sm font-semibold text-slate-700">
                      Clasificación de riesgo
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Proporción de asteroides peligrosos vs. seguros.
                  </p>
                  <ErrorBoundary>
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
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section: Análisis ── */}
          <section>
            <SectionHeader title="Análisis detallado" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#6366f1' }} />
                  <h2 className="text-sm font-semibold text-slate-700">
                    Tamaño de asteroides
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Diámetro estimado (min/max) de los 10 asteroides más recientes.
                </p>
                <ErrorBoundary>
                  {neo.isLoading ? (
                    <LoadingSkeleton showBlock lines={2} />
                  ) : (
                    <Suspense fallback={chartFallback}>
                      <AsteroidSizeBarChart neoList={neo.neoList} />
                    </Suspense>
                  )}
                </ErrorBoundary>
              </div>

              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                  <h2 className="text-sm font-semibold text-slate-700">
                    Línea de tiempo &mdash; Llamaradas solares
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Intensidad de las llamaradas registradas en el rango seleccionado.
                  {eventType && <> Filtro activo: <strong className="text-amber-600">Clase {eventType}</strong>.</>}
                </p>
                <ErrorBoundary>
                  {flares.isLoading ? (
                    <LoadingSkeleton showBlock lines={2} />
                  ) : (
                    <Suspense fallback={chartFallback}>
                      <SolarFlareTimelineChart flares={flares.data} filterClass={eventType} />
                    </Suspense>
                  )}
                </ErrorBoundary>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-5 text-center text-xs text-slate-400" style={{ borderTop: '1px solid #e2e8f0' }} role="contentinfo">
        Datos obtenidos de{' '}
        <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 font-medium">
          NASA Open APIs
        </a>
      </footer>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">{title}</h2>
      <div className="flex-1 h-px" style={{ backgroundColor: '#e2e8f0' }} />
    </div>
  );
}

function StatCard({ value, label, accentColor }: {
  value: string | number;
  label: string;
  accentColor: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl px-5 py-5 transition-all hover:shadow-md flex flex-col items-center text-center"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
      }}
    >
      <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">{label}</div>
      <div
        className="text-3xl font-bold tabular-nums tracking-tight"
        style={{ color: accentColor }}
      >
        {value}
      </div>
    </div>
  );
}
