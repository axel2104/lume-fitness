import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

// ─── Mappa piano → Price ID Stripe ──────────────────────────────────────────
// Popolati tramite variabili d'ambiente una volta definiti i listini
const PRICE_MAP: Record<string, string | undefined> = {
  base:     import.meta.env.STRIPE_PRICE_BASE,
  plus:     import.meta.env.STRIPE_PRICE_PLUS,
  premium:  import.meta.env.STRIPE_PRICE_PREMIUM,
  personal: import.meta.env.STRIPE_PRICE_PERSONAL,
};

interface CheckoutBody {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  sede:      string;
  piano:     string;
}

export const POST: APIRoute = async ({ request }) => {
  // Validazione variabili d'ambiente
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return json({ error: 'Stripe non configurato. Aggiungi STRIPE_SECRET_KEY al file .env' }, 500);
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body non valido' }, 400);
  }

  const { firstName, lastName, email, phone, sede, piano } = body;

  // Validazione campi obbligatori
  if (!firstName || !lastName || !email || !sede || !piano) {
    return json({ error: 'Campi obbligatori mancanti' }, 400);
  }
  if (!email.includes('@')) {
    return json({ error: 'Email non valida' }, 400);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
  const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? 'https://lumefitness.it';
  const priceId  = PRICE_MAP[piano];

  // ── Se i listini NON sono ancora configurati → modalità lista d'attesa ──────
  // Il cliente viene salvato su Stripe come Customer senza pagamento,
  // così avrai già tutti i dati pronti quando attivi i prezzi.
  if (!priceId) {
    try {
      // Crea / recupera Customer su Stripe (utile per il follow-up)
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
      const customer = customers.data[0] ?? await stripe.customers.create({
        email: email.toLowerCase(),
        name:  `${firstName} ${lastName}`,
        phone: phone || undefined,
        metadata: { sede, piano, source: 'prevendita_2026_27', tipo: 'lista_attesa' },
      });

      // Salva anche su Supabase se configurato (opzionale)
      // await supabaseAdmin.from('prevendita_leads').insert({ ... });

      console.log('[PREVENDITA] Lista attesa:', { email, sede, piano, customerId: customer.id });

      return json({
        mode: 'waitlist',
        message: 'Sei in lista! Ti contatteremo non appena i prezzi saranno disponibili.',
        customerId: customer.id,
      }, 200);

    } catch (err) {
      console.error('[STRIPE] Errore creazione customer:', err);
      return json({ error: 'Errore durante la registrazione. Riprova tra poco.' }, 500);
    }
  }

  // ── I listini sono configurati → crea sessione Checkout ──────────────────────
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',               // usa 'subscription' per abbonamenti ricorrenti
      payment_method_types: ['card'],
      customer_email: email.toLowerCase(),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        firstName,
        lastName,
        phone:  phone || '',
        sede,
        piano,
        source: 'prevendita_2026_27',
      },
      // Personalizzazione checkout Stripe
      custom_text: {
        submit: { message: `Stai prenotando il piano ${piano.charAt(0).toUpperCase() + piano.slice(1)} per la sede di ${sede} — stagione 2026/27.` },
      },
      // Redirect dopo il pagamento
      success_url: `${siteUrl}/prevendita/grazie?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/prevendita?cancelled=true`,
      // Scadenza sessione (30 min)
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });

    return json({ mode: 'checkout', url: session.url }, 200);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
    console.error('[STRIPE] Errore checkout session:', msg);
    return json({ error: `Errore Stripe: ${msg}` }, 500);
  }
};

// Helper
function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
