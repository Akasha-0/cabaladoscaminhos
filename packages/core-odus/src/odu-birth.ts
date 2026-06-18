/// ============================================================
// MOTOR DE ODU DE NASCIMENTO
// ============================================================
// Determina o Odu regente da vida do consulente a partir da data
// de nascimento. Usa TODOS OS 8 DÍGITOS (DDMMYYYY) — algoritmo
// consistente com calcularOduNascimento em calculos.ts.
//
// Regra: soma de todos os 8 dígitos → reduzida até caber em 1-16.
//
// Exemplos:
//   1991-12-04 → 1+9+9+1+1+2+0+4 = 27 → 2+7 = 9  → Odu 9 (Ossá)
//   1986-03-15 → 1+9+8+6+0+3+1+5 = 33 → 3+3 = 6  → Odu 6 (Obará)
import type { OduBirth } from '@akasha/types';
import { ODUS_IFA } from './odus-ifa-data';

function reduceOduNumber(n: number): number {
  let r = n;
  while (r > 16) {
    r = String(r)
      .split('')
      .reduce((s, d) => s + parseInt(d, 10), 0);
  }
  if (r === 0) r = 16; // caso degenerado
  return r;
}

export function calculateBirthOdu(birthDate: string): OduBirth {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return {
      oduNumber: 1,
      oduName: 'Ogbe',
      orixaRegency: ['Oxalá'],
      elementalForce: 'Luz, criação, autoridade divina',
      lifeLesson: 'Cultivar a paciência e honrar a criação.',
      provisional: true,
    };
  }

  const [, y, m, d] = match;
  // Use all 8 digits (DDMMYYYY) — consistent with calcularOduNascimento in calculos.ts.
  // Soma todos os 8 dígitos e reduz até caber em 1–16.
  const allDigits = y + m + d; // 'YYYYMMDD' concatenated
  const sum = allDigits.split('').reduce((s, digit) => s + parseInt(digit, 10), 0);
  const oduNumber = reduceOduNumber(sum);

  const odu = ODUS_IFA.find((o) => o.numero === oduNumber) ?? ODUS_IFA[0];

  return {
    oduNumber,
    oduName: odu.nome.split(' (')[0], // Strip parenthetical aliases (e.g. 'Ogbe (Oxé)' → 'Ogbe')
    orixaRegency: [odu.orixaRegente],
    elementalForce: `${odu.elementos} — ${odu.significado.split('.')[0]}`,
    lifeLesson: odu.preceitos.join('; '),
    // Algoritmo default (DDMMYYYY). A tabela definitiva da linhagem é decisão
    // do operador (D3, Doc 11 §4); sinalizado para a UI até ser substituído.
    provisional: true,
  };
}
