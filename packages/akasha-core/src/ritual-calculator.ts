/**
 * @akasha/core — Ritual Calculator
 *
 * Calcula o código do dia e monta o ritual diário.
 * Usa timestamp para gerar código determinístico.
 */
import { PRACTICES as MOCK_PRACTICES } from '../../core-iching/src/practices';
import type { IntegrativePractice, HexagramWithWings } from '../../core-iching/src/types';
import { getQuizilasPorOdu } from '../../core-odus/src/calculos';
import { ODUS } from '../../core-odus/src/odus-constants';
import type { AkashaCode, LifeArea, CodeLevel } from './correlation-engine';
import { createCorrelationEngine } from './correlation-engine';
import type { RitualConfig, RitualResponse, Quizila, CodeOfDayResult } from './ritual-types';

// ─── Constantes de Áreas de Vida e Níveis ─────────────────────────────────────

const LIFE_AREAS: LifeArea[] = [
  'saude',
  'financas',
  'relacionamentos',
  'carreira',
  'espiritualidade',
  'familia',
  'criatividade',
];

const CODE_LEVELS: CodeLevel[] = ['shadow', 'gift', 'siddhi'];

// ─── Afirmações Mock (por hexagrama 1-64) ──────────────────────────────────────

const AFIRMACOES: Record<number, string> = {
  1: 'Eu sou a criação em movimento. O céu e a terra se encontram em mim.',
  2: 'Eu abraço a receptividade. A terra me sustenta em cada passo.',
  3: 'Eu supero os obstáculos com perseverança. A semente rompe a terra.',
  4: 'Eu alimento o que é jovem. A ignorância se transforma em sabedoria.',
  5: 'Eu espero com paciência. A chuva chega no tempo certo.',
  6: 'Eu conflito apenas quando necessário. A água sabe quando fluir.',
  7: 'Eu lidero com sabedoria. O exército segue com propósito.',
  8: 'Eu me uno aos outros na solidarity. A terra nos conecta.',
  9: 'Eu cultiv o pequeno poder. A风吹动轻柔 mas transforma.',
  10: 'Eu piso com cuidado. Cada passo carrega significado.',
  11: 'Eu prospero na paz. O céu e a terra se harmonizam.',
  12: 'Eu aceito o declínio temporário. A estagnação contém a semente do avanço.',
  13: 'Eu comunico com os outros. A luz do fogo nos une.',
  14: 'Eu possuo a grande abundância. A riqueza vem da generosidade.',
  15: 'Eu permaneço humilde. A modéstia é a base da virtude.',
  16: 'Eu uso a energia correta. O entusiasmo move o mundo.',
  17: 'Eu sigo com determinação. A mudança vem de dentro.',
  18: 'Eu corrijo o que está quebrado. A reparação traz paz.',
  19: 'Eu me aproximo com cautela. O avanço requer cuidado.',
  20: 'Eu observo e reflito. A contemplação revela verdades.',
  21: 'Eu mordo através dos obstáculos. A verdade atravessa a ilusão.',
  22: 'Eu embellheço com simplicidade. A graça está na essência.',
  23: 'Eu desfaço o que não serve. A destruição permite a renovação.',
  24: 'Eu retorno ao caminho. O novo ciclo começa em mim.',
  25: 'Eu sou sem artifícios. A verdade é minha natureza.',
  26: 'Eu conteno o grande. A paciência traz resultados.',
  27: 'Eu cuido da minha nutrição. O corpo é templo sagrado.',
  28: 'Eu ultrapasso o limite. A excesso carrega o poder da transformação.',
  29: 'Eu afundo e retorno. O poço me fortalece.',
  30: 'Eu brilho com claridade. O fogo ilumina sem queimar.',
  31: 'Eu atraio com influência sutil. O encanto abre portas.',
  32: 'Eu durmo e acordo em rhythm. A constância traz paz.',
  33: 'Eu me retiro com sabedoria. A retirada estratégica preserva.',
  34: 'Eu possuo grande poder. A força está no propósito.',
  35: 'Eu avan ço com transparência. A luz revela o caminho.',
  36: 'Eu escondo minha luz quando necessário. A sabedoria exige paciência.',
  37: 'Eu vivo em harmonia com minha família. O lar é refúgio.',
  38: 'Eu me opus aos outros com tolerance. A diferença enriquece.',
  39: 'Eu encontro o caminho bloqueado. A adversidade fortalece.',
  40: 'Eu resolvo obstáculos com grace. A libertação vem da ação.',
  41: 'Eu diminuo o excesso. A simplicidade traz clareza.',
  42: 'Eu aumento o que é essencial. O crescimento é natural.',
  43: 'Eu quebro a resistência. A determinação vence.',
  44: 'Eu encontro o novo com apertura. O inesperado traz bênçãos.',
  45: 'Eu reúno com propósito. A união gera força.',
  46: 'Eu ascendo com persistência. O progresso é inevitável.',
  47: 'Eu suporto a exhaustion. A dificuldade fortalece a alma.',
  48: 'Eu bebo da fonte. A sabedoria é profundidade infinita.',
  49: 'Eu mudo minha natureza. A transformação é poder.',
  50: 'Eu alimento o sagrado. O caldeirão transborda bênçãos.',
  51: 'Eu desperto com trovão. O trovão sacode mas não destrói.',
  52: 'Eu medito em silêncio. a montanha permanece inabalável.',
  53: 'Eu desenvolvo gradualmente. O progresso vem da constância.',
  54: 'Eu honro a energia jovem. O casamento carrega promessa.',
  55: 'Eu encontro abundância. O relâmpago ilumina a abundância.',
  56: 'Eu viajo com sabedoria. O estrangeiro ensina lições valiosas.',
  57: 'Eu penetro suavemente. O vento move sem força.',
  58: 'Eu descanso em paz. A alegria vem da serenidade.',
  59: 'Eu dissolvo os bloqueios. A água lava com compaixão.',
  60: 'Eu limites com equilíbrio. A moderação é virtude.',
  61: 'Eu silencio a mente. A paz interior é poder.',
  62: 'Eu pequeno mas completo. A detalhe carrega significado.',
  63: 'Eu completo com clareza. O fim iluminado revela o caminho.',
  64: 'Eu termino um ciclo. A conclusão traz paz.',
};

// ─── Orações Mock (por hexagrama 1-64) ────────────────────────────────────────

const ORACOES: Record<number, string> = {
  1: 'Criador de tudo, que teu impulso inicial guia meus passos hoje.',
  2: 'Mãe Terra, recebe minha oferenda e sustenta minha jornada.',
  3: 'Guia dos campos de batalha, fortalece minha perseverança.',
  4: 'Nutridor da vida, alimenta minha sede de sabedoria.',
  5: 'Senhor das águas, concede-me a paciência de esperar o tempo certo.',
  6: 'Mestre dos conflitos, ensina-me quando lutar e quando fluir.',
  7: 'General divino, guia minha liderança com sabedoria.',
  8: 'Terra sagrada, une-me aos que caminham comigo.',
  9: 'Força sutil, ajuda-me a cultivar o que é pequeno mas verdadeiro.',
  10: 'Caminhante do limiar, ilumina meus passos com atenção sagrada.',
  11: 'Harmonia celestial, que a paz floresça em minha vida.',
  12: 'Momento de sombra, ensina-me que a escuridão também é Lehrer.',
  13: 'Povo do fogo, une-nos na luz da compreensão.',
  14: 'Senhor da abundância, abre as comportas da prosperidade.',
  15: 'Espírito da modéstia, guarda-me da arrogância.',
  16: 'Energia divina, guia meu entusiasmo para o bem.',
  17: 'Cambiante do destino, acompanha minha jornada de mudança.',
  18: 'Mestre artesão, ajuda-me a reparar o que está quebrado.',
  19: 'Portão da aproximação, que eu chegue com respeito e sabedoria.',
  20: 'Espelho da vida, reflete as verdades que preciso ver.',
  21: 'Dente do tempo, mastiga os obstáculos que me prendem.',
  22: 'Artista divino, embelleza minha vida com simplicidade.',
  23: 'Mão da transformação, ajuda-me a soltar o que não serve.',
  24: 'Portão do retorno, guia-me de volta ao caminho verdadeiro.',
  25: 'Inocência sagrada, que eu seja verdadeiro em todas as coisas.',
  26: 'Recipiente do poder, guarda-me da ganância.',
  27: 'Guardião da saúde, alimenta meu corpo e alma.',
  28: 'Balança do limite, mostra-me quando ultrapassar e quando parar.',
  29: 'Poço profundo, que eu encontre água renovadora.',
  30: 'Chama sagrada, ilumina sem consumir.',
  31: 'Feitiço do encanto, abre portas com gentileza.',
  32: 'Ritmo eterno, que meu coração bata em harmonia.',
  33: 'Portão da sabedoria, ajuda-me a saber quando recuar.',
  34: 'Força dos deuses, que meu poder sirva ao bem.',
  35: 'Luz da transparência, que minhas ações sejam claras.',
  36: 'Guardião da luz, ajuda-me a proteger minha chama interior.',
  37: 'Chefe do lar, que meu lar seja refúgio de paz.',
  38: 'Olho da tolerância, que eu veja sem julgar.',
  39: 'Guia do limiar, mostra-me o caminho quando tudo parece bloqueado.',
  40: 'Mestre da solução, libera-me das prisões que criei.',
  41: 'Dreno da abundância, que eu libere o excesso.',
  42: 'Semeador celestial, que meu crescimento seja natural e saudável.',
  43: 'Raio da determinação, remove os obstáculos com clareza.',
  44: 'Encontro com o destino, que eu receba o novo com abertura.',
  45: 'Reunião sagrada, que nossas forças se unam.',
  46: 'Ascensão do pino, que meu progresso seja constante.',
  47: 'Resistência da alma, que eu suporte sem perder a esperança.',
  48: 'Poço da sabedoria, que eu beba de águas profundas.',
  49: 'Fênix da transformação, que eu renasça renovado.',
  50: 'Caldeirão sagrado, que minhas oferendas sejam aceitas.',
  51: 'Trovão da despertar, sacode minha consciência.',
  52: 'Montanha da meditação, que eu encontre paz em silêncio.',
  53: 'Desenvolvimento gradual, que minha evolução seja estável.',
  54: 'Energia jovem do casamento, honra os compromissos sagrados.',
  55: 'Relâmpago da abundância, ilumina o caminho da prosperidade.',
  56: 'Viajante sagrado, que minhas jornadas ensinem e transformem.',
  57: 'Vento divino, penetra suavemente em meus pensamentos.',
  58: 'Lago da alegria, que a serenidade more em meu coração.',
  59: 'Onda da dissolução, lava meus bloqueios com compaixão.',
  60: 'Limiar da moderação, que eu conheça meus limites sagrados.',
  61: 'Silêncio do poço, que a paz interior me guie.',
  62: 'Detalhe do pequeno, que os mínimos detalhes me ensinem.',
  63: 'Conclusão iluminada, que o fim de cada ciclo seja claro.',
  64: 'Final do caminho, que a conclusão traga paz e renovação.',
};

// ─── Hexagramas Mock (dados simplificados para buildRitual) ───────────────────

interface HexagramData {
  number: number;
  name: string;
  chineseName: string;
  judgment: string;
  image: string;
  upperTrigram: number;
  lowerTrigram: number;
  lines: [boolean, boolean, boolean, boolean, boolean, boolean];
}

const HEXAGRAMS_DATA: HexagramData[] = Array.from({ length: 64 }, (_, i) => ({
  number: (i + 1) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 50
    | 51
    | 52
    | 53
    | 54
    | 55
    | 56
    | 57
    | 58
    | 59
    | 60
    | 61
    | 62
    | 63
    | 64,
  name: `Hexagrama ${i + 1}`,
  chineseName: `Hex${i + 1}`,
  judgment: 'Julgamento do hexagrama.',
  image: 'Imagem do hexagrama.',
  upperTrigram: ((i % 8) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
  lowerTrigram: ((Math.floor(i / 8) % 8) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
  lines: [
    i % 2 === 0,
    Math.floor(i / 2) % 2 === 0,
    Math.floor(i / 4) % 2 === 0,
    Math.floor(i / 8) % 2 === 0,
    Math.floor(i / 16) % 2 === 0,
    Math.floor(i / 32) % 2 === 0,
  ] as [boolean, boolean, boolean, boolean, boolean, boolean],
}));

// ─── Funções Auxiliares ───────────────────────────────────────────────────────

/**
 * Extrai um número determinístico de um timestamp.
 * Usa múltiplos primes para distribuição uniforme.
 */
function extractFromTimestamp(timestamp: number, range: number, seed: number): number {
  const prime = 31;
  const value = ((timestamp * prime + seed) % (range * 1000)) / 1000;
  return Math.floor(value) % range;
}

/**
 * Determina o nível do código baseado no timestamp.
 */
function determineLevel(timestamp: number): CodeLevel {
  const idx = extractFromTimestamp(timestamp, CODE_LEVELS.length, 7);
  return CODE_LEVELS[idx];
}

/**
 * Determina a área de vida baseada no timestamp.
 */
function determineLifeArea(timestamp: number): LifeArea {
  const idx = extractFromTimestamp(timestamp, LIFE_AREAS.length, 13);
  return LIFE_AREAS[idx];
}

/**
 * Determina se há Odu baseado no timestamp (50% das vezes).
 */
function determineHasOdu(timestamp: number): boolean {
  return extractFromTimestamp(timestamp, 2, 17) === 1;
}

/**
 * Determina o Odu (1-16) baseado no timestamp.
 */
function determineOduId(timestamp: number): number {
  return extractFromTimestamp(timestamp, 16, 23) + 1;
}

/**
 * Obtém dados mock de hexagrama com wings.
 */
function getHexagramMock(hexagramNumber: number): HexagramWithWings {
  const data = HEXAGRAMS_DATA[hexagramNumber - 1];
  return {
    ...data,
    nameEn: `Hexagram ${hexagramNumber}`,
    character: '卦',
    aspects: [],
    tradition: 'I Ching',
    wingIds: [1, 2],
    practiceIds: [],
    wings: [],
    mainWing: {
      id: 1,
      name: 'Asas Primordiais',
      nameEn: 'Primordial Wings',
      description: 'As asas fundamentais do I Ching.',
      themes: ['Criação', 'Transformação'],
      hexagrams: [1, 2, 3, 4, 5, 6, 7, 8],
    },
  } as HexagramWithWings;
}

/**
 * Obtém prática mock para o hexagrama.
 */
function getPracticeMock(hexagram: number): IntegrativePractice {
  const matching = MOCK_PRACTICES.filter((p) => p.associations.hexagrams?.includes(hexagram));
  if (matching.length > 0) {
    return matching[0];
  }
  return MOCK_PRACTICES[hexagram % MOCK_PRACTICES.length];
}

// ─── Funções Exportadas ───────────────────────────────────────────────────────

/**
 * Calcula o código do dia baseado na data.
 * Algoritmo determinístico: mesma data = mesmo código.
 *
 * @param date Data para calcular o código
 * @param timezone Timezone opcional (padrão: UTC)
 * @returns CodeOfDayResult com código e timestamp
 */
export function calculateCodeOfDay(date: Date, timezone?: string): CodeOfDayResult {
  const timestamp = date.getTime();

  const hexagram = extractFromTimestamp(timestamp, 64, 3) + 1;
  const level = determineLevel(timestamp);
  const lifeArea = determineLifeArea(timestamp);
  const hasOdu = determineHasOdu(timestamp);

  const code: AkashaCode = {
    hexagram,
    level,
    lifeArea,
    odu: hasOdu ? ODUS[determineOduId(timestamp) - 1].name : undefined,
  };

  return { code, timestamp };
}

/**
 * Retorna a afirmação do dia baseada no hexagrama.
 *
 * @param code Código Akasha
 * @returns Afirmação em português
 */
export function getAfirmacaoDoDia(code: AkashaCode): string {
  return AFIRMACOES[code.hexagram] ?? 'Eu abraço o mistério do momento presente.';
}

/**
 * Retorna a oração do dia baseada no hexagrama.
 *
 * @param code Código Akasha
 * @returns Oração em português
 */
export function getOracaoDoDia(code: AkashaCode): string {
  return ORACOES[code.hexagram] ?? 'Espírito sagrado, ilumina meu caminho hoje.';
}

/**
 * Obtém as quizilas do Odu associado ao código.
 *
 * @param odu Odu já encontrado (para evitar busca redundante)
 * @returns Array de Quizila
 */
function getQuizilasDoOdu(odu: { id: number }): Quizila[] {
  const textosQuizila = getQuizilasPorOdu(odu.id);

  return textosQuizila.map((texto, idx) => ({
    id: `quizila-${odu.id}-${idx}`,
    texto,
    tipo:
      texto.toLowerCase().includes('não') || texto.toLowerCase().includes('evitar')
        ? 'proibicao'
        : 'restricao',
  }));
}

/**
 * Constrói a resposta completa do ritual.
 *
 * @param config Configuração do ritual
 * @param code Código Akasha calculado
 * @returns RitualResponse com todos os componentes
 */
export function buildRitual(config: RitualConfig, code: AkashaCode): RitualResponse {
  const hexagramData = getHexagramMock(code.hexagram);

  const response: RitualResponse = {
    data: new Date(),
    codigo: {
      hexagrama: hexagramData,
      nivel: code.level,
    },
    pratica: getPracticeMock(code.hexagram),
    quizilas: [],
    afirmacao: getAfirmacaoDoDia(code),
    oracao: getOracaoDoDia(code),
  };

  let odu = code.odu ? ODUS.find((o) => o.name === code.odu) : undefined;

  if (odu) {
    response.codigo.odu = {
      id: odu.id,
      name: odu.name,
      quizilas: getQuizilasPorOdu(odu.id),
    };
  }

  if (config.componentes.quizilas && odu) {
    response.quizilas = getQuizilasDoOdu(odu);
  }

  return response;
}
