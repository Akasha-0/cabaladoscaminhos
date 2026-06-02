// ============================================================
// MOTOR DE ODU DE NASCIMENTO
// ============================================================
// Determina o Odu regente da vida do consulente a partir da data
// de nascimento. Usa uma regra determinística baseada no dia + mês,
// que é o método mais comum na tradição.
//
// Regra: dia + mês → reduzido até caber no intervalo 1-16 (16 odus principais).
//
// Exemplos:
//   20/08 → 20+8=28 → 2+8=10 → Odu 10 (Ofun)
//   15/03 → 15+3=18 → 1+8=9  → Odu 9 (Ossá)
//   01/01 → 1+1=2            → Odu 2 (Ejiokô)

import type { OduBirth } from '@/types';
import { ODUS_IFA } from '@/lib/lenormand/mesa-real-data';

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
      oduName: 'Ogbe (Oxé)',
      orixaRegency: ['Oxalá'],
      elementalForce: 'Luz, criação, autoridade divina',
      lifeLesson: 'Cultivar a paciência e honrar a criação.',
      provisional: true,
    };
  }

  const [, , m, d] = match;
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const oduNumber = reduceOduNumber(day + month);

  const odu = ODUS_IFA.find((o) => o.numero === oduNumber) ?? ODUS_IFA[0];

  return {
    oduNumber,
    oduName: odu.nome,
    orixaRegency: [odu.orixaRegente],
    elementalForce: `${odu.elemento} — ${odu.significado.split('.')[0]}`,
    lifeLesson: odu.preceptos.join('; '),
    // Algoritmo default (dia+mês). A tabela definitiva da linhagem é decisão
    // do operador (D3, Doc 11 §4); sinalizado para a UI até ser substituído.
    provisional: true,
  };
}
