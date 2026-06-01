// ============================================================
// DAILY CONTEXT BUILDER
// ============================================================
// Constrói o CONTEXTO AGÊNTICO diário completo, juntando:
// - Perfil espiritual do usuário
// - Dia/Mês/Ano pessoal
// - Trânsitos planetários
// - Fase lunar
// - Pináculo atual
// - Energia do dia
//
// Este é o "prompt" estruturado que será enviado para a IA
// gerar recomendações práticas e profundas.
// ============================================================

import {
  buildCycleSnapshot,
  type PersonalCycleSnapshot,
  type PersonalDay,
  type PersonalMonth,
  type PersonalYear,
} from './personal-cycle-engine';
import {
  buildDailyEnergy,
  type DailyEnergy,
  type TransitAspect,
  type MoonPhase,
} from './transit-engine';
import { getBirthChart, type BirthChart } from '@/lib/astrologia/birth-chart';
import { calculateNumerology } from '@/lib/numerologia/generator';

// ============================================================
// TYPES
// ============================================================

export interface UserSpiritualProfile {
  nome: string;
  dataNascimento: string;       // ISO
  horaNascimento?: string;
  localNascimento?: string;
  fullName?: string;            // Nome completo (para lições cármicas)
  // Cached numerology
  caminhoDeVida?: number;
  numeroExpressao?: number;
  numeroDestino?: number;
  // Cached astro
  signoSolar?: string;
  ascendente?: string;
  oduNascimento?: string;
  orixaRegente?: string;
  // Idade e contexto
  genero?: 'M' | 'F' | 'Outro';
  cidade?: string;
}

export interface DailyAgentContext {
  // Identificação
  data: string;                 // ISO
  user: UserSpiritualProfile;

  // Ciclos pessoais
  personalDay: PersonalDay;
  personalMonth: PersonalMonth;
  personalYear: PersonalYear;
  universalYear: { number: number; theme: string; globalEnergy: string };
  age: number;
  currentPinnacleTheme: string;

  // Energia do dia
  dailyEnergy: DailyEnergy;

  // Snapshot completo
  cycleSnapshot: PersonalCycleSnapshot;

  // Trânsitos importantes (filtrados)
  criticalAspects: TransitAspect[];

  // Contexto formatado para a IA
  formattedContext: string;

  // Metadata
  computedAt: string;
  version: string;
}

// ============================================================
// BUILD CONTEXT
// ============================================================

export async function buildDailyContext(
  user: UserSpiritualProfile,
  currentDate: Date = new Date()
): Promise<DailyAgentContext> {
  const birthDate = new Date(user.dataNascimento);

  // Calcular numerologia se não foi cacheada
  let lifePath = user.caminhoDeVida;
  let expression = user.numeroExpressao;

  if (!lifePath || !expression) {
    try {
      const num = calculateNumerology(user.fullName || user.nome, user.dataNascimento);
      lifePath = lifePath || num.vida;
      expression = expression || num.expressao;
    } catch (err) {
      // Fallback se a função falhar
      if (!lifePath) lifePath = calculateSimpleLifePath(birthDate);
      if (!expression) expression = lifePath;
    }
  }

  // Calcular mapa natal
  let birthChart: BirthChart;
  try {
    birthChart = getBirthChart({
      birthDate,
      latitude: -12.9714,
      longitude: -38.5014,
    });
  } catch (err) {
    // Fallback
    birthChart = getBirthChart({
      birthDate,
      latitude: -12.9714,
      longitude: -38.5014,
    });
  }

  // Construir snapshot
  const cycleSnapshot = buildCycleSnapshot(
    birthDate,
    lifePath,
    expression,
    user.fullName || user.nome,
    currentDate
  );

  // Calcular energia do dia
  const dailyEnergy = buildDailyEnergy(birthChart, currentDate);

  // Filtrar aspectos críticos
  const criticalAspects = dailyEnergy.majorAspects.slice(0, 5);

  // Formatar contexto para a IA
  const formattedContext = formatContextForAI(
    user,
    cycleSnapshot,
    dailyEnergy,
    criticalAspects
  );

  return {
    data: currentDate.toISOString().split('T')[0],
    user,
    personalDay: cycleSnapshot.personalDay,
    personalMonth: cycleSnapshot.personalMonth,
    personalYear: cycleSnapshot.personalYear,
    universalYear: cycleSnapshot.universalYear,
    age: cycleSnapshot.age,
    currentPinnacleTheme: cycleSnapshot.currentPinnacle.theme,
    dailyEnergy,
    cycleSnapshot,
    criticalAspects,
    formattedContext,
    computedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

// ============================================================
// FORMAT CONTEXT FOR AI
// ============================================================

function formatContextForAI(
  user: UserSpiritualProfile,
  cycle: PersonalCycleSnapshot,
  energy: DailyEnergy,
  aspects: TransitAspect[]
): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('🕐 CONTEXTO ESPIRITUAL DO DIA');
  lines.push(`Data: ${new Date(cycle.currentDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}`);
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  // PERFIL DO USUÁRIO
  lines.push('👤 PERFIL ESPIRITUAL');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Nome: ${user.nome}`);
  lines.push(`Idade: ${cycle.age} anos`);
  if (user.signoSolar) lines.push(`Signo Solar: ${user.signoSolar}`);
  if (user.ascendente) lines.push(`Ascendente: ${user.ascendente}`);
  lines.push(`Caminho de Vida: ${cycle.lifePath}`);
  if (user.oduNascimento) lines.push(`Odu de Nascimento: ${user.oduNascimento}`);
  if (user.orixaRegente) lines.push(`Orixá Regente: ${user.orixaRegente}`);
  lines.push(`Pináculo Atual: ${cycle.currentPinnacle.theme}`);
  lines.push(`Número de Maturidade: ${cycle.maturity.number} (${cycle.maturity.theme})`);
  lines.push('');

  // CICLOS PESSOAIS
  lines.push('🔄 CICLOS PESSOAIS (Dinâmicos)');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`📅 DIA PESSOAL ${cycle.personalDay.number} — ${cycle.personalDay.energy}`);
  lines.push(`   Energia: ${cycle.personalDay.keywords.join(', ')}`);
  lines.push(`   Ação recomendada: ${cycle.personalDay.action}`);
  lines.push(`   Evitar: ${cycle.personalDay.avoid}`);
  lines.push(`   Favorável para: ${cycle.personalDay.favorable}`);
  lines.push(`   Chakra: ${cycle.personalDay.chakra}`);
  lines.push(`   Cor: ${cycle.personalDay.color}`);
  lines.push(`   Afirmação: "${cycle.personalDay.affirmation}"`);
  lines.push('');
  lines.push(`🗓️ MÊS PESSOAL ${cycle.personalMonth.number}`);
  lines.push(`   Tema: ${cycle.personalMonth.theme}`);
  lines.push(`   Foco: ${cycle.personalMonth.focus}`);
  lines.push(`   Oportunidades: ${cycle.personalMonth.opportunities.join(' | ')}`);
  lines.push(`   Avisos: ${cycle.personalMonth.warnings.join(' | ')}`);
  lines.push('');
  lines.push(`🎯 ANO PESSOAL ${cycle.personalYear.number}`);
  lines.push(`   Tema: ${cycle.personalYear.theme}`);
  lines.push(`   Duração: ${cycle.personalYear.duration}`);
  lines.push(`   Lições principais: ${cycle.personalYear.majorLessons.join(' | ')}`);
  lines.push(`   Oportunidades: ${cycle.personalYear.opportunities.join(' | ')}`);
  lines.push(`   Ação-chave: ${cycle.personalYear.keyAction}`);
  lines.push('');

  // ANO UNIVERSAL
  lines.push('🌍 ANO UNIVERSAL');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Ano ${energy.date.split('-')[0]} = Número Universal ${cycle.universalYear.number}`);
  lines.push(`Tema global: ${cycle.universalYear.theme}`);
  lines.push(`Energia global: ${cycle.universalYear.globalEnergy}`);
  lines.push('');

  // TRÂNSITOS
  if (aspects.length > 0) {
    lines.push('🪐 TRÂNSITOS PLANETÁRIOS (Ativos hoje)');
    lines.push('─────────────────────────────────────────────────────');
    aspects.forEach(a => {
      lines.push(`${a.transitPlanet} ${a.aspect} ${a.natalPlanet} (${a.exactness}% exato)`);
      lines.push(`   ${a.interpretation}`);
      lines.push(`   Energia: ${a.energy} | Áreas: ${a.lifeAreas.join(', ')}`);
      lines.push(`   → ${a.recommendation}`);
      lines.push('');
    });
  }

  // FASE LUNAR
  lines.push('🌙 FASE LUNAR');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`${energy.moonPhase.name} (${energy.moonPhase.illumination}% iluminada)`);
  lines.push(`Energia: ${energy.moonPhase.energy}`);
  lines.push(`Ação: ${energy.moonPhase.action}`);
  lines.push(`Evitar: ${energy.moonPhase.avoid}`);
  lines.push(`Favorável para: ${energy.moonPhase.favorableFor.join(', ')}`);
  lines.push(`Rituais: ${energy.moonPhase.rituals.join(' | ')}`);
  lines.push('');

  // RETROGRADAÇÕES
  if (energy.retrogradePlanets.length > 0) {
    lines.push('⏪ PLANETAS RETRÓGRADOS');
    lines.push('─────────────────────────────────────────────────────');
    lines.push(energy.retrogradePlanets.join(', '));
    lines.push('(período de revisão, introspecção, refazer)');
    lines.push('');
  }

  // DESAFIOS KÁRMICOS
  if (cycle.karmicLessons.length > 0) {
    lines.push('⚠️ LIÇÕES CÁRMICAS ATIVAS');
    lines.push('─────────────────────────────────────────────────────');
    cycle.karmicLessons.slice(0, 3).forEach(l => {
      lines.push(`• Lição do ${l.missing}: ${l.description} (${l.lifeArea})`);
    });
    lines.push('');
  }

  // ENERGIA GERAL
  lines.push('⚡ ENERGIA GERAL DO DIA');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Nível: ${energy.overallEnergy}/100`);
  lines.push(`Tema: ${energy.overallTheme}`);
  lines.push(`Conselho-chave: ${energy.keyAdvice}`);
  lines.push(`Cor de sorte: ${energy.luckyColor}`);
  lines.push(`Número de sorte: ${energy.luckyNumber}`);
  lines.push(`Horário de pico: ${energy.powerHour}`);
  lines.push('');

  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

// ============================================================
// HELPER
// ============================================================

function calculateSimpleLifePath(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();

  const sum = (n: number): number => {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n < 10) return n;
    return sum(String(n).split('').reduce((a, b) => a + parseInt(b, 10), 0));
  };

  return sum(day + month + year);
}
