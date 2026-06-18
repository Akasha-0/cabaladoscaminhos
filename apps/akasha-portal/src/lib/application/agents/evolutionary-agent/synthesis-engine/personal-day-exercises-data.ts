/**
 * synthesis-engine/personal-day-exercises-data.ts
 *
 * Exercise data for personal day energies.
 * Canonical source — keep in sync with any duplicate in ../index.ts.
 */

export type DayEnergy =
  | 'leadership'
  | 'diplomacy'
  | 'creativity'
  | 'foundation'
  | 'change'
  | 'nurturing'
  | 'introspection'
  | 'power'
  | 'completion'
  | 'spiritual';

type ExerciseEntry = {
  area: string;
  title: string;
  instruction: string;
  duration: string;
  difficulty: string;
  type: string;
};

export const PERSONAL_DAY_EXERCISES: Record<DayEnergy, Record<string, ExerciseEntry>> = {
  leadership: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Corrida do Líder',
      instruction:
        'Actividade física intensa 20 min — corrida, cycling ou burpees. Visualize-se a liderar o seu próprio corpo como lidera a sua vida.',
      duration: '25 minutos',
      difficulty: 'moderate',
      type: 'movement',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Iniciativa no Vínculo',
      instruction:
        'Faça o primeiro contacto com alguém importante — mensagem, chamada, convite. Liderar a conexão, não esperar.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Projecto Alphadeck',
      instruction:
        'Defina 1 resultado máximo para as próximas 4 semanas. Escreva-o. Depois divida em 3 milestones com datas.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Decisão de Hoje',
      instruction:
        'Identifique 1 decisão que tem adiado. Anote prós e contras em 3 minutos. Depois escolha — mesmo sem certeza absoluta.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Profissão de Propósito',
      instruction:
        'Escreva 3 frases: "Eu sou alguém que ___" completando com o seu propósito. Leia em voz alta 3x olhando ao espelho.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Honrar a Sombra do Líder',
      instruction:
        'Identifique um momento em que o seu egocentrismo feriu alguém. Sem autocrítica — apenas consciência. Escreva 3 linhas e queime.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  diplomacy: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Escuta Activa no Corpo',
      instruction:
        'Sente-se em silêncio 5 min, depois beba um copo de água lento, prestando atenção em cada sensação. Observe sem julgar.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Diálogo sem Agenda',
      instruction:
        'Numa conversa importante hoje, pratique escuta completa — não prepare a resposta enquanto o outro fala. Depois responda só após 3 segundos.',
      duration: '30 minutos',
      difficulty: 'moderate',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Negociação Gentil',
      instruction:
        'Identifique uma situação profissional com potencial de conflito. Prepare 2 propostas ganha-ganha antes de entrar na conversa.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Escuta Profunda',
      instruction:
        'Medite 10 min focando apenas na respiração. Depois escolha um pensamento e examine-o como se fosse um amigo que traz uma mensagem.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Diálogo com a Mensagem',
      instruction:
        'Num diálogo hoje, troque a intenção de "convencer" por "compreender". Note o que acontece no campo relacional.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'social',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Testemunha Diplomático',
      instruction:
        'Observe uma situação de tensão sem participar. Escreva o que viu — sem julgamento, só documento.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  creativity: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Flow State Creator',
      instruction:
        'Coloque música que ama. Dê 15 min para criar algo — desenho, collage, improviso musical. Sem crítica, só expressão.',
      duration: '20 minutos',
      difficulty: 'light',
      type: 'movement',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Criatividade a Dois',
      instruction:
        'Convide alguém para uma actividade criativa partilhada — cozinhar, desenhar, construir. O foco é a conexão via criação.',
      duration: '45 minutos',
      difficulty: 'light',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Brainstorming Livre',
      instruction:
        'Num problema profissional que enfrenta, faça 10 perguntas "e se..." em 5 minutos. Depois escolha a mais ousada.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Jogo dos Contrários',
      instruction:
        'Pense num problema. Escreva a sua solução habitual. Depois inverta todos os pressupostos e escreva uma solução oposta — pode ser a resposta real.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Poesia do Destino',
      instruction:
        'Escreva um poema livre — mínimo 4 linhas — sobre o caminho que está a seguir. Sem filtro, sem métrica. O que emerge é a mensagem.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Transformar Crítica em Arte',
      instruction:
        'Pegue numa crítica que recebeu ultimamente. Transforme-a num texto criativo — poema, história curta, ou letra de música.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  foundation: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Ritual de Terra Sólida',
      instruction:
        'Fique descalço na terra ou relva 10 min. Sinta o peso do corpo a ancorar. Depois beba água devagar e respire 5x profundo.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'ritual',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Fundação do Ninho',
      instruction:
        'Limpe ou organize um espaço da casa onde passa tempo com quem ama. A organização física reflecte e apoia a estabilidade relacional.',
      duration: '30 minutos',
      difficulty: 'moderate',
      type: 'movement',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Planeamento Sólido',
      instruction:
        'Crie uma lista de 3 prioridades para a semana. Defina prazos realistas. Guarde num lugar visível — o corpo sabe o que vem.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Rotina de Sabedoria',
      instruction:
        'Escolha um texto — sagrado, filosófico, poético. Leia o mesmo parágrafo 3x em silêncio. Escreva a frase que mais ressoa e medite nela.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Ancoragem de Propósito',
      instruction:
        'Escreva 3 valores inegociáveis da sua vida. Para cada um, pergunte: estou a viver alinhado? O que falta? Escreva sem censor.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra da Rigidez',
      instruction:
        'Identifique uma situação onde foi excessivamente rígido. Escreva o que percebe agora — com gentileza para si mesmo.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  change: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Movimento Caótico Consciente',
      instruction:
        'Música electrónica ou binaural. Mova-se de formas que não são habituais — o corpo aprende novas possibilidades.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'movement',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Conversa de Ruptura Positiva',
      instruction:
        'Se há uma conversa que evita, marque para os próximos 3 dias. Prepare 1 ponto de escuta e 1 ponto de verdade — coragem com gentileza.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Queda de piloto',
      instruction:
        'Identifique 1 área onde se acomodou. Crie um desafio fora da zona de conforto — pode ser pedir uma reunião, propor uma ideia, ou mudar um processo.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Pergunta de Ruptura',
      instruction:
        'Escolha uma crença estruturante. Inverta-a: "E se fosse o contrário?" Escreva 3 implicações da inversão — pode ser libertadora.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Desapego do Resultado',
      instruction:
        'Identifique algo que está aforçar para que aconteça. Escreva o que pode controlar vs. o que depende do universo. Solte o controlo do que não é seu.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra da Impulsividade',
      instruction:
        'Liste 3 decisões impulsivas recentes. Para cada uma, pergunte: foi reacção ou resposta? O que mudaria se esperasse 24h?',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
  },

  nurturing: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Banho de Cuidado',
      instruction:
        'Hoje, um momento estendido de autocuidado — banho longo, massagem com óleo, ou simplesmente deitar sem culpa. O corpo agradece.',
      duration: '30 minutos',
      difficulty: 'light',
      type: 'ritual',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Presente Simbólico',
      instruction:
        'Sem gastar dinheiro — crie algo para alguém que ama: carta escrita à mão, playlist, receita. O valor está na atenção, não no preço.',
      duration: '30 minutos',
      difficulty: 'light',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Autoavaliação Gentil',
      instruction:
        'Liste 3 coisas que fez bem esta semana. Celebre sem modéstia. Depois liste 1 área a ajustar — sem crítica, apenas next step.',
      duration: '10 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Cuidado com a Mente',
      instruction:
        'Hoje, reduza inputs digitais. Leia algo físico. Anote 3 insights. A mente precisa de espaço tanto quanto o corpo.',
      duration: '20 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Gratidão Espiritual',
      instruction:
        'Escreva uma carta de gratidão ao universo — não por coisas, mas por aprendizados. O que este ciclo lhe ensinou que vale mais que qualquer coisa?',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra do Sacrifício',
      instruction:
        'Identifique um padrão de se colocado em último lugar. Pergunte: "E se eu me colocasse em primeiro, sem culpa?" Escreva a resposta honesta.',
      duration: '10 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  introspection: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Scan Corporal',
      instruction:
        'Deitado, feche os olhos. Do pé à cabeça, atenção lenta para cada parte do corpo — sem mudar, só notar. 15 min de body scan.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Diário Interior',
      instruction:
        'Escreva 3 perguntas sobre os seus relacionamentos que não tem coragem de fazer a si mesmo. Depois escolha 1 para explorar em silêncio hoje.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Retiro de 1 Hora',
      instruction:
        'Bloqueie 1 hora sem interrupções. Desligue notificações. Leia algo que nourisca profissionalmente ou faça uma sessão de brainstorming a sério.',
      duration: '60 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Pergunta Essencial',
      instruction:
        'Sente-se em silêncio. Faça a pergunta: "O que sei agora que não sabia há 1 ano?" Permita que a resposta surja — pode demorar 5-10 min.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Diálogo com o Sombra',
      instruction:
        'Ninguém por perto? Fale em voz alta para uma parte de si que tem evitado — pode ser a raiva, o medo, a inveja. Sem filtro, sem drama.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Inventário Interior',
      instruction:
        'Lista: o que me incomoda nos outros? Por quanto disso é reflexo de mim? Escolha 1 projecção para trabalhar esta semana.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  power: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Manifestação de Poder',
      instruction:
        'Visualize o resultado máximo de algo que deseja — não como pedir, mas como já ter. Sinta a emoção como se já fosse real. 10 min.',
      duration: '12 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Poder no Vínculo',
      instruction:
        'Identifique 1 área onde tem medo de ocupar espaço na relação. Pratique ocupar — dizer o que pensa, pedir o que quer, sem apology.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'social',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Reivindicação de Valor',
      instruction:
        'Escreva uma lista de 5 contribuições concretas que traz. Leia em voz alta. Depois: "Quanto valeria isso para alguém que precisa?"',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Decisão de Poder',
      instruction:
        'Identifique uma decisão que delegou ou adiou por insegurança. Hoje: escolha — com os dados que tem. O poder está na decisão, não na certeza.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Ritual de Reivindicação',
      instruction:
        'Escreva numa folha: "Eu reclamo o meu poder de ___" (3 coisas). Leia em voz alta. Guarde num lugar onde vai ver todos os dias.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra do Abuso de Poder',
      instruction:
        'Identifique um momento em que usou poder para manipular ou forçar. Sem auto-flagelação — apenas consciência. O que precisava em vez disso?',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },

  completion: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Ritual de Fechar Ciclos',
      instruction:
        'Identifique 3 coisas que começou e não terminou. Para cada uma: complete, entregue, ou elimine formalmente. Não pode ficar no limbo.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Carta de Encerramento',
      instruction:
        'Se há relação ou situação por fechar, escreva uma carta — não para enviar. Escreva o que precisa ser dito para poder seguir.',
      duration: '20 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Auditoria de Ciclo',
      instruction:
        'Revisite metas do último período. O que cumpriu? O que não? Sem culpa — o que não aconteceu ou não era mesmo prioridade.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Soltar para Avançar',
      instruction:
        'Pergunte: "O que estou a carregar que não é meu?" Soltar não é desistir — é deixar ir o peso morto para criar espaço para o novo.',
      duration: '10 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Oferecimento de Ciclo',
      instruction:
        'Escreva: "O que este ciclo me ensinou que quero levar para o próximo?" Depois: "O que ofereço ao mundo como resultado deste aprendizado?"',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Perdão Final',
      instruction:
        'Para alguém que feriu (ou si mesmo), escreva 1 frase de absolvição: "Eu perdoo ___ por ___ porque ___." Não é para o outro — é para si.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'ritual',
    },
  },

  spiritual: {
    vitalidadeEnergia: {
      area: 'vitalidadeEnergia',
      title: 'Comunhão Sagrada',
      instruction:
        'Peça um momento de silêncio expanded. Visualize-se conectado a algo maior — Deus, o cosmos, a natureza. Permita que o corpo se sinta parte de algo infinito.',
      duration: '15 minutos',
      difficulty: 'light',
      type: 'meditation',
    },
    conexoesAmor: {
      area: 'conexoesAmor',
      title: 'Amor Incondicional Prático',
      instruction:
        'Escolha 1 pessoa difícil. Sem mudar a pessoa, mude o seu pedido por ela — em vez de pedir que mude, peça que ela seja feliz. Sinta a diferença no corpo.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'meditation',
    },
    carreiraProsperidade: {
      area: 'carreiraProsperidade',
      title: 'Missão高于 Trabalho',
      instruction:
        'Pergunte: "O meu trabalho é um veículo para algo maior ou é o destino em si?" Escreva a resposta mais honesta que conseguir.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'journaling',
    },
    oriCabecaQuizilas: {
      area: 'oriCabecaQuizilas',
      title: 'Escuta do Silêncio',
      instruction:
        'Sente-se em completo silêncio — sem música, sem palavras, sem input. Apenas ser. Quando aparecer um pensamento, observe e volte ao silêncio.',
      duration: '20 minutos',
      difficulty: 'moderate',
      type: 'meditation',
    },
    missaoDestino: {
      area: 'missaoDestino',
      title: 'Covocation',
      instruction:
        'Em silêncio, pergunte ao universo: "O que queres que eu saiba hoje?" Permita que uma resposta surja — pode ser uma imagem, sensação, ou palavra.',
      duration: '15 minutos',
      difficulty: 'moderate',
      type: 'ritual',
    },
    desafiosSombras: {
      area: 'desafiosSombras',
      title: 'Sombra da Espiritualidade Evadida',
      instruction:
        'Identifique se usa espiritualidade para evitar o mundo real. Escreva: "Uma verdade incómoda que estou a evitar é ___." Enfrente, depois respire.',
      duration: '15 minutos',
      difficulty: 'deep',
      type: 'journaling',
    },
  },
};
