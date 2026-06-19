import { createClient } from '@supabase/supabase-js';

// ─── Client pubblico (browser) ──────────────────────────────────────────────
// Usa solo per query di sola lettura o con RLS abilitato
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Client admin (solo server-side, mai esposto al browser) ────────────────
export const supabaseAdmin = createClient(
  supabaseUrl,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Helper: verifica membro ─────────────────────────────────────────────────
export async function getMemberByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('members')
    .select(`
      *,
      subscription_history (
        plan_id, start_date, end_date, amount, club
      )
    `)
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return data;
}

// ─── Helper: piani disponibili per il membro ─────────────────────────────────
export async function getSuggestedPlans(memberId: string) {
  // Recupera storico abbonamenti
  const { data: history } = await supabaseAdmin
    .from('subscription_history')
    .select('*')
    .eq('member_id', memberId)
    .order('end_date', { ascending: false });

  if (!history || history.length === 0) return 'base'; // nuovo membro → piano base

  const lastPlan = history[0].plan_id;
  const totalMonths = history.length;

  // Logica di upgrade
  if (totalMonths >= 6 && lastPlan !== 'premium') return 'premium';
  if (totalMonths >= 3 && lastPlan === 'base') return 'plus';
  return lastPlan;
}
