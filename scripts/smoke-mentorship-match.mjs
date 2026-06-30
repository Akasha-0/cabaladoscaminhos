#!/usr/bin/env node
/**
 * Smoke tests for mentorship-match v2.
 */
import {
  specialtyScore,
  availabilityScore,
  tierScore,
  formatScore,
  languageScore,
  matchScore,
  validateGroupMentorship,
  anonymizeMentor,
  validateMentorReport,
  MentorReportValidationError,
} from '../src/lib/community/mentorship-match.ts';

let passed = 0;
let failed = 0;
const run = (name, fn) => {
  try { fn(); passed++; console.log(`✓ ${name}`); }
  catch (e) { failed++; console.error(`✗ ${name}: ${e.message}`); }
};

const m = {
  id: 'm1',
  displayName: 'Aisha Cohen',
  traditions: ['Cabala', 'Tarot'],
  tier: 'MESTRE',
  formats: 'BOTH',
  availabilityWindows: ['MORNING', 'EVENING'],
  languages: ['pt-BR', 'en'],
  yearsPractice: 12,
  anonymityAvailable: true,
  reportable: true,
};

const e = {
  id: 'e1',
  displayName: 'João',
  primaryTradition: 'Cabala',
  alternateTraditions: ['Tarot'],
  tier: 'INICIANTE',
  preferredFormat: 'ONE_ON_ONE',
  availabilityWindows: ['MORNING', 'EVENING'],
  languages: ['pt-BR'],
  optInAutoMatch: true,
  wantsAnonymity: false,
};

// Specialty
run('specialty: primary match = 35', () => {
  if (specialtyScore(m, e) !== 35) throw new Error('expected 35');
});
run('specialty: sem match = 0', () => {
  const m2 = { ...m, traditions: ['Candomblé'] };
  if (specialtyScore(m2, e) !== 0) throw new Error('expected 0');
});
run('specialty: alternate match = 25', () => {
  const e2 = { ...e, primaryTradition: 'Wicca', alternateTraditions: ['Tarot'] };
  if (specialtyScore(m, e2) !== 25) throw new Error('expected 25');
});

// Availability
run('availability: 2 janelas = 10', () => {
  if (availabilityScore(m, e) !== 10) throw new Error('expected 10');
});
run('availability: todas 4 (mentor+mentee) = 20', () => {
  const m2 = { ...m, availabilityWindows: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'] };
  const e2 = { ...e, availabilityWindows: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'] };
  if (availabilityScore(m2, e2) !== 20) throw new Error('expected 20');
});
run('availability: sem overlap = 0', () => {
  const m2 = { ...m, availabilityWindows: ['AFTERNOON'] };
  if (availabilityScore(m2, e) !== 0) throw new Error('expected 0');
});

// Tier
run('tier: mestre-iniciante (diff 2) = 10', () => {
  if (tierScore(m, e) !== 10) throw new Error('expected 10');
});
run('tier: praticante-iniciante (diff 1) = 15', () => {
  const m2 = { ...m, tier: 'PRATICANTE' };
  if (tierScore(m2, e) !== 15) throw new Error('expected 15');
});
run('tier: peer = 5', () => {
  const m2 = { ...m, tier: 'INICIANTE' };
  if (tierScore(m2, { ...e, tier: 'INICIANTE' }) !== 5) throw new Error('expected 5');
});

// Format
run('format: BOTH = 15', () => {
  if (formatScore(m, e) !== 15) throw new Error('expected 15');
});
run('format: match exato = 15', () => {
  const m2 = { ...m, formats: 'ONE_ON_ONE' };
  if (formatScore(m2, e) !== 15) throw new Error('expected 15');
});

// Language
run('language: 1 match = 15', () => {
  if (languageScore(m, e) !== 15) throw new Error('expected 15');
});
run('language: sem match = 0', () => {
  const m2 = { ...m, languages: ['es'] };
  if (languageScore(m2, e) !== 0) throw new Error('expected 0');
});

// Total
run('total match perfeito-ish >= 80', () => {
  const r = matchScore(m, e);
  console.log(`  total=${r.total}, tier=${r.tier}, breakdown=${JSON.stringify(r.breakdown)}`);
  if (r.total < 80) throw new Error('expected >= 80');
});

run('match sem specialty = blocker presente', () => {
  const m2 = { ...m, traditions: ['Wicca'] };
  const r = matchScore(m2, e);
  if (!r.blockers.some((b) => b.includes('tradição'))) throw new Error('expected tradition blocker');
  if (r.breakdown.specialty !== 0) throw new Error('expected specialty = 0');
});

// Group mentorship
run('group 3 alunos = ok', () => {
  const r = validateGroupMentorship({
    mentorId: 'm1',
    studentIds: ['s1', 's2', 's3'],
    tradition: 'Cabala',
    format: 'GROUP',
    maxStudents: 5,
    minStudents: 3,
  });
  if (!r.ok) throw new Error(r.reason);
});

run('group 2 alunos = falha', () => {
  const r = validateGroupMentorship({
    mentorId: 'm1',
    studentIds: ['s1', 's2'],
    tradition: 'Cabala',
    format: 'GROUP',
    maxStudents: 5,
    minStudents: 3,
  });
  if (r.ok) throw new Error('should fail');
});

run('group 6 alunos = falha', () => {
  const r = validateGroupMentorship({
    mentorId: 'm1',
    studentIds: ['s1', 's2', 's3', 's4', 's5', 's6'],
    tradition: 'Cabala',
    format: 'GROUP',
    maxStudents: 5,
    minStudents: 3,
  });
  if (r.ok) throw new Error('should fail');
});

run('group IDs duplicados = falha', () => {
  const r = validateGroupMentorship({
    mentorId: 'm1',
    studentIds: ['s1', 's2', 's1'],
    tradition: 'Cabala',
    format: 'GROUP',
    maxStudents: 5,
    minStudents: 3,
  });
  if (r.ok) throw new Error('should fail');
});

// Anonymity
run('anonymize: mentee sem wantsAnonymity, mentor sem anonymityAvailable = reveal direto', () => {
  const m2 = { ...m, anonymityAvailable: false };
  const v = anonymizeMentor(m2, false);
  if (v.isAnonymous) throw new Error('should not be anonymous');
  if (v.displayName !== m.displayName) throw new Error('expected name');
});

run('anonymize: mentor aceita anonymity = esconde', () => {
  const v = anonymizeMentor(m, false);
  if (!v.isAnonymous) throw new Error('should be anonymous');
  if (v.displayName !== 'Mentor anônimo') throw new Error('expected anon');
  if (v.reveal(true) === null) throw new Error('should reveal after accept');
  if (v.reveal(false) !== null) throw new Error('should not reveal before accept');
});

// Reports
run('validateMentorReport: válido', () => {
  validateMentorReport({
    reason: 'SPIRITUAL_PRESSURE',
    details: 'Pediu para eu participar de ritual sem me explicar',
    evidenceUrls: [],
  });
});

run('validateMentorReport: motivo inválido', () => {
  try {
    validateMentorReport({
      reason: 'FAKE',
      details: 'descrição longa o suficiente',
      evidenceUrls: [],
    });
    throw new Error('should throw');
  } catch (e) {
    if (!(e instanceof MentorReportValidationError)) throw new Error('wrong error');
  }
});

run('validateMentorReport: details curtos', () => {
  try {
    validateMentorReport({
      reason: 'OTHER',
      details: 'curto',
      evidenceUrls: [],
    });
    throw new Error('should throw');
  } catch (e) {
    if (!(e instanceof MentorReportValidationError)) throw new Error('wrong error');
  }
});

run('validateMentorReport: URL não-https', () => {
  try {
    validateMentorReport({
      reason: 'OTHER',
      details: 'descrição longa o suficiente',
      evidenceUrls: ['http://example.com/x'],
    });
    throw new Error('should throw');
  } catch (e) {
    if (!(e instanceof MentorReportValidationError)) throw new Error('wrong error');
  }
});

run('validateMentorReport: max 3 evidências', () => {
  try {
    validateMentorReport({
      reason: 'OTHER',
      details: 'descrição longa o suficiente',
      evidenceUrls: ['https://a', 'https://b', 'https://c', 'https://d'],
    });
    throw new Error('should throw');
  } catch (e) {
    if (!(e instanceof MentorReportValidationError)) throw new Error('wrong error');
  }
});

console.log(`\n${passed}/${passed + failed} testes passaram`);
if (failed > 0) process.exit(1);