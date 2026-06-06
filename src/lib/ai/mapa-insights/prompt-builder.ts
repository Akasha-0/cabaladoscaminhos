/**
 * Prompt Builder for Mapa Insights AI Generation
 * @module ai/mapa-insights/prompt-builder
 */

import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';
import type { InsightData } from './types';
import type { PosicaoPlaneta } from '@akasha/core-astrology';

// ============================================================
// SYSTEM PROMPT
// ============================================================

/**
 * Returns the system prompt for the Mapa Insights spiritual guide.
 * Integrates Cabala, Candomblé, Umbanda, Ifá, Numerology, Tarot, and Astrology.
 */
export function gerarSystemPrompt(): string {
  return `Você é um guia espiritual profundo na tradição da Cabala dos Caminhos.
Integre: Cabala Judaica, Candomblé, Umbanda, Ifá, Numerologia Pitagórica/Cabalística, Tarot e Astrologia.
Sua missão é transformar o mapa astral/espiritual do usuário em insights poéticos e acessíveis.
NUNCA use jargão ocultista — traduza para linguagem humana simples.
Sempre cite as convergências (tríplice > dual > simples) quando identificá-las.
Respeite as quizilas e preceitos dos Odús — eles são regras reais com impacto na vida.
Integre as tabelas de correspondências do IDEIA.md (Sephirot, Orixás, Chakras, Dias).

IDIOMA: Responda SEMPRE em português brasileiro, culturalmente apropriado e poético.`;
}

// ============================================================
// CONTEXT BUILDING
// ============================================================
/**
 * Builds a structured user context from MapaAlmaCompleto for AI prompts.
 * Extracts all relevant spiritual data into human-readable format.
 */

export function gerarContextoUsuario(mapa: MapaAlmaCompleto): string {
  const parts: string[] = [];

  // ─── Section Builders ────────────────────────────────────────────────────────
  function buildPerfilSection(mapa: MapaAlmaCompleto): string {
    const p = mapa.perfil;
    return `## PERFIL DO USUÁRIO
**Nome:** ${p.nomeCompleto}
**Data de Nascimento:** ${p.dataNascimento}${p.hora ? ` às ${p.hora}` : ''}
**Cidade:** ${p.cidade}, ${p.estado}, ${p.pais}`;
  }

  function buildNumerologiaSection(num: MapaAlmaCompleto['numerologia']): string {
    return `## NUMEROLOGIA
**Caminho de Vida:** ${num.lifePath}
**Expressão:** ${num.expressao}
**Motivação (Desejo de Alma):** ${num.motivacao}
**Impressão (Opostos):** ${num.impressao}
**Destino (Lição de Vida):** ${num.destino}
**Ciclo Atual:** ${num.cicloAtual}
**Ano Pessoal:** ${num.anoPessoal}
**Método:** ${num.metodoUsado}`;
  }

  function buildOduSection(odu: MapaAlmaCompleto['odu']): string {
    const regente = odu.regente;
    const lines: string[] = [
      `## ODÚ (IFÁ)`,
      `**Odú Regente:** ${regente.nome} (${regente.numero})`,
      `**Significado:** ${regente.significado}`,
      `**Orixá Regente:** ${'orixaRegente' in regente ? regente.orixaRegente : 'N/A'}`,
      `**Elemento:** ${'elementos' in regente ? regente.elementos : 'N/A'}`,
      `**Caminho Sephirah:** ${odu.caminhoSephirah}`,
    ];
    if (odu.secundario) {
      lines.push(
        `**Odú Secundário:** ${odu.secundario.nome} (${odu.secundario.numero})`,
        `**Significado:** ${odu.secundario.significado}`
      );
    }
    if (odu.orixas.length > 0) lines.push(`**Orixás Ligados:** ${odu.orixas.join(', ')}`);
    if (odu.quizilas.length > 0) lines.push(`**Quizilas:** ${odu.quizilas.join(', ')}`);
    if (odu.preceitos.length > 0) lines.push(`**Preceitos:** ${odu.preceitos.join(' | ')}`);
    if (odu.ebos.length > 0) lines.push(`**Ebós Sugeridos:** ${odu.ebos.join(', ')}`);
    return lines.join('\n');
  }

  function fmtPlaneta(nome: string, pos: PosicaoPlaneta): string {
    return `**${nome}:** ${pos.signo}${pos.grauNoSigno !== undefined ? ` (${pos.grauNoSigno}°)` : ''}`;
  }

  function buildAstrologiaSection(astro: MapaAlmaCompleto['astrologia']): string {
    return `## ASTROLOGIA
**Ascendente:** ${astro.ascendente}
${fmtPlaneta('Sol', astro.sol)}
${fmtPlaneta('Lua', astro.lua)}
${fmtPlaneta('Mercúrio', astro.mercurio)}
${fmtPlaneta('Vênus', astro.venus)}
${fmtPlaneta('Marte', astro.marte)}
${fmtPlaneta('Júpiter', astro.jupiter)}
${fmtPlaneta('Saturno', astro.saturno)}
${fmtPlaneta('Urano', astro.urano)}
${fmtPlaneta('Netuno', astro.netuno)}
${fmtPlaneta('Plutão', astro.plutao)}`;
  }

  function buildTarotSection(tarot: MapaAlmaCompleto['tarot']): string {
    const adicional = tarot.cartasAdicionais && tarot.cartasAdicionais.length > 0
      ? `\n**Cartas Adicionais:** ${tarot.cartasAdicionais.map(c => c.name).join(', ')}`
      : '';
    return `## TAROT
**Carta de Nascimento (Arcano ${tarot.cartaNascimento}):** ${tarot.interpretacao.name}
**Carta do Ano Pessoal (Arcano ${tarot.cartaAnoPessoal}):** ${tarot.cartaAlma}${adicional}`;
  }

  function buildChakrasSection(chakras: MapaAlmaCompleto['chakras']): string {
    const lines = chakras.chakras.map(
      c => `  - ${c.nome} (#${c.numero}): ${c.estado} (intensidade ${c.intensidade})${c.cor ? ` | cor: ${c.cor}` : ''}`
    );
    return [
      `## CHAKRAS`,
      `**Dominante:** ${chakras.dominante}`,
      `**Bloqueado:** ${chakras.bloqueado}`,
      `**Equilíbrio:** ${chakras.equilibrio}%`,
      ...lines,
    ].join('\n');
  }

  function buildConvergenciasSection(convergencias: MapaAlmaCompleto['convergencias']): string {
    const convLines = convergencias.map(c => {
      const prefix = c.forca === 'forte' ? '🔴' : c.forca === 'medio' ? '🟡' : '⚪';
      return `  ${prefix} [${c.forca.toUpperCase()}] ${c.sistemas.join(' + ')}: ${c.descricao} (${c.energia})`;
    });
    return `## CONVERGÊNCIAS DETECTADAS\n${convLines.join('\n')}`;
  }

  // ── Perfil ──────────────────────────────────────────────────
  parts.push(buildPerfilSection(mapa));
  // ── Numerologia ─────────────────────────────────────────────
  parts.push(buildNumerologiaSection(mapa.numerologia));
  // ── Odú ─────────────────────────────────────────────────────
  parts.push(buildOduSection(mapa.odu));
  // ── Astrologia ──────────────────────────────────────────────
  parts.push(buildAstrologiaSection(mapa.astrologia));
  // ── Tarot ───────────────────────────────────────────────────
  parts.push(buildTarotSection(mapa.tarot));
  // ── Chakras ────────────────────────────────────────────────
  parts.push(buildChakrasSection(mapa.chakras));
  // ── Orixás Dominantes ───────────────────────────────────────
  if (mapa.orixasDominantes.length > 0) {
    parts.push(`## ORIXÁS DOMINANTES\n${mapa.orixasDominantes.join(', ')}`);
  }
  // ── Convergências ───────────────────────────────────────────
  if ((mapa.convergencias ?? []).length > 0) {
    parts.push(buildConvergenciasSection(mapa.convergencias));
  }

  return parts.join('\n\n');
}

// ============================================================
// INSIGHT PROMPT
// ============================================================

/**
 * Builds the full user prompt for generating Mapa Insights.
 * Includes structured context and response format guidance.
 */
export function gerarPromptInsight(
  mapa: MapaAlmaCompleto,
  contexto?: string
): string {
  const mapaContext = gerarContextoUsuario(mapa);

  const convergenciasPrioridade = buildConvergenciaGuidance(mapa.convergencias);

  return `${mapaContext}

${contexto ? `---

## CONTEXTO ADICIONAL DO USUÁRIO
${contexto}

---` : ''}

${convergenciasPrioridade}

---

## SUA MISSÃO

Gere insights POÉTICOS e PROFUNDOS para cada seção abaixo. Para CADA insight, cite QUAIS sistemas contribuíram (ex: "Pela Numerologia e pelo Odú...").

### SEÇÕES OBRIGATÓRIAS (responda em português brasileiro):

1. **Título Geral** — Um título poético que encapsule a essência do mapa espiritual do usuário (máximo 10 palavras)

2. **Overview** — Parágrafo breve conectando os sistemas principais em uma narrativa coerente (3-4 frases)

3. **POI Coração (Alma)** — O que move a alma深处. Tema + descrição poética + sistemas. Inclua uma AFFIRMAÇÃO de cura/fortalecimento.

4. **POA Mente (Pensamentos)** — Padrões mentais e lições cármicas. Tema + descrição + sistemas. Inclua uma AFIRMAÇÃO de clareza.

5. **Corpo Sagrado** — Energia física, chakras, rituais, cores, ervas. Tema + descrição + sistemas + RITUAL sugerido + 3 CORES + 2-3 ERVAS. Respeite as quizilas do Odú.

6. **Caminho de Destino** — Missão de vida, Orixás protetores. Tema + descrição + sistemas + ORIXÁS PROTETORES. Se o Odú indicar quizilas, mencione-as com respeito.

7. **Retorno e Lições** — Lições cármicas a aprender. Tema + descrição + sistemas + AFIRMAÇÃO de aprendizado.

8. **Convergências Destacadas** — Liste as convergências TRÍPLICES primeiro, depois DUPLAIS, depois SIMPLES. Para cada uma, explique a energia combinada.

---

## REGRAS CRÍTICAS

- NUNCA use jargão ocultista; traduza para linguagem simples e poética
- Para cada insight, cite explicitamente quais sistemas contribuíram
- Se o Odú tem quizilas ou preceitos, mencione-os com reverência e aplicação prática
- Respeite a integração: mostre como OSÁLÁ se manifesta no mapa
- Priorize convergências TRÍPLICES sobre DUPLAIS sobre SIMPLES
- Responda APENAS com JSON válido, sem texto antes ou depois

## FORMATO DE RESPOSTA (JSON EXATO):

\`\`\`json
${JSON.stringify(getInsightSchema(), null, 2)}
\`\`\``;
}

/**
 * Builds guidance text for convergence prioritization.
 */
function buildConvergenciaGuidance(convergencias: MapaAlmaCompleto['convergencias']): string {
  if (convergencias.length === 0) {
    return '## CONVERGÊNCIAS\nNenhuma convergência forte detectada. Gere insights únicos para cada sistema.';
  }

  const triplices = convergencias.filter(c => c.sistemas.length >= 3);
  const duplas = convergencias.filter(c => c.sistemas.length === 2);
  const simples = convergencias.filter(c => c.sistemas.length === 1);

  const lines: string[] = ['## PRIORIDADE DE CONVERGÊNCIAS'];

  if (triplices.length > 0) {
    lines.push('### 🔴 CONVERGÊNCIAS TRÍPLICES (MAIS PODEROSAS)');
    triplices.forEach((c, i) => {
      lines.push(`${i + 1}. **${c.sistemas.join(' + ')}** — ${c.energia}: ${c.descricao}`);
    });
  }

  if (duplas.length > 0) {
    lines.push('\n### 🟡 CONVERGÊNCIAS DUAIS');
    duplas.forEach((c, i) => {
      lines.push(`${i + 1}. **${c.sistemas.join(' + ')}** — ${c.energia}: ${c.descricao}`);
    });
  }

  if (simples.length > 0) {
    lines.push('\n### ⚪ CONVERGÊNCIAS SIMPLES');
    simples.forEach((c, i) => {
      lines.push(`${i + 1}. **${c.sistemas.join(' + ')}** — ${c.energia}: ${c.descricao}`);
    });
  }

  return lines.join('\n');
}

/**
 * Returns the TypeScript interface shape for InsightData (for JSON schema documentation).
 * This mirrors the InsightData type from types.ts.
 */
function getInsightSchema(): Record<string, unknown> {
  return {
    titulo: 'string (máximo 10 palavras)',
    subtitulo: 'string (opcional)',
    overview: 'string (3-4 frases conectando os sistemas)',
    coração: {
      tema: 'string',
      descricao: 'string (poética, cite sistemas)',
      sistemas: ['string'],
      affirmation: 'string (opcional)',
    },
    mente: {
      tema: 'string',
      descricao: 'string (poética, cite sistemas)',
      sistemas: ['string'],
      affirmation: 'string (opcional)',
    },
    corpo: {
      tema: 'string',
      descricao: 'string (poética, cite sistemas)',
      sistemas: ['string'],
      affirmation: 'string (opcional)',
      ritual: 'string (opcional, respeite quizilas)',
      cores: ['string (opcional)'],
      ervas: ['string (opcional)'],
    },
    caminho: {
      tema: 'string',
      descricao: 'string (poética, cite sistemas)',
      sistemas: ['string'],
      affirmation: 'string (opcional)',
      orixasProtegentes: ['string (opcional)'],
    },
    retorno: {
      tema: 'string',
      descricao: 'string (poética, cite sistemas)',
      sistemas: ['string'],
      affirmation: 'string (opcional)',
    },
    convergencias: {
      triplices: [{
        sistemas: ['string'],
        energia: 'string',
        forca: 'forte',
        descricao: 'string',
      }],
      duplas: [{
        sistemas: ['string'],
        energia: 'string',
        forca: 'medio',
        descricao: 'string',
      }],
    },
    orixasProtegentes: ['string (opcional)'],
    sephirotAlinhadas: ['string (opcional)'],
    cicloAtual: 'string (opcional)',
    temaGeral: 'string (opcional)',
  };
}

// ============================================================
// CONVERGENCE SUMMARY
// ============================================================

/**
 * Generates a formatted summary block of detected convergences.
 * Highlights tríplice convergences as most powerful.
 */
function gerarSumarioConvergencias(convergencias: MapaAlmaCompleto['convergencias']): string {
  if (convergencias.length === 0) {
    return `## Convergências Espirituais

Nenhuma convergência forte foi detectada entre os sistemas.
Cada tradição opera de forma independente neste mapa.`;
  }

  const triplices = convergencias.filter(c => c.sistemas.length >= 3);
  const duplas = convergencias.filter(c => c.sistemas.length === 2);
  const simples = convergencias.filter(c => c.sistemas.length === 1);

  const lines: string[] = ['## Convergências Espirituais Detectadas'];

  if (triplices.length > 0) {
    lines.push('');
    lines.push('### 🔴 Convergências Tríplices — PODER MÁXIMO');
    lines.push('');
    triplices.forEach(c => {
      lines.push(`**${c.sistemas.join(' ✦ ')}**`);
      lines.push(`  Energia: ${c.energia} | Força: ${c.forca}`);
      lines.push(`  ${c.descricao}`);
      lines.push('');
    });
  }

  if (duplas.length > 0) {
    lines.push('### 🟡 Convergências Duplas — ENERGIA AMPLIADA');
    lines.push('');
    duplas.forEach(c => {
      lines.push(`**${c.sistemas.join(' ✦ ')}**`);
      lines.push(`  Energia: ${c.energia} | Força: ${c.forca}`);
      lines.push(`  ${c.descricao}`);
      lines.push('');
    });
  }

  if (simples.length > 0) {
    lines.push('### ⚪ Convergências Simples — FOCO ISOLADO');
    lines.push('');
    simples.forEach(c => {
      lines.push(`**${c.sistemas.join(' ✦ ')}**`);
      lines.push(`  Energia: ${c.energia} | Força: ${c.forca}`);
      lines.push(`  ${c.descricao}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}
