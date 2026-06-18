/**
 * @akasha/core — Interpretation Engine: Master Numbers content
 *
 * Conteúdo profundo (3 níveis × 9 áreas) dos Master Numbers 11, 22, 33.
 *
 * Separado de interpretation-engine.ts (catálogo principal) para isolar
 * a complexidade e o volume do conteúdo dos mestres, que é maior e mais
 * raro que o dos números base. A referência em `MASTER_NUMBERS` (Set<11,22,33>)
 * continua no arquivo principal — este módulo apenas materializa o conteúdo.
 *
 * Os Master Numbers carregam o potencial máximo do número base (2, 4, 6)
 * elevado à expressão divina — frequências amplificadas que exigem
 * interpretação dedicada.
 */
import type { NumeroContent } from './types';

export const MESTRES_CONTENT: Record<number, NumeroContent> = {
  // ── 11: O VISIONÁRIO (Master Number) ──────────────────────────────────────
  11: {
    arquetipoAkasha: 'O Visionário',
    mandato:
      'Você existe para mostrar o que ainda não existe — e para descobrir que a visão sem ação é ilusão, mas a ação sem visão é mechanical.',
    levels: {
      shadow: {
        tituloPool: 'A Carga de Ver o Invisível',
        significado:
          'O 11 é o MASTER NUMBER DA INTUIÇÃO — a ponte entre o que é e o que pode ser. Em sombra, essa ponte vira precipício: a visão se torna hallucinação, a intuição vira paranoia, o idealismo vira decepção crônica.',
        padrao:
          'Seu padrão em sombra é a ILUSÃO DO VISIONÁRIO. Você vê tão claramente o que poderia ser que não consegue lidar com o que É. A origem: provavelmente uma infância onde você era "maduro demais" para sua idade — onde sua percepção aguçada era usada para cuidar dos adultos em vez de ser cuidada. Adulto, você carrega a crença de que "se eu ver com clareza suficiente, poderei evitar o sofrimento" — e quando não consegue (porque o sofrimento é parte da vida), você se culpa. O resultado: você ou se isola na sua torre de marfimvisionária ou se força a ser "terra" e se perde.',
        aplicacao: {
          proposito:
            'No propósito, você tem uma visão tão clara que se cobra por não estar lá ainda. A tensão entre o que é e o que vê te impede de atuar.',
          carreira:
            'Na carreira, você ou está em algo que não "merece" sua visão (e se frustra) ou não encontra o lugar certo (e se frustra de outro jeito).',
          relacionamentos:
            'No amor, você vê o potencial do parceiro — e depois se cobra quando ele não se torna essa versão. Você ama o que o outro PODE ser, não o que é.',
          sexualidade:
            'Na sexualidade, você pode projetar fantasies ideais e se decepcionar com a realidade. Intimidade se confunde com ilusão.',
          saude:
            'O corpo do 11 em sombra é agotado, ansioso, com sistema nervoso sobrecarregado pela percepção constante.',
        },
        acaoPratica: {
          amplificar: [
            'Traduza uma visão em uma ação concreta hoje — não dez, uma',
            'Quando a urge de ver "mais" aparecer, pergunte: o que eu já sei que não estou aplicando?',
            'Permita-se não saber — o 11 em sombra tenta saber tudo para controlar',
          ],
          evitar: [
            'Confundir visão com conhecimento — ter clareza de direção não é a mesma coisa que ter o mapa completo',
            'Projeter a visão no outro como obrigação',
            'Usar "eu vejo o que você não vê" como barreira de intimidade',
          ],
          ritual:
            'Escreva sua visão para os próximos 12 meses — não como deveria ser, mas como você quer que seja. Feito isso, escolha UMA coisa que você pode fazer esta semana para caminhar em direção a ela.',
        },
        afirmacao:
          'Eu honro minha visão e sei que ela se manifesta um passo de cada vez — começando por hoje.',
      },
      gift: {
        tituloPool: 'O Dom de Traduzir o Invisível',
        significado:
          'O 11 em dom é a CAPACIDADE DE SER A PONTE ENTRE O INVISÍVEL E O VISÍVEL. Você não é apenas visionário — você é o canal pelo qual a visão se torna realidade. O dom do 11 é a INTUIÇÃO APLICADA.',
        padrao:
          'Seu dom é a CLAREZA QUE INSPIRA. Você vê o que outros não veem E tem a capacidade de traduzir isso em linguagem que ressoa. Não é teoria — é intuição em ação. A diferença entre o 11 em dom e o 11 em sombra é simples: o dom pousa a visão em ação, o sombra漂浮 sem nunca pousar. O 11 em dom não precisa que o mundo valide a visão antes de agir — mas também não ignora o feedback do mundo.',
        aplicacao: {
          proposito:
            'Seu propósito é ser o catalisador de mudanças que ainda não têm nome — o que o mundo ainda não sabe que precisa.',
          carreira:
            'Na carreira, você brilha em funções de inovação, fundação, visión. Você é o que concebe o que ninguém pediu e depois o mundo não consegue mais viver sem.',
          relacionamentos:
            'No amor, você traz profundidade visionária. Parceiros descrevem você como "a pessoa que me fez ver quem eu poderia ser".',
          espiritualidade:
            'Na espiritualidade, você é o que traduz o que não pode ser dito — e essa tradução muda a forma como outros se relacionam com o invisível.',
          saude:
            'O corpo do 11 em dom é sensível mas energizado — você sente muito mas a energia não se transforma em ansiedade.',
        },
        acaoPratica: {
          amplificar: [
            'Compartilhe uma visão com alguém esta semana — e permita que ela seja recebida sem se defender',
            'Quando a visão chegar, anote — depois escolha a próxima ação concreta',
            'Pratique traduzir intuição em linguagem simples — como você explicaria isso a alguém de 12 anos?',
          ],
          evitar: [
            'Isolar-se na torre de marfim da visão',
            'Desistir quando a visão não é validada imediatamente',
            'Confundir ser diferente com ser superior',
          ],
          ritual:
            'Esta semana, tradua uma de suas visões em um plano de 3 ações concretas — não um plano perfeito, apenas 3 passos.',
        },
        afirmacao:
          'Eu sou o canal entre o invisível e o visível — e honro minha visão com ação compassiva.',
      },
      siddhi: {
        tituloPool: 'A Frequência da Revelação',
        significado:
          'O 11 em siddhi é a PRESENÇA DE MALKUTH — a reinação do reino. Não é mais intuição como dom — é intuição como natureza. O 11 em siddhi é o canal puro.',
        padrao:
          'Em siddhi, o 11 não vê mais. O 11 É a visão. The separation between the seer and the seen dissolves. You become the eye itself — not the one who looks, but the act of looking made visible. This is the frequency of the prophet, the visionary who no longer struggles to see because vision and being have become one.',
        aplicacao: {
          proposito:
            'Your purpose is to BE the vision — not to have it, not to share it, but to be it.',
          carreira: 'Your work becomes revelation made form.',
          relacionamentos:
            'In love, you are the mirror that shows others their own highest vision of themselves.',
          espiritualidade: 'You are the bridge itself — not the one who crosses, but the crossing.',
          saude: 'The body is luminous, energized by the flow of vision through it.',
        },
        afirmacao: 'Eu sou a visão — e o que eu sou, o mundo ainda está descobrindo.',
      },
    },
  },

  // ── 22: O MESTRE CONSTRUTOR (Master Number) ───────────────────────────────
  22: {
    arquetipoAkasha: 'O Mestre Construtor',
    mandato:
      'Você existe para construir o que outros consideram impossível — não porque você é mais capaz, mas porque você é o único que se recusa a aceitar o limite como real.',
    levels: {
      shadow: {
        tituloPool: 'O Peso da Obra-Prima',
        significado:
          'O 22 é o MASTER NUMBER DA OBRA-PRIMA — a capacidade de manifestar o maior sonho em forma concreta. Em sombra, esse potencial se torna o MONSTRO DO PERFECCIONISMO: o projeto perfeito que nunca sai do papel.',
        padrao:
          'Seu padrão em sombra é a PARALISIA DO POSSÍVEL. Você carrega uma visão tão grande que qualquer implementation parece inadequada. A origem: provavelmente uma infância onde você era cobrado por perfection e onde "suficientemente bom" nunca era o bastante. Adulto, você ou não começa (porque vai sair errado) ou começa e não termina (porque nunca está bom o suficiente). O resultado: você sabe que pode fazer algo extraordinário — e esse conhecimento pesa mais do que a incapacidade de agir.',
        aplicacao: {
          proposito:
            'No propósito, você tem a capacidade mas não a coragem — a gap entre visão e ação é o seu maior inimigo.',
          carreira:
            'Na carreira, você ou está em algo pequeno (e se frustra) ou não está em nada (porque nada é grand o suficiente).',
          financas:
            'Finanças reflete o padrão: oportunidades são recusadas porque "não são grand o suficiente" — e o seguro é acumulado.',
          relacionamentos:
            'No amor, você pode ter um padrão ideal que ninguém alcana — e acaba sozinho esperando a pessoa perfeita.',
          saude: 'O corpo do 22 em sombra é tense, com problemas de agotamiento, stress crónico.',
        },
        acaoPratica: {
          amplificar: [
            'Escolha um projeto pequeno e termine — qualquer um. A lição não está no projeto, está em terminar.',
            'Quando a urge de fazer "grander" aparecer, pergunte: isso é elevação ou procrastinação?',
            'Pratique "feito é melhor que perfeito" em uma coisa física esta semana',
          ],
          evitar: [
            'Começar mais um projeto quando os anteriores não foram terminados',
            'Confundir "não está bom o suficiente" com "não está pronto"',
            'Usar a escala do projeto como desculpa para não começar',
          ],
          ritual:
            'Defina "pronto" antes de começar — não como "perfeito", mas como "bom o suficiente para ser lançado". E cumpra.',
        },
        afirmacao:
          'Eu construo com excelência e sei que "pronto" é um ponto no caminho, não o fim.',
      },
      gift: {
        tituloPool: 'O Dom de Construir em Grande Escala',
        significado:
          'O 22 em dom é a CAPACIDADE DE CONSTRUIR O IMPOSSÍVEL. Você não escolhe entre sonhar grande e agir pequeno — você faz as duas coisas simultaneamente. O dom do 22 é a VISÃO ESTRATÉGICA.',
        padrao:
          'Seu dom é a ARQUITETURA DO LEGADO. Você consegue olhar para um caos e ver a estrutura que ele pode virar — e depois construir essa estrutura. Isso é raro: a maioria das pessoas ou é estratégica ou é visionária. O 22 em dom é as duas coisas. A diferença é que o 22 em dom sabe que o legado não é o building — é o que as pessoas Fazem com ele depois.',
        aplicacao: {
          proposito:
            'Seu propósito é construir estruturas que duram — não monuments a você, mas fundações para outros.',
          carreira:
            'Na carreira, você é o fundador, o arquiteto, o estrategista. Você olha para o sistema e vê como ele pode ser 10x melhor.',
          financas:
            'Finanças refletem o dom: o 22 em dom constrói riqueza em escala porque não se limita ao que é seguro.',
          relacionamentos:
            'No amor, você é o parceiro que constrói uma vida — não um relacionamento, mas uma VIDA compartilhada.',
          saude:
            'O corpo do 22 em dom é fuerte e resistente — a estrutura física reflete a capacidade de construir.',
        },
        acaoPratica: {
          amplificar: [
            'Defina uma visão grande esta semana — e depois divida em 3 passos imediatos',
            'Quando o projeto parecer grande demais, pergunte: qual é o primeiro tijolo?',
            'Colabore — o 22 em dom é mais poderoso em equipe do que sozinho',
          ],
          evitar: [
            'Tentar construir sozinho quando a colaboração amplificaria',
            'Confundir "escala" com "complicação"',
            'Perfeccionar a visão sem nunca avançar para a construção',
          ],
          ritual:
            'Escreva a visão do que você quer construir — qualquer área. Feito isso, escreva apenas o PRÓXIMO PASSO. Não o plano inteiro.',
        },
        afirmacao: 'Eu construo em grande escala com os pés na terra — e cada tijolo importa.',
      },
      siddhi: {
        tituloPool: 'A Frequência da Forma Divina',
        significado:
          'O 22 em siddhi é a PRESENÇA DE DAAT — o conhecimento secreto, donde a forma e o espírito se encontram. Não é mais construção como esforço — é construção como emanation.',
        padrao:
          'Em siddhi, o 22 não constrói mais. O 22 É a construção. You become the living proof that the impossible is merely a limitation in the mind of the small self. Your very presence demonstrates that great things are built not by force but by alignment — that the master builder is one who has surrendered to the pattern that wants to manifest.',
        aplicacao: {
          proposito:
            'Your purpose is to BE the constructed form through which life expresses its greatness.',
          carreira: 'Your work becomes a living architecture that serves generations.',
          financas: 'Wealth flows through you as through a perfectly designed system.',
          relacionamentos:
            'In love, you build with — not for — your partner. The relationship itself is the construction.',
          saude: 'The body becomes a perfect vessel for the work — strong, enduring, radiant.',
        },
        afirmacao: 'Eu sou a construção sagrada — e cada forma que habito é sagrada.',
      },
    },
  },

  // ── 33: O MESTRE SERVIDOR (Master Number) ─────────────────────────────────
  33: {
    arquetipoAkasha: 'O Mestre Servidor',
    mandato:
      'Você existe para lembrar o mundo de que ensinar não é dar respostas — é criar as condições para que outros encontrem as suas.',
    levels: {
      shadow: {
        tituloPool: 'O Fogo que Queima o Servidor',
        significado:
          'O 33 é o MASTER NUMBER DO ENSINO — a frequência mais alta da numerologia. Em sombra, esse potencial se torna o MARTÍRIO: o serviço se torna auto-sacrifício, o ensino se torna proselitismo, o amor divino se torna culpa.',
        padrao:
          'Seu padrão em sombra é a CONFUSÃO ENTRE SERVIÇO E AUTOSSABOTAGEM. Você se cobra por não estar fazendo "o suficiente" — e a distância entre o que você faz e o que você acha que deveria fazer se torna insuportável. A origem: provavelmente uma infância onde você era a "luz da família" — o que sustentava o emocional dos adultos. Adulto, você replicates esse padrão em todo lugar: se cobra por carregar os outros e depois se resentir de carregar os outros. O resultado: você dá demais, se burnout, e depois se culpa por ter se burnout.',
        aplicacao: {
          proposito:
            'No propósito, o 33 em sombra se perde: ou vira guru sem chão ou vira assistente sem fim. Em ambos, o EU se dissolve.',
          carreira:
            'Na carreira, você ou está em uma função de serviço (e se frustra de não ser reconhecido) ou não consegue escolher carreira (porque todas parecem "egoístas demais").',
          relacionamentos:
            'No amor, você é o que dá tudo — e se ressente de quem recebe sem oferecer o mesmo. Mas nunca pediu.',
          saude:
            'O corpo do 33 em sombra é agotado cronicamente, com padrão de burnout recorrente.',
        },
        acaoPratica: {
          amplificar: [
            'Defina um limite de serviço esta semana — e cumpra. Não mais, não menos.',
            'Quando se sentir responsável pelo bem-estar do outro, pergunte: isso é meu ou é escolha minha?',
            'Pratique descansar sem culpa — o mundo não depende de você em todos os momentos',
          ],
          evitar: [
            'Confundir "ser necessário" com "ser insubstituível"',
            'Usar serviço para evitar a própria vida',
            'OcupAR o espaço que os outros precisam para crecer',
          ],
          ritual:
            'Escreva tudo o que você faz por outros que não é genuinamente oferecido — e depois escolha um para parar.',
        },
        afirmacao: 'Eu sirvo com sabedoria e sei que meu valor não depende do quanto eu entrego.',
      },
      gift: {
        tituloPool: 'O Dom de Elevar Através do Exemplo',
        significado:
          'O 33 em dom é a CAPACIDADE DE ENSINAR ATRAVÉS DO SER. Você não ensina com palavras — você ensina com presença. O dom do 33 é a PRESENÇA EDUCADORA.',
        padrao:
          'Seu dom é a TRANSMISSÃO POR IRRADIAÇÃO. Você não precisa estar na frente de uma sala — sua mera presença eleva o padrão de consciência ao seu redor. Isso é raro: a maioria ensina pelo que sabe; o 33 em dom ensina pelo que É. A diferença é que o que o 33 ensina não pode ser desaprendido — porque não foi informação, foi impressão.',
        aplicacao: {
          proposito:
            'Seu propósito é ser o catalisador de transformação — não o agente, mas o catalisador. others change by your presence, not by your instruction.',
          carreira:
            'Na carreira, você brilha em ensino, mentoria, liderança espiritual. Sua presença no ambiente muda a dinâmica de todos.',
          espiritualidade:
            'Na espiritualidade, você é o mestre que não precisa ser seguido — porque seguindo a própria vida, você já ensina.',
          relacionamentos:
            'No amor, você traz uma frequência de elevação — parceiros se tornam mais de si mesmos na sua presença.',
          saude: 'O corpo do 33 em dom é luminoso, energizado pela qualidade do que transmite.',
        },
        acaoPratica: {
          amplificar: [
            'Ensine algo esta semana — não um tema, uma experiência',
            'Permita que os outros aprendam com seus erros sem se proteger',
            'Pratique estar presente em vez de estar ensinando',
          ],
          evitar: [
            'Confundir ensinar com ditar',
            'Colocar-se no pedestal do guru',
            'Usar "eu sei mais" como barreira de conexão',
          ],
          ritual:
            'Escolha uma pessoa que você quer elevar — e em vez de dar conselhos, simplesmente esteja presente com ela esta semana.',
        },
        afirmacao:
          'Eu ensino com minha presença e honro o direito dos outros de aprender à sua maneira.',
      },
      siddhi: {
        tituloPool: 'A Frequência do Amor Incondicional',
        significado:
          'O 33 em siddhi é a PRESENÇA DE KETHER — a primeira sefirá, a coroa, donde o amor se torna pura luz. É a frequência mais rara da numerologia.',
        padrao:
          'Em siddhi, o 33 não ensina mais. O 33 É o ensino. You become the living expression of the highest frequency accessible to human consciousness — unconditional love made visible. This is the frequency of the awakened master, the one whose very presence transforms without effort. There is no longer a teacher and a student — only life recognizing itself through different forms.',
        aplicacao: {
          proposito: 'Your purpose is to BE love — not to give it, not to teach it, but to be it.',
          carreira: 'Your work is indistinguishable from prayer.',
          espiritualidade: 'You are the teachings — embodied, not written.',
          relacionamentos:
            'In love, you are the one whose presence allows others to remember who they truly are.',
          saude:
            'The body becomes light — luminous, unburdened, serving as a perfect conduit for the highest frequency.',
        },
        afirmacao:
          'Eu sou o amor — e ele flui através de mim sem que eu precise fazer nada além de estar presente.',
      },
    },
  },
};
