/**
 * Reversed Systems — F-228
 *
 * Cada sistema moderno (Human Design, Gene Keys, Enneagrama, Jyotish,
 * Bazi, Tzolkin, 4 Temperamentos Gregos) foi estudado em
 * `.autonomous/research/synthesis/` (R-001 a R-020). Este módulo
 * destila **o que o Akasha HERDA** de cada um como PRÁTICA APLICÁVEL
 * na UI — não como cópia esotérica, mas como lição destilada.
 *
 * Estrutura: cada sistema vira um `SistemaHerdado` com:
 *   - nome: nome do sistema moderno
 *   - oQueAkashaHerdou: lista de 3-7 princípios destilados
 *   - comoApareceNaUI: como esses princípios viram UX concreta no Akasha
 *   - fonte: caminho para a pesquisa primária
 *
 * Princípio editorial (VISION §3 axioma 4): toda herança cita fonte.
 * Nenhum elemento é reproduzido sem crítica; cada item passa pelo
 * crivo: "isso ENTREGA valor ao usuário ou é fetichismo esotérico?"
 */

export interface SistemaHerdado {
  /** Nome do sistema moderno estudado. */
  nome: string;
  /** 1 linha: o que é o sistema (PT-BR). */
  resumo: string;
  /** 3-7 princípios destilados que o Akasha herda. */
  oQueAkashaHerdou: string[];
  /** Como esses princípios viram UX no Akasha (1-3 exemplos). */
  comoApareceNaUI: string[];
  /** Caminho para a pesquisa primária. */
  fonte: string;
  /** Ano/século de origem (orientação). */
  origem: string;
}

export const SISTEMAS_HERDADOS: SistemaHerdado[] = [
  {
    nome: 'Human Design (Ra Uru Hu, 1987)',
    resumo:
      'Sistema que combina I Ching + Astrologia + Cabala + Sistema de Chakras em um Bodygraph. 9 centros, 36 canais, 64 gates.',
    oQueAkashaHerdou: [
      'Bodygraph como modelo de visualização: 1 diagrama-mãe mostra os 5 Pilares como camadas concêntricas (MandalaChart.tsx).',
      'Type/Strategy/Authority: a ideia de que cada pessoa tem um MODO DE OPERAR único. Akasha integra via Pilar 3 (Tântrica) — os 11 corpos + 4 temperamentos gregos.',
      '64 Gates ↔ 64 Hexagramas I Ching: isomorfismo que valida nossa escolha. Já temos 64 hexagramas curados.',
      'Profile (1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 4/1, 5/1, 5/2, 6/2, 6/3): derivado de duas linhas da Cabala. Akasha pode adicionar Profile como sub-campo do Pilar 1.',
    ],
    comoApareceNaUI: [
      'Mandala visual mostra 5 camadas; clicar em cada Pilar revela o Significado + dados (F-226).',
      'Futuro: 1 view "Bodygraph simples" mostrando onde o usuário tem "canais abertos" (combinações ativas entre os 5 Pilares).',
    ],
    fonte: '.autonomous/research/synthesis/hd-reverse-engineering.md (R-014, 520 linhas)',
    origem: '1987 (sistema de canalização de Ra Uru Hu)',
  },
  {
    nome: 'Gene Keys (Richard Rudd, 2009)',
    resumo:
      'Sistema contemplativo que mapeia os 64 Codons do DNA / 64 Hexagramas I Ching em uma tríade: Shadow → Gift → Siddhi.',
    oQueAkashaHerdou: [
      'Tríade Shadow/Gift/Siddhi: já adotada como Tríade Pilar 2 no Akasha (Sombra/Dom/Graça).',
      'Contemplation como prática: a forma GENE KEY de meditar (sentir o codom, abrir para a dádiva) pode ser uma Prática dos Significados do Pilar.',
      'Sequence of Unfoldment: Sphere → Pearl → Vector → Diamond (4 estágios de despertar de 1 Gene Key). Mapeia para a Escala Temporal D/S/Z/V do Mandato.',
      'Venus Stream (Gene Keys 1-7): sequência amorosa que abre caminho espiritual. Akasha pode oferecer 1 jornada de 7 dias no Oráculo.',
    ],
    comoApareceNaUI: [
      'Mandato do Dia já tem Tríade Sombra/Dom/Graça (Pilar 2 + R-015).',
      'Prática de cada Significado do Pilar é uma micro-contemplação de 3-5 min (F-221/222/226).',
      'Futuro: jornada "7 Chaves" — 1 dia por chave, 7 dias, cada dia foca em 1 Gene Key específico do seu mapa.',
    ],
    fonte: '.autonomous/research/synthesis/gk-reverse-engineering.md (R-015)',
    origem: '2009 (Richard Rudd, baseado em síntese I Ching + Cabala + Astrologia)',
  },
  {
    nome: 'Enneagrama (Ichazo/Naranjo, 1970s)',
    resumo:
      '9 tipos de personalidade derivados de 3 centros (Head, Heart, Gut). Inclui 9 Levels of Development (Riso-Hudson 1977) que dão TEMPO ao sistema.',
    oQueAkashaHerdou: [
      '9 tipos como termômetro de saúde (não rótulo fixo): Akasha usa o conceito em "qual é seu estado HOJE" do Mandato.',
      '9 Levels of Development: ÚNICO sistema com TEMPO. Akasha herda como Escala D/S/Z/V (Dia/Semana/Zodíaco/Vida).',
      'Setas de Integration/Disintegration: para cada tipo, há uma direção de SAÚDE e uma direção de DOENÇA. Mapeia para "Sombra" de cada Significado do Pilar.',
      'Trifix (3 fixações, 1 por centro): mais fiel que 1 tipo fixo. Akasha pode integrar como Pilar 3 — escolha de qual corpo tântrico é o "fixação".',
    ],
    comoApareceNaUI: [
      'Significado do Pilar já tem campo "Sombra" (F-221) — vem do conceito de Disintegration.',
      'Mandato do Dia identifica o Pilar principal do dia (level atual) — herdado de Levels of Development.',
      'Futuro: 1 quiz "qual seu center dominante hoje" (Head/Heart/Gut) como micro-dose no Diário.',
    ],
    fonte: '.autonomous/research/synthesis/enneagram-reverse-engineering.md (R-016)',
    origem: '1970s (Oscar Ichazo + Claudio Naranjo)',
  },
  {
    nome: 'Jyotish Astrologia Védica (R-018)',
    resumo:
      'Astrologia hindu — Dashas (períodos planetários), Nakshatras (27 mansões lunares), Rahu/Ketu (nodos lunares).',
    oQueAkashaHerdou: [
      'Dashas como 3ª camada temporal: além de D/S/Z/V, Akasha pode oferecer 1 "Período Planetário" (Dasha) que colore o Mandato por 1-20 anos.',
      'Nakshatras (27): mais granular que 12 signos. Akasha pode oferecer a Nakshatra da Lua como sub-campo do Pilar 2 (F-211 já pediu Rahu/Ketu).',
      'Rahu/Ketu (nodos): eixo de EVOLUÇÃO KÁRMICA. Akasha usa isso na narrativa "Cicatriz vira Joia" — o que você vem curar.',
    ],
    comoApareceNaUI: [
      'Pilares 2 (Astrologia) já menciona trinity Rahu/Ketu (sombra/dom/graça).',
      'Futuro: adicionar Dasha ativo + Nakshatra da Lua na página Sobre (F-205) e no Diario.',
    ],
    fonte: '.autonomous/research/synthesis/jyotish-reverse-engineering.md (R-018)',
    origem: '3000+ anos (Bhrigu, Parashara)',
  },
  {
    nome: 'Bazi / 4 Pillars (R-020)',
    resumo:
      'Astrologia chinesa — 4 pilares de nascimento (ano, mês, dia, hora) em 60 combinações (Sexagenary cycle).',
    oQueAkashaHerdou: [
      '60 ciclos Sexagenary: já temos 64 hexagramas (I Ching), cobertura similar. Não duplicar.',
      '4 Pillars (ano/mês/dia/hora): validam nossa escolha de usar Data + Hora de Nascimento no Akasha (já é input).',
      '10 Heavenly Stems + 12 Earthly Branches: oferece Day Master (a "essência do dia") que tem paralelos com Life Path do Pilar 1.',
    ],
    comoApareceNaUI: [
      'Pilar 1 (Cabala) já cobre numerologia cabalística de nascimento — equivalente funcional ao Day Master.',
      'Futuro: cross-reference Day Master ↔ Life Path (quando ambos são 11/22/33, ressonância especial).',
    ],
    fonte: '.autonomous/research/synthesis/bazi-reverse-engineering.md (R-020)',
    origem: '2000+ anos (China Tang/Yuan dynasties)',
  },
  {
    nome: 'Tzolkin / Mayan Calendar (R-010)',
    resumo:
      'Calendário maia — 260 kin (20 períodos × 13 números) com 4 portais e 5 famílias terrestres.',
    oQueAkashaHerdou: [
      '260 kin como ciclo coletivo: útil para Murais Akasha (multi-usuário, R-021+).',
      '4 Portais: dias de "portal" (8, 9, 17, 18 kin) — Akasha pode marcar dias especiais no Diario.',
      '5 Famílias Terrestres: 5 energias (Cardinal, Polar, Elétrico, Solar, Espectral) — paralelo aos 4 Temperamentos Gregos (R-019).',
    ],
    comoApareceNaUI: [
      'Futuro: Mural Akasha pode usar ciclo de 260 dias para cadência coletiva.',
      'Futuro: diario marca "dias de portal" com ícone especial.',
    ],
    fonte: '.autonomous/research/synthesis/mayan-reverse-engineering.md (R-010)',
    origem: 'Pré-colombiano (Maia, 250-900 d.C.)',
  },
  {
    nome: '4 Temperamentos Gregos (Hipócrates, 400 a.C.)',
    resumo:
      '4 humores clássicos: Sangüíneo (ar), Colérico (fogo), Melancólico (terra), Fleumático (água). Base de toda tipologia ocidental.',
    oQueAkashaHerdou: [
      '4 tipos como base do Pilar 3 (Tântrica): integrando como `temperamento_atual` no Pilar 3 (já temos no significados-curados F-221).',
      'Princípio da BALANÇA: cada temperamento tem seu excesso (sombra) e sua falta. Mapeia para o campo "Sombra" de cada Significado.',
    ],
    comoApareceNaUI: [
      'Significado Curado do Pilar 3 inclui 4 temperamentos (Sanguíneo/Colérico/Melancólico/Fleumático) — F-221.',
      'Futuro: mini-quiz "qual seu temperamento HOJE" no Diario (1 pergunta, 4 botões).',
    ],
    fonte: '.autonomous/research/synthesis/greek-temperaments.md (R-019)',
    origem: '400 a.C. (Hipócrates, *Sobre a Natureza do Homem*)',
  },
  {
    nome: 'The Pattern (Lisa Donovan, 2014)',
    resumo:
      'App de relacionamento que mapeia 4 "Portals" (Hiding, Wanting, Liking, Loving) baseado em dados natais.',
    oQueAkashaHerdou: [
      'Linguagem íntima e pessoal: o Pattern usa "your Pattern" (seu Pattern), criando intimidade. Akasha usa "seu Mapa".',
      'Sem horóscopo genérico: cada pessoa vê SÓ o seu mapa. Akasha já é assim (autenticação).',
      'Renascimento de informação antiga em UX moderna: aplica ao design visual (Mandala como arte, não tabela).',
    ],
    comoApareceNaUI: [
      'Tom de voz do Diario e do Oráculo: íntimo, pessoal, evita "você deve".',
      'Visual da Mandala como ARTE, não tabela — inspiração direta do Pattern.',
    ],
    fonte: 'RQ-006 (Pattern), R-007 (CHANI)',
    origem: '2014 (Lisa Donovan, baseado em Lynn Bell + Stephen Arroyo)',
  },
  {
    nome: 'CHANI App (Chani Nicholas, 2019)',
    resumo:
      'App de astrologia + ritual com 44 funcionários, $14M receita/ano. Whole Sign Hellenistic astrology, sem IA (100% humano curado).',
    oQueAkashaHerdou: [
      'Bundle semanal: leitura + ritual + journal + meditação + altar. Akasha tem Mandato (3 frases) + Pergunta + Ritual — falta journal e meditação.',
      '5% da receita → FreeFrom (causa social): Akasha adota (Earmark 5% × 5 Pilares = 25% até Ano 5, R-022b §3.3).',
      'Transits como soft paywall: Akasha pode usar Pilar 5 (I Ching diário) + Pilar 2 (transits lunares) como cadência gratuita e Pilar 4 (Odu) como premium.',
      'Zero-AI policy: NO Akasha NÃO — adotamos IA + curadoria humana (RAG), 10% do custo vs CHANI 100% humano.',
    ],
    comoApareceNaUI: [
      'Cadência 1/dia (Mandato) + 1/semana (Bundle semanal a implementar) + 1/mês (lunar)',
      '5% earmark visível no footer (já tem em VISION.md).',
      'Premium gating: Pilar 4 (Odu) + Mapa Visual detalhado (F-203) podem ser premium.',
    ],
    fonte: 'RQ-007 (CHANI), R-022b (Ethics Charter)',
    origem: '2019 (Chani Nicholas, app 2020)',
  },
];

/** Devolve resumo curto (1 linha) de todos os sistemas — para cards na página Sobre. */
export function resumoSistemasHerdados(): Array<{ nome: string; resumo: string }> {
  return SISTEMAS_HERDADOS.map((s) => ({ nome: s.nome, resumo: s.resumo }));
}
