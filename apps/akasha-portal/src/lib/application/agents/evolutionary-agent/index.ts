/**
 * evolutionary-agent/index.ts
 *
 * Agente evolutivo — camada 7 do ROADMAP.
 * Propoe exercícios e rituais personalizados com base no ciclo pessoal,
 * história de áreas e fase lunar.
 */

import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
export type { AreaHistoryEntry, CycleModulation } from './area-history';
export { trackAreaRead, detectAreaPatterns } from './area-history';
export { LUNAR_EXERCISES, normalizePhase, deriveLunarExercises } from './lunar-exercises';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvolutionaryExercise {
  id: string;
  area: string;
  title: string;
  instruction: string;
  duration: string;
  difficulty: 'light' | 'moderate' | 'deep';
  type: 'ritual' | 'meditation' | 'journaling' | 'movement' | 'social';
  cycleAnchor: {
    personalDay?: boolean;
    personalMonth?: boolean;
    personalYear?: boolean;
    pinnacle?: boolean;
    karmicLesson?: boolean;
    lunar?: boolean;
  };
  rationale: string;
}

export interface CycleExerciseSet {
  date: string;
  personalDay: EvolutionaryExercise[];
  personalMonth: EvolutionaryExercise[];
  personalYear: EvolutionaryExercise[];
  pinnacle: EvolutionaryExercise[];
  karmicLessons: EvolutionaryExercise[];
  lunar: EvolutionaryExercise[];
  prioritizedExercises: EvolutionaryExercise[];
}

// ─── Lunar Phases ─────────────────────────────────────────────────────────────

const LUNAR_EXERCISES = {
  nova: {
    theme: 'Plantio interno — introspecção e intenção',
    exercises: {
      ritual: {
        title: 'Ritual de Intenção Lunar',
        instruction:
          'Acenda uma vela branca. No papel, escreva 3 intenções para este ciclo lunar. Leia em voz alta, dobrando o papel e guardando num lugar sagrado. Prancha: https://youtu.be/placeholder',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      meditation: {
        title: 'Meditação do Vazio Criativo',
        instruction:
          'Sente-se em silêncio. Observe os pensamentos sem apego, como nuvens passando. Permita que a mente se aquiete até surgir uma imagem ou sensação — é a sua intenção.seed.',
        duration: '12 minutos',
        difficulty: 'light' as const,
      },
      journaling: {
        title: 'Diário do Novo Começo',
        instruction:
          'Escreva: "Este ciclo lunar eu escolho ___" (3 preenchimentos). Depois escreva: "O que preciso soltar para que isso se manifeste é ___" (2 preenchimentos). Sem filtro, sem censura.',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      movement: {
        title: 'Dança do Novo Ar',
        instruction:
          'Música: algo fluido e ascendente. Mova-se livremente, imaginando que cada gesto planta uma semente no espaço. Termine em posição de gratidão.',
        duration: '15 minutos',
        difficulty: 'light' as const,
      },
      social: {
        title: 'Círculo de Intenções Partilhadas',
        instruction:
          'Reúna 1-3 pessoas de confiança. Cada um partilha uma intenção para este ciclo. Os outros reflectem sem advice — só espelho e acolhimento.',
        duration: '45 minutos',
        difficulty: 'moderate' as const,
      },
    },
  },
  crescente: {
    theme: 'Expansão — ação e construção',
    exercises: {
      ritual: {
        title: 'Ritual de Cascata Ascendente',
        instruction:
          'Com um copo de água, desperdice simbólica e lentamente enquanto diz: "Que isto cresça e se multiplique". Visualize a água infiltrando na terra e dela brotando o que pediu.',
        duration: '7 minutos',
        difficulty: 'light' as const,
      },
      meditation: {
        title: 'Meditação do Fogo Interior',
        instruction:
          'Feche os olhos. Visualize um fogo no centro do peito — pequeno no início, depois cada vez maior. Sinta-o aquecer o corpo inteiro e projectar luz para fora.',
        duration: '12 minutos',
        difficulty: 'moderate' as const,
      },
      journaling: {
        title: 'Plano de 3 Próximos Passos',
        instruction:
          'Escolha uma intenção da Lua Nova. Escreva 3 acções concretas — com quem, quando, como — que avance essa intenção nos próximos 7 dias. Seja específico.',
        duration: '10 minutos',
        difficulty: 'moderate' as const,
      },
      movement: {
        title: 'Yoga Solar (Surya Namaskar)',
        instruction:
          '7 rounds de Salutação ao Sol. Comece devagar, aumente gradualmente. Sinta o calor muscular e a energia subindo do sacro ao coração.',
        duration: '20 minutos',
        difficulty: 'moderate' as const,
      },
      social: {
        title: 'Alinhamento com Aliado',
        instruction:
          'Marque uma conversa com alguém que respeito — amigo, mentor, terapeuta. Peça feedback honesto sobre o seu caminho actual e ouça sem defender.',
        duration: '60 minutos',
        difficulty: 'moderate' as const,
      },
    },
  },
  cheia: {
    theme: 'Pico de energia — manifestação e celebração',
    exercises: {
      ritual: {
        title: 'Ritual de Gratidão Luminosa',
        instruction:
          'Ao entardecer, acenda uma vela dourada. Liste em voz alta 7 coisas que recebeu desde a Lua Nova — concretas ou subtis. Agradeça uma a uma.',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      meditation: {
        title: 'Meditação do Abraço Infinito',
        instruction:
          'Sentado, visualize-se no centro de uma esfera de luz. Primeiro, dirija amor a si mesmo; depois, às pessoas que ama; depois, aos que dificuldade. Termine com compaixão pelo mundo.',
        duration: '15 minutos',
        difficulty: 'moderate' as const,
      },
      journaling: {
        title: 'Diário de Celebração e Projecção',
        instruction:
          'Escreva: "As maiores vitórias desde a Lua Nova foram ___. Como me senti ___." Depois: "O que quero celebrar na próxima Lua Cheia é ___."',
        duration: '10 minutos',
        difficulty: 'light' as const,
      },
      movement: {
        title: 'Dança de Alegria Elemental',
        instruction:
          'Música que evoque os 4 elementos — água, fogo, terra, ar. Dança livre com cada elemento, fechando com uma posição de gratidão.',
        duration: '20 minutos',
        difficulty: 'moderate' as const,
      },
      social: {
        title: 'Cerimónia de Grupo — Partilha de Luz',
        instruction:
          'Reúna um grupo (ou marque uma videochamada). Cada pessoa partilha uma bênção que recebeu ou ofereceu neste ciclo. Feche com um momento de silêncio partilhado.',
        duration: '60 minutos',
        difficulty: 'moderate' as const,
      },
    },
  },
  minguante: {
    theme: 'Liberação — soltura e depuração',
    exercises: {
      ritual: {
        title: 'Ritual de Soltura Controlada',
        instruction:
          'Escreva num papel o que quer soltar — hábito, relação, crença, padrão. Leia em voz alta. Depois queime o papel num recipiente seguro, dizendo: "Solto para o universo transformar."',
        duration: '10 minutos',
        difficulty: 'moderate' as const,
      },
      meditation: {
        title: 'Meditação do Vento que Carrega',
        instruction:
          'Visualize um vento forte mas gentil a atravessá-lo, levando consigo os pesos que escreveu. Cada vez que expira, o vento fica mais forte e leve. Permita que leve o que não serve.',
        duration: '12 minutos',
        difficulty: 'moderate' as const,
      },
      journaling: {
        title: 'Diário de Desapego Consciente',
        instruction:
          'Escreva: "Estou pronto para soltar ___" (3 coisas). "O que tem peso e já não me serve é ___." Depois um texto livre: o que sente ao deixar ir.',
        duration: '10 minutos',
        difficulty: 'moderate' as const,
      },
      movement: {
        title: 'Shaking — Libertação Somática',
        instruction:
          'De pé, com música tribal ou ritmo forte, shakingsubstancial do corpo inteiro — comeca nos pés e vai subindo. Primeiro 2 minutos de shakingsustido leve, depois 1 minuto intenso, depois 1 minuto de silêncio e respire.',
        duration: '15 minutos',
        difficulty: 'moderate' as const,
      },
      social: {
        title: 'Perdão Ritualizado',
        instruction:
          'Escreva uma carta de perdão — para si mesmo ou outro. Não precisa enviar. Leia em voz alta, depois guarde ou queime. O acto de escrever já é ritual.',
        duration: '30 minutos',
        difficulty: 'deep' as const,
      },
    },
  },
} as const;

// ─── Personal Day Exercises ───────────────────────────────────────────────────

type DayEnergy = 'leadership' | 'diplomacy' | 'creativity' | 'foundation' | 'change' | 'nurturing' | 'introspection' | 'power' | 'completion' | 'spiritual';

const PERSONAL_DAY_EXERCISES: Record<DayEnergy, Record<string, Omit<EvolutionaryExercise, 'id' | 'cycleAnchor' | 'rationale'>>> = {
  leadership: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Corrida do Líder',
      instruction: 'Actividade física intensa 20 min — corrida, cycling ou burpees. Visualize-se a liderar o seu próprio corpo como lidera a sua vida.',
      duration: '25 minutos',
      difficulty: 'moderate',
      type: 'movement',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Iniciativa no Vínculo',
      instruction: 'Faça o primeiro contacto com alguém importante — mensagem, chamada, convite. Liderar a conexão, não esperar.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Projecto Alphadeck',
      instruction: 'Defina 1 resultado máximo para as próximas 4 semanas. Escreva-o. Depois divida em 3 milestones com datas.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Decisão de Hoje',
      instruction: 'Identifique 1 decisão que tem adiado. Anote prós e contras em 3 minutos. Depois escolha — mesmo sem certeza absoluta.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Profissão de Propósito',
      instruction: 'Escreva 3 frases: "Eu sou alguém que ___" completando com o seu propósito. Leia em voz alta 3x olhando ao espelho.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Honrar a Sombra do Líder',
      instruction: 'Identifique um momento em que o seu egocentrismo feriu alguém. Sem autocrítica — apenas consciência. Escreva 3 linhas e queime.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  diplomacy: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Escuta Activa no Corpo',
      instruction: 'Sente-se em silêncio 5 min, depois beba um copo de água lento, prestando atenção em cada sensação. Observe sem julgar.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Diálogo sem Agenda',
      instruction: 'Numa conversa importante hoje, pratique escuta completa — não prepare a resposta enquanto o outro fala. Depois responda só após 3 segundos.',
      duration: '30 minutos',
      difficulty: 'moderate',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Negociação Gentil',
      instruction: 'Identifique uma situação profissional com potencial de conflito. Prepare 2 propostas ganha-ganha antes de entrar na conversa.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Escuta Profunda',
      instruction: 'Medite 10 min focando apenas na respiração. Depois escolha um pensamento e examine-o como se fosse um amigo que traz uma mensagem.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Diálogo com a Mensagem',
      instruction: 'Num diálogo hoje, troque a intenção de "convencer" por "compreender". Note o que acontece no campo relacional.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'social',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Testemunha Diplomático',
      instruction: 'Observe uma situação de tensão sem participar. Escreva o que viu — sem julgamento, só documento.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  creativity: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Flow State Creator',
      instruction: 'Coloque música que ama. Dê 15 min para criar algo — desenho, collage, improviso musical. Sem crítica, só expressão.',
      duration: '20 minutos',
      difficulty: 'light',
      type: 'movement',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Criatividade a Dois',
      instruction: 'Convide alguém para uma actividade criativa partilhada — cozinhar, desenhar, construir. O foco é a conexão via criação.',
      duration: '45 minutos',
      difficulty: 'light',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Brainstorming Livre',
      instruction: 'Num problema profissional que enfrenta, faça 10 perguntas "e se..." em 5 minutos. Depois escolha a mais ousada.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Jogo dos Contrários',
      instruction: 'Pense num problema. Escreva a sua solução habitual. Depois inverta todos os pressupostos e escreva uma solução oposta — pode ser a resposta real.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Poesia do Destino',
      instruction: 'Escreva um poema livre — mínimo 4 linhas — sobre o caminho que está a seguir. Sem filtro, sem métrica. O que emerge é a mensagem.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Transformar Crítica em Arte',
      instruction: 'Pegue numa crítica que recebeu ultimamente. Transforme-a num texto criativo — poema, história curta, ou letra de música.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  foundation: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Ritual de Terra Sólida',
      instruction: 'Fique descalço na terra ou relva 10 min. Sinta o peso do corpo a ancorar. Depois beba água devagar e respire 5x profundo.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'ritual',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Fundação do Ninho',
      instruction: 'Limpe ou organize um espaço da casa onde passa tempo com quem ama. A organização física reflecte e apoia a estabilidade relacional.',
      duration: '30 minutos',
      difficulty: 'moderate',
      type: 'movement',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Planeamento Sólido',
      instruction: 'Crie uma lista de 3 prioridades para a semana. Defina prazos realistas. Guarde num lugar visível — o corpo sabe o que vem.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Rotina de Sabedoria',
      instruction: 'Escolha um texto — sagrado, filosófico, poético. Leia o mesmo parágrafo 3x em silêncio. Escreva a frase que mais ressoa e medite nela.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Ancoragem de Propósito',
      instruction: 'Escreva 3 valores inegociáveis da sua vida. Para cada um, pergunte: estou a viver alinhado? O que falta? Escreva sem censor.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra da Rigidez',
      instruction: 'Identifique uma situação onde foi excessivamente rígido. Escreva o que percebe agora — com gentileza para si mesmo.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  change: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Movimento Caótico Consciente',
      instruction: 'Música electrónica ou binaural. Mova-se de formas que não são habituais — o corpo aprende novas possibilidades.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'movement',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Conversa de Ruptura Positiva',
      instruction: 'Se há uma conversa que evita, marque para os próximos 3 dias. Prepare 1 ponto de escuta e 1 ponto de verdade — coragem com gentileza.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Queda de piloto',
      instruction: 'Identifique 1 área onde se acomodou. Crie um desafio fora da zona de conforto — pode ser pedir uma reunião, propor uma ideia, ou mudar um processo.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Pergunta de Ruptura',
      instruction: 'Escolha uma crença estruturante. Inverta-a: "E se fosse o contrário?" Escreva 3 implicações da inversão — pode ser libertadora.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Desapego do Resultado',
      instruction: 'Identifique algo que está aforçar para que aconteça. Escreva o que pode controlar vs. o que depende do universo. Solte o controlo do que não é seu.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra da Impulsividade',
      instruction: 'Liste 3 decisões impulsivas recentes. Para cada uma, pergunte: foi reacção ou resposta? O que mudaria se esperasse 24h?',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  nurturing: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Banho de Cuidado',
      instruction: 'Hoje, um momento estendido de autocuidado — banho longo, massagem com óleo, ou simplesmente deitar sem culpa. O corpo agradece.',
      duration: '30 minutos',
      difficulty: 'light',
      type: 'ritual',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Presente Simbólico',
      instruction: 'Sem gastar dinheiro — crie algo para alguém que ama: carta escrita à mão, playlist, receita. O valor está na atenção, não no preço.',
      duration: '30 minutos',
      difficulty: 'light',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Autoavaliação Gentil',
      instruction: 'Liste 3 coisas que fez bem esta semana. Celebre sem modéstia. Depois liste 1 área a ajustar — sem crítica, apenas next step.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Cuidado com a Mente',
      instruction: 'Hoje, reduza inputs digitais. Leia algo físico. Anote 3 insights. A mente precisa de espaço tanto quanto o corpo.',
      duration: '20 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Gratidão Espiritual',
      instruction: 'Escreva uma carta de gratidão ao universo — não por coisas, mas por aprendizados. O que este ciclo lhe ensinou que vale mais que qualquer coisa?',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra do Sacrifício',
      instruction: 'Identifique um padrão de se colocado em último lugar. Pergunte: "E se eu me colocasse em primeiro, sem culpa?" Escreva a resposta honesta.',
      duration: '10 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  introspection: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Scan Corporal',
      instruction: 'Deitado, feche os olhos. Do pé à cabeça, atenção lenta para cada parte do corpo — sem mudar, só notar. 15 min de body scan.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Diário Interior',
      instruction: 'Escreva 3 perguntas sobre os seus relacionamentos que não tem coragem de fazer a si mesmo. Depois escolha 1 para explorar em silêncio hoje.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Retiro de 1 Hora',
      instruction: 'Bloqueie 1 hora sem interrupções. Desligue notificações. Leia algo que nourisca profissionalmente ou faça uma sessão de brainstorming a sério.',
      duration: '60 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Pergunta Essencial',
      instruction: 'Sente-se em silêncio. Faça a pergunta: "O que sei agora que não sabia há 1 ano?" Permita que a resposta surja — pode demorar 5-10 min.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Diálogo com o Sombra',
      instruction: 'Ninguém por perto? Fale em voz alta para uma parte de si que tem evitado — pode ser a raiva, o medo, a inveja. Sem filtro, sem drama.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Inventário Interior',
      instruction: 'Lista: o que me incomoda nos outros? Por quanto disso é reflexo de mim? Escolha 1 projecção para trabalhar esta semana.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  power: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Manifestação de Poder',
      instruction: 'Visualize o resultado máximo de algo que deseja — não como pedir, mas como já ter. Sinta a emoção como se já fosse real. 10 min.',
      duration: '12 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Poder no Vínculo',
      instruction: 'Identifique 1 área onde tem medo de ocupar espaço na relação. Pratique ocupar — dizer o que pensa, pedir o que quer, sem apology.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Reivindicação de Valor',
      instruction: 'Escreva uma lista de 5 contribuições concretas que traz. Leia em voz alta. Depois: "Quanto valeria isso para alguém que precisa?"',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Decisão de Poder',
      instruction: 'Identifique uma decisão que delegou ou adiou por insegurança. Hoje: escolha — com os dados que tem. O poder está na decisão, não na certeza.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Ritual de Reivindicação',
      instruction: 'Escreva numa folha: "Eu reclamo o meu poder de ___" (3 coisas). Leia em voz alta. Guarde num lugar onde vai ver todos os dias.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra do Abuso de Poder',
      instruction: 'Identifique um momento em que usou poder para manipular ou forçar. Sem auto-flagelação — apenas consciência. O que precisava em vez disso?',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  completion: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Ritual de Fechar Ciclos',
      instruction: 'Identifique 3 coisas que começou e não terminou. Para cada uma: complete, entregue, ou elimine formalmente. Não pode ficar no limbo.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Carta de Encerramento',
      instruction: 'Se há relação ou situação por fechar, escreva uma carta — não para enviar. Escreva o que precisa ser dito para poder seguir.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Auditoria de Ciclo',
      instruction: 'Revisite metas do último período. O que cumpriu? O que não? Sem culpa — o que não aconteceu ou não era mesmo prioridade.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Soltar para Avançar',
      instruction: 'Pergunte: "O que estou a carregar que não é meu?" Soltar não é desistir — é deixar ir o peso morto para criar espaço para o novo.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Oferecimento de Ciclo',
      instruction: 'Escreva: "O que este ciclo me ensinou que quero levar para o próximo?" Depois: "O que ofereço ao mundo como resultado deste aprendizado?"',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Perdão Final',
      instruction: 'Para alguém que feriu (ou si mesmo), escreva 1 frase de absolvição: "Eu perdoo ___ por ___ porque ___." Não é para o outro — é para si.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'ritual',
    },
  },

  spiritual: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Comunhão Sagrada',
      instruction: 'Peça um momento de silêncio expanded. Visualize-se conectado a algo maior — Deus, o cosmos, a natureza. Permita que o corpo se sinta parte de algo infinito.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Amor Incondicional Prático',
      instruction: 'Escolha 1 pessoa difícil. Sem mudar a pessoa, mude o seu pedido por ela — em vez de pedir que mude, peça que ela seja feliz. Sinta a diferença no corpo.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'meditation',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Missão高于 Trabalho',
      instruction: 'Pergunte: "O meu trabalho é um veículo para algo maior ou é o destino em si?" Escreva a resposta mais honesta que conseguir.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Escuta do Silêncio',
      instruction: 'Sente-se em completo silêncio — sem música, sem palavras, sem input. Apenas ser. Quando aparecer um pensamento, observe e volte ao silêncio.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Covocation',
      instruction: 'Em silêncio, pergunte ao universo: "O que queres que eu saiba hoje?" Permita que uma resposta surja — pode ser uma imagem, sensação, ou palavra.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra da Espiritualidade Evadida',
      instruction: 'Identifique se usa espiritualidade para evitar o mundo real. Escreva: "Uma verdade incómoda que estou a evitar é ___." Enfrente, depois respire.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },
};

// ─── Core Functions ────────────────────────────────────────────────────────────

function lunarExercises(
  moonPhase: string,
  snapshot: PersonalCycleSnapshot,
): EvolutionaryExercise[] {
  const phase = normalizePhase(moonPhase);
  const lunar = LUNAR_EXERCISES[phase];
  const date = snapshot.currentDate;

  // Determinar a área mais relevante para cada exercício lunar
  const areaByType: Record<string, string> = {
    ritual: 'missaoDestino',
    meditation: 'oriCabecaQuizilas',
    journaling: 'desafiosSombras',
    movement: 'vitalidadeEnergia',
    social: 'conexoesAmor',
  };

  return (Object.entries(lunar.exercises) as [EvolutionaryExercise['type'], typeof lunar.exercises[EvolutionaryExercise['type']]][]).map(([type, ex]) => {
    const area = areaByType[type] ?? 'missaoDestino';
    const id = `${area}-${type}-${Date.now()}-lunar`;
    return {
      id,
      area,
      title: ex.title,
      instruction: ex.instruction,
      duration: ex.duration,
      difficulty: ex.difficulty,
      type,
      cycleAnchor: { lunar: true },
      rationale: `${lunar.theme}. Este exercício lunar activa a fase de ${lunar.theme.toLowerCase()}, canalizando a energia da lua ${phase} para a área de ${area}.`,
    };
  });
}

function personalDayExercises(
  snapshot: PersonalCycleSnapshot,
): EvolutionaryExercise[] {
  const energy = snapshot.personalDay.energy;
  const base = PERSONAL_DAY_EXERCISES[energy as DayEnergy];
  if (!base) return [];

  const areaKeys = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];

  return areaKeys
    .map((areaKey): EvolutionaryExercise | null => {
      const ex = base[areaKey];
      if (!ex) return null;
      const id = `${areaKey}-${ex.type}-${Date.now()}-day`;
      return {
        id,
        area: areaKey,
        title: ex.title,
        instruction: ex.instruction,
        duration: ex.duration,
        difficulty: ex.difficulty,
        type: ex.type as EvolutionaryExercise['type'],
        cycleAnchor: { personalDay: true },
        rationale: `Hoje é um dia pessoal de energia "${energy}" — ${snapshot.personalDay.keywords.slice(0, 2).join(', ')}. Este exercício activa a área de ${ex.area.replace(/([A-Z])/g, ' $1').toLowerCase()} através do canal natural deste dia.`,
      };
    })
    .filter((e): e is EvolutionaryExercise => e !== null);
}

function personalMonthExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { personalMonth } = snapshot;
  const areaKeys = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];
  // Map month theme/focus to area
  const focusAreaMap: Record<string, string> = {
    'Tomar a primeira ação': 'carreiraProsperidade',
    'Aprofundar relações': 'conexoesAmor',
    'Expressar ideias': 'vitalidadeEnergia',
    'Estabelecer rotinas': 'carreiraProsperidade',
    'Sair da zona de conforto': 'desafiosSombras',
    'Cuidar de pessoas': 'conexoesAmor',
    'Refletir, meditar': 'oriCabecaQuizilas',
    'Avançar carreira': 'carreiraProsperidade',
    'Finalizar, perdoar': 'missaoDestino',
    'Canalizar a intuição': 'missaoDestino',
    'Construir algo duradouro': 'missaoDestino',
  };

  const matchedArea = focusAreaMap[personalMonth.focus] ?? areaKeys[Math.floor(Date.now() / 1000) % areaKeys.length];
  const id = `${matchedArea}-ritual-${Date.now()}-month`;

  return [
    {
      id,
      area: matchedArea,
      title: `Exercício do Mês Pessoal ${personalMonth.number}`,
      instruction: `Foco do mês: ${personalMonth.focus}. ${personalMonth.opportunities[0] ? 'Oportunidade: ' + personalMonth.opportunities[0] + '.' : ''} Este exercício ritual mensal é desenhado para consolidar o tema de ${personalMonth.theme.toLowerCase()}.`,
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'ritual',
      cycleAnchor: { personalMonth: true },
      rationale: `Mês pessoal ${personalMonth.number} — tema: ${personalMonth.theme}. ${personalMonth.keywords.join(', ')}. Este exercício está alinhado com o ciclo mensal de ${personalMonth.energy.toLowerCase()}.`,
    },
  ];
}

function personalYearExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { personalYear } = snapshot;
  const id = `desafiosSombras-journaling-${Date.now()}-year`;

  return [
    {
      id,
      area: 'desafiosSombras',
      title: `Exercício do Ano Pessoal ${personalYear.number}`,
      instruction: `Lição central: ${personalYear.majorLessons[0]}. Acção-chave: ${personalYear.keyAction}. Reserve 20 minutos para escrever sobre como este ano se relaciona com a sua missão de longo prazo.`,
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'journaling',
      cycleAnchor: { personalYear: true },
      rationale: `Ano pessoal ${personalYear.number} — ${personalYear.theme}. ${personalYear.keyAction} Este exercício conecta a energia do ano inteiro com a sua jornada de transformação.`,
    },
  ];
}

function pinnacleExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { currentPinnacle } = snapshot;
  const id1 = `carreiraProsperidade-ritual-${Date.now()}-pinnacle`;
  const id2 = `oriCabecaQuizilas-meditation-${Date.now()}-pinnacle`;

  return [
    {
      id: id1,
      area: 'carreiraProsperidade',
      title: `Ritual do Pináculo ${currentPinnacle.number}`,
      instruction: `Oportunidade actual: ${currentPinnacle.opportunities[0]}. Desafio: ${currentPinnacle.challenges[0]}. Pergunta-chave: "${currentPinnacle.keyQuestion}" — responda num diário de 10 minutos.`,
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'ritual',
      cycleAnchor: { pinnacle: true },
      rationale: `Pináculo ${currentPinnacle.number} activo dos ${currentPinnacle.period}. Este é um período de ${currentPinnacle.theme.toLowerCase()}.`,
    },
    {
      id: id2,
      area: 'oriCabecaQuizilas',
      title: `Meditação do Pináculo`,
      instruction: `Sente-se. Imagine-se a atravessar o período do pináculo com clareza e propósito. Visualize as oportunidades concretizadas. Sinta o que é ter dominado esta lição.`,
      duration: '12 minutos',
      difficulty: 'moderate',
      type: 'meditation',
      cycleAnchor: { pinnacle: true },
      rationale: `A energia do pináculo ${currentPinnacle.number} convida ao desenvolvimento de ${currentPinnacle.theme.toLowerCase()}. Esta meditação projecta a consciência para o estado mastery.`,
    },
  ];
}

function karmicLessonExercises(snapshot: PersonalCycleSnapshot): EvolutionaryExercise[] {
  const { karmicLessons } = snapshot;
  if (karmicLessons.length === 0) return [];

  return karmicLessons.map((lesson, i) => {
    const areaKeys = ['desafiosSombras', 'oriCabecaQuizilas', 'missaoDestino', 'carreiraProsperidade', 'conexoesAmor', 'vitalidadeEnergia'];
    const area = areaKeys[i % areaKeys.length];
    const id = `${area}-journaling-${Date.now()}-karmic-${lesson.missing}`;

    const exerciseTypes: EvolutionaryExercise['type'][] = ['journaling', 'ritual', 'meditation', 'movement', 'social'];
    const type = exerciseTypes[i % exerciseTypes.length];

    const instructionMap: Record<string, string> = {
      journaling: `${lesson.description}. ÁREA de vida afectada: ${lesson.lifeArea}. Como pode aplicar isso hoje num contexto prático? Escreva 3 respostas.`,
      ritual: `Lição cármica: falta o número ${lesson.missing}. Crie um micro-ritual de 7 minutos: acenda uma vela, respire 7 vezes, e declare que está a aprender esta lição.`,
      meditation: `Sente-se. Observe como o número ${lesson.missing} — absent in your numerological chart — se manifesta como padrão no seu comportamento. Sem crítica, só consciência.`,
      movement: `Movimento consciente: 10 minutos de yoga ou alongamento focado na área do corpo relacionada com ${lesson.lifeArea.toLowerCase()}.`,
      social: `Partilhe com alguém de confiança: "Estou a trabalhar em ___" (based on ${lesson.howToLearn}). Convide essa pessoa a ser testemunha do seu processo.`,
    };

    return {
      id,
      area,
      title: `Lição Cármica ${lesson.missing}: ${lesson.lifeArea}`,
      instruction: instructionMap[type] ?? instructionMap.journaling,
      duration: '15 minutos',
      difficulty: 'deep' as const,
      type,
      cycleAnchor: { karmicLesson: true },
      rationale: `Número ${lesson.missing} está ausente do seu mapa — indica uma lição cármica em ${lesson.lifeArea.toLowerCase()}. Como aprender: ${lesson.howToLearn}.`,
    };
  });
}

function normalizePhase(moonPhase: string): keyof typeof LUNAR_EXERCISES {
  const p = moonPhase.toLowerCase().normalize('NFD')[0];
  if (p === 'n') return 'nova';
  if (p === 'c' && moonPhase.toLowerCase().includes('cresc')) return 'crescente';
  if (p === 'c') return 'cheia';
  if (p === 'm') return 'minguante';
  return 'nova';
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Deriva um conjunto completo de exercícios personalizados a partir do snapshot do ciclo pessoal.
 */
export function deriveExercisesFromSnapshot(
  snapshot: PersonalCycleSnapshot,
  moonPhase: string = 'nova',
): CycleExerciseSet {
  const date = snapshot.currentDate;

  const personalDay = personalDayExercises(snapshot);
  const personalMonth = personalMonthExercises(snapshot);
  const personalYear = personalYearExercises(snapshot);
  const pinnacle = pinnacleExercises(snapshot);
  const karmicLessons = karmicLessonExercises(snapshot);
  const lunar = lunarExercises(moonPhase, snapshot);

  const prioritizedExercises = [
    ...karmicLessons,
    ...pinnacle,
    ...personalDay,
    ...personalMonth,
    ...personalYear,
    ...lunar,
  ];

  return {
    date,
    personalDay,
    personalMonth,
    personalYear,
    pinnacle,
    karmicLessons,
    lunar,
    prioritizedExercises,
  };
}

// ─── Cycle Modulation ─────────────────────────────────────────────────────────

export { deriveCycleModulation } from './synthesis-engine/cycle-modulation';
