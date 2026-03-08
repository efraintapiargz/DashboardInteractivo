import { useState, useCallback } from 'react';
import { useApod } from '@/hooks/useApod';

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toIsoDate(d);
}

export default function ApodCard() {
  const [selectedDate, setSelectedDate] = useState<string>(yesterdayIso());
  const { data, isLoading, error, refetch } = useApod(selectedDate);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }} role="status" aria-label="Loading APOD content">
        <div className="w-full aspect-video bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="p-5 space-y-2">
          <div className="h-4 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          <div className="h-4 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] w-3/5" />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }} role="alert">
        <p className="text-red-600 text-sm mb-3">{error.message}</p>
        <button
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors"
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
    <article className="bg-white rounded-2xl overflow-hidden h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }} aria-label="Astronomy Picture of the Day">
      <div className="flex flex-col md:flex-row">
        {isVideo ? (
          <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:min-h-[280px]">
            <iframe
              className="w-full h-full border-none"
              src={data.url}
              title={data.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:min-h-[280px] overflow-hidden bg-slate-100">
            <img
              className="w-full h-full object-cover"
              src={data.url}
              alt={data.title}
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start gap-3 mb-2">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Imagen astronómica del día</p>
              <h2 className="text-base font-medium text-slate-900 leading-snug">
                {data.title}
              </h2>
            </div>
            <input
              id="apod-date-picker"
              type="date"
              className="h-8 px-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shrink-0"
              value={selectedDate}
              max={todayStr}
              min="1995-06-16"
              onChange={handleDateChange}
              aria-label="Select APOD date"
            />
          </div>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-5 flex-1">
            {data.explanation}
          </p>

          {data.copyright && (
            <p className="text-xs text-slate-400 mt-3">
              &copy; {data.copyright}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
