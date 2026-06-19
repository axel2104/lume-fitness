import { useState } from 'react';

interface MemberResult {
  found: boolean;
  firstName?: string;
  activePlan?: string;
  planExpiry?: string;
  suggestedPlan?: string;
  totalMonths?: number;
  message?: string;
}

const PLAN_NAMES: Record<string, string> = {
  base: 'Base',
  plus: 'Plus',
  premium: 'Premium',
  personal: 'Personal',
};

const PLAN_PRICES: Record<string, number> = {
  base: 39,
  plus: 59,
  premium: 89,
  personal: 120,
};

export default function MemberCheck() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MemberResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/check-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) throw new Error('Errore di rete');
      const data: MemberResult = await res.json();
      setResult(data);
    } catch {
      setError('Qualcosa è andato storto. Riprova tra qualche momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-left">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="la-tua@email.it"
          className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30
                     focus:outline-none focus:border-lume-300/50 focus:ring-1 focus:ring-lume-300/20 transition-all text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-lume-300 text-dark-900 font-semibold px-6 py-3 rounded-xl hover:bg-lume-200
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8"/>
              </svg>
              Ricerca...
            </span>
          ) : 'Verifica'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-dark-700 border border-white/[0.08] rounded-2xl">
          {result.found ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-lume-300/15 flex items-center justify-center text-lume-300 font-bold">
                  {result.firstName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <div className="font-semibold text-white">Ciao, {result.firstName}! 👋</div>
                  <div className="text-white/40 text-xs">{email}</div>
                </div>
              </div>

              {result.activePlan ? (
                <div className="mb-5 p-4 bg-lume-300/5 border border-lume-300/15 rounded-xl">
                  <div className="text-xs text-lume-300/70 uppercase tracking-wider mb-1">Abbonamento attivo</div>
                  <div className="font-semibold text-white">{PLAN_NAMES[result.activePlan]}</div>
                  {result.planExpiry && (
                    <div className="text-white/40 text-xs mt-0.5">
                      Scadenza: {new Date(result.planExpiry).toLocaleDateString('it-IT', { day:'2-digit', month:'long', year:'numeric' })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-5 p-4 bg-white/5 rounded-xl text-white/50 text-sm">
                  Nessun abbonamento attivo al momento.
                </div>
              )}

              {result.suggestedPlan && result.suggestedPlan !== result.activePlan && (
                <div className="p-4 bg-dark-800 border border-white/[0.06] rounded-xl">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Consigliato per te</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-lg text-white">Piano {PLAN_NAMES[result.suggestedPlan]}</div>
                      <div className="text-white/40 text-sm">
                        €{PLAN_PRICES[result.suggestedPlan]}/mese
                        {result.totalMonths && result.totalMonths > 0
                          ? ` · in base ai tuoi ${result.totalMonths} mesi di storico`
                          : ''}
                      </div>
                    </div>
                    <a
                      href={`/prenota?plan=${result.suggestedPlan}`}
                      className="bg-lume-300 text-dark-900 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-lume-200 transition-all"
                    >
                      Scegli
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="text-white/60 text-sm mb-4">
                Nessun membro trovato con questa email. Sei nuovo? Inizia con una settimana gratuita!
              </div>
              <a
                href="/prenota"
                className="inline-flex items-center gap-2 bg-lume-300 text-dark-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-lume-200 transition-all"
              >
                Inizia gratis
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
