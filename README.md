# NASA Dashboard

Dashboard interactivo construido con React 19 y TypeScript que visualiza datos en tiempo real de tres APIs publicas de NASA: asteroides cercanos a la Tierra, llamaradas solares y la imagen astronomica del dia.

## Funcionamiento del Dashboard

### Vista general

Al abrir el dashboard se cargan automaticamente los datos de los ultimos 3 dias. La interfaz se divide en secciones:

| Seccion | Descripcion |
|---------|-------------|
| **Header** | Barra superior fija con el nombre del proyecto y un indicador "Live" que confirma la conexion activa |
| **Filtros** | Barra de navegacion con selector de rango de fechas (max 7 dias), filtro por clase de llamarada solar (C/M/X) y boton para resetear filtros |
| **APOD** | Tarjeta con la Imagen Astronomica del Dia, incluyendo titulo, fecha, descripcion y un selector independiente de fecha |
| **NEO Summary** | Panel de estadisticas con 4 metricas: total de asteroides detectados, cantidad peligrosos, diametro promedio y numero de llamaradas solares |
| **Asteroid Sizes** | Grafico de barras (BarChart) mostrando los 10 asteroides mas grandes del rango seleccionado |
| **Hazard Classification** | Grafico circular (PieChart) con la proporcion entre asteroides peligrosos y no peligrosos |
| **Solar Flare Timeline** | Grafico de linea temporal (LineChart) con las llamaradas solares, filtrable por clase |

### Flujo de datos

1. El usuario selecciona un rango de fechas en el **DateRangePicker** (maximo 7 dias por restriccion del endpoint NEO).
2. Los valores se aplican con un **debounce de 600ms** para evitar llamadas innecesarias mientras el usuario ajusta las fechas.
3. Se disparan en paralelo dos peticiones: una al endpoint **NEO Feed** y otra al endpoint **DONKI FLR**.
4. Si los datos ya estan en **cache** (TTL de 15 minutos), se devuelven sin hacer peticion.
5. Si una peticion identica ya esta en curso, se **reutiliza la promesa** en vez de duplicar la llamada.
6. Si el servidor devuelve **429 (rate limit)**, se reintenta automaticamente hasta 3 veces con backoff exponencial.
7. Los resultados alimentan los graficos y las tarjetas de estadisticas.
8. El componente **APOD** tiene su propio selector de fecha independiente de los filtros globales.

### Filtros disponibles

- **Rango de fechas**: Controla los datos de NEO Feed y DONKI FLR. Validado para no exceder 7 dias ni tener fecha final anterior a la inicial.
- **Clase de llamarada**: Filtra el grafico Solar Flare Timeline por clases C, M o X. No afecta otros graficos.
- **Reset**: Restaura los filtros a sus valores por defecto (ultimos 3 dias, sin filtro de clase).

### Optimizaciones de consumo de API

El dashboard implementa varias estrategias para minimizar las peticiones a la API de NASA:

- **Cache en memoria con TTL de 15 minutos**: Las respuestas se almacenan en un `Map` en memoria. Si se repiten los mismos parametros antes de que expire el TTL, se devuelve la respuesta cacheada sin hacer fetch.
- **Debounce de 600ms en filtros de fecha**: Los cambios en las fechas esperan 600ms de inactividad antes de disparar las peticiones, evitando rafagas de llamadas mientras el usuario ajusta el rango.
- **Deduplicacion de peticiones en vuelo**: Si se solicitan los mismos datos mientras ya hay una peticion activa para esa URL, se reutiliza la promesa existente en lugar de crear una nueva.
- **Retry con backoff exponencial para 429**: Cuando la API devuelve rate limit (HTTP 429), se reintenta automaticamente hasta 3 veces con delays de 1.5s, 3s y 6s (o respetando el header `Retry-After` si esta presente).
- **AbortController en hooks**: Al cambiar filtros o desmontar componentes, las peticiones pendientes se cancelan para no desperdiciar recursos.
- **Rango inicial de 3 dias**: En lugar de cargar 7 dias, el rango por defecto es de 3 dias, reduciendo el volumen de datos del endpoint NEO.
- **Lazy loading de graficos**: Los componentes de Recharts se cargan con `React.lazy()` y `Suspense`, reduciendo el bundle inicial y evitando procesar graficos que aun no son visibles.

### APIs consumidas

| Endpoint | URL | Datos |
|----------|-----|-------|
| APOD | `/planetary/apod` | Imagen astronomica del dia con metadata |
| NEO Feed | `/neo/rest/v1/feed` | Asteroides cercanos en un rango de fechas (max 7 dias) |
| DONKI FLR | `/DONKI/FLR` | Llamaradas solares registradas en un rango de fechas |

Las tres APIs son gratuitas. Con `DEMO_KEY` el limite es de 30 peticiones por hora. Con una API key propia (gratuita en [api.nasa.gov](https://api.nasa.gov)) el limite sube a 1000 por hora.

## Stack

- **React 19** + **TypeScript** con Vite
- **Recharts** para graficos (BarChart, PieChart, LineChart)
- **Tailwind CSS v4** para estilos (via plugin de Vite)
- **Jest** + **Testing Library** para pruebas unitarias

## Configuracion

```bash
# Clonar e instalar
git clone <repo-url>
cd DashboardInteractivo
npm install

# Crear .env con tu API key de NASA (recomendado)
# Si no se configura, se usa DEMO_KEY (30 req/hora)
echo "VITE_NASA_API_KEY=tu_api_key" > .env

# Desarrollo
npm run dev

# Build de produccion
npm run build
npm run preview

# Tests
npm test
npm run test:coverage
```

## Estructura del proyecto

```
src/
  pages/          -> Dashboard principal
  components/
    charts/       -> AsteroidSizeBarChart, NeoHazardPieChart, SolarFlareTimelineChart
    filters/      -> DateRangePicker, EventTypeSelector, ResetFiltersButton
  hooks/          -> useApod, useNeoFeed, useSolarFlares, useDebounce
  services/       -> Cliente HTTP con cache, retry y deduplicacion
  types/          -> Interfaces TypeScript para cada endpoint
  utils/          -> Cache en memoria (TTL 15min), parser de errores
  __tests__/      -> Tests unitarios por componente/hook/util
```

## Accesibilidad

- Skip-to-content link
- Roles ARIA en graficos, filtros y regiones
- Validacion con `aria-invalid` y `aria-describedby` en formularios
- Focus visible con outline en todos los elementos interactivos
- Region `aria-live="polite"` que anuncia el estado de carga

## Supuestos y limitaciones

- Con `DEMO_KEY` el rate limit es de 30 req/hora. Se recomienda obtener una key gratuita en [api.nasa.gov](https://api.nasa.gov)
- El rango de fechas esta limitado a 7 dias por restriccion del endpoint NEO Feed
- Los graficos de llamaradas solares dependen de que haya actividad solar en el rango seleccionado
- Compatibilidad probada en Chrome y Firefox
