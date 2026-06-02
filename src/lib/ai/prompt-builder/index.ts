// ============================================================
// PROMPT BUILDER — Mesa Real Dossiê Generator
// ============================================================
// This module builds the prompt for the LLM based on:
// - Casa Number (1-36)
// - Casa Definition (from house-delegation)
// - Carta Cigana (sorteada)
// - Odu (sorteado)
// - MapaFixo (client birth data calculations)

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

const SYSTEM_PROMPT = `Você é um terapeuta espiritual especializado em Baralho Cigano (Mesa Real) e Ifá (Odus de Búzios). Sua tarefa é gerar dossiers profundos e personalizados para cada casa da Mesa Real.

REGRAS FUNDAMENTAIS:
1. NUNCA misture assuntos. Cada casa tem um tema específico.
2. Use os dados do mapa do cliente (astrologia, numerologia, tantra) para PERSONALIZAR.
3. Cruze a Carta Cigana + Odu + Mapa Fixo em uma interpretação única.
4. Responda em português brasileiro, tom respeitoso e profundo.
5. Formate em Markdown com títulos, listas e seções claras.

ESTRUTURA DO DOSSIÊ:
## Contexto da Casa
- Tema e propósito da casa
- Por que esta casa é importante para este cliente

## Interpretação Cruzada
- O que a Carta Cigana revela neste contexto
- O que o Odu complementa/contradiz
- Como os dados do mapa personalizam

## Aconselhamento Espiritual
- Orientações práticas baseadas nos símbolos
- Quizilas ou advertências relevantes
- Sugestões de ebós ou práticas

## Síntese Final
- Frase de fechamento profunda`;

const USER_PROMPT = (input: HouseInput) => `
# DOSSIÊ — CASA ${input.casaNumero} DA MESA REAL

## Dados do Cliente
${input.mapaFixo.nomeCompleto ? `**Nome:** ${input.mapaFixo.nomeCompleto}` : ''}
${input.mapaFixo.dataNascimento ? `**Nascimento:** ${input.mapaFixo.dataNascimento}` : ''}
${input.mapaFixo.signoSolar ? `**Sol:** ${input.mapaFixo.signoSolar}` : ''}
${input.mapaFixo.signoLunar ? `**Lua:** ${input.mapaFixo.signoLunar}` : ''}
${input.mapaFixo.ascendente ? `**Ascendente:** ${input.mapaFixo.ascendente}` : ''}
${input.mapaFixo.caminhoDeVida ? `**Caminho de Vida:** ${input.mapaFixo.caminhoDeVida}` : ''}
${input.mapaFixo.numeroAlma ? `**Número da Alma:** ${input.mapaFixo.numeroAlma}` : ''}
${input.mapaFixo.dominioTantrico ? `**Domínio Tântrico:** ${input.mapaFixo.dominioTantrico}` : ''}
${input.mapaFixo.karmaTantrico ? `**Karma Tântrico:** ${input.mapaFixo.karmaTantrico}` : ''}

## Carta Cigana — Casa ${input.casaNumero}
- **Número:** ${input.carta.numero}
- **Nome:** ${input.carta.nome}
- **Significado:** ${input.carta.significado}

## Odu de Búzios — Casa ${input.casaNumero}
- **Número:** ${input.odu.numero}
- **Nome:** ${input.odu.nome}
- **Elemento:** ${input.odu.elemento}
- **Significado:** ${input.odu.significado}
${input.odu.orixas.length ? `- **Orixás:** ${input.odu.orixas.join(', ')}` : ''}
${input.odu.quizilas.length ? `- **Quizilas:** ${input.odu.quizilas.join(', ')}` : ''}

---

Gere o dossier completo seguindo a estrutura definida no system prompt.
`;

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

// ============================================================
// EXPORTS
// ============================================================

export type { HouseInput, CartaCigana, Odu, MapaFixo };