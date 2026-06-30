// W91-B: reputation-leaderboard — mock module
// 24 hand-curated members reflecting sacred diversity across Candomblé,
// Umbanda, Ifá, Cabala, Astrologia and Tantra. Names are illustrative and
// carry no real-world identifier — pure display strings for the leaderboard.
//
// Sacred-cultural compliance:
//   - All display names use traditional titles: Mestre, Ialorixá, Babalaô,
//     Caboclo, Zelador, Sacerdotisa, etc.
//   - Positive-only framing: every description honors accumulated prática
//     and ancestral transmission — no competitive/ranking language
//   - Banned vocab absent: amarração, amarre, vinculação, vincular, prejudicar
//
// LGPD:
//   - userIds are opaque synthetic handles (mem-<n>) — NOT real identifiers
//   - displayName + tradição + yearsOfAxé + compositeScore only
//   - No e-mail, telefone, endereço, or any direct contact data

import type {
  CategoryId,
  ReputationMember,
  TimeWindowId,
  UserId,
} from "./types";
import { W91B_TIME_WINDOWS } from "./types";

const uid = (n: number): UserId => `mem-${String(n).padStart(3, "0")}` as UserId;

/**
 * Curated mock member list. Order here is intentionally non-sorted; the
 * factory + rank module determine the displayed order. All numbers are
 * positive-only and bounded so the leaderboard reads as "recognition" rather
 * than "competition".
 */
export const W91B_MOCK_MEMBERS: ReadonlyArray<ReputationMember> = Object.freeze(
  [
    {
      userId: uid(1),
      displayName: "Mestre Odé de Iansã",
      tradição: "tradição" as CategoryId,
      yearsOfAxé: 42,
      scoresByCategory: Object.freeze({
        tradição: 980,
        sabedoria: 870,
        axé: 940,
        comunidade: 910,
      }),
      joinedAt: "1984-03-12",
    },
    {
      userId: uid(2),
      displayName: "Ialorixá Betânia de Oxum",
      tradição: "axé" as CategoryId,
      yearsOfAxé: 38,
      scoresByCategory: Object.freeze({
        tradição: 920,
        sabedoria: 890,
        axé: 990,
        comunidade: 950,
      }),
      joinedAt: "1988-07-04",
    },
    {
      userId: uid(3),
      displayName: "Babalaô Agenor de Obaluaiê",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 51,
      scoresByCategory: Object.freeze({
        tradição: 970,
        sabedoria: 990,
        axé: 920,
        comunidade: 880,
      }),
      joinedAt: "1975-01-20",
    },
    {
      userId: uid(4),
      displayName: "Caboclo Sete Flechas",
      tradição: "comunidade" as CategoryId,
      yearsOfAxé: 27,
      scoresByCategory: Object.freeze({
        tradição: 760,
        sabedoria: 720,
        axé: 810,
        comunidade: 950,
      }),
      joinedAt: "1999-09-09",
    },
    {
      userId: uid(5),
      displayName: "Sacerdotisa Malía de Yemanjá",
      tradição: "tradição" as CategoryId,
      yearsOfAxé: 33,
      scoresByCategory: Object.freeze({
        tradição: 900,
        sabedoria: 830,
        axé: 880,
        comunidade: 870,
      }),
      joinedAt: "1993-05-21",
    },
    {
      userId: uid(6),
      displayName: "Zelador Tupinambá",
      tradição: "comunidade" as CategoryId,
      yearsOfAxé: 19,
      scoresByCategory: Object.freeze({
        tradição: 720,
        sabedoria: 700,
        axé: 740,
        comunidade: 890,
      }),
      joinedAt: "2007-11-02",
    },
    {
      userId: uid(7),
      displayName: "Mestra Cigana Mirian",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 29,
      scoresByCategory: Object.freeze({
        tradição: 800,
        sabedoria: 920,
        axé: 780,
        comunidade: 820,
      }),
      joinedAt: "1997-06-15",
    },
    {
      userId: uid(8),
      displayName: "Rabino Hillel Ben-Shalom",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 45,
      scoresByCategory: Object.freeze({
        tradição: 940,
        sabedoria: 980,
        axé: 800,
        comunidade: 850,
      }),
      joinedAt: "1981-02-28",
    },
    {
      userId: uid(9),
      displayName: "Mestre Tantra Ravi",
      tradição: "axé" as CategoryId,
      yearsOfAxé: 22,
      scoresByCategory: Object.freeze({
        tradição: 700,
        sabedoria: 820,
        axé: 900,
        comunidade: 780,
      }),
      joinedAt: "2004-04-17",
    },
    {
      userId: uid(10),
      displayName: "Astróloga Celeste Vasconcelos",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 17,
      scoresByCategory: Object.freeze({
        tradição: 680,
        sabedoria: 870,
        axé: 660,
        comunidade: 740,
      }),
      joinedAt: "2009-08-30",
    },
    {
      userId: uid(11),
      displayName: "Ogã Benedito de Xangô",
      tradição: "tradição" as CategoryId,
      yearsOfAxé: 36,
      scoresByCategory: Object.freeze({
        tradição: 880,
        sabedoria: 810,
        axé: 850,
        comunidade: 830,
      }),
      joinedAt: "1990-10-11",
    },
    {
      userId: uid(12),
      displayName: "Mãe Cacau de Nanã",
      tradição: "tradição" as CategoryId,
      yearsOfAxé: 48,
      scoresByCategory: Object.freeze({
        tradição: 960,
        sabedoria: 870,
        axé: 930,
        comunidade: 900,
      }),
      joinedAt: "1978-12-01",
    },
    {
      userId: uid(13),
      displayName: "Pai Fernando do Caboclo",
      tradição: "comunidade" as CategoryId,
      yearsOfAxé: 25,
      scoresByCategory: Object.freeze({
        tradição: 760,
        sabedoria: 740,
        axé: 790,
        comunidade: 880,
      }),
      joinedAt: "2001-03-25",
    },
    {
      userId: uid(14),
      displayName: "Sacerdotisa Isis de Aset",
      tradição: "axé" as CategoryId,
      yearsOfAxé: 31,
      scoresByCategory: Object.freeze({
        tradição: 820,
        sabedoria: 840,
        axé: 900,
        comunidade: 810,
      }),
      joinedAt: "1995-07-14",
    },
    {
      userId: uid(15),
      displayName: "Mestre Sefirá Davi",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 40,
      scoresByCategory: Object.freeze({
        tradição: 900,
        sabedoria: 950,
        axé: 780,
        comunidade: 830,
      }),
      joinedAt: "1986-09-03",
    },
    {
      userId: uid(16),
      displayName: "Curandeira Jacira",
      tradição: "comunidade" as CategoryId,
      yearsOfAxé: 21,
      scoresByCategory: Object.freeze({
        tradição: 700,
        sabedoria: 760,
        axé: 740,
        comunidade: 850,
      }),
      joinedAt: "2005-02-19",
    },
    {
      userId: uid(17),
      displayName: "Babalorixá Raimundo de Ogum",
      tradição: "tradição" as CategoryId,
      yearsOfAxé: 44,
      scoresByCategory: Object.freeze({
        tradição: 950,
        sabedoria: 880,
        axé: 910,
        comunidade: 870,
      }),
      joinedAt: "1982-06-08",
    },
    {
      userId: uid(18),
      displayName: "Médium Joana do Pretos-Velhos",
      tradição: "axé" as CategoryId,
      yearsOfAxé: 23,
      scoresByCategory: Object.freeze({
        tradição: 740,
        sabedoria: 760,
        axé: 840,
        comunidade: 820,
      }),
      joinedAt: "2003-11-27",
    },
    {
      userId: uid(19),
      displayName: "Sacerdote Tao Chu",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 28,
      scoresByCategory: Object.freeze({
        tradição: 760,
        sabedoria: 880,
        axé: 720,
        comunidade: 770,
      }),
      joinedAt: "1998-01-09",
    },
    {
      userId: uid(20),
      displayName: "Yalorixá Lourdes de Iansã",
      tradição: "axé" as CategoryId,
      yearsOfAxé: 34,
      scoresByCategory: Object.freeze({
        tradição: 850,
        sabedoria: 820,
        axé: 880,
        comunidade: 840,
      }),
      joinedAt: "1992-04-22",
    },
    {
      userId: uid(21),
      displayName: "Cabocla Jurema das Águas",
      tradição: "comunidade" as CategoryId,
      yearsOfAxé: 16,
      scoresByCategory: Object.freeze({
        tradição: 660,
        sabedoria: 680,
        axé: 720,
        comunidade: 830,
      }),
      joinedAt: "2010-08-13",
    },
    {
      userId: uid(22),
      displayName: "Mestre Atabaque Léo",
      tradição: "tradição" as CategoryId,
      yearsOfAxé: 32,
      scoresByCategory: Object.freeze({
        tradição: 870,
        sabedoria: 770,
        axé: 820,
        comunidade: 800,
      }),
      joinedAt: "1994-12-05",
    },
    {
      userId: uid(23),
      displayName: "Sacerdotisa Vesta Romana",
      tradição: "sabedoria" as CategoryId,
      yearsOfAxé: 26,
      scoresByCategory: Object.freeze({
        tradição: 720,
        sabedoria: 850,
        axé: 700,
        comunidade: 760,
      }),
      joinedAt: "2000-05-30",
    },
    {
      userId: uid(24),
      displayName: "Exu Tranca-Rua das Almas",
      tradição: "axé" as CategoryId,
      yearsOfAxé: 39,
      scoresByCategory: Object.freeze({
        tradição: 860,
        sabedoria: 800,
        axé: 920,
        comunidade: 830,
      }),
      joinedAt: "1987-10-18",
    },
  ] satisfies ReadonlyArray<ReputationMember>,
);

/**
 * Synthetic recent activity multiplier used by the rank module. Values are
 * domain-only — they reflect how strongly a window weights recent ação
 * (30d > 90d > 1y > all).
 */
export const W91B_WINDOW_MULTIPLIERS: Readonly<Record<TimeWindowId, number>> =
  Object.freeze({
    "30d": 1.25,
    "90d": 1.1,
    "1y": 1.0,
    all: 0.95,
  });

/**
 * Expose available time windows for the page filter (re-exported for
 * convenience; mirrors `W91B_TIME_WINDOWS` from types.ts).
 */
export const W91B_AVAILABLE_WINDOWS: ReadonlyArray<TimeWindowId> = Object.freeze(
  [...W91B_TIME_WINDOWS],
);

export const W91B_MOCK_VERSION = "2026-06-30" as const;