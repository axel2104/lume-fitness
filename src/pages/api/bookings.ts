import type { APIRoute } from 'astro';
// import { supabaseAdmin } from '../../lib/supabase';

export const prerender = false;

interface BookingPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  club: 'macerata' | 'montecassiano';
  plan: string;
  message?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as BookingPayload;
    const { firstName, lastName, email, club, plan } = body;

    // Validazione base
    if (!firstName || !lastName || !email || !club || !plan) {
      return new Response(JSON.stringify({ error: 'Campi obbligatori mancanti' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email non valida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ─── Con Supabase attivo, sostituisci il mock con: ─────────────────────
    // const { error } = await supabaseAdmin
    //   .from('booking_requests')
    //   .insert({
    //     first_name: firstName,
    //     last_name: lastName,
    //     email: email.toLowerCase(),
    //     phone: body.phone,
    //     club,
    //     plan,
    //     message: body.message,
    //     status: 'pending',
    //     created_at: new Date().toISOString(),
    //   });
    //
    // if (error) throw error;
    //
    // Poi invia email di conferma con Resend o Nodemailer
    // ───────────────────────────────────────────────────────────────────────

    // Mock: simula successo
    console.log('[BOOKING]', { firstName, lastName, email, club, plan });

    return new Response(JSON.stringify({ success: true, message: 'Prenotazione ricevuta' }), {
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
