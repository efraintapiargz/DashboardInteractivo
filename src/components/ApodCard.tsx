import { useState, useCallback } from 'react';
import { useApod } from '@/hooks/useApod';

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

  if (isLoading) {
    return (
      <div className="rounded-xl overflow-hidden bg-surface border border-border" role="status" aria-label="Loading APOD content">
        <div className="w-full aspect-video bg-gradient-to-r from-border via-[#334155] to-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-4 mx-5 my-3 rounded bg-gradient-to-r from-border via-[#334155] to-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-4 mx-5 my-3 rounded bg-gradient-to-r from-border via-[#334155] to-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] w-3/5" />
        <div className="h-4 mx-5 my-3 rounded bg-gradient-to-r from-border via-[#334155] to-border bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl" role="alert">
        <p className="font-sans text-error mb-4">{error.message}</p>
        <button
          className="px-4 py-2 bg-transparent border border-accent-cyan rounded-md text-accent-cyan font-mono text-sm cursor-pointer transition-colors hover:bg-accent-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          onClick={refetch}
          type="button"
          aria-label="Retry loading Astronomy Picture of the Day"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isVideo = data.media_type === 'video';
  const todayStr = toIsoDate(new Date());

  return (
    <article className="bg-surface border border-border rounded-xl overflow-hidden animate-[fade-in_0.6s_ease-in-out]" aria-label="Astronomy Picture of the Day">
      {isVideo ? (
        <div className="w-full aspect-video">
          <iframe
            className="w-full h-full border-none"
            src={data.url}
            title={data.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video overflow-hidden bg-bg">
          <img
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            src={data.url}
            alt={data.title}
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h2 className="font-sans text-xl font-bold text-text-primary m-0 leading-tight">
            {data.title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <label className="font-mono text-[0.7rem] uppercase tracking-wide text-text-secondary" htmlFor="apod-date-picker">
              Date
            </label>
            <input
              id="apod-date-picker"
              type="date"
              className="px-2 py-1 border border-border rounded-md bg-bg text-text-primary font-mono text-xs focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/25 [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
              value={selectedDate}
              max={todayStr}
              min="1995-06-16"
              onChange={handleDateChange}
              aria-label="Select APOD date"
            />
          </div>
        </div>

        <p className="font-sans text-sm text-text-secondary leading-relaxed m-0 line-clamp-4">
          {data.explanation}
        </p>

        {data.copyright && (
          <p className="font-mono text-[0.7rem] text-text-tertiary mt-3">
            &copy; {data.copyright}
          </p>
        )}
      </div>
    </article>
  );
}
