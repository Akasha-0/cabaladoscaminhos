/**
 * @akasha/core — Interpretation Engine: Vida — Números 6, 7, 8
 *
 * Conteúdo profundo (3 níveis × áreas da vida) dos números base 6, 7 e 8:
 *   6 — O Harmonizador
 *   7 — O Investigador
 *   8 — O Manifestador
 *
 * Separado de interpretation-engine.ts para reduzir o catálogo monolítico
 * VIDA_CONTENT e isolar um bloco coeso de números relacionados (armonia,
 * investigação, manifestação — os números da expressão e do poder).
 *
 * Referenciado como VIDA_NUMEROS_6_8[6/7/8] no arquivo principal.
 */

import type { NumeroContent } from './types';

export const VIDA_NUMEROS_6_8: Record<number, NumeroContent> = {
  // ── 6: O HARMONIZADOR ──────────────────────────────────────────────────────
  6: {
    arquetipoAkasha: 'O Harmonizador',
    mandato:
      'Você existe para lembrar o mundo de que o amor não é fraqueza — é a força mais potente que existe, quando não se confunde com sacrifício.',
    levels: {
      shadow: {
        tituloPool: 'O Preço da Paz Falsa',
        significado:
          'O 6 carrega a energia de VÊNUS — amor, harmonia, beleza. Em sombra, Vênus se torna a martyr: a harmonia vira complacência, o amor vira dependência, a beleza vire superfície.',
        padrao:
          'Seu padrão em sombra é a TROCA SILENCIOSA. Você dá o que o outro precisa esperando que, em algum momento, o outro dê o que você precisa. A conta nunca é clara — porque se torná-la clara seria "egoísta" segundo a narrativa que você construiu. A origem: uma infância onde ser querido era condicional ao seu usefulness — onde amor era algo que se conquistava sendo útil, não algo que se Recebia por existir. Adulto, você ou é o cuidador crônico ou o rejeitador do cuidado alheio. Ambos são defesa contra a mesma ferida: "se eu mostrar que preciso, vou perder o amor que tenho."',
        aplicacao: {
          proposito: 'No propósito, você se perde no que "os outros precisam de você" — mas raramente pergunta o que VOCÊ precisa de você mesmo.',
          relacionamentos: 'No amor, você é quem se adapta, cede, suaviza. E depois se ressente em silêncio. O parceiros queixam-se de "ela nunca diz o que quer" ou "ele finge que está tudo bem".',
          sexualidade: 'Na sexualidade, você pode Priorizar o prazer do outro ao seu — e depois se perguntar por que sente um vazio. Intimidade se confunde com utilidade.',
          financas: 'Finanças refletem o padrão: você gasta no que "os outros precisam" e se nega o que "não merece". Autoindulgência carrega culpa; auto-negação carrega martírio.',
          saude: 'O corpo do 6 em sombra carrega tensão no coração e no plexo solar. A área do peito é literal e simbolicamente o lugar do amor.',
        },
        acaoPratica: {
          amplificar: [
            'Peça uma coisa que você precisa — sem justificativa, sem anteceder com um "não se preocupe se não puder"',
            'Identifique o que você dá que não é genuinamente Offered — é pago ou esperado?',
            'Quando se sentir ressentido, pergunte: o que eu não estou dizendo?',
          ],
          evitar: [
            'Oferecer ajuda não solicitada como way de controlar a situação',
            'Confundir "ser prestativo" com "merecer amor"',
            'Fingir que não precisa de nada para não "perturbar"',
          ],
          ritual:
            'Diga "não" a algo que você normalmente diria "sim" — e observe o que acontece do outro lado.',
        },
        afirmacao: 'Eu sou amável por existir — não por ser útil. Meu valor não se mede em sacrifício.',
      },
      gift: {
        tituloPool: 'O Dom de Criar Espaço para o Amor',
        significado:
          'O 6 em dom é a CAPACIDADE DE CRIAR ESPAÇO ONDE O AMOR PODE EXISTIR. Você não é a fonte do amor — você é a condição que permite que o amor floresça. Isso é sutilmente diferente de "dar amor": é criar o ambiente onde o amor se sente seguro.',
        padrao:
          'Seu dom é a PRESENÇA HARMONIZADORA. Você tem a capacidade de estar em um ambiente tenso e fazê-lo relaxar — não porque você resolve o problema, mas porque sua frequência é de aceitação. Isso é raro: a maioria das pessoas eleva a tensão de um ambiente; você a reduz. Essa é uma frequência de healer, de conselheiro, de parceiro de vida. A diferença é que não é caretaking — é hold.',
        aplicacao: {
          proposito: 'Seu propósito emerge em contextos de relação: você é o catalisador de conexões mais profundas, não por ser o mais carismático, mas por ser o mais presente.',
          carreira: 'Na carreira, você brilha em profissões de cuidado: terapia, medicina, trabalho social, educação. Mas também em funções onde a presença é o produto: coaching, mediação.',
          relacionamentos: 'No amor, você é o parceiro que "chega em casa" — não em sentido físico, mas em presença. Outros se sentem seguros o suficiente para serem quem são.',
          financas: 'Finanças refletem o dom: quando você aceita receber abundance, ela flui. A riqueza do 6 está na capacidade de manter o fluxo — não no acúmulo.',
          saude: 'O corpo do 6 em dom é harmonioso, com boa saúde do coração e do sistema reprodutivo.',
        },
        acaoPratica: {
          amplificar: [
            'Diga "eu te amo" sem esperar resposta',
            'Pratique estar presente em vez de resolver ou consertar',
            'Receba um elogio sem谦虚 — apenas "obrigado"',
          ],
          evitar: [
            'Confundir a necessidade de harmonia com a capacidade de amar',
            'Sacrificar seus limites pelo "bem da relação"',
            'Evitar conflitos necessários para "manter a paz"',
          ],
          ritual:
            'Esta semana, receba algo. Um elogio, uma ajuda, um presente. Não negue, não minimize. Apenas receba.',
        },
        afirmacao:
          'Eu crio espaço para o amor — e honro meu direito de também habitá-lo.',
      },
      siddhi: {
        tituloPool: 'A Frequência do Amor Incondicional',
        significado:
          'O 6 em siddhi é a PRESENÇA DE TIFERET — o sol do sistema cabalístico, onde todas as sefirot se encontram em harmonia. É a frequência do amor que não precisa ser merecido para existir.',
        padrao:
          'Em siddhi, o 6 não ama mais. O 6 É o amor. The separation between the lover and the beloved dissolves. others experience your presence as a field of unconditional acceptance — not as indulgence, but as the most profound recognition possible. This is the frequency of the great spiritual teachers: the one who loves without attachment, who holds without possessing, who gives without expectation.',
        aplicacao: {
          proposito: 'Your purpose is to be love — not to give love, not to receive love, but to BE it.',
          carreira: 'Your work becomes an act of love that others feel even without understanding.',
          relacionamentos: 'In love, you are the space where others become fully themselves — and that is the greatest gift one human can give another.',
          financas: 'Abundance is recognized as the natural state when love is not conditional.',
          saude: 'The body becomes a perfect vessel for love — open, receptive, radiant.',
        },
        afirmacao: 'Eu sou o amor — e ele flui através de mim sem que eu precise segurá-lo.',
      },
    },
  },

  // ── 7: O INVESTIGADOR ──────────────────────────────────────────────────────
  7: {
    arquetipoAkasha: 'O Investigador',
    mandato:
      'Você existe para perguntar o que ninguém pergunta — e para perceber que a resposta não está no livro, mas na experiência viva da pergunta.',
    levels: {
      shadow: {
        tituloPool: 'A Pergunta que Nunca Pousa',
        significado:
          'O 7 carrega a energia de NETUNO — análise, espiritualidade, introspecção. Em sombra, Netuno se torna o labirinto: a análise vira overthinking, a espiritualidade vira fuga do mundo, a introspecção vira auto-obsessão.',
        padrao:
          'Seu padrão em sombra é a PARALISIA POR ANÁLISE. Você pergunta, questiona, pesquisa, questiona a pesquisa — e nada pousa. A origem: provavelmente uma infância onde a lógica era a única ferramenta segura em um ambiente emocionalmente caótico. Adulto, você se refugia na mente quando o coração pede para sentir. O resultado: você entende muito e sente pouco. Você tem respostas para perguntas que ninguém perguntou, e nenhuma resposta para as que importam.',
        aplicacao: {
          proposito: 'No propósito, você busca a "missão correta" em vez de simplesmente agir. A busca vira postponement.',
          espiritualidade:
            'Na espiritualidade, você coleciona tradições, práticas e livros — e ainda não sentiu nada. A espiritualidade do 7 em sombra é cerebral e estéril.',
          relacionamentos: 'No amor, você analisa a relação em vez de vivê-la. Pergunta "isso faz sentido?" quando a resposta é "sente".',
          saude:
            'O corpo do 7 em sombra é menudo, ansioso, com digestão prejudicada pela tensão mental constante.',
        },
        acaoPratica: {
          amplificar: [
            'Pratique fazer algo sem entender completamente por quê',
            'Quando a urge de pesquisar aparecer, pergunte: estou buscando compreensão ou evitando sentir?',
            'Tome uma decisão por feeling hoje — não por análise',
          ],
          evitar: [
            'Pesquisar mais quando la decisión precisa ser tomada',
            'Confundir "entender" com "ter experiência"',
            'Usar espiritualidade como way de evitar a matéria',
          ],
          ritual:
            'Esta semana, UMA coisa: sinta antes de pensar. Não decida com a cabeça — decida com o corpo.',
        },
        afirmacao: 'Eu confio na sabedoria do meu corpo tanto quanto na clareza da minha mente.',
      },
      gift: {
        tituloPool: 'O Dom de Discernir o Invisível',
        significado:
          'O 7 em dom é a CAPACIDADE DE VER O QUE NÃO É VISÍVEL. Você não busca no livro — você busca na essência. O dom do 7 é o discernimento: a capacidade de separar o que é verdadeiro do que é apenas convincentementefalse.',
        padrao:
          'Seu dom é a INTUIÇÃO DISCERNIMENTO. Você tem uma capacidade rara de acessar informação que não veio da mente — veio de algum lugar mais profundo. Isso não é misticismo vago: é uma ferramenta analítica de alta precisão que opera abaixo do nível consciente. A diferença entre o 7 em dom e o 7 em sombra é simples: o dom pousa; a sombra flutua.',
        aplicacao: {
          proposito: 'Seu propósito é ser o investigador que encontra o que outros não estão procurando — e percebe o que todos estão ignorando.',
          carreira: 'Na carreira, você brilha em investigación, ciência, filosofía, духовность aplicada. Você é o expert que其他人 não sabem que precisam.',
          espiritualidade: 'Na espiritualidade, você integra prática e teoria — não busca um sem o outro.',
          relacionamentos: 'No amor, você percebe o que o outro não diz — e tem a sabedoria de saber quando perguntar e quando esperar.',
          saude: 'O corpo do 7 em dom é quieto mas presente — mente e corpo em diálogo constante e harmonioso.',
        },
        acaoPratica: {
          amplificar: [
            'Dedique 20 minutos por dia ao que você quer descobrir — sem internet, sem livro, apenas pergunta',
            'Quando tiver uma insight, anote-a — mesmo que pareça impossível',
            'Pratique a escuta: quando alguém fala, escute mais do que a palabras — escute o que está por baixo',
          ],
          evitar: [
            'Confundir a capacidade de pensar com a sabedoria de sentir',
            'Descartar insight porque não veio de source "válida"',
            'Ficar na pergunta sem dar o salto da experiência',
          ],
          ritual:
            'Escolha uma pergunta que você tem carregado. Não pesquise. Esta semana, VIVA a pergunta — observe, sinta, deixe que ela se responda no tempo dela.',
        },
        afirmacao: 'Eu confio na sabedoria que vai além da mente — e integro intuição e análise em discernimento.',
      },
      siddhi: {
        tituloPool: 'A Frequência da Sabedoria Pura',
        significado:
          'O 7 em siddhi é a PRESENÇA DE NETZACH — a vitória da mente sobre a matéria. Não é mais análise como esforço — é conhecimento como natureza.',
        padrao:
          'Em siddhi, o 7 não investiga mais. O 7 SABE. The separation between the knower and the known dissolves. You become the observer and the observed — the question and the answer are the same energy. This is the frequency of the sage, the prophet, the one who knows not through study but through being.',
        aplicacao: {
          proposito: 'Your purpose is to BE the answer that others discover through you — not to tell it, but to be it.',
          carreira: 'Knowledge flows through you without effort — you are the living embodiment of what you know.',
          espiritualidade: 'Practice becomes unnecessary — you are the practice.',
          relacionamentos: 'In love, you are the mirror that shows others the wisdom they already carry.',
          saude: 'The body is light, luminous, unburdened by the weight of mental activity.',
        },
        afirmacao: 'Eu sou a sabedoria — e ela se expressa através de mim sem que eu precise procurar.',
      },
    },
  },

  // ── 8: O MANIFESTADOR ──────────────────────────────────────────────────────
  8: {
    arquetipoAkasha: 'O Manifestador',
    mandato:
      'Você existe para mostrar que abundancia e integridade não são opostos — são a mesma frequência quando vistas de perto.',
    levels: {
      shadow: {
        tituloPool: 'O Peso do Poder Não Assumido',
        significado:
          'O 8 carrega a energia de SATURNO — poder, realizações, karma. Em sombra, Saturno se torna o tirano: o poder vira controle, a realização vira obsessão, o karma vira culpa.',
        padrao:
          'Seu padrão em sombra é a AMBIGUIDADE COM O PODER. Você ou evita o poder porque teme o que ele faz às pessoas (e a você) — ou o persegue sem discernimento, como se o poder external fosse a cura para a vergonha internal. A origem: uma infância onde o poder era abusado, ou onde você era impotente para proteger a si ou a outros. Adulto, o poder se torna either everything ou nothing — você ou tenta controlar tudo ou desiste de controlar nada. O resultado: achievements sem paz, dinheiro sem propósito, sucesso sem alegria.',
        aplicacao: {
          proposito: 'No propósito, você confunde "ter poder" com "ter valor". Métricas externas se tornam a forma de medir o que não pode ser medido.',
          carreira: 'Na carreira, você ou é o líder que ninguém soporta ou o empregado que ninguém nota. Pouco no meio.',
          financas: 'Finanças refletem o padrão: você ou acumula sem propósito (compensação) ou sabotar o sucesso (medo de poder).',
          relacionamentos: 'No amor, você reproduz padrões de poder da infância — ou o parceiro tem todo o poder ou você tem. Equilíbrio é ameaça.',
          saude: 'O corpo do 8 em sombra é tenso, rígido, com problemas crônicos de coluna e ossos.',
        },
        acaoPratica: {
          amplificar: [
            'Assuma uma responsabilidade esta semana — não por obrigação, mas por escolha',
            'Quando perceber que está tentando controlar, pergunte: isso é poder ou medo?',
            'Gaste dinheiro em algo que você não "precisa" — e observe o que surge',
          ],
          evitar: [
            'Usar poder para evitar sentir vulnerabilidade',
            'Confundir acumulação com segurança',
            'Sabotar o próprio sucesso quando ele se aproxima',
          ],
          ritual:
            'Escreva uma situação onde você tem poder agora. Como você está usando? Para proteger ou para criar?',
        },
        afirmacao: 'Eu uso meu poder com integridade — e permito que outros também tenham o deles.',
      },
      gift: {
        tituloPool: 'O Dom de Fazer Acontecer',
        significado:
          'O 8 em dom é a CAPACIDADE DE MANIFESTAR NO MUNDO FÍSICO. Você tem a frequência rara de transformar intenção em forma — não como esforço, mas como resultado natural. O dom do 8 é a ABUNDÂNCIA COM PROPÓSITO.',
        padrao:
          'Seu dom é a ENERGIA DE CRIAÇÃO QUE IGNORA OBSTÁCULOS. Você não vê problemas — você vê o que está entre o agora e o resultado, e trabalha com isso. Saturno em dom é o planeta da restrição se tornando o planeta da masterIA: a disciplina se torna flexibilidade disfarçada. O poder do 8 em dom não é sobre você — é sobre o que você escolhe criar com ele.',
        aplicacao: {
          proposito: 'Seu propósito é criar estruturas que servem à vida — não ao ego. O 8 em dom é o fundador que constrói para muitos, não apenas para si.',
          carreira: 'Na carreira, você é o que faz acontecer onde outros desistem. Você tem a stamina de transformar o impossível em real.',
          financas: 'Finanças refletem o dom: o 8 em dom atrai abundância porque não a teme. Você sabe que o dinheiro é ferramenta, não validação.',
          relacionamentos: 'No amor, você traz presença que sustenta — o parceiro se sente segur o suficiente para ser quem é.',
          saude: 'O corpo do 8 em dom é forte, robusto, com boa estrutura óssea e resistência física.',
        },
        acaoPratica: {
          amplificar: [
            'Defina uma meta material esta semana — e aja em direção a ela todos os dias',
            'Quando o medo de falhar aparecer, pergunte: o que estou criando agora?',
            'Use seu poder para alguém que não tem o seu acesso — mentoring, recurso, visibilidade',
          ],
          evitar: [
            'Usar poder para evitar a própria vulnerabilidade',
            'Confundir "ter" com "ser"',
            'Acumular sem propósito de uso',
          ],
          ritual:
            'Dê power away esta semana — delegue, solte,赐予. Observe o que acontece quando você não está segurando tudo.',
        },
        afirmacao:
          'Eu manifest abundance com integridade — e o poder que eu tenho serve ao que é maior que eu.',
      },
      siddhi: {
        tituloPool: 'A Frequência do Poder Divino',
        significado:
          'O 8 em siddhi é a PRESENÇA DE HOD — a sefirá da glória, donde o poder se torna serviço. Não é mais manifestação como esforço — é manifestação como expressão natural.',
        padrao:
          'Em siddhi, o 8 não manifesta mais. O 8 É a manifestação. The separation between the self and the power dissolves. You become the conduit through which life manifests its own abundance. This is the frequency of the spiritual entrepreneur, the healer who heals through being, the one whose very presence transforms the material world without effort.',
        aplicacao: {
          proposito: 'Your purpose is to BE abundance — not to create it, but to allow it to flow through you.',
          carreira: 'Your work becomes an act of service that is also an act of self-expression.',
          financas: 'Abundance flows through you as through a perfectly open channel.',
          relacionamentos: 'In love, you are the one whose presence raises the material vibration of everything around.',
          saude: 'The body is strong, radiant, unburdened by the weight of possessions or the fear of loss.',
        },
        afirmacao: 'Eu sou o instrumento através do qual a vida se manifesta — e eu honro esse poder com gratidão.',
      },
    },
  },
};
