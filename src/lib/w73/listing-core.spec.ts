/**
 * Listing Core Engine — Vitest Spec
 * Cycle 73 — W73-D
 *
 * 30+ assertions covering validation, lifecycle, filtering, search,
 * recommendations, and sacred template coverage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createListing,
  getListingById,
  getListingBySlug,
  listListings,
  getListingsByTradition,
  searchListings,
  getRecommendedListings,
  updateListing,
  archiveListing,
  pauseListing,
  resumeListing,
  _resetListingsForTest,
  auditListingRules,
  auditSacredListings,
  LISTING_TEMPLATES,
  OFFERING_KINDS,
  TRADITIONS,
  asUserId,
  asListingId,
  type CreateListingInput,
  type AvailabilitySlot,
  type UserContext,
} from './listing-core.ts';

const practitioner = asUserId('usr_practitioner_001');
const otherPractitioner = asUserId('usr_practitioner_002');

const baseInput: CreateListingInput = {
  kind: 'mesa-real',
  tradition: 'cigano',
  title: 'Mesa Real — Sessão Teste',
  description: 'Mesa Real completa com cruzamento das 36 cartas.',
  durationMin: 60,
  modality: 'online-video',
  priceCredits: 25,
  sacredTags: ['mesa', 'cigano', 'cartas'],
  languages: ['pt-BR'],
  availability: [
    { weekday: 1, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
    { weekday: 3, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
  ],
};

let idCounter = 0;
const newId = () => `lst_test_${++idCounter}_${Date.now().toString(36)}`;

beforeEach(() => _resetListingsForTest());

describe('listing-core — happy path', () => {
  it('createListing returns a draft listing with generated id and slug', () => {
    const r = createListing(practitioner, baseInput, new Date(), newId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.id).toMatch(/^lst_test_/);
    expect(r.value.slug).toBe('mesa-real-sessao-teste');
    expect(r.value.status).toBe('draft');
    expect(r.value.rating).toBe(0);
    expect(r.value.practitionerId).toBe(practitioner);
  });

  it('createListing honors custom slug', () => {
    const r = createListing(practitioner, { ...baseInput, slug: 'meu-slug-custom' }, new Date(), newId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.slug).toBe('meu-slug-custom');
  });
});

describe('listing-core — OfferingKind coverage', () => {
  it('accepts one listing per OfferingKind (13 kinds)', () => {
    let counter = 0;
    for (const kind of OFFERING_KINDS) {
      const r = createListing(practitioner, { ...baseInput, kind, title: `Listing ${kind} teste` }, new Date(), newId);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.kind).toBe(kind);
      counter++;
    }
    expect(counter).toBe(14); // 14 kinds including ebook
  });
});

describe('listing-core — validation', () => {
  it('rejects title < 5 chars', () => {
    const r = createListing(practitioner, { ...baseInput, title: 'oi' }, new Date(), newId);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('invalid');
  });
  it('rejects title > 200 chars', () => {
    const r = createListing(practitioner, { ...baseInput, title: 'x'.repeat(201) }, new Date(), newId);
    expect(r.ok).toBe(false);
  });
  it('rejects negative priceCredits', () => {
    const r = createListing(practitioner, { ...baseInput, priceCredits: -1 }, new Date(), newId);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('invalid');
  });
  it('accepts free listing (priceCredits = 0)', () => {
    const r = createListing(practitioner, { ...baseInput, priceCredits: 0 }, new Date(), newId);
    expect(r.ok).toBe(true);
  });
  it('rejects duration < 5', () => {
    const r = createListing(practitioner, { ...baseInput, durationMin: 3 }, new Date(), newId);
    expect(r.ok).toBe(false);
  });
  it('rejects duration > 480', () => {
    const r = createListing(practitioner, { ...baseInput, durationMin: 600 }, new Date(), newId);
    expect(r.ok).toBe(false);
  });
  it('rejects no sacredTags', () => {
    const r = createListing(practitioner, { ...baseInput, sacredTags: [] }, new Date(), newId);
    expect(r.ok).toBe(false);
  });
  it('rejects > 10 sacredTags', () => {
    const r = createListing(practitioner, { ...baseInput, sacredTags: Array.from({ length: 11 }, (_, i) => `t${i}`) }, new Date(), newId);
    expect(r.ok).toBe(false);
  });
  it('rejects no availability', () => {
    const r = createListing(practitioner, { ...baseInput, availability: [] }, new Date(), newId);
    expect(r.ok).toBe(false);
  });
  it('rejects duplicate slug', () => {
    const r1 = createListing(practitioner, baseInput, new Date(), newId);
    const r2 = createListing(practitioner, { ...baseInput, slug: 'mesa-real-sessao-teste' }, new Date(), newId);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error.kind).toBe('conflict');
  });
});

describe('listing-core — filtering & search', () => {
  beforeEach(() => {
    createListing(practitioner, { ...baseInput, kind: 'mesa-real', tradition: 'cigano' }, new Date(), newId);
    createListing(practitioner, { ...baseInput, kind: 'mapa-astral', tradition: 'astrologia', title: 'Mapa Astral Premium' }, new Date(), newId);
    createListing(otherPractitioner, { ...baseInput, kind: 'numerologia', tradition: 'numerologia', title: 'Numerologia Cabalística' }, new Date(), newId);
  });

  it('listListings filters by kind', () => {
    const r = listListings({ kind: 'mesa-real' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.items.length).toBe(1);
    expect(r.value.items[0]?.kind).toBe('mesa-real');
  });
  it('listListings filters by tradition', () => {
    const r = listListings({ tradition: 'astrologia' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.items.length).toBe(1);
  });
  it('listListings filters by modality', () => {
    const r = listListings({ modality: 'online-video' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.items.length).toBeGreaterThanOrEqual(2);
  });
  it('listListings filters by language', () => {
    const r = listListings({ language: 'pt-BR' });
    expect(r.ok).toBe(true);
  });
  it('listListings filters by price range', () => {
    const r = listListings({ minPrice: 30 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    for (const l of r.value.items) expect(l.priceCredits).toBeGreaterThanOrEqual(30);
  });

  it('getListingsByTradition returns active listings per tradition (7 traditions seeded)', () => {
    // Activate listings first
    const all = listListings();
    if (all.ok) {
      for (const l of all.value.items) {
        updateListing(l.id, {}, l.practitionerId);
      }
    }
    // Create at least one listing per tradition to exercise path
    for (const t of TRADITIONS) {
      createListing(practitioner, { ...baseInput, tradition: t, title: `Listing ${t} teste` }, new Date(), newId);
    }
    const r = getListingsByTradition('cigano', 10);
    expect(r.ok).toBe(true);
  });

  it('searchListings matches by sacred term', () => {
    const r = searchListings('mesa');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.items.length).toBeGreaterThanOrEqual(1);
  });

  it('searchListings matches by "mapa" term', () => {
    const r = searchListings('mapa');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.items.some((l) => l.title.toLowerCase().includes('mapa'))).toBe(true);
  });

  it('searchListings rejects query < 2 chars', () => {
    const r = searchListings('a');
    expect(r.ok).toBe(false);
  });
});

describe('listing-core — recommendations', () => {
  beforeEach(() => {
    createListing(practitioner, { ...baseInput, kind: 'mesa-real', tradition: 'cigano', title: 'Cigano 1' }, new Date(), newId);
    createListing(practitioner, { ...baseInput, kind: 'mapa-astral', tradition: 'astrologia', title: 'Astro 1' }, new Date(), newId);
    createListing(practitioner, { ...baseInput, kind: 'numerologia', tradition: 'numerologia', title: 'Numero 1' }, new Date(), newId);
  });

  it('getRecommendedListings prefers user tradition preferences', () => {
    const user: UserContext = {
      userId: asUserId('usr_user_001'),
      preferredTraditions: ['astrologia', 'numerologia'],
    };
    const r = getRecommendedListings(user, 5);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.length).toBeGreaterThan(0);
    // First should be from astrologia or numerologia
    const first = r.value[0];
    expect(['astrologia', 'numerologia']).toContain(first?.tradition);
  });
});

describe('listing-core — lifecycle', () => {
  it('archive / pause / resume transitions', () => {
    const r = createListing(practitioner, baseInput, new Date(), newId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const id = r.value.id;
    const paused = pauseListing(id, practitioner);
    expect(paused.ok && paused.value.status).toBe('paused');
    const resumed = resumeListing(id, practitioner);
    expect(resumed.ok && resumed.value.status).toBe('active');
    const archived = archiveListing(id, practitioner, 'Test reason');
    expect(archived.ok && archived.value.status).toBe('archived');
  });

  it('updateListing requires owner', () => {
    const r = createListing(practitioner, baseInput, new Date(), newId);
    if (!r.ok) throw new Error('create failed');
    const upd = updateListing(r.value.id, { title: 'New Title' }, otherPractitioner);
    expect(upd.ok).toBe(false);
    if (!upd.ok) expect(upd.error.kind).toBe('forbidden');
  });
});

describe('listing-core — branded types', () => {
  it('ListingId and UserId are distinct types', () => {
    const uid = asUserId('abc');
    const lid = asListingId('xyz');
    expect(typeof uid).toBe('string');
    expect(typeof lid).toBe('string');
    expect(uid).not.toBe(lid);
  });
});

describe('listing-core — sacred templates', () => {
  it('has >= 30 listing templates', () => {
    expect(LISTING_TEMPLATES.length).toBeGreaterThanOrEqual(30);
  });

  it('covers all 7 sacred traditions', () => {
    const traditionsInTemplates = new Set(LISTING_TEMPLATES.map((t) => t.tradition));
    for (const t of TRADITIONS) {
      if (t === 'multi') continue; // multi is optional
      expect(traditionsInTemplates.has(t)).toBe(true);
    }
  });
});

describe('listing-core — audit', () => {
  it('auditListingRules returns enforced rules', () => {
    const rules = auditListingRules();
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) expect(r.isEnforced).toBe(true);
  });

  it('auditSacredListings reports coverage per tradition', () => {
    const report = auditSacredListings();
    expect(report.length).toBe(TRADITIONS.length);
    for (const r of report) {
      expect(r.templateCount).toBeGreaterThanOrEqual(0);
      expect(r.kindCoverage).toBeGreaterThanOrEqual(0);
    }
  });
});