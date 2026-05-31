// ============================================================
// COMPATIBILITY ZODIAC API - CABALA DOS CAMINHOS
// Enhanced with cross-tradition spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ZodiacSignSchema = z.enum([
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes',
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);

const CompatibilityQuerySchema = z.object({
  sign1: z.string().min(1, 'sign1 é obrigatório').optional(),
  sign2: z.string().min(1, 'sign2 é obrigatório').optional(),
  date1: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  date2: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

interface ZodiacSign {
  name: string;
  element: string;
  modality: string;
  quality: string[];
  rulingPlanet: string;
  symbol: string;
  traits: string[];
  dates: string;
  sefirot: string[];
  chakra: number;
  orixa: string;
  affirmation: string;
}

// ─── Zodiac Signs with Spiritual Correlations ──────────────────────────────────────────
const ZODIAC_SIGNS: Record<string, ZodiacSign> = {
  aries: {
    name: 'Áries',
    element: 'Fogo',
    modality: 'Cardinal',
    quality: ['Energético', 'Iniciativa', 'Corajoso', 'Impulsivo'],
    rulingPlanet: 'Marte',
    symbol: '♈',
    traits: ['Impulsivo', 'Corajoso', 'Independente', 'Competitivo', 'Entusiasta'],
    dates: '21 Mar - 19 Abr',
    sefirot: ['Gevurah', 'Kether'],
    chakra: 3,
    orixa: 'Ogum',
    affirmation: 'Tenho coragem para iniciar minha jornada espiritual',
  },
  taurus: {
    name: 'Touro',
    element: 'Terra',
    modality: 'Fixed',
    quality: ['Estável', 'Persistentes', 'Recursoso', 'Teimoso'],
    rulingPlanet: 'Vênus',
    symbol: '♉',
    traits: ['Territorial', 'Leal', 'Paciente', 'Prático', 'Sensual'],
    dates: '20 Abr - 20 Mai',
    sefirot: ['Malkuth', 'Venus'],
    chakra: 1,
    orixa: 'Oxum',
    affirmation: 'Sou nutrido pela abundância da terra sagrada',
  },
  gemini: {
    name: 'Gêmeos',
    element: 'Ar',
    modality: 'Mutable',
    quality: ['Versátil', 'Comunicativo', 'Curioso', 'Inconsistente'],
    rulingPlanet: 'Mercúrio',
    symbol: '♊',
    traits: ['Curioso', 'Versátil', 'Comunicativo', 'Intelectual', 'Nervoso'],
    dates: '21 Mai - 20 Jun',
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria flui através de minha mente aberta',
  },
  cancer: {
    name: 'Câncer',
    element: 'Água',
    modality: 'Cardinal',
    quality: ['Intuitivo', 'Emotivo', 'Protetor', 'Vulnerável'],
    rulingPlanet: 'Lua',
    symbol: '♋',
    traits: ['Intuitivo', 'Emocional', 'Leal', 'Protetor', 'Materno'],
    dates: '21 Jun - 22 Jul',
    sefirot: ['Yesod', 'Binah'],
    chakra: 6,
    orixa: 'Iemanjá',
    affirmation: 'A intuição divina guia meu coração',
  },
  leo: {
    name: 'Leão',
    element: 'Fogo',
    modality: 'Fixed',
    quality: ['Criativo', 'Dramático', 'Generoso', 'Egocêntrico'],
    rulingPlanet: 'Sol',
    symbol: '♌',
    traits: ['Confiante', 'Criativo', 'Generoso', 'Orgulhoso', 'Dramático'],
    dates: '23 Jul - 22 Ago',
    sefirot: ['Tipheret', 'Kether'],
    chakra: 4,
    orixa: 'Oxalá',
    affirmation: 'Eu sou a luz que ilumina meu caminho',
  },
  virgo: {
    name: 'Virgem',
    element: 'Terra',
    modality: 'Mutable',
    quality: ['Analítico', 'Prático', 'Organizado', 'Crítico'],
    rulingPlanet: 'Mercúrio',
    symbol: '♍',
    traits: ['Analítico', 'Organizado', 'Trabalhador', 'Perfeccionista', 'Modesto'],
    dates: '23 Ago - 22 Set',
    sefirot: ['Hod', 'Malkuth'],
    chakra: 3,
    orixa: 'Omolu',
    affirmation: 'A pureza de coração me aproxima do divino',
  },
  libra: {
    name: 'Libra',
    element: 'Ar',
    modality: 'Cardinal',
    quality: ['Diplomático', 'Harmonioso', 'Romântico', 'Indeciso'],
    rulingPlanet: 'Vênus',
    symbol: '♎',
    traits: ['Diplomático', 'Gracioso', 'Fairplay', 'Indeciso', 'Romântico'],
    dates: '23 Set - 22 Out',
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    orixa: 'Oxum',
    affirmation: 'A harmonia e equilíbrio guiam minhas relações',
  },
  scorpio: {
    name: 'Escorpião',
    element: 'Água',
    modality: 'Fixed',
    quality: ['Passionado', 'Determinado', 'Intenso', 'Secreto'],
    rulingPlanet: 'Plutão',
    symbol: '♏',
    traits: ['Intenso', 'Passionado', 'Misterioso', 'Determinado', 'Ciumento'],
    dates: '23 Out - 21 Nov',
    sefirot: ['Gevurah', 'Hod'],
    chakra: 5,
    orixa: 'Oxum',
    affirmation: 'A transformação me traz renovação e poder',
 },
  sagittarius: {
    name: 'Sagitário',
    element: 'Fogo',
    modality: 'Mutable',
    quality: ['Otimista', 'Aventureiro', 'Filosófico', 'Impensado'],
    rulingPlanet: 'Júpiter',
    symbol: '♐',
    traits: ['Otimista', 'Aventureiro', 'Honesto', 'Extrovertido', 'Irrefletido'],
    dates: '22 Nov - 21 Dez',
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    orixa: 'Oxalá',
    affirmation: 'A busca pela verdade é minha jornada sagrada',
  },
  capricorn: {
    name: 'Capricórnio',
    element: 'Terra',
    modality: 'Cardinal',
    quality: ['Ambicioso', 'Disciplinado', 'Paciente', 'Pessimista'],
    rulingPlanet: 'Saturno',
    symbol: '♑',
    traits: ['Ambicioso', 'Disciplinado', 'Responsável', 'Reservado', 'Teimoso'],
    dates: '22 Dez - 19 Jan',
    sefirot: ['Malkuth', 'Saturno'],
    chakra: 1,
    orixa: 'Ogum',
    affirmation: 'A disciplina me leva à mastersia espiritual',
  },
  aquarius: {
    name: 'Aquário',
    element: 'Ar',
    modality: 'Fixed',
    quality: ['Independente', 'Intelectual', 'Humanitário', 'Desapegado'],
    rulingPlanet: 'Urano',
    symbol: '♒',
    traits: ['Independente', 'Original', 'Humanitário', 'Eccêntrico', 'Frio'],
    dates: '20 Jan - 18 Fev',
    sefirot: ['Chokhmah', 'Saturno'],
    chakra: 6,
    orixa: 'Orunmilá',
    affirmation: 'Sou um canal de luz para a humanidade',
 },
  pisces: {
    name: 'Peixes',
    element: 'Água',
    modality: 'Mutable',
    quality: ['Compassivo', 'Artístico', 'Intuitivo', 'Escapista'],
    rulingPlanet: 'Netuno',
    symbol: '♓',
    traits: ['Compassivo', 'Artístico', 'Criativo', 'Senciente', 'Confuso'],
    dates: '19 Fev - 20 Mar',
    sefirot: ['Yesod', 'Netzach'],
    chakra: 7,
    orixa: 'Iemanjá',
    affirmation: 'Dissolvo-me na luz divina com gratidão',
  },
};

const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  Fire: { Fire: 100, Earth: 40, Air: 90, Water: 30 },
  Earth: { Fire: 40, Earth: 100, Air: 50, Water: 90 },
  Air: { Fire: 90, Earth: 50, Air: 100, Water: 60 },
  Water: { Fire: 30, Earth: 90, Air: 60, Water: 100 },
};

const MODALITY_COMPATIBILITY: Record<string, Record<string, number>> = {
  Cardinal: { Cardinal: 70, Fixed: 60, Mutable: 80 },
  Fixed: { Cardinal: 60, Fixed: 70, Mutable: 50 },
  Mutable: { Cardinal: 80, Fixed: 50, Mutable: 70 },
};

function getSignFromDate(dateStr: string): string | undefined {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
  return undefined;
}

function calculateCompatibility(sign1: string, sign2: string) {
  const z1 = ZODIAC_SIGNS[sign1];
  const z2 = ZODIAC_SIGNS[sign2];
  if (!z1 || !z2) return null;

  const elementCompatible = z1.element === z2.element;
  const elementScore = ELEMENT_COMPATIBILITY[z1.element]?.[z2.element] || 50;
  const modalityScore = MODALITY_COMPATIBILITY[z1.modality]?.[z2.modality] || 50;
  const overallScore = Math.round((elementScore + modalityScore) / 2);

  const strengths: string[] = [];
  const challenges: string[] = [];
  const tips: string[] = [];

  if (elementCompatible) {
    strengths.push(`Vocês compartilham o elemento ${z1.element}, criando uma sintonia natural`);
  }

  if (elementScore >= 80) {
    strengths.push('Há uma harmonia natural entre vocês nos elementos');
  } else if (elementScore >= 60) {
    strengths.push('Existe um equilíbrio possível entre os elementos');
    challenges.push('As diferenças elementais podem criar tensões ocasionais');
  } else {
    challenges.push('Diferenças elementais requerem adaptação de ambos');
    tips.push('Respeitem os diferentes ritmos e necessidades');
  }

  if (z1.rulingPlanet === z2.rulingPlanet) {
    strengths.push(`Ambos são regidos por ${z1.rulingPlanet}, facilitando a comunicação`);
  }

  if (modalityScore >= 80) {
    strengths.push('Os sinais têm Modalidades compatíveis, facilitando o ritmo do relacionamento');
  } else if (modalityScore >= 60) {
    tips.push('Ajustem o ritmo e expectativas conforme necessário');
  } else {
    challenges.push('As Modalidades diferentes podem gerar misunderstandings sobre ritmo e prioridades');
  }

  commonStrengths(sign1, sign2, strengths);
  commonChallenges(sign1, sign2, challenges);

  tips.push(`${z1.name} deve respeitar a necessidade de ${z2.name} de cautela`);
  tips.push(`${z2.name} deve permitir que ${z1.name} expresse sua natureza assertiva`);

  let description = '';
  if (overallScore >= 80) {
    description = `A compatibilidade entre ${z1.name} e ${z2.name} é excepcional. Vocês se entendem naturalmente e têm potencial para um relacionamento profundo e gratificante. O elemento ${z1.element} traz energia que o elemento ${z2.element} complementa`;
  } else if (overallScore >= 60) {
    description = `${z1.name} e ${z2.name} têm uma compatibilidade boa com potencial de crescimento. Com comunicação e compreensão mútua, vocês podem construir um relacionamento significativo`;
  } else if (overallScore >= 40) {
    description = `A relação entre ${z1.name} e ${z2.name} requer mais esforço e compreensão. As diferenças podem ser source de tensão, mas também de crescimento pessoal`;
  } else {
    description = `${z1.name} e ${z2.name} enfrentam desafios significativos devido às suas naturezas tão diferentes. São necessárias muita paciência e compromise para construir um relacionamento harmonic`;
  }

  return {
    sign1: z1.name,
    sign2: z2.name,
    overallScore,
    elementCompatibility: elementCompatible,
    elementScore,
    modalityScore,
    description,
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 3),
    tips: tips.slice(0, 3),
    spiritualCorrelations: {
      sefirot: [...new Set([...z1.sefirot, ...z2.sefirot])],
      chakras: [z1.chakra, z2.chakra],
      elements: [z1.element, z2.element],
      orixas: [z1.orixa, z2.orixa],
      affirmations: [z1.affirmation, z2.affirmation],
    },
  };
}

function commonStrengths(s1: string, s2: string, strengths: string[]): void {
  const compatPairs: [string, string, string][] = [
    ['aries', 'leo', 'A passion combination! Both are fire signs with great enthusiasm'],
    ['aries', 'sagittarius', 'Uma dupla adventurous com philosophies ähnlich'],
    ['taurus', 'virgo', 'Earth sign stability and practicality combined'],
    ['gemini', 'libra', 'Air sign communication flows effortlessly between you'],
    ['cancer', 'scorpio', 'Water sign depth creates intense emotional connection'],
    ['leo', 'aries', 'Fire sign energy creates exciting adventures together'],
    ['virgo', 'capricorn', 'Earth sign determination builds solid foundation'],
    ['libra', 'aquarius', 'Air sign intellect and humanitarian values align'],
    ['scorpio', 'pisces', 'Water sign intuition creates profound understanding'],
    ['capricorn', 'virgo', 'Shared Earth element brings practical partnership'],
  ];

  for (const [a, b, msg] of compatPairs) {
    if ((s1 === a && s2 === b) || (s1 === b && s2 === a)) {
      strengths.push(msg);
      break;
    }
  }
}

function commonChallenges(s1: string, s2: string, challenges: string[]): void {
  const conflictPairs: [string, string, string][] = [
    ['aries', 'cancer', 'Aries directness may hurt Cancer sensitive nature'],
    ['taurus', 'sagittarius', 'Taurus stability clashes with Sagittarius need for adventure'],
    ['gemini', 'virgo', 'Geminis changing nature may frustrate Virgos need for order'],
    ['leo', 'scorpio', 'Two strong wills may lead to power struggles'],
    ['libra', 'capricorn', 'Libras casual approach conflicts with Capricorns ambition'],
    ['aquarius', 'pisces', 'Aquarius rationality may clash with Pisces emotional depth'],
  ];

  for (const [a, b, msg] of conflictPairs) {
    if ((s1 === a && s2 === b) || (s1 === b && s2 === a)) {
      challenges.push(msg);
      break;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = CompatibilityQuerySchema.safeParse({
      sign1: searchParams.get('sign1')?.toLowerCase(),
      sign2: searchParams.get('sign2')?.toLowerCase(),
      date1: searchParams.get('date1'),
      date2: searchParams.get('date2'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    let { sign1, sign2, date1, date2, sefirot, chakra, element } = parseResult.data;
    if (!sign1 || !sign2) {
      if (!date1 || !date2) {
        // Return all signs with spiritual correlations
        const allSigns = Object.entries(ZODIAC_SIGNS).map(([key, sign]) => ({
          id: key,
          ...sign,
        }));

        // Filter by spiritual correlations
        if (sefirot) {
          return NextResponse.json({
            success: true,
            signs: allSigns.filter(s => s.sefirot.includes(sefirot)),
          });
        }
        if (chakra) {
          return NextResponse.json({
            success: true,
            signs: allSigns.filter(s => s.chakra === chakra),
          });
        }
        if (element) {
          return NextResponse.json({
            success: true,
            signs: allSigns.filter(s => s.element === element),
          });
        }

        return NextResponse.json({
          success: true,
          signs: allSigns,
          stats: {
            byElement: Object.values(ZODIAC_SIGNS).reduce((acc, s) => {
              acc[s.element] = (acc[s.element] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            byChakra: Object.values(ZODIAC_SIGNS).reduce((acc, s) => {
              acc[s.chakra] = (acc[s.chakra] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
            bySefirot: Object.values(ZODIAC_SIGNS).reduce((acc, s) => {
              s.sefirot.forEach(sf => {
                acc[sf] = (acc[sf] || 0) + 1;
              });
              return acc;
            }, {} as Record<string, number>),
          },
        });
      }
      sign1 = getSignFromDate(date1!) || undefined;
      sign2 = getSignFromDate(date2!) || undefined;
      if (!sign1 || !sign2) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
    }
    if (!ZODIAC_SIGNS[sign1] || !ZODIAC_SIGNS[sign2]) {
      return NextResponse.json(
        { success: false, error: 'Invalid zodiac sign' },
        { status: 400 }
      );
    }
    const result = calculateCompatibility(sign1, sign2);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to calculate compatibility' },
      { status: 500 }
    );
  }
}