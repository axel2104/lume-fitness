import type { APIRoute } from 'astro';
// import { getMemberByEmail, getSuggestedPlans } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email non valida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ─── Con Supabase attivo, sostituisci il mock con: ─────────────────────
    // const member = await getMemberByEmail(email);
    // if (!member) return new Response(JSON.stringify({ found: false }), { ... });
    // const suggestedPlan = await getSuggestedPlans(member.id);
    // return new Response(JSON.stringify({ found: true, firstName: member.first_name, ... }));
    // ───────────────────────────────────────────────────────────────────────

    // Mock per sviluppo locale
    const mockMembers: Record<string, object> = {
      'test@lume.it': {
        found: true,
        firstName: 'Marco',
        activePlan: 'plus',
        planExpiry: '2025-03-31',
        suggestedPlan: 'premium',
        totalMonths: 8,
      },
      'nuovo@test.it': {
        found: true,
        firstName: 'Giulia',
        activePlan: null,
        planExpiry: null,
        suggestedPlan: 'base',
        totalMonths: 0,
      },
    };

    const result = mockMembers[email] ?? { found: false };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch {
    return new Response(JSON.stringify({ error: 'Errore interno del server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
