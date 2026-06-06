// ============================================================
// MOTOR DE MEDICINA DA FLORESTA (FLORA SAGRADA)
// ============================================================
// Determina as orientações terapêuticas de medicinas da floresta
// (Ayahuasca e Rapé medicinal) com base nos dados de nascimento
// e ciclos numerológicos pessoais.
//
// Regras determinísticas de correspondência (Doc 14 / IDEIA.md):
// - Microdose de Ayahuasca: baseada no Ano Pessoal do consulente.
// - Rapés Recomendados: baseados no Odu de nascimento e pontos de Chakra.
// - Alerta Espiritual (Ori Quente / Bloqueios): baseado na assinatura elemental
//   e tabus (quizilas) do Odu natal.

import type { ForestMedicineMap } from '@/types';

function reduceNumber(n: number): number {
  let r = n;
  while (r > 9) {
    r = String(r)
      .split('')
      .reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return r;
}

function calculateOduNumber(day: number, month: number): number {
  let r = day + month;
  while (r > 16) {
    r = String(r)
      .split('')
      .reduce((s, d) => s + parseInt(d, 10), 0);
  }
  if (r === 0) r = 16;
  return r;
}

export function buildForestMedicineMap(
  birthDate: string,
  fullName: string
): ForestMedicineMap {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return {
      ayahuascaProtocol: {
        name: 'Protocolo de Alinhamento Diário',
        dosage: '1 gota de microdose de Ayahuasca pela manhã',
        rationale: 'Foco em manter o equilíbrio mental, presença e clareza no cotidiano.',
      },
      recomendedRapes: [
        {
          name: 'Rapé Tsunu',
          purpose: 'Clareza mental e centramento',
          indication: 'Indicado para limpeza de pensamentos repetitivos e harmonização energética diária.',
        },
      ],
      spiritualWarning: 'Mantenha a atenção plena nas suas relações cotidianas e cultive o perdão para evitar bloqueios de caminho.',
    };
  }

  const [, yStr, mStr, dStr] = match;
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  // 1. Calcular Ano Pessoal para o ano corrente de referência (padrão 2026)
  // 2026 -> 2+0+2+6 = 10 -> 1
  const currentYearRef = 2026;
  const yearRefReduced = reduceNumber(currentYearRef);
  const personalYear = reduceNumber(day + month + yearRefReduced);

  // 2. Calcular Odu de Nascimento
  const birthOdu = calculateOduNumber(day, month);

  // 3. Determinar protocolo de Ayahuasca baseado no Ano Pessoal
  let ayahuascaProtocol = {
    name: 'Protocolo de Alinhamento Diário',
    dosage: '1 gota de microdose de Ayahuasca pela manhã',
    rationale: 'Seu ciclo atual pede estabilidade e vigilância emocional diária.',
  };

  if (personalYear === 9) {
    ayahuascaProtocol = {
      name: 'Protocolo de Travessia (Ayahuasca Microdosing)',
      dosage: '3 gotas à noite, 3 vezes por semana (segundas, quartas e sextas)',
      rationale: 'O Ano Pessoal 9 é o tempo de encerramento, limpeza profunda, desapego e busca interior sagrada.',
    };
  } else if (personalYear === 7) {
    ayahuascaProtocol = {
      name: 'Protocolo de Visão e Intuição (Ayahuasca Microdosing)',
      dosage: '2 gotas pela manhã, em dias alternados',
      rationale: 'O Ano Pessoal 7 favorece fortemente o estudo interior, a meditação, o silêncio e a conexão espiritual.',
    };
  } else if (personalYear === 5) {
    ayahuascaProtocol = {
      name: 'Protocolo de Adaptação e Movimento (Ayahuasca Microdosing)',
      dosage: '2 gotas à noite, aos fins de semana',
      rationale: 'O Ano Pessoal 5 traz mudanças rápidas e volatilidade; este protocolo apoia a maleabilidade mental e o foco.',
    };
  } else if (personalYear === 1 || personalYear === 8) {
    ayahuascaProtocol = {
      name: 'Protocolo de Foco e Ação (Ayahuasca Microdosing)',
      dosage: '2 gotas pela manhã, de segunda a quinta-feira',
      rationale: 'Seu ciclo atual demanda energia realizadora, liderança e aterramento prático.',
    };
  }

  // 4. Determinar Rapés Recomendados baseados no Odu de Nascimento e nos desequilíbrios típicos
  const rapes: ForestMedicineMap['recomendedRapes'] = [];

  // Rapé 1: Sempre baseado no Odu de Nascimento para harmonização de temperamento
  if (birthOdu === 9) { // Ossá (Ventos, instabilidade)
    rapes.push({
      name: 'Rapé Tsunu (Sabedoria da Floresta)',
      purpose: 'Aterramento, centramento e organização dos pensamentos acelerados',
      indication: 'Indicado para dissipar ventos mentais e a nebulosidade emocional típica do Odu Ossá.',
    });
  } else if (birthOdu === 3 || birthOdu === 11) { // Etogundá / Owarin (Guerra, impeto, disputa)
    rapes.push({
      name: 'Rapé Canela de Velho',
      purpose: 'Harmonização do ímpeto agressivo e alívio de tensões de batalha',
      indication: 'Indicado para acalmar a impulsividade, aplacar o estresse físico e restaurar a paz interior.',
    });
  } else if (birthOdu === 4 || birthOdu === 7) { // Irosun / Odi (Sangue, segredos, perigo oculto)
    rapes.push({
      name: 'Rapé Murici',
      purpose: 'Aterramento físico, presença absoluta e instinto de autoproteção',
      indication: 'Atua no chakra básico para trazer segurança, firmeza física e limpar energias de inveja ou traição.',
    });
  } else if (birthOdu === 6) { // Obará (Fartura, prosperidade)
    rapes.push({
      name: 'Rapé Veia de Pajé (Conexão e Abundância)',
      purpose: 'Magnetismo pessoal, abertura de caminhos e clareza em decisões financeiras',
      indication: 'Sintoniza a mente com a vibração de prosperidade e sabedoria material do Odu Obará.',
    });
  } else {
    // Default Rapé de cura e equilíbrio
    rapes.push({
      name: 'Rapé Tsunu Tradicional',
      purpose: 'Limpeza do campo áurico e clareza mental',
      indication: 'Promove a purificação diária do pensamento e estabilização prânica.',
    });
  }

  // Rapé 2: Auxiliar baseado nos corpos e necessidades espirituais gerais do nome/data
  const nameLength = fullName.replace(/\s/g, '').length;
  if (nameLength % 2 === 0) {
    rapes.push({
      name: 'Rapé de Alecrim',
      purpose: 'Foco intelectual, alegria de viver e combate à fadiga mental',
      indication: 'Indicado para momentos de cansaço ou sobrecarga de pensamentos.',
    });
  } else {
    rapes.push({
      name: 'Rapé de Hortelã',
      purpose: 'Abertura das vias respiratórias e alinhamento do Chakra Laríngeo',
      indication: 'Auxilia na expressão da verdade individual e alívio de bloqueios na garganta.',
    });
  }

  // 5. Determinar Alerta Espiritual (Ori Quente / Relações Familiares / Quizilas)
  let spiritualWarning = 'Atenção às oscilações de pensamento acelerado. Cultive a paciência nas suas relações diárias.';

  // Caso 1: Ori Quente (detectado por Odu de fogo/ação ou excesso de energia yang)
  const isOriQuente = [3, 8, 11, 15].includes(birthOdu) || (day % 3 === 0);
  if (isOriQuente) {
    spiritualWarning = 'Vigilância contra o "Ori Quente" (cabeça quente/acelerada). O Odu natal indica propensão a estresse mental, ansiedade e panico quando desalinhado. Evite seguir caminhos impulsivos ou tóxicos para o seu destino. Pratique o aterramento diário com Rapé Tsunu ou Canela de Velho.';
  }

  // Caso 2: Bloqueios familiares e perdão (identificados por numerologia/ciclos kármicos)
  const hasFamilyKarmicChallenge = [4, 8, 9].includes(month) || (nameLength % 3 === 0);
  if (hasFamilyKarmicChallenge) {
    spiritualWarning += ' Há indicação de bloqueios kármicos associados a dinâmicas familiares (relação com a mãe ou com o pai). A falta de perdão e mágoas não resolvidas do passado atuam diretamente travando a fluidez dos seus caminhos materiais. Pratique o auto-acolhimento e busque a cura das raízes ancestrais.';
  }

  // Adicionar aviso de quizila do Odu
  if (birthOdu === 1) {
    spiritualWarning += ' Quizila de Ogbe: evite pular etapas em projetos e nunca tome decisões importantes de forma apressada.';
  } else if (birthOdu === 6) {
    spiritualWarning += ' Preceito de Obará: afaste-se da ganância e mantenha a humildade para que a prosperidade continue fluindo nos seus caminhos.';
  } else if (birthOdu === 8) {
    spiritualWarning += ' Quizila de Ejionile: evite a arrogância ou o orgulho excessivo, e cultive a retidão e a justiça em suas palavras.';
  }

  return {
    ayahuascaProtocol,
    recomendedRapes: rapes,
    spiritualWarning,
  };
}
