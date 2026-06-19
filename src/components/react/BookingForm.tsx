import { useState } from 'react';
import type { ClubId, PlanId } from '../../lib/types';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  club: ClubId | '';
  plan: PlanId | 'trial' | '';
  message: string;
}

const INITIAL: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  club: '', plan: '', message: '',
};

interface Props {
  defaultPlan?: string;
}

export default function BookingForm({ defaultPlan = '' }: Props) {
  const [form, setForm] = useState<FormData>({ ...INITIAL, plan: defaultPlan as FormData['plan'] });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Errore durante la prenotazione.');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore imprevisto.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-lume-300/15 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#c2ff00" strokeWidth="1.5"/>
            <path d="M8 12l3 3 5-5" stroke="#c2ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="font-display font-bold text-2xl text-white mb-2">Richiesta inviata!</h3>
        <p className="text-white/50 text-sm max-w-sm mx-auto">
          Ti contatteremo entro 24 ore per confermare la tua prenotazione. Controlla anche la spam.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm(INITIAL); }}
          className="mt-6 text-lume-300 text-sm hover:underline"
        >
          Invia un'altra richiesta
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm ' +
    'focus:outline-none focus:border-lume-300/50 focus:ring-1 focus:ring-lume-300/20 transition-all';

  const labelClass = 'block text-xs text-white/50 mb-1.5 font-medium';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome *</label>
          <input required type="text" value={form.firstName} onChange={set('firstName')} placeholder="Marco" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cognome *</label>
          <input required type="text" value={form.lastName} onChange={set('lastName')} placeholder="Rossi" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email *</label>
          <input required type="email" value={form.email} onChange={set('email')} placeholder="marco@email.it" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefono</label>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+39 333 1234567" className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Sede *</label>
          <select required value={form.club} onChange={set('club')} className={`${inputClass} cursor-pointer`}>
            <option value="" disabled>Scegli la sede</option>
            <option value="macerata">Macerata</option>
            <option value="montecassiano">Montecassiano</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Piano di interesse *</label>
          <select required value={form.plan} onChange={set('plan')} className={`${inputClass} cursor-pointer`}>
            <option value="" disabled>Scegli il piano</option>
            <option value="trial">Prova gratuita (7 giorni)</option>
            <option value="base">Base — €39/mese</option>
            <option value="plus">Plus — €59/mese</option>
            <option value="premium">Premium — €89/mese</option>
            <option value="personal">Personal — €120/mese</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Messaggio (opzionale)</label>
        <textarea
          value={form.message}
          onChange={set('message')}
          placeholder="Hai obiettivi specifici? Vuoi sapere qualcosa in più?"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lume-300 text-dark-900 font-semibold py-3.5 rounded-xl hover:bg-lume-200
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8"/>
            </svg>
            Invio in corso...
          </>
        ) : 'Prenota la sessione gratuita'}
      </button>

      <p className="text-center text-xs text-white/25">
        Inviando accetti la nostra{' '}
        <a href="/privacy" className="text-white/40 hover:text-white/60 underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
