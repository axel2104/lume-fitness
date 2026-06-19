import { useState } from 'react';
import ClubSelector from './ClubSelector';

const PIANI = [
  { id: 'base',     label: 'Base',     desc: 'Sala pesi + cardio' },
  { id: 'plus',     label: 'Plus',     desc: 'Corsi illimitati + 2 sedi' },
  { id: 'premium',  label: 'Premium',  desc: 'Tutto incluso + piscina' },
  { id: 'personal', label: 'Personal', desc: 'PT dedicato 1:1' },
];

interface FormState {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  sede:      string;
  piano:     string;
}

// URL del Cloudflare Worker — impostare come variabile d'ambiente PUBLIC_WORKER_URL
// oppure sostituire direttamente con l'URL del worker deployato:
// es. https://lume-prevendita-worker.tuousername.workers.dev
const WORKER_URL =
  (import.meta as any).env?.PUBLIC_WORKER_URL ??
  'https://lume-prevendita-worker.tuousername.workers.dev';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function PrevenditaForm() {
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '', sede: '', piano: '',
  });
  const [status, setStatus]   = useState<Status>('idle');
  const [errMsg, setErrMsg]   = useState('');
  const [waitMsg, setWaitMsg] = useState('');

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');

    try {
      // Invia al Cloudflare Worker → PerfectGym API
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Errore sconosciuto');

      // PerfectGym registra il lead → mostra conferma
      setStatus('success');
      setWaitMsg(data.message ?? `${form.firstName}, sei in lista!`);
    } catch (err) {
      setStatus('error');
      setErrMsg(err instanceof Error ? err.message : 'Errore. Riprova.');
    }
  };

  // ── Success: registrato in PerfectGym ─────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
        <div style={{
          width: '4.5rem', height: '4.5rem', borderRadius: '50%',
          background: 'rgba(196,0,66,.15)', border: '1.5px solid rgba(196,0,66,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#C40042" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem', marginBottom: '.5rem' }}>
          Sei dentro! 🎉
        </h3>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', lineHeight: 1.75, maxWidth: '26rem', margin: '0 auto 1.5rem' }}>
          {waitMsg} Sei stato registrato nel nostro sistema — ti contatteremo con i dettagli dell'abbonamento early bird.
        </p>
        <div style={{
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '12px', padding: '1rem 1.25rem', display: 'inline-block',
        }}>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.4)', marginBottom: '.25rem' }}>Registrato per</p>
          <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{form.firstName} {form.lastName}</p>
          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.45)' }}>{form.email}</p>
          <p style={{ fontSize: '.8rem', color: '#C40042', marginTop: '.25rem' }}>
            {form.sede.replace('_', ' ')} · Piano {form.piano}
          </p>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    padding: '.72rem 1rem',
    color: '#fff',
    fontSize: '.875rem',
    outline: 'none',
    transition: 'border-color .2s',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '.72rem',
    color: 'rgba(255,255,255,.42)',
    display: 'block',
    marginBottom: '.38rem',
    fontWeight: 500,
    letterSpacing: '.02em',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Nome + Cognome */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
        <div>
          <label style={labelStyle}>Nome *</label>
          <input required type="text" value={form.firstName} onChange={set('firstName')}
            placeholder="Marco" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(196,0,66,.55)')}
            onBlur={e =>  (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>Cognome *</label>
          <input required type="text" value={form.lastName} onChange={set('lastName')}
            placeholder="Rossi" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(196,0,66,.55)')}
            onBlur={e =>  (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
          />
        </div>
      </div>

      {/* Email + Telefono */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
        <div>
          <label style={labelStyle}>Email *</label>
          <input required type="email" value={form.email} onChange={set('email')}
            placeholder="marco@email.it" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(196,0,66,.55)')}
            onBlur={e =>  (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>Telefono</label>
          <input type="tel" value={form.phone} onChange={set('phone')}
            placeholder="+39 333 1234567" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(196,0,66,.55)')}
            onBlur={e =>  (e.target.style.borderColor = 'rgba(255,255,255,.1)')}
          />
        </div>
      </div>

      {/* Sede — ClubSelector con geolocalizzazione */}
      <div>
        <label style={{ ...labelStyle, marginBottom: '.6rem' }}>Sede *</label>
        <ClubSelector
          selectedId={form.sede}
          onSelect={(id) => setForm(p => ({ ...p, sede: id }))}
        />
        {/* Hidden required input per validazione HTML5 */}
        <input
          type="text" required value={form.sede} readOnly
          style={{ opacity: 0, height: 0, padding: 0, margin: 0, position: 'absolute' }}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Piano */}
      <div>
        <label style={labelStyle}>Piano di interesse *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
          {PIANI.map(p => (
            <label key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '.65rem',
              padding: '.75rem 1rem', borderRadius: '12px', cursor: 'pointer',
              border: `1.5px solid ${form.piano === p.id ? 'rgba(196,0,66,.6)' : 'rgba(255,255,255,.08)'}`,
              background: form.piano === p.id ? 'rgba(196,0,66,.1)' : 'rgba(255,255,255,.03)',
              transition: 'all .2s',
            }}>
              <input type="radio" name="piano" value={p.id} required
                style={{ display: 'none' }}
                checked={form.piano === p.id}
                onChange={() => setForm(prev => ({ ...prev, piano: p.id }))}
              />
              <div style={{
                width: '10px', height: '10px', borderRadius: '50', flexShrink: 0,
                background: form.piano === p.id ? '#C40042' : 'transparent',
                border: `2px solid ${form.piano === p.id ? '#C40042' : 'rgba(255,255,255,.25)'}`,
                transition: 'all .2s',
              }} />
              <div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: form.piano === p.id ? '#fff' : 'rgba(255,255,255,.7)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '.71rem', color: 'rgba(255,255,255,.35)' }}>{p.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div style={{
          padding: '.875rem 1rem', borderRadius: '10px',
          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
          color: '#fca5a5', fontSize: '.84rem',
        }}>
          {errMsg}
        </div>
      )}

      {/* CTA */}
      <button type="submit" disabled={status === 'loading'} style={{
        width: '100%', padding: '1rem',
        background: status === 'loading' ? 'rgba(196,0,66,.6)' : '#C40042',
        color: '#fff', fontWeight: 700, fontSize: '1rem',
        borderRadius: '14px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
        transition: 'all .22s', fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: '-.01em',
        boxShadow: status === 'loading' ? 'none' : '0 8px 32px rgba(196,0,66,.35)',
      }}
        onMouseOver={e => { if (status !== 'loading') (e.currentTarget.style.background = '#d8004a'); }}
        onMouseOut={e =>  { if (status !== 'loading') (e.currentTarget.style.background = '#C40042'); }}
      >
        {status === 'loading' ? (
          <>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8"/>
            </svg>
            Elaborazione…
          </>
        ) : (
          <>
            Blocca il tuo posto
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8h8M9.5 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: '.71rem', color: 'rgba(255,255,255,.22)', lineHeight: 1.6 }}>
        I tuoi dati vengono registrati nel nostro sistema di gestione.
        <br/>Inviando accetti la <a href="/privacy" style={{ color: 'rgba(255,255,255,.38)' }}>Privacy Policy</a>.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
