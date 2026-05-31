import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const PracticeTypeSchema = z.enum(['mantra', 'breathwork', 'visualization', 'gratitude', 'forgiveness', 'loving-kindness']);
const PracticeQuerySchema = z.object({
  type: PracticeTypeSchema.optional(),
  duration: z.coerce.number().int().positive().optional(),
});

export const dynamic = 'force-dynamic';

// ─── Practice Data ─────────────────────────────────────────────────────────
interface AffirmationPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  duration: number;
  steps: string[];
  affirmations: string[];
  sefirot: string[];
  chakra: string;
  tradition: string;
}

const PRACTICES: AffirmationPractice[] = [
  {
    id: 'mantra-sacred',
    type: 'mantra',
    name: 'Mantra Sagrado',
    nameEn: 'Sacred Mantra',
    description: 'Repetição de mantras sagrados para purificar a mente e elevar a consciência.',
    duration: 15,
    steps: [
      'Escolha um mantra sagrado (Om, So Hum, Ram, etc.)',
      'Sente-se em posição de meditação confortável',
      'Feche os olhos e respire profundamente',
      'Repita o mantra silenciosamente, acompanhando a respiração',
      'Permita que o som do mantra ressoa internamente',
      'Mantenha o foco no som e na sensação de paz',
      'Gradualmente reduza a intensidade e permaneça em silêncio',
    ],
    affirmations: [
      'Eu sou parte da energia universal',
      'O som do mantra purifica minha mente',
      'Minha consciência se expande a cada respiração',
    ],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    tradition: 'Hindu/Yoga',
  },
  {
    id: 'breathwork-purification',
    type: 'breathwork',
    name: 'Respirações Purificadoras',
    nameEn: 'Purifying Breathwork',
    description: 'Técnicas de respiração consciente para limpar canais energéticos e aumentar prana.',
    duration: 10,
    steps: [
      'Posicione-se sentado ou em pé com coluna ereta',
      'Inspire profundamente pelo nariz (4 segundos)',
      'Segure o ar (4 segundos)',
      'Expire completamente pela boca com som (6 segundos)',
      'Repita por 5-10 ciclos',
      'Observe as sensações no corpo',
      'Permaneça em respiração natural por alguns minutos',
    ],
    affirmations: [
      'Eu respiro a energia da vida',
      'Cada respiração traz renovação',
      'Meu corpo está cheio de prana vital',
    ],
    sefirot: ['Ruach', 'Tipheret'],
    chakra: 'Anahata (4º)',
    tradition: 'Tântrico',
  },
  {
    id: 'visualization-light',
    type: 'visualization',
    name: 'Visualização da Luz',
    nameEn: 'Light Visualization',
    description: 'Visualização criativa para conectar-se com a luz divina e energia de cura.',
    duration: 15,
    steps: [
      'Feche os olhos e relaxe o corpo',
      'Visualize uma esfera de luz dourada acima da sua cabeça',
      'Permita que a luz desça lentamente, preenchendo sua aura',
      'Sinta a luz atravessando cada célula do seu corpo',
      'Visualize a luz se expandindo em todas as direções',
      'Imagine-se envolvido em uma esfera de luz protetora',
      'Agradeça pela energia recebida',
    ],
    affirmations: [
      'Eu sou luz',
      'A luz divina me protege e cura',
      'Sou um canal de energia positiva',
    ],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 'Manipura (3º)',
    tradition: 'Místico',
  },
  {
    id: 'gratitude-practice',
    type: 'gratitude',
    name: 'Prática de Gratidão',
    nameEn: 'Gratitude Practice',
    description: 'Cultivo consciente da gratidão para atrair abundância e felicidade.',
    duration: 10,
    steps: [
      'Sente-se confortavelmente e feche os olhos',
      'Pense em três coisas pelas quais você é grato hoje',
      'Sinta a emoção de gratidão no coração',
      'Visualize essas bênçãos crescendo e se multiplicando',
      'Agradeça mentalmente por cada aspecto da sua vida',
      'Permita que a gratidão encha seu ser',
      'Faça uma intenção de compartilhar gratidão com outros',
    ],
    affirmations: [
      'Sou grato por toda a bênção em minha vida',
      'A gratidão atrai mais abundância',
      'Cada dia traz novas razões para agradecer',
    ],
    sefirot: ['Netzach', 'Hod'],
    chakra: 'Anahata (4º)',
    tradition: 'Universal',
  },
  {
    id: 'forgiveness-ritual',
    type: 'forgiveness',
    name: 'Ritual de Perdão',
    nameEn: 'Forgiveness Ritual',
    description: 'Prática de perdão para libertar mágoas e restabelecer a paz interior.',
    duration: 20,
    steps: [
      'Encontre um momento de solitude',
      'Identifique uma pessoa ou situação que precisa de perdão',
      'Visualize a pessoa à sua frente',
      'Diga em silêncio: "Eu te perdoo"',
      'Sinta o peso sendo libertado do seu coração',
      'Visualize uma luz dourada entre vocês',
      'Libere completamente e deseje paz para ambos',
    ],
    affirmations: [
      'Eu perdoo a mim mesmo e aos outros',
      'O perdão liberta minha alma',
      'Escolho a paz sobre o ressentimento',
    ],
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 'Anahata (4º)',
    tradition: 'Cristão/Espiritual',
  },
  {
    id: 'loving-kindness',
    type: 'loving-kindness',
    name: 'Metta Bhavana (Amor Bondoso)',
    nameEn: 'Loving Kindness Meditation',
    description: 'Cultivo do amor bondoso (metta) para desenvolver compaixão e conexão.',
    duration: 25,
    steps: [
      'Sente-se em meditação com o coração aberto',
      'Comece enviando amor a você mesmo: "Que eu seja feliz"',
      'Expanda para um benefactor: "Que [nome] seja feliz"',
      'Inclua um amigo: "Que meu amigo seja feliz"',
      'Adicione alguém neutro: "Que ele/ela seja feliz"',
      'Estenda para alguém difícil: "Que meu inimigo seja feliz"',
      'Abra para todos os seres: "Que todos os seres sejam felizes"',
    ],
    affirmations: [
      'Que eu seja feliz e em paz',
      'Que todos os seres sejam felizes',
      'O amor é minha natureza fundamental',
    ],
    sefirot: ['Chesed', 'Netzach'],
    chakra: 'Anahata (4º)',
    tradition: 'Budista/Theravada',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = PracticeQuerySchema.safeParse({
    type: searchParams.get('type'),
    duration: searchParams.get('duration'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, duration } = parseResult.data;
  let practices = [...PRACTICES];

  if (type) {
    practices = practices.filter(p => p.type === type);
  }

  if (duration) {
    practices = practices.filter(p => p.duration <= duration);
  }

  return NextResponse.json({
    success: true,
    practices,
    count: practices.length,
    total: PRACTICES.length,
  });
}