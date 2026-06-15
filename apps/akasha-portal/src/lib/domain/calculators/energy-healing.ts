// ============================================================
// MOTOR DE CURA ENERGÉTICA (REIKI E APOMETRIA)
// ============================================================
// Determina as orientações terapêuticas de Reiki (símbolos e focos)
// e os protocolos de Apometria com base em dívidas kármicas
// detectadas no mapa natal do consulente.
//
// Regras determinísticas de correspondência (Doc 14 / IDEIA.md):
// - Reiki: símbolos recomendados (Cho Ku Rei, Sei He Ki, etc.) com base
//   nas fraquezas dos corpos prânicos/chakras calculados.
// - Apometria: protocolos focados em dissolver amarras kármicas de vidas
//   passadas ligadas diretamente às dívidas cabalísticas (13, 14, 16, 19).

import type { EnergyHealingMap } from '@akasha/types';
import { buildKabalisticMap } from '@akasha/core-cabala';

export function buildEnergyHealingMap(
  birthDate: string,
  fullName: string
): EnergyHealingMap {
  // 1. Calcular Dívidas Kármicas usando o motor de Numerologia Cabalística existente
  let karmicDebts: number[] = [];
  try {
    const kabalah = buildKabalisticMap(fullName, birthDate);
    karmicDebts = kabalah.karmicDebts ?? [];
  } catch (err) {
    console.error('Erro ao calcular mapa cabalístico para cura energética:', err);
  }

  // 2. Determinar Símbolos de Reiki Recomendados baseados na assinatura de nascimento
  const reikiSymbols: Array<{ symbol: string; name: string; purpose: string; chakraTarget: string }> = [];

  // Sempre recomenda Cho Ku Rei para aterramento e vitalidade inicial
  reikiSymbols.push({
    symbol: 'CHO-KU-REI (超空灵)',
    name: 'Símbolo de Poder e Proteção',
    purpose: 'Amplificar a energia vital, selar o campo áurico de proteção e trazer aterramento na matéria.',
    chakraTarget: '1º Muladhara (Básico)',
  });

  // Recomenda Sei He Ki para purificação emocional caso haja indícios de estresse mental/emocional
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const month = match ? parseInt(match[2], 10) : 1;
  const day = match ? parseInt(match[3], 10) : 1;

  if ([2, 3, 5, 6, 8, 9].includes(month) || day % 2 === 0) {
    reikiSymbols.push({
      symbol: 'SEI-HE-KI (圣平基)',
      name: 'Símbolo de Cura Mental e Emocional',
      purpose: 'Harmonizar sentimentos de ansiedade, pânico, mágoas familiares ocultas e acalmar o Ori Quente.',
      chakraTarget: '4º Anahata (Cardíaco) e 3º Manipura (Plexo Solar)',
    });
  }

  // Se há dívidas kármicas ou feridas de ancestralidade complexas, recomenda Hon Sha Ze Sho Nen para cura temporal
  if (karmicDebts.length > 0 || [4, 8, 12, 16, 20, 24, 28].includes(day)) {
    reikiSymbols.push({
      symbol: 'HON-SHA-ZE-SHO-NEN (本者是正念)',
      name: 'Símbolo de Conexão Atemporal e Cura à Distância',
      purpose: 'Acessar registros do passado (infância e vidas passadas) para liberar bloqueios de falta de perdão familiar.',
      chakraTarget: '6º Ajna (Terceiro Olho)',
    });
  }

  // Se o dia de nascimento reduzido for mestre ou espiritual, ativa o Dai Ko Myo para mestria de alma
  const reducedDay = day > 9 ? (day % 11 === 0 ? day : (day % 9 === 0 ? 9 : (day % 9))) : day;
  if ([7, 9, 11, 22].includes(reducedDay)) {
    reikiSymbols.push({
      symbol: 'DAI-KO-MYO (大光明)',
      name: 'Símbolo de Cura Espiritual e Mestria',
      purpose: 'Despertar a conexão direta com a luz divina da alma, clareza sobre o propósito de vida e ativação do corpo sutil.',
      chakraTarget: '7º Sahasrara (Coronário)',
    });
  }

  // 3. Determinar Protocolo de Aterramento Xamânico baseado nas dívidas kármicas cabalísticas
  let groundingProtocol = {
    technique: 'Aterramento Xamânico Geral e Harmonização Prânica',
    purpose: 'Respiração profunda e contato com a terra para estabilização prânica cotidiana.',
    rationale: 'Seu mapa não indica dívidas kármicas ativas. A prática atua na manutenção preventiva da paz e estabilização energética.',
  };

  if (karmicDebts.includes(13)) {
    groundingProtocol = {
      technique: 'Aterramento de Liberação de Inércia e Ação Prática',
      purpose: 'Exercícios de respiração ativa e caminhadas conscientes na terra/grama para desbloquear a inércia e atrair prosperidade.',
      rationale: 'A dívida kármica 13 indica memórias de estagnação e negligência em encarnações anteriores. O aterramento contínuo ajuda a reestabelecer o fluxo de ação e produtividade.',
    };
  } else if (karmicDebts.includes(14)) {
    groundingProtocol = {
      technique: 'Aterramento para Integração Emocional e Equilíbrio da Alma',
      purpose: 'Respiração Pranayama e meditações de centramento com plantas medicinais ou chás calmantes.',
      rationale: 'A dívida kármica 14 reflete abusos de liberdade pessoal no passado. A prática de aterramento com respiração ritmada devolve o autocontrole, centramento e a paz mental.',
    };
  } else if (karmicDebts.includes(16)) {
    groundingProtocol = {
      technique: 'Aterramento de Proteção e Fortalecimento do Templo Sagrado',
      purpose: 'Visualizações de enraizamento profundo da coluna vertebral no núcleo da Terra, fortalecendo a aura.',
      rationale: 'A dívida kármica 16 sinaliza a necessidade de reconstruir a base ética e a humildade. Este aterramento fortalece o Chakra Cardíaco e protege contra oscilações de ego e auto-obsessão.',
    };
  } else if (karmicDebts.includes(19)) {
    groundingProtocol = {
      technique: 'Aterramento Solar e Alinhamento de Poder Consciente',
      purpose: 'Banhos de sol conscientes (amanhecer) em contato direto com a terra (pés descalços).',
      rationale: 'A dívida kármica 19 exige o aprendizado de liderar com empatia. O aterramento solar equilibra o plexo solar, removendo a necessidade de controle e restaurando a liderança fraterna.',
    };
  }

  return {
    reikiSymbols,
    groundingProtocol,
  };
}
