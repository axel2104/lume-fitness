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
    phone: '+39 0733 123456', cta: { label: 'Scopri Macerata', href: BASE + 'form/macerata' },
    feat: ['Gym Floor 500m² Technogym', 'Box CrossFit 450m²', 'Sala Reformer Pilates', 'Piscina & Acqua Fitness', 'Sale Fitness Les Mills', 'Scuola Nuoto Bambini'] },
  { n: '02', cat: 'Club', name: 'Lume Montecassiano', status: 'Aperto', accent: 'crimson',
    addr: 'Via Sergio Piermanni 3, 62010 Montecassiano',
    hours: 'Lun–Ven 07:00–22:00 · Sab 08:30–19:00 · Dom chiuso',
    phone: '+39 0733 654321', cta: { label: 'Scopri Montecassiano', href: BASE + 'form/montecassiano' },
    feat: ['Sala pesi attrezzata', 'Corsi di gruppo', 'Piscina & Scuola Nuoto', 'Spogliatoi moderni', 'Parcheggio gratuito'] },
  { n: '03', cat: 'Apertura 2026', name: 'Lume Piediripa', status: 'Apertura 2026', accent: 'amber',
    addr: 'Macerata · Zona Piediripa', hours: 'Apertura prevista 2026',
    phone: 'Iscriviti agli aggiornamenti', cta: { label: 'Vai alla prevendita', href: 'https://axel2104.github.io/lume-prevendita/?sede=piediripa' },
    feat: ['Gym Floor di nuova generazione', 'Sala corsi panoramica', 'Piscina semi-olimpionica', 'Area functional & cardio', 'Ampio parcheggio'] },
  { n: '04', cat: 'Apertura 2026', name: 'Lume Centro', status: 'Apertura 2026', accent: 'amber',
    addr: 'Macerata · Centro Storico', hours: 'Apertura prevista 2026',
    phone: 'Iscriviti agli aggiornamenti', cta: { label: 'Vai alla prevendita', href: 'https://axel2104.github.io/lume-prevendita/?sede=centro' },
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
const Rot = () => (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a6 6 0 0 1 0 12h-3" /></svg>);

const STYLE = `
.ls-brand{position:fixed;top:22px;left:26px;z-index:30;display:flex;align-items:center;gap:10px;pointer-events:none}
.ls-logo{width:30px;height:30px;border-radius:50%;border:1.5px solid #C40042;display:flex;align-items:center;justify-content:center}
.ls-logo i{width:3px;height:14px;background:#C40042;display:block;border-radius:2px}
.ls-wm{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;letter-spacing:.04em;font-size:18px}
.ls-wm b{color:#C40042}
.ls-wm em{color:rgba(255,255,255,.5);font-weight:400;font-size:12px;margin-left:4px;font-style:normal}
.ls-hint{position:fixed;top:26px;right:26px;z-index:30;font-size:12.5px;color:rgba(255,255,255,.4)}
.ls-stage{height:100vh;width:100%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:14px;padding:74px 14px 14px}
.ls-scene{perspective:1600px;min-width:0;min-height:0}
.ls-card{position:relative;width:100%;height:100%;cursor:pointer;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,0,.2,1)}
.ls-card.flipped{transform:rotateY(180deg)}
.ls-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:26px;overflow:hidden;border:1px solid rgba(255,255,255,.10);display:flex;flex-direction:column}
.ls-front{justify-content:flex-end;padding:30px;background:radial-gradient(130% 90% at 80% -10%,var(--accent-glow),transparent 55%),linear-gradient(160deg,#191919,#0c0c0c);transition:border-color .4s ease,box-shadow .4s ease}
.ls-scene:hover .ls-front{border-color:var(--accent-line);box-shadow:0 30px 80px -40px var(--accent-soft)}
.ls-num{position:absolute;top:-6px;right:20px;font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;font-size:170px;line-height:1;color:#fff;opacity:.05;pointer-events:none}
.ls-status{position:absolute;top:24px;left:30px;display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;padding:6px 13px;border-radius:999px;background:var(--accent-chip);color:var(--accent);border:1px solid var(--accent-line)}
.ls-dot{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:lspulse 2s infinite}
@keyframes lspulse{0%{box-shadow:0 0 0 0 var(--accent-soft)}70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}
.ls-ico{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;color:var(--accent);background:var(--accent-chip);border:1px solid var(--accent-line);flex:none}
.ls-cat{font-size:12px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:7px}
.ls-name{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;font-size:clamp(24px,2.4vw,34px);line-height:1.05}
.ls-cue{margin-top:16px;display:inline-flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;color:#fff}
.ls-pl{width:32px;height:32px;border-radius:50%;background:var(--accent);color:#0a0a0a;display:flex;align-items:center;justify-content:center;transition:transform .3s ease}
.ls-scene:hover .ls-pl{transform:rotate(180deg)}
.ls-back{transform:rotateY(180deg);padding:26px 28px;background:linear-gradient(165deg,#181818,#0b0b0b);border-color:var(--accent-line);overflow:auto}
.ls-bhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.ls-bname{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;font-size:21px;color:var(--accent)}
.ls-bbtn{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.05);color:rgba(255,255,255,.65);cursor:pointer;display:flex;align-items:center;justify-content:center}
.ls-bbtn:hover{color:#fff}
.ls-feats{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-bottom:16px}
.ls-feats li{display:flex;gap:9px;align-items:flex-start;font-size:13.5px;color:rgba(255,255,255,.85)}
.ls-ck{flex:none;width:19px;height:19px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent-chip);color:var(--accent);border:1px solid var(--accent-line);margin-top:1px}
.ls-meta{display:flex;flex-direction:column;gap:8px;padding-top:14px;border-top:1px solid rgba(255,255,255,.10);font-size:12.5px;color:rgba(255,255,255,.6)}
.ls-row{display:flex;gap:9px;align-items:center}
.ls-row svg{color:var(--accent);flex:none}
.ls-cta{margin-top:16px;align-self:flex-start;display:inline-flex;align-items:center;gap:9px;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px;color:#0a0a0a;background:var(--accent);text-decoration:none;transition:transform .2s ease}
.ls-cta:hover{transform:scale(1.04)}
@media(max-width:820px){
  html,body{height:100%;overflow:hidden}
  .ls-stage{height:100dvh;gap:10px;padding:54px 10px 10px}
  .ls-front{padding:18px}
  .ls-num{font-size:90px;top:-2px;right:12px}
  .ls-status{top:12px;left:14px;padding:5px 10px;font-size:10px}
  .ls-ico{width:40px;height:40px;border-radius:12px;margin-bottom:9px}
  .ls-cat{font-size:10px;margin-bottom:4px}
  .ls-name{font-size:17px}
  .ls-cue{margin-top:9px;font-size:11.5px}
  .ls-pl{width:26px;height:26px}
  .ls-back{padding:14px 15px}
  .ls-bname{font-size:15px}
  .ls-feats{grid-template-columns:1fr;gap:5px;margin-bottom:9px}
  .ls-feats li{font-size:11.5px}
  .ls-meta{font-size:10.5px;gap:6px;padding-top:9px}
  .ls-cta{padding:9px 14px;font-size:12.5px;margin-top:9px}
  .ls-hint{display:none}
}
`;

function FlipCard({ club }: { club: Club }) {
  const [flipped, setFlipped] = useState(false);
  const a = ACC[club.accent];
  const cssVars = { '--accent': a.c, '--accent-glow': a.glow, '--accent-soft': a.soft, '--accent-chip': a.chip, '--accent-line': a.line } as React.CSSProperties;
  return (
    <div className="ls-scene" style={cssVars}>
      <div
        className={`ls-card${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        role="button" tabIndex={0} aria-pressed={flipped}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); } }}
      >
        <div className="ls-face ls-front">
          <span className="ls-num">{club.n}</span>
          <span className="ls-status"><span className="ls-dot" />{club.status}</span>
          <div className="ls-ico"><Dumbbell /></div>
          <div className="ls-cat">{club.cat}</div>
          <div className="ls-name">{club.name}</div>
          <div className="ls-cue">Scopri il club <span className="ls-pl"><Plus /></span></div>
        </div>
        <div className="ls-face ls-back">
          <div className="ls-bhead">
            <div className="ls-bname">{club.name}</div>
            <button className="ls-bbtn" aria-label="Indietro" onClick={(e) => { e.stopPropagation(); setFlipped(false); }}><Rot /></button>
          </div>
          <ul className="ls-feats">
            {club.feat.map((f) => (<li key={f}><span className="ls-ck"><Check /></span>{f}</li>))}
          </ul>
          <div className="ls-meta">
            <span className="ls-row"><Pin />{club.addr}</span>
            <span className="ls-row"><Clock />{club.hours}</span>
            <span className="ls-row"><PhoneIco />{club.phone}</span>
            <a className="ls-cta" href={club.cta.href} {...(club.cta.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} onClick={(e) => e.stopPropagation()}>{club.cta.label} <Arrow /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromoSedi() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ls-brand">
        <span className="ls-logo"><i /></span>
        <span className="ls-wm"><b>LUME</b><em>FITNESS</em></span>
      </div>
      <div className="ls-hint">Scegli la tua sede</div>
      <div className="ls-stage">
        {CLUBS.map((club) => <FlipCard key={club.n} club={club} />)}
      </div>
    </>
  );
}
