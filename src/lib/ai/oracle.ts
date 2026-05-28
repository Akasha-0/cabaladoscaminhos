// Oracle AI Service - Cabala Dos Caminhos
// Mock implementation (replace with OpenAI in production)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  espiritualidade,
  getCorrespondenciasDia,
  getFaseLuaAtual,
  tipoCaminho,
  TiposCaminho,
} from '@/lib/data/spiritual-data';
import type { CartaTarot, ChakraData, DiaSemanaData, OrixaData } from '@/lib/data/spiritual-data';

/**
 * Oracle response structure
 */
export interface OracleResponse {
  resposta: string;
  referencias: string[];
  caminho: TiposCaminho;
  sefirot: string[];
  orixas: string[];
  arcano: string;
  affirmation: string;
}

/**
 * Oracle context for enhanced responses
 */
export interface OracleContext {
  /** User's birth date for numerological calculations */
  dataNascimento?: string;
  /** User's personal number */
  numeroPessoal?: number;
  /** User's Odu of birth */
  odu?: string;
  /** Current day's spiritual energy */
  diaAtual?: DiaSemanaData;
  /** Orixas aligned with current energy */
  orixasAtuais?: OrixaData[];
  /** Current moon phase */
  faseLua?: string;
}

/**
 * Oracle system prompt - biblical/occult foundation
 */
const ORACLE_SYSTEM_PROMPT = `Você é o Oráculo de Cabala Dos Caminhos — um guia espiritual profundao que fala atraves das sombras e da luz.

Sua voz carrega o peso de mil anos de tradição:
- A Sabedoria de Kether à Malkuth, os 10 Sephirot da Árvore da Vida
- Os Odús de Ifá e os segredos de Odu Idilú
- As Forças de Oxalá, Iemanjá, Ogum, Oxóssi, Xangô, Oxum, Iansã e todos os Orixás
- Os Arcanos Maiores do Tarot — do Louco ao Mundo
- A Magia dos Chakras — de Muladhara a Sahasrara
- As Fases da Lua e seus segredos

Responda com profundidade simbólica, reference escrituras sagradas quando apropriado,
e guie o consulente com misericórdia e wisdom.
`.trim();

/**
 * Biblical and occult reference library
 */
const REFERENCIAS_BIBLICAS: string[] = [
  '"Eu sou o caminho, a verdade e a vida" — João 14:6',
  '"Não temas, porque eu sou contigo" — Isaías 41:10',
  '"Porque onde estiver o teu tesouro, aí estará também o teu coração" — Mateus 6:21',
  '"E a luz resplandece nas trevas" — João 1:5',
  '"Eu é que sou o Senhor, e fora de mim não há salvador" — Isaías 43:11',
  '"Os cabelos da vossa cabeça estão todos contados" — Mateus 10:30',
];

const REFERENCIAS_OCULTAS: string[] = [
  'Séfera de Kether: A Coroa — O influxo divino primordial',
  'Séfera de Binah: O Entendimento — A grande Mãe cósmica',
  'Séfera de Chesed: A Misericórdia — A expansão infinita',
  'Séfera de Geburah: A Força — O poder da justiça divina',
  'Séfera de Tiphereth: a Beleza — O equilíbrio do Sol Interior',
  'Séfera de Netzach: A Vitória — A energia da natureza',
  'Séfera de Hod: A Glória — A mente concreta',
  'Séfera de Yesod: O Fundamento — A lua e a imaginação',
  'Séfera de Malkuth: O Reino — A matéria sagrada',
  'Odú de Ofun: O Mistério — O mais velho da criação, senhor da cura',
  'Odú de Iejsa: A Justiça — O fogo purificador de Xangô',
  'Arcanjo Miguel: O Guerreiro — Proteção contra as trevas',
  'Arcanjo Gabriel: O Mensageiro — Revelações místicas',
  'Arcanjo Rafael: O Curador — Guia da saúde espiritual',
  'Arcanjo Uriel: A Illuminacão — A luz da verdade',
  'Tattva de Akasha: O Éter primordial — a essência de todas as coisas',
];

/**
 * Generate Oracle affirmation
 */
function gerarAfirmacaoOracle(caminho: TiposCaminho): string {
  const afirmacoes: Record<TiposCaminho, string> = {
    caminhoDaMaoDireita:
      'Que a luz de Oxalá me guie para a paz.阿拉 E que a verdade de Thoth ilumine meu caminho.',
    caminhoDaMaoEsquerda:
      'Que as sombras me ensinem o que a luz não pode revelar. 以 Pensamento e prática unem-se em mim.',
    caminhoDoMeio:
      'Que o equilibrio entre luz e sombra me leve à sabedoria. ア UR E AL AZ — a Grande Mônada me guia.',
  };
  return afirmacoes[caminho];
}

/**
 * Map day energy to Arcano maior
 */
function getArcanoDoDia(dia: DiaSemanaData): string {
  const map: Record<string, string> = {
    segunda: 'A Sacerdotisa / O Mundo',
    terca: 'A Torre / O Carro',
    quarta: 'O Mago / O Eremita',
    quinta: 'O Hierofante',
    sexta: 'O Imperador / O Louco',
    sabado: 'A Imperatriz / A Estrela',
    domingo: 'O Sol',
  };
  const chave = Object.keys(map).find(k => dia.dia.toLowerCase().includes(k.replace('feira', '')));
  return chave ? map[chave] : 'O Louco';
}

/**
 * Build spiritual context string for the Oracle
 */
function buildSpiritualContext(context: OracleContext): string {
  const parts: string[] = [];

  if (context.numeroPessoal) {
    parts.push(`Número Pessoal: ${context.numeroPessoal}`);
  }
  if (context.odu) {
    parts.push(`Odú de Nascimento: ${context.odu}`);
  }
  if (context.faseLua) {
    parts.push(`Fase da Lua: ${context.faseLua}`);
  }
  if (context.diaAtual) {
    const dia = context.diaAtual;
    parts.push(`Dia da Semana: ${dia.dia}`);
    parts.push(`Sephirot: ${dia.sephirot.join(', ')}`);
    parts.push(`Cores: ${dia.cores.join(', ')}`);
    parts.push(`Mistério: ${dia.misterio}`);
  }
  if (context.orixasAtuais?.length) {
    parts.push(`Orixás do Dia: ${context.orixasAtuais.map(o => o.nome).join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Generate spiritual response using mock Oracle logic
 */
function generateMockSpiritualResponse(
  prompt: string,
  context: OracleContext
): OracleResponse {
  const caminho = contexto.caminho;
  const correspondencias = getCorrespondenciasDia();
  const faseLua = getFaseLuaAtual();
  const arcano = getArcanoDoDia(correspondencias.dia);

  // Select biblical/occult references based on context
  const refs: string[] = [];
  const refCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < refCount; i++) {
    const b = REFERENCIAS_BIBLICAS[Math.floor(Math.random() * REFERENCIAS_BIBLICAS.length)];
    const o = REFERENCIAS_OCULTAS[Math.floor(Math.random() * REFERENCIAS_OCULTAS.length)];
    if (!refs.includes(b)) refs.push(b);
    if (refs.length < refCount && !refs.includes(o)) refs.push(o);
  }

  // Generate response based on prompt keywords
  let resposta = '';
  const promptLower = prompt.toLowerCase();

  if (promptLower.includes('caminho') || promptLower.includes('destino')) {
    resposta =
      'O caminho que você busca já está gravado na Árvore da Vida. Os Sephirot que hoje ressoam em sua energia — ' +
      `${correspondencias.dia.sephirot.join(' e ')} — indicam que ${correspondencias.dia.misterio} ` +
      'Siga com fé, mas também com discernimento. O Louco não caminha sem propósito, apenas aparenta loucura aos olhos de quem não vê.';
  } else if (promptLower.includes('protecao') || promptLower.includes('proteger')) {
    resposta =
      '当下来, o Arcanjo Miguel ergue sua espada de luz contra as energias negativas. ' +
      'Com o-Odú ' + (context.odu || 'em trânsito') + ' e o Arcano ' + arcano + ', ' +
      'sua proteção se intensify. Trace firmezas com espada-de-são-jorge e guiné nos momentos de dúvida.';
  } else if (promptLower.includes('amor') || promptLower.includes('relacao')) {
    resposta =
      'Oxum rege os caminhos do coração neste ciclo. As cores ' +
      `${correspondencias.dia.cores.join(' e ')} emanam a frequência do amor. ` +
      'Que Iemanjá abra as águas do seu coração para acolher quem merece. Use rosas amarelas e calêndula em seus banhos.';
  } else if (promptLower.includes('dinheiro') || promptLower.includes('prosperidade') || promptLower.includes('trabalho')) {
    resposta =
      'Oxóssi abre seus caminhos com a elasticidade da caça certeira. ' +
      'Sob a influência de ' + (correspondencias.dia.orixas[0] || 'Oxóssi') + ', ' +
      'a fartura se manifesta para quem age com intenção. Banhos de guiné e alecrim, insieme a oferendas de six tipos de frutas, abençoam seu caminho.';
  } else if (promptLower.includes('saude') || promptLower.includes('cura')) {
    resposta =
      'Omolu é o senhor desta cura. O chakra ' +
      `${correspondencias.dia.chakras[0]} está em destaque, e a frequência de Solfeggio correspondente ' +
      'limpa bloqueios antigos. Com paciência e banhos de assa-peixe e boldo, a saúde se restabelece.';
  } else if (promptLower.includes('decisao') || promptLower.includes('escolha')) {
    resposta =
      'A Torre caiu — a destruição precedes a reconstrução. ' +
      'Sob o Arcano ' + arcano + ', você se encontra em um ponto de inflexão. ' +
      'Escute o silêncio entre os pensamentos. O Oráculo diz: não há escolha errada quando há sinceridade consigo mesmo.';
  } else {
    // Default spiritual guidance
    resposta =
      'Ouvindo sua pergunta, o Oráculo contempla a ' + arcano + '... ' +
      'O dia de hoje ressoa com ' + (correspondencias.dia.misterio || 'mistério') + '. ' +
      'Os Sephirot ' + correspondencias.dia.sephirot.join(' e ') + ' iluminam seu caminho. ' +
      'Sob a proteção de ' + correspondencias.dia.orixas.join(' e ') + ', e com a Lua em ' +
      (faseLua?.fase || 'fase desconhecida') + ', a sabedoria antiga diz: ' +
      '"Porque onde estiver o teu tesouro, aí estará também o teu coração." ' +
      'Siga sua intuição — ela é a voz de Deus dentro de você.';
  }

  // Apply caminho-specific flourishes
  if (caminho === 'mão-esquerda') {
    resposta = resposta + ' ƵAƷ Todo poder viene de abajo — as sombras também ensinam.';
  } else if (caminho === 'mão-direita') {
    resposta = resposta + ' ✨ A luz de Oxalá te abençoe nesta jornada.';
  }

  return {
    resposta,
    referencias: refs.slice(0, 4),
    caminho,
    sefirot: correspondencias.dia.sephirot,
    orixas: correspondencias.dia.orixas,
    arcano,
    affirmation: gerarAfirmacaoOracle(caminho),
  };
}

/**
 * Generate Oracle response
 *
 * This is a MOCK implementation. In production, replace with actual OpenAI call:
 *
 * ```typescript
 * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 * const completion = await openai.chat.completions.create({
 *   model: 'gpt-4o',
 *   messages: [
 *     { role: 'system', content: ORACLE_SYSTEM_PROMPT },
 *     { role: 'user', content: buildSpiritualContext(context) + '\n\nPergunta: ' + prompt }
 *   ],
 *   temperature: 0.8,
 * });
 * return { resposta: completion.choices[0].message.content, ... };
 * ```
 *
 * @param prompt - User's spiritual question
 * @param context - Spiritual context metadata
 * @returns OracleResponse with formatted spiritual guidance
 */
export async function generateOracleResponse(
  prompt: string,
  context: OracleContext = {}
): Promise<OracleResponse> {
  // Determine path type from context or default to balanced
  const caminho =
    contexto.caminho || espiritualidade.caminho || 'médio';

  // Build enhanced context
  const enhancedContext: OracleContext = {
    ...context,
    diaAtual: context.diaAtual || getCorrespondenciasDia().dia,
    orixasAtuais: context.orixasAtuais || getCorrespondenciasDia().orixas,
    faseLua: context.faseLua || getFaseLuaAtual()?.fase,
  };

  // Mock implementation: generate response locally
  // In production: await callOpenAI(prompt, enhancedContext);
  return generateMockPrediction(prompt, enhancedContext);
}

// Alias for internal use
const contexto: { caminho?: TiposCaminho } = {};

/**
 * Internal mock prediction generator
 */
function generateMockPrediction(
  prompt: string,
  context: OracleContext
): OracleResponse {
  return generateMockSpiritualResponse(prompt, context);
}

/**
 * Get Oracle system prompt
 */
export function getOracleSystemPrompt(): string {
  return ORACLE_SYSTEM_PROMPT;
}
