import type { Club, Course, MembershipPlan, BlogPost } from './types';

// ─── Sedi ───────────────────────────────────────────────────────────────────
export const CLUBS: Club[] = [
  {
    id: 'macerata',
    name: 'Lume Macerata',
    address: 'Piazzale Mario Fattorini 1, 62100 Macerata',
    phone: '+39 0733 123456',
    email: 'macerata@lumefitness.it',
    hours: { weekdays: '06:30 – 22:30', saturday: '08:00 – 20:00', sunday: '09:00 – 14:00' },
    features: ['Gym Floor 500m² Technogym', 'Box CrossFit 450m²', 'Sala Reformer Pilates', 'Piscina & Acqua Fitness', 'Sale Fitness Les Mills', 'Scuola Nuoto Bambini'],
    slug: 'macerata',
  },
  {
    id: 'montecassiano',
    name: 'Lume Montecassiano',
    address: 'Via Sergio Piermanni 3, 62010 Montecassiano',
    phone: '+39 0733 654321',
    email: 'montecassiano@lumefitness.it',
    hours: { weekdays: '07:00 – 22:00', saturday: '08:30 – 19:00', sunday: 'Chiuso' },
    features: ['Sala pesi attrezzata', 'Corsi di gruppo', 'Piscina & Scuola Nuoto', 'Spogliatoi moderni', 'Parcheggio gratuito'],
    slug: 'montecassiano',
  },
];

// ─── Corsi ──────────────────────────────────────────────────────────────────
export const COURSES: Course[] = [
  { id: 'spinning', name: 'Spinning', description: 'Ciclismo indoor ad alta intensità con musica motivante. Sala dedicata con 15 bike.', duration: 50, level: 'Tutti', category: 'Cycling', instructor: 'Staff Lume', club: 'macerata', color: '#C40042' },
  { id: 'crossfit', name: 'CrossFit', description: 'Allenamento funzionale nel nostro Box da 450m² con vogatori, air bike, barbell e bumper.', duration: 60, level: 'Tutti', category: 'Funzionale', instructor: 'Staff Lume', club: 'macerata', color: '#e05a7a' },
  { id: 'reformer', name: 'Reformer Pilates', description: 'Movimento consapevole su macchine Peak Pilates di ultima generazione. 120m² dedicati.', duration: 55, level: 'Tutti', category: 'Mente & Corpo', instructor: 'Staff Lume', club: 'macerata', color: '#a78bfa' },
  { id: 'intensityou', name: 'IntensitYou', description: 'Sala 130m² con attrezzatura Technogym e Boxing Hero per allenamenti ad alta intensità.', duration: 45, level: 'Intermedio', category: 'Cardio', instructor: 'Staff Lume', club: 'macerata', color: '#fb923c' },
  { id: 'lesmills', name: 'Les Mills', description: 'Corsi BodyPump, BodyCombat e RPM su licenza Les Mills in sala dedicata da 150m².', duration: 55, level: 'Tutti', category: 'Cardio', instructor: 'Staff Lume', club: 'both', color: '#fbbf24' },
  { id: 'yoga', name: 'Yoga & Pilates Mat', description: 'Sala olistica da 120m² con tappetini, mattoncini yoga e tessuti per allenamento in sospensione.', duration: 60, level: 'Tutti', category: 'Mente & Corpo', instructor: 'Staff Lume', club: 'both', color: '#67e8f9' },
  { id: 'acquafitness', name: 'Acqua Fitness', description: 'Corsi in acqua per tonificare e migliorare la resistenza con impatto ridotto sulle articolazioni.', duration: 45, level: 'Tutti', category: 'Cardio', instructor: 'Staff Lume', club: 'both', color: '#4ade80' },
  { id: 'gym-floor', name: 'Gym Floor', description: 'Sala pesi da 500m² con le più moderne attrezzature Technogym di ultima generazione.', duration: 0, level: 'Tutti', category: 'Forza', instructor: 'Staff Lume', club: 'both', color: '#e879f9' },
];

// ─── Abbonamenti ────────────────────────────────────────────────────────────
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'base',
    name: 'Base',
    price: 39,
    period: 'mese',
    description: 'Perfetto per iniziare il tuo percorso fitness.',
    features: ['Accesso sala pesi', 'Zona cardio', '2 corsi di gruppo/sett.', 'Spogliatoi'],
    highlighted: false,
    club: 'montecassiano',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 59,
    period: 'mese',
    description: 'Il nostro piano più popolare per chi si allena regolarmente.',
    features: ['Tutto di Base', 'Corsi illimitati', 'Accesso entrambe le sedi', 'App di prenotazione', '1 sessione PT/mese'],
    highlighted: true,
    club: 'both',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 89,
    period: 'mese',
    description: 'Esperienza completa senza compromessi.',
    features: ['Tutto di Plus', 'Piscina & SPA (Macerata)', 'PT illimitato', 'Piano nutrizionale', 'Priorità prenotazioni'],
    highlighted: false,
    club: 'macerata',
  },
  {
    id: 'personal',
    name: 'Personal',
    price: 120,
    period: 'mese',
    description: 'Allenamento 1:1 completamente personalizzato.',
    features: ['4 sessioni PT/mese', 'Piano allenamento custom', 'Monitoraggio progressi', 'Accesso completo'],
    highlighted: false,
    club: 'both',
  },
];

// ─── Blog ────────────────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'come-iniziare-in-palestra',
    title: 'Come iniziare in palestra: guida per principianti',
    excerpt: 'I primi passi nel mondo del fitness: cosa aspettarsi, come pianificare e quali errori evitare.',
    content: '',
    publishedAt: '2024-01-15',
    category: 'Consigli',
    readTime: 5,
  },
  {
    slug: 'benefici-allenamento-regolare',
    title: 'I 10 benefici di un allenamento regolare',
    excerpt: 'Dalla salute cardiovascolare al benessere mentale: perché allenarsi tre volte a settimana cambia la vita.',
    content: '',
    publishedAt: '2024-01-28',
    category: 'Salute',
    readTime: 7,
  },
  {
    slug: 'nuova-sede-montecassiano',
    title: 'Apre Lume Montecassiano!',
    excerpt: 'Siamo felici di annunciare l\'apertura del nostro secondo club. Scopri tutti i dettagli e le offerte lancio.',
    content: '',
    publishedAt: '2024-02-10',
    category: 'News',
    readTime: 3,
  },
];
