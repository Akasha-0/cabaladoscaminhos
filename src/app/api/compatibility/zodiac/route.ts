// ============================================================
// COMPATIBILITY ZODIAC API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ZodiacSignSchema = z.enum([
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes',
  // English aliases
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);
const CompatibilityQuerySchema = z.object({
  sign1: z.string().min(1, 'sign1 é obrigatório').optional(),
  sign2: z.string().min(1, 'sign2 é obrigatório').optional(),
  date1: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  date2: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
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
}
const ZODIAC_SIGNS = {
  aries: {
    modality: 'Cardinal',
    quality: ['Energético', 'Iniciativa', 'Corajoso', 'Impulsivo'],
    rulingPlanet: 'Marte',
    symbol: '♈',
    traits: ['Impulsivo', 'Corajoso', 'Independente', 'Competitivo', 'Entusiasta'],
    dates: '21 Mar - 19 Abr',
  },
  taurus: {
    name: 'Touro',
    element: 'Earth',
    modality: 'Fixed',
    quality: ['Estável', 'Persistentes', 'Recursoso', 'Teimoso'],
    rulingPlanet: 'Vênus',
    symbol: '♉',
    traits: ['Territorial', 'Leal', 'Paciente', 'Prático', 'Sensual'],
    dates: '20 Abr - 20 Mai',
  },
  gemini: {
    name: 'Gêmeos',
    element: 'Air',
    modality: 'Mutable',
    quality: ['Versátil', 'Comunicativo', 'Curioso', 'Inconsistente'],
    rulingPlanet: 'Mercúrio',
    symbol: '♊',
    traits: ['Curioso', 'Versátil', 'Comunicativo', 'Intellectual', 'Nervoso'],
    dates: '21 Mai - 20 Jun',
  },
  cancer: {
    name: 'Câncer',
    element: 'Water',
    modality: 'Cardinal',
    quality: ['Intuitivo', 'Emotivo', 'Protetor', 'Vulnerável'],
    rulingPlanet: 'Lua',
    symbol: '♋',
    traits: ['Intuitivo', 'Emocional', 'Leal', 'Protetor', 'Brincalhão'],
    dates: '21 Jun - 22 Jul',
  },
  leo: {
    name: 'Leão',
    element: 'Fire',
    modality: 'Fixed',
    quality: ['Criativo', 'Dramático', 'Generoso', 'Egocêntrico'],
    rulingPlanet: 'Sol',
    symbol: '♌',
    traits: ['Confiante', 'Criativo', 'Generoso', 'Orgulhoso', 'Dramático'],
    dates: '23 Jul - 22 Ago',
  },
  virgo: {
    name: 'Virgem',
    element: 'Earth',
    modality: 'Mutable',
    quality: ['Analítico', 'Prático', 'Organizado', 'Crítico'],
    rulingPlanet: 'Mercúrio',
    symbol: '♍',
    traits: ['Analítico', 'Organizado', 'Trabalhador', 'Perfeccionista', 'Modesto'],
    dates: '23 Ago - 22 Set',
  },
  libra: {
    name: 'Libra',
    element: 'Air',
    modality: 'Cardinal',
    quality: ['Diplomático', 'Harmonioso', 'Romântico', 'Indeciso'],
    rulingPlanet: 'Vênus',
    symbol: '♎',
    traits: ['Diplomático', 'Gracioso', 'Fairplay', 'IndECISO', 'Romântico'],
    dates: '23 Set - 22 Out',
  },
  scorpio: {
    name: 'Escorpião',
    element: 'Water',
    modality: 'Fixed',
    quality: ['Passionate', 'Determined', 'Intense', 'Secretive'],
    rulingPlanet: 'Plutão',
    symbol: '♏',
    traits: ['Intenso', 'Passionado', 'Misterioso', 'Determinado', 'Ciumento'],
    dates: '23 Out - 21 Nov',
  },
  sagittarius: {
    name: 'Sagitário',
    element: 'Fire',
    modality: 'Mutable',
    quality: ['Optimistic', 'Adventurous', 'Philosophical', 'Tactless'],
    rulingPlanet: 'Júpiter',
    symbol: '♐',
    traits: ['Otimista', 'Aventureiro', 'Honesto', 'Extrovertido', 'Irrefletido'],
    dates: '22 Nov - 21 Dez',
  },
  capricorn: {
    name: 'Capricórnio',
    element: 'Earth',
    modality: 'Cardinal',
    quality: ['Ambitious', 'Disciplined', 'Patient', 'Pessimistic'],
    rulingPlanet: 'Saturno',
    symbol: '♑',
    traits: ['Ambicioso', 'Disciplinado', 'Responsável', 'Reservado', 'Teimoso'],
    dates: '22 Dez - 19 Jan',
  },
  aquarius: {
    name: 'Aquário',
    element: 'Air',
    modality: 'Fixed',
    quality: ['Independent', 'Intellectual', 'Humanitarian', 'Detached'],
    rulingPlanet: 'Urano',
    symbol: '♒',
    traits: ['Independente', 'Original', 'Humanitário', 'Eccêntrico', 'Frio'],
    dates: '20 Jan - 18 Fev',
  },
  pisces: {
    name: 'Peixes',
    element: 'Water',
    modality: 'Mutable',
    quality: ['Compassionate', 'Artistic', 'Intuitive', 'Escapist'],
    rulingPlanet: 'Netuno',
    symbol: '♓',
    traits: ['Compassivo', 'Artístico', 'Criativo', 'Senciente', 'Confuso'],
    dates: '19 Fev - 20 Mar',
  },
};

const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  Fire: { Fire: 100, Earth: 40, Air: 90, Water: 30 },
  Earth: { Fire: 40, Earth: 100, Air: 50, Water: 90 },
  Air: { Fire: 90, Earth: 50, Air: 100, Water: 40 },
  Water: { Fire: 30, Earth: 90, Air: 40, Water: 100 },
};

const MODALITY_COMPATIBILITY: Record<string, Record<string, number>> = {
  Cardinal: { Cardinal: 70, Fixed: 60, Mutable: 80 },
  Fixed: { Cardinal: 60, Fixed: 100, Mutable: 50 },
  Mutable: { Cardinal: 80, Fixed: 50, Mutable: 100 },
};


function getSignFromDate(date: string): string | null {
  const month = parseInt(date.split('-')[1], 10);
  const day = parseInt(date.split('-')[2], 10);

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

  return null;
}

function calculateCompatibility(sign1: string, sign2: string): CompatibilityResult {
  const z1 = ZODIAC_SIGNS[sign1];
  const z2 = ZODIAC_SIGNS[sign2];

  if (!z1 || !z2) {
    throw new Error('Invalid zodiac sign');
  }

  const elementScore = ELEMENT_COMPATIBILITY[z1.element]?.[z2.element] ?? 50;
  const modalityScore = MODALITY_COMPATIBILITY[z1.modality]?.[z2.modality] ?? 60;

  const overallScore = Math.round((elementScore + modalityScore) / 2);
  const elementCompatible = elementScore >= 80;
  const strengths: string[] = [];
  const challenges: string[] = [];
  const tips: string[] = [];

  if (elementCompatible) {
    strengths.push(`Vocês compartilham o elemento ${z1.element === z2.element ? z1.element : ''}, criando uma sintonia natural`);
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

  if (z1.rulingPlanet === z2.element || z2.rulingPlanet === z1.element) {
    strengths.push('A planetary ruler of one sign influences the other element, creating fascinating dynamics');
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

  tips.push(`/${z1.name} deve respeitar a necessidade de ${z2.name} de cautela`);
  tips.push(`${z2.name} deve permitir que ${z1.name} expresse sua natureza assertiva`);

  let description = '';
  if (overallScore >= 80) {
    description = `A compatibilidade entre ${z1.name} e ${z2.name} é excepcional. Vocês se entendem naturalmente e têm potencial para um relacionamento profundo e gratificante. O elemento ${z1.element} traz energia que o elemento ${z2.element} complementa`;
  } else if (overallScore >= 60) {
    description = `${z1.name} e ${z2.name} têm uma compatibilidade boa com potencial de crescimento. Com沟通 e compreensão mútua, vocês podem construir um relacionamento significativo`;
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
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    let { sign1, sign2, date1, date2 } = parseResult.data;
    if (!sign1 || !sign2) {
      if (!date1 || !date2) {
        return NextResponse.json(
          { error: 'Provide either sign1/sign2 or date1/date2 parameters' },
          { status: 400 }
        );
      }
      sign1 = getSignFromDate(date1) || undefined;
      sign2 = getSignFromDate(date2) || undefined;
      if (!sign1 || !sign2) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
    }
    if (!ZODIAC_SIGNS[sign1] || !ZODIAC_SIGNS[sign2]) {
      return NextResponse.json(
        { error: 'Invalid zodiac sign' },
        { status: 400 }
      );
    }
    const result = calculateCompatibility(sign1, sign2);
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to calculate compatibility' },
      { status: 500 }
    );
  }
}