/**
 * synthesis-engine/derive-akasha-type.ts
 *
 * F-227: Deriva o tipo Akasha único (1 de 9) a partir do Odu familiar +
 * refinamento do corpo tântrico + autoridade. Split de synthesis-engine.ts.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import type { AkashaAuthority, AkashaTypeProfile, FrequencyLevel } from './synthesis-types';
import AKASHA_TYPES from './akasha-types-catalog';

const ODU_TO_TYPE: Record<string, string> = {
  oje: 'catalisador', ogbe: 'catalisador', oros: 'catalisador',
  ox: 'receptor', oxu: 'receptor', alavaye: 'receptor',
  oyeku: 'construtor', otura: 'construtor',
  ogunda: 'transformador', owonrin: 'transformador',
  okanran: 'guardiao', logbara: 'guardiao',
  irosun: 'curador',
  oji: 'canal', ate: 'canal',
  ica: 'alquimista', idia: 'alquimista',
};

const AUTHORITY_PRACTICE: Record<AkashaAuthority, string> = {
  emotional: 'Diário: pause antes de decisões importantes e pergunte — como meu peito se sente com isso?',
  sacral: 'Diário: antes de agir, sinta resposta do seu corpo abaixo do umbigo — sim, não ou talvez.',
  splenic: 'Diário: preste atenção insights súbitos. Não duvide do seu "click" quando ele vier.',
  mental: 'Diário: questione urgência do pensamento. Pergunte — isto é verdade ou só ruído familiar?',
};

const DIRECTIVE_BY_AREA_AND_FREQ: Record<string, Record<FrequencyLevel, string>> = {
  vitalidade: {
    shadow: 'Hoje: respeite o cansaço. Não confunda parar com fraqueza.',
    gift: 'Hoje: use sua energia para começar algo que você vem adiando.',
    siddhi: 'Hoje: sua vitalidade é referência. Compartilhe movimento, não opinião.',
  },
  conexoes: {
    shadow: 'Hoje: não busque validação. Sua presença já é suficiente.',
    gift: 'Hoje: diga algo verdadeiro a alguém que importa. Sem pressa.',
    siddhi: 'Hoje: ame sem se perder. Quem você é não precisa do outro para ser completo.',
  },
  carreira: {
    shadow: 'Hoje: não force resultados. Faça uma coisa pequena que avance o que importa.',
    gift: 'Hoje: tome uma decisão profissional que você vem adiando. O timing é agora.',
    siddhi: 'Hoje: ajude um colega avançar. Sua abundância se expande ao compartilhar.',
  },
  propósito: {
    shadow: 'Hoje: preste atenção no que sua intuição sussurra. Não descarte o insight por ser pequeno.',
    gift: 'Hoje: siga um insight, mesmo que pareça irracional. Sua mente sabe mais que você.',
    siddhi: 'Hoje: compartilhe o que descobriu consigo mesmo. Clareza se consolida ao ser dita.',
  },
  missão: {
    shadow: 'Hoje: pergunte si mesmo — estou vivendo minha própria vida ou expectativa de outros?',
    gift: 'Hoje: tome uma ação que honre quem você realmente é. Pequenos passos são válidos.',
    siddhi: 'Hoje: inspire outros pelo que você é, não pelo que você faz. Ser é suficiente.',
  },
  transformação: {
    shadow: 'Hoje: nomeie o padrão que você está vendo em você mesmo. Sair do invisível é o primeiro passo.',
    gift: 'Hoje: transforme uma tensão antiga em algo criativo. O que te incomodou pode virar arte.',
    siddhi: 'Hoje: ajude alguém ver seu próprio padrão. Ensinar é forma mais alta de transformação.',
  },
};

const ONE_LINER_BY_TYPE: Record<string, string> = {
  catalisador: 'Você é O Catalisador. Sua presença inicia o que antes era apenas possibilidade — você não espera o momento, você É o momento. Onde outros hesitam, você já acendeu o fogo. Sua lição é não queimar o que ainda precisa de calma.',
  receptor: 'Você é O Receptor. Antes de qualquer movimento, você já sabe. Sua percepção lê o invisível — o que ninguém disse, o que ninguém quer ouvir. Sua lição é confiar na própria frequência sem buscar provas.',
  construtor: 'Você é O Construtor. Outros têm ideias; você tem alicerces. Sua energia não é glamourosa — é paciente como água escavando pedra. Cada tijolo que você coloca hoje sustenta um edifício que ninguém mais consegue visualizar ainda. Não apresse o trabalho. Consistência é sua magia.',
  transformador: 'Você é O Transformador. Você não evita o fogo — você é o fogo. Agregar, separar, reorganizar, atravessar — seu Odu é energia que não aceita que nada permaneça como estava. Outros confiam em você para romper o que precisa ser rompido. Sua presença não permite zoneamento falso.',
  guardiao: 'Você é O Guardião. Outros entram no território desprotegido; você é fronteira que torna o espaço seguro para outros existirem. Sua energia não inicia, não alarga — ela sustenta e protege. Você é o que impede que sistemas vivam em caos. Outros esquecem de agradecer — mas sentem sua falta quando você se ausenta.',
  curador: 'Você é O Curador. Sua energia encontra ferida da mente — você sabe onde dói antes da pessoa falar. Você é um espaço emocional seguro onde outros se permittedem ser vulneráveis. Sua presença não julga, não apressa, não conserta — só presencia. Essa qualidade de presença é o que permite que outros se curem por conta própria.',
  canal: 'Você é O Canal. Sua energia é a ponte entre o visível e o invisível. Você ouve a frequência que outros não captam e traduz em palavras, imagens, gestos. Sua voz é instrumento — afine antes de tocar. Falar é tão sagrado quanto escutar.',
  alquimista: 'Você é O Alquimista. Sua matéria-prima é a dificuldade — onde outros veem problema, você vê ingrediente. Você transforma resistência em ouro pelo simples ato de não fugir. O que te queima é o que te purifica.',
  arquiteto: 'Você é O Arquiteto. Outros improvisam estruturas; você projeta sistemas. Você vê interconexão entre campos que parecem separados — carreira toca o corpo, o corpo toca o espírito, o espírito toca o dinheiro. Sua mente é geométrica: cada decisão reflete um padrão. Outros veem 2 + 2; você vê o sistema que contém toda matemática.',
};

function resolveTypeFromOdu(oduName: string): string {
  if (!oduName) return 'arquiteto';
  return ODU_TO_TYPE[oduName] ?? 'arquiteto';
}

function pickDominantBody(tantra: TantricMap | null): number | undefined {
  if (!tantra?.bodies) return undefined;
  const bodies = tantra.bodies;
  const bodyNumbers: Array<{ key: string; number: number }> = [
    { key: 'fisico', number: bodies.fisico?.number ?? 0 },
    { key: 'pranic', number: bodies.pranic?.number ?? 0 },
    { key: 'emocional', number: bodies.emocional?.number ?? 0 },
    { key: 'mental', number: bodies.mental?.number ?? 0 },
    { key: 'espiritual', number: bodies.espiritual?.number ?? 0 },
  ];
  bodyNumbers.sort((a, b) => b.number - a.number);
  return bodyNumbers[0]?.number;
}

function deriveAuthorityFromMaps(
  tantra: TantricMap | null,
  astro: AstrologyMap | null
): AkashaAuthority {
  const dominantBody = pickDominantBody(tantra);
  if (dominantBody !== undefined && dominantBody > 0) {
    if (dominantBody >= 7) return 'mental';
    if (dominantBody >= 4) return 'emotional';
    return 'sacral';
  }
  const moon = astro?.planets?.find(p => p.planet === 'Moon' || p.planet === 'Lua');
  if (moon && ['cancer', 'escorpio', 'peixes', 'câncer', 'escorpião', 'peixes'].includes(moon.sign?.toLowerCase() ?? '')) {
    return 'emotional';
  }
  return 'sacral';
}

function refineCorePattern(basePattern: string, dominantBody?: number): string {
  if (dominantBody === undefined || dominantBody < 7) return basePattern;
  return basePattern.replace(
    '.',
    '. Seus corpos superiores amplificam essa energia — você pensa antes de agir, mas o pensamento já é movimento.',
  );
}

function pickDailyDirectiveLabel(dominantBody?: number): string {
  if (dominantBody === undefined) return 'propósito';
  if (dominantBody <= 3) return 'vitalidade';
  if (dominantBody <= 5) return 'conexões';
  if (dominantBody <= 7) return 'carreira';
  return 'missão';
}

function pickDailyDirectiveFrequency(dominantBody?: number): FrequencyLevel {
  return dominantBody !== undefined && dominantBody >= 7 ? 'siddhi' : 'gift';
}

/**
 * Deriva o ONE Akasha Profile (1 de 9 tipos) a partir do Odu familiar +
 * refinamento tântrico + autoridade.
 */
export function deriveAkashaType(
  _astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  _holo: AkashicHologram
): AkashaTypeProfile {
  const oduName = odu?.oduName?.toLowerCase() ?? '';
  const typeKey = resolveTypeFromOdu(oduName);
  const baseType = AKASHA_TYPES[typeKey];

  const dominantBody = pickDominantBody(tantra);
  const corePattern = refineCorePattern(baseType.corePattern, dominantBody);
  const authority = deriveAuthorityFromMaps(tantra, _astro);

  const directiveLabel = pickDailyDirectiveLabel(dominantBody);
  const directiveFreq = pickDailyDirectiveFrequency(dominantBody);
  const dailyDirective =
    DIRECTIVE_BY_AREA_AND_FREQ[directiveLabel]?.[directiveFreq] ??
    DIRECTIVE_BY_AREA_AND_FREQ['propósito']['gift'];

  const oneLiner = ONE_LINER_BY_TYPE[typeKey] ?? ONE_LINER_BY_TYPE['arquiteto'];

  return {
    type: baseType.type,
    typeName: baseType.typeName,
    typeIcon: baseType.typeIcon,
    corePattern,
    strategy: baseType.strategy,
    strategyDetail: baseType.strategyDetail,
    authority,
    authorityPractice: AUTHORITY_PRACTICE[authority],
    dailyDirective,
    oneLiner,
    dimensionOrigin: baseType.dimensionOrigin ?? null,
    growthEdge: baseType.growthEdge,
    shadowTrap: baseType.shadowTrap,
  };
}
