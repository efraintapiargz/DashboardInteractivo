import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import type { FlareClass } from '@/types';
import { useNeoFeed } from '@/hooks/useNeoFeed';
import { useSolarFlares } from '@/hooks/useSolarFlares';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { EventTypeSelector } from '@/components/filters/EventTypeSelector';
import { ResetFiltersButton } from '@/components/filters/ResetFiltersButton';
import ApodCard from '@/components/ApodCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import styles from './Dashboard.module.css';

/* Lazy-loaded chart components for code-splitting */
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

/** Returns today's date as YYYY-MM-DD */
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns a date N days before today as YYYY-MM-DD */
function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/**
 * Dashboard — main page composing all widgets in a responsive 12-column grid.
 * Space theme with navy background, cyan/amber accents,
 * Space Mono headings and DM Sans body text.
 */
export default function Dashboard() {
  /* ---------- Filter state ---------- */
  const [startDate, setStartDate] = useState(daysAgoStr(7));
  const [endDate, setEndDate] = useState(todayStr());
  const [eventType, setEventType] = useState<FlareClass | null>(null);

  /* ---------- Data hooks ---------- */
  const neo = useNeoFeed(startDate, endDate);
  const flares = useSolarFlares(startDate, endDate);

  /* ---------- Memoized computations ---------- */
  const neoSummary = useMemo(
    () => ({
      total: neo.stats.totalCount,
      hazardous: neo.stats.hazardousCount,
      avgDiameter: neo.stats.averageDiameterKm.toFixed(2),
      flareCount: flares.data.length,
    }),
    [neo.stats, flares.data.length],
  );

  /* ---------- Suspense fallback ---------- */
  const chartFallback = useMemo(
    () => <LoadingSkeleton showBlock lines={2} />,
    [],
  );

  /* ---------- Reset ---------- */
  const handleReset = useCallback(() => {
    setStartDate(daysAgoStr(7));
    setEndDate(todayStr());
    setEventType(null);
  }, []);

  return (
    <>
      {/* ---- Skip to content ---- */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ---- Live status region ---- */}
      <div role="status" aria-live="polite" className="sr-only">
        {neo.isLoading || flares.isLoading
          ? 'Loading dashboard data…'
          : `Loaded ${neoSummary.total} asteroids and ${neoSummary.flareCount} solar flares.`}
      </div>

      {/* ---- Header ---- */}
      <header className={styles.header} role="banner">
        <div className={styles.logo}>
          <span className={styles.logoIcon} role="img" aria-label="Rocket">
            🚀
          </span>
          <span className={styles.logoText}>NASA Dashboard</span>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.liveIndicator} aria-live="polite">
            <span className={styles.liveDot} />
            Live
          </span>
        </div>
      </header>

      {/* ---- Filter bar ---- */}
      <nav className={styles.filterBar} aria-label="Dashboard filters">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <EventTypeSelector value={eventType} onChange={setEventType} />
        <ResetFiltersButton onReset={handleReset} />
      </nav>

      {/* ---- Main grid ---- */}
      <main id="main-content" className={styles.main}>
        <div className={styles.grid}>
          {/* ---- APOD Card ---- */}
          <div className={styles.spanHalf}>
            <ErrorBoundary>
              <ApodCard />
            </ErrorBoundary>
          </div>

          {/* ---- Stats summary ---- */}
          <div className={styles.spanHalf}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} role="img" aria-label="Chart">
                  📊
                </span>
                <h2 className={styles.sectionTitle}>NEO Summary</h2>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{neoSummary.total}</div>
                  <div className={styles.statLabel}>Total Asteroids</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{neoSummary.hazardous}</div>
                  <div className={styles.statLabel}>Hazardous</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {neoSummary.avgDiameter}
                  </div>
                  <div className={styles.statLabel}>Avg Ø (km)</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{neoSummary.flareCount}</div>
                  <div className={styles.statLabel}>Solar Flares</div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Asteroid Size Chart ---- */}
          <div className={styles.spanHalf}>
            <ErrorBoundary>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon} role="img" aria-label="Asteroid">
                    ☄️
                  </span>
                  <h2 className={styles.sectionTitle}>Asteroid Sizes</h2>
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

          {/* ---- NEO Hazard Pie Chart ---- */}
          <div className={styles.spanHalf}>
            <ErrorBoundary>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon} role="img" aria-label="Shield">
                    🛡️
                  </span>
                  <h2 className={styles.sectionTitle}>Hazard Classification</h2>
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

          {/* ---- Solar Flare Timeline ---- */}
          <div className={styles.spanFull}>
            <ErrorBoundary>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon} role="img" aria-label="Sun">
                    ☀️
                  </span>
                  <h2 className={styles.sectionTitle}>Solar Flare Timeline</h2>
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

      {/* ---- Footer ---- */}
      <footer className={styles.footer} role="contentinfo">
        Powered by{' '}
        <a
          className={styles.footerLink}
          href="https://api.nasa.gov"
          target="_blank"
          rel="noopener noreferrer"
        >
          NASA Open APIs
        </a>{' '}
        · Built with React + TypeScript + Recharts
      </footer>
    </>
  );
}
