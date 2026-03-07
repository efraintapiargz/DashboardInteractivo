import { useState, useCallback } from 'react';
import { useApod } from '@/hooks/useApod';
import styles from './ApodCard.module.css';

/** Format a Date to YYYY-MM-DD for the NASA API */
function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function ApodCard() {
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(new Date()));
  const { data, isLoading, error, refetch } = useApod(selectedDate);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
    },
    [],
  );

  /* ---------- Loading skeleton ---------- */
  if (isLoading) {
    return (
      <div className={styles.skeleton} role="status" aria-label="Loading APOD content">
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
        <div className={styles.skeletonLine} />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <p className={styles.errorMessage}>{error.message}</p>
        <button
          className={styles.retryButton}
          onClick={refetch}
          type="button"
          aria-label="Retry loading Astronomy Picture of the Day"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ---------- No data fallback ---------- */
  if (!data) {
    return null;
  }

  const isVideo = data.media_type === 'video';
  const todayStr = toIsoDate(new Date());

  /* ---------- Main card ---------- */
  return (
    <article className={styles.apodCard} aria-label="Astronomy Picture of the Day">
      {/* Media */}
      {isVideo ? (
        <div className={styles.videoWrapper}>
          <iframe
            className={styles.videoFrame}
            src={data.url}
            title={data.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <div className={styles.imageWrapper}>
          <img
            className={styles.apodImage}
            src={data.url}
            alt={data.title}
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{data.title}</h2>

          {/* Date navigator */}
          <div className={styles.dateNavigator}>
            <label className={styles.dateLabel} htmlFor="apod-date-picker">
              Date
            </label>
            <input
              id="apod-date-picker"
              type="date"
              className={styles.dateInput}
              value={selectedDate}
              max={todayStr}
              min="1995-06-16"
              onChange={handleDateChange}
              aria-label="Select APOD date"
            />
          </div>
        </div>

        <p className={styles.explanation}>{data.explanation}</p>

        {data.copyright && (
          <p className={styles.copyright}>© {data.copyright}</p>
        )}
      </div>
    </article>
  );
}
