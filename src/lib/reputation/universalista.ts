/**
 * universalista.ts — Reputation scoring for the Cabala dos Caminhos community.
 *
 * The "universalista" system awards community standing based on contribution
 * volume and longevity, mapped to five ascending levels of mastery. Badges
 * recognize specific behavioral patterns (authorship, advising, helpfulness,
 * stewardship) and unlock at the thresholds documented in
 * `docs/IDEIA.md` §community-reputation.
 *
 * Pure function — no I/O, no side effects, no external dependencies.
 */

export type ReputationLevel = 'novato' | 'aprendiz' | 'praticante' | 'mestre' | 'universalista';

export interface ReputationInput {
  postsCount: number;
  commentsCount: number;
  helpfulVotes: number;
  yearsActive: number;
}

export interface ReputationScore {
  score: number;
  level: ReputationLevel;
  badges: string[];
  nextLevelAt: number | null;
}

export function calculateReputation(input: ReputationInput): ReputationScore {
  const score = input.postsCount * 5 + input.commentsCount * 2 + input.helpfulVotes * 10 + input.yearsActive * 20;
  let level: ReputationLevel;
  let nextLevelAt: number | null;
  if (score < 100) { level = 'novato'; nextLevelAt = 100; }
  else if (score < 500) { level = 'aprendiz'; nextLevelAt = 500; }
  else if (score < 2000) { level = 'praticante'; nextLevelAt = 2000; }
  else if (score < 5000) { level = 'mestre'; nextLevelAt = 5000; }
  else { level = 'universalista'; nextLevelAt = null; }
  const badges: string[] = [];
  if (input.postsCount >= 50) badges.push('autor');
  if (input.commentsCount >= 100) badges.push('conselheiro');
  if (input.helpfulVotes >= 20) badges.push('farol');
  if (input.yearsActive >= 3) badges.push('guardiao');
  return { score, level, badges, nextLevelAt };
}
