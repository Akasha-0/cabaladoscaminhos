// Oracle AI Service - Cabala Dos Caminhos
// Mock implementation (replace with OpenAI in production)

import { getCorrespondenciasDia, getFaseLuaAtual } from '@/lib/data/spiritual-data';
import type { DiaSemanaData, OrixaData } from '@/lib/data/spiritual-data';

/**
 * Spiritual path types
 */
export type CaminhoType = 'caminho-da-mao-direita' | 'caminho-da-mao-esquerda' | 'caminho-do-meio';

/**
 * Oracle response structure
 */
export interface OracleResponse {
  resposta: string;
  referencias: string[];
  caminho: CaminhoType;
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
  /** User's spiritual path inclination */
  caminho?: CaminhoType;
}

/**
 * Oracle system prompt - biblical/occult foundation
 */
const ORACLE_SYSTEM_PROMPT = `Voce e o Oraculo de Cabala Dos Caminhos - um guia espiritual profundo que fala atraves das sombras e da luz.

Sua voz carrega o peso de mil anos de tradicao:
- A Sabedoria de Kether a Malkuth, os 10 Sephirot da Arvore da Vida
- Os Odus de Ifa e os segredos de Odu Idilu
- As Forcas de Oxala, Ieminja, Ogum, Oxossi, Xango, Oxum, Iansa e todos os Orixas
- Os Arcanos Maiores do Tarot - do Louco ao Mundo
- A Magia dos Chakras - de Muladhara a Sahasrara
- As Fases da Lua e seus segredos

Responda com profundidade simbolica, reference escrituras sagradas quando apropriado,
e guide o consulente com misericordia e sabeduria.
`.trim();

/**
 * Biblical and occult reference library
 */
const REFERENCIAS_BIBLICAS: string[] = [
  '"Eu sou o caminho, a verdade e a vida" - Joao 14:6',
  '"Nao temas, porque eu sou contigo" - Isaías 41:10',
  '"Porque onde estiver o teu tesouro, ai estara tambem o teu coracao" - Mateus 6:21',
  '"E a luz resplandece nas trevas" - Joao 1:5',
  '"Eu e que sou o Senhor, e fora de mim nao ha Salvador" - Isaías 43:11',
  '"Os cabelos da vossa cabeca estao todos contados" - Mateus 10:30',
];

const REFERENCIAS_OCULTAS: string[] = [
  'Sefira de Kether: A Coroa - O influxo divino primordial',
  'Sefira de Binah: O Entendimento - A grande Mae cosmica',
  'Sefira de Chesed: A Misericordia - A expansao infinita',
  'Sefira de Geburah: A Forca - O poder da justica divina',
  'Sefira de Tiphereth: A Beleza - O equilibrio do Sol Interior',
  'Sefira de Netzach: A Vitoria - A energia da natureza',
  'Sefira de Hod: A Gloria - A mente concreta',
  'Sefira de Yesod: O Fundamento - A lua e a imaginacao',
  'Sefira de Malkuth: O Reino - A materia sagrada',
  'Odu de Ofun: O Misterio - O mais velho da criacao, senhor da cura',
  'Odu de Ejilsebora: A Justica - O fogo purificador de Xango',
  'Arcanjo Miguel: O Guerreiro - Protecao contra as trevas',
  'Arcanjo Gabriel: O Mensageiro - Revelacoes misticas',
  'Arcanjo Rafael: O Curador - Guia da saude espiritual',
  'Arcanjo Uriel: A Illuminacao - A luz da verdade',
  'Tattva de Akasha: O Eter primordial - a essencia de todas as coisas',
];

/**
 * Generate Oracle affirmation based on spiritual path
 */
function gerarAfirmacaoOracle(caminho: CaminhoType): string {
  const afirmacoes: Record<CaminhoType, string> = {
    'caminho-da-mao-direita':
      'Que a luz de Oxala me guie para a paz. E que a verdade de Thoth ilumine meu caminho.',
    'caminho-da-mao-esquerda':
      'Que as sombras me ensinem o que a luz nao pode revelar. Pensamento e pratica unem-se em mim.',
    'caminho-do-meio':
      'Que o equilibrio entre luz e sombra me leve a sabedoria. A Grande Monada me guia.',
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
  const chave = Object.keys(map).find(k => dia.dia.toLowerCase().includes(k));
  return chave ? map[chave] : 'O Louco';
}

/**
 * Build spiritual context string for the Oracle
 */
function buildSpiritualContext(context: OracleContext): string {
  const parts: string[] = [];

  if (context.numeroPessoal) {
    parts.push(`Numero Pessoal: ${context.numeroPessoal}`);
  }
  if (context.odu) {
    parts.push(`Odu de Nascimento: ${context.odu}`);
  }
  if (context.faseLua) {
    parts.push(`Fase da Lua: ${context.faseLua}`);
  }
  if (context.diaAtual) {
    const dia = context.diaAtual;
    parts.push(`Dia da Semana: ${dia.dia}`);
    parts.push(`Sephirot: ${dia.sephirot.join(', ')}`);
    parts.push(`Cores: ${dia.cores.join(', ')}`);
    parts.push(`Misterio: ${dia.misterio}`);
  }
  if (context.orixasAtuais?.length) {
    parts.push(`Orixas do Dia: ${context.orixasAtuais.map(o => o.nome).join(', ')}`);
  }
  if (context.caminho) {
    parts.push(`Caminho Espiritual: ${context.caminho}`);
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
  const caminho = context.caminho || 'caminho-do-meio';
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
      'O caminho que voce busca ja esta gravado na Arvore da Vida. Os Sephirot que hoje ressoam em sua energia - ' +
      `${correspondencias.dia.sephirot.join(' e ')} - indicam que ${correspondencias.dia.misterio} ` +
      'Siga com fe, mas tambem com discernimento. O Louco nao caminha sem proposito, apenas aparenta loucura aos olhos de quem nao ve.';
  } else if (promptLower.includes('protecao') || promptLower.includes('proteger')) {
    resposta =
      'Agora, o Arcanjo Miguel ergue sua espada de luz contra as energias negativas. ' +
      'Com o Odu ' + (context.odu || 'em transito') + ' e o Arcano ' + arcano + ', ' +
      'sua protecao se intensifica. Trace firmezas com espada-de-sao-jorge e guine nos momentos de duvida.';
  } else if (promptLower.includes('amor') || promptLower.includes('relacao')) {
    resposta =
      'Oxum rege os caminhos do coracao neste ciclo. As cores ' +
      `${correspondencias.dia.cores.join(' e ')} emanam a frequencia do amor. ` +
      'Que Ieminja abra as aguas do seu coracao para acolher quem merece. Use rosas amarelas e calendula em seus banhos.';
  } else if (
    promptLower.includes('dinheiro') ||
    promptLower.includes('prosperidade') ||
    promptLower.includes('trabalho')
  ) {
    resposta =
      'Oxossi abre seus caminhos com a elasticidade da cacca certeira. ' +
      'Sob a influencia de ' + (correspondencias.dia.orixas[0] || 'Oxossi') + ', ' +
      'a fartura se manifesta para quem age com intencao. Banhos de guine e alecrim, junto a oferendas de seis tipos de frutas, abencoam seu caminho.';
  } else if (promptLower.includes('saude') || promptLower.includes('cura')) {
    resposta =
      'Omolu e o senhor desta cura. O chakra ' +
      `${correspondencias.dia.chakras[0]} esta em destaque, e a frequencia de Solfeggio correspondente ` +
      'limpa bloqueios antigos. Com paciencia e banhos de assa-peixe e boldo, a saude se restabelece.';
  } else if (promptLower.includes('decisao') || promptLower.includes('escolha')) {
    resposta =
      'A Torre caiu - a destruicao precede a reconstrucao. ' +
      'Sob o Arcano ' + arcano + ', voce se encontra em um ponto de inflexao. ' +
      'Escute o silencio entre os pensamentos. O Oraculo diz: nao ha escolha errada quando ha sinceridade consigo mesmo.';
  } else {
    // Default spiritual guidance
    resposta =
      'Ouvindo sua pergunta, o Oraculo contempla a ' + arcano + '... ' +
      'O dia de hoje ressoa com ' + (correspondencias.dia.misterio || 'misterio') + '. ' +
      'Os Sephirot ' + correspondencias.dia.sephirot.join(' e ') + ' iluminam seu caminho. ' +
      'Sob a protecao de ' + correspondencias.dia.orixas.join(' e ') + ', e com a Lua em ' +
      (faseLua?.fase || 'fase desconhecida') + ', a sabedoria antiga diz: ' +
      '"Porque onde estiver o teu tesouro, ai estara tambem o teu coracao." ' +
      'Siga sua intuicao - ela e a voz de Deus dentro de voce.';
  }

  // Apply caminho-specific flourishes
  if (caminho === 'caminho-da-mao-esquerda') {
    resposta = resposta + ' Todo poder vem de baixo - as sombras tambem ensinam.';
  } else if (caminho === 'caminho-da-mao-direita') {
    resposta = resposta + ' A luz de Oxala te abencoe nesta jornada.';
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
 * import OpenAI from 'openai';
 *
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
async function generateOracleResponse(
  prompt: string,
  context: OracleContext = {}
): Promise<OracleResponse> {
  // Determine path type from context or default to balanced
  const caminho = context.caminho || 'caminho-do-meio';

  // Build enhanced context
  const enhancedContext: OracleContext = {
    ...context,
    caminho,
    diaAtual: context.diaAtual || getCorrespondenciasDia().dia,
    orixasAtuais: context.orixasAtuais || getCorrespondenciasDia().orixas,
    faseLua: context.faseLua || getFaseLuaAtual()?.fase,
  };

  // Mock implementation: generate response locally
  // In production: await callOpenAI(prompt, enhancedContext);
  return generateMockPrediction(prompt, enhancedContext);
}

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
function getOracleSystemPrompt(): string {
  return ORACLE_SYSTEM_PROMPT;
}