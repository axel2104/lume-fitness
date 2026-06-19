import { useState } from 'react';

const BASE = import.meta.env.BASE_URL;

interface Club {
  n: string; cat: string; name: string; status: string;
  accent: 'crimson' | 'amber'; addr: string; hours: string; phone: string;
  cta: { label: string; href: string }; feat: string[];
}

const CLUBS: Club[] = [
  { n: '01', cat: 'Flagship Club', name: 'Lume Macerata', status: 'Aperto', accent: 'crimson',
    addr: 'Piazzale Mario Fattorini 1, 62100 Macerata',
    hours: 'Lun–Ven 06:30–22:30 · Sab 08:00–20:00 · Dom 09:00–14:00',
    phone: '+39 0733 123456', cta: { label: 'Scopri Macerata', href: BASE + 'sedi/macerata' },
    feat: ['Gym Floor 500m² Technogym', 'Box CrossFit 450m²', 'Sala Reformer Pilates', 'Piscina & Acqua Fitness', 'Sale Fitness Les Mills', 'Scuola Nuoto Bambini'] },
  { n: '02', cat: 'Club', name: 'Lume Montecassiano', status: 'Aperto', accent: 'crimson',
    addr: 'Via Sergio Piermanni 3, 62010 Montecassiano',
    hours: 'Lun–Ven 07:00–22:00 · Sab 08:30–19:00 · Dom chiuso',
    phone: '+39 0733 654321', cta: { label: 'Scopri Montecassiano', href: BASE + 'sedi/montecassiano' },
    feat: ['Sala pesi attrezzata', 'Corsi di gruppo', 'Piscina & Scuola Nuoto', 'Spogliatoi moderni', 'Parcheggio gratuito'] },
  { n: '03', cat: 'Apertura 2026', name: 'Lume Piediripa', status: 'Apertura 2026', accent: 'amber',
    addr: 'Macerata · Zona Piediripa', hours: 'Apertura prevista 2026',
    phone: 'Iscriviti agli aggiornamenti', cta: { label: 'Resta aggiornato', href: BASE + 'prevendita' },
    feat: ['Gym Floor di nuova generazione', 'Sala corsi panoramica', 'Piscina semi-olimpionica', 'Area functional & cardio', 'Ampio parcheggio'] },
  { n: '04', cat: 'Apertura 2026', name: 'Lume Centro', status: 'Apertura 2026', accent: 'amber',
    addr: 'Macerata · Centro Storico', hours: 'Apertura prevista 2026',
    phone: 'Iscriviti agli aggiornamenti', cta: { label: 'Resta aggiornato', href: BASE + 'prevendita' },
    feat: ['Boutique gym nel cuore della città', 'Box CrossFit dedicato', 'Studio Reformer Pilates', 'Personal training su misura', 'Lounge & recovery zone'] },
];

const ACC = {
  crimson: { c: '#C40042', glow: 'rgba(196,0,66,.22)', soft: 'rgba(196,0,66,.5)', chip: 'rgba(196,0,66,.14)', line: 'rgba(196,0,66,.5)' },
  amber: { c: '#f5a623', glow: 'rgba(245,166,35,.18)', soft: 'rgba(245,166,35,.45)', chip: 'rgba(245,166,35,.13)', line: 'rgba(245,166,35,.46)' },
} as const;

const Dumbbell = () => (<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7v10M6 5v2M6 17v2M18 7v10M18 5v2M18 17v2M3 9v6M21 9v6M6 12h12" /></svg>);
const Pin = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
const Clock = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const PhoneIco = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>);
const Check = () => (<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>);
const Arrow = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>);
const Plus = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>);
const X = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>);

const STYLE = `
.ls-brand{position:fixed;top:22px;left:26px;z-index:30;display:flex;align-items:center;gap:10px;pointer-events:none}
.ls-logo{width:30px;height:30px;border-radius:50%;border:1.5px solid #C40042;display:flex;align-items:center;justify-content:center}
.ls-logo i{width:3px;height:14px;background:#C40042;display:block;border-radius:2px}
.ls-wm{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;letter-spacing:.04em;font-size:18px}
.ls-wm b{color:#C40042}
.ls-wm em{color:rgba(255,255,255,.5);font-weight:400;font-size:12px;margin-left:4px;font-style:normal}
.ls-hint{position:fixed;top:26px;right:26px;z-index:30;font-size:12.5px;color:rgba(255,255,255,.4)}
.ls-stage{height:100vh;width:100%;display:grid;gap:14px;padding:74px 14px 14px;
  transition:grid-template-columns .65s cubic-bezier(.65,0,.35,1),grid-template-rows .65s cubic-bezier(.65,0,.35,1)}
.ls-tile{position:relative;border-radius:26px;overflow:hidden;cursor:pointer;border:1px solid rgba(255,255,255,.10);
  display:flex;flex-direction:column;justify-content:flex-end;padding:30px;min-width:0;min-height:0;
  background:radial-gradient(130% 90% at 80% -10%,var(--accent-glow),transparent 55%),linear-gradient(160deg,#191919,#0c0c0c);
  transition:border-color .5s ease,box-shadow .5s ease,opacity .5s ease}
.ls-tile:hover{border-color:var(--accent-line)}
.ls-tile.active{border-color:var(--accent-line);box-shadow:0 40px 90px -40px var(--accent-soft)}
.ls-tile.dim{opacity:.6}
.ls-num{position:absolute;top:-6px;right:20px;font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;font-size:180px;line-height:1;color:#fff;opacity:.05;pointer-events:none}
.ls-status{position:absolute;top:24px;left:30px;display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:6px 13px;border-radius:999px;background:var(--accent-chip);color:var(--accent);border:1px solid var(--accent-line)}
.ls-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:lspulse 2s infinite}
@keyframes lspulse{0%{box-shadow:0 0 0 0 var(--accent-soft)}70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}
.ls-ico{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;color:var(--accent);background:var(--accent-chip);border:1px solid var(--accent-line);flex:none}
.ls-cat{font-size:12px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:7px}
.ls-name{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;font-size:clamp(24px,2.4vw,36px);line-height:1.05}
.ls-cue{margin-top:14px;display:inline-flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;color:#fff;opacity:.85}
.ls-pl{width:32px;height:32px;border-radius:50%;background:var(--accent);color:#0a0a0a;display:flex;align-items:center;justify-content:center;transition:transform .3s ease}
.ls-tile:hover .ls-pl{transform:scale(1.08)}
.ls-tile.active .ls-cue{display:none}
.ls-detail{max-height:0;opacity:0;overflow:hidden;transition:max-height .6s ease,opacity .45s ease}
.ls-tile.active .ls-detail{max-height:520px;opacity:1;margin-top:22px;transition:max-height .7s ease,opacity .5s ease .2s}
.ls-feats{display:grid;grid-template-columns:1fr 1fr;gap:11px 22px;margin-bottom:20px}
.ls-feats li{list-style:none;display:flex;gap:10px;align-items:flex-start;font-size:14px;color:rgba(255,255,255,.85)}
.ls-ck{flex:none;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent-chip);color:var(--accent);border:1px solid var(--accent-line);margin-top:1px}
.ls-meta{display:flex;flex-direction:column;gap:9px;padding-top:16px;border-top:1px solid rgba(255,255,255,.10);font-size:13px;color:rgba(255,255,255,.6)}
.ls-row{display:flex;gap:10px;align-items:center}
.ls-row svg{color:var(--accent);flex:none}
.ls-cta{margin-top:16px;align-self:flex-start;display:inline-flex;align-items:center;gap:9px;padding:13px 22px;border-radius:999px;font-weight:600;font-size:14px;color:#0a0a0a;background:var(--accent);text-decoration:none;transition:transform .2s ease}
.ls-cta:hover{transform:scale(1.04)}
.ls-close{position:absolute;top:22px;right:24px;z-index:5;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.35);color:#fff;cursor:pointer;display:none;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
.ls-tile.active .ls-close{display:flex}
@media(max-width:820px){
  .ls-stage{height:auto;min-height:100vh;grid-template-columns:1fr!important;grid-template-rows:none!important;padding:70px 12px 12px}
  .ls-tile{min-height:200px}
  .ls-tile.active{min-height:auto}
  .ls-feats{grid-template-columns:1fr}
}
`;

export default function PromoSedi() {
  const [active, setActive] = useState<number | null>(null);
  const cols = active === null ? '1fr 1fr' : (active % 2 === 0 ? '2.3fr 1fr' : '1fr 2.3fr');
  const rows = active === null ? '1fr 1fr' : (Math.floor(active / 2) === 0 ? '2.3fr 1fr' : '1fr 2.3fr');
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ls-brand">
        <span className="ls-logo"><i /></span>
        <span className="ls-wm"><b>LUME</b><em>FITNESS</em></span>
      </div>
      <div className="ls-hint">Scegli la tua sede</div>
      <div className="ls-stage" style={{ gridTemplateColumns: cols, gridTemplateRows: rows }}>
        {CLUBS.map((club, i) => {
          const a = ACC[club.accent];
          const isActive = active === i;
          const cssVars = { '--accent': a.c, '--accent-glow': a.glow, '--accent-soft': a.soft, '--accent-chip': a.chip, '--accent-line': a.line } as React.CSSProperties;
          return (
            <div
              key={club.n}
              className={`ls-tile${isActive ? ' active' : ''}${active !== null && !isActive ? ' dim' : ''}`}
              style={cssVars}
              onClick={() => setActive(isActive ? null : i)}
              role="button" tabIndex={0} aria-expanded={isActive}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(isActive ? null : i); } }}
            >
              <span className="ls-num">{club.n}</span>
              <span className="ls-status"><span className="ls-dot" />{club.status}</span>
              <button className="ls-close" aria-label="Chiudi" onClick={(e) => { e.stopPropagation(); setActive(null); }}><X /></button>
              <div className="ls-ico"><Dumbbell /></div>
              <div className="ls-cat">{club.cat}</div>
              <div className="ls-name">{club.name}</div>
              <div className="ls-cue">Scopri il club <span className="ls-pl"><Plus /></span></div>
              <div className="ls-detail">
                <ul className="ls-feats">
                  {club.feat.map((f) => (<li key={f}><span className="ls-ck"><Check /></span>{f}</li>))}
                </ul>
                <div className="ls-meta">
                  <span className="ls-row"><Pin />{club.addr}</span>
                  <span className="ls-row"><Clock />{club.hours}</span>
                  <span className="ls-row"><PhoneIco />{club.phone}</span>
                </div>
                <a className="ls-cta" href={club.cta.href} onClick={(e) => e.stopPropagation()}>{club.cta.label} <Arrow /></a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
