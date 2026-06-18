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
  | 'espiritualidade';

export const AREAS: Area[] = [
  'paz',
  'saude',
  'relacoes',
  'dinheiro',
  'trabalho',
  'proposito',
  'criatividade',
  'espiritualidade',
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
  {
    pilar: 'cabala',
    area: 'paz',
    frase:
      'Sua paz interior vem de alinhar vida externa com número interno. Quando você age CONTRA o seu número, a inquietação aparece. Quando você age A PARTIR dele, há silêncio — mesmo no caos.',
    fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 4',
  },
  {
    pilar: 'cabala',
    area: 'saude',
    frase:
      'O seu número aponta onde sua energia VAI naturalmente. Respeite-o: se o seu número pede introspecção, parar 1 hora sozinho é saúde, não fuga. Corpo sadio = corpo coerente com a missão.',
    fonte: 'Mispar Hechrachi',
  },
  {
    pilar: 'cabala',
    area: 'relacoes',
    frase:
      'Atraia quem vibra no seu número, não quem completa o que falta. Você não precisa ser "metade" — você é inteiro, com geometria própria. Quem reconhece isso fica; quem não, vai sem culpa.',
    fonte: 'Cabala Luriânica 1570 (Tikkun: atrai sua tikun, não seu complemento)',
  },
  {
    pilar: 'cabala',
    area: 'dinheiro',
    frase:
      'Dinheiro segue missão, não o contrário. Recuse hoje 1 proposta que paga bem mas te afasta do seu número. A abundância vem quando VOCÊ está alinhado — e o dinheiro reconhece.',
    fonte: 'Proverbios 3:9-10; Mispar Hechrachi (Mestre 8)',
  },
  {
    pilar: 'cabala',
    area: 'trabalho',
    frase:
      'Seu trabalho ideal NÃO é compatível com qualquer um. É compatível com o seu número. Se você está em trabalho que cabe em QUALQUER pessoa, fuja. Busque o que só VOCÊ pode fazer.',
    fonte: 'Mispar Hechrachi',
  },
  {
    pilar: 'cabala',
    area: 'proposito',
    frase:
      'O número do seu nascimento é o resumo do seu contrato de vida. Re-leia-o hoje: ele diz em 1 linha o que você veio fazer. Você não precisa descobrir — só lembrar.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    pilar: 'cabala',
    area: 'criatividade',
    frase:
      'Crie HOJE a partir do seu número, não da moda. Sua voz criativa tem geometria própria — quem copiar o estilo do vizinho vai soar falso. Ouse ser estranho no seu.',
    fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 1',
  },
  {
    pilar: 'cabala',
    area: 'espiritualidade',
    frase:
      'Prática espiritual = 1 ato por dia coerente com seu número. Não é técnica universal — é a SUA oração. Meditação, oração, ritual, silêncio: o que ressoa com seu número?',
    fonte: 'Sefer Yetzirah; Cabala prática contemporânea',
  },
];

const ASTROLOGIA: TraducaoArea[] = [
  {
    pilar: 'astrologia',
    area: 'paz',
    frase:
      'Paz interior vem de alinhar com o trânsito do dia, não de fugir dele. Quando o céu pede recolhimento e você sai festejando, a inquietação sobe. Olhe o céu HOJE e aja a partir dele.',
    fonte: 'Brennan, Hellenistic Astrology (2017); CHANI App RQ-007',
  },
  {
    pilar: 'astrologia',
    area: 'saude',
    frase:
      'Seu signo mostra onde sua energia VAI. Áries vai pra ação; Touro vai pro corpo; Gêmeos pra comunicação. Honre seu signo — corpo sadio = corpo na sua natureza, não na do coach.',
    fonte: 'Brennan 2017; trad. PT-BR Raffaelli',
  },
  {
    pilar: 'astrologia',
    area: 'relacoes',
    frase:
      'Atraia pelo Sol: você ama a partir dele, não do ascendente social. O outro precisa ver seu SOL — não sua máscara. Quem só responde à sua persona vai embora quando a persona cansa.',
    fonte: 'Brennan 2017, cap. 8 (Sol como identidade essencial)',
  },
  {
    pilar: 'astrologia',
    area: 'dinheiro',
    frase:
      'Transits de Júpiter e Saturno são os grandes moduladores financeiros. Quando Júpiter transita seu Sol, expanda. Quando Saturno retorna, contraia e estruture. O céu te avisa 6 meses antes.',
    fonte: 'Brennan 2017; Saturn Return como rito de passagem',
  },
  {
    pilar: 'astrologia',
    area: 'trabalho',
    frase:
      'O Meio do Céu (MC) é sua carreira pública; o Ascendente é como você se mostra; o Sol é quem você é. Trabalho bom alinha os 3 — não sacrifica nenhum.',
    fonte: 'Brennan 2017, cap. 6 (Ângulos: ASC/MC/IC/DSC)',
  },
  {
    pilar: 'astrologia',
    area: 'proposito',
    frase:
      'O Nodo Norte (Júpiter evoluído) é a direção da alma. A direção do Nodo Sul (que você já conhece) é onde você fica preso. A vida pede: vá do Sul pro Norte, mesmo com medo.',
    fonte: 'Brennan 2017; Jyotish R-018',
  },
  {
    pilar: 'astrologia',
    area: 'espiritualidade',
    frase:
      'A prática espiritual muda com o trânsito lunar. Lua Nova = plantar; Crescente = agir; Cheia = colher e soltar; Minguante = descansar. Não force a fase errada. O céu te guia.',
    fonte: 'Brennan 2017, cap. 14 (Fases Lunares)',
  },
  {
    pilar: 'astrologia',
    area: 'criatividade',
    frase:
      'Astrologia não é destino — é mapa. Seu mapa mostra onde sua energia criativa VAI quando você está no fluxo. Crie a partir do que o céu já sabe sobre você.',
    fonte: 'Brennan 2017, cap. 5 (Signos como archetypes criativos)',
  },
];

const TANTRICA: TraducaoArea[] = [
  {
    pilar: 'tantrica',
    area: 'paz',
    frase:
      'Você tem 11 corpos, mas costuma viver em 1 ou 2. Paz vem de EXPANDIR para os outros: ouça o corpo 9 (intuição), sinta o 7 (aura), respire o 8 (prana). Quanto mais corpos ativos, mais presença.',
    fonte: 'Yogi Bhajan, Aquarian Teacher (KRI 2007); 10 corpos + Mente Divina',
  },
  {
    pilar: 'tantrica',
    area: 'saude',
    frase:
      'O corpo 5 (físico) é o templo, mas o 8 (prana) é a energia que o anima. Saúde = respirar fundo 3x hoje. O corpo sutil, quando bem alimentado, sustenta o físico.',
    fonte: 'KRI 2007; Taittiriya Upanishad (pancha kosha)',
  },
  {
    pilar: 'tantrica',
    area: 'relacoes',
    frase:
      'Você se relaciona a partir de UM corpo predominante. Astral (emoção) tende à fusão; Mental (cabeça) à distância; Físico (corpo) à presença. Reconheça o seu e avise o outro — quem ama de verdade, ajusta.',
    fonte: 'KRI 2007; trigêmeo físico/astral/mental',
  },
  {
    pilar: 'tantrica',
    area: 'dinheiro',
    frase:
      'O corpo 8 (prana) sustenta sua vitalidade E sua capacidade de gerar. Dinheiro é troca de energia vital. Cuide do seu prana: sono, respiração, alimentação. A conta vem junto.',
    fonte: 'KRI 2007; Ayurveda como base',
  },
  {
    pilar: 'tantrica',
    area: 'trabalho',
    frase:
      'Seu corpo 10 (radiante) é o que o mundo vê. Mas o 11 (mente divina) é o que ENTREGA visão. No trabalho, alinhe os 2: o brilho visível precisa estar a serviço do invisível. Senão vira performance.',
    fonte: 'KRI 2007, Aquarian Teacher',
  },
  {
    pilar: 'tantrica',
    area: 'proposito',
    frase:
      'O corpo 1 (alma) é seu núcleo. Quando você decide a partir dele, tudo se alinha. Quando decide a partir do ego (3 mentes inferiores), diverge. Volte ao 1 hoje, em silêncio, antes de agir.',
    fonte: 'KRI 2007; Taittiriya Upanishad',
  },
  {
    pilar: 'tantrica',
    area: 'criatividade',
    frase:
      'O corpo 3 (mente positiva) e o 6 (linha do arco) juntos = a vontade criativa. O 3 expande, o 6 sustenta. Crie HOJE a partir dos dois: imagine (3) e mantenha (6) até terminar.',
    fonte: 'KRI 2007',
  },
  {
    pilar: 'tantrica',
    area: 'espiritualidade',
    frase:
      'A Mente Divina (corpo 11) é o canal. Pratique hoje 5 min de silêncio TOTAL — sem música, sem mantra, sem intenção. Apenas esteja. É a partir desse silêncio que a voz fala.',
    fonte: 'KRI 2007; Sahaja Yoga como referência',
  },
];
const ODU: TraducaoArea[] = [
  {
    pilar: 'odu',
    area: 'paz',
    frase:
      'O Odu que rege seu nascimento traz uma QUALIDADE DE PAZ específica. Para conhecer a sua, procure babalaô/yaô de sua confiança.',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'saude',
    frase:
      'Seu Odu aponta caminhos ancestrais de cura (ervas, banhos, ebós). A tradição iorubá tem práticas de saúde para cada Odu. Consulte terreiro de referência antes de aplicar.',
    fonte: 'Verger 1973; Mbiti 1969',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'relacoes',
    frase:
      'O Odu ensina como você se conecta com o outro a partir da ancestralidade. Não substitui a escolha consciente — ilumina o chão onde você pisa. Para detalhes: babalaô/yaô.',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'dinheiro',
    frase:
      'O Odu carrega uma relação específica com prosperidade (alguns Odus pedem expansão, outros contração). A leitura detalhada pede terreiro. Aqui só dizemos: não trate dinheiro como separado do Ori.',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'trabalho',
    frase:
      'O Odu aponta ofícios que o Ori reconhece como seus. Em Ifá, ofício é caminho, não carreira. A definição do seu ofício pede babalaô/yaô + terreiro + consentimento da tradição.',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'proposito',
    frase:
      'O Odu é o resumo ancestral do seu Ori — a cabeça divina. A leitura do Propósito pelo Odu é responsabilidade da tradição, não do app. Procure babalaô/yaô de referência.',
    fonte: 'Verger 1973; Mbiti 1969',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'criatividade',
    frase:
      'Seu Odu carrega arquétipos criativos ancestrais (histórias, danças, cantos, cores). Para acessar, vá ao terreiro, peça o Odu seu e ouça. O app só abre a porta — não entra na casa.',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    pilar: 'odu',
    area: 'espiritualidade',
    frase:
      'A prática espiritual do seu Odu inclui oferendas (ebós), preces e ritmos específicos. A tradição iorubá é viva e não se aprende em app. Comece: visite um terreiro, peça a bênção, escute.',
    fonte: 'Verger 1973; Mbiti 1969',
    requer_terreiro: true,
  },
];

// ─── Pilar 5 · I Ching · mutação do caminho ────────────────────────────────

const ICHING: TraducaoArea[] = [
  {
    pilar: 'iching',
    area: 'paz',
    frase:
      'O hexagrama de hoje diz em qual ESTADO você está. Paz não é ausência de conflito — é saber em qual fase você está. Olhe o hexagrama, leia a mensagem, ajuste a postura.',
    fonte: 'Wilhelm/Baynes 1950, I Ching: O Livro das Mutações',
  },
  {
    pilar: 'iching',
    area: 'saude',
    frase:
      'O corpo muda a cada dia; o I Ching é o espelho. Hexagrama do dia te diz se HOJE é dia de movimento (Trovão 51) ou repouso (Montanha 52). Não force a fase errada.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'relacoes',
    frase:
      'Cada hexagrama mostra o tom da relação HOJE. Hexagrama 31 (Influência) aproxima; 44 (Encontrar) alerta; 8 (Solidão) pede individuação. Não force intimidade quando o I Ching pede espaço.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'dinheiro',
    frase:
      'Hexagrama 11 (Paz) = abundância; 12 (Estagnamento) = espera; 42 (Aumento) = expansão. Use o hexagrama do dia para calibrar: HOJE, dinheiro pede expandir ou contrair?',
    fonte: 'Wilhelm/Baynes 1950; King Wen sequence',
  },
  {
    pilar: 'iching',
    area: 'trabalho',
    frase:
      'O hexagrama do dia é seu briefing. 51 (Trovão) pede início; 15 (Modéstia) pede contenção; 49 (Revolução) pede mudança radical. Antes de agir, leia o hexagrama — ele antecipa a fase.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'proposito',
    frase:
      'Seu hexagrama NATAL é o tema da vida inteira. O do DIA é o microcosmos. O do MOMENTO (mutação por linha) é a hora. Jogue o I Ching hoje, antes de decidir o grande. O livro fala com quem escuta.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'criatividade',
    frase:
      'O I Ching é criativo POR NATUREZA — cada hexagrama é uma possibilidade. Crie a partir do hexagrama de hoje: ele indica o tom. 35 (Progresso) = expor; 50 (Cachimbo) = nutrir; 58 (Alegre) = compartilhar.',
    fonte: 'Wilhelm/Baynes 1950',
  },
  {
    pilar: 'iching',
    area: 'espiritualidade',
    frase:
      'A meditação sobre 1 hexagrama HOJE = prática espiritual completa. Escolha o do dia, leia o nome + essência, sente 10 min com a imagem. O I Ching é livro vivo: muda com você.',
    fonte: 'Wilhelm/Baynes 1950; tradição confuciana + taoísta',
  },
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

/** Métricas estáticas da matriz F-229 */
export function coberturaTraducaoAreas() {
  const pilares = new Set(MATRIZ.map((t) => t.pilar)).size;
  const areas = new Set(MATRIZ.map((t) => t.area)).size;
  const total = MATRIZ.length;
  const com_terreiro = MATRIZ.filter((t) => t.requer_terreiro === true).length;
  return { pilares, areas, total, com_terreiro };
}

// ─── Conteúdo Detalhado — 5 Pilares × 8 Áreas (F-232) ──────────────────────
// Formato: TRADUCOES_DETALHADO[pilar][area] = TraducaoAreaDetalhada

export const TRADUCOES_DETALHADO: Partial<
  Record<
    Pilar,
    Partial<
      Record<Area, Omit<TraducaoAreaDetalhada, 'pilar' | 'area' | 'fonte' | 'requer_terreiro'>>
    >
  >
> = {
  cabala: {
    paz: {
      frase:
        'Sua paz interior vem de alinhar vida externa com número interno. Quando você age CONTRA o seu número, a inquietação aparece. Quando você age A PARTIR dele, há silêncio — mesmo no caos.',
      explicacao:
        'A Cabala ensina que cada pessoa nasce com um número que é a assinatura da sua alma. Esse número não édecorativo — é um mapa de ação. Paz não é ausência de movimento; é coerência entre o que você faz e o que o seu número pede. Quando há dissonância, o corpo protesta em forma de inquietação, insônia, tensão nos ombros. Quando há alinhamento, mesmo o caos externo encontra um centro silencioso dentro de você.',
      convergencia:
        'Todos os pilares concordam: paz vem de alinhamento interno, não de controle externo. A Cabala chama isso de número; a Astrologia chama de signo; o Tantra chama de corpo central; o I Ching chama de hexagrama. O nome muda, a verdade é a mesma — você precisa viver na sua geometria, não na dos outros.',
      tensao:
        'A Cabala pede que você conheça seu número e viva conforme ele — o que pode gerar rigidez ou obsessão por perfeição numérica. Outras tradições pedem fluidez. O risco é trocar uma prisão (fazer o que todo mundo faz) por outra (fazer só o que o número manda, sem ouvir o momento presente).',
      evitar:
        'Evite usar o número como desculpa para não agir ou como mania de superioridade sobre quem não o conhece.',
      pratica:
        'Toda manhã, antes de agir, pergunte: "O que meu número pede HOJE?" Anote uma ação e faça-a.',
    },
    saude: {
      frase:
        'O seu número aponta onde sua energia VAI naturalmente. Respeite-o: se o seu número pede introspecção, parar 1 hora sozinho é saúde, não fuga. Corpo sadio = corpo coerente com a missão.',
      explicacao:
        'Na Cabala, o corpo físico é o veículo da missão da alma, e cada número tem uma relação específica com os orgãos, sistemas e ritmos do corpo. Quando você força o corpo a operar fora do ritmo do seu número, a saúde se deteriora — não por doença, mas por dissonância. O número 1 tende à tensão muscular; o número 7 à fadiga mental; o número 9 à sobrecarga emocional. Conhecer seu número é saber onde o seu corpo mais precisa de cuidado.',
      convergencia:
        'A Astrologia diz o mesmo com outro vocabulário: honre seu signo. O Tantra diz: honre seus corpos sutis. Todos apontam para o mesmo princípio — corpo saudável é corpo alinhado à sua natureza, não à natureza do coach, da dieta da moda ou da rotina de productividadedodopadrão.',
      tensao:
        'A Cabala pode gerar uma leitura rígida da saúde — "meu número pede isso, então não posso comer aquilo". O risco é medicalizar uma teaching espiritual e perder a inteligência do corpo presente. O corpo fala agora; o número orienta a longo prazo.',
      evitar:
        'Evite diagnósticos de saúde baseados apenas em número, sem ouvir o corpo atual. Número orienta; corpo decide.',
      pratica:
        'Hoje, observe onde está a tensão no corpo. Pergunte: "Isso é dissonância com o meu número ou com o meu momento?"',
    },
    relacoes: {
      frase:
        'Atraia quem vibra no seu número, não quem completa o que falta. Você não precisa ser "metade" — você é inteiro, com geometria própria. Quem reconhece isso fica; quem não, vai sem culpa.',
      explicacao:
        'A Cabala Luriânica ensina que cada pessoa tem um tikkun — uma correção cósmica que ela veio fazer no mundo. As relações não são aleatórias: atraímos quem vibra no mesmo número porque estamos co-criando o tikkun juntos. Isso não significa que as relações são fáceis — significa que são significativas. Parceiros que nos obrigam a sair da nossa geometria para caber na deles não são tikkun; são teste. Reconhece quem fica quando você é inteiro, não quando finge ser metade.',
      convergencia:
        'O Tantra diz: relacione-se a partir do corpo central, não do corpo que falta. A Astrologia diz: atraia pelo Sol, não pelo Ascendente social. Todas três apontam para o mesmo princípio: integridade attracts integridade. Quem precisa que você seja menor para se sentir maior não é parceiro — é competidor disfarçado.',
      tensao:
        'A Cabala pode gerar a expectativa de um parceiro "perfeito em número" — o que é uma forma sofisticada de fuga da relação real. O Tantra pode gerar a expectativa oposta: fusão total sem individualidade. O ponto médio é o mais difícil e o mais honesto: dois inteiros que escolhem estar juntos.',
      evitar:
        'Evite usar o número para justificar relacionamentos que não funcionam ou para sair de medo daqueles que funcionam demais.',
      pratica:
        'Pergunte ao parceiro ou parceira: "Qual é o meu número?" Se não souber, conte. Veja a reação — ela revela muito.',
    },
    dinheiro: {
      frase:
        'Dinheiro segue missão, não o contrário. Recuse hoje 1 proposta que paga bem mas te afasta do seu número. A abundância vem quando VOCÊ está alinhado — e o dinheiro reconhece.',
      explicacao:
        'Na Cabala prática, dinheiro é troca de energia vital. Quando você está alinhado com o seu número, a energia flui — e o dinheiro é uma manifestacão dessa energia. Quando você está dissonante, o dinheiro até vem, mas não fica: ou gasta em excesso, ou perde em investimentos malucos, ou o trabalho que paga bem não traz satisfação e então você abandona. A abundância não é quanto você ganha; é quanto você retém porque está no lugar certo fazendo a coisa certa.',
      convergencia:
        'Os Proverbios dizem: "Honra o Senhor com teus bens e com as primícias de toda a tua renda." A Cabala diz: ponha o número em primeiro lugar e o dinheiro sustentará a missão. O I Ching diz: hexagrama 11 (Paz) = abundância quando há alinhamento interno. Todos apontam: primeiro alinhamento, depois recursos.',
      tensao:
        'A Cabala pode gerar culpa financeira: "Se não estou ganha isto, é porque não estou alinhado." Outras tradições pedem que você ajae sem culpa, apenas com presença. O risco é trocar ganância por culpa espiritualizada — usar "alinhamento" como desculpa para não ganhar o que precisa.',
      evitar:
        'Evite recusar propostas de boa remuneração por小弟medo de dissonância — nem toda dissonância é fatal; alguma é simplesmente desconfortável e necessária.',
      pratica:
        'Revise suas últimas 3 decisões financeiras. Em quantas delas você estava agindo a partir do número ou a partir do medo?',
    },
    trabalho: {
      frase:
        'Seu trabalho ideal NÃO é compatível com qualquer um. É compatível com o seu número. Se você está em trabalho que cabe em QUALQUER pessoa, fuja. Busque o que só VOCÊ pode fazer.',
      explicacao:
        'O Mispar Hechrachi atribui a cada número uma qualidade de ação no mundo. O número 1 inicia; o 4 constrói; o 7 pesquisa; o 9 ensina. Quando você está em um trabalho que não exige a qualidade do seu número, o trabalho fica vazio, mesmo que o salário seja bom. Quando o trabalho exige exatamente o que você tem de mais raro, você entra em flow state — e isso não é coincidência. É geometria. O trabalho ideal é aquele onde o seu número é indispensável, não intercambiável.',
      convergencia:
        'A Astrologia diz: alinhe Sol, Ascendente e Meio do Céu. O Tantra diz: corpo 10 (radiante) precisa estar a serviço do corpo 11 (mente divina). O I Ching diz: leia o hexagrama antes de decidir. Todos apontam para o mesmo: trabalho significativo é trabalho alinhado com quem você é — não com o que o mercado quer.',
      tensao:
        'A Cabala pode gerar elitismo de trabalho: "só o meu número é válido" — o que é uma forma de vaidade espiritualizada. O risco é esperar o trabalho perfeito em vez de construir um trabalho bom com o que existe agora. Iniciar antes de estar pronto é a prática do número 1, mesmo para um 4.',
      evitar:
        'Evite o perfeccionismo de encontrar "o trabalho certo" em vez de construir um trabalho honesto com o que tem agora.',
      pratica:
        'Liste 3 tarefas que você faz no trabalho atual que ninguém mais faz como você. Essa é a pista do seu número no trabalho.',
    },
    proposito: {
      frase:
        'O número do seu nascimento é o resumo do seu contrato de vida. Re-leia-o hoje: ele diz em 1 linha o que você veio fazer. Você não precisa descobrir — só lembrar.',
      explicacao:
        'O Sefer Yetzirah, texto fundacional da Cabala, descreve cada número como uma qualidade de ação divina no mundo. Quando você nasce, recebe um número que é a sua posição única nessa ação divina. Não é um destino fixo — é um ponto de partida. O número diz: a partir daqui, neste pontocardeal interno, você opera. Propósito não é o que você "deve" fazer — é o que você não consegue deixar de fazer quando está alinhado. É a sua nota musical no acorde da criação.',
      convergencia:
        'O Nodo Norte astrológico diz a mesma coisa: vá na direção que assusta porque é onde está o aprendizado. O Tantra diz: volte ao corpo 1 (alma) antes de decidir. O I Ching diz: leia o hexagrama natal como tema da vida inteira. Todas as tradições apontam para uma mesma verdade incômoda: o propósito já está lá — você só precisa parar de fugir dele.',
      tensao:
        'A Cabala pode gerar uma leitura rígida do propósito: "meu número significa X, então só posso fazer X." Isso é uma prisão. O propósito não é uma carreira — é uma qualidade de presença. Um 3 pode criarPurpose na música, na matemática ou na culinária. O número é a qualidade, não o campo.',
      evitar:
        'Evite transformar o número em profecia rígida. Propósito é bússola, não GPS. Bússola aponta; GPS determina cada curva.',
      pratica:
        'Escreva o seu número em um papel. Ao lado, escreva 3 ações que você toma quando está totalmente no seu flow. Compare os dois — a conexão revela muito.',
    },
    criatividade: {
      frase:
        'Crie HOJE a partir do seu número, não da moda. Sua voz criativa tem geometria própria — quem copiar o estilo do vizinho vai soar falso. Ouse ser estranho no seu.',
      explicacao:
        'Na Cabala, criar é participar da criação divina. O Sefer Yetzirah descreve as letras do alfabeto hebraico como ferramentas de criação — cada letra tem uma forma, um som, uma posição. Quando você cria a partir do seu número, está usando a sua ferramenta nativa. Não é sobre técnica — é sobre assinatura. A sua voz criativa é tão única quanto a sua impressão digital. Quando você tenta soar como outro, está usando a ferramenta errada e o resultado é sempre falso. O número diz: esta é a sua ferramenta, este é o seu ângulo, esta é a sua contribuição irrepetível.',
      convergencia:
        'O Tantra diz: use o corpo 3 (mente positiva) para expandir e o corpo 6 (linha do arco) para sustentar. A Astrologia diz:use o Sol, não o Ascendente. O I Ching diz: use o tom do hexagrama de HOJE. Todos dizem a mesma coisa: crie de dentro para fora, não de fora para dentro.',
      tensao:
        'A Cabala pode gerar bloqueios criativos por medo de usar a ferramenta errada — o que paradoxalmente impede a criação. O risco é tanto a imitação do vizinho quanto a paralisia do "ainda não sei usar minha ferramenta". Criar é começar antes de estar pronto — que é a prática do número 1.',
      evitar:
        'Evite comparar sua criação com a do vizinho. Geometrias diferentes não são hierarquias — são complementaridades.',
      pratica:
        'Hoje, crie algo em 3 minutos: uma frase, um desenho, uma melodia. Sem editar. A partir do número — não da referência externa.',
    },
    espiritualidade: {
      frase:
        'Prática espiritual = 1 ato por dia coerente com seu número. Não é técnica universal — é a SUA oração. Meditação, oração, ritual, silêncio: o que ressoa com seu número?',
      explicacao:
        'A Cabala prática não prescribe uma técnica espiritual universal — ela pede que cada pessoa encontre a prática que ressoa com a qualidade do seu número. O número 1 precisa iniciar: acender uma vela, declarar uma intenção. O número 4 precisa construir: um ritual diário, repetido, consistente. O número 7 precisa investigar: uma pergunta, uma meditação em silêncio, uma investigação. O número 9 precisa soltar: gratidão, perdão,離 (li — deixar ir, em chinês, referência ao I Ching). A prática não precisa ser grande — precisa ser coerente. 5 minutos por dia, repetidos, são mais poderosos que 3 horas ocasionais de prática desconectada do número.',
      convergencia:
        'A Astrologia diz: mude a prática com o trânsito lunar. O Tantra diz: a Mente Divina (corpo 11) é o canal. O I Ching diz: medite sobre 1 hexagrama por dia. Todas indicam que a prática espiritual deve ser viva, adaptativa e coerente com quem você é neste momento — não uma técnica morta repetida por hábito.',
      tensao:
        'A Cabala pode gerar uma espiritualidade cerebral: muito número, pouco coração. O Tantra pode gerar uma espiritualidade dissolvente: sentir tudo, fazer nada. O ponto médio é o mais difícil e o mais honesto: uma prática que é ao mesmo tempo estruturada (Cabala) e presente (Tantra).',
      evitar:
        'Evite espiritualidade de performance — praticar para mostrar, não para ser. Evite também espiritualidade de escape — praticar para fugir do mundo, não para habitá-lo melhor.',
      pratica:
        'Pergunte: "Qual é o meu número?" A resposta indica a prática: initiate (1), construa (4), investigue (7), ou solte (9). Pratique HOJE 5 minutos nesse modo.',
    },
  },
  tantrica: {
    paz: {
      frase:
        'Você tem 11 corpos, mas costuma viver em 1 ou 2. Paz vem de EXPANDIR para os outros: ouça o corpo 9 (intuição), sinta o 7 (aura), respire o 8 (prana). Quanto mais corpos ativos, mais presença.',
      explicacao:
        'O Tantra de Yogi Bhajan ensina que você tem 11 corpos — 10 corpos sutis da tradição clássica indiana mais a Mente Divina como corpo 11. A maioria das pessoas opera predominantemente no corpo 5 (físico) e no corpo 2 (mente negativa — a que repete medos e narrativas). Paz não vem de parar de fazer — vem de expandir para outros corpos. O corpo 9 (intuição) diz o que o corpo 5 não sabe; o corpo 7 (aura) sente o que a mente 2 projeta; o corpo 8 (prana) anima o que o corpo 5 habita. Quanto mais corpos você ativar deliberadamente, mais presente você fica — e presença é paz.',
      convergencia:
        'A Cabala diz: paz vem de alinhar com o número, que é o seu centro. A Astrologia diz: paz vem de alinhar com o trânsito. O I Ching diz: paz é saber em que fase do hexagrama você está. Todos dizem: paz é alinhamento, não ausência. Alinhamento com o que? Com mais de você do que só o corpo físico.',
      tensao:
        'O Tantra pode gerar uma espiritualidade escapista: "se eu expandir para 11 corpos, não preciso lidar com o corpo 5 (físico)". O risco é dissociar — viver nos corpos sutis para não enfrentar o corpo denso. Paz não é fugir do físico — é incluir mais dimensões enquanto se está no físico.',
      evitar:
        'Evite usar a expansão dos corpos sutis como fuga do corpo físico. O corpo 5 é o templo — não o problema.',
      pratica:
        'Hoje, pause 3 vezes e pergunte: "Em qual corpo estou agora?" Se for só o 5, ative o 8 com 3 respirações profundas.',
    },
    saude: {
      frase:
        'O corpo 5 (físico) é o templo, mas o 8 (prana) é a energia que o anima. Saúde = respirar fundo 3x hoje. O corpo sutil, quando bem alimentado, sustenta o físico.',
      explicacao:
        'Na teaching tântrica de Yogi Bhajan, a saúde não começa no corpo físico — começa no prana, o corpo 8. O corpo físico (corpo 5) é o instrumento; o prana é o que o toca. Quando o prana está estagnado, o corpo manifesta doença. Quando o prana flui, o corpo se auto-regenera. A respiração é o controle remoto do prana. Três respirações profundas por dia — inspirando por 4, segurando por 4, expirando por 6 — movem o prana mais do que qualquer suplemento. O corpo sutil alimenta o denso; por isso, cuidar da respiração é cuidar do corpo antes de o corpo pedir cuidado.',
      convergencia:
        'A Cabala diz: corpo sadio é corpo coerente com a missão do número. A Astrologia diz: honre o signo — cada signo tem um ritmo. O I Ching diz: hexagrama 27 (Alimentar o self) é sobre cuidado. Todos dizem: saúde não é conformidade com um padrão externo — é manutenção do fluxo interno.',
      tensao:
        'O Tantra pode gerar desprezo pelo corpo físico em favor dos corpos sutis — o que é uma forma de dualismo sofisticado. Outros pilares podem medicalizar o corpo, tratando saúde como produto de protocolos externos. O ponto: o corpo físico importa E é suportado pelos sutis. Ambos merecem atenção.',
      evitar:
        'Evite tanto o desprezo pelo corpo quanto a obsessão com ele. Corpo 5 é o templo, não o idolo.',
      pratica:
        'Três vezes hoje, pause e faça 3 respirações longas: inspirar 4, segurar 4, expirar 6. Note a diferença no corpo 5 depois.',
    },
    relacoes: {
      frase:
        'Você se relaciona a partir de UM corpo predominante. Astral (emoção) tende à fusão; Mental (cabeça) à distância; Físico (corpo) à presença. Reconheça o seu e avise o outro — quem ama de verdade, ajusta.',
      explicacao:
        'O Tantra ensina que cada pessoa tem um modo predominante de se relacionar — qual corpo lidera. O corpo 3 (mente positiva) leva intelectualização para a relação; o corpo 4 (mente negativa) leva medo e dependência; o corpo 5 (físico) leva presença e exigência de presença; o corpo 7 (aura) leva sensibilidade extrema e sobrecarga. Quando você não sabe qual é o seu corpo predominante, projeta no outro a expectativa do seu corpo — o que gera conflito. O trabalho tântrico é: reconheça seu corpo líder, comunique-o ao parceiro, e permita que o outro líder se expresse também. Relação tântrica é negociação de corpos, não fusão.',
      convergencia:
        'A Cabala diz: atraia quem vibra no seu número, não quem completa o que falta. A Astrologia diz: atraia pelo Sol, não pela máscara. O I Ching diz: hexagrama 31 (Atração) é sobre influência mútua, não sobre fusão. Todos indicam: relação saudável é entre dois inteiros, não dois pedaços.',
      tensao:
        'O Tantra pode romantizar a fusão — "somos um" — o que é indahonesto e perigoso. Outras tradições podem ser frias demais — "cada um no seu número, sem interferência". O ponto tântrico é sutil: somos corpos separados que se influenciam profundamente. A fusão é energética; a estrutura é individual.',
      evitar:
        'Evite fusão romanticizada — "somos um" é bonita como frase e desastrosa como prática relacional.',
      pratica:
        'Pergunte ao parceiro: "De qual corpo você me ama?" A resposta revela o corpo líder da relação.',
    },
    dinheiro: {
      frase:
        'O corpo 8 (prana) sustenta sua vitalidade E sua capacidade de gerar. Dinheiro é troca de energia vital. Cuide do seu prana: sono, respiração, alimentação. A conta vem junto.',
      explicacao:
        'No Tantra, o corpo 8 (prana) é a energia vital que sustenta todos os outros corpos. Quando o prana está forte, o corpo 10 (radiante) brilha — e é esse brilho que o mundo vê e pelo qual paga. Quando o prana está fraco, o corpo 10 é opaco — e a capacidade de gerar recursos diminui, mesmo que o trabalho seja o mesmo. Cuidadocomoprana é: dormir o suficiente, respirar com consciência, alimentar-se de forma que sustenta a energia — não apenas o corpo 5. Dinheiro no Tantra é consequência da vitalidade, não o contrário.',
      convergencia:
        'A Cabala diz: dinheiro segue missão, não o contrário. A Astrologia diz: Júpiter e Saturno modulam recursos, mas o Sol é quem atrai. O I Ching diz: hexagrama 48 (Poço) é sobre recursos sustentáveis. Todos indicam: recursos vêm de alinhamento interno, não de esforço externo isolado.',
      tensao:
        'O Tantra pode gerar uma abordagem passiva do dinheiro: "se eu cuidar do prana, o dinheiro vem" — o que é magia disfarçada de espiritualidade. Outras tradições podem gerar hyperactividade: "faça mais, ganhe mais, sem parar". O ponto: ambos são necessários. Cuidar do prana SEM ação concreta é sonho; ação concreta SEM cuidado do prana é burnout.',
      evitar:
        'Evite a passes de mágica espiritual: cuidar do prana não substitui o trabalho concreto. Cuide E aja.',
      pratica:
        'Esta semana, avalie: quantas horas você dormiu nos últimos 7 dias? A conta do prana vem antes da conta do banco.',
    },
    trabalho: {
      frase:
        'Seu corpo 10 (radiante) é o que o mundo vê. Mas o corpo 11 (mente divina) é o que ENTREGA visão. No trabalho, alinhe os 2: o brilho visível precisa estar a serviço do invisível. Senão vira performance.',
      explicacao:
        'No Tantra, o corpo 10 é o Radiante — o que brilha para o mundo, o que o mundo vê e contrata. O corpo 11 é a Mente Divina — o canal de visão, o que percebe o que os outros não veem. No trabalho, o erro mais comum é separar os dois: ou você brilha (corpo 10) sem visão (corpo 11) — vira performance, brilho sem alma; ou você tem visão (corpo 11) mas não sabe mostrá-la (corpo 10) — vira invisibilidade, contribuição não vista. O trabalho tântrico é alinhar os dois: o que você mostra ao mundo (10) é a manifestação do que você percebe (11). Quando isso acontece, não é trabalho — é ofício sagrado.',
      convergencia:
        'A Cabala diz: trabalho ideal é aquele onde o número é indispensável. A Astrologia diz: Meio do Céu (MC) + Sol alinhados. O I Ching diz: hexagrama do dia é o briefing. Todos dizem: trabalho significativo tem alinhamento entre o que você É e o que você MOSTRA. Dois elementos, não um.',
      tensao:
        'O Tantra pode gerar trabalho espiritualizado sem impacto material — visão sem execução. Outras tradições podem gerar execução sem visão — performance sem alma. O ponto tântrico:Execute a visão. Não execute sem visão; não visionifique sem executar.',
      evitar:
        'Evite trabalho que só brilha (sem visão) ou só pensa (sem mostrar). Alinhe os dois: visão clara, expressão clara.',
      pratica:
        'No trabalho hoje, antes de cada ação pergunte: isso vem do corpo 10 (mostrar) ou do corpo 11 (ver)? Se só um, onde está o outro?',
    },
    proposito: {
      frase:
        'O corpo 1 (alma) é seu núcleo. Quando você decide a partir dele, tudo se alinha. Quando decide a partir do ego (3 mentes inferiores), diverge. Volte ao 1 hoje, em silêncio, antes de agir.',
      explicacao:
        'No Tantra, o corpo 1 é a Alma — o centro não-verbaldetodaa sua existência. As três mentes (positiva, negativa e neutra) são instrumentos, não o piloto. Quando você decide a partir da mente positiva (corpo 3), decide com otimismo mas sem fundamento. Quando decide a partir da mente negativa (corpo 2), decide com medo. Quando decide a partir da mente neutra (corpo 4), decide com sabedoria mas pode paralisar. A decisão tântrica vem do corpo 1 — o centro. Ela não é mental, não é emocional — é uma certeza corpórea. Você sabe quando está nela porque não precisa justificar. Antes de agir hoje, Volte ao 1. Em silêncio, sem tela, sem input. A resposta está lá.',
      convergencia:
        'A Cabala diz: propósito é o que você não consegue deixar de fazer quando está alinhado. A Astrologia diz: Nodo Norte é a direção da alma. O I Ching diz: hexagrama natal é o tema. Todas apontam para a mesma verdade incômoda: o propósito não é um pensamento — é uma certeza. Você sabe quando está nele porque o corpo sabe.',
      tensao:
        'O Tantra pode gerar uma espiritualidade elitista: "eu decido do corpo 1, vocês decidem das mentes". Isso é vaidade. O corpo 1 é acessível a todos — não é privilégio dos avançados. O ego (mentes) não é inimigo — é instrumento. O risco é demonizar as mentes em vez de subordiná-las ao centro.',
      evitar:
        'Evite espiritualizar a decisão. Decidir do corpo 1 não significa não decidir — significa decidir com o centro, não com o medo ou a euforia.',
      pratica:
        'Antes de uma decisão importante hoje, pare. 5 minutos de silêncio absoluto. Sem input, sem consulta. O que o corpo 1 diz?',
    },
    criatividade: {
      frase:
        'O corpo 3 (mente positiva) e o corpo 6 (linha do arco) juntos = a vontade criativa. O 3 expande, o 6 sustenta. Crie HOJE a partir dos dois: imagine (3) e mantenha (6) até terminar.',
      explicacao:
        'No Tantra, a criatividade não é só mente — é o casamento de dois corpos. O corpo 3 (mente positiva) é a expansão, a ideia, o "e se?". O corpo 6 (linha do arco) é a sustentação, a prática, o "até o fim". Separados, o corpo 3 gera ideias sem fim — o escritor que nunca termina o primeiro capítulo. O corpo 6 sustenta sem expandir — o artesão que repete sem inovar. A vontade criativa tântrica é: o corpo 3 começa, o corpo 6 mantém, e juntos criam o que nenhum dos dois criaria sozinho. Criar é um ato de dois corpos, não de um. Hoje, use os dois.',
      convergencia:
        'A Cabala diz: crie a partir do seu número, não da moda. A Astrologia diz:use o Sol, não o Ascendente. O I Ching diz: use o tom do hexagrama de hoje. Todos dizem: crie de dentro para fora, com consistência, não apenas com inspiração.',
      tensao:
        'O Tantra pode gerar criatividade sem disciplina (muito corpo 3, pouco 6) ou disciplina sem criatividade (muito 6, pouco 3). O ponto é a relação entre os dois: o corpo 3 alimenta o 6 com ideias; o 6 alimenta o 3 com material para refinar. Criar é conversar entre dois corpos.',
      evitar:
        'Evite só imaginar (corpo 3 sem 6) ou só repetir (corpo 6 sem 3). Os dois precisam estar juntos: comece e termine.',
      pratica:
        'Crie algo HOJE: uma frase, um desenho, uma melodia. Defina um tempo mínimo (10 min) e termine. Não edite no meio — apenas termine.',
    },
    espiritualidade: {
      frase:
        'A Mente Divina (corpo 11) é o canal. Pratique hoje 5 min de silêncio TOTAL — sem música, sem mantra, sem intenção. Apenas esteja. É a partir desse silêncio que a voz fala.',
      explicacao:
        'No Tantra de Yogi Bhajan, o corpo 11 (Mente Divina) é o que conecta todos os outros corpos em um todo coerente. Não é um corpo de prática — é o canal através do qual todas as práticas fluem. E esse canal só funciona quando está limpo. A forma de limpá-lo não é com mais prática — é com silêncio. Não silêncio ativo (mantra, rez), mas silêncio passivo: ausência de input, ausência de intenção, ausência de esforço. Apenas estar. Nesse silêncio, a Mente Divina fala — não em palavras, mas em certeza. A maioria das pessoas nunca experimenta esse silêncio porque está sempre fazendo algo espiritual. A prática do corpo 11 é a não-prática. É o mais difícil e o mais simples que existe.',
      convergencia:
        'A Cabala diz: prática espiritual é a SUA oração — personalizada, coerente com o número. A Astrologia diz: mude a prática com o trânsito lunar. O I Ching diz: medite sobre o hexagrama de hoje. Todas as tradições apontam para adaptação e presença. O corpo 11 vai além: ensina que a prática mais alta é aquela que não é prática — é presença sem esforço.',
      tensao:
        'O Tantra pode gerar espiritualidade de performance: "eu medito 2 horas por dia" — o que é ego disfarçado de espiritualidade. Ou o oposto: "eu não preciso de prática, sou muito desenvolvido" — o que é ego disfarçado de não-prática. O ponto: o corpo 11 não se auto-identifica. Quando você sabe que está no corpo 11, provavelmente está no corpo 3.',
      evitar:
        'Evite spiritualidade de炫耀 (xuan yao — ostentar, em mandarim). O corpo 11 não se anuncia. Quando você sabe que está nele, provavelmente está no 3.',
      pratica:
        'Hoje, 5 minutos de silêncio total. Sem mantra, sem música, sem intenção. Apenas estar. Sem registrar depois o que sentiu.',
    },
  },
  astrologia: {
    paz: {
      frase:
        'Você tem três luas — Sol, Lua e Ascendente. Paz é quando os três estão na mesma direção. Quando brigam, há tensão. Quando alinham, há silêncio que não vem de fora.',
      explicacao:
        'A Astrologia entende a paz não como ausência de movimento, mas como alinhamento entre os três corpos celestes que você é. O Sol é a sua vontade — o que você quer para a sua vida. A Lua é a sua emoção — o que você precisa para se sentir seguro. O Ascendente é a sua máscara — como o mundo te vê e como você se projeta. Paz acontece quando o Sol ilumina o que a Lua precisa e o Ascendente entrega sem falsidade. Quando o Sol quer uma coisa, a Lua quer outra, e o Ascendente finge que está tudo bem — aí aparece a inquietação. Não é coincidência que a paz parece impossível quando esses três estão em conflito: é geometria. Você não precisa que o mundo seja calmo. Precisa que Sol, Lua e Ascendente estejam conversando em vez de competirindo.',
      convergencia:
        'O Número de Vida diz: paz vem de coerência entre o que você faz e o que o seu número pede. O Movimento Celeste diz: paz vem do alinhamento entre Sol, Lua e Ascendente — três corpos, não um. O Corpo & Energia diz: paz é o corpo 8 (prana) fluindo sem resistência. A Ancestralidade diz: paz é o Ori em harmonia com o Odu. A Mutação do Caminho diz: paz é saber em que linha do hexagrama você está. Todas as tradições apontam para o mesmo: paz é alinhamento interno, não controle externo. A Astrologia especifica a geometria — Sol, Lua, Ascendente.',
      tensao:
        'A Astrologia pode gerar introspecção paralisante: "preciso conhecer todos os meus aspectos para encontrar paz" — o que é racionalização da inação. Outras tradições podem pedir ação antes do alinhamento perfeito. O ponto: paz não é ausência de tensão — é tensão que sabe seu nome. Conhecer os três corpos ajuda a nomear a tensão, não necessariamente a resolvê-la.',
      evitar:
        'Evite usar o mapa astral como desculpa para não agir: "sou de signo assim, então faço assim". O mapa mostra a geometria — você decide o movimento dentro dela.',
      pratica:
        'Hoje, observe: está em paz ou em tensão? Se em tensão, pergunte: é tensão do Sol (vontade frustrada), da Lua (necessidade emocional não atendida) ou do Ascendente (máscara que não sustenta)? A identificação já desarma.',
    },
    saude: {
      frase:
        'Cada signo governa um orgão, cada planeta uma função. Saúde é viver no ritmo do seu signo — não contra ele. Touro na garganta quando precisa cantar; Escorpião no sexo quando precisa transformar.',
      explicacao:
        'A Astrologia médica atribui a cada signo um órgão ou sistema do corpo: Áries governa a cabeça, Touro a garganta, Gêmeos os pulmões, Câncer o estômago, Leão o coração, Virgem os intestinos, Libra os rins, Escorpião os órgãos reprodutivos, Sagitário o fígado, Capricórnio os ossos, Aquário as canelas, Peixes os pés. Cada planeta modula a energia desse órgão. Quando você vive contra o ritmo do seu signo — forçando um Áries a esperar, um Touro a mudar constantemente, um Escorpião a ser superficial — o corpo responde. Não por doença, mas por dissonância. Saúde astrológica não é conformidade com um padrão — é viver no fluxo do seu signo. O signo pede um ritmo; o corpo responde a esse ritmo.',
      convergencia:
        'O Número de Vida associa números a sistemas do corpo — o 7 ao nervoso, o 9 ao emocional. O Movimento Celeste diz: o signo é o ritmo do corpo — ignore e o corpo cobra. O Corpo & Energia diz: o corpo 8 (prana) alimenta o físico e responde ao signo. A Ancestralidade diz: o Odu comanda predisposições. Todas apontam: saúde é viver na geometria do seu corpo, não contra ela.',
      tensao:
        'A Astrologia pode gerar medicalização do mapa: "estou doente porque Mercúrio está retrógrado" — o que é desculpa para não tratar o corpo com respeito. Ou o inverso: achar que signo não importa e forçar o corpo a operar em ritmo que não é o seu. O ponto: o mapa indica; o corpo decide.',
      evitar:
        'Evite diagnósticos de saúde baseados apenas no signo. O signo indica um ritmo, não uma doença. Vá ao médico E preste atenção ao que o signo está pedindo em termos de ritmo de vida.',
      pratica:
        'Pergunte ao seu signo: "Qual é o ritmo que você pede HOJE?" Não o ritmo que o trabalho exige — o ritmo do signo. Hoje, respeite pelo menos um ciclo natural do signo: se é Touro, pare e respire antes de continuar; se é Áries, inicie algo novo antes de analisar.',
    },
    relacoes: {
      frase:
        'Você atrai pelo Sol, é atraído pela Lua, e se projeta pelo Ascendente. A relação que funciona tem os três em sintonia com os três do outro — não identidade, mas ressonância.',
      explicacao:
        'Na Astrologia, relação é geometria. O Sol de um é o que ilumina no outro — o que um enxerga de valor no parceiro. A Lua de um é o que o outro alimenta emocionalmente — a necessidade que só esse parceiro atende. O Ascendente de um é como o outro vê o par publicamente — a imagem que a relação projeta. Quando o Sol de um ressoa com o Sol, Lua ou Ascendente do outro, há magnetism. Quando não, há atrito. A synastry é a leitura dessa geometria — não para encontrar o parceiro perfeito, mas para entender o tipo de tensão que existe e o que ela pede. Alguma tensão é fértil — cria crescimento. Alguma tensão é destrutiva — cria erosão. O mapa mostra qual é qual.',
      convergencia:
        'O Número de Vida diz: atraia quem vibra no seu número, não quem completa o que falta. O Movimento Celeste diz: atraia pelo Sol — o núcleo, não a máscara. O Corpo & Energia diz: relacione-se do corpo central, não do corpo que sente falta. A Ancestralidade diz: o Odu revela o padrão de relação. A Mutação do Caminho diz: hexagrama 31 (Atração) é influência sem invasão. Todas indicam: relação saudável é ressonância entre dois inteiros.',
      tensao:
        'A Astrologia pode gerar seleção paralisante: "preciso de alguém com Sol em Escorpião porque minha Lua é em Escorpião" — o que é fuga da relação real pela geometria perfeita. Outras tradições podem romantizar a fusão. O ponto: relação é geometria em movimento — não é perfeita nem impossível. É navegável.',
      evitar:
        'Evite usar a synastry para justificar sair de relações difíceis ou para aceitar relações destrutivas. A synastry mostra a geometria — você decide se navega ou se vai embora.',
      pratica:
        'Pergunte ao mapa: o que o meu Sol vê no meu parceiro? E o que a minha Lua precisa que só esse parceiro pode dar? Se as duas respostas forem honestas e coincidirem, há base real.',
    },
    dinheiro: {
      frase:
        'A Casa 2 é o seu cofre. Júpiter expande o que está lá; Saturno limita. A abundância astrológica vem de saber o que VOCÊ considera riqueza — e viver de acordo com isso.',
      explicacao:
        'Na Astrologia, a Casa 2 é o cofre pessoal — o que você acumula, retém, e considera valioso. Não é só dinheiro — é tudo o que o signo e o planeta regente da Casa 2 indicam como fonte de valor. Júpiter na Casa 2 expande: oportunidades, generosidade, excesso. Saturno na Casa 2 limita: escassez, medo de perder, avareza. O trabalho astrológico com dinheiro não é "ganhar mais" — é saber o que o seu mapa considera riqueza. Para um Leão com Sol na Casa 2, riqueza pode ser reconhecimento. Para um Touro com Vênus na Casa 2, riqueza pode ser conforto. Para um Capricórnio com Saturno na Casa 2, riqueza pode ser controle de recursos. Se você corre atrás do tipo errado de riqueza, o dinheiro vem mas não fica.',
      convergencia:
        'O Número de Vida diz: dinheiro segue missão, não o contrário. O Movimento Celeste diz: Júpiter expande onde há abertura, Saturno limita onde há resistência. O Corpo & Energia diz: o corpo 8 (prana) sustenta a capacidade de gerar. A Ancestralidade diz: o Odu indica o fluxo de owo. A Mutação do Caminho diz: hexagrama 48 (Poço) é recursos que se renovam pelo fluxo. Todas apontam: abundância é alinhamento — o tipo de abundância que o seu mapa pede.',
      tensao:
        'A Astrologia pode gerar expectativas materiais: "tenho Júpiter na Casa 2, então vou ficar rico" — o que é passividade disfarçada de fé. Júpiter expande, mas é preciso plantar. Ou o inverso: Capricórnio na Casa 2 pode gerar medo de gastar que paralisa o fluxo. O ponto: Júpiter sem Saturno é excesso sem fundamento; Saturno sem Júpiter é medo sem expansão.',
      evitar:
        'Evite tanto a expectativa passiva ("tenho bom mapa, vai vir") quanto a escassez rígida ("não posso gastar nada"). O mapa indica o tipo de abundância — é preciso agir para que ela se manifeste.',
      pratica:
        'Consulte o seu mapa: o que a Casa 2 realmente indica como fonte de valor para VOCÊ? Não o que a cultura diz — o que o seu signo e planeta regente dizem. Invista pelo menos 1% do seu dinheiro nessa direção esta semana.',
    },
    trabalho: {
      frase:
        'O Meio do Céu (MC) é a sua vocação. O Sol é o que você TEM; a Casa 10 é o que o mundo reconhece. Quando os dois alinham, não é trabalho — é ofício.',
      explicacao:
        'Na Astrologia, o Meio do Céu (MC) é o ponto mais alto do mapa — o que o mundo reconhece em você, o arco profissional, a contribuição pública. A Casa 10 governa a carreira e a reputação. O Sol é a sua essência — o que você tem de mais seu. Quando o Sol está bem aspectado ao MC, há alinhamento entre o que você é e o que o mundo reconhece. Quando não está, há discrepância: ou você é mais do que o mundo vê (invisibilidade), ou o mundo vê mais do que você é (impostura). O trabalho ideal astrológico é aquele onde o Sol, o MC e a Casa 10 estão em diálogo — não em conflito. Não é sorte; é configuração. E toda configuração pode ser navegada.',
      convergencia:
        'O Número de Vida diz: trabalho ideal é onde o número é indispensável, não intercambiável. O Movimento Celeste diz: MC + Sol alinhados = vocação reconhecida. O Corpo & Energia diz: corpo 10 (radiante) a serviço do corpo 11 (visão). A Ancestralidade diz: oogun é a assinatura do Ori no mundo. A Mutação do Caminho diz: hexagrama 50 (Caldeirão) é trabalho como alquimia. Todas dizem: trabalho significativo é onde o que você É encontra o que o mundo precisa.',
      tensao:
        'A Astrologia pode gerar inação: "não tenho aspecto bom no MC, então não tenho vocação" — o que é resignação. O MC é um ponto no mapa; o trabalho é um campo de ação. Outras tradições podem gerar hiperatividade sem direção. O ponto: alinhe o que você tem (Sol) com o que o mundo precisa (MC) — e faça o trabalho que essa geometria pede.',
      evitar:
        'Evite esperar a carreira perfeita para agir. O mapa indica a direção; é preciso andar. Evite também trocar o Sol pelo MC — ser reconhecido sem ser real é vazio; ser real sem ser reconhecido é孤 (gu — sozinho, em chinês).',
      pratica:
        'Pergunte: onde está o meu Sol no mapa? E onde está o meu MC? A relação entre os dois (aspecto, signo, casa) indica o tipo de alinhamento que o trabalho pede. Hoje, faça uma ação que aproxime o Sol do MC — nem que seja uma conversa sobre o que você realmente faz de diferente.',
    },
    proposito: {
      frase:
        'O Nodo Norte é a direção que assusta porque é onde a alma quer ir. O Nodo Sul é o que você já sabe — o porto seguro. Propósito é navegar do Sul para o Norte, não ficar no Sul.',
      explicacao:
        'O Nodo Norte é o ponto mais counter-intuitivo da Astrologia: a direção que assusta é a direção certa. Não porque seja fácil — porque é onde o aprendizado está. O Nodo Norte não é destino no sentido de carreira ou achievements — é qualidade de presença que você veio desenvolver. Um Nodo Norte em Leão veio desenvolver a presença radiante — pode ser como professor, artista ou líder, ou pode ser como pai presente. Um Nodo Norte em Escorpião veio desenvolver a capacidade de transformar — pode ser como terapeuta, investigador ou agente de mudança. O Nodo Sul é o porto: o que você já sabe fazer, o lugar seguro onde pode se esconder se a jornada do Norte ficar difícil demais. Propósito é sair do Sul sem negar o Sul — levar o que você sabe para a direção que assusta.',
      convergencia:
        'O Número de Vida diz: propósito é o que você não consegue deixar de fazer quando está alinhado. O Movimento Celeste diz: Nodo Norte é a direção da alma — vá na direção que assusta. O Corpo & Energia diz: corpo 1 (alma) é o centro de onde tudo parte. A Ancestralidade diz: ípínlà é o arco que o Ori veio percorrer. A Mutação do Caminho diz: hexagrama 55 (Abundância) é o momento em que propósito se reconhece. Todas apontam para o mesmo: propósito é direção, não destino.',
      tensao:
        'A Astrologia pode gerar obsessão com o Nodo Norte sem o trabalho prévio do Sul: "preciso ir na direção do Nodo Norte agora" — o que é imaturidade espiritual. O Sul existe para sustentar o Norte. Outras tradições podem negar a direção completamente. O ponto: o Nodo Norte é a邀 (yao — convite), não a obrigação. Você pode aceitar ou recusar — mas recusar tem um preço que só o tempo revela.',
      evitar:
        'Evite tanto a fuga do Nodo Norte ("é muito difícil, fico no Sul") quanto a negação do Sul ("não preciso do que já sei"). O propósito é navegação: você parte do Sul, não fica nele.',
      pratica:
        'Identifique o signo e a casa do seu Nodo Norte. Pergunte: se eu desse um passo na direção do Nodo Norte HOJE — não um salto, só um passo — qual seria? A resposta vem mais fácil do que você imagina.',
    },
    criatividade: {
      frase:
        'A Casa 5 é o seu atelier criativo. Leo quer ser visto; a Lua quer nutrir; Vênus quer beleza. Crie para ser visto, não para ser aprovado. A diferença muda tudo.',
      explicacao:
        'A Astrologia aponta para a Casa 5 como o espaço de criação — onde você brinca, onde se expressa sem utilidade direta, onde o ego e a musa se encontram. Leo quer ser visto — precisa de platéia, de brilho, de reconhecimento. A Lua quer nutrir — precisa que a criação alimente alguém, até que seja você mesmo. Vênus quer beleza — precisa de estética, de proporção, de harmonia. Quando esses três estão alinhados na criação, o trabalho criativo é prazeroso e completo. Quando estão em conflito — Leo quer ser visto mas a Lua tem medo do palco — a criatividade trava. A lição astrológica mais importante sobre criatividade: a diferença entre criar para ser visto (Leo) e criar para ser aprovado (medo do julgamento). O primeiro é saudável; o segundo é travamento. Criar para ser visto é coragem. Criar para ser aprovado é cobaia.',
      convergencia:
        'O Número de Vida diz: crie a partir do seu número, não da moda. O Movimento Celeste diz: use o Sol, não o Ascendente — a criação vem do núcleo, não da máscara. O Corpo & Energia diz: corpo 3 (mente positiva) começa, corpo 6 (linha do arco) sustenta. A Ancestralidade diz: órisun é o Ori criando pelo seu corpo. A Mutação do Caminho diz: hexagrama 17 (Seguir) é certeza interior que não se abala pelo barulho externo. Todas dizem: crie de dentro para fora.',
      tensao:
        'A Astrologia pode gerar bloqueios criativos por medo do julgamento — especialmente com Lua em posições difíceis aspectando a Casa 5. Outras tradições podem romantizar a inspiração como dom incontrolável. O ponto: criatividade é ofício E presença. O mapa indica o que alimenta a sua musa — é preciso conhecer para sustentar.',
      evitar:
        'Evite criar para a aprovação alheia. O mapa mostra o que é autêntico para você — siga isso, não o que o algoritmo pede. Evite também esperar a inspiração: a Casa 5 pede jogar, experimentar — não produzir, não perfomar.',
      pratica:
        'Crie algo HOJE sem mostrar a ninguém. Não é para ser visto — é para ser feito. A Casa 5 precisa de expressão sem julgamento. 10 minutos, qualquer meio. Sem registro depois do que sentiu.',
    },
    espiritualidade: {
      frase:
        'A Casa 12 é o mar profundo — onde o ego dissolve e algo maior se percebe. Neptuno na Casa 12 é visão; sem prática, é ilusão. A espiritualidade astrológica é viver entre os dois.',
      explicacao:
        'A Astrologia aponta para a Casa 12 como o espaço de dissolução do ego — o mar profundo onde a separação entre o eu e o todo se desfaz. Neptuno nessa casa amplifica a tendência: ou você dissolve no todo (iluminação, compaixão universal) ou se perde no mar (ilusão, dependência, fuga). A espiritualidade autêntica astrológica é navegar entre os dois — saber quando Dissolver e quando Sustentar. A Lua na Casa 12 sente tudo: precisa de rituais de encerramento para não carregar o que não é seu. O Sol na Casa 12 brilha por dentro: precisa de solitude para não se perder no brilho dos outros. Cada planeta na Casa 12 indica uma via específica de espiritualidade — e um risco específico de ilusão. O trabalho é saber a diferença entreintuição (Neptuno que conecta) e imaginação (Neptuno que foge).',
      convergencia:
        'O Número de Vida diz: prática espiritual é a SUA oração — personalizada ao número. O Movimento Celeste diz: mude a prática com o trânsito lunar — espiritualidade viva, adaptativa. O Corpo & Energia diz: a Mente Divina (corpo 11) é o canal — não se auto-identifica. A Ancestralidade diz: espiritualidade é relação com os que já viveram. A Mutação do Caminho diz: hexagrama 4 (Mentira) é a água sob a montanha encontrando a passagem. Todas indicam: espiritualidade é caminho com humidade — não certeza.',
      tensao:
        'A Astrologia pode gerar espiritualidade de escape — Neptuno na Casa 12 com tendência a fugir do mundo em vez de habitar melhor. Outras tradições podem ser tão terra-a-terra que negam a dimensão espiritual. O ponto: a Casa 12 é o mar profundo — não para se afogar, mas para mergulhar e voltar com pérolas.',
      evitar:
        'Evite espiritualidade de fuga: "não preciso de nada material, sou muito espiritual". Evite também espiritualidade de muleta: usar Neptuno para fugir de responsabilidades concretas. A espiritualidade autêntica sustenta a vida, não a substitui.',
      pratica:
        'Hoje, 10 minutos de silêncio com a pergunta: "O que é meu e o que é do mar?" Não precisa responder — só permitir que a água se estabeleça. A distinção costuma aparecer depois, quando o corpo está em repouso.',
    },
  },
  odu: {
    paz: {
      frase:
        'A paz não vem de fora — vem de fazer o ewbá com o que o seu Ori já sabe. O ancestral em você já conhece o caminho. O Odu só revela o que você tem evitado ouvir.',
      explicacao:
        'No Ifá, ewbá é a oferenda de alinhamento — não um sacrifício para os deuses, mas uma reconciliação consigo mesmo. O Ori é a sua cabeça, o seu destino, o ancestral que vive em você antes de você nascer. Cada Odu carrega a sabedoria acumulada de todas as vezes que ele foi consultado para alguém como você — e a mensagem é sempre a mesma: pare de perguntar ao mundo o que só a sua cabeça sabe. O Ifá não convence — lembra. Você já sabe qual é o caminho. O Odu fala para acordar o que está dormindo em você, não para ensinar algo novo. A paz acontece quando você para de resistir ao que o Ori já disse e faz a oferenda: não de dinheiro ou objetos, mas de atenção, de escolha, de presença com o que você sabe ser verdade.',
      convergencia:
        'O Número de Vida diz: o número que você carrega aponta para o centro. O Movimento Celeste diz: os astros mostram onde está o assento. A Ancestralidade diz: o Ori já falou — escute. Todas apontam para o mesmo: a resposta está dentro, não fora. A diferença é o vocabulário. O Odu é o mais direto: o ancestral não mente, não interpreta, não的主流 — apenas diz o que é. Quando você faz ewbá com o Ori, está fazendo paz com séculos de sabedoria que falam através de você.',
      tensao:
        'O Ifá pode gerar dependência do babalawo (sacerdote) — se o Odu disse, então eu faço. O que é o mesmo mecanismo de terceirizar a própria intuição para outro sistema. O Ori é pessoal — o que o Odu diz para você pode ser diferente do que diz para alguém com o mesmo Odu, porque o Ori de cada pessoa é único. Seguir cegamente sem perguntar ao próprio Ori é trocar uma autoridade externa por outra.',
      evitar:
        'Evite consultar o Odu para evitar a responsabilidade da decisão. O Odu revela o mapa — você ainda precisa andar o caminho. Evite também usar o Odu para justificar decisões que o ego já tomou.',
      pratica:
        'Hoje, em silêncio, pergunte ao seu Ori: "O que eu já sei que estou evitando?" Ouça a primeira resposta que vem — não a mais racional, a mais visceral.',
    },
    saude: {
      frase:
        'A saúde vem de ouvir o que o corpo manifesta do que o ancestral não consegue dizer. O Odu revela: illness is the conversation your Ori has been trying to have with you through the language of flesh.',
      explicacao:
        'Na tradição Yoruba, ogbin são as ervas — a primeira farmácia, a medicina que cresce da terra e carrega a memória dos orishas. O corpo físico é habitado não só pela sua consciência, mas pela consciência dos ancestrais que caminham através do seu sangue. Quando o Ori precisa comunicar algo que a mente não consegue processar — uma verdade sobre o que você está fazendo, com quem você está, onde você está — o corpo responde com sintomas. Não é castigo, não é falha moral. É o Ori falando a única língua que você não pode ignorar: a dor, o inchaço, a insônia, a fadiga. O Odu que rege a sua saúde revela que tipo de conversa o seu Ori está tentando ter. Alguns Odu carregam tendência a doenças do fogo (inflamação,anger); outros a doenças da água (retenção, tristeza). Conhecer o seu Odu é saber qual conversa o seu corpo está tentando iniciar.',
      convergencia:
        'O Número de Vida associa números a órgãos e sistemas — o 7 ao sistema nervoso, o 9 ao sistema emocional. O Movimento Celeste associa signos a predisposições físicas — Touro à garganta, Escorpião aos órgãos reprodutivos. A Ancestralidade vai mais fundo: o corpo não é só predisposição, é canal. O Ori manifesta através do corpo o que não consegue dizer de outra forma. Saúde não é ausência de sintoma — é comunicação ouvida.',
      tensao:
        'O Ifá pode gerar medicalização espiritual: "estou doente porque o Odu quer me ensinar algo" — o que serve como desculpa para não ir ao médico. Ou o inverso: achar que doença é só problema físico e ignorar a mensagem do Ori. O ponto: o corpo é o ponto de encontro entre o ancestral e o presente. Não negue nem um nem outro.',
      evitar:
        'Evite usar o Odu para diagnósticos médicos. O Odu não substitui o clínico — ele complementa com a dimensão que o clínico não vê: a ancestral. Vá ao médico E ouça o que o sintoma está dizendo sobre a sua relação com o Ori.',
      pratica:
        'Hoje, observe uma tensão ou dor no corpo. Pergunte ao Ori: "Há quanto tempo isso está aqui? O que eu estava fazendo ou deixando de fazer quando começou?" A resposta costuma vir rápido.',
    },
    relacoes: {
      frase:
        'No Ifá, algumas pessoas vêm para fazer o seu ewbá — outras vêm para testar se você vai abandonar o Ori por elas. O Odu revela quem é quem, antes que o relacionamento cueste tudo.',
      explicacao:
        'Akú é a voz que desperta os mortos na tradição Yoruba — o som, a frequência, o chamado que atravessa a fronteira entre o mundo dos vivos e o dos que já partiram. Nas relações, akú é o parceiro que ressoa com o caminho do seu Ori — não aquele que completa o que falta, mas aquele que reconhece a geometria que você já é. O Ifá ensina que há dois tipos de encontro: o que vem para somar ao seu ewbá (oferecimento, alinhamento) e o que vem para testar se você vai trocar o Ori por ele. A diferença não é óbvia no início — é por isso que o Odu existe. O Odu que rege a sua relação mostra se esse encontro é para a construção do Tikkun (correção cósmica) ou para uma lição que só pode ser aprendida com dor. Alguns Odu indicam parceiros de vida; outros indicam parcerias de passagem. Reconhecer a diferença antes de investir anos no caminho errado é a sabedoria do Ifá.',
      convergencia:
        'O Número de Vida indica quem vibra no seu número — резонанс (ressonância). O Movimento Celeste indica qual signo atrai pelo Sol — magnetismo. A Ancestralidade diz: akú é o chamado que ressoa no Ori. Quando o parceiro ressoa com o Ori, há sinal — não só atração, mas reconhecimento. Você sabe quando é akú: sente que essa pessoa sempre esteve presente, mesmo antes de conhecê-la.',
      tensao:
        'O Ifá pode gerar expectativas elevadas: "se não é parceiro de ewbá, não serve" — o que é uma forma sofisticada de fuga da relação real. Parceiros de ewbá são raros e exigem dois Ori desenvolvidos — não é para todos os Odu. O Ifá também pode romantizar a dor: "sofrer é parte do teste" — o que serve como desculpa para ficar em relações destrutivas. Teste não é masoquismo.',
      evitar:
        'Evite usar o Odu para justificar sair de relações difíceis ou para ficar em relações que já morreram. Use o Odu para entender o padrão: por que você atrai esse tipo? O que o seu Ori está pedindo que você aprenda sobre si mesmo através do outro?',
      pratica:
        'Pergunte ao Ori sobre uma relação importante: "Essa pessoa veio para o meu ewbá ou para me testar?" A primeira resposta visceral é a resposta do Ori, não a resposta da mente.',
    },
    dinheiro: {
      frase:
        'Owo é riqueza como energia circulante — não quanto você acumula, mas quanto flui quando o Ori está no comando. Plante o que o orí-inu manda, colha o que plantar, e o dinheiro virá.',
      explicacao:
        'Na teaching do Ifá, owo é muito mais do que dinheiro — é energia vital em movimento, a força que sustenta a vida e permite que o ewbá seja feito. O orí-inu é a cabeça interna, a intuição profunda que sabe o que plantar e o que colher. Iwé são as plantações — a metáfora para onde você investe sua energia, seu tempo, sua atenção. Quando o Ori está no comando (orí-inu consciente), owo flui naturalmente: você investe no que dá retorno, trabaja no que sustenta, e o dinheiro vem como consequência do alinhamento. Quando o ego (fins materiais sem relação com o Ori) está no comando, owo entra mas não fica: ou é gasto em ansiedades, ou investido em projetos que não ressoam com o Ori, ou o trabalho que paga bem cobra um preço que o Ori não aceita (desgaste, mentira, abandono de si). A abundância no Ifá não é riqueza — é fluxo. Quanto mais owo circula, mais o Ori pode fazer o ewbá. Acumular sem propósito é estagnar o fluxo.',
      convergencia:
        'O Número de Vida diz: dinheiro segue missão, não o contrário. O Movimento Celeste diz: Júpiter expande onde há abertura, Saturno limita onde há resistência. A Ancestralidade diz: owo flui quando o orí-inu comanda. Todas indicam o mesmo: recursos vêm de alinhamento. A diferença do Ifá é a metáfora agrícola — você planta o que o Ori manda, não o que o mercado pede.',
      tensao:
        'O Ifá pode gerar passividade: "se o Ori quer, o dinheiro vem" — o que é espiritualização de preguiça. Owo precisa circular — é preciso agir, plantar, colher. O Ifá também pode gerar medo de agir: "e se plantar no lugar errado?" — o que paralisa. O orí-inu não comanda se você não ouvir. E ouvir exige ação.',
      evitar:
        'Evite acumular owo sem propósito ou gastar owo sem alinhamento. Ambos são formas de desrespeitar o fluxo. Owo acumulado sem propósito apodrece; owo gasto sem alinhamento esvazia.',
      pratica:
        'Revise as últimas 3 decisões financeiras. Em cada uma, pergunte ao Ori: "Isso foi orí-inu ou ego?" Se foi ego, pergunte: "O que o orí-inu diria que eu deveria ter feito?"',
    },
    trabalho: {
      frase:
        'Oogun é o deus do trabalho, da medicina e da arma — cortado e construído ao mesmo tempo. O seu trabalho é o seu oogun: a coisa que corta o mundo e edifica ao mesmo tempo. O Odu revela a sua assinatura.',
      explicacao:
        'Na tradição Yoruba, Oogun é o orisha que domina o ferro — a ferramenta que permite a agricultura, a medicina que cura, a arma que defende. Oogun é trabalho: a força que transforma o mundo usando instrumentos. O seu trabalho no mundo é o seu oogun pessoal — a coisa que você faz que corta o que precisa ser cortado (obstáculos, ineficiência, ignorância) e constrói o que precisa ser construído (sustento, legado, contribuição). Cada Odu carrega uma assinatura de oogun diferente: alguns Odu indicam trabalho de cura (ogbin, medicina); outros indicam trabalho de cortado (advocacia, cirurgia, engenharia); outros indicam trabalho de construir (arquitetura, agricultura, educação). Oogun sem trabalho fica ocioso — e o Ogun ocioso é perigoso. O trabalho não é só sustento — é oferenda. Quando você trabalha a partir do oogun do seu Odu, está fazendo ewbá todos os dias sem saber.',
      convergencia:
        'O Número de Vida diz: trabalho ideal é onde o número é indispensável, não intercambiável. O Movimento Celeste diz: Meio do Céu + Sol alinhados = propósito profissional. A Ancestralidade diz: oogun é a assinatura do Ori no mundo físico. Quando o seu trabalho é oogun — cortado e construção — não é emprego, é ofício sagrado.',
      tensao:
        'O Ifá pode gerar在工作 (em chinês: "no trabalho") como identidade: "eu sou o meu trabalho" — o que é oogun sem Ori. O Odu comanda oogun, não o contrário. Oogun é ferramenta; o Ori é o目的 (mubiao — propósito). Quando oogun vira identidade, você perde o centro. O trabalho continua, mas sem alma.',
      evitar:
        'Evite definir o seu valor pelo oogun. Você não é o que você faz — você é quem comanda o que você faz. Evite também o trabalho que só corta (destruição sem construção) ou só constrói (ilusão sem ação).',
      pratica:
        'Liste as últimas 5 tarefas em que você entrou em flow. Pergunte ao Ori: "Dessas 5, qual é o meu oogun?" A resposta tende a ser visceral — uma sensação de "isso sou eu" misturada com "isso corta e constrói ao mesmo tempo."',
    },
    proposito: {
      frase:
        'Ípínlà é o destino — o Odu que foi lançado na hora do seu nascimento diz a história que o seu Ori veio viver. Não é o que você pensa, não é o que você quer. É o que o Ori sabe de antes de você nascer.',
      explicacao:
        'Ípínlà é a palavra Yoruba para destino — não como фиксированная (fixada, predeterminada), mas como направление (direção, propósito). O Ifá ensina que quando você nasce, o Ori traz consigo uma história para viver — não um roteiro escrito, mas um arco de aprendizado. Alguns Odu indicam um arco de liderança — ípínlà de comandar; outros indicam um arco de cura — ípínlà de restaurar; outros indicam um arco de ensinamento — ípínlà de transmitir. O propósito no Ifá não é uma carreira — é uma qualidade de presença. O 3 que vive o propósito ensina com a própria existência; o 7 que vive o propósito investiga com a própria vida; o 9 que vive o propósito solta com a própria morte. O Odu que rege a sua vida mostra se o seu ípínlà está sendo vivido ou adiado. A maioria das pessoas não está em paz porque está vivendo o propósito de outros — o dos pais, o do mercado, o do status — não o do Ori.',
      convergencia:
        'O Número de Vida diz: o número é a nota musical no acorde da criação. O Movimento Celeste diz: Nodo Norte é a direção da alma. A Ancestralidade diz: ípínlà é o arco que o Ori veio percorrer. Todas indicam o mesmo: propósito já existe. A diferença é que no Ifá, você não descobre — você lembra. O Ori já sabe. A pergunta é: você vai viver ou vai adiar?',
      tensao:
        'O Ifá pode gerar determinismo: "se o Odu disse isso, então eu sou assim e não posso mudar" — o que é prisão. O Odu indica a direção do arco, não os pontos fixos. Você pode sair do arco e pode voltar. Sair cobra preço; voltar é ewbá. O Ifá também pode gerar inação: "se é propósito, vem sozinho" — o que é desculpa para não agir.',
      evitar:
        'Evite usar o Odu como desculpa para não agir ou como profecia rígida. O Odu mostra a direção; você faz o caminho. Evite também esperar o momento certo — o momento certo é quando o Ori decide, e o Ori decide quando você para de adiar.',
      pratica:
        'Pergunte ao Ori: "Se eu não tivesse medo, qual seria a única coisa que eu faria na vida?" A resposta vem do ípínlà, não do ego. Anote. Depois pergunte: "E qual é o primeiro passo, mesmo pequeno, que eu posso dar hoje?"',
    },
    criatividade: {
      frase:
        'Órisun é a fonte, a origem — o ancestral que cria através de você. A Musa é o Ori comunicando-se através das suas mãos. Criar é canalizar o que quer existir pelo seu Odu.',
      explicacao:
        'Órisun na tradição Yoruba é a nascente — o ponto de origem onde a água brota da terra. Na creatividad, órisun é o ponto de origem da criação que acontece através de você. O Ifá ensina que quando você cria, não está se expressando — está canalizando o que quer existir pelo seu Odu. A Musa não é uma entidade externa: é o Ori falando através das suas mãos, da sua voz, dos seus olhos. Cada Odu tem uma relação diferente com órisun: alguns Odu criam com as mãos (artesanato, música, pintura); outros com a palavra (poesia, ensino, narrativa); outros com a análise (ciência, filosofia, investigação). O que distingue criação de produção é órisun: produção vem do ego; criação vem do ancestral. Quando você cria a partir do Ori, a obra carrega algo que você não sabe explicar — e é isso que faz o outro parar, sentir, reconhecer. Criação é comunicação ancestral. O que o seu Ori sabe e não consegue dizer com palavras, ele diz através da obra.',
      convergencia:
        'O Número de Vida diz: crie a partir da sua nota musical, não da referência externa. O Movimento Celeste diz: use o Sol, não o Ascendente — a criação vem do núcleo, não da máscara. A Ancestralidade diz: órisun é o Ori criando pelo seu corpo. Todas indicam o mesmo: criação é dentro para fora, não fora para dentro.',
      tensao:
        'O Ifá pode gerar bloqueios criativos: "se não é do meu Odu, não devo criar" — o que é redução da expressão. Todos os Odu criam — a diferença é o meio. O Ifá também pode romantizar a criação como dom incontrolável: "eu crio quando o Ori quer" — o que é desculpa para não fazer o trabalho. O Ori dá a fonte; o corpo faz o trabalho de canalizá-la.',
      evitar:
        'Evite esperar a inspiração perfeita para criar. O Ori não espera — ele flui quando há um receptáculo pronto. Prepare o receptáculo: trabalho, consistência, presença. A inspiração vem no processo, não antes.',
      pratica:
        'Crie algo hoje a partir do seu Odu — não de uma referência externa. Pode ser uma frase, um desenho, uma melodia. 5 minutos, sem editar. Pergunte ao Ori: "O que quer existir pelo meu Odu hoje?" E deixe vir.',
    },
    espiritualidade: {
      frase:
        'Os orishas que orbitam o seu Odu formam a corrente iniciática — do babalawo mais antigo até quem lê este mapa agora. Espiritualidade é relação com os mortos que te amam.',
      explicacao:
        'No Ifá, espiritualidade não é crença — é relação. A corrente iniciática é literal: o babalawo que consultou o Odu para o seu ancestral, que aprendeu com o babalawo anterior, que aprendeu com o anterior, em uma linha que não foi quebrada por séculos. Essa corrente é o que dá poder ao Ifá — não as palavras sozinhas, mas a corrente que as carrega. Quando você faz ewbá, está se colocando nessa corrente — está reconhecendo que não chegou até aqui sozinho, que há uma linhagem de pessoas que viveram antes de você, que passaram pelas mesmas perguntas, e que deixaram respostas encoded nos Odu. Espiritualidade no Ifá é ancestralidade em vida: não você acreditando em algo, mas você se relacionando com os que vieram antes. Eles não estão em um céu distante — estão no seu sangue, nos seus gestos, nas suas intuições que você não sabe de onde vêm. A prática espiritual do Ifá é simples: lembre-se dos seus mortos com reverência e faça o ewbá com o que eles sabem e você ainda não ouviu.',
      convergencia:
        'O Número de Vida diz: prática espiritual é a SUA oração — personalizada ao número. O Movimento Celeste diz: mude a prática com o trânsito. A Ancestralidade diz: a prática mais alta é a relação com a corrente. Todas apontam para algo vivo, adaptativo, pessoal. A diferença do Ifá é que a relação é com os que já viveram — não com uma abstração, mas com pessoas que amaram, erraram, e deixaram um mapa.',
      tensao:
        'O Ifá pode gerar dependência da corrente: "se não tenho babalawo, não tenho acesso" — o que é terceirização. A corrente está no seu sangue, não só no sacerdote. O Odu que rege a sua espiritualidade mostra se você precisa de mediação externa ou se o seu Ori já tem acesso direto. Alguns Odu pedem babalawo; outros são de acesso direto ao Ori. A diferença é o Odu, não a fé.',
      evitar:
        'Evite espiritualidade como performance ou como mercantilização. O Ifá não se vende — ele se recebe. Evite também negação da corrente: "eu não preciso de ancestrais, eu sou autônomo" — o que é negação de uma dimensão real. A corrente existe quer você a reconheça ou não.',
      pratica:
        'Hoje, em silêncio, pergunte ao seu Ori: "O que eu já sei que estou evitando?" Ouça a primeira resposta que vem — não a mais racional, a mais visceral.',
    },
  },
  iching: {
    paz: {
      frase:
        'Você não está fora do hexagrama. Cada momento da sua vida é uma linha que se move dentro de um arquétipo — o desafio é saber QUAL é esse hexagrama e o que ele pede de você agora.',
      explicacao:
        'O I Ching ensina que não existe ausência de hexagrama — você está sempre dentro de um. A paz não é um estado fora do tempo; é saber em que linha do hexagrama você está e o que essa linha pede. O hexagrama 11 (Tai — Paz) não é inércia: é heaven abaixo de earth acima, os dois em comunicação perfeita. Quando o céu e a terra se tocam, tudo cresce. Para você, isso significa: paz não é parar — é alinhar o que está em cima (visão, propósito, consciência) com o que está embaixo (corpo, chão, realidade concreta). Se a visão flutua sem corpo, há ansiedade disfarçada de espiritualidade. Se o corpo se move sem visão, há agitação disfarçada de produtividade. Paz é os dois se encontrando.',
      convergencia:
        'O Número de Vida diz: paz é coerência entre o que você faz e o que o seu número pede. O Movimento Celeste diz: paz é alinhar o Sol e a Lua dentro de você. O Corpo & Energia diz: paz é o corpo 8 (prana) fluindo sem bloqueio. A Ancestralidade diz: paz é cumprir o que o Odu pediu no momento do seu nascimento. Todas as tradições apontam para a mesma verdade: paz não é ausência — é presença coerente. O que muda é o nome do ponto de alinhamento.',
      tensao:
        'O I Ching pode gerar uma leitura determinista — "estou no hexagrama X, então só posso fazer o que ele pede". Isso é prisão. Os hexagramas são mapas, não sentença. Você está dentro do hexagrama E tem livre-arbítrio dentro dele. A tensão é entre usar o hexagrama como bússola (que orienta) e usá-lo como GPS (que comanda). Bússola aponta; você decide o passo.',
      evitar:
        'Evite consultar o I Ching para evitar decidir. O oráculo responde a perguntas — não fabrica perguntas no lugar de quem pergunta. Se você não sabe que pergunta fazer, o hexagrama vai dizer isso antes de dizer qualquer coisa útil.',
      pratica:
        'Lance ou pense em um hexagrama do momento. Identifique: qual linha está ativa em você agora — a que sobe ou a que desce? Faça UM ato que honre a direção dessa linha.',
    },
    saude: {
      frase:
        'Hexagrama 27 (Yi — Alimentar o Self) diz: você é o que alimenta. Não confunda o que llena com o que nutre. A boca abre e fecha — o que ENTRA define o que você é.',
      explicacao:
        'O hexagrama 27 (Yi) tem no centro o trigrama da montanha sobre o trigrama do trovão — movimento contido. A imagem é a boca: o orifício pelo qual o mundo entra e define o corpo. O I Ching não fala de nutrição no sentido restrito da palavra — fala de autocuidado como prática sagrada. Alimentar o self não é só comer: é colocar no corpo o que o mantém vivo, no sentido mais amplo. Isso inclui o que você assiste, o que ouve, com quem passa tempo, o que repete na mente. O corpo manifesta o que foi alimentado. Se você foi alimentado com medo, o corpo responde com tensão. Se foi alimentado com presença, o corpo responde com fluidez. A pergunta do hexagrama 27 é simples e devastadora: o que você tem posto na sua boca nos últimos dias — literal e simbolicamente?',
      convergencia:
        'O Número de Vida diz: cada número tem um orgão ou sistema que precisa de atenção. O Movimento Celeste diz: o signo comanda ritmos — ignore o ritmo e o corpo cobra. O Corpo & Energia diz: o corpo 8 (prana) alimenta o físico. A Ancestralidade diz: o Odu comanda o corpo. Todas apontam: saúde não é conformidade com um padrão externo — é coerência entre o que entra e o que precisa ser construido.',
      tensao:
        'O I Ching pode gerar obsessão com regras de alimentação — "o hexagrama pede isso, então não posso comer aquilo". O hexagrama 27 pede consciência, não proibicão. O risco é trocar a inteligência do corpo presente por uma lista de regras externas. O corpo de agora é quem melhor sabe o que precisa — escute antes de consultar qualquer tradição.',
      evitar:
        'Evite diagnósticos de saúde pelo hexagrama sem ouvir o corpo atual. O oráculo orienta; o corpo decide. Evite também culpabilizar o corpo por doenças que são sistêmicas — nem tudo é questão de alimentação individual.',
      pratica:
        'Hoje, antes de comer algo, pergunte: isso me alimenta ou só me llena? Depois, observe como o corpo responde 30 minutos depois. Sem julgamento — só dado.',
    },
    relacoes: {
      frase:
        'Hexagrama 31 (Xian — Atração) mostra dois seres que se influenciam sem se dissolver. Relação não é fusão — é proximidade deliberada entre dois centros. O hexagrama tem lake sobre mountain: influência que eleva.',
      explicacao:
        'O hexagrama 31 (Xian) é lake sobre mountain — a água que está acima da montanha influencia o que está abaixo sem invadir. A imagem é de sedução sagrada: dois seres que se atraem e, ao se aproximarem, se transformam mutuamente. O I Ching ensina que relação autêntica não é dois em um — nem dois separados que não se tocam. É um campo magnético entre dois centros que mantêm sua integridade enquanto se influenciam. Isso exige algo difícil: saber onde você termina e onde o outro começa. Muitas relações falham não por falta de amor, mas por confusão de fronteiras — um invade o campo do outro e ambos se perdem. O trabalho com o hexagrama 31 é: mantenha seu centro, permita a influência, não permita a invasão. Atração sem invasão é o ensinamento.',
      convergencia:
        'O Número de Vida diz: atraia quem vibra no seu número, não quem completa o que falta. O Movimento Celeste diz: Sol e Lua em aspecto criam magnetismo. O Corpo & Energia diz: relacione-se do corpo central, não do corpo que sente falta. A Ancestralidade diz: o Odu comanda o padrão de relação. Todas indicam: relação saudável é entre dois inteiros que escolhem se aproximar — não dois meios que se fundem.',
      tensao:
        'O I Ching pode romantizar a atração — "se é hexagrama 31, a relação é magna". Não existe hexagrama fácil — existe hexagrama consciente. O 31 mostra a possibilidade de influência elevada; não garante que será elevada. O risco é confundir o mapa com o território: estar em um hexagrama de atração não significa que a relação está funcionando.',
      evitar:
        'Evite sair de relações que funcionam por achar que falta "magia do hexagrama". Evite também ficar em relações destrutivas por achar que "o hexagrama pede para permanecer". O hexagrama orienta; você decide.',
      pratica:
        'Na próxima interação com alguém próximo, notice: você está influenciando ou invadindo? Escute mais do que fala. Observe o hexagrama que se forma entre vocês.',
    },
    dinheiro: {
      frase:
        'Hexagrama 48 (Jing — O Poço): a água subterrânea que serve a todos sem se esgotar. Recursos não são o que você guarda — são o que você distribui e o que volta. O balde precisa ser baixado.',
      explicacao:
        'O hexagrama 48 (Jing — O Poço) é água sobre montanha — a água subterrânea que alimenta todos que dela se aproximam. A imagem do poço é precisa: o poço não se esgota porque a água subterrânea o repõe constantemente. Mas para acessar a água, é preciso baixar o balde. Isso significa: recursos não vêm por acumulação — vêm por fluxo. Quanto mais você distribui (não desperdiça, distribui), mais o poço se repõe. A abundância no I Ching não é quanto você guarda — é quanto flui através de você. O poço seco é aquele que só recebe e não distribui. A água estagnada é a mesma que não flui. Dinheiro é água — tem qualidade, tem fluxo, tem nível. Pergunte: o seu poço está cheio ou seco? E mais importante: você está baixando o balde ou só olhando de longe?',
      convergencia:
        'O Número de Vida diz: dinheiro segue missão, não o contrário. O Movimento Celeste diz: Júpiter expande, Saturno limita — leia o mapa. O Corpo & Energia diz: o corpo 8 (prana) sustenta a capacidade de gerar. A Ancestralidade diz: o Odu pede certos investimentos e veda outros. Todas apontam: abundância é alinhamento — primeiro o fluxo interno, depois os recursos externos.',
      tensao:
        'O I Ching pode gerar passividade: "se o poço existe, o dinheiro virá". Não — é preciso baixar o balde. A água está lá, mas sem ação concreta ela não sobe. O risco é trocar trabalho por wishful thinking — usar "fluxo" como desculpa para não fazer o que precisa ser feito.',
      evitar:
        'Evite tanto a acumulação do poço seco quanto o desperdício do balde furado. Abaixe o balde com intenção, distribua com consciência, e deixe o poço fazer o trabalho de reposição.',
      pratica:
        'Hoje, faça uma transferência, pagamento ou investimento que distribua um recurso. Não precisa ser grande — precisa fluir. Observe o que acontece no fluxo nos próximos dias.',
    },
    trabalho: {
      frase:
        'Hexagrama 50 (Ding — O Caldeirão): o que você coloca dentro é transformado pelo fogo que está embaixo. Trabalho é alquimia — escolha o que coloca com o mesmo cuidado com que escolhe o fogo.',
      explicacao:
        'O hexagrama 50 (Ding — O Caldeirão) é fogo sobre vento — a transformação que acontece dentro do caldeirão sob o efeito do calor. O I Ching não fala de trabalho como emprego — fala de ofício como prática de transmutação. O que você coloca dentro do caldeirão é transformado pelo fogo que está embaixo — e o que sai é diferente do que entrou. Isso significa: o trabalho que não transforma nada em você é trabalho vazio, mesmo que o salário seja alto. O trabalho significativo é aquele onde você coloca matéria-prima (você, suas habilidades, sua atenção) e o fogo (o desafio, a dificuldade, a precisão) transforma isso em algo novo. O caldeirão só funciona se o fogo estiver na intensidade certa — nem apagado, nem excessivo. Pergunte: o que sai do seu caldeirão de trabalho que não entrou antes?',
      convergencia:
        'O Número de Vida diz: trabalho ideal é onde o número é indispensável. O Movimento Celeste diz: o Meio do Céu (MC) é a vocação — alinhe. O Corpo & Energia diz: corpo 10 (radiante) a serviço do corpo 11 (visão). A Ancestralidade diz: o Odu comanda o trabalho e o modo de realizá-lo. Todas apontam: trabalho significativo é onde você se transforma ao transformá-lo — não é só execução, é alquimia.',
      tensao:
        'O I Ching pode gerar idealização do trabalho: "preciso do hexagrama certo para decidir". Não existe hexagrama perfeito para trabalho — existe hexagrama consciente. O caldeirão funciona com qualquer matéria se o fogo estiver certo. O risco é esperar o trabalho "ideal" em vez de colocar qualquer matéria e ajustar o fogo.',
      evitar:
        'Evite trabalho que só extrai sem devolver — que só consome você sem nada de volta. O caldeirão que só perde material para o fogo sem nada cozinhar é um caldeirão quebrado.',
      pratica:
        'Revise a última semana de trabalho: o que colocou dentro (você, suas horas, sua atenção) e o que saiu (resultado, aprendizado, impacto)? Se só saiu sem entrar, o caldeirão está em desequilíbrio.',
    },
    proposito: {
      frase:
        'Hexagrama 55 (Feng — Abundância): trovão e relâmpago dentro — a expansão que acontece quando tudo se alinha. Propósito não é planejado — é reconhecido quando chega. Está na sua vida agora, mas você ainda não viu.',
      explicacao:
        'O hexagrama 55 (Feng — Abundância) é trovão duplo sob relâmpago — a energia que se expande em todas as direções ao mesmo tempo. A imagem é de maturidade total: o momento em que tudo que foi plantado e cultivado finalmente dá fruto ao mesmo tempo. O I Ching ensina que propósito não é uma carreira ou um destino — é uma qualidade de presença que irradia quando você para de forçar. Abundância não é quanto você tem; é quanto irradia. O hexagrama 55 não é um mapa de caminho — é o mapa do momento em que o caminho se torna visível porque você já percorreu o suficiente para vê-lo inteiro. O propósito está sempre presente — a questão é se você está no hexagrama 55 (expansão, reconhecimento) ou em outro hexagrama (construção, espera, investigação). Se você está no hexagrama 55 agora, reconheça. Se não está, pergunte: que hexagrama estou habitando — e o que ele pede?',
      convergencia:
        'O Número de Vida diz: propósito é o que você não consegue deixar de fazer quando está alinhado. O Movimento Celeste diz: o Nodo Norte marca a direção da alma. O Corpo & Energia diz: o corpo 1 (alma) é o centro de onde tudo parte. A Ancestralidade diz: o Odu natal carrega o tema da vida inteira. Todas apontam para a mesma verdade incômoda: propósito não é achado — é reconhecido quando você finalmente para de fugir dele.',
      tensao:
        'O I Ching pode gerar espera passiva do hexagrama 55: "quando eu estiver no hexagrama 55, vou saber meu propósito". Não — o hexagrama 55 é resultado, não método. Você chega nele pelo hexagrama que está agora, qualquer que seja. O risco é esperar a expansão em vez de fazer o trabalho de construção que precede toda expansão.',
      evitar:
        'Evite transformar propósito em obsessão futura — "eu vou descobrir meu propósito". Pergunte: o que o hexagrama atual pede de mim? Propósito se revela no presente, não no futuro.',
      pratica:
        'Lance um hexagrama do momento. Leia o hexagrama nuclear (o que o hexagrama se torna quando plenamente realizado). O que isso diz sobre o tema que está se expandindo na sua vida agora?',
    },
    criatividade: {
      frase:
        'Hexagrama 17 (Sui — Seguir): lake sobre trovão — a certeza interior que segue seu caminho mesmo quando o mundo faz barulho. Crie de dentro para fora, não do hexagrama para fora.',
      explicacao:
        'O hexagrama 17 (Sui — Seguir, com hexagrama nuclear 1 — Criação/ Qián) é lake sobre trovão — o som interior que permanece quando o trovão passou. A imagem é de constância: a água do lago que, mesmo quando o trovão abala o mundo acima, mantém sua superfície calma e clara. Criar a partir do hexagrama 17 significa: ter uma visão interna clara que não se abala pelo barulho externo. O hexagrama nuclear 1 (Criação) confirma: o que é criado de dentro para fora tem a qualidade do céu — puro, claro, forte. O que é criado do hexagrama para fora (imitando o que o oráculo diz que você deveria criar) tem a qualidade da terra — reação, eco, derivado. A criatividade autêntica no I Ching é seguir o que você já sabe interiormente, mesmo quando externalmente não há validação. Seguir não é obedecer — é manter a direção enquanto se move.',
      convergencia:
        'O Número de Vida diz: crie a partir do seu número, não da moda. O Movimento Celeste diz: use o Sol, não o Ascendente. O Corpo & Energia diz: o corpo 3 (mente positiva) começa e o corpo 6 (linha do arco) sustenta. A Ancestralidade diz: o Odu indica o modo de criação. Todas dizem: crie de dentro, sustente, termine.',
      tensao:
        'O I Ching pode gerar criação indecisa: "em que hexagrama eu devo criar?". A criatividade não espera o hexagrama perfeito — começa no hexagrama que está, com a matéria que tem. O hexagrama nuclear 1 (Criação) é fogo puro — se você esperar até ter certeza absoluta, nunca vai começar.',
      evitar:
        'Evite criar a partir do hexagrama que você acha que deveria estar em vez do hexagrama que está de fato. Evite também a paralisia criativa: "ainda não sei qual hexagrama sou". O hexagrama se revela na criação, não antes dela.',
      pratica:
        'Crie algo HOJE — qualquer coisa. Antes, leia o hexagrama nuclear do momento (não o hexagrama principal, mas o que ele se torna por dentro). Crie a partir dessa energia nuclear, não da imagem externa.',
    },
    espiritualidade: {
      frase:
        'Hexagrama 4 (Meng — Mentira/Engano da Juventude): água sob montanha — o aprendiz que está sob a montanha e ainda não sabe o que sabe. Espiritualidade é o que você aprende enquanto espera, não o que sabe desde o início.',
      explicacao:
        'O hexagrama 4 (Meng — Mentira, Engano da Juventude) é água sob montanha — a água que está sendo contida e precisa encontrar seu caminho. A imagem é de alguém jovem que está sob a montanha, ainda não vendo o vale inteiro, mas com a capacidade de aprender. O I Ching ensina que espiritualidade não começa com iluminação — começa com a honestidade de saber que você não sabe. O hexagrama 4 nuclear (hexagrama 25 — Incerteza/ Wu Wang) confirma: a espiritualidade autêntica vive na pergunta, não na resposta. A água sob a montanha ainda não encontrou a saída — mas está encontrando. Isso é espiritualidade: não a montanha já escalada, mas o movimento de procurar a passagem. Espiritualidade não é saber todas as respostas — é ter a humildade de não saber e a persistência de continuar procurando.',
      convergencia:
        'O Número de Vida diz: prática espiritual é a SUA oração — personalizada, coerente com o número. O Movimento Celeste diz: mude a prática com o trânsito — espiritualidade viva. O Corpo & Energia diz: a Mente Divina (corpo 11) é o canal, não o conteúdo. A Ancestralidade diz: o Odu indica o caminho espiritual específico. Todas indicam: espiritualidade é caminho, não chegada. O hexagrama 4 diz o mesmo com mais humildade: você está sob a montanha — e isso é um bom lugar para estar.',
      tensao:
        'O I Ching pode gerar espiritualidade de guru: "eu sei o hexagrama que você precisa". Isso é o inverso do hexagrama 4 — é colocar a montanha sobre a água em vez de deixar a água sob a montanha. O hexagrama 4 nuclear (25 — Incerteza) lembra: a única coisa que a espiritualidade séria tem a oferecer é mais perguntas, não mais certezas.',
      evitar:
        'Evite a espiritualidade que já sabe tudo. Evite também a espiritualidade que usa o oráculo como muleta — perguntando para cada decisão em vez de desenvolver a capacidade de decidir sozinho. O oráculo é água buscando a passagem — não a passagem já encontrada.',
      pratica:
        'Hoje, permita-se não saber algo que você acha que deveria saber. Em vez de consultar o oráculo, sente com a pergunta. A água sob a montanha encontra a passagem por persistência — não por consulta repetida.',
    },
  },
};

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
