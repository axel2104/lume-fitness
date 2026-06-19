/**
 * Cloudflare Worker — Proxy PerfectGym API
 *
 * Riceve i dati del form prevendita dal browser (GitHub Pages),
 * autentica con PerfectGym e crea un Lead nel sistema.
 *
 * Deploy: wrangler deploy
 * Secrets (wrangler secret put):
 *   - PG_URL        → https://lumefitness.perfectgym.com
 *   - PG_LOGIN      → email admin PerfectGym
 *   - PG_PASSWORD   → password admin PerfectGym
 *   - ALLOWED_ORIGIN → https://tuousername.github.io (o dominio custom)
 */

// ── Club ID map: slug → ID numerico PerfectGym ────────────────────────────
// Recuperabili da: GET /Api/v2.0/Clubs/All (autenticato)
const CLUB_ID_MAP = {
  macerata:        1,   // ← sostituire con ID reali dal pannello PerfectGym
  montecassiano:   2,
  piediripa:       3,
  centro_macerata: 4,
};

// ── Piano → Note descrittiva ───────────────────────────────────────────────
const PLAN_LABELS = {
  base:     'Piano Base — Sala pesi + cardio',
  plus:     'Piano Plus — Corsi illimitati + 2 sedi',
  premium:  'Piano Premium — Tutto incluso + piscina',
  personal: 'Piano Personal — PT dedicato 1:1',
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '';

    // ── CORS preflight ─────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204, origin, allowed);
    }

    if (request.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405, origin, allowed);
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse({ error: 'Body non valido' }, 400, origin, allowed);
    }

    const { firstName, lastName, email, phone, sede, piano } = body;

    if (!firstName || !lastName || !email || !sede) {
      return corsResponse({ error: 'Campi obbligatori mancanti' }, 400, origin, allowed);
    }

    const pgBase = env.PG_URL; // es. https://lumefitness.perfectgym.com

    try {
      // ── 1. Autenticazione PerfectGym ──────────────────────────────────────
      const authRes = await fetch(`${pgBase}/Api/v2.0/Users/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Login:    env.PG_LOGIN,
          Password: env.PG_PASSWORD,
        }),
      });

      if (!authRes.ok) {
        console.error('PG auth failed', authRes.status);
        return corsResponse({ error: 'Errore autenticazione PerfectGym' }, 502, origin, allowed);
      }

      const authData = await authRes.json();
      const token = authData?.AuthToken || authData?.Token || authData?.token;

      if (!token) {
        console.error('No token in PG response', JSON.stringify(authData));
        return corsResponse({ error: 'Token PerfectGym non ricevuto' }, 502, origin, allowed);
      }

      // ── 2. Crea Lead in PerfectGym ────────────────────────────────────────
      const clubId = CLUB_ID_MAP[sede] ?? CLUB_ID_MAP.macerata;
      const notes  = `Prevendita 2026/27 — ${PLAN_LABELS[piano] ?? piano} — Iscritto via landing page`;

      const leadRes = await fetch(`${pgBase}/Api/v2.0/Leads`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          FirstName:   firstName,
          LastName:    lastName,
          Email:       email,
          Phone:       phone || '',
          ClubId:      clubId,
          Description: notes,
          // Campi aggiuntivi supportati da PerfectGym:
          // LeadSourceId: 1,  // "Web" — configurabile nel pannello
          // AssignedEmployeeId: null,
        }),
      });

      if (!leadRes.ok) {
        const errText = await leadRes.text();
        console.error('PG lead creation failed', leadRes.status, errText);

        // Fallback: se /Leads non esiste, prova /Contacts
        if (leadRes.status === 404) {
          return await createContact({ pgBase, token, firstName, lastName, email, phone, clubId, notes, origin, allowed });
        }

        return corsResponse({ error: 'Errore creazione lead in PerfectGym', details: errText }, 502, origin, allowed);
      }

      const leadData = await leadRes.json();

      return corsResponse({
        success: true,
        leadId:  leadData?.Id ?? leadData?.id ?? null,
        message: `${firstName}, sei in lista! Ti contatteremo presto con i dettagli dell'abbonamento.`,
      }, 200, origin, allowed);

    } catch (err) {
      console.error('Worker error', err.message);
      return corsResponse({ error: 'Errore interno', message: err.message }, 500, origin, allowed);
    }
  },
};

// ── Fallback: crea Contatto invece di Lead ─────────────────────────────────
async function createContact({ pgBase, token, firstName, lastName, email, phone, clubId, notes, origin, allowed }) {
  const res = await fetch(`${pgBase}/Api/v2.0/Contacts`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      FirstName: firstName,
      LastName:  lastName,
      Email:     email,
      Phone:     phone || '',
      ClubId:    clubId,
      Notes:     notes,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return corsResponse({ error: 'Errore creazione contatto', details: errText }, 502, origin, allowed);
  }

  const data = await res.json();
  return corsResponse({
    success: true,
    contactId: data?.Id ?? null,
    message: `Registrazione completata!`,
  }, 200, origin, allowed);
}

// ── Helper CORS ────────────────────────────────────────────────────────────
function corsResponse(body, status, origin, allowed) {
  // Permetti origin specificato O localhost per sviluppo
  const isAllowed =
    origin === allowed ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    (allowed === '*');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed,
  };

  return new Response(
    body !== null ? JSON.stringify(body) : null,
    { status, headers }
  );
}
