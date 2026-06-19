import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMap } from 'maplibre-gl';

// ─── Tipi ──────────────────────────────────────────────────────────────────
interface Club {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: { weekdays: string; saturday: string; sunday: string };
  coords: [number, number]; // [lng, lat]
  features: string[];
}

// ─── Dati sedi ─────────────────────────────────────────────────────────────
const CLUBS: Club[] = [
  {
    id: 'macerata',
    name: 'Lume Macerata',
    subtitle: 'Club Principale',
    address: 'Piazzale Mario Fattorini 1, 62100 Macerata',
    phone: '+39 0733 123456',
    email: 'macerata@lumefitness.it',
    hours: { weekdays: '06:30 – 22:30', saturday: '08:00 – 20:00', sunday: '09:00 – 14:00' },
    coords: [13.4530, 43.3005],
    features: ['Gym Floor 500m²', 'Box CrossFit 450m²', 'Reformer Pilates', 'Piscina'],
  },
  {
    id: 'montecassiano',
    name: 'Lume Montecassiano',
    subtitle: 'Club',
    address: 'Via Sergio Piermanni 3, 62010 Montecassiano',
    phone: '+39 0733 654321',
    email: 'montecassiano@lumefitness.it',
    hours: { weekdays: '07:00 – 22:00', saturday: '08:30 – 19:00', sunday: 'Chiuso' },
    coords: [13.4237, 43.3618],
    features: ['Sala Pesi', 'Corsi di Gruppo', 'Piscina', 'Parcheggio gratuito'],
  },
];

const BRAND = '#C40042';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const CENTER: [number, number] = [13.441, 43.328]; // centro tra le due sedi

// ─── SVG pin custom ─────────────────────────────────────────────────────────
function buildPinSVG(label: string, active: boolean): string {
  const bg = active ? '#C40042' : '#1a1a1a';
  const border = active ? '#ff4477' : '#C40042';
  const text = '#ffffff';
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <defs>
        <filter id="shadow" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <rect x="2" y="2" width="40" height="40" rx="12" fill="${bg}" stroke="${border}" stroke-width="2"/>
        <path d="M22 42 L16 50 L22 46 L28 50 Z" fill="${bg}" stroke="${border}" stroke-width="1.5" stroke-linejoin="round"/>
      </g>
      <text x="22" y="19" text-anchor="middle" dominant-baseline="middle"
            font-family="Space Grotesk, Inter, sans-serif" font-weight="700"
            font-size="9" fill="${text}" letter-spacing="0.5">LUME</text>
      <text x="22" y="30" text-anchor="middle" dominant-baseline="middle"
            font-family="Inter, sans-serif" font-weight="500"
            font-size="8" fill="rgba(255,255,255,0.7)">${label}</text>
    </svg>
  `.trim();
}

// ─── Componente principale ──────────────────────────────────────────────────
export default function ClubsMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, import('maplibre-gl').Marker>>({});
  const [activeClub, setActiveClub] = useState<Club | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Init mappa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let MapLibreGL: typeof import('maplibre-gl');

    import('maplibre-gl').then((mod) => {
      MapLibreGL = mod.default ?? mod;

      const map = new MapLibreGL.Map({
        container: containerRef.current!,
        style: MAP_STYLE,
        center: CENTER,
        zoom: 10.5,
        attributionControl: { compact: true },
        pitchWithRotate: false,
        dragRotate: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        setMapLoaded(true);

        // Marker per ogni sede
        CLUBS.forEach((club) => {
          const el = document.createElement('div');
          el.innerHTML = buildPinSVG(
            club.id === 'macerata' ? 'MACERATA' : 'MONT.',
            false
          );
          el.style.cursor = 'pointer';
          el.style.transition = 'transform .2s';

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.12)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
          });

          el.addEventListener('click', () => {
            setActiveClub((prev) => {
              const next = prev?.id === club.id ? null : club;
              // Aggiorna stile marker
              Object.entries(markersRef.current).forEach(([id, m]) => {
                const isActive = next?.id === id;
                const c = CLUBS.find((c) => c.id === id)!;
                const label = id === 'macerata' ? 'MACERATA' : 'MONT.';
                m.getElement().innerHTML = buildPinSVG(label, isActive);
              });
              // Fly to
              if (next) {
                map.flyTo({ center: next.coords, zoom: 13.5, duration: 800 });
              } else {
                map.flyTo({ center: CENTER, zoom: 10.5, duration: 800 });
              }
              return next;
            });
          });

          const marker = new MapLibreGL.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(club.coords)
            .addTo(map);

          markersRef.current[club.id] = marker;
        });
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const handleCardClick = (club: Club) => {
    setActiveClub((prev) => {
      const next = prev?.id === club.id ? null : club;
      Object.entries(markersRef.current).forEach(([id, m]) => {
        const isActive = next?.id === id;
        const label = id === 'macerata' ? 'MACERATA' : 'MONT.';
        m.getElement().innerHTML = buildPinSVG(label, isActive);
      });
      if (next && mapRef.current) {
        mapRef.current.flyTo({ center: next.coords, zoom: 13.5, duration: 800 });
      } else if (mapRef.current) {
        mapRef.current.flyTo({ center: CENTER, zoom: 10.5, duration: 800 });
      }
      return next;
    });
  };

  return (
    <div className="relative w-full" style={{ height: '540px' }}>
      {/* Mappa */}
      <div ref={containerRef} className="absolute inset-0 rounded-2xl overflow-hidden" />

      {/* Overlay gradient bordi */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(9,6,8,.55) 0%, transparent 18%, transparent 82%, rgba(9,6,8,.55) 100%)',
        }}
      />

      {/* Loading */}
      {!mapLoaded && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-dark-800">
          <div className="flex gap-1.5">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-lume-300/60"
                style={{ animation: `pulse 1.4s ease-in-out ${delay}ms infinite` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cards sedi — sovrapposta in basso */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-3 pointer-events-none z-10">
        {CLUBS.map((club) => {
          const isActive = activeClub?.id === club.id;
          return (
            <button
              key={club.id}
              onClick={() => handleCardClick(club)}
              className="flex-1 text-left pointer-events-auto transition-all duration-300"
              style={{
                background: isActive ? 'rgba(196,0,66,.15)' : 'rgba(9,6,8,.82)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${isActive ? 'rgba(196,0,66,.5)' : 'rgba(255,255,255,.08)'}`,
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                    style={{ color: '#C40042' }}
                  >
                    {club.subtitle}
                  </p>
                  <h3
                    className="font-display font-bold leading-tight"
                    style={{
                      fontSize: 'clamp(.95rem, 2vw, 1.1rem)',
                      color: isActive ? '#fff' : 'rgba(255,255,255,.9)',
                    }}
                  >
                    {club.name}
                  </h3>
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                  style={{
                    background: isActive ? 'rgba(196,0,66,.2)' : 'rgba(255,255,255,.06)',
                    border: `1px solid ${isActive ? 'rgba(196,0,66,.4)' : 'rgba(255,255,255,.1)'}`,
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 8h8M9.5 5l3 3-3 3"
                      stroke={isActive ? '#C40042' : 'rgba(255,255,255,.5)'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-xs hidden sm:flex items-center gap-1" style={{ color: 'rgba(255,255,255,.4)' }}>
                <svg width="10" height="10" fill="rgba(196,0,66,.7)" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {club.address}
              </p>

              {/* Features (solo se attivo) */}
              {isActive && (
                <ul className="mt-3 grid grid-cols-2 gap-1">
                  {club.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: 'rgba(255,255,255,.55)' }}
                    >
                      <span
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: '#C40042' }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Orari (solo se attivo) */}
              {isActive && (
                <div
                  className="mt-3 pt-3 grid grid-cols-3 gap-2 text-xs"
                  style={{ borderTop: '1px solid rgba(255,255,255,.06)', color: 'rgba(255,255,255,.3)' }}
                >
                  <div>
                    <div style={{ color: 'rgba(255,255,255,.55)', marginBottom: '2px' }}>Lun–Ven</div>
                    {club.hours.weekdays}
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,.55)', marginBottom: '2px' }}>Sab</div>
                    {club.hours.saturday}
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,.55)', marginBottom: '2px' }}>Dom</div>
                    {club.hours.sunday}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* MapLibre CSS custom overrides */}
      <style>{`
        .maplibregl-ctrl-attrib {
          background: rgba(9,6,8,.7) !important;
          color: rgba(255,255,255,.3) !important;
          font-size: 9px !important;
        }
        .maplibregl-ctrl-attrib a { color: rgba(196,0,66,.7) !important; }
        .maplibregl-ctrl-bottom-right { bottom: 70px !important; }
      `}</style>
    </div>
  );
}
