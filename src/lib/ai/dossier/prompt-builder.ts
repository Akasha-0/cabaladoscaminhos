// fallow-ignore-file unused-file
/**
 * Prompt Builder for Mesa Real Dossier AI Generation
 * @module ai/dossier/prompt-builder
 */

import type { TiragemMesaReal, ArquiteturaDossiê } from './types';

// ============================================================
// SYSTEM PROMPT
// ============================================================

/**
 * Returns the system prompt for the Mesa Real dossier spiritual guide.
 * Focuses on archetype crossings and direct technical analysis.
 */
export function gerarSystemPromptDossier(): string {
  return `Você é a IA da Cabala dos Caminhos. Analise os cruzamentos arquetípicos de forma direta e técnica.

INTEGRAÇÃO SISTÊMICA:
- Mesa Real (Cartas Ciganas/Lenormand): 36 casas, leitura em grade 9x4
- Odús (Ifá): 16 odús principais com conselhos e orixás
- Cabala: 10 Sephirot, Árvore da Vida
- Numerologia: Caminho de Vida, Expressão, Motivação, Destino
- Tântrica: Número de Alma, Dom Divino, Número de Karma

METODOLOGIA:
1. Para cada casa, identifique o cruzamento: casa (terreno estático) + carta + odu (evento dinâmico)
2. Injete dados do cliente (MapaAlma) relevantes para aquela casa
3. Analise convergências e conflitos arquetípicos
4. Forneça conselho prático baseado no odu

FORMATOS DE ANÁLISE POR CASA:
---
### CASA [NÚMERO]: [NOME DA CASA]
**Terreno (Dados do Cliente):** [significado da casa]
**Tiragem (Evento):** [carta + odu]
**Diretriz (Conselho):** [odu meaning]

**Análise Cruzada:** [síntese - 2-3 frases profundas]
**Orientação Prática:** [conselho actionable - 1-2 frases]
---

FORMATO FINAL DE RESPOSTA:
Retorne um objeto JSON com a seguinte estrutura:

{
  "sumario": "Resumo geral do dossiê em 2-3 frases",
  "secoes": [
    {
      "casa": 1,
      "titulo": "Nome da Seção",
      "interpretacao": "Análise arquetípica profunda",
      "recomendacao": "Ação prática sugerida",
      "convergencias": ["Convergência 1", "Convergência 2"]
    }
  ],
  "conselhosGerais": ["Conselho 1", "Conselho 2", "Conselho 3"]
}

IDIOMA: Responda SEMPRE em português brasileiro, técnico e acessível.`;
}

// ============================================================
// ARCHITECTURE BUILDER
// ============================================================

/**
 * Card names for Mesa Real 36 cards
 */
const CARTA_NOME_MAP: Record<number, string> = {
  1: 'O Mensageiro', 2: 'A Cruz', 3: 'O Navio', 4: 'A Casa', 5: 'A Árvore',
  6: 'A Serpente', 7: 'O Caixão', 8: 'O Buquê', 9: 'A Foice', 10: 'O Machado',
  11: 'A Rede', 12: 'Os Pássaros', 13: 'O Menino', 14: 'A Raposa', 15: 'O Urso',
  16: 'As Estrelas', 17: 'O Cão', 18: 'A Torre', 19: 'O Lago', 20: 'O Caminho',
  21: 'As Montanhas', 22: 'Os Ratos', 23: 'O Coração', 24: 'O Anel', 25: 'O Livro',
  26: 'A Carta', 27: 'O Cavalheiro', 28: 'A Dama', 29: 'O Lírio', 30: 'O Sol',
  31: 'A Lua', 32: 'A Chave', 33: 'O Peixe', 34: 'O Navio', 35: 'O Âncora', 36: 'A Cruz',
};

/**
 * House names for Mesa Real
 */
const CASA_NOME_MAP: Record<number, string> = {
  1: 'O Mensageiro', 2: 'A Cruz', 3: 'O Navio', 4: 'A Casa', 5: 'A Árvore',
  6: 'A Serpente', 7: 'O Caixão', 8: 'O Buquê', 9: 'A Foice', 10: 'O Machado',
  11: 'A Rede', 12: 'Os Pássaros', 13: 'O Menino', 14: 'A Raposa', 15: 'O Urso',
  16: 'As Estrelas', 17: 'O Cão', 18: 'A Torre', 19: 'O Lago', 20: 'O Caminho',
  21: 'As Montanhas', 22: 'Os Ratos', 23: 'O Coração', 24: 'O Anel', 25: 'O Livro',
  26: 'A Carta', 27: 'O Cavalheiro', 28: 'A Dama', 29: 'O Lírio', 30: 'O Sol',
  31: 'A Lua', 32: 'A Chave', 33: 'O Peixe', 34: 'O Navio', 35: 'O Âncora', 36: 'A Cruz',
};

/**
 * House traditional meanings
 */
const CASA_SIGNIFICADO_MAP: Record<number, string> = {
  1: 'Início, mensagem, comunicação, movimento',
  2: 'Decisão, escolha,十字路口, ponto de virada',
  3: 'Viagem, jornada, aventura, expansão',
  4: 'Lar, família, raízes, fundação',
  5: 'Crescimento, saúde, família, ancestors',
  6: 'Transformação, sabedoria oculta, sedução',
  7: 'Fim, renovação, morte simbólica, transformação',
  8: 'Amor, romance, beleza, celebración',
  9: 'Corte, separação, decisão difícil, conflito',
  10: 'Trabalho, esforço, progresso, realizações',
  11: 'Emprego, rede de contatos, comunidade',
  12: 'Novas perspectivas, ideias, pássaros de pensamento',
  13: 'Inocência, novas começos, proyectos jóvenes',
  14: 'Astúcia, estratégia,ooking beyond the surface',
  15: 'Força, proteção, abundancia, poder pessoal',
  16: 'Esperança, brilho, inspiración, desejos',
  17: 'Lealdade, amizade, companheirismo',
  18: 'Ambição, elevação, objetivos elevados, torre',
  19: 'Meditação, reflexão, sabedoria interior',
  20: 'Jornada, caminho, dirección, propósito',
  21: 'Desafios, obstáculos, superação de barreiras',
  22: 'Perda, mudanças, pequenas preocupações',
  23: 'Amor, emoções, conexões profundas',
  24: 'Compromisso, union, contratos, relacionamentos',
  25: 'Conhecimento, sabedoria, educação, segredos',
  26: 'Notícias, mensajes, comunicação, correspondência',
  27: 'Ação, movimento, encontro, visita',
  28: 'Mulher,合作伙伴, energia receptiva',
  29: 'Pureza, paz, harmonia, beleza natural',
  30: 'Sucesso, alegria, vitalidade, orgulho',
  31: 'Intuição, emoções, mundo interior, ciclos',
  32: 'Abertura, possibilidades, successo, revelação',
  33: 'Abundância, prosperidade, fluxo financeiro',
  34: 'Viagem aquática, cruzada, exploração',
  35: 'Esperança, estabilidade, anchored purpose',
  36: 'Fe, espiritualidade, conclusões, sacrifício',
};

/**
 * Element mapping for houses
 */
const CASA_ELEMENTO_MAP: string[] = [
  'Fogo', 'Água', 'Terra', 'Ar', 'Éter',
  'Fogo', 'Água', 'Terra', 'Ar',
  'Fogo', 'Água', 'Terra', 'Ar', 'Éter',
  'Fogo', 'Água', 'Terra', 'Ar',
  'Fogo', 'Água', 'Terra', 'Ar', 'Éter',
  'Fogo', 'Água', 'Terra', 'Ar',
  'Fogo', 'Água', 'Terra', 'Ar', 'Éter',
];

/**
 * Sephirot mapping for houses
 */
const CASA_SEFIROT_MAP: Record<number, string[]> = {
  1: ['Kether'], 2: ['Chokhmah', 'Binah'], 3: ['Binah'], 4: ['Chesed'],
  5: ['Gevurah'], 6: ['Tipheret'], 7: ['Netzach'], 8: ['Hod'],
  9: ['Yesod'], 10: ['Malkuth'], 11: ['Hod', 'Netzach'], 12: ['Mercurio', 'Hod'],
  13: ['Tipheret', 'Malkuth'], 14: ['Gevurah'], 15: ['Chesed'], 16: ['Kether', 'Chokhmah'],
  17: ['Netzach'], 18: ['Malkuth'], 19: ['Binah', 'Yesod'], 20: ['Tipheret'],
  21: ['Gevurah'], 22: ['Hod'], 23: ['Tipheret', 'Netzach'], 24: ['Chesed', 'Gevurah'],
  25: ['Chokhmah'], 26: ['Hod'], 27: ['Chesed'], 28: ['Binah', 'Netzach'],
  29: ['Tipheret'], 30: ['Kether', 'Tipheret'], 31: ['Yesod', 'Binah'], 32: ['Chokhmah', 'Yesod'],
  33: ['Malkuth', 'Yesod'], 34: ['Chesed'], 35: ['Netzach'], 36: ['Malkuth', 'Binah'],
};

// ============================================================
// ARCHITECTURE BUILDER - FOCUSED HELPERS
// ============================================================

/** Client data shape used throughout the architecture builder helpers. */
type ClientData = {
  ascendente?: string;
  caminhoVida?: number;
  numeroAlma?: number;
  oduRegente?: string;
  domDivino?: number;
};

/**
 * Builds terrain injections (client data correlations) for a specific house.
 * Extracts the switch logic that was previously inside the main loop.
 */
export function construirInjeccaoTerreno(
  casaNumero: number,
  clientData: ClientData | undefined
): ArquiteturaDossiê['injeccao_terreno'] {
  if (!clientData) return [];

  switch (casaNumero) {
    case 1: { // O Mensageiro - Ascendente + Número de Alma
      const injecoes: ArquiteturaDossiê['injeccao_terreno'] = [];
      if (clientData.ascendente) {
        injecoes.push({ tipo: 'ascendente', valor: clientData.ascendente, fonte: 'astrologia' });
      }
      if (clientData.numeroAlma) {
        injecoes.push({ tipo: 'numero_alma', valor: clientData.numeroAlma, fonte: 'tantrica' });
      }
      return injecoes;
    }
    case 4: { // A Casa - Fundo do Céu + Número de Motivação
      if (clientData.caminhoVida) {
        return [{ tipo: 'numero_motivacao', valor: clientData.caminhoVida, fonte: 'cabala' }];
      }
      return [];
    }
    case 12: { // Os Pássaros - Mercúrio/Casa 3 + Dom Divino
      if (clientData.domDivino) {
        return [{ tipo: 'dom_divino', valor: clientData.domDivino, fonte: 'tantrica' }];
      }
      return [];
    }
    case 34: { // Os Peixes - Casa 2 (Finanças) + Número de Karma
      if (clientData.caminhoVida) {
        return [{ tipo: 'numero_karma', valor: clientData.caminhoVida, fonte: 'tantrica' }];
      }
      return [];
    }
    default: { // Default: inject caminho vida as numero_alma from numerologia
      if (clientData.caminhoVida) {
        return [{ tipo: 'numero_alma', valor: clientData.caminhoVida, fonte: 'numerologia' }];
      }
      return [];
    }
  }
}

/**
 * Partial architecture item - odu fields are added conditionally.
 */
type PartialArquitetura = Omit<
  ArquiteturaDossiê,
  'odu_numero' | 'odu_nome' | 'odu_significado' | 'odu_conselho' | 'odu_orixa'
>;

/**
 * Builds the base architecture item for one house (no odu fields yet).
 */
export function construirBaseArquitetura(
  carta: TiragemMesaReal['cartas'][number],
  injeccoes: ArquiteturaDossiê['injeccao_terreno']
): PartialArquitetura {
  const casaNumero = carta.casaNumero;
  return {
    casa_numero: casaNumero,
    casa_nome: CASA_NOME_MAP[casaNumero] || `Casa ${casaNumero}`,
    casa_significado: CASA_SIGNIFICADO_MAP[casaNumero] || 'Área de vida',
    carta_numero: carta.cartaNumero,
    carta_nome: CARTA_NOME_MAP[carta.cartaNumero] || `Carta ${carta.cartaNumero}`,
    carta_significado: carta.significado,
    carta_orientacao: carta.orientacao,
    element: CASA_ELEMENTO_MAP[(casaNumero - 1) % CASA_ELEMENTO_MAP.length] || 'Éter',
    sefirot: CASA_SEFIROT_MAP[casaNumero] || ['Malkuth'],
    chakra: ((casaNumero - 1) % 7) + 1,
    injeccao_terreno: injeccoes.length > 0 ? injeccoes : undefined,
  };
}

/**
 * Finds the odu that correlates to a given card position.
 */
export function encontrarOduCorrelacionado(
  carta: TiragemMesaReal['cartas'][number],
  odus: TiragemMesaReal['odus']
): TiragemMesaReal['odus'][number] | undefined {
  return odus?.find(
    o => o.oduNumero === carta.posicao || o.oduNumero === carta.cartaNumero
  );
}

/**
 * Adds odu fields to an architecture item when an odu match is found.
 */
export function adicionarOduAArquitetura<T extends PartialArquitetura>(
  item: T,
  odu: TiragemMesaReal['odus'][number] | undefined
): T & Pick<ArquiteturaDossiê, 'odu_numero' | 'odu_nome' | 'odu_significado' | 'odu_conselho' | 'odu_orixa'> {
  if (!odu) return { ...item } as T & Pick<ArquiteturaDossiê, 'odu_numero' | 'odu_nome' | 'odu_significado' | 'odu_conselho' | 'odu_orixa'>;
  return {
    ...item,
    odu_numero: odu.oduNumero,
    odu_nome: odu.nome,
    odu_significado: odu.significado,
    odu_conselho: odu.conselho,
    odu_orixa: odu.orixa,
  };
}

/**
 * Builds the architecture from matrix data (Mesa Real tiragem)
 */
export function construirArquiteturaDossiê(
  matrixData: TiragemMesaReal,
  clientData?: ClientData
): ArquiteturaDossiê[] {
  const odus = matrixData.odus ?? [];

  const arquitetura: ArquiteturaDossiê[] = [];

  for (const carta of matrixData.cartas) {
    const injeccoes = construirInjeccaoTerreno(carta.casaNumero, clientData);
    const base = construirBaseArquitetura(carta, injeccoes);
    const odu = encontrarOduCorrelacionado(carta, odus);
    const item = adicionarOduAArquitetura(base, odu);
    arquitetura.push(item);
  }

  return arquitetura.sort((a, b) => a.casa_numero - b.casa_numero);
}

// ============================================================
// USER PROMPT BUILDING
// ============================================================

/**
 * Builds the section text for a single casa in the user prompt.
 */
export function construirSecaoPrompt(casa: ArquiteturaDossiê): string {
  const parts: string[] = [];

  parts.push(`### CASA ${casa.casa_numero}: ${casa.casa_nome}`);
  parts.push(`**Terreno (Significado da Casa):** ${casa.casa_significado}`);

  parts.push('\n**Tiragem (Evento):**');
  parts.push(`  + Carta: ${casa.carta_nome} (${casa.carta_numero})`);
  parts.push(`  + Significado: ${casa.carta_significado}`);
  parts.push(`  + Orientação: ${casa.carta_orientacao}`);

  if (casa.odu_numero) {
    parts.push('\n**Odu:**');
    parts.push(`  + Nome: ${casa.odu_nome}`);
    parts.push(`  + Significado: ${casa.odu_significado}`);
    if (casa.odu_conselho) {
      parts.push(`  + Conselho: ${casa.odu_conselho}`);
    }
    if (casa.odu_orixa) {
      parts.push(`  + Orixá: ${casa.odu_orixa}`);
    }
  }

  if (casa.injeccao_terreno && casa.injeccao_terreno.length > 0) {
    parts.push('\n**Injeções Espirituais (Terreno do Cliente):**');
    for (const injecao of casa.injeccao_terreno) {
      parts.push(`  + ${injecao.tipo}: ${injecao.valor} (${injecao.fonte})`);
    }
  }

  if (casa.element || casa.sefirot || casa.chakra) {
    parts.push('\n**Correlações:**');
    if (casa.element) parts.push(`  + Elemento: ${casa.element}`);
    if (casa.sefirot && casa.sefirot.length > 0) parts.push(`  + Sephirot: ${casa.sefirot.join(' > ')}`);
    if (casa.chakra) parts.push(`  + Chakra: ${casa.chakra}`);
  }

  return parts.join('\n');
}

/**
 * Builds the full user prompt for dossier generation
 */
export function gerarPromptDossiê(
  arquitetura: ArquiteturaDossiê[],
  clienteNome: string
): string {
  if (!arquitetura || arquitetura.length === 0) {
    return `## DOSSIÊ ORACULAR - ${clienteNome}

Nenhuma tiragem disponível para análise.`;
  }

  const sections = arquitetura.map(construirSecaoPrompt);

  return `## DOSSIÊ ORACULAR - MESA REAL

**Cliente:** ${clienteNome}
**Data:** ${new Date().toLocaleDateString('pt-BR')}

---

${sections.join('\n\n---\n')}

---

## TAREFA

Gere um relatório completo para todas as casas informadas seguindo o formato JSON especificado no system prompt.

Cada seção deve conter:
  + **casa**: número da casa
  + **titulo**: nome da casa
  + **interpretacao**: análise arquetípica profunda conectando terreno + evento + diretriz
  + **recomendacao**: ação prática sugerida
  + **convergencias**: lista de convergências identificadas (opcional)`;
}

// ============================================================
// RESPONSE PARSING
// ============================================================

export interface DossiêResult {
  [casaNumero: number]: {
    terreno: string;
    evento: string;
    diretriz: string;
    analise: string;
    orientacao: string;
  };
}

export interface DossiêResponse {
  sumario: string;
  secoes: Array<{
    casa: number;
    titulo: string;
    interpretacao: string;
    recomendacao?: string;
    convergencias?: string[];
  }>;
  conselhosGerais: string[];
}

/**
 * Parses LLM response into structured dossier result
 */
export function parsearRespostaDossiê(
  response: string | object
): { parsed: DossiêResult; markdown: string } {
  // If already object, parse it
  if (typeof response === 'object') {
    const parsed = response as Record<string, unknown>;

    // Check if it has the new format
    if ('sumario' in parsed && 'secoes' in parsed) {
      return {
        parsed: {},
        markdown: JSON.stringify(parsed, null, 2),
      };
    }

    // Old format
    return {
      parsed: parsed as unknown as DossiêResult,
      markdown: JSON.stringify(parsed, null, 2),
    };
  }

  // Try to parse as JSON
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        parsed: parsed as DossiêResult,
        markdown: response,
      };
    }
  } catch {
    // Not JSON, continue to text parsing
  }

  // Fallback: return as-is in markdown
  return {
    parsed: {},
    markdown: response,
  };
}

/**
 * Generates markdown from parsed dossier result
 */
function gerarMarkdownDossiê(result: DossiêResult): string {
  const lines: string[] = ['# Dossiê da Mesa Real\n'];

  for (const [casaNumero, analysis] of Object.entries(result)) {
    const num = parseInt(casaNumero.replace('casa', ''), 10);

    lines.push(`## Casa ${num}`);
    lines.push(`**Terreno:** ${analysis.terreno}`);
    lines.push(`**Evento:** ${analysis.evento}`);
    lines.push(`**Diretriz:** ${analysis.diretriz}`);
    lines.push(`**Análise:** ${analysis.analise}`);
    lines.push(`**Orientação:** ${analysis.orientacao}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generates full markdown dossier from raw LLM text
 */
function gerarMarkdownBruto(llmResponse: string): string {
  return `# Dossiê Oracular - Mesa Real

${llmResponse}

---
*Gerado pela IA da Cabala dos Caminhos*`;
}
