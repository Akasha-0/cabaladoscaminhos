import { NextRequest, NextResponse } from 'next/server';

// Ritual library complete data
const rituals = [
  // Protection Rituals
  {
    id: 'protection-candle',
    nome: 'Ritual da Vela Protetora',
    tipo: 'proteção',
    duracao: '30 minutos',
    descricao: 'Ritual de proteção usando vela branca e sal grosso para criar uma barreira energética.',
    materiais: ['Vela branca', 'Sal grosso', 'Alho', 'Alecrim'],
    passos: [
      'Acenda a vela branca no centro do altar',
      'Despeje um círculo de sal grosso ao redor',
      'Coloque os dentes de alho dentro do círculo',
      'Adicione alecrim sobre o sal',
      'Recite a oração de proteção 3 vezes',
      'Deixe a vela queimar até o fim'
    ],
    significado: 'Cria uma barreira protetora contra energias negativas',
    keywords: ['proteção', 'segurança', 'barreira', 'limpeza']
  },
  {
    id: 'protection-salt-bath',
    nome: 'Banho de Sal e Arruda',
    tipo: 'proteção',
    duracao: '20 minutos',
    descricao: 'Ritual de purificação usando sal grosso e arruda para remover energias negativas.',
    materiais: ['Sal grosso', 'Arruda', 'Alcachofra', 'Água'],
    passos: [
      'Ferva 1 litro de água',
      'Adicione o sal grosso à água fervente',
      'Jogue arruda e alcachofra na mistura',
      'Deixe esfriar até temperatura ambiente',
      'Coe e despeje sobre o corpo',
      'Enxágue com água corrente'
    ],
    significado: 'Purifica o campo áurico e remove energias densas',
    keywords: ['purificação', 'banho', 'limpeza', 'proteção']
  },
  // Abundance Rituals
  {
    id: 'abundance-candle',
    nome: 'Vela da Abundância',
    tipo: 'abundância',
    duracao: '40 minutos',
    descricao: 'Ritual para manifestar prosperidade usando vela verde e moedas.',
    materiais: ['Vela verde', '7 moedas de cobre', 'Canela', 'Mel'],
    passos: [
      'Coloque a vela verde no centro do altar',
      'Disponha as 7 moedas em círculo ao redor',
      'Polvilhe canela sobre as moedas',
      'Desenhe um símbolo de riqueza na vela',
      'Acenda a vela enquanto visualiza abundância',
      'Agradeça pela prosperidade que virá'
    ],
    significado: 'Atrai prosperidade e abre caminhos para a abundância',
    keywords: ['abundância', 'prosperidade', 'dinheiro', 'riqueza']
  },
  {
    id: 'full-moon-abundance',
    nome: 'Ritual da Lua Cheia',
    tipo: 'abundância',
    duracao: '25 minutos',
    descricao: 'Ritual poderoso realizado na lua cheia para amplificar intenções.',
    materiais: ['Cristal de quartzo', 'Água lunar', 'Papel branco', 'Caneta dourada'],
    passos: [
      'Escreva seu desejo no papel branco com caneta dourada',
      'Coloque a água lunar em um recipiente de vidro',
      'Mergulhe o cristal de quartzo na água',
      'Coloque o papel dobrado ao lado',
      'Exponha à luz da lua cheia por 15 minutos',
      'Guarde o papel em lugar sagrado'
    ],
    significado: 'Amplifica intenções e manifesta desejos',
    keywords: ['lua cheia', 'manifestação', 'intenção', 'amplificação']
  },
  // Love Rituals
  {
    id: 'love-candle',
    nome: 'Vela do Amor',
    tipo: 'amor',
    duracao: '35 minutos',
    descricao: 'Ritual romântico para atrair amor ou fortalecer relacionamentos.',
    materiais: ['Vela rosa', 'Vela vermelha', 'Pétalas de rosa', 'Perfume de jasmim'],
    passos: [
      'Acenda a vela rosa à esquerda e vermelha à direita',
      'Coloque as pétalas de rosa entre as velas',
      'Aplique perfume de jasmim nos pulsos',
      'Visualize a pessoa amada em sua mente',
      'Recite o mantra de amor 7 vezes',
      'Deixe as velas queimarem juntas'
    ],
    significado: 'Abre o coração para o amor verdadeiro',
    keywords: ['amor', 'relacionamento', 'atração', 'coração']
  },
  {
    id: 'self-love-bath',
    nome: 'Banho de Amor Próprio',
    tipo: 'amor',
    duracao: '30 minutos',
    descricao: 'Ritual de autoconhecimento e amor próprio para fortalecer a autoestima.',
    materiais: ['Rosa vermelha', 'Velas cor de rosa', 'Espelho pequeno', 'Água morna'],
    passos: [
      'Encha a banheira com água morna',
      'Adicione pétalas de rosa vermelha',
      'Acenda as velas cor de rosa ao redor',
      'Segure o espelho diante do seu rosto',
      'Olhe nos seus próprios olhos e declare amor próprio',
      'Permaneça na banheira em silêncio meditativo'
    ],
    significado: 'Fortalece o amor próprio e a autoaceitação',
    keywords: ['amor próprio', 'autoestima', 'autoconhecimento', 'aceitação']
  },
  // Cleansing Rituals
  {
    id: 'smudging',
    nome: 'Ritual de Smudging',
    tipo: 'limpeza',
    duracao: '20 minutos',
    descricao: 'Purificação energética usando ervas sagradas queimadas.',
    materiais: ['Sálvia branca', 'Arruda', 'Pau-brasil', 'Concha', 'Fósforo'],
    passos: [
      'Acenda as ervas na concha até criar fumaça',
      'Segure a concha com a mão esquerda',
      'Passe a fumaça pelo corpo da cabeça aos pés',
      'Não se esqueça das costas e solas dos pés',
      'Abençoe cada cômodo da casa',
      'Ao final, agradeça às ervas pela limpeza'
    ],
    significado: 'Purifica espaços e pessoas de energias densas',
    keywords: ['purificação', 'smudging', 'ervas', 'limpeza']
  },
  {
    id: 'egg-cleanse',
    nome: 'Limpeza com Ovo',
    tipo: 'limpeza',
    duracao: '25 minutos',
    descricao: 'Técnica de limpeza áurica usando ovo de galinha.',
    materiais: ['Ovo de galinha fresco', 'Vela branca', 'Sal grosso', 'Copo de vidro'],
    passos: [
      'Acenda a vela branca',
      'Segure o ovo na mão direita sobre a pessoa',
      'Passe o ovo por todo o corpo em movimentos circulares',
      'Repita por 10 minutos',
      'Quebre o ovo no copo de vidro com sal',
      'Observe o estado da gema para interpretar'
    ],
    significado: 'Remove energias negativas do campo áurico',
    keywords: ['limpeza', 'purificação', ' aura', 'cura']
  },
  // Ancestral Rituals
  {
    id: 'ancestral-offering',
    nome: 'Oferenda aos Ancestrais',
    tipo: 'ancestral',
    duracao: '45 minutos',
    descricao: 'Ritual de conexão com ancestrais através de oferendas.',
    materiais: ['Água limpa', 'Flor branca', 'Vela dourada', 'Prato branco', 'Comida favorita'],
    passos: [
      'Prepare um prato branco com comida favorita',
      'Coloque água limpa em um copo ao lado',
      'Acenda a vela dourada',
      'Coloque uma flor branca sobre o prato',
      'Convide seus ancestrais a se aproximarem',
      'Fale com eles, compartilhe novidades e agradeça'
    ],
    significado: 'Estabelece conexão com a linhagem ancestral',
    keywords: ['ancestrais', 'ancestralidade', 'oferenda', 'tradição']
  },
  {
    id: 'altar-maintenance',
    nome: 'Manutenção do Altar',
    tipo: 'ancestral',
    duracao: '30 minutos',
    descricao: 'Ritual regular para manter a energia do altar sagrado.',
    materiais: ['Velas', 'Incenso', 'Água', 'Flores frescas', 'Pano branco'],
    passos: [
      'Limpe o altar com pano branco úmido',
      'Troque a água dos recipientes',
      'Acenda velas frescas',
      'Queime incenso de sua preferência',
      'Coloque flores frescas',
      'Reorganize os objetos com intenção'
    ],
    significado: 'Mantém a energia vital do altar sagrado',
    keywords: ['altar', 'manutenção', 'sagrado', 'energia']
  },
  // Spiritual Growth Rituals
  {
    id: 'meditation-candle',
    nome: 'Vela da Meditação',
    tipo: 'crescimento',
    duracao: '45 minutos',
    descricao: 'Ritual para aprofundar a prática meditativa.',
    materiais: ['Vela azul', 'Incenso de sândalo', 'Cristal de lapis lazuli', 'Almofada'],
    passos: [
      'Prepare um espaço tranquilo para meditação',
      'Sente-se na almofada em posição confortável',
      'Acenda a vela azul e o incenso',
      'Segure o cristal de lapis lazuli',
      'Medite por 30 minutos em silêncio',
      'Gradualmente abra os olhos e agradeça'
    ],
    significado: 'Aprofunda a meditação e abre a intuição',
    keywords: ['meditação', 'intuição', 'crescimento', 'paz']
  },
  {
    id: 'new-beginnings',
    nome: 'Ritual de Novos Começos',
    tipo: 'crescimento',
    duracao: '35 minutos',
    descricao: 'Ritual para iniciar novos projetos ou fases da vida.',
    materiais: ['Vela laranja', 'Caneta nova', 'Papel amarelo', 'Porta-jóias pequeno'],
    passos: [
      'Escreva no papel amarelo o que deseja iniciar',
      'Dobre o papel 3 vezes no sentido horário',
      'Coloque dentro do porta-jóias junto com a caneta',
      'Acenda a vela laranja',
      'Segure o porta-jóias e declare sua intenção',
      'Guarde em lugar especial até concretização'
    ],
    significado: 'Marcaprojetos novos e ciclos de renovação',
    keywords: ['novos começos', 'início', 'renovação', 'projeto']
  },
  // Healing Rituals
  {
    id: 'healing-hands',
    nome: 'Ritual das Mãos Curadoras',
    tipo: 'cura',
    duracao: '30 minutos',
    descricao: 'Ritual para energizar as mãos para cura energética.',
    materiais: ['Vela violeta', 'Óleo de coco', 'Cristal de ametista', 'Água com sal'],
    passos: [
      'Lave bem as mãos com água e sal',
      'Aplique óleo de coco nas palmas',
      'Acenda a vela violeta',
      'Segure a ametista entre as mãos por 5 minutos',
      'Visualize energia curadora fluindo',
      'Agradeça pela energia de cura recebida'
    ],
    significado: 'Energiza as mãos para trabalho de cura',
    keywords: ['cura', 'energia', 'mãos', 'terapêutico']
  },
  {
    id: 'sleep-ritual',
    nome: 'Ritual do Sono Tranquilo',
    tipo: 'cura',
    duracao: '20 minutos',
    descricao: 'Ritual para preparar o corpo e a mente para um sono reparador.',
    materiais: ['Vela lavanda', 'Travesseiro de ervas', 'Água de lavanda', 'Cristal de lepidolita'],
    passos: [
      'Pulverize água de lavanda no travesseiro',
      'Coloque o cristal de lepidolita sob o travesseiro',
      'Acenda a vela lavanda',
      'Respire profundamente 7 vezes',
      'Apague a vela com gratidão',
      'Deite-se em paz e silêncio'
    ],
    significado: 'Promove sono profundo e reparador',
    keywords: ['sono', 'descanso', 'tranquilidade', 'relaxamento']
  },
  // Chakra Rituals
  {
    id: 'chakra-cleansing',
    nome: 'Limpeza dos Chakras',
    tipo: 'chakras',
    duracao: '50 minutos',
    descricao: 'Ritual completo de limpeza e equilíbrio dos 7 chakras principais.',
    materiais: ['7 velas coloridas', 'Incenso de olibano', 'Cristais correspondentes', 'Óleo de cânfora'],
    passos: [
      'Posicione as 7 velas em ordem do arco-íris',
      'Acenda cada vela começando pela raiz',
      'Queime incenso de olibano',
      'Aplique óleo nos pontos dos chakras',
      'Visualize cada chakra se abrindo e limpando',
      'Agradeça ao final com todas as velas acesas'
    ],
    significado: 'Equilibra e limpa todos os chakras',
    keywords: ['chakras', 'equilíbrio', 'energia', 'harmonia']
  },
  // Full Moon Rituals
  {
    id: 'full-moon-water',
    nome: 'Carregar Água na Lua Cheia',
    tipo: 'lua cheia',
    duracao: '15 minutos',
    descricao: 'Ritual para carregar água com energia da lua cheia.',
    materiais: ['Frasco de vidro transparente', 'Água filtrada', 'Prato branco', 'Flores brancas'],
    passos: [
      'Encha o frasco com água filtrada',
      'Feche bem e coloque no prato branco',
      'Decore com flores brancas ao redor',
      'Exponha à luar na noite de lua cheia',
      'Deixe de 3 a 12 horas',
      'Colete ao amanhecer e guarde protegido'
    ],
    significado: 'Energiza água com força lunar para uso ritual',
    keywords: ['lua cheia', 'água lunar', 'energia', 'carregamento']
  },
  // New Moon Rituals
  {
    id: 'new-moon-intentions',
    nome: 'Ritual da Lua Nova',
    tipo: 'lua nova',
    duracao: '30 minutos',
    descricao: 'Ritual para plantar sementes de intenção na lua nova.',
    materiais: ['Papel marrom', 'Caneta preta', 'Vela preta', 'Terra'],
    passos: [
      'Escreva suas intenções no papel marrom',
      'Dobre o papel no sentido anti-horário',
      'Acenda a vela preta',
      'Plante o papel dobrado na terra',
      'Regue com intenção de germinação',
      'Agradeça pela manifestação que virá'
    ],
    significado: 'Planta intenções para germinar na lua cheia',
    keywords: ['lua nova', 'intenções', 'plantio', 'manifestação']
  },
  // Gratitude Rituals
  {
    id: 'gratitude-bowl',
    nome: 'Tigela da Gratidão',
    tipo: 'gratidão',
    duracao: '20 minutos',
    descricao: 'Ritual diário de gratidão para elevar a vibração.',
    materiais: ['Tigela de cerâmica', 'Pedras pequenas', 'Caneta', 'Papel'],
    passos: [
      'Escolha uma pedra que te represente hoje',
      'Escreva uma gratidão no papel pequeno',
      'Dobre o papel e coloque na tigela',
      'Segure a pedra e agradeça',
      'Coloque a pedra junto com a gratidão',
      'Repita diariamente se possível'
    ],
    significado: 'Cultiva gratidão e eleva a vibração energética',
    keywords: ['gratidão', 'abundância', 'positividade', 'vibração']
  },
  // Seasonal Rituals
  {
    id: 'equinox-balance',
    nome: 'Ritual do Equinócio',
    tipo: 'sazonal',
    duracao: '60 minutos',
    descricao: 'Ritual de equilíbrio realizado nos equinócios de primavera e outono.',
    materiais: ['Vela branca', 'Vela preta', 'Espelho', 'Sal', 'Água'],
    passos: [
      'Coloque um espelho no centro do altar',
      'Dispõe sal à esquerda e água à direita',
      'Acenda vela branca à esquerda e preta à direita',
      'Sente-se diante do espelho',
      'Observe seu reflexo e equilibre masculine e feminine',
      'Integre os opostos em harmonia'
    ],
    significado: 'Equilibra masculino e feminino, luz e sombra',
    keywords: ['equinócio', 'equilíbrio', 'integração', 'sazonal']
  },
  {
    id: 'solstice-power',
    nome: 'Ritual do Solstício',
    tipo: 'sazonal',
    duracao: '45 minutos',
    descricao: 'Ritual de poder realizado nos solstícios de verão e inverno.',
    materiais: ['Vela dourada', 'Cristais', 'Frutos da estação', 'Incenso de mirra'],
    passos: [
      'Reúna cristais ao redor do altar',
      'Acenda incenso de mirra',
      'Acenda a vela dourada ao nascer/pôr do sol',
      'Coloque os frutos da estação como oferenda',
      'Celebre o poder do sol em qualquer forma',
      'Agradeça pela luz e calor vitais'
    ],
    significado: 'Celebra o poder do sol e ciclos solares',
    keywords: ['solstício', 'poder', 'sol', 'celebração']
  }
];

interface Ritual {
  id: string;
  nome: string;
  tipo: string;
  duracao: string;
  descricao: string;
  materiais: string[];
  passos: string[];
  significado: string;
  keywords: string[];
}

// GET /api/rituals/library - returns all rituals
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const search = searchParams.get('search');
  const id = searchParams.get('id');
  const duracao = searchParams.get('duracao');

  let filteredRituals = rituals;

  // Filter by specific ritual ID
  if (id) {
    const ritual = rituals.find(r => r.id === id);
    if (!ritual) {
      return NextResponse.json(
        { error: 'Ritual not found', id },
        { status: 404 }
      );
    }
    return NextResponse.json(ritual);
  }

  // Filter by tipo (protection, abundance, love, cleansing, etc.)
  if (tipo) {
    filteredRituals = filteredRituals.filter(ritual => 
      ritual.tipo.toLowerCase() === tipo.toLowerCase()
    );
  }

  // Filter by duration
  if (duracao) {
    const durationMatch = duracao.match(/^(\d+)$/);
    if (durationMatch) {
      const maxMinutes = parseInt(durationMatch[1], 10);
      filteredRituals = filteredRituals.filter(ritual => {
        const match = ritual.duracao.match(/^(\d+)/);
        if (match) {
          const ritualMinutes = parseInt(match[1], 10);
          return ritualMinutes <= maxMinutes;
        }
        return true;
      });
    }
  }

  // Search by name, description, or keywords
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRituals = filteredRituals.filter(ritual =>
      ritual.nome.toLowerCase().includes(searchLower) ||
      ritual.descricao.toLowerCase().includes(searchLower) ||
      ritual.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
      ritual.materiais.some(m => m.toLowerCase().includes(searchLower))
    );
  }

  // Get available ritual types
  const typeSet = new Set<string>();
  rituals.forEach(r => typeSet.add(r.tipo));
  const availableTypes = Array.from(typeSet).sort();

  // Transform rituals to include full data
  const result = filteredRituals.map(ritual => ({
    id: ritual.id,
    nome: ritual.nome,
    tipo: ritual.tipo,
    duracao: ritual.duracao,
    descricao: ritual.descricao,
    materiais: ritual.materiais,
    passos: ritual.passos,
    significado: ritual.significado,
    keywords: ritual.keywords,
  }));

  return NextResponse.json({
    rituals: result,
    meta: {
      total: result.length,
      types: availableTypes,
      filters: {
        tipo: tipo || null,
        search: search || null,
        duracao: duracao || null,
      },
    },
  });
}
