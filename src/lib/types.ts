// ─── Sedi ───────────────────────────────────────────────────────────────────
export type ClubId = 'macerata' | 'montecassiano';

export interface Club {
  id: ClubId;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  features: string[];
  slug: string;
}

// ─── Corsi ──────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  description: string;
  duration: number; // minuti
  level: 'Tutti' | 'Principiante' | 'Intermedio' | 'Avanzato';
  category: 'Cardio' | 'Forza' | 'Mente & Corpo' | 'Funzionale' | 'Cycling';
  instructor: string;
  club: ClubId | 'both';
  color: string;
}

export interface ScheduleSlot {
  courseId: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Lun, 6=Dom
  time: string; // "09:00"
  club: ClubId;
  spots: number;
  bookedSpots: number;
}

// ─── Abbonamenti ────────────────────────────────────────────────────────────
export type PlanId = 'base' | 'plus' | 'premium' | 'personal';

export interface MembershipPlan {
  id: PlanId;
  name: string;
  price: number;
  period: 'mese' | 'anno';
  description: string;
  features: string[];
  highlighted: boolean;
  club: ClubId | 'both';
}

// ─── Membri ─────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  club: ClubId;
  activePlan?: PlanId;
  planExpiry?: string;
  joinedAt: string;
  subscriptionHistory: SubscriptionRecord[];
}

export interface SubscriptionRecord {
  planId: PlanId;
  startDate: string;
  endDate: string;
  amount: number;
  club: ClubId;
}

// ─── Prenotazioni ───────────────────────────────────────────────────────────
export interface Booking {
  id: string;
  memberId: string;
  slotId: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled' | 'waitlist';
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  category: string;
  readTime: number;
  cover?: string;
}
