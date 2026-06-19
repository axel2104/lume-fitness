import { useState } from 'react';

const BASE = import.meta.env.BASE_URL;

interface Props {
  variant: 'trial' | 'prevendita';
  sedeName: string;   // es. "Lume Macerata"
  sedeSlug: string;   // es. "macerata"
  accent?: string;    // colore brand
}

const PIANI = [
  { id: 'base', label: 'Base', desc: 'Sala pesi + cardio' },
  { id: 'plus', label: 'Plus', desc: 'Corsi illimitati + 2 sedi' },
  { id: 'premium', label: 'Premium', desc: 'Tutto incluso + piscina' },
  { id: 'personal', label: 'Personal', desc: 'PT dedicato 1:1' },
];

type Status = 'idle' | 'loading' | 'success';

export default function SedeForm({ variant, sedeName, sedeSlug, accent = '#C40042' }: Props) {
  const isTrial = variant === 'trial';
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', piano: '' });
  const [status, setStatus] = useState<Status>('idle');

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Payload pronto per il backend (Cloudflare Worker / PerfectGym / Formspree…).
    // TODO: collega qui l'endpoint reale; per ora mostra conferma.
    const payload = { ...form, sede: sedeSlug, tipo: isTrial ? 'prova7giorni' : 'prevendita' };
    console.log('LUME form submit →', payload);
    setTimeout(() => setStatus('success'), 600);
  };

  const A = accent;
  const STYLE = `
  .sf-wrap{max-width:560px;margin:0 auto;padding:84px 22px 60px;--a:${A}}
  .sf-back{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.55);text-decoration:none;font-size:14px;margin-bottom:26px}
  .sf-back:hover{color:#fff}
  .sf-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--a);background:color-mix(in srgb,var(--a) 14%,transparent);border:1px solid color-mix(in srgb,var(--a) 45%,transparent);margin-bottom:16px}
  .sf-dot{width:7px;height:7px;border-radius:50%;background:var(--a)}
  .sf-h1{font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:clamp(30px,5vw,42px);line-height:1.04;color:#fff}
  .sf-h1 em{color:var(--a);font-style:normal}
  .sf-lead{margin-top:12px;color:rgba(255,255,255,.6);line-height:1.65;font-size:15px}
  .sf-sede{margin-top:20px;display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
  .sf-sede .lab{font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em}
  .sf-sede .val{font-weight:600;color:#fff}
  .sf-sede .ic{color:var(--a)}
  form.sf{margin-top:24px;display:flex;flex-direction:column;gap:15px}
  .sf-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .sf-field{display:flex;flex-direction:column;gap:6px}
  .sf-field label{font-size:12px;color:rgba(255,255,255,.5);font-weight:500}
  .sf-field input{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px;color:#fff;font-size:15px;font-family:inherit;outline:none;transition:border-color .2s}
  .sf-field input:focus{border-color:var(--a)}
  .sf-plabel{font-size:12px;color:rgba(255,255,255,.5);font-weight:500;margin-bottom:2px}
  .sf-piani{display:grid;grid-template-columns:1fr 1fr;gap:9px}
  .sf-piano{display:flex;align-items:center;gap:11px;padding:12px 14px;border-radius:12px;cursor:pointer;border:1.5px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);transition:all .2s}
  .sf-piano.on{border-color:color-mix(in srgb,var(--a) 60%,transparent);background:color-mix(in srgb,var(--a) 10%,transparent)}
  .sf-piano .rb{width:11px;height:11px;border-radius:50%;flex:none;border:2px solid rgba(255,255,255,.25)}
  .sf-piano.on .rb{background:var(--a);border-color:var(--a)}
  .sf-piano .pl{font-size:14px;font-weight:600;color:rgba(255,255,255,.75)}
  .sf-piano.on .pl{color:#fff}
  .sf-piano .pd{font-size:11px;color:rgba(255,255,255,.4)}
  .sf-btn{margin-top:6px;display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border:none;border-radius:14px;background:var(--a);color:#0a0a0a;font-weight:700;font-size:15px;font-family:'Space Grotesk',Inter,sans-serif;cursor:pointer;transition:transform .2s ease}
  .sf-btn:hover{transform:translateY(-1px)}
  .sf-btn:disabled{opacity:.65;cursor:not-allowed}
  .sf-note{text-align:center;font-size:11.5px;color:rgba(255,255,255,.28);line-height:1.6;margin-top:2px}
  .sf-note a{color:rgba(255,255,255,.45)}
  .sf-ok{text-align:center;padding:50px 10px}
  .sf-ok .ring{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;background:color-mix(in srgb,var(--a) 15%,transparent);border:1.5px solid color-mix(in srgb,var(--a) 45%,transparent);color:var(--a)}
  .sf-ok h2{font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:26px;color:#fff}
  .sf-ok p{margin-top:10px;color:rgba(255,255,255,.6);line-height:1.6;max-width:380px;margin-left:auto;margin-right:auto}
  @media(max-width:560px){.sf-row{grid-template-columns:1fr}.sf-piani{grid-template-columns:1fr}}
  `;

  if (status === 'success') {
    return (
      <div className="sf-wrap">
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div className="sf-ok">
          <div className="ring">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2>{isTrial ? 'Prova attivata!' : 'Sei in lista!'}</h2>
          <p>
            Grazie {form.firstName || ''}! {isTrial
              ? `Ti contatteremo per fissare la tua prova gratuita di 7 giorni presso ${sedeName}.`
              : `Ti contatteremo con i dettagli early bird per ${sedeName}.`}
          </p>
          <a className="sf-back" style={{ marginTop: 24, display: 'inline-flex' }} href={BASE}>&larr; Torna alle sedi</a>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-wrap">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <a className="sf-back" href={BASE}>&larr; Tutte le sedi</a>

      <span className="sf-badge"><span className="sf-dot" />{isTrial ? 'Prova gratuita 7 giorni' : 'Prevendita · Early Bird'}</span>
      <h1 className="sf-h1">
        {isTrial ? <>Allenati <em>7 giorni gratis</em></> : <>Blocca il tuo posto <em>2026/27</em></>}
      </h1>
      <p className="sf-lead">
        {isTrial
          ? 'Prenota la tua settimana di prova gratuita: accesso completo, nessun obbligo. Ti ricontattiamo per organizzare l’ingresso.'
          : 'Abbonati in prevendita a tariffa early bird. Posti limitati: chi si prenota ora ha priorità e prezzo bloccato.'}
      </p>

      <div className="sf-sede">
        <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></span>
        <span><span className="lab">Sede selezionata</span><br /><span className="val">{sedeName}</span></span>
      </div>

      <form className="sf" onSubmit={submit}>
        <div className="sf-row">
          <div className="sf-field"><label>Nome *</label><input required value={form.firstName} onChange={set('firstName')} placeholder="Marco" /></div>
          <div className="sf-field"><label>Cognome *</label><input required value={form.lastName} onChange={set('lastName')} placeholder="Rossi" /></div>
        </div>
        <div className="sf-row">
          <div className="sf-field"><label>Email *</label><input required type="email" value={form.email} onChange={set('email')} placeholder="marco@email.it" /></div>
          <div className="sf-field"><label>Telefono *</label><input required type="tel" value={form.phone} onChange={set('phone')} placeholder="+39 333 1234567" /></div>
        </div>

        {!isTrial && (
          <div>
            <div className="sf-plabel">Piano di interesse *</div>
            <div className="sf-piani">
              {PIANI.map((p) => (
                <label key={p.id} className={`sf-piano${form.piano === p.id ? ' on' : ''}`}>
                  <input type="radio" name="piano" value={p.id} required checked={form.piano === p.id} onChange={() => setForm((s) => ({ ...s, piano: p.id }))} style={{ display: 'none' }} />
                  <span className="rb" />
                  <span><span className="pl">{p.label}</span><br /><span className="pd">{p.desc}</span></span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button className="sf-btn" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Invio…' : (isTrial ? 'Attiva la prova gratuita' : 'Blocca il tuo posto')}
          {status !== 'loading' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
        </button>
        <p className="sf-note">Inviando accetti la <a href={BASE + 'privacy'}>Privacy Policy</a>. I dati sono usati solo per ricontattarti.</p>
      </form>
    </div>
  );
}
