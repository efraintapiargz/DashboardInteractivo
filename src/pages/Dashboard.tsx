import { useState, useCallback } from 'react';
import type { FlareClass } from '@/types';
import { useNeoFeed } from '@/hooks/useNeoFeed';
import { useSolarFlares } from '@/hooks/useSolarFlares';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { EventTypeSelector } from '@/components/filters/EventTypeSelector';
import { ResetFiltersButton } from '@/components/filters/ResetFiltersButton';
import ApodCard from '@/components/ApodCard';
import { AsteroidSizeBarChart } from '@/components/charts/AsteroidSizeBarChart';
import { SolarFlareTimelineChart } from '@/components/charts/SolarFlareTimelineChart';
import { NeoHazardPieChart } from '@/components/charts/NeoHazardPieChart';
import styles from './Dashboard.module.css';

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

  /* ---------- Reset ---------- */
  const handleReset = useCallback(() => {
    setStartDate(daysAgoStr(7));
    setEndDate(todayStr());
    setEventType(null);
  }, []);

  return (
    <>
      {/* ---- Header ---- */}
      <header className={styles.header}>
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
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* ---- APOD Card ---- */}
          <div className={styles.spanHalf}>
            <ApodCard />
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
                  <div className={styles.statValue}>{neo.stats.totalCount}</div>
                  <div className={styles.statLabel}>Total Asteroids</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{neo.stats.hazardousCount}</div>
                  <div className={styles.statLabel}>Hazardous</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {neo.stats.averageDiameterKm.toFixed(2)}
                  </div>
                  <div className={styles.statLabel}>Avg Ø (km)</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{flares.data.length}</div>
                  <div className={styles.statLabel}>Solar Flares</div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Asteroid Size Chart ---- */}
          <div className={styles.spanHalf}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} role="img" aria-label="Asteroid">
                  ☄️
                </span>
                <h2 className={styles.sectionTitle}>Asteroid Sizes</h2>
              </div>
              <AsteroidSizeBarChart neoList={neo.neoList} />
            </div>
          </div>

          {/* ---- NEO Hazard Pie Chart ---- */}
          <div className={styles.spanHalf}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} role="img" aria-label="Shield">
                  🛡️
                </span>
                <h2 className={styles.sectionTitle}>Hazard Classification</h2>
              </div>
              <NeoHazardPieChart
                hazardousCount={neo.stats.hazardousCount}
                nonHazardousCount={neo.stats.nonHazardousCount}
              />
            </div>
          </div>

          {/* ---- Solar Flare Timeline ---- */}
          <div className={styles.spanFull}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} role="img" aria-label="Sun">
                  ☀️
                </span>
                <h2 className={styles.sectionTitle}>Solar Flare Timeline</h2>
              </div>
              <SolarFlareTimelineChart flares={flares.data} filterClass={eventType} />
            </div>
          </div>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className={styles.footer}>
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
