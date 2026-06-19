-- ═══════════════════════════════════════════════════════════════════════
-- Lume Fitness Club — Schema Supabase
-- Esegui questo file in Supabase SQL Editor dopo aver creato il progetto
-- ═══════════════════════════════════════════════════════════════════════

-- Estensione UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enum types ─────────────────────────────────────────────────────────────
CREATE TYPE club_id AS ENUM ('macerata', 'montecassiano');
CREATE TYPE plan_id AS ENUM ('base', 'plus', 'premium', 'personal');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlist');

-- ─── Tabella: membri ─────────────────────────────────────────────────────────
CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT,
  club            club_id NOT NULL,
  active_plan     plan_id,
  plan_expiry     DATE,
  joined_at       TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Tabella: storico abbonamenti ───────────────────────────────────────────
CREATE TABLE subscription_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id     plan_id NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  amount      NUMERIC(8,2) NOT NULL,
  club        club_id NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Tabella: richieste prenotazione ────────────────────────────────────────
CREATE TABLE booking_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  club        club_id NOT NULL,
  plan        TEXT NOT NULL,  -- plan_id + 'trial'
  message     TEXT,
  status      TEXT DEFAULT 'pending',  -- pending | contacted | converted | declined
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Tabella: prenotazioni corsi ─────────────────────────────────────────────
CREATE TABLE course_bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  course_id     TEXT NOT NULL,
  club          club_id NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        booking_status DEFAULT 'confirmed',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── Indici ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_subscription_member ON subscription_history(member_id);
CREATE INDEX idx_course_bookings_member ON course_bookings(member_id);
CREATE INDEX idx_course_bookings_scheduled ON course_bookings(scheduled_at);

-- ─── Row Level Security (RLS) ────────────────────────────────────────────────
-- Abilita RLS su tutte le tabelle
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_bookings ENABLE ROW LEVEL SECURITY;

-- I membri possono leggere solo i propri dati (dopo integrazione auth)
-- CREATE POLICY "members_self_read" ON members FOR SELECT USING (auth.uid()::text = id::text);

-- Le booking_requests sono accessibili solo lato server (service_role key)
-- Nessuna policy pubblica → solo service_role può leggere/scrivere

-- ─── Funzione: aggiorna updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── View: report abbonamenti attivi ─────────────────────────────────────────
CREATE VIEW active_members_summary AS
SELECT
  club,
  active_plan,
  COUNT(*) AS member_count,
  COUNT(CASE WHEN plan_expiry < CURRENT_DATE THEN 1 END) AS expired_count
FROM members
WHERE active_plan IS NOT NULL
GROUP BY club, active_plan
ORDER BY club, active_plan;
