import type { ManifestoContent } from '@/components/akasha/ManifestoPDF';
import { buildOduGlossary, formatGlossarySection } from './glossary';

export function buildManifestoContent(
  userName: string,
  astrologyMap: unknown,
  kabalisticMap: unknown,
  tantricMap: unknown,
  oduBirth: unknown
): ManifestoContent {
  const astro = (astrologyMap ?? {}) as Record<string, unknown>;
  const kab = (kabalisticMap ?? {}) as Record<string, unknown>;
  const tantra = (tantricMap ?? {}) as Record<string, unknown>;
  const odu = (oduBirth ?? {}) as Record<string, unknown>;

  const oduName: string =
    (odu?.oduName as string) ??
    (odu?.birthOdu as Array<{ meaning: string }>)?.[0]?.meaning ??
    'Ori';

  const elementalForce: string | null = (odu?.elementalForce as string) ?? null;
  const orixas: string[] = (odu?.orixaRegency as string[]) ?? [];
  const lifePath: number | null = (kab?.lifePath as number) ?? null;
  const expression: number | null = (kab?.expression as number) ?? null;
  const personalYear: number | null =
    ((kab?.personalCycles as Record<string, unknown>)?.personalYear as number) ?? null;
  const ascendant: string | null = (astro?.ascendant as string) ?? null;
  const dominantPlanet: string | null = (astro?.dominantPlanet as string) ?? null;
  const tantricPath: number | null = (tantra?.tantricPath as number) ?? null;

  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // AD-T5-F (AD-20.2): glossário mínimo (essência/quizila/conselho) injetado
  // no payload para que qualquer consumidor IA tenha verdade-base do Odu.
  const glossarySection = formatGlossarySection(buildOduGlossary(oduBirth));

  return {
    userName,
    generatedAt,
    glossarySection,
    synthesis: buildSynthesis(oduName, lifePath, ascendant, tantricPath),
    odus: {
      title: 'Bússola Ancestral',
      oduName,
      oduNumber: (odu?.oduNumber as number) ?? null,
      orixas,
      elementalForce,
      description: buildOduDescription(odu, oduName, elementalForce, orixas),
      preceitos: (odu?.preceitos as string[]) ?? [],
      provisional: (odu?.provisional as boolean) ?? true,
    },
    kabala: {
      title: 'O Verbo',
      lifePath,
      lifePathMaster: (kab?.lifePathMaster as boolean) ?? false,
      expression,
      motivation: (kab?.motivation as number) ?? null,
      personalYear,
      description: buildKabalaDescription(kab, lifePath, expression, personalYear),
    },
    tantra: {
      title: 'Anatomia Sutil',
      soul: (tantra?.soul as number) ?? null,
      karma: (tantra?.karma as number) ?? null,
      divineGift: (tantra?.divineGift as number) ?? null,
      tantricPath,
      description: buildTantraDescription(tantra, tantricPath),
    },
    astrology: {
      title: 'Mapa de Bordo',
      ascendant,
      dominantPlanet,
      mainPlanets: ((astro?.planets as Array<Record<string, string>>) ?? [])
        .slice(0, 5)
        .map((p) => ({
          name: (p.planet ?? p.name ?? '') as string,
          sign: (p.sign ?? '') as string,
        })),
      description: buildAstroDescription(astro, ascendant, dominantPlanet),
    },
  };
}

function buildSynthesis(
  oduName: string,
  lifePath: number | null,
  ascendant: string | null,
  tantricPath: number | null
): string {
  const oduPart = oduName ? `regido pelo Odu ${oduName}` : 'de raízes ancestrais profundas';
  const lifePathPart = lifePath ? `o Caminho de Vida ${lifePath}` : 'um propósito singular';
  const ascendantPart = ascendant ? `o Ascendente em ${ascendant}` : 'uma expressão cósmica única';
  const tantricPart = tantricPath
    ? `o Caminho Tântrico ${tantricPath}`
    : 'uma anatomia sutil refinada';

  return (
    `O cruzamento dos seus 4 mapas revela um ser ${oduPart}, portador de ${lifePathPart} como missão central. ` +
    `Quando este Odu encontra ${ascendantPart} e ${tantricPart}, emerge uma combinação rara: ` +
    `a capacidade de integrar a sabedoria ancestral iorubá-nagô com a precisão dos números e o tempo cósmico. ` +
    `Você não é produto do acaso — é uma equação espiritual que se manifesta com propósito e potência nesta encarnação.`
  );
}

function buildOduDescription(
  odu: Record<string, unknown>,
  oduName: string,
  elementalForce: string | null,
  orixas: string[]
): string {
  if (!odu || (odu.error as boolean)) {
    return (
      'Seu Odu de nascimento carrega as forças ancestrais que moldaram sua encarnação. ' +
      'Cada Odu é um arquétipo de existência — um conjunto de histórias, lições e poderes ' +
      'transmitidos pela linhagem iorubá-nagô.'
    );
  }
  const parts: string[] = [];
  const keyword = elementalForce ?? orixas[0] ?? 'criação';
  parts.push(`Seu Ori é regido por ${oduName}, portador da energia de ${keyword}.`);
  if (odu.lifeLesson) {
    parts.push(
      `Isso significa que sua força vital encontra expressão através de ${String(odu.lifeLesson)}.`
    );
  } else if (elementalForce) {
    parts.push(
      `Isso significa que sua força vital encontra expressão através da força elemental ${elementalForce}.`
    );
  }
  const theme =
    (odu.lifeTheme as string) ?? (odu.theme as string) ?? 'crescimento, superação e expansão';
  parts.push(`Sua jornada é marcada por ${theme}.`);
  return parts.join(' ');
}

function buildKabalaDescription(
  kab: Record<string, unknown>,
  lifePath: number | null,
  expression: number | null,
  personalYear: number | null
): string {
  if (!kab || (kab.error as boolean)) {
    return (
      'A Numerologia Cabalística decodifica a frequência do seu nome e data de nascimento, ' +
      'revelando o contrato de alma que você firmou antes desta encarnação.'
    );
  }
  const parts: string[] = [];
  if (lifePath !== null) {
    const masterSuffix = (kab.lifePathMaster as boolean) ? ' (Número Mestre)' : '';
    parts.push(
      `Seu Número ${lifePath}${masterSuffix} revela que sua missão é dominar a lição central inscrita na frequência deste caminho.`
    );
  }
  if (expression !== null) {
    parts.push(
      `O Número de Expressão ${expression} mostra como você se manifesta para o mundo: através da vibração e qualidade que este número carrega.`
    );
  }
  if (personalYear !== null) {
    parts.push(
      `Este é um ano ${personalYear} em seu ciclo pessoal — um tempo de ${personalYearMeaning(personalYear)}.`
    );
  }
  return (
    parts.join(' ') || 'Seus números cabalísticos revelam o propósito oculto desta encarnação.'
  );
}

function personalYearMeaning(year: number): string {
  const meanings: Record<number, string> = {
    1: 'novos começos e iniciativas',
    2: 'parcerias, cooperação e paciência',
    3: 'criatividade, expressão e expansão social',
    4: 'estruturação, trabalho e fundação sólida',
    5: 'mudanças, liberdade e aventura',
    6: 'responsabilidades, família e serviço',
    7: 'introspecção, espiritualidade e busca interior',
    8: 'poder, manifestação material e reconhecimento',
    9: 'conclusões, fechamentos e preparação para o próximo ciclo',
    11: 'iluminação, inspiração e missão espiritual elevada',
    22: 'construção de grande legado e materialização de visões',
  };
  return meanings[year] ?? 'transformação e crescimento';
}

function buildTantraDescription(
  tantra: Record<string, unknown>,
  tantricPath: number | null
): string {
  if (!tantra || (tantra.error as boolean)) {
    return (
      'Os 11 Corpos Espirituais da Numerologia Tântrica mapeiam a anatomia sutil do seu ser — ' +
      'onde a energia flui com facilidade e onde ela encontra resistência.'
    );
  }
  const parts: string[] = [];
  if (tantricPath !== null) {
    parts.push(
      `Sua numerologia tântrica revela ${tantricPath} como seu Caminho Tântrico, ` +
        `indicando uma jornada de integração espiritual e aprofundamento dos corpos sutis.`
    );
  }
  const bodies = tantra.bodies as Array<{ name: string; active: boolean }> | undefined;
  if (bodies && bodies.length > 0) {
    const active = bodies.filter((b) => b.active).map((b) => b.name);
    const inactive = bodies.filter((b) => !b.active).map((b) => b.name);
    if (active.length > 0) {
      parts.push(`Corpos ativos e em fluxo: ${active.join(', ')}.`);
    }
    if (inactive.length > 0) {
      parts.push(`Corpos a desenvolver: ${inactive.join(', ')}.`);
    }
  } else {
    if (tantra.soul) parts.push(`Corpo da Alma ${tantra.soul}: a frequência do seu Eu eterno.`);
    if (tantra.karma)
      parts.push(`Karma ${tantra.karma}: o padrão ancestral que você veio transmutar.`);
    if (tantra.divineGift)
      parts.push(
        `Dom Divino ${tantra.divineGift}: sua habilidade natural de elevar o campo ao redor.`
      );
  }
  return (
    parts.join(' ') ||
    'Os 11 Corpos revelam onde sua energia está em fluxo e onde precisa de alinhamento.'
  );
}

function buildAstroDescription(
  astro: Record<string, unknown>,
  ascendant: string | null,
  dominantPlanet: string | null
): string {
  if (!astro || (astro.error as boolean) || astro.note) {
    return (
      'Seu mapa astral natal registra o céu exato no momento do seu nascimento — ' +
      'uma impressão cósmica única que não se repete. Forneça seu local de nascimento para o cálculo completo.'
    );
  }
  const parts: string[] = [];
  if (ascendant) {
    parts.push(
      `Seu Ascendente em ${ascendant} define como você se apresenta ao mundo — a máscara que o cosmos moldou para sua jornada.`
    );
  }
  if (dominantPlanet) {
    parts.push(
      `${dominantPlanet} como planeta dominante amplifica as energias de determinação, profundidade e a qualidade vibracional deste regente em todos os ciclos da sua vida.`
    );
  }
  if (astro.lunarPhase) {
    parts.push(`Lua nascida em ${astro.lunarPhase} — ritmo emocional e padrões inconscientes.`);
  }
  return parts.join(' ') || 'O céu natal é sua impressão cósmica — única e irrepetível.';
}
