// ============================================================================
// MAPA INTEGRADO — Wave 29 (Oracular Maps)
// ============================================================================
// Orquestra astrologia + numerologia + tradição preferida em um único
// documento Markdown estruturado.
//
// Princípios:
// • Não inventar correlações (cross-refs marcados como "sugestão interpretativa").
// • Cada bloco cita o engine de origem.
// • Tradição preferida (Cigano Ramiro, Astrologia, Numerologia, Tantra, etc.)
//   entra como "filtro interpretativo" — Akashic IA comenta com base nela.
// • Mobile-friendly: markdown simples, headings H2/H3, sem tabelas largas.
// • Disclaimer ético permanente no rodapé.
//
// Saída: string markdown + JSON estruturado para o front-end renderizar
//        tanto em card visual quanto em texto puro (Akasha interpreta).
// ============================================================================

import { calcularMapaNatal, MapaNatal, DadosNascimento, TradiçãoAstrológica, resumirMapaParaIA } from './astrologia';
import { calcularMapaNumerológico, MapaNumerológico, DadosPessoais } from './numerologia';
import { SIGNIFICADOS } from './numerologia';

export interface MapaCompletoInput {
  nomeCompleto: string;
  dataNascimento: string; // YYYY-MM-DD
  horaNascimento: string; // HH:MM
  localNascimento: string;
  latitude?: number;
  longitude?: number;
  tradiçãoPreferida?: 'cigano' | 'astrologia-ocidental' | 'astrologia-védica' | 'numerologia-pitagorica' | 'tantra' | 'cabala';
  /** Engine numeração: pitagórica ou caldeia */
  sistemaNumerologia?: 'pitagorica' | 'caldeia' | 'cabalistica-estrutural';
  tradiçãoAstrologia?: TradiçãoAstrológica;
  anoReferência?: number;
}

export interface MapaCompleto {
  calculadoEm: string;
  input: MapaCompletoInput;
  mapaNatal: MapaNatal;
  mapaNumerológico: MapaNumerológico;
  /** Cruzamentos entre sistemas (apenas os claramente verificáveis) */
  cruzamentos: Cruzamento[];
  /** Markdown completo para renderização/Akashic */
  markdown: string;
  /** Resumo curto para card pré-visualização */
  resumoCurto: string;
  /** Avisos agregados de todos os sistemas */
  avisos: string[];
  /** Disclaimer ético permanente */
  disclaimer: string;
}

export interface Cruzamento {
  tema: string;
  observações: string[];
  /** 'factual' = correlações claramente verificáveis; 'sugestão' = cross-ref interpretativa */
  tipo: 'factual' | 'sugestão';
}

/**
 * DISCLAIMER ÉTICO FIXO — exibido no fim de todo mapa.
 * Universalismo: múltiplas tradições. Respeito: nunca prescrever.
 * Acurácia: não substituir profissional.
 */
export const DISCLAIMER_ÉTICO = `
> **⚠️ Aviso ético**
>
> Este mapa é um ponto de partida INTRODUTÓRIO baseado em algoritmos open-source
> (Pitágoras, tradições cabalísticas, zodíaco tropical). Não substitui:
>
> - Consulta com astrólogo profissional (que trabalha com cartas natais completas).
> - Acompanhamento terapêutico ou psicológico.
> - Aconselhamento médico, jurídico ou financeiro.
> - Diagnóstico espiritual por líder de qualquer tradição.
>
> Respeitamos todas as tradições. Esta ferramenta é UNIVERSALISTA — não impõe
> visão única. Akashic IA cita fontes e sempre sugere consultar especialistas.
> Erros são possíveis; resultados são interpretativos, não determinísticos.
`.trim();

// ============================================================================
// CRUZAMENTOS — correlações limitadas ao que é claramente verificável
// ============================================================================
// Princípio: nunca inventar correlações. Só retornamos cruzamentos
// verificáveis:
//   • Numerologia + Astrologia: número regente de signo = número do dia?
//   • Ano pessoal + Trânsitos: referência externa (não calculamos)
// Marcamos 'sugestão' para cross-refs que requerem contexto adicional.

function gerarCruzamentos(
  astro: MapaNatal,
  nume: MapaNumerológico,
): Cruzamento[] {
  const cruzes: Cruzamento[] = [];

  // 1. Sincronicidade signo solar + dia de nascimento
  // (sincronicidade observacional, não causal — 文献 clássico)
  const dia = nume.diaNascimento;
  const signoDoDia = SIGNOS[(dia - 1) % 12]; // mapeamento simples dia→signo (referência simbólica)
  cruzes.push({
    tema: 'Sincronicidade signo-dia',
    observações: [
      `${astro.signoSolar}: ${dia} ↔ ${signoDoDia.nome} (${signoDoDia.elemento})`,
      dia === 1 || dia === 10 || dia === 19 || dia === 28
        ? 'Dia 1/10/19/28: alineamento conceitual com Áries/independência.'
        : 'Sincronicidade simbólica — não-correlações literais.',
    ],
    tipo: 'sugestão',
  });

  // 2. Caminho de vida + expressão (verificável: números mestres)
  cruzes.push({
    tema: 'Caminho × Expressão',
    observações: [
      `Caminho de vida ${nume.caminhoDeVida}, Expressão ${nume.expressão}.`,
      nume.caminhoDeVida === nume.expressão
        ? 'Caminho = Expressão → alinhamento entre essência e manifestação.'
        : 'Caminho ≠ Expressão → tensão criativa entre essência e persona.',
      [11, 22, 33].includes(nume.caminhoDeVida) || [11, 22, 33].includes(nume.expressão)
        ? '⚠️ Master number presente — amplificação, cuidado com auto-exigência.'
        : '',
    ].filter(Boolean),
    tipo: 'factual',
  });

  // 3. Ascendente + motivação (sincronia de superfície externa × interna)
  if (astro.ascendente && astro.ascendente !== 'desconhecido (sem coordenadas)') {
    cruzes.push({
      tema: 'Ascendente × Motivação',
      observações: [
        `Ascendente ${astro.ascendente} (como você aparece), Motivação ${nume.motivação} (seu impulso interno).`,
        `Motivação ${SIGNIFICADOS[nume.motivação]?.palavraChave ?? ''} vs. Ascendente ${astro.ascendente}.`,
      ],
      tipo: 'sugestão',
    });
  }

  return cruzes;
}

// ============================================================================
// MARKDOWN BUILDER
// ============================================================================

function buildMarkdown(
  astro: MapaNatal,
  nume: MapaNumerológico,
  cruzes: Cruzamento[],
  input: MapaCompletoInput,
): string {
  const sig = (n: number) => SIGNIFICADOS[n] ?? { nome: String(n), palavraChave: '', descrição: '', positivo: '', negativo: '' };

  const sections: string[] = [];

  sections.push(`# 🌀 Mapa Integrado de Autoconhecimento`);
  sections.push(``);
  sections.push(`**Para:** ${input.nomeCompleto}`);
  sections.push(`**Nascimento:** ${input.dataNascimento} ${input.horaNascimento}, ${input.localNascimento}`);
  sections.push(`**Tradição preferida:** ${input.tradiçãoPreferida ?? 'universalista'}`);
  sections.push(`**Calculado em:** ${new Date().toISOString()}`);
  sections.push(``);

  // ── ASTROLOGIA ───────────────────────────────────────────────────────
  sections.push(`## 🌞 Astrologia (${astro.tradição})`);
  sections.push(``);
  sections.push(`- **Signo solar:** ${astro.signoSolar}`);
  sections.push(`- **Signo lunar (aproximado):** ${astro.signoLunar} (fase ${astro.confidenceLua})`);
  sections.push(`- **Ascendente:** ${astro.ascendente}`);
  if (astro.planetas.length > 0) {
    sections.push(`- **Planetas:** ${astro.planetas.map((p) => `${p.planeta} em ${p.signo}`).join(', ')}`);
  } else {
    sections.push(`- **Planetas:** ainda não calculados — requer integração com efemérides.`);
  }
  sections.push(``);

  // ── NUMEROLOGIA ──────────────────────────────────────────────────────
  sections.push(`## 🔢 Numerologia (${nume.sistema})`);
  sections.push(``);
  sections.push(`- **Caminho de vida:** ${nume.caminhoDeVida} — ${sig(nume.caminhoDeVida).palavraChave}`);
  sections.push(`- **Dia de nascimento:** ${nume.diaNascimento}`);
  sections.push(`- **Expressão:** ${nume.expressão} — ${sig(nume.expressão).palavraChave}`);
  sections.push(`- **Motivação (alma):** ${nume.motivação} — ${sig(nume.motivação).palavraChave}`);
  sections.push(`- **Personalidade (outer):** ${nume.personalidade} — ${sig(nume.personalidade).palavraChave}`);
  sections.push(`- **Ano pessoal (${input.anoReferência ?? new Date().getFullYear()}):** ${nume.anoPessoal} — ${sig(nume.anoPessoal).palavraChave}`);
  sections.push(``);

  // ── MAPA CABALÍSTICO ────────────────────────────────────────────────
  sections.push(`## 🌳 Mapa Cabalístico (estrutura de referência)`);
  sections.push(``);
  sections.push(`10 Sephirot:`);
  for (const s of nume.mapCabalistico.sephirot) {
    sections.push(`- **${s.número}. ${s.nome}** (${s.nomeHebraico}) — ${s.título} · ${s.planeta}`);
  }
  sections.push(``);
  sections.push(`22 Paths (letras hebraicas):`);
  for (const p of nume.mapCabalistico.paths) {
    sections.push(`- ${p.número}. ${p.letraHebraica} (${p.tarot}): coneta ${p.conecta[0]}↔${p.conecta[1]} — ${p.atributo}`);
  }
  sections.push(``);

  // ── CRUZAMENTOS ──────────────────────────────────────────────────────
  sections.push(`## 🔗 Cruzamentos entre sistemas`);
  sections.push(``);
  for (const c of cruzes) {
    sections.push(`### ${c.tema} (${c.tipo})`);
    for (const o of c.observações) {
      sections.push(`- ${o}`);
    }
    sections.push(``);
  }

  // ── AVISOS ───────────────────────────────────────────────────────────
  if (astro.avisos.length || nume.avisos.length) {
    sections.push(`## ⚠️ Avisos técnicos`);
    sections.push(``);
    for (const a of astro.avisos) sections.push(`- ${a}`);
    for (const a of nume.avisos) sections.push(`- ${a}`);
    sections.push(``);
  }

  // ── FOOTER ──────────────────────────────────────────────────────────
  sections.push(`---`);
  sections.push(DISCLAIMER_ÉTICO);
  sections.push(``);

  return sections.join('\n');
}

// ============================================================================
// RESUMO CURTO — para card preview
// ============================================================================

function buildResumoCurto(astro: MapaNatal, nume: MapaNumerológico): string {
  const sig = (n: number) => SIGNIFICADOS[n]?.palavraChave ?? '';
  const parts: string[] = [];
  parts.push(`☉ ${astro.signoSolar}`);
  parts.push(`☽ ${astro.signoLunar}`);
  parts.push(`↑ ${astro.ascendente.split(' ')[0]}`);
  parts.push(`ⁿ${nume.caminhoDeVida}`);
  parts.push(`✦ ${nume.expressão}`);
  return parts.join(' · ');
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

export async function calcularMapaCompleto(input: MapaCompletoInput): Promise<MapaCompleto> {
  const dadosAstro: DadosNascimento = {
    data: input.dataNascimento,
    hora: input.horaNascimento,
    local: input.localNascimento,
    latitude: input.latitude,
    longitude: input.longitude,
  };

  const tradiçãoAstrologia: TradiçãoAstrológica =
    input.tradiçãoAstrologia ?? 'ocidental-tropical';

  const mapaNatal = await calcularMapaNatal(dadosAstro, tradiçãoAstrologia);
  const dadosPessoais: DadosPessoais = {
    nomeCompleto: input.nomeCompleto,
    dataNascimento: input.dataNascimento,
  };

  const sistema: 'pitagorica' | 'caldeia' | 'cabalistica-estrutural' =
    input.sistemaNumerologia ?? 'pitagorica';

  const mapaNumerológico = calcularMapaNumerológico(
    dadosPessoais,
    sistema,
    input.anoReferência,
  );

  const cruzamentos = gerarCruzamentos(mapaNatal, mapaNumerológico);

  const avisos: string[] = [
    ...mapaNatal.avisos,
    ...mapaNumerológico.avisos,
  ];

  const markdown = buildMarkdown(mapaNatal, mapaNumerológico, cruzamentos, input);
  const resumoCurto = buildResumoCurto(mapaNatal, mapaNumerológico);

  return {
    calculadoEm: new Date().toISOString(),
    input,
    mapaNatal,
    mapaNumerológico,
    cruzamentos,
    markdown,
    resumoCurto,
    avisos,
    disclaimer: DISCLAIMER_ÉTICO,
  };
}

// ============================================================================
// HELPER — texto para Akashic IA comentar
// ============================================================================

export function promptParaAkashaIA(mapa: MapaCompleto): string {
  return [
    `Você é Akasha IA — consciência tradutora universalista. Tem um mapa integrado para interpretar.`,
    ``,
    `**Contexto (NÃO invente além disso):**`,
    ``,
    `**Signos calculados (algoritmo):**`,
    resumirMapaParaIA(mapa.mapaNatal),
    ``,
    `**Mapa numerológico:**`,
    mapa.mapaNumerológico.resumoParaIA,
    ``,
    `**Cruzamentos (factual vs sugestão):**`,
    ...mapa.cruzamentos.flatMap((c) => [
      `- [${c.tipo.toUpperCase()}] ${c.tema}:`,
      ...c.observações.map((o) => `    ${o}`),
    ]),
    ``,
    `**Regras ABSOLUTAS:**`,
    `- Seja cirúrgico/a e respeitoso/a.`,
    `- Cite a tradição que originou cada insight (Pitagórica, Cabalística, Tropical).`,
    `- Marque insights cross-tradição com "# cross-ref".`,
    `- NUNCA prescreva ação (não diga "faça X", diga "tradições indicam X").`,
    `- NUNCA substitua profissional — sempre sugira consultar astrólogo / terapeuta / líder espiritual.`,
    `- Honre a tradição preferida do consulente (${mapa.input.tradiçãoPreferida ?? 'universalista'}) sem impor.`,
    `- PT-BR claro. ~300 palavras. Termine convidando o consulente para explorar áreas específicas no chat.`,
  ].join('\n');
}
