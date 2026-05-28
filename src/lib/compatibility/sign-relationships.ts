// Sign relationships - skipped linting and formatting

import type { Signo } from '../astrologia/tipos';

export type RelationshipType = 'trino' | 'sextil' | 'quadratura' | 'oposição' | 'conjunção';

export interface SignRelationship {
  sign: Signo;
  relationship: RelationshipType;
}

export type SignRelationships = Record<Signo, SignRelationship[]>;

const SIGN_ORDER: Signo[] = [
  'aries',
  'touro',
  'gemeos',
  'cancer',
  'leao',
  'virgem',
  'libra',
  'escorpio',
  'sagitario',
  'capricornio',
  'aquario',
  'peixes',
];

function buildRelationships(): SignRelationships {
  const rels: Partial<SignRelationships> = {};

  for (const sign of SIGN_ORDER) {
    rels[sign] = [];
  }

  for (let i = 0; i < SIGN_ORDER.length; i++) {
    const sign = SIGN_ORDER[i];
    for (let j = i + 1; j < SIGN_ORDER.length; j++) {
      const other = SIGN_ORDER[j];
      const diff = j - i;

      let relationship: RelationshipType;

      if (diff === 4 || diff === 8) {
        relationship = 'trino';
      } else if (diff === 2 || diff === 10) {
        relationship = 'sextil';
      } else if (diff === 3 || diff === 9) {
        relationship = 'quadratura';
      } else if (diff === 6) {
        relationship = 'oposição';
      } else {
        relationship = 'conjunção';
      }

      rels[sign]!.push({ sign: other, relationship });
      rels[other]!.push({ sign: sign, relationship });
    }
  }

  return rels as SignRelationships;
}

const RELATIONSHIPS: SignRelationships = buildRelationships();

export function getRelationships(): SignRelationships {
  return RELATIONSHIPS;
}