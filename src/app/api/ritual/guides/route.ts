import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const RitualGuidesQuerySchema = z.object({
  category: z.string().optional(),
  id: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});
export const dynamic = 'force-dynamic';
interface RitualGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  materials: string[];
  steps: string[];
  intention?: string;
  bestTime?: string;
  benefits?: string[];
  precautions?: string[];
}
const guides: RitualGuide[] = [
  {
    id: 'guide-001',
    title: 'Ritual de Protecao Divina',
    description: 'Ritual sagrado para criar um escudo energetico e proteger seu espaco de influencias negativas.',
    category: 'protection',
    duration: '30 minutos',
    difficulty: 'beginner',
    materials: [
      'Vela branca',
      'Sal grosso',
      'Alho',
      'Agua benta',
      'Imagem de Sao Jorge'
    ],
    steps: [
      'Purifique o ambiente com sal grosso nos cantos',
      'Acenda a vela branca com intencao de protecao',
      'Faca a invocacao de protecao',
      'Passe o alho nos quatros cantos da casa',
      'Beba a agua benta purificada',
      'Agradeza e finalize o ritual'
    ],
    intention: 'Protecao e segurança energetica',
    bestTime: 'Quarta-feira à noite',
   enefits: [
      'Escudo energetico contra negatividade',
      'Protecao durante jornadas difficult',
      'Harmonizacao do espaco habitado',
      'Fortalecimento da aura'
    ],
    precautions: [
      'Nao realize durante fases lunares descrescentes',
      'Evite interrupcoes durante o ritual',
      'Nao utilize se estiver em luto recente'
    ]
  },
  {
    id: 'guide-002',
    title: 'Ritual de Abundancia e Prosperidade',
    description: 'Pratica sagrada para atraer prosperidade e abrir caminhos para a abundancia.',
    category: 'prosperity',
    duration: '45 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela verde',
      'Vela dourada',
      'Moedas de cobre',
      'Canela em pau',
      'Mel',
      'Arruda'
    ],
    steps: [
      'Organize o altar com as velas verde e dourada',
      'Coloque as moedas no centro do altar',
      'Acenda a canela em pau como incenso',
      'Faca a oracao de prosperidade tres vezes',
      'Misture o mel com agua eNamesgua nos cantos',
      'Enterre as moedas no Jardim ou vaso de planta',
      'Agradeza pela abundancia que vir'
    ],
    intention: 'Abundancia em todas as areas da vida',
    bestTime: 'Quinta-feira ao amanhecer',
   enefits: [
      'Atrair oportunidades de prosperidade',
      'Abrir caminhos bloqueados',
      'Aumentar a vibracao de abundancia',
      'Fortalecer a mediunidade financeira'
    ],
    precautions: [
      'Evite pensamentos de carencia durante o ritual',
      'Nao conte sobre o ritual para terceiros',
      'Mantenha disciplina espiritual apos o ritual'
    ]
  },
  {
    id: 'guide-003',
    title: 'Ritual de Cura Emocional',
    description: 'Ritual profundo para liberacao de blocueios emocionais e curacao da alma.',
    category: 'healing',
    duration: '60 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela roxa',
      'Vela azul',
      'Petala de rosas brancas',
      'Oleo de lavanda',
      'Cristal de quartzo',
      'Agua salgada'
    ],
    steps: [
      ' Tome um banho purificante com agua salgada',
      'Aplique o oleo de lavanda nos pulsos e na nuca',
      'Sente-se em quietude e acenda a vela roxa',
      'Segure o cristal de quartzo sobre o chakra do coracao',
      'Faca tres respiracoes profundas',
      'Libere mentalmente todas as dores passadas',
      'Visualize uma luz curadora envolvendo seu ser',
      'Agradeca pela curacao recebida'
    ],
    intention: 'Liberacao de dores emocionais e curacao',
    bestTime: 'Segunda-feira à noite em Lua cheia',
   enefits: [
      'Liberacao de traumas emocionais',
      'Curacao de feridas da alma',
      'Renovacao emocional profunda',
      'Abertura para nova fase de vida'
    ],
    precautions: [
      'Permita-se chorar se necessario',
      'Evite forcar emocoes apenas por protocolo',
      'Busque acompanhamento terapeutico se necessario'
    ]
  },
  {
    id: 'guide-004',
    title: 'Ritual de Manifestacao de Intencoes',
    description: 'Ritual poderoso para materializar deseos e concretizar propositos de vida.',
    category: 'manifestation',
    duration: '40 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela dourada',
      'Vela laranja',
      'Papel e caneta',
      'Incenso de sálvia',
      'Mesaquare',
      'Imagen do Orixá ancestral'
    ],
    steps: [
      'Escreva claramente seu deseo no papel',
      'Dobre o papel tres vezes em formato de envelope',
      'Acenda o incenso de sage para purificacao',
      'Coloque o papel sob a imagem sagrada',
      'Acenda as velas dourada e laranja',
      'Faca a declaracao de manifestacao em voz alta',
      'Visualize intensamente seu deseo ja realizado',
      'Guarde o papel em lugar sagrado e discreto',
      'Agradeca pelo tempo e pelo espaco para que seu deseo se manifeste'
    ],
    intention: 'Manifestacao do desejo escrito',
    bestTime: 'Quinta-feira durante Lua crescente',
   enefits: [
      'Alinhamento com o propose divino',
      'Clique para a concretizacao de metas',
      'Atrair pessoas e situacoes favoraveis',
      'Renovacao da esperan a e determinacao'
    ],
    precautions: [
      'Nao escreva desejos que prejudiquem outros',
      'Evite duvidar da manifestacao apos o ritual',
      'Mantenha o papel guardado por pelo menos 30 dias'
    ]
  },
  {
    id: 'guide-005',
    title: 'Ritual de Liberacao e Desapego',
    description: 'Pratica sagrada para soltar o que já nao serve mais e encontrar paz interior.',
    category: 'release',
    duration: '35 minutos',
    difficulty: 'beginner',
    materials: [
      'Vela preta',
      'Vela branca',
      'Papel para queimar',
      'Fósforos',
      'Pimenta do reino',
      'Sal'
    ],
    steps: [
      'Escreva no papel tudo o que deseja soltar',
      'Acenda a vela preta',
      'Coloque o papel numa tigela metalica',
      'Jogue a pimenta do reino e o sal sobre o papel',
      'Enquanto queima o papel, repita palavras de liberacao',
      'Visualize cada problema ou pessoa sendo transformado em cinzas',
      'Jogue as cinzas em local onde voce nunca mais passara',
      'Acenda a vela branca em gratidao',
      'Beba um copo de agua para integration da nova energia'
    ],
    intention: 'Liberacao completa de personas, situacoes e circunstancias',
    bestTime: 'Quarta-feira durante Lua minguante',
   enefits: [
      'Libertacao de Relacionamentos tóxicos',
      'Desapego de situações que nao servem mais',
      'Espaco interior para novas posibilidades',
      'Aliviamento emocional profundo'
    ],
    precautions: [
      'Nao rituals com odio ou rancor contra pessoas',
      'Realize com conhecimento de que voce esta liberando situacoes, nao pessoas',
      'Apos o ritual, tomeinitiativas concretas para mudar'
    ]
  },
  {
    id: 'guide-006',
    title: 'Ritual de Conexao com os Orixás',
    description: 'Ritual sagrado para fortalecer a conexao com seus Orixás ancestrais.',
    category: 'clarity',
    duration: '90 minutos',
    difficulty: 'advanced',
    materials: [
      'Objetos sagrados do Orixá de cabeceira',
      'Akere para todos',
      'Ewé (folhas)',
      'Velas coloridas conforme cada Orixá',
      'Alimentos para Offerings',
      'Kolonia',
      'Palavra de Oxalá'
    ],
    steps: [
      'Faca uma purificacao com banhos de folhas ewé',
      'Acenda as velas correspondentes aos Orixás',
      'Coloque os objetos sagrados organizados no altar',
      'Faca as offerte aos Orixás',
      'Cante os pontos riscados de cada divindade',
      'receba os pontos cantados para protecao',
      'Faca oracoes de agradecimento',
      'Oferea o axexe aos orixás com gratidao',
      'Encerre com a palavra de Oxala',
      'Guarde o axexe de acordo com a tradicao'
    ],
    intention: 'Conexao spiritual profunda e protecao dos Orixás',
    bestTime: 'Sexta-feira ou dia especifico do Orixá de cabeceira',
   enefits: [
      'Fortalecimento da mediunidade ancestral',
      'Protecao espiritual dos Orixás',
      'Alinhamento com o caminho espiritual',
      'Abertura para orientacoes espirituais'
    ],
    precautions: [
      'Somente para pessoas ja iniciaDas no candomblé',
      'Evite realizar sem o acompanhamento de um Babalawo ou Yalorixa',
      'Respeite tabus e pravas especificas de cada Orixá'
    ]
  },
  {
    id: 'guide-007',
    title: 'Ritual de Amarracao do Destino',
    description: 'Ritual poderoso para fortalecer lacos afetivos e unir dua almas.',
    category: 'love',
    duration: '50 minutos',
    difficulty: 'advanced',
    materials: [
      'Vela vermelha',
      'Vela rosa',
      'Defumador com patchouli',
      'Duas fitas vermelhas',
      'Perfume de musk',
      'Flores vermelhas e rosas',
      'Mel'
    ],
    steps: [
      'Escreva os dois nomes em um papel',
      'Acenda as velas vermelha e rosa lado a lado',
      'Faca o defumador de patchouli',
      'Una as duas fitas vermelhas enquanto rezam juntos',
      'Aplique o perfume de musk nos pulsos',
      'Coloque as flores ao redor das velas',
      'Faca a ligacao dos nomes com fitas enquanto le a oracao',
      'Una as pessoas envolvidas ao redor do altar',
      'Dee um ao outro mel symbolizando a doçura do amor',
      'Enterrem as fitas united num vaso de flores'
    ],
    intention: 'Fortalecimento de laços afetivos e amor duradouro',
    bestTime: 'Sexta-feira à noite em Lua crescente',
   enefits: [
      'Fortalecimento de laços emocionais',
      'Aprofundamento da conexao afetiva',
      'Protecao do relacionamento contra energias negativas',
      'Renovacao do compromisso e dediCacao'
    ],
    precautions: [
      'Jamais use para forcar o amor de outra pessoa',
      'Realize apenas com consentimento de ambas as pessoas',
      'Evite usar em casos de violencia domestica'
    ]
  },
  {
    id: 'guide-008',
    title: 'Ritual de Transformacao Interior',
    description: 'Pratica profunda para renovaCao interior, mudar velhos padroes e evoluir consciousness.',
    category: 'transformation',
    duration: '60 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela laranja',
      'Vela dourada',
      'Incenso de olibano',
      'Espelho pequeno',
      'Flor de lotus',
      'Agua de flor de laranj',
      'Mantra para a transformacao'
    ],
    steps: [
      'Acenda o incenso de olibano para abrir espaco sagrado',
      'Coloque o espelho à sua frente',
      'Acenda as velas laranja e dourada refletidas no espelho',
      'Observe-se no espelho e reconheca seus padroes velhos',
      'Fale em voz alta o que deseja transformar',
      'Coloque a flor de lotus sobre o peito',
      'Aplique a agua de flor de larango na testa e pulsos',
      'Repita o mantra de transformacao',
      'Visualize-se ja transformado(a) emanando a nova energia',
      'AgradeCa pela transformacao em curso'
    ],
    intention: 'Renovacao interior e libertaCao de velhos padroes',
    bestTime: 'Domingo ao amanhecer ou durante eclipse',
   enefits: [
      'Libertacao de padroes limitantes',
      'Acceleracao do processo evolutivo',
      'Abertura para nova versao de voce mesmo',
      'Fortafecimento da auto estima e proposito'
    ],
    precautions: [
      'Escolha uma area especifica para trabalhar',
      'Evite abordar multiplos pontos ao mesmo tempo',
      'Mantenha pratica regular para consolodar mudancas'
    ]
  }
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const id = url.searchParams.get('id');
  const difficulty = url.searchParams.get('difficulty');

  return NextResponse.json({
    guides: guides,
    total: guides.length,
    categories: [...new Set(guides.map((g) => g.category))],
    difficulties: ['beginner', 'intermediate', 'advanced'],
    filtered: !!category || !!id || !!difficulty,
  });
}
