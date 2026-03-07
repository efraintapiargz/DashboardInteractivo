# NASA Interactive Dashboard

A production-grade interactive dashboard built with **React**, **TypeScript**, and **Recharts**, consuming NASA Open APIs (APOD, NEO, DONKI). Features a space-themed UI with real-time data visualization, accessible components, and comprehensive test coverage.

![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-30.2-C21325?logo=jest&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Design Decisions](#design-decisions)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Known Issues & Limitations](#known-issues--limitations)

---

## Overview

The dashboard displays three NASA data streams in a responsive 12-column grid:

| Widget | API | Description |
|---|---|---|
| **APOD Card** | Astronomy Picture of the Day | Image/video with date navigation |
| **NEO Charts** | Near Earth Objects (NeoWs) | Bar chart (asteroid sizes), Pie chart (hazard classification), Summary stats |
| **Solar Flare Timeline** | DONKI Solar Flares | Line chart with flare-class filtering (C/M/X) |

### Key Features

- **Space theme** — Navy (#0a0e1a), cyan (#00d4ff), amber (#ffab00) palette with Space Mono + DM Sans typography
- **Accessible** — ARIA labels, keyboard navigation, skip-to-content link, live regions, adequate color contrast
- **Performant** — React.lazy code-splitting for charts, useMemo/useCallback, in-memory API cache with 5-min TTL
- **Resilient** — ErrorBoundary, loading skeletons, retry buttons, AbortController cleanup

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | >= 18.x |
| npm | >= 9.x |

---

## Setup & Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd DashboardInteractivo

# 2. Install dependencies
npm install

# 3. Create .env file (optional — defaults to DEMO_KEY)
echo VITE_NASA_API_KEY=DEMO_KEY > .env

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check & production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm test` | Run Jest unit tests |
| `npm run test:coverage` | Run tests with coverage report |

---

## Architecture

```
src/
├── __tests__/              # Unit tests (Jest + RTL)
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   ├── utils/              # Utility tests
│   └── __mocks__/          # File stubs
├── components/
│   ├── charts/             # Recharts visualizations (lazy-loaded)
│   │   ├── AsteroidSizeBarChart.tsx
│   │   ├── SolarFlareTimelineChart.tsx
│   │   └── NeoHazardPieChart.tsx
│   ├── filters/            # Date picker, event selector, reset button
│   ├── ApodCard.tsx        # APOD card with date navigation
│   ├── ErrorBoundary.tsx   # Class-based error boundary
│   └── LoadingSkeleton.tsx # Animated loading placeholder
├── hooks/                  # Custom data-fetching hooks
│   ├── useApod.ts
│   ├── useNeoFeed.ts
│   ├── useSolarFlares.ts
│   └── useDebounce.ts
├── pages/
│   └── Dashboard.tsx       # Main dashboard layout
├── services/
│   ├── nasaApi.ts          # API service layer with caching
│   └── constants.ts        # API URLs, endpoints, key
├── types/                  # TypeScript interfaces
│   ├── apod.ts
│   ├── neo.ts
│   ├── donki.ts
│   ├── error.ts
│   ├── filters.ts
│   └── index.ts            # Barrel exports
└── utils/
    ├── apiCache.ts         # In-memory TTL cache
    └── errorHandler.ts     # Standardized error parser
```

### Data Flow

```
NASA APIs  →  nasaApi.ts (fetch + cache)  →  Custom Hooks  →  Dashboard  →  Charts / Cards
                                                   ↑
                                            Filter Components
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **CSS Modules** over Tailwind | Zero-runtime CSS, native scoping, no class string overhead |
| **Recharts** over D3/Chart.js | React-native composable API, responsive containers, good TS support |
| **Class-based ErrorBoundary** | React requires class components for `componentDidCatch` |
| **In-memory cache** over React Query | Simpler, zero-dependency; sufficient for read-only dashboard |
| **React.lazy** for charts | Recharts is ~300KB — lazy loading halves initial bundle size |
| **CSS custom properties** | Centralized theme tokens shared across CSS Modules |
| **AbortController** in hooks | Prevent state updates on unmounted components |
| **ts-jest** with separate tsconfig | Avoids `import.meta` (Vite-only) compile errors in Jest |

---

## API Endpoints

All requests use the [NASA Open APIs](https://api.nasa.gov/). The default key is `DEMO_KEY` (rate limited to 30 req/hour per IP).

| Endpoint | Description |
|---|---|
| `GET /planetary/apod` | Astronomy Picture of the Day |
| `GET /neo/rest/v1/feed` | Near Earth Objects by date range (max 7 days) |
| `GET /DONKI/FLR` | Solar Flare events by date range |

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run a specific test file
npx jest --testPathPattern=errorHandler
```

**Test suites:**
- `errorHandler.test.ts` — Error parsing (AbortError, TypeError, string, unknown)
- `useDebounce.test.ts` — Debounce timing and reset behavior
- `apiCache.test.ts` — Cache get/set/delete/clear/TTL
- `DateRangePicker.test.tsx` — Rendering, validation, ARIA
- `AsteroidSizeBarChart.test.tsx` — Empty state, chart rendering
- `ApodCard.test.tsx` — Loading, error, image, video, date picker states

---

## Known Issues & Limitations

- **DEMO_KEY rate limiting** — NASA's demo key allows ~30 requests/hour. Register at [api.nasa.gov](https://api.nasa.gov/) for a higher-limit key.
- **NEO date range** — The NeoWs API enforces a 7-day maximum window.
- **Recharts bundle size** — Although lazy-loaded, the Recharts chunk is ~318KB gzipped to ~97KB. Consider server-side rendering or lighter alternatives for smaller payloads.
- **No persistent storage** — The in-memory cache clears on page reload. A Service Worker or IndexedDB cache could improve offline performance.
- **Video APOD** — Some APOD entries are YouTube embeds; autoplay behavior varies by browser policy.
