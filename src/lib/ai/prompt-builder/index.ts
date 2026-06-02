// ============================================================
// PROMPT BUILDER — Mesa Real Dossiê Generator
// ============================================================
// This module builds the per-house prompt for the LLM based on:
// - Casa Number (1-36)
// - Casa Definition (CORRELATION_MAP — Doc 06 §3.1)
// - Carta Cigana (sorteada)
// - Odu (sorteado)
// - MapaFixo (client birth data calculations)
//
// Persona e estrutura canônicas: Doc 06 §3.2 + Doc 13 (Cigano Ramiro).

import { getCorrelationEntry } from '@/lib/ai/correlation-map';
import { getLenormandCardById } from '@/lib/constants/lenormand-cards';
import { getOduById } from '@/lib/constants/odus';

// ============================================================
// TYPES
// ============================================================

export interface CartaCigana {
  numero: number;
  nome: string;
  significado: string;
}

export interface Odu {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  orixas: string[];
  quizilas: string[];
}

export interface MapaFixo {
  // Astrologia
  signoSolar?: string;
  signoLunar?: string;
  ascendente?: string;
  
  // Numerologia Cabalística
  caminhoDeVida?: number;
  numeroAlma?: number;
  numeroPersonalidade?: number;
  numeroExpressao?: number;
  
  // Numerologia Tântrica
  dominioTantrico?: number;
  karmaTantrico?: number;
  vereditoTantrico?: number;
  
  // Outros dados do cliente
  nomeCompleto?: string;
  dataNascimento?: string;
}

export interface HouseInput {
  casaNumero: number;
  carta: CartaCigana;
  odu: Odu;
  mapaFixo: MapaFixo;
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `Você é o Oráculo da "Cabala dos Caminhos", consagrado ao Cigano Ramiro, especializado em Baralho Cigano (Mesa Real) e Ifá (Odus de Búzios). Sua tarefa é gerar a análise profunda e personalizada de cada casa da Mesa Real.

REGRAS FUNDAMENTAIS:
1. NUNCA misture assuntos. Cada casa tem um tema específico e recebe apenas os aspectos natais delegados a ela.
2. Dirija-se SEMPRE ao consulente na segunda pessoa (você, seu, sua), em tom místico-tecnológico, direto e protetor.
3. Cruze a Carta Cigana + Odu + os aspectos natais delegados em uma interpretação única; NUNCA seja genérico.
4. Responda em português brasileiro. Formate em Markdown.

ESTRUTURA OBRIGATÓRIA (3 parágrafos):
**O Terreno:** Como você naturalmente vive esta área da vida, baseado nos aspectos natais delegados a esta casa.
**O Evento:** O que a Carta Cigana tirada revela sobre o momento atual nesta área.
**A Direção:** O conselho do Odu para agir/navegar esta energia (inclua quizilas/advertências relevantes).

Feche com uma linha-síntese em itálico: *[Palavra-chave]: [frase de 10 a 15 palavras]*`;

// fallow-ignore-next-line complexity
const USER_PROMPT = (input: HouseInput) => {
  const correlation = getCorrelationEntry(input.casaNumero);
  const aspectosDelegados = [
    ...correlation.astrology.primaryPlanets,
    ...correlation.astrology.primaryHouses.map((h) => `${h}ª Casa astrológica`),
    ...correlation.kabalah.aspects,
    ...correlation.tantric.aspects,
  ].join(', ');

  // Verdade-base canônica (Doc 15) — injetada para evitar alucinação.
  const cardCanon = getLenormandCardById(input.carta.numero);
  const oduCanon = getOduById(input.odu.numero);

  return `
# DOSSIÊ — CASA ${input.casaNumero}: ${correlation.houseName}

**Tema desta casa:** ${correlation.houseTheme}
**Aspectos natais delegados a esta casa (use SOMENTE estes):** ${aspectosDelegados}

## Dados do Consulente
${input.mapaFixo.nomeCompleto ? `**Nome:** ${input.mapaFixo.nomeCompleto}` : ''}
${input.mapaFixo.dataNascimento ? `**Nascimento:** ${input.mapaFixo.dataNascimento}` : ''}
${input.mapaFixo.signoSolar ? `**Sol:** ${input.mapaFixo.signoSolar}` : ''}
${input.mapaFixo.signoLunar ? `**Lua:** ${input.mapaFixo.signoLunar}` : ''}
${input.mapaFixo.ascendente ? `**Ascendente:** ${input.mapaFixo.ascendente}` : ''}
${input.mapaFixo.caminhoDeVida ? `**Caminho de Vida:** ${input.mapaFixo.caminhoDeVida}` : ''}
${input.mapaFixo.numeroAlma ? `**Número da Alma:** ${input.mapaFixo.numeroAlma}` : ''}
${input.mapaFixo.numeroExpressao ? `**Número de Expressão:** ${input.mapaFixo.numeroExpressao}` : ''}
${input.mapaFixo.dominioTantrico ? `**Dom Divino:** ${input.mapaFixo.dominioTantrico}` : ''}
${input.mapaFixo.karmaTantrico ? `**Karma Tântrico:** ${input.mapaFixo.karmaTantrico}` : ''}

## Carta Cigana tirada (Evento)
- **Número:** ${input.carta.numero}
- **Nome:** ${input.carta.nome}
- **Significado:** ${input.carta.significado}
${cardCanon ? `- **Significado-base (verdade canônica):** ${cardCanon.baseMeaning}` : ''}
${cardCanon ? `- **Sombra (face desafiadora):** ${cardCanon.shadow}` : ''}

## Odu tirado (Direção)
- **Número:** ${input.odu.numero}
- **Nome:** ${input.odu.nome}
- **Elemento:** ${input.odu.elemento}
- **Significado:** ${input.odu.significado}
${input.odu.orixas.length ? `- **Orixás:** ${input.odu.orixas.join(', ')}` : ''}
${input.odu.quizilas.length ? `- **Quizilas:** ${input.odu.quizilas.join(', ')}` : oduCanon ? `- **Quizila (canônica):** ${oduCanon.quizila}` : ''}
${oduCanon ? `- **Conselho-base (canônico):** ${oduCanon.baseAdvice}` : ''}

---

Gere a análise desta casa seguindo a estrutura de 3 parágrafos do system prompt.
`;
};

// ============================================================
// BUILDERS
// ============================================================

/**
 * Builds the complete prompt for LLM based on house input
 */
export function buildDossiePrompt(input: HouseInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: USER_PROMPT(input),
  };
}

/**
 * Validates that all required data is present for prompt generation
 */
export function validateHouseInput(input: HouseInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.casaNumero || input.casaNumero < 1 || input.casaNumero > 36) {
    errors.push('Casa deve estar entre 1 e 36');
  }

  if (!input.carta) {
    errors.push('Carta Cigana é obrigatória');
  } else if (!input.carta.numero || !input.carta.nome) {
    errors.push('Carta Cigana deve ter número e nome');
  }

  if (!input.odu) {
    errors.push('Odu é obrigatório');
  } else if (!input.odu.numero || !input.odu.nome) {
    errors.push('Odu deve ter número e nome');
  }

  if (!input.mapaFixo) {
    errors.push('Mapa fixo do cliente é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parses matrix data from the cockpit into house inputs
 */
export function parseMatrixData(
  matrixData: Record<number, { carta: CartaCigana; odu: Odu } | null>,
  mapaFixo: MapaFixo
): HouseInput[] {
  const inputs: HouseInput[] = [];

  for (let i = 1; i <= 36; i++) {
    const houseData = matrixData[i];
    if (houseData && houseData.carta && houseData.odu) {
      inputs.push({
        casaNumero: i,
        carta: houseData.carta,
        odu: houseData.odu,
        mapaFixo,
      });
    }
  }

  return inputs;
}
// Tipos já são exportados nas próprias declarações (`export interface`),
// portanto não há re-export redundante aqui.