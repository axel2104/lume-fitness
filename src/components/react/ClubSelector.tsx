import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Dati club (aggiornare con coordinate esatte quando disponibili) ──────────
const CLUBS = [
  {
    id: 'piediripa',
    name: 'Lume Piediripa',
    address: 'Macerata — Zona Piediripa',
    city: 'Macerata',
    lat: 43.3080,
    lng: 13.4820,
    badge: 'Nuovo 2026',
    isNew: true,
    features: ['Gym Floor', 'Corsi', 'Piscina'],
  },
  {
    id: 'centro_macerata',
    name: 'Lume Centro',
    address: 'Macerata — Centro Storico',
    city: 'Macerata',
    lat: 43.2997,
    lng: 13.4530,
    badge: 'Nuovo 2026',
    isNew: true,
    features: ['Gym Floor', 'Corsi', 'CrossFit'],
  },
  {
    id: 'macerata',
    name: 'Lume Macerata',
    address: 'Piazzale Mario Fattorini 1',
    city: '62100 Macerata',
    lat: 43.3005,
    lng: 13.4512,
    badge: null,
    isNew: false,
    features: ['Gym Floor', 'CrossFit', 'Reformer', 'Piscina'],
  },
  {
    id: 'montecassiano',
    name: 'Lume Montecassiano',
    address: 'Via Sergio Piermanni 3',
    city: '62010 Montecassiano',
    lat: 43.3618,
    lng: 13.4237,
    badge: null,
    isNew: false,
    features: ['Gym Floor', 'Corsi', 'Piscina'],
  },
];

// ─── Haversine ────────────────────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

// ─── Nominatim geocoding (OSM, gratuito, no API key) ─────────────────────────
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=it`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'it' } });
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  } catch {
    return null;
  }
}

// ─── Tipi ─────────────────────────────────────────────────────────────────────
interface ClubWithDist {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  badge: string | null;
  isNew: boolean;
  features: string[];
  dist: number | null;
}

interface Props {
  onSelect: (clubId: string, clubName: string) => void;
  selectedId?: string;
}

type SearchState = 'idle' | 'locating' | 'geocoding' | 'done' | 'error';

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ClubSelector({ onSelect, selectedId }: Props) {
  const [query, setQuery] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');
  const [clubs, setClubs] = useState<ClubWithDist[]>(
    CLUBS.map(c => ({ ...c, dist: null }))
  );
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Ordina club per distanza ──────────────────────────────────────────────
  const rankClubs = useCallback((lat: number, lng: number) => {
    const ranked = CLUBS.map(c => ({
      ...c,
      dist: haversine(lat, lng, c.lat, c.lng),
    })).sort((a, b) => a.dist - b.dist);
    setClubs(ranked);
    setHasSearched(true);
    setSearchState('done');
  }, []);

  // ── Geolocalizzazione browser ─────────────────────────────────────────────
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Il tuo browser non supporta la geolocalizzazione.');
      setSearchState('error');
      return;
    }
    setSearchState('locating');
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode per mostrare l'indirizzo
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
          { headers: { 'Accept-Language': 'it' } }
        )
          .then(r => r.json())
          .then(d => {
            const addr = d.address;
            const label = [addr.road, addr.house_number, addr.city || addr.town || addr.village]
              .filter(Boolean).join(', ');
            setDisplayAddress(label || 'La mia posizione');
            setQuery(label || '');
          })
          .catch(() => setDisplayAddress('La mia posizione'));
        rankClubs(latitude, longitude);
      },
      err => {
        const msgs: Record<number, string> = {
          1: 'Permesso negato. Abilita la geolocalizzazione nelle impostazioni del browser.',
          2: 'Posizione non disponibile.',
          3: 'Timeout. Riprova.',
        };
        setErrorMsg(msgs[err.code] ?? 'Errore geolocalizzazione.');
        setSearchState('error');
      },
      { timeout: 10000 }
    );
  }, [rankClubs]);

  // ── Ricerca per indirizzo ─────────────────────────────────────────────────
  const searchByAddress = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setSearchState('geocoding');
    setErrorMsg('');
    const result = await geocodeAddress(q);
    if (!result) {
      setErrorMsg('Indirizzo non trovato. Prova con una via, città o CAP.');
      setSearchState('error');
      return;
    }
    setDisplayAddress(result.display.split(',').slice(0, 3).join(','));
    rankClubs(result.lat, result.lng);
  }, [rankClubs]);

  // ── Debounce input ────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setDisplayAddress(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.length > 4) {
      debounceRef.current = setTimeout(() => searchByAddress(v), 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      searchByAddress(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setDisplayAddress('');
    setSearchState('idle');
    setHasSearched(false);
    setErrorMsg('');
    setClubs(CLUBS.map(c => ({ ...c, dist: null })));
    inputRef.current?.focus();
  };

  // Cleanup
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const isLoading = searchState === 'locating' || searchState === 'geocoding';

  // ─ Stili ──────────────────────────────────────────────────────────────────
  const s = {
    wrap: {
      fontFamily: "'Inter', sans-serif",
    } as React.CSSProperties,

    searchBox: {
      background: 'rgba(255,255,255,.05)',
      border: '1.5px solid rgba(255,255,255,.12)',
      borderRadius: '14px',
      padding: '.1rem .2rem',
      marginBottom: '1rem',
      transition: 'border-color .2s',
    } as React.CSSProperties,

    searchRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
      padding: '.65rem 1rem',
    } as React.CSSProperties,

    searchInput: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#fff',
      fontSize: '.9rem',
      fontFamily: "'Inter', sans-serif",
      minWidth: 0,
    } as React.CSSProperties,

    divider: {
      height: '1px',
      background: 'rgba(255,255,255,.07)',
      margin: '0 1rem',
    } as React.CSSProperties,

    gpsBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '.45rem',
      padding: '.6rem 1rem',
      width: '100%',
      background: 'transparent',
      border: 'none',
      color: '#C40042',
      fontSize: '.84rem',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: "'Inter', sans-serif",
      borderRadius: '10px',
      transition: 'background .2s',
    } as React.CSSProperties,
  };

  return (
    <div style={s.wrap}>

      {/* Search box */}
      <div style={s.searchBox}>
        <div style={s.searchRow}>
          {/* Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'rgba(255,255,255,.45)' }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={displayAddress}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Inserisci il tuo indirizzo o CAP…"
            style={s.searchInput}
          />

          {/* Loading spinner */}
          {isLoading && (
            <svg style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8"/>
            </svg>
          )}

          {/* Clear button */}
          {displayAddress && !isLoading && (
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '.2rem', color: 'rgba(255,255,255,.4)', display: 'flex', flexShrink: 0, borderRadius: '50%' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* GPS divider + button */}
        <div style={s.divider}/>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={isLoading}
          style={s.gpsBtn}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(196,0,66,.08)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="#C40042" strokeWidth="1.8"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#C40042" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          {searchState === 'locating' ? 'Ricerca in corso…' : 'Usa la mia posizione'}
        </button>
      </div>

      {/* Error */}
      {searchState === 'error' && errorMsg && (
        <div style={{ padding: '.7rem .9rem', borderRadius: '10px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.22)', color: '#fca5a5', fontSize: '.8rem', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Risultato geocoding */}
      {searchState === 'geocoding' && (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '.8rem', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.45rem' }}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8"/>
          </svg>
          Ricerca indirizzo…
        </div>
      )}

      {/* Club list */}
      {hasSearched && searchState === 'done' && (
        <>
          <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.3)', marginBottom: '.75rem', letterSpacing: '.02em' }}>
            {clubs.length} {clubs.length === 1 ? 'sede vicino a te' : 'sedi vicino a te'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {clubs.map((club, i) => {
              const isSelected = selectedId === club.id;
              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => onSelect(club.id, club.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1rem 1.125rem',
                    borderRadius: '14px',
                    border: `1.5px solid ${isSelected ? 'rgba(196,0,66,.6)' : 'rgba(255,255,255,.08)'}`,
                    background: isSelected ? 'rgba(196,0,66,.1)' : i === 0 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all .22s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseOver={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.18)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.05)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.08)';
                      (e.currentTarget as HTMLButtonElement).style.background = i === 0 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)';
                    }
                  }}
                >
                  {/* Left: info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '.9rem', color: isSelected ? '#fff' : 'rgba(255,255,255,.9)', letterSpacing: '.01em' }}>
                        {club.name.toUpperCase()}
                      </span>
                      {club.isNew && (
                        <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '.1rem .45rem', borderRadius: '9999px', background: 'rgba(196,0,66,.2)', color: '#ff6080', border: '1px solid rgba(196,0,66,.3)', letterSpacing: '.05em' }}>
                          NUOVO
                        </span>
                      )}
                      {i === 0 && (
                        <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '.1rem .45rem', borderRadius: '9999px', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', letterSpacing: '.05em' }}>
                          PIÙ VICINO
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.4)', marginBottom: '.15rem' }}>{club.address}</div>
                    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.28)' }}>{club.city}</div>
                    {/* Features mini */}
                    <div style={{ display: 'flex', gap: '.4rem', marginTop: '.55rem', flexWrap: 'wrap' }}>
                      {club.features.map(f => (
                        <span key={f} style={{ fontSize: '.63rem', padding: '.1rem .5rem', borderRadius: '9999px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.38)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: distance + button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem', flexShrink: 0 }}>
                    {club.dist !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.28rem', fontSize: '.78rem', color: 'rgba(255,255,255,.4)', fontVariantNumeric: 'tabular-nums' }}>
                        <svg width="11" height="11" fill="rgba(196,0,66,.7)" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {fmtDist(club.dist)}
                      </div>
                    )}
                    <div style={{
                      padding: '.45rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '.8rem',
                      fontWeight: 700,
                      background: isSelected ? '#C40042' : 'rgba(255,255,255,.08)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,.7)',
                      border: `1px solid ${isSelected ? '#C40042' : 'rgba(255,255,255,.12)'}`,
                      transition: 'all .2s',
                      whiteSpace: 'nowrap',
                      letterSpacing: '.02em',
                    }}>
                      {isSelected ? '✓ Selezionata' : 'Seleziona'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Idle state: mostra lista senza distanze */}
      {!hasSearched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
          {clubs.map(club => {
            const isSelected = selectedId === club.id;
            return (
              <button
                key={club.id}
                type="button"
                onClick={() => onSelect(club.id, club.name)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '1rem', padding: '.875rem 1.125rem', borderRadius: '13px',
                  border: `1.5px solid ${isSelected ? 'rgba(196,0,66,.6)' : 'rgba(255,255,255,.07)'}`,
                  background: isSelected ? 'rgba(196,0,66,.1)' : 'rgba(255,255,255,.02)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseOver={e => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.15)'; } }}
                onMouseOut={e =>  { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.07)'; } }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginBottom: '.18rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '.86rem', color: isSelected ? '#fff' : 'rgba(255,255,255,.8)' }}>
                      {club.name.toUpperCase()}
                    </span>
                    {club.isNew && (
                      <span style={{ fontSize: '.57rem', fontWeight: 700, padding: '.1rem .4rem', borderRadius: '9999px', background: 'rgba(196,0,66,.2)', color: '#ff6080', border: '1px solid rgba(196,0,66,.3)' }}>
                        NUOVO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.35)' }}>{club.address}, {club.city}</div>
                </div>
                <div style={{
                  padding: '.4rem .9rem', borderRadius: '9999px', fontSize: '.78rem', fontWeight: 700,
                  background: isSelected ? '#C40042' : 'rgba(255,255,255,.07)',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,.6)',
                  border: `1px solid ${isSelected ? '#C40042' : 'rgba(255,255,255,.1)'}`,
                  transition: 'all .2s', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {isSelected ? '✓ Selezionata' : 'Seleziona'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
