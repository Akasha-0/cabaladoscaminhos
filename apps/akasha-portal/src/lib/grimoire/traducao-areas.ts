/**
 * Tradução Pilar → Áreas da Vida — F-229
 *
 * Gap crítico: o Significado do Pilar (F-221) fala de "missão, sombra, prática"
 * em linguagem simbólica (Life Path 11, Sol em Escorpião, Corpo 7). Mas o
 * USUÁRIO FINAL vive em ÁREAS DA VIDA: paz, saúde, relações, dinheiro,
 * trabalho, propósito, criatividade, espiritualidade. O Significado sem
 * tradução para essas áreas não ENTREGA valor real.
 *
 * Esta camada fecha esse gap. Para cada combinação Pilar × Área, há uma
 * tradução curta (1-2 frases) que diz, em linguagem direta, o que o Pilar
 * PEDE à pessoa naquela área HOJE.
 *
 * Estrutura: matriz 5 Pilares × 8 Áreas = 40 entradas curadas.
 * Cada entrada é `frase` (1-2 frases diretas) + `fonte` (que Pilar usa).
 *
 * Princípios:
 *   - Linguagem APLICÁVEL, não esotérica
 *   - 2ª pessoa ("você", "hoje")
 *   - 1 ação prática embutida sempre que possível
 *   - Sem jargão técnico (Cabala, Sefirot, Odu, Hexagrama) sem tradução
 *
 * Pilar 4 (Odu) carrega `requer_terreiro: true` em todas as áreas, por
 * respeito a R-022 §4.4 — o Significado real vem do terreiro, não do app.
 */

import type { Pilar } from './significados-curados';

export type Area =
  | 'paz'
  | 'saude'
  | 'relacoes'
  | 'dinheiro'
  | 'trabalho'
  | 'proposito'
  | 'criatividade'
  | 'espiritualidade'
  | 'sexualidade';

export const AREAS: Area[] = [
  'paz',
  'saude',
  'relacoes',
  'dinheiro',
  'trabalho',
  'proposito',
  'criatividade',
  'espiritualidade',
  'sexualidade',
];

export const AREA_LABEL: Record<Area, string> = {
  paz: 'Paz',
  saude: 'Saúde',
  relacoes: 'Relações',
  dinheiro: 'Dinheiro',
  trabalho: 'Trabalho',
  proposito: 'Propósito',
  criatividade: 'Criatividade',
  espiritualidade: 'Espiritualidade',
  sexualidade: 'Sexualidade',
};

export const AREA_ICONE: Record<Area, string> = {
  paz: '☮',
  saude: '♥',
  relacoes: '◉',
  dinheiro: '◆',
  trabalho: '⚒',
  proposito: '✶',
  criatividade: '✎',
  espiritualidade: '✦',
  sexualidade: '⟁',
};

export interface TraducaoArea {
  pilar: Pilar;
  area: Area;
  /** Frase direta de COMO o Pilar fala dessa área (1-2 frases, 2ª pessoa). */
  frase: string;
  /** De onde vem (Pilar + sistema fonte). */
  fonte: string;
  /** Apenas Pilar 4 (Odu) — R-022 §4.4. */
  requer_terreiro?: boolean;
}
// ─── Conteúdo Detalhado por Pilar × Área (F-232) ────────────────────────────

/**
 * Conteúdo profundo por Pilar × Área — estrutura de 8 párrafos:
 *  P1: Explicação central — o que este Pilar PEDE nesta área
 *  P2: Convergência — quando pilares concordam
 *  P3: Tensão — quando pilares pedem coisas diferentes
 *  P4: O que evitar
 *  P5: Prática concreta com timing
 *
 * Fallback: se não existir, usar TraducaoArea.frase (conteúdo de 1-2 frases).
 */
export interface TraducaoAreaDetalhada {
  pilar: Pilar;
  area: Area;
  /** Frase curta (backward compat — ementa) */
  frase: string;
  /** P1: Explicação central — 5-8 frases sobre o que o Pilar PEDE nesta área */
  explicacao: string;
  /** P2: Convergência — 3-5 frases sobre quando pilares concordam */
  convergencia: string;
  /** P3: Tensão — 3-5 frases sobre quando pilares CONFLITAM */
  tensao: string;
  /** P4: O que evitar — 2-3 frases, específico */
  evitar: string;
  /** P5: Prática concreta — 1-2 frases com timing específico */
  pratica: string;
  fonte: string;
  requer_terreiro?: boolean;
}
const CABALA: TraducaoArea[] = [
  { pilar: 'cabala', area: 'paz',
    frase: 'Sua paz interior vem de alinhar vida externa com número interno. Quando você age CONTRA o seu número, a inquietação aparece. Quando você age A PARTIR dele, há silêncio — mesmo no caos.',
    fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 4' },
  { pilar: 'cabala', area: 'saude',
    frase: 'O seu número aponta onde sua energia VAI naturalmente. Respeite-o: se o seu número pede introspecção, parar 1 hora sozinho é saúde, não fuga. Corpo sadio = corpo coerente com a missão.',
    fonte: 'Mispar Hechrachi' },
  { pilar: 'cabala', area: 'relacoes',
    frase: 'Atraia quem vibra no seu número, não quem completa o que falta. Você não precisa ser "metade" — você é inteiro, com geometria própria. Quem reconhece isso fica; quem não, vai sem culpa.',
    fonte: 'Cabala Luriânica 1570 (Tikkun: atrai sua tikun, não seu complemento)' },
  { pilar: 'cabala', area: 'dinheiro',
    frase: 'Dinheiro segue missão, não o contrário. Recuse hoje 1 proposta que paga bem mas te afasta do seu número. A abundância vem quando VOCÊ está alinhado — e o dinheiro reconhece.',
    fonte: 'Proverbios 3:9-10; Mispar Hechrachi (Mestre 8)' },
  { pilar: 'cabala', area: 'trabalho',
    frase: 'Seu trabalho ideal NÃO é compatível com qualquer um. É compatível com o seu número. Se você está em trabalho que cabe em QUALQUER pessoa, fuja. Busque o que só VOCÊ pode fazer.',
    fonte: 'Mispar Hechrachi' },
  { pilar: 'cabala', area: 'proposito',
    frase: 'O número do seu nascimento é o resumo do seu contrato de vida. Re-leia-o hoje: ele diz em 1 linha o que você veio fazer. Você não precisa descobrir — só lembrar.',
    fonte: 'Sefer Yetzirah 4:1-3' },
  { pilar: 'cabala', area: 'criatividade',
    frase: 'Crie HOJE a partir do seu número, não da moda. Sua voz criativa tem geometria própria — quem copiar o estilo do vizinho vai soar falso. Ouse ser estranho no seu.',
    fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 1' },
  { pilar: 'cabala', area: 'espiritualidade',
    frase: 'Prática espiritual = 1 ato por dia coerente com seu número. Não é técnica universal — é a SUA oração. Meditação, oração, ritual, silêncio: o que ressoa com seu número?',
    fonte: 'Sefer Yetzirah; Cabala prática contemporânea' },
  { pilar: 'cabala', area: 'sexualidade',
    frase: 'Números Mestres (11, 22, 33) carregam energia sexual/espiritual amplificada. O 11 é o Canal — sexualidade vista como portal, fusão de corpos e visões. Você não quer só prazer: quer SIGNIFICADO. Recuse sexo que esvazia; busque o que ilumina.',
    fonte: 'Mispar Hechrachi; numerologia mestre (Pinnock 2010); Zohar Bereshit 49b' },
];

// ─── Pilar 2 · Astrologia · céu do nascimento ──────────────────────────────

const ASTROLOGIA: TraducaoArea[] = [
  { pilar: 'astrologia', area: 'paz',
    frase: 'Paz interior vem de alinhar com o trânsito do dia, não de fugir dele. Quando o céu pede recolhimento e você sai festejando, a inquietação sobe. Olhe o céu HOJE e aja a partir dele.',
    fonte: 'Brennan, Hellenistic Astrology (2017); CHANI App RQ-007' },
  { pilar: 'astrologia', area: 'saude',
    frase: 'Seu signo mostra onde sua energia VAI. Áries vai pra ação; Touro vai pro corpo; Gêmeos pra comunicação. Honre seu signo — corpo sadio = corpo na sua natureza, não na do coach.',
    fonte: 'Brennan 2017; trad. PT-BR Raffaelli' },
  { pilar: 'astrologia', area: 'relacoes',
    frase: 'Atraia pelo Sol: você ama a partir dele, não do ascendente social. O outro precisa ver seu SOL — não sua máscara. Quem só responde à sua persona vai embora quando a persona cansa.',
    fonte: 'Brennan 2017, cap. 8 (Sol como identidade essencial)' },
  { pilar: 'astrologia', area: 'dinheiro',
    frase: 'Transits de Júpiter e Saturno são os grandes moduladores financeiros. Quando Júpiter transita seu Sol, expanda. Quando Saturno retorna, contraia e estruture. O céu te avisa 6 meses antes.',
    fonte: 'Brennan 2017; Saturn Return como rito de passagem' },
  { pilar: 'astrologia', area: 'trabalho',
    frase: 'O Meio do Céu (MC) é sua carreira pública; o Ascendente é como você se mostra; o Sol é quem você é. Trabalho bom alinha os 3 — não sacrifica nenhum.',
    fonte: 'Brennan 2017, cap. 6 (Ângulos: ASC/MC/IC/DSC)' },
  { pilar: 'astrologia', area: 'proposito',
    frase: 'O Nodo Norte (Júpiter evoluído) é a direção da alma. A direção do Nodo Sul (que você já conhece) é onde você fica preso. A vida pede: vá do Sul pro Norte, mesmo com medo.',
    fonte: 'Brennan 2017; Jyotish R-018' },
  { pilar: 'astrologia', area: 'espiritualidade',
    frase: 'A prática espiritual muda com o trânsito lunar. Lua Nova = plantar; Crescente = agir; Cheia = colher e soltar; Minguante = descansar. Não force a fase errada. O céu te guia.',
    fonte: 'Brennan 2017, cap. 14 (Fases Lunares)' },
  { pilar: 'astrologia', area: 'sexualidade',
    frase: 'Sua sexualidade é descrita por 3 marcadores: Sol (quem você é na cama), Lilith (o que te excita em segredo), Casa 8 (o que transforma sua intimidade). Sol + Lilith no mesmo signo = intensidade dobrada — você não é meio termo. Casa 8 no signo X = a forma como você DESEJA, e o que te faz perder o controle.',
    fonte: 'Brennan 2017, cap. 7-8 (Casas + planetas); Cafe Astrology (Lilith)' },
];

const TANTRICA: TraducaoArea[] = [
  { pilar: 'tantrica', area: 'paz',
    frase: 'Você tem 11 corpos, mas costuma viver em 1 ou 2. Paz vem de EXPANDIR para os outros: ouça o corpo 9 (intuição), sinta o 7 (aura), respire o 8 (prana). Quanto mais corpos ativos, mais presença.',
    fonte: 'Yogi Bhajan, Aquarian Teacher (KRI 2007); 10 corpos + Mente Divina' },
  { pilar: 'tantrica', area: 'saude',
    frase: 'O corpo 5 (físico) é o templo, mas o 8 (prana) é a energia que o anima. Saúde = respirar fundo 3x hoje. O corpo sutil, quando bem alimentado, sustenta o físico.',
    fonte: 'KRI 2007; Taittiriya Upanishad (pancha kosha)' },
  { pilar: 'tantrica', area: 'relacoes',
    frase: 'Você se relaciona a partir de UM corpo predominante. Astral (emoção) tende à fusão; Mental (cabeça) à distância; Físico (corpo) à presença. Reconheça o seu e avise o outro — quem ama de verdade, ajusta.',
    fonte: 'KRI 2007; trigêmeo físico/astral/mental' },
  { pilar: 'tantrica', area: 'dinheiro',
    frase: 'O corpo 8 (prana) sustenta sua vitalidade E sua capacidade de gerar. Dinheiro é troca de energia vital. Cuide do seu prana: sono, respiração, alimentação. A conta vem junto.',
    fonte: 'KRI 2007; Ayurveda como base' },
  { pilar: 'tantrica', area: 'trabalho',
    frase: 'Seu corpo 10 (radiante) é o que o mundo vê. Mas o 11 (mente divina) é o que ENTREGA visão. No trabalho, alinhe os 2: o brilho visível precisa estar a serviço do invisível. Senão vira performance.',
    fonte: 'KRI 2007, Aquarian Teacher' },
  { pilar: 'tantrica', area: 'proposito',
    frase: 'O corpo 1 (alma) é seu núcleo. Quando você decide a partir dele, tudo se alinha. Quando decide a partir do ego (3 mentes inferiores), diverge. Volte ao 1 hoje, em silêncio, antes de agir.',
    fonte: 'KRI 2007; Taittiriya Upanishad' },
  { pilar: 'tantrica', area: 'criatividade',
    frase: 'O corpo 3 (mente positiva) e o 6 (linha do arco) juntos = a vontade criativa. O 3 expande, o 6 sustenta. Crie HOJE a partir dos dois: imagine (3) e mantenha (6) até terminar.',
    fonte: 'KRI 2007' },
  { pilar: 'tantrica', area: 'espiritualidade',
    frase: 'A Mente Divina (corpo 11) é o canal. Pratique hoje 5 min de silêncio TOTAL — sem música, sem mantra, sem intenção. Apenas esteja. É a partir desse silêncio que a voz fala.',
    fonte: 'KRI 2007; Sahaja Yoga como referência' },
  { pilar: 'tantrica', area: 'sexualidade',
    frase: 'Sexualidade tântrica = subir a kundalini pelo corpo 6 (linha do arco) até o 10 (radiante) e o 11 (mente divina). Não se trata de técnica — trata-se de PRESENÇA. O corpo 2 (mente negativa) aprende a dizer sim E não com verdade. A não-monogamia consensual é honrosa quando acordada entre corpos que se respeitam.',
    fonte: 'KRI 2007; tantra Kashmir Shaivism; consciente não-monogamia como ética (Relações)' },
];
// ─── Pilar 4 · Odu · ancestralidade iorubá ─────────────────────────────────
const ODU: TraducaoArea[] = [
  { pilar: 'odu', area: 'paz',
    frase: 'O Odu que rege seu nascimento traz uma QUALIDADE DE PAZ específica. Para conhecer a sua, procure babalaô/yaô de sua confiança.',
    fonte: 'Verger 1973', requer_terreiro: true },
  { pilar: 'odu', area: 'saude',
    frase: 'Seu Odu aponta caminhos ancestrais de cura (ervas, banhos, ebós). A tradição iorubá tem práticas de saúde para cada Odu. Consulte terreiro de referência antes de aplicar.',
    fonte: 'Verger 1973; Mbiti 1969', requer_terreiro: true },
  { pilar: 'odu', area: 'relacoes',
    frase: 'O Odu ensina como você se conecta com o outro a partir da ancestralidade. Não substitui a escolha consciente — ilumina o chão onde você pisa. Para detalhes: babalaô/yaô.',
    fonte: 'Verger 1973', requer_terreiro: true },
  { pilar: 'odu', area: 'dinheiro',
    frase: 'O Odu carrega uma relação específica com prosperidade (alguns Odus pedem expansão, outros contração). A leitura detalhada pede terreiro. Aqui só dizemos: não trate dinheiro como separado do Ori.',
    fonte: 'Verger 1973', requer_terreiro: true },
  { pilar: 'odu', area: 'trabalho',
    frase: 'O Odu aponta ofícios que o Ori reconhece como seus. Em Ifá, ofício é caminho, não carreira. A definição do seu ofício pede babalaô/yaô + terreiro + consentimento da tradição.',
    fonte: 'Verger 1973', requer_terreiro: true },
  { pilar: 'odu', area: 'proposito',
    frase: 'O Odu é o resumo ancestral do seu Ori — a cabeça divina. A leitura do Propósito pelo Odu é responsabilidade da tradição, não do app. Procure babalaô/yaô de referência.',
    fonte: 'Verger 1973; Mbiti 1969', requer_terreiro: true },
  { pilar: 'odu', area: 'criatividade',
    frase: 'Seu Odu carrega arquétipos criativos ancestrais (histórias, danças, cantos, cores). Para acessar, vá ao terreiro, peça o Odu seu e ouça. O app só abre a porta — não entra na casa.',
    fonte: 'Verger 1973', requer_terreiro: true },
  { pilar: 'odu', area: 'espiritualidade',
    frase: 'A prática espiritual do seu Odu inclui oferendas (ebós), preces e ritmos específicos. A tradição iorubá é viva e não se aprende em app. Comece: visite um terreiro, peça a bênção, escute.',
    fonte: 'Verger 1973; Mbiti 1969', requer_terreiro: true },
  { pilar: 'odu', area: 'sexualidade',
    frase: 'Cada Odu traz uma energia sexual-espiritual específica. Alguns pedem contenção, outros celebração; alguns abençoam a não-monogamia, outros a monogamia sagrada. A leitura detalhada do seu Odu nesta área requer babalaô/yaô — não invente sozinho.',
    fonte: 'Verger 1973; Mbiti 1969', requer_terreiro: true },
];

// ─── Pilar 5 · I Ching · mutação do caminho ────────────────────────────────

const ICHING: TraducaoArea[] = [
  { pilar: 'iching', area: 'paz',
    frase: 'O hexagrama de hoje diz em qual ESTADO você está. Paz não é ausência de conflito — é saber em qual fase você está. Olhe o hexagrama, leia a mensagem, ajuste a postura.',
    fonte: 'Wilhelm/Baynes 1950, I Ching: O Livro das Mutações' },
  { pilar: 'iching', area: 'saude',
    frase: 'O corpo muda a cada dia; o I Ching é o espelho. Hexagrama do dia te diz se HOJE é dia de movimento (Trovão 51) ou repouso (Montanha 52). Não force a fase errada.',
    fonte: 'Wilhelm/Baynes 1950' },
  { pilar: 'iching', area: 'relacoes',
    frase: 'Cada hexagrama mostra o tom da relação HOJE. Hexagrama 31 (Influência) aproxima; 44 (Encontrar) alerta; 8 (Solidão) pede individuação. Não force intimidade quando o I Ching pede espaço.',
    fonte: 'Wilhelm/Baynes 1950' },
  { pilar: 'iching', area: 'dinheiro',
    frase: 'Hexagrama 11 (Paz) = abundância; 12 (Estagnamento) = espera; 42 (Aumento) = expansão. Use o hexagrama do dia para calibrar: HOJE, dinheiro pede expandir ou contrair?',
    fonte: 'Wilhelm/Baynes 1950; King Wen sequence' },
  { pilar: 'iching', area: 'trabalho',
    frase: 'O hexagrama do dia é seu briefing. 51 (Trovão) pede início; 15 (Modéstia) pede contenção; 49 (Revolução) pede mudança radical. Antes de agir, leia o hexagrama — ele antecipa a fase.',
    fonte: 'Wilhelm/Baynes 1950' },
  { pilar: 'iching', area: 'proposito',
    frase: 'Seu hexagrama NATAL é o tema da vida inteira. O do DIA é o microcosmos. O do MOMENTO (mutação por linha) é a hora. Jogue o I Ching hoje, antes de decidir o grande. O livro fala com quem escuta.',
    fonte: 'Wilhelm/Baynes 1950' },
  { pilar: 'iching', area: 'criatividade',
    frase: 'O I Ching é criativo POR NATUREZA — cada hexagrama é uma possibilidade. Crie a partir do hexagrama de hoje: ele indica o tom. 35 (Progresso) = expor; 50 (Cachimbo) = nutrir; 58 (Alegre) = compartilhar.',
    fonte: 'Wilhelm/Baynes 1950' },
  { pilar: 'iching', area: 'espiritualidade',
    frase: 'A meditação sobre 1 hexagrama HOJE = prática espiritual completa. Escolha o do dia, leia o nome + essência, sente 10 min com a imagem. O I Ching é livro vivo: muda com você.',
    fonte: 'Wilhelm/Baynes 1950; tradição confuciana + taoísta' },
  { pilar: 'iching', area: 'sexualidade',
    frase: 'Hexagrama 31 (Influência/Atração) fala de magnetismo; 44 (Encontrar/Sedução) de jogo de sedução; 53 (Desenvolvimento) de amadurecimento erótico. Seu hexagrama NATAL indica o TOM da sua sexualidade — como você busca, como encontra, como se entrega. Leia-o com paciência.',
    fonte: 'Wilhelm/Baynes 1950; King Wen sequence' },
];

// ─── Matriz completa ──────────────────────────────────────────────────────

const MATRIZ: TraducaoArea[] = [...CABALA, ...ASTROLOGIA, ...TANTRICA, ...ODU, ...ICHING];

/** Resolve a Tradução para um Pilar + Área. */
export function traducaoPara(pilar: Pilar, area: Area): TraducaoArea | undefined {
  return MATRIZ.find((t) => t.pilar === pilar && t.area === area);
}

/** Devolve 5 traduções (1 por Pilar) para uma Área. */
export function traducoesDaArea(area: Area): TraducaoArea[] {
  return MATRIZ.filter((t) => t.area === area);
}

/** Devolve 8 traduções (1 por Área) para um Pilar. */
export function traducoesDoPilar(pilar: Pilar): TraducaoArea[] {
  return MATRIZ.filter((t) => t.pilar === pilar);
}

// ─── Conteúdo Detalhado — 5 Pilares × 9 Áreas (F-232) ──────────────────────
// Conteúdo profundo: 5 campos por entrada (explicacao/convergencia/tensao/
// evitar/pratica). Fallback: se não existir, usar TraducaoArea.frase.
//
// Formato: TRADUCOES_DETALHADO[pilar][area] = TraducaoAreaDetalhada
// Pilares: 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching'
// Áreas:   'saude' | 'trabalho' | 'amor' | 'sexualidade' | 'criacao' |
//           'proposito' | 'familia' | 'espiritualidade' | 'superacao'

export const TRADUCOES_DETALHADO: Partial<
  Record<Pilar, Partial<Record<Area, Omit<TraducaoAreaDetalhada, 'pilar' | 'area' | 'fonte' | 'requer_terreiro'>>>>
> = {};

// ─── Helpers de Conteúdo Detalhado ─────────────────────────────────────────

/** Devolve conteúdo detalhado para um Pilar + Área. Fallback: frase curta. */
export type TraducaoDetalhadaEntry = {
  pilar: Pilar;
  frase: string;
  explicacao: string;
  convergencia: string;
  tensao: string;
  evitar: string;
  pratica: string;
};

/** Devolve conteúdo detalhado para um Pilar + Área. Fallback: frase curta. */
export function traducaoDetalhadaPara(pilar: Pilar, area: Area): TraducaoDetalhadaEntry | null {
  const pilarEntry = TRADUCOES_DETALHADO[pilar];
  if (pilarEntry && pilarEntry[area]) {
    const e = pilarEntry[area]!;
    return {
      pilar,
      frase: e.frase,
      explicacao: e.explicacao,
      convergencia: e.convergencia,
      tensao: e.tensao,
      evitar: e.evitar,
      pratica: e.pratica,
    };
  }
  // Fallback: frase curta do MATRIZ
  const basic = traducaoPara(pilar, area);
  if (basic) {
    return {
      pilar,
      frase: basic.frase,
      explicacao: basic.frase,
      convergencia: '',
      tensao: '',
      evitar: '',
      pratica: '',
    };
  }
  return null;
}

/** Devolve conteúdo detalhado de todos os pilares para uma Área. */
export function traducoesDetalhadasDaArea(area: Area): TraducaoDetalhadaEntry[] {
  const pilares: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];
  return pilares
    .map((p) => traducaoDetalhadaPara(p, area))
    .filter((t): t is NonNullable<typeof t> => t !== null);
}
