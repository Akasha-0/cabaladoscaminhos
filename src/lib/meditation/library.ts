export type MeditationCategory = "cura" | "sono" | "foco" | "energia" | "sagrado";

export interface MeditationPhase {
  name: string;
  duration: number; // seconds
  script: string;
  guidance: string;
}

export interface Meditation {
  id: string;
  title: string;
  category: MeditationCategory;
  duration: number; // seconds
  phases: MeditationPhase[];
  description?: string;
  tags?: string[];
}

const meditations: Meditation[] = [
  // Cura
  {
    id: "medit-cura-harmonizacao",
    title: "Harmonização Chakral",
    category: "cura",
    duration: 600,
    description: "Restaura o equilíbrio dos chakras através de frequencies restaurativas.",
    tags: ["chakras", "equilíbrio", "energia"],
    phases: [
      {
        name: "Centramento",
        duration: 60,
        script: "Encontre um lugar confortável e feche os olhos. Permita que seu corpo relaxe completamente.",
        guidance: "Sente-se em uma posição que mantenha a coluna ereta mas relaxada.",
      },
      {
        name: "Respiração Sagrada",
        duration: 120,
        script: "Inspire profundamente pelo nariz contando até quatro. Segure o ar contando até quatro. Expire pela boca contando até seis.",
        guidance: "Mantenha a respiração uniforme e relaxada.",
      },
      {
        name: "Raiz",
        duration: 90,
        script: "Visualize uma luz vermelha intensa na base da coluna. Sinta segurança e estabilidade.",
        guidance: "Imagine raizes descendo da coluna para a terra.",
      },
      {
        name: "Sacro",
        duration: 90,
        script: "Permita que a luz vermelha suba para o sacro. Sinta criatividade e vitalidade fluindo.",
        guidance: "Permita que a energia se mova naturalmente.",
      },
      {
        name: "Plexo Solar",
        duration: 90,
        script: "A luz agora atinge o plexo solar, irradiando amarelo-dourado. Sinta poder pessoal e confiança.",
        guidance: "Sinta o calor emanando do centro abdominal.",
      },
      {
        name: "Encerramento",
        duration: 60,
        script: "Traga a consciência de volta ao corpo. Mexa lentamente os dedos das mãos e dos pés. Abra os olhos quando sentir preparado.",
        guidance: "Mantenha o estado de paz alcançado.",
      },
    ],
  },
  {
    id: "medit-cura-autocompas",
    title: "Auto-Compaixão",
    category: "cura",
    duration: 480,
    description: "Desenvolve amor-próprio e aceitação através de visualização guiada.",
    tags: ["amor próprio", "compaixão", "aceitação"],
    phases: [
      {
        name: "Preparação",
        duration: 60,
        script: "Coloque uma mão sobre o coração. Sinta o calor emanando do seu próprio toque.",
        guidance: "Permita que o toque seja gentil e reconfortante.",
      },
      {
        name: "Respiração Compassiva",
        duration: 120,
        script: "Inspire amor. Expire compaixão. A cada inspiração, imagine que está preenchendo seu coração com luz dourada.",
        guidance: "Sinta cada respiração como um abraço para si mesmo.",
      },
      {
        name: "Afirmações",
        duration: 120,
        script: "Repita internamente: 'Eu mereço amor. Eu sou suficiente. Eu me aceito completamente.' Permita que cada palavra penetre profundamente.",
        guidance: "Sinta as palavras como verdades absolutas.",
      },
      {
        name: "Integração",
        duration: 60,
        script: "Imagine-se abraçando a si mesmo. Permaneça nesse abraço por um momento. Sinta que está completo.",
        guidance: "Carry this feeling of self-love throughout your day.",
      },
    ],
  },
  {
    id: "medit-cura-libera",
    title: "Liberação de Traumas",
    category: "cura",
    duration: 720,
    description: "Facilita o processamento emocional e libertação de memórias dolorosas.",
    tags: ["liberação", "trauma", "emoção"],
    phases: [
      {
        name: "Ancoragem",
        duration: 90,
        script: "Identifique um lugar seguro dentro de você. Pode ser um lugar real ou imaginado. Permita-se estar completamente nesse espaço.",
        guidance: "Este é o seu refúgio interno.",
      },
      {
        name: "Respiração Profunda",
        duration: 150,
        script: "Respirações longas e profundas. A cada expiração, imagine que está libertando tensão armazenada no corpo.",
        guidance: "Não force a respiração. Deixe-a fluir naturalmente.",
      },
      {
        name: "Observação",
        duration: 180,
        script: "Permita que memórias ou emoções surjam sem julgamento. Observe-as como nuvens passando. Não precisa segurar ou fugir.",
        guidance: "Você não é suas memórias. Você é aquele que observa.",
      },
      {
        name: "Transformação",
        duration: 180,
        script: "Visualize cada memórial dolorosa sendo dissolvida por uma luz gentil. Permita que a luz substitua a escuridão com compaixão.",
        guidance: "Dê a si mesmo permissão para heal.",
      },
      {
        name: "Encerramento",
        duration: 120,
        script: "Retorne ao presente. Traga a consciência para este momento. Ancore-se no aqui e agora. Você está seguro.",
        guidance: "Se emoções intensas surgirem, procure apoio profissional.",
      },
    ],
  },

  // Sono
  {
    id: "medit-sono-profundidade",
    title: "Sono Profundo",
    category: "sono",
    duration: 1200,
    description: "Mergulho profundo no relaxamento para noite de sono restauradora.",
    tags: ["sono", "relaxamento", "descanso"],
    phases: [
      {
        name: "Desaceleração",
        duration: 120,
        script: "Deite-se confortavelmente. Deixe os pensamentos virem e irem sem se apegar. Você não precisa fazer nada agora.",
        guidance: "Permita que o dia se dissolva.",
      },
      {
        name: "Liberação Muscular",
        duration: 240,
        script: "Começando pelos pés, aperte os músculos por um momento e então solte. Sinta-os afundar no colchão. Mova-se lentamente até o topo da cabeça.",
        guidance: "A tensão dissolve a cada músculo que você libera.",
      },
      {
        name: "Respirações Lentas",
        duration: 300,
        script: "Inspire por cinco segundos. Expire por sete. A cada expiração, deixe que o corpo fique mais pesado.",
        guidance: "Se pensamentos surgirem, gentilmente retorne à respiração.",
      },
      {
        name: "Descida",
        duration: 300,
        script: "Imagine que está descendo uma escada em espiral. A cada degrau, você vai mais fundo. Mais relaxado. Mais em paz.",
        guidance: "Permita que a sonolência o envolva naturalmente.",
      },
      {
        name: "Drift",
        duration: 180,
        script: "Permita-se flutuar na fronteira do sono. Você está seguro. Você está em paz. Deixe a noite cuidar de você.",
        guidance: "Se você adormecer durante a prática, está tudo bem.",
      },
    ],
  },
  {
    id: "medit-sono-mandalha",
    title: "Mandalha do Sono",
    category: "sono",
    duration: 780,
    description: "Visualização de mandala colorido para acalmar a mente.",
    tags: ["visualização", "mandala", "calma"],
    phases: [
      {
        name: "Enquadramento",
        duration: 60,
        script: "Feche os olhos e imagine um ponto de luz no centro da sua mente.",
        guidance: "Este ponto é paz.",
      },
      {
        name: "Expansão",
        duration: 180,
        script: "A luz se expande em um círculo. Cores suaves começam a aparecer. O círculo se torna uma mandala perfeita.",
        guidance: "Observe as cores sem esforço.",
      },
      {
        name: "Ressonância",
        duration: 180,
        script: "A mandala pulsa suavemente. Cada cor traz mais relaxamento. O padrão se repete como ondas calmas.",
        guidance: "Deixe o ritmo da mandala sincronizar com sua respiração.",
      },
      {
        name: "Dissolução",
        duration: 180,
        script: "A mandala começa a se dissolver em luz dourada. A luz envolve você como um cobertor quente. Você está flutuando em paz.",
        guidance: "Permita que a sonolência o leve.",
      },
      {
        name: "Descanse",
        duration: 180,
        script: "Descanse agora. Não há nada a fazer. Apenas deixe ir. A noite está aqui para restaurar você.",
        guidance: "Permita que o sono venha naturalmente.",
      },
    ],
  },

  // Foco
  {
    id: "medit-foco-claridade",
    title: "Clareza Mental",
    category: "foco",
    duration: 300,
    description: "Aumenta concentração e clareza mental para tarefas importantes.",
    tags: ["foco", "clareza", "concentração"],
    phases: [
      {
        name: "Enraizamento",
        duration: 60,
        script: "Sente-se confortavelmente. Pressione os pés no chão. Sinta sua conexão com a terra.",
        guidance: "Você está presente aqui.",
      },
      {
        name: "Respiração Energizante",
        duration: 90,
        script: "Inspire fundo levantando os ombros. Expire liberando tensão. Repita três vezes. Sinta sua energia aumentando.",
        guidance: "Sinta-se desperto e alerta.",
      },
      {
        name: "Focalização",
        duration: 90,
        script: "Escolha um ponto à sua frente. Mantenha o foco nele. Quando a mente divagar, gentilmente retorne ao ponto.",
        guidance: "Observe pensamentos sem julgamento e retorne ao foco.",
      },
      {
        name: "Ativação",
        duration: 60,
        script: "Respire fundo. Imagine uma esfera de luz branca acima da sua cabeça. Permita que desça e preencha sua mente com clareza absoluta.",
        guidance: "Você está pronto para agir com foco.",
      },
    ],
  },
  {
    id: "medit-foco-visualiza",
    title: "Visualização Criativa",
    category: "foco",
    duration: 420,
    description: "Treina visualização para manifestar objetivos.",
    tags: ["manifestação", "visualização", "intenção"],
    phases: [
      {
        name: "Definição de Intenção",
        duration: 90,
        script: "Respire profundamente. Formule uma intenção clara em sua mente. Que resultado você deseja criar?",
        guidance: "Seja específico sobre o que você quer.",
      },
      {
        name: "Construção",
        duration: 180,
        script: "Visualize já estar vivendo essa intenção. Use todos os sentidos. Como isso parece, soa, sente? Permita que a emoção se conecte.",
        guidance: "A emoção é o combustível da manifestção.",
      },
      {
        name: "Ancoragem",
        duration: 90,
        script: "Agora ancore essa visualização no seu corpo. Sinta como se já fosse real. Permita que a sensação se espalhe por todo seu ser.",
        guidance: "Esta é a realidade que você está criando.",
      },
      {
        name: "Confirmação",
        duration: 60,
        script: "Repita: 'Eu mereço isso. Eu estou criando isso agora. Isto é meu.' Carregue essa certeza consigo ao abrir os olhos.",
        guidance: "Agende um momento para revisitar esta visualização.",
      },
    ],
  },

  // Energia
  {
    id: "medit-energia-manha",
    title: "Despertar Matinal",
    category: "energia",
    duration: 300,
    description: "Ativa energia vital e motivação para o dia.",
    tags: ["energia", "manhã", "motivação"],
    phases: [
      {
        name: "Despertar",
        duration: 60,
        script: "Sente-se ou fique em pé. Abra os olhos para uma luz suave. Comece a despertar seu corpo com movimentos suaves de alongamento.",
        guidance: "Traga movimento para cada parte do corpo.",
      },
      {
        name: "Respirações Vigorosas",
        duration: 120,
        script: "Respire forte e curto pelo nariz. Três respirações rápidas. Segure. Expire completamente. Repita quatro vezes.",
        guidance: "Sinta o despertar percorrendo seu corpo.",
      },
      {
        name: "Visualização Solar",
        duration: 90,
        script: "Imagine o sol nascendo dentro do seu peito. A luz dourada se expande. Ela ilumina cada célula. Você está cheio de luz e energia.",
        guidance: "Permita que essa energia energize tudo que você faz hoje.",
      },
      {
        name: "Intenção",
        duration: 30,
        script: "Estabeleça sua intenção para o dia. Que tipo de energia você quer carregar? Sinta que você tem tudo que precisa.",
        guidance: "Caminhe em direção ao seu dia com confiança.",
      },
    ],
  },
  {
    id: "medit-energia-protecao",
    title: "Campo de Proteção",
    category: "energia",
    duration: 480,
    description: "Cria campo de proteção contra energias negativas.",
    tags: ["proteção", "escudo", "defesa"],
    phases: [
      {
        name: "Centramento",
        duration: 60,
        script: "Fique em pé ou sente-se. Feche os olhos. Sinta seu corpo e sua presença.",
        guidance: "Você está no controle do seu espaço.",
      },
      {
        name: "Chamada dos Elementos",
        duration: 120,
        script: "Visualize terra sob seus pés. Água ao seu redor. Fogo à sua frente. Ar atrás de você. Os quatro elementos respondem ao seu chamado.",
        guidance: "Cada elemento traz sua proteção única.",
      },
      {
        name: "Construção do Escudo",
        duration: 180,
        script: "Imagine uma esfera de luz branca envolvendo você. Dentro dela, os quatro elementos criam um escudo impenetrável. Nenhuma energia negativa pode atravessar.",
        guidance: "Sinta a força do escudo. Você está protegido.",
      },
      {
        name: "Selamento",
        duration: 60,
        script: "Diga internamente: 'Eu sou protegido. Meu espaço é sagrado. Apenas amor pode entrar.' Sinta a declaração se tornar real.",
        guidance: "Você pode retornar a esta visualização sempre que precisar.",
      },
      {
        name: "Retorno",
        duration: 60,
        script: "Traga sua consciência de volta ao presente. Ancore a proteção no seu corpo. Você está seguro.",
        guidance: "Mantenha essa consciência ao longo do dia.",
      },
    ],
  },

  // Sagrado
  {
    id: "medit-sagrado-salao",
    title: "Sala do Trono Divino",
    category: "sagrado",
    duration: 600,
    description: "Jornada contemplativa ao encontro do divino interior.",
    tags: ["divino", "reino", "contemplação"],
    phases: [
      {
        name: "Portão de Entrada",
        duration: 90,
        script: "Visualize uma porta antiga à sua frente. Ela é feita de madeira escura com símbolos sagrados. Coloque a mão na maçaneta e sinta sua idade.",
        guidance: "O que está além desta porta é o sagrado dentro de você.",
      },
      {
        name: "Caminho Ascendente",
        duration: 180,
        script: "A porta se abre para uma escadaria em espiral que sobe em direção à luz. Cada degrau representa uma limpeza. Você se torna mais leve a cada passo.",
        guidance: "Deixe ir o que não é mais necessário.",
      },
      {
        name: "Encontro",
        duration: 180,
        script: "No topo, um salão de luz infinita. Sente ou imagine uma presença amorosa esperando por você. Esta é a sua essência divina.",
        guidance: "Permita que esta presença o abençoe.",
      },
      {
        name: "Retorno",
        duration: 150,
        script: "Receba a sabedoria deste encontro. Quando estiver pronto, desça a escada membawa a luz consigo. Ela agora vive em você.",
        guidance: "O divino está sempre acessível dentro de você.",
      },
    ],
  },
  {
    id: "medit-sagrado-arvore",
    title: "Árvore da Vida",
    category: "sagrado",
    duration: 720,
    description: "Contemplação da árvore cabalística de 연결.",
    tags: ["árvore", "cabala", "conexão"],
    phases: [
      {
        name: "Plantando a Semente",
        duration: 60,
        script: "Sente-se em paz. Imagine uma semente dourada sendo plantada na terra diante de você. Esta semente contém toda a potentialidade.",
        guidance: "Esta é a sua jornada espiritual.",
      },
      {
        name: "Crescimento",
        duration: 180,
        script: "A semente germina. Um tronco emerge, forte e reto. Ramificações se espalham em direções diferentes, cada uma representando um caminho diferente.",
        guidance: "A árvore cresce naturalmente para cima.",
      },
      {
        name: "As Raízes",
        duration: 120,
        script: "As raízes descem para as profundezas. Elas se conectam com a fonte. Você está enraizado no divino. Sua existência tem propósito.",
        guidance: "Sinta essa conexão profunda.",
      },
      {
        name: "Os Sucos",
        duration: 180,
        script: "A luz desce do céu pela copa da árvore, fluindo por cada galho e folha, descendo pelo tronco, alimentando as raízes, subir novamente em ciclo infinito.",
        guidance: "Você é parte deste fluxo contínuo.",
      },
      {
        name: "Frutos",
        duration: 180,
        script: "Flores e frutos aparecem na árvore. Cada um representa uma bênção em sua vida. Escolha um para contemplar. Sinta sua energia.",
        guidance: "Você está coberto de graças.",
      },
    ],
  },
];

export function getMeditations(): Meditation[] {
  return meditations;
}

export function getMeditationById(id: string): Meditation | undefined {
  return meditations.find((m) => m.id === id);
}