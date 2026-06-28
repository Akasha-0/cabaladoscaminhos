/**
 * Mentorship pairing algorithm — Cabala dos Caminhos
 * Greedy 1-on-1 matching of mentors to mentees by interest/timezone/language overlap.
 */

export interface MentorProfile {
  id: string;
  interests: string[];
  timezone: string; // e.g. 'America/Sao_Paulo'
  languages: string[]; // e.g. ['pt-BR', 'en']
  yearsExperience: number;
  maxMentees?: number;
}

export interface MenteeProfile {
  id: string;
  interests: string[];
  timezone: string;
  languages: string[];
}

export interface Pair {
  mentorId: string;
  menteeId: string;
  score: number;
}

function overlap<T>(a: T[], b: T[]): number {
  const set = new Set(b);
  let n = 0;
  for (const x of a) if (set.has(x)) n++;
  return n;
}

export function scorePair(mentor: MentorProfile, mentee: MenteeProfile): number {
  const interestScore = overlap(mentor.interests, mentee.interests) * 10;
  const tzScore = mentor.timezone === mentee.timezone ? 5 : 0;
  const langScore = overlap(mentor.languages, mentee.languages) * 3;
  const expBonus = Math.min(mentor.yearsExperience, 10);
  return interestScore + tzScore + langScore + expBonus;
}

export function pairMentors(
  mentors: MentorProfile[],
  mentees: MenteeProfile[]
): Pair[] {
  const capacity = new Map<string, number>(
    mentors.map((m) => [m.id, m.maxMentees ?? 3])
  );
  const usedMentees = new Set<string>();
  const candidates: Pair[] = [];
  for (const m of mentors) {
    for (const e of mentees) {
      if (usedMentees.has(e.id)) continue;
      candidates.push({ mentorId: m.id, menteeId: e.id, score: scorePair(m, e) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const pairs: Pair[] = [];
  for (const c of candidates) {
    if (usedMentees.has(c.menteeId)) continue;
    if ((capacity.get(c.mentorId) ?? 0) <= 0) continue;
    pairs.push(c);
    usedMentees.add(c.menteeId);
    capacity.set(c.mentorId, (capacity.get(c.mentorId) ?? 0) - 1);
  }
  return pairs;
}