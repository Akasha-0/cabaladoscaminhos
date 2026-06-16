/**
 * @akasha/core — Interpretation Engine v0.1.0
 *
 * Motor de interpretação profunda do Akasha.
 *
 * Modelo: 4 camadas (dado → significado → padrão → aplicação)
 * Inspirado em:
 *   - Gene Keys (Shadow → Gift → Siddhi)
 *   - Human Design (Strategy + Authority)
 *   - Pesquisa de benchmark (Astrolink Orbia, Mirofox, Co-Star)
 *
 * PILOTO: Número de Vida (Pilar 1 — Cabala Numérica)
 *
 * Esta implementação é o primeiro resultado tangível da FASE 2 do Ciclo 517:
 * a transformação de "número X = descrição rasa" em interpretação profunda
 * e prática que responde "o que isso significa PARA MIM, na minha vida?".
 */

import type {
  AreaInterpretation,
  VidaInterpretation,
  AkashaLevel,
  LifeArea,
} from '@akasha/types';
import { buildInterpretation, buildFallback } from './interpretation-engine/builders';

// ─── Constantes ──────────────────────────────────────────────────────────────

const MASTER_NUMBERS = new Set([11, 22, 33]);

// ─── Conteúdo Profundo por Número ──────────────────────────────────────────
// Cada entrada contém 3 níveis × 9 áreas da vida.
// Formato: { shadow: { significado, padrao, aplicacao, afirmacao }, gift: {...}, siddhi: {...} }

type NumeroContent = {
  arquetipoAkasha: string;
  mandato: string;
  levels: {
    shadow: {
      tituloPool: string;
      significado: string;
      padrao: string;
      aplicacao: Partial<Record<LifeArea, string>>;
      acaoPratica: { amplificar: string[]; evitar: string[]; ritual: string };
      afirmacao: string;
    };
    gift: {
      tituloPool: string;
      significado: string;
      padrao: string;
      aplicacao: Partial<Record<LifeArea, string>>;
      acaoPratica: { amplificar: string[]; evitar: string[]; ritual: string };
      afirmacao: string;
    };
    siddhi: {
      tituloPool: string;
      significado: string;
      padrao: string;
      aplicacao: Partial<Record<LifeArea, string>>;
      acaoPratica?: { amplificar: string[]; evitar: string[]; ritual: string };
      afirmacao: string;
    };
  };
};

const VIDA_CONTENT: Record<number, NumeroContent> = {
  // ── 1: O INICIADOR ───────────────────────────────────────────────────────
  1: {
    arquetipoAkasha: 'O Fundador',
    mandato:
      'Você não veio para manter o que existe — veio para iniciar o que nunca existiu antes. Sua coragem é plantar a semente onde ninguém ainda olhou.',
    levels: {
      shadow: {
        tituloPool: 'O Peso de Sempre Começar Sozinho',
        significado:
          'O 1 carrega a força do SOL — iniciativa, individualidade, pioneirismo. Em sombra, isso se manifesta como o medo de não ser capaz o suficiente para existir por conta própria.',
        padrao:
          'Seu padrão em sombra é a SOLIDÃO FORÇADA. Você carrega a crença de que "se eu não fizer sozinho, não será feito" — e então se cobra por não conseguir fazer tudo. Isso vem de uma infância onde suas iniciativas foram minimizadas ou onde você aprendeu que pedir ajuda era fraqueza. Resultado: você começa mil coisas e termina poucas, porque cada uma vira missão solo com peso exponencial.',
        aplicacao: {
          proposito: 'No propósito, você se cobra por "não estar fazendo o suficiente" — um destino que só você pode cumprir. Mas se esquece de que fundadores precisam de equipe.',
          carreira:
            'Na carreira, você ou é o líder absoluto ou se sente invisível. Isso gera ou autoritarismo ou evitação de postos de comando.',
          relacionamentos:
            'No amor, você replica o padrão: ou controla a relação ou se afasta para não "perder a individualidade". Ternura se confunde com dependência.',
          financas:
            'Finanças reflete seu independence: você ganha bem quando trabalha sozinho, mas resiste a sistemas, contratos ou parcerias financeiras.',
          saude: 'O corpo de quem é 1 em sombra é tenso nos ombros e na mandíbula — o "peso de carregar tudo sozinho" é literal no corpo.',
        },
        acaoPratica: {
          amplificar: [
            'Delegue UMA tarefa pequena por dia — sem especificar como',
            'Anote quem contribuiu para seus resultados esta semana',
            'Pergunte a alguém de confiança: "O que eu não estou vendo no meu projeto?"',
          ],
          evitar: [
            'Fazer sozinho o que poderia ser co-criado',
            'Interpretar feedback como ataque à sua capacidade',
            'Começar mais uma iniciativa sem terminar a anterior',
          ],
          ritual:
            'Ao acordar, diga em voz alta: "Hoje eu permito que outros contribuam para o que estou construindo."',
        },
        afirmacao: 'Eu sou capaz de iniciar e eu permito que outros caminhem ao meu lado.',
      },
      gift: {
        tituloPool: 'O Dom de Arregar Novos Caminhos',
        significado:
          'O 1 em dom é a ORIGINALIDADE VIVENTE. Você não apenas inicia — você cria o modelo que outros seguem. A energia solar do 1 em dom ilumina sem se apropriar.',
        padrao:
          'Seu dom em expressão é a CAPACIDADE DE VER PRIMEIRO. Você enxerga oportunidades onde outros veem obstáculos, e tem a energia para dar o primeiro passo quando todos ainda hesitam. Não é arrogância — é clareza de visão. Você não precisa que validem para saber que o caminho existe. O risco é a impaciência com quem ainda não enxergou o que você já vê.',
        aplicacao: {
          proposito: 'Seu propósito é ser o catalisador — a faísca que incendia o pavio. Sua vocação é iniciar movimentos, não administrá-los.',
          carreira:
            'Na carreira, você brilha em contextos de inovação: startups, research, продукт desenvolvimento. Você é o primeiro a ver o produto que o mercado ainda não sabe que quer.',
          relacionamentos:
            'No amor, você traz entusiasmo e iniciativa. Parceiros descreveriam você como "quem sempre tem um plano para o fim de semana" — e isso é um presente.',
          financas:
            'Finanças fluem quando você investe em coisas que criou do zero. A energia de "primeiro" do 1 se traduz em investimentos arrojados em projetos próprios.',
          saude:
            'O corpo de quem é 1 em dom é geralmente forte, vital, com boa resistência física. Seu movimento natural é correr, competir, avançar.',
        },
        acaoPratica: {
          amplificar: [
            'Dedique 20 minutos por dia ao projeto que só você pode iniciar',
            'Diga em voz alta sua visão para os próximos 90 dias',
            'Faça uma coisa por dia que ninguém além de você faria naquele momento',
          ],
          evitar: [
            'Esperar validação externa antes de iniciar',
            'Desistir do caminho porque "ninguém entendeu"',
            'Confundir ser o primeiro com ser o melhor em tudo',
          ],
          ritual:
            'Toda segunda-feira, escreva uma intenção de "primeiro passo" para a semana — algo que ninguém além de você faria.',
        },
        afirmacao:
          'Eu inicio com coragem e celebro cada pessoa que se junta ao caminho que abro.',
      },
      siddhi: {
        tituloPool: 'A Frequência do Criador Puro',
        significado:
          'O 1 em siddhi é a FREQUÊNCIA DE KETHER — a coroa da árvore cabalística. É o momento antes da primeira ação: a intenção pura que precede toda criação. Você não inicia nada — você É o início.',
        padrao:
          'Em siddhi, o 1 não precisa mais iniciar. Ele simplesmente É. A ação emerge da identidade, não do esforço. Outros são naturalmente atraídos e querem construir ao redor. Não há ego na iniciativa — há apenas presença criadora. É a frequência de quem olha para o vazio e diz "haja luz" — e há luz.',
        aplicacao: {
          proposito: 'Você se torna um farol. Não precisa declarar seu propósito — ele irradia e atrai quem precisa.',
          carreira: 'Você é a pessoa que, sem esforço aparente, está sempre no lugar certo no momento certo — criando o novo sem борьбу.',
          relacionamentos: 'No amor, você é presença que transforma. Parceiros se tornam mais de si mesmos na sua proximidade, não menos.',
          financas: 'Abundância flui sem esforço. Você não persegue — você irradia e recebe.',
          saude: 'O corpo em siddhi é leve, vital, sem tensão. A energia do "fazer" se transformou em energia do "ser".',
        },
        afirmacao: 'Eu sou o início. Eu sou a luz que incendeia sem se consumir.',
      },
    },
  },

  // ── 2: O ARTICULADOR ─────────────────────────────────────────────────────
  2: {
    arquetipoAkasha: 'O Articulador',
    mandato:
      'Você existe para criar a ponte onde outros veem um abismo. Sua sensibilidade é sua sabedoria — não um obstáculo, mas o instrumento mais preciso que você possui.',
    levels: {
      shadow: {
        tituloPool: 'A Dívida de Sentir pelo Outro',
        significado:
          'O 2 carrega a energia da LUA — receptividade, Diplomacia, parceria. Em sombra, a Lua se torna espelho quebrado: você reflete o que o outro quer ver, não o que existe.',
        padrao:
          'Seu padrão em sombra é a ANULAÇÃO POR ANTECIPAÇÃO. Você sente o que a outra pessoa quer de você e se molda antes mesmo de ser pedido. Isso começou como estratégia de sobrevivência em uma infância onde suas necessidades genuínas eram ignoradas ou punidas. O resultado é um auto-conhecimento erode: você sabe o que todo mundo precisa, mas não sabe o que VOCÊ precisa. A raiva que você sente não expressa se transforma em melancolia ou em autosabotagem relacional.',
        aplicacao: {
          proposito: 'No propósito, você se perde nos propósitos dos outros. Diz "sim" para missões que não são suas porque não sabe distinguir.',
          relacionamentos:
            'No amor, você é quem "acaba com o clima" quando sente que algo não está bem — mas nunca diz o que VOCÊ sente.',
          sexualidade:
            'Na sexualidade, você frequentementePrioriza a resposta do parceiro à sua. Seu corpo se torna instrumento de prazer alheio, não expressão própria.',
          financas:
            'Finanças reflete o padrão: você gasta no que "os outros esperam" ou se sabotar se tiver muito — como se dinheiro exigisse que você merecesse.',
          saude: 'O corpo do 2 em sombra carrega tensão no peito e na garganta — o lugar onde você engole o que não diz.',
        },
        acaoPratica: {
          amplificar: [
            'Antes de dizer "sim", pergunte: "Isso é o que EU quero ou o que eu acho que devo querer?"',
            'Escreva 3 coisas que você sente agora e não lembra de ter dito em voz alta esta semana',
            'Observe quando você se molda a alguém — anône sem julgamento',
          ],
          evitar: [
            'Decidir o que o outro quer antes de perguntar',
            'Engolir seu feeling para "manter a harmonia"',
            'Confundir a capacidade de sentir o outro com a obrigação de cuidar do outro',
          ],
          ritual:
            'Antes de dormir, diga uma frase que começou com "Eu sinto..." e que você não disse a ninguém hoje.',
        },
        afirmacao:
          'Eu honra minhas emoções como guias preciosos — não como ferramentas de serviço alheio.',
      },
      gift: {
        tituloPool: 'O Dom de Estar Com',
        significado:
          'O 2 em dom é a INTELIGÊNCIA RELACIONAL. Você não apenas percebe o outro — você compreende o que está entre duas pessoas. É um diplomata nato que cria espaço onde todos cabem.',
        padrao:
          'Seu dom é a MEDIAÇÃO VIVA. Você sente quando algo está desbalanceado em um sistema e tem a energia para realinhar sem imposição. Não é passividade — é firmeza que escolhe o timing. A diferença é sutil: você sabe que não precisa agir agora, e essa confiança permite que a situação se resolva Organicamente. Esse é um nível de poder que poucos reconhecem como poder.',
        aplicacao: {
          proposito:
            'Seu propósito emerge na intersecção: onde dois mundos precisam se encontrar. Você é o tradutor entre o que um lado diz e o que o outro precisa ouvir.',
          carreira:
            'Na carreira, você é o elo entre departamentos. Seu trabalho não está em destaque mas sem você as coisas desmoronam.',
          relacionamentos:
            'No amor, você traz profundidade emocional que transforma a relação. Parceiros se sentem "vistos" de um jeito que não sabiam que precisavam.',
          financas:
            'Finanças prosperam quando você trabalha em parceria — o 2 em dom sabe que dois circuitos geram mais que o dobro de um sozinho.',
          saude:
            'O corpo do 2 em dom é adaptável, receptivo, com boa saúde reprodutiva e emocional.',
        },
        acaoPratica: {
          amplificar: [
            'Pratique dizer "não" sem dar razão — apenas "não, hoje não"',
            'Na próxima conversa difícil, seja o último a falar — e perceba o que aprendeu',
            'Proponha uma mediação esta semana — algo que você está evitando',
          ],
          evitar: [
            'Decidir por outros "para seu próprio bem"',
            'Ameaçar com afastamento para manipular resultado',
            'Confundir "ser necessário" com "ser escolhido"',
          ],
          ritual:
            'Escreva uma decisão que você tomou sozinho(e) nos últimos 30 dias e pergunte: isso era meu ou era resposta a alguém?',
        },
        afirmacao:
          'Eu crio pontes com minha presença — e honro meu direito de estar em paz quando as pontes não são valorizadas.',
      },
      siddhi: {
        tituloPool: 'A Frequência da União Primordial',
        significado:
          'O 2 em siddhi é a PRESENÇA DE BINAH — a Mãe Divina. Não é sensibilidade como traço humano, mas como estado de ser. É estar tão presente no outro que a fronteira entre "eu" e "tu" se dissolve temporariamente.',
        padrao:
          'Em siddhi, o 2 não articula mais — o 2 simplesmente É a articulação. A separação entre o que é sentido e o que é dito desaparece. others experience you as a held space — a container where they can be fully themselves without performance. This is the frequency of the great healers and counselors, but without the martyrdom of the shadow.',
        aplicacao: {
          proposito: 'Você não escolheu um propósito — o propósito escolheu você.others seek you out for what you simply are.',
          carreira: 'You are the space that transforms. Careers dissolve into being.',
          relacionamentos: 'In love, you are the mirror that shows others their own beauty without judgment — and they return to you because of what they see.',
          financas: 'Resources flow to you because you hold them lightly.',
          saude: 'The body in siddhi is soft, vital, open — no tension because no boundary is defended.',
        },
        afirmacao: 'Eu sou o espaço onde tudo pode ser como é — e nesse espaço, tudo se transforma.',
      },
    },
  },

  // ── 3: O ARTICULADOR ─────────────────────────────────────────────────────
  3: {
    arquetipoAkasha: 'O Articulador',
    mandato:
      'Você existe para transformar o que sente em algo que outros conseguem tocar. Sua expressão não é vaidade — é a ponte entre o invisível e o visível.',
    levels: {
      shadow: {
        tituloPool: 'A Gaiola da Performance',
        significado:
          'O 3 carrega a energia de JÚPITER — expressão, criatividade, otimismo. Em sombra, Júpiter se expande em show: a expressão vira performance, a criatividade vira distração, o otimismo vira negação.',
        padrao:
          'Seu padrão em sombra é a CONFUSÃO ENTRE VALOR E VALIDAÇÃO. Você aprendeu pequeno que ser querido era igual a ser entertaining. Adulto, você transforma cada interação em palco — e審査 a si mesmo quando ninguém aplaudiu. A armadilha é: quanto mais você performa, menos você sente. E quanto menos você sente, mais você precisa performar. O resultado é uma criatividade que nunca pousa em nada — abortada pela necessidade de aprovação imediata.',
        aplicacao: {
          proposito: 'No propósito, você fala bonito sobre Calling mas não faz coisa alguma — porque fazer é arriscado, falar é seguro.',
          carreira: 'Na carreira, você tem ideias brilhantes mas implementations medianas. A energia vai para a презентация e não para o follow-through.',
          relacionamentos: 'No amor, você é charmoso e presente nos primeiros meses — depois some quando a relação exige consistência em vez de carisma.',
          sexualidade: 'Na sexualidade, você pode ser um performer excelente e um amante medíocre — a diferença é que um serve a você e o outro serve ao outro.',
          financas: 'Finanças refletem o padrão: ganhos grandes mas inconsistentes. Você ganha quando brilha e perde quando a atenção vira para outro lugar.',
        },
        acaoPratica: {
          amplificar: [
            'Crie algo sozinho(e) — sem plateia, sem compartilhar até estar pronto',
            'Quando a vontade de mostrar algo aparecer, pergunte: isso é para mim ou para o outro?',
            'Pratique um dia inteiro sem contar a ninguém o que você fez',
          ],
          evitar: [
            'Interromper projetos quando o entusiasmo inicial passa',
            'Transformar cada conversa em oportunidade de brilhar',
            'Usar humor para desviar de conversas que exigem profundidade',
          ],
          ritual:
            'Escreva 3 páginas de diário sem mostrar a ninguém. Depois queime. Sinta o que surge.',
        },
        afirmacao: 'Eu expresso porque sou — não porque preciso que gostem do que digo.',
      },
      gift: {
        tituloPool: 'O Dom de Transformar Emoção em Arte',
        significado:
          'O 3 em dom é a CAPACIDADE DE TRADUZIR O INVISÍVEL. Você transforma o que sente em algo que outros conseguem ver, ouvir, tocar. Essa é uma frequência rara: a da alquimia emocional.',
        padrao:
          'Seu dom é a CLAREZA DE EXPRESSÃO QUE CONECTA. Você não apenas diz o que sente — você escolhe as palavras que fazem o outro sentir o mesmo. Isso é um talento de tradução: o que está dentro se torna forma sem perder intensidade. O risco é a queda: quando a expressão se torna imposição (fazendo o outro sentir o que VOCÊ sente, não deixando espaço para a resposta). A maturidade do 3 é saber que expressão é oferta, não imposição.',
        aplicacao: {
          proposito: 'Seu propósito é criar pontes entre dimensões: a interna e a externa, a pessoal e a coletiva.',
          carreira: 'Na carreira, você brilha em comunicação, artes, educação, marketing. Você faz o complexo parecer simples e o simples parecer profundo.',
          relacionamentos: 'No amor, você é romântico de um jeito que outros não conseguem replicar. Seu parceiro se sente visto de um jeito que não sabia que existia.',
          financas: 'Finanças refletem o dom: sua capacidade de se expressar monetiza bem em funções de comunicação, arte e mídia.',
          saude: 'O corpo do 3 em dom é expressivo — bons，笑容, voz clara. A saúde da garganta e da zona do pescoço é central.',
        },
        acaoPratica: {
          amplificar: [
            'Termine algo que você começou — uma música, um texto, um projeto',
            'Exprima uma emoção difícil em forma de arte antes de falar sobre ela',
            'Diga "não sei como dizer isso" em vez de fingir que já sabe',
          ],
          evitar: [
            'Usar sua voz para填补 o silêncio alheio quando não é necessário',
            'Transformar a expressão do outro empiada sobre a sua',
            'Sustentar uma piada quando a sala já parou de rir',
          ],
          ritual:
            'Cante algo esta semana — sozinho ou com outros. Não é para ninguém. É só para ouvir o que sua voz tem a dizer.',
        },
        afirmacao: 'Minha expressão é um presente — ofereço sem exigir que seja aceito.',
      },
      siddhi: {
        tituloPool: 'A Frequência da Mente Divina',
        significado:
          'O 3 em siddhi é a PRESENÇA DE BINA H — a terceira sefirá, donde emanam todas as formas. É a mente criadora antes da forma. Não é mais expressão como esforço — é expressão como respiração.',
        padrao:
          'Em siddhi, o 3 não tenta mais traduzir. A tradução simplesmente acontece. others experience you as a living conduit — what needs to be said emerges through you without effort. The gap between feeling and form has dissolved. This is the frequency of the prophet, the poet, the one whose words change the course of history — not because they are wise, but because they have stopped obstructing.',
        aplicacao: {
          proposito: 'Your purpose is no longer chosen — it flows through you. You are the instrument, not the musician.',
          carreira: 'Work becomes play. Presentation becomes presence.',
          relacionamentos: 'Others feel heard in your presence in ways that bypass language entirely.',
          financas: 'Abundance is recognized as infinitely available — not as a thing to pursue but as a field to allow.',
          saude: 'The body is light, expressive, unburdened by the weight of "how am I being perceived?"',
        },
        afirmacao: 'Eu respiro e o mundo ouve o que precisa.',
      },
    },
  },

  // ── 4: O CONSTRUTOR ─────────────────────────────────────────────────────
  4: {
    arquetipoAkasha: 'O Fundador',
    mandato:
      'Você existe para construir o que os outros apenas imaginam. Sua disciplina não é rigidez — é a frequência que transforma visão em realidade tangível.',
    levels: {
      shadow: {
        tituloPool: 'A Fortaleza que Prende',
        significado:
          'O 4 carrega a energia de CHESED — ordem, misericórdia, estrutura. Em sombra, Chesed se torna a fortaleza: a estrutura vira prisão, a ordem vira controle, a disciplina vira Autocrítica implacável.',
        padrao:
          'Seu padrão em sombra é a CONFUSÃO ENTRE SEGURANÇA E PRISÃO. Você constrói muros tão sólidos que esquece que também se trancou dentro. A infância que gerou isso geralmente teve caos — e você respondeu com uma necessidade de controle que beira o obsessivo. Adulto, você ou não para de trabalhar (compensação) ou desmorona em inação quando o controle escapa (padrão procrastinação-perfeccionismo). O resultado: você trabalha muito, constrói muito, mas nunca se permite HABITAR o que construiu.',
        aplicacao: {
          proposito: 'No propósito, você se cobra por "não estar fazendo o suficiente" mesmo quando já está fazendo demais. O erro é confundir presença com produção.',
          carreira: 'Na carreira, você é o alicerce de times e projetos — mas raramente é reconhecido como tal. Você segura o peso e outros levam o crédito.',
          relacionamentos: 'No amor, você constrói uma relação sólida mas pode ser difícil de alcançar emocionalmente. Parceiros descrevem como "ele é confiável mas eu me sinto sozinha".',
          financas: 'Finanças refletem o padrão: ganho estável mas nenhuma margem para risco. Você prefere 3% garantido que 30% incerto.',
          saude: 'O corpo do 4 em sombra é rígido — ombros curvados para frente, mandíbula cerrada. O corpo se tornou a fortaleza.',
        },
        acaoPratica: {
          amplificar: [
            'Construa algo esta semana que não sirva a nenhum objetivo além de existir — plante uma planta, escreva algo sem propósito',
            'Quando a urge de controlar aparecer, pergunte: isso é medo ou é sabedoria?',
            'Passeie sem destino uma vez esta semana',
          ],
          evitar: [
            'Trabalhar mais quando a ansiedad Appears',
            'Julg a si mesmo por descansar',
            'Esperar para agir até ter "certeza absoluta" — que nunca chega',
          ],
          ritual:
            'Em um dia de folga, não planeje NADA. Anote o que surge quando o dia não tem estrutura imposta.',
        },
        afirmacao: 'Eu construo com propósito e descanso com a mesma dignidade.',
      },
      gift: {
        tituloPool: 'O Dom de Criar Habitat',
        significado:
          'O 4 em dom é a CAPACIDADE DE CRIAR HABITAT. Você não apenas constrói estruturas — você cria lugares onde pessoas querem viver. O dom do 4 é fazer do abstrato um teto, do caos um chão.',
        padrao:
          'Seu dom é a ARQUITETURA DO REAL. Você tem a capacidade rara de traduzir visão em sistema. Onde outros veem o que não existe, você vê a sequência de passos que faz existir. Essa é uma frequência de FUNDADOR — não de sonhador. A diferença é crucial: o sonhador imagina; o fundador constrói. Você não precisa que as circunstâncias sejam perfeitas para agir — você constrói com as circunstâncias que tem.',
        aplicacao: {
          proposito: 'Seu propósito é criar as fundações que outros edificam. Você é o chão sobre o qual outros constroem suas vidas.',
          carreira: 'Na carreira, você brilha em operações, gestão, engenharia, arquitetura. Lugares onde estrutura é a diferença entre sucesso e fracasso.',
          relacionamentos: 'No amor, você é o parceiro que outros descrevem como "lar". Não é paixão — é presença que permite que o outro seja quem é.',
          financas: 'Finanças refletem o dom: você constrói patrimônio de forma consistente e segura. Seus investimentos são boring mas funcionam.',
          saude: 'O corpo do 4 em dom é forte, estável, com boa estrutura óssea. A saúde vem da consistência, não da intensidade.',
        },
        acaoPratica: {
          amplificar: [
            'Dedique tempo a construir algo que vai durar — um sistema, um hábito, um relacionamento',
            'Quando o plano parecer "boring", pergunte: boring funciona?',
            'Celebre o alicerce — não só o topo',
          ],
          evitar: [
            'Desistir de construir quando o projeto não é mais "inspirador"',
            'Confundir construção com controle',
            'Subestimar o valor do que você constrói porque "é só a base"',
          ],
          ritual:
            'Plantee algo. Acompanhe por 30 dias. Perceba a diferença entre construir e assistir.',
        },
        afirmacao:
          'Eu construo com paciência e habito o que construo com gratidão.',
      },
      siddhi: {
        tituloPool: 'A Frequência do Templo Vivo',
        significado:
          'O 4 em siddhi é a PRESENÇA DE CHESED — a第四 sefirá, onde a misericórdia encontra a estrutura. Não é mais construção como esforço — é construção como emanation natural.',
        padrao:
          'Em siddhi, o 4 não constrói mais — o 4 É o que foi construído. A forma e o conteúdo se tornam um. others experience your presence as a built thing — a temple, a home, a place where the sacred becomes tangible. This is the frequency of the master architect whose buildings breathe, of the organizer whose systems serve life, of the one whose life itself is the work of art.',
        aplicacao: {
          proposito: 'Your purpose is to BE the foundation — not to build one.',
          carreira: 'Your work transcends individual achievement and becomes service to life itself.',
          relacionamentos: 'Others feel safe in your presence in a way that bypasses personality.',
          financas: 'Resources flow through you as through a well-built channel — not held, not hoarded, but perfectly directed.',
          saude: 'The body is strong, aligned, and serves as a perfect vessel for the work.',
        },
        afirmacao: 'Eu sou o espaço sagrado onde os outros se encontram.',
      },
    },
  },

  // ── 5: O LIBERTADOR ──────────────────────────────────────────────────────
  5: {
    arquetipoAkasha: 'O Libertador',
    mandato:
      'Você existe para lembrar o mundo de que a liberdade não é ausência de limite — é consciência de que o limite existe mas não define.',
    levels: {
      shadow: {
        tituloPool: 'A Fuga que Prende',
        significado:
          'O 5 carrega a energia de MERCÚRIO — liberdade, mudança, adaptação. Em sombra, Mercúrio se torna o mensageiro ansioso: a mudança vira fuga, a adaptação vira inconsistência, a liberdade vira negação de toda estrutura.',
        padrao:
          'Seu padrão em sombra é a CONFUSÃO ENTRE LIBERDADE E IMPUNIDADE. Você usa "liberdade" para justificar o que é, na verdade,逃避 de compromisso. A origem: provavelmente uma infância onde as regras eram arbitrárias ou sufocantes, e a única saída era fugir mentalmente. Adulto, você começa relacionamentos e projetos com entusiasmo mas os abandona quando a profundidade exige renúncia de outras possibilidades. O resultado: uma vida de começos sem fins, de portas abertas sem nunca atravessar.',
        aplicacao: {
          proposito: 'No propósito, você se nega a "escolher um caminho" porque escolher parece perder liberdade. Mas a indecisão não é liberdade — é prisão do momento.',
          carreira: 'Na carreira, você tem简历 com 47 interesses e nenhuma expertise. Isso não é variety — é o medo de se comprometer com algo que pode não dar certo.',
          relacionamentos: 'No amor, você é romantico mas não Reliability. A pessoa que todos amam mas ninguém consegue contar.',
          financas: 'Finanças refletem o padrão: instabilidade. Você ganha em bursts e gasta com a mesma velocidade. Não há acumulação porque não há permanência.',
          saude: 'O corpo do 5 em sombra é inquieto — dificuldade em permanecer parado, insônia, vícios (álcool, sexo, trabajo, pantallas).',
        },
        acaoPratica: {
          amplificar: [
            'Escolha uma coisa e faça até o fim desta semana — mesmo que outro interesse apareça',
            'Quando a urge de mudar de rumo aparecer, pergunte: isso é crescimento ou fuga?',
            'Pratique ficar 30 minutos fazendo nada — sem tela, sem saída, sem mudança',
          ],
          evitar: [
            'Começar mais um projeto quando o atual exige profundidade',
            'Usar "eu sou assim" como justificativa para inconsistência',
            'Confundir mudança com progresso',
          ],
          ritual:
            'Escolha um compromisso pequeno esta semana e cumpra. Só um. E perceba o que isso faz na sua confiança.',
        },
        afirmacao: 'Eu escolho com coragem e permaneço com a mesma coragem que escolhi.',
      },
      gift: {
        tituloPool: 'O Dom de Transformar Limite em Porte',
        significado:
          'O 5 em dom é a CAPACIDADE DE REENCARNAR. Você não apenas aceita mudanças — você as abraça como o mecanismo pelo qual a vida se renova. O dom do 5 é transformar estrutura em liberdade e liberdade em estrutura, alternadamente.',
        padrao:
          'Seu dom é a VERsatilidade QUE MANTÉM. Você consegue mudar de direção mantendo o centro — e isso é raro. A maioria que muda perde o centro; o centro que se mantém não muda. Você faz as duas coisas: age como catalisador de transformação sem perder a si mesmo no processo. Isso é ADAPTABILIDADE COM IDENTIDADE — uma frequência de líder, não de seguidor.',
        aplicacao: {
          proposito: 'Seu propósito é ser o catalisador de transições — não em uma área, mas na consciência de que mudança é possível.',
          carreira: 'Na carreira, você brilha em funções de mudança: consultoría, inovação,ターンアラウンド,创业. Você é o chamariz que chega quando tudo está estagnado.',
          relacionamentos: 'No amor, você traz freshness constante. Parceiros descrevem você como "a pessoa que nunca deixa a relação ficar velha".',
          financas: 'Finanças refletem o dom: você ganha em momentos de transição e sabe entrar e sair de oportunidades.',
          saude: 'O corpo do 5 em dom é flexível, adaptável, com boa saúde geral. A chave é encontrar atividades que equilibram mudança e enraizamento.',
        },
        acaoPratica: {
          amplificar: [
            'Proponha uma mudança estruturada esta semana — não fuga, mas evolução',
            'Quando algo não está funcionando, pergunte: o que precisa mudar aqui?',
            'Pratique dizer "sim, e..." em vez de "mas"',
          ],
          evitar: [
            'Mudar por mudar — sem direção, sem discernimento',
            'Confundir flexibilidade com falta de posição',
            'Usar mudança como way de evitar a dor da profundidade',
          ],
          ritual:
            'Faça uma mudança física pequena: reorganize um canto da casa, mude uma rotina. Sinta a diferença entre mudança que liberta e mudança que distrai.',
        },
        afirmacao:
          'Eu abraço a mudança como o processo pelo qual a vida se renova — e escolho com consciência quando e como mudar.',
      },
      siddhi: {
        tituloPool: 'A Frequência do Eterno Retorno',
        significado:
          'O 5 em siddhi é a PRESENÇA DE GEVURAH — a sefirá da Discernimento, donde a liberdade verdadeira emerge. Não é mudança como fuga — é mudança como expressão da eternidade.',
        padrao:
          'Em siddhi, o 5 não muda mais. O 5 É a mudança. The paradox resolves: you are so deeply rooted in change itself that stability and flux become the same thing. Others experience you as a living reminder that form and formlessness are not opposites — that liberation is not the absence of structure but the presence of consciousness within it.',
        aplicacao: {
          proposito: 'Your purpose is to embody the truth that change and permanence are the same energy.',
          carreira: 'You become the change that others want to follow.',
          relacionamentos: 'In love, you are the one who shows others that true intimacy requires no possession.',
          financas: 'Resources flow through you perfectly — gained and released with equal grace.',
          saude: 'The body is unburdened by the fear of change — and therefore resilient beyond the norm.',
        },
        afirmacao: 'Eu sou a mudança — e a certeza no centro da incerteza.',
      },
    },
  },

  // ── 6: O HARMONIZADOR ────────────────────────────────────────────────────
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

  // ── 7: O INVESTIGADOR ─────────────────────────────────────────────────────
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
            'Pesquisar mais quando a decisión precisa ser tomada',
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
            'Pratique a escuta: quando alguém fala, escute mais do que a palavras — escute o que está por baixo',
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

  // ── 8: O MANIFESTADOR ────────────────────────────────────────────────────
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

  // ── 9: O SERVO ───────────────────────────────────────────────────────────
  9: {
    arquetipoAkasha: 'O Servidor',
    mandato:
      'Você existe para lembrar o mundo de que a compaixão não é弱者 — é a frequência mais alta que existe, quando não se confunde com compaixão.',
    levels: {
      shadow: {
        tituloPool: 'A Generosidade que Dói',
        significado:
          'O 9 carrega a energia de MARTE — compaixão, completude, sabedoria. Em sombra, Marte se torna a викария: a compaixão vira co-dependência, a completude vira repressão, a sabedoria vira cinismo.',
        padrao:
          'Seu padrão em sombra é a DISSOLUÇÃO DE SI. Você dá tanto que se dissolve — e depois se ressente de não ser visto, sem perceber que você mesmo se apagou. A origem: provavelmente uma infância onde o amor era dado em troca de apagamento — onde ser "bom" significava não tomar espaço. Adulto, você é o que dá e dá e dá, e por dentro sente um vazio que nenhum reconhecimento preenche. A armadilha: quanto mais você dá, mais vazio; quanto mais vazio, mais você dá para preencher.',
        aplicacao: {
          proposito: 'No propósito, você serve a causas mas não se permite ser servido. A compaixão se tornou uma forma de não precisar enfrentar a própria dor.',
          relacionamentos: 'No amor, você é o que dá tudo — e depois se queixa de não receber. Mas nunca pediu. O padrão é: se eu der o suficiente, o outro vai perceber o que eu preciso.',
          financas: 'Finanças reflete o padrão: você gasta nos outros e se nega. Ou: você ganha para os outros e esqueceu de si.',
          saude: 'O corpo do 9 em sombra é agotado cronicamente. A área do coração e do sistema imunológico é frequentemente afectada.',
        },
        acaoPratica: {
          amplificar: [
            'Peça ajuda esta semana — uma coisa real que você precisa',
            'Antes de dar, pergunte: estou dando porque escolho ou porque não sei pedir?',
            'Observe se o que você dá é genuinamente oferecido ou se é troca disfarçada',
          ],
          evitar: [
            'Usar serviço como way de evitar a própria vida',
            'Confundir "ser útil" com "merecer existir"',
            'Dissolver-se para manter a conexão',
          ],
          ritual:
            'Escreva o que você precisa — não o que os outros precisam de você. Feito isso, escolha uma coisa e peça.',
        },
        afirmacao: 'Eu sou digno de compaixão tanto quanto a dou — e meu valor não se mede em quanto eu entrego.',
      },
      gift: {
        tituloPool: 'O Dom de Ver a Dor e Responde',
        significado:
          'O 9 em dom é a CAPACIDADE DE SENTIR A TOTALIDADE. Você carrega a sensibilidade de quem vê o que others overlook — e tem a força de responder sem se perder. O dom do 9 é a COMPAIXÃO COM FRONTEIRAS.',
        padrao:
          'Seu dom é a SABEDORIA DA COMPREENSÃO. Você entende o sofrimento não como fracasso, mas como parte do caminho. Isso permite que você esteja com o outro na dor sem ser consumido por ela — e sem minimizar o que o outro sente. A diferença crucial: você não sente POR o outro; você sente COM o outro. E isso libera você para действительно ajudar em vez de se tornar outra vítima.',
        aplicacao: {
          proposito: 'Seu propósito é ser o espaço onde o sofrimento se transforma em compreensão — e a compreensão em ação.',
          carreira: 'Na carreira, você brilha em profissões de serviço profundo: medicina, trabalho social, counseling, ativismo. Você é o que faz o trabalho que ninguém quer fazer.',
          relacionamentos: 'No amor, você traz profundidade emocional que transforma a relação. Você não foge da dificuldade — você a accompany.',
          financas: 'Finanças refletem o dom: quando você ganha para servir, o dinheiro flui porque o propósito é claro.',
          saude: 'O corpo do 9 em dom é sensível mas não agotado — você sente muito mas não se perde.',
        },
        acaoPratica: {
          amplificar: [
            'Dedique tempo a uma causa que você acredita — não por obrigação, mas por escolha',
            'Quando a compaixão aparecer, pergunte: isso está me consumindo ou me energizando?',
            'Pratique pedir — você não é um saco sem fundo',
          ],
          evitar: [
            'Confundir "sentir com" com "sentir por"',
            'Usar serviço para evitar a própria dor',
            'Confundir auto-negação com nobreza',
          ],
          ritual:
            'Escolha uma forma de servir esta semana que também nutre você — não uma que esgota.',
        },
        afirmacao: 'Eu carrego compaixão com força — e honro meus limites como parte da minha capacidade de servir.',
      },
      siddhi: {
        tituloPool: 'A Frequência da Compaixão Divina',
        significado:
          'O 9 em siddhi é a PRESENÇA DE YESOD — a fundação do mundo emocional, donde a compaixão se torna incondicional. Não é mais serviço como esforço — é serviço como natureza.',
        padrao:
          'Em siddhi, o 9 não serve mais. O 9 É o serviço. The separation between the server and the served dissolves. You become the compassion itself — not the one who gives compassion, but the one who IS it. This is the frequency of the awakened being who has realized that service to others IS self-realization, and self-realization IS service to others. There is no longer a self to save and others to serve — only life flowing through a particular form.',
        aplicacao: {
          proposito: 'Your purpose is indistinguishable from your being — you are the service.',
          carreira: 'Work becomes worship. Every action is an act of love.',
          relacionamentos: 'In love, you are the one who loves without any trace of attachment or expectation.',
          financas: 'Resources flow through you perfectly because there is no longer a self that holds or releases.',
          saude: 'The body is luminous, unburdened, and serves as a perfect vehicle for compassion.',
        },
        afirmacao: 'Eu sou a compaixão — e ela flui através de mim sem que eu precise segurá-la.',
      },
    },
  },

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
          proposito: 'No propósito, você tem uma visão tão clara que se cobra por não estar lá ainda. A tensão entre o que é e o que vê te impede de atuar.',
          carreira: 'Na carreira, você ou está em algo que não "merece" sua visão (e se frustra) ou não encontra o lugar certo (e se frustra de outro jeito).',
          relacionamentos: 'No amor, você vê o potencial do parceiro — e depois se cobra quando ele não se torna essa versão. Você ama o que o outro PODE ser, não o que é.',
          sexualidade: 'Na sexualidade, você pode projetar fantasies ideais e se decepcionar com a realidade. Intimidade se confunde com ilusão.',
          saude: 'O corpo do 11 em sombra é agotado, ansioso, com sistema nervoso sobrecarregado pela percepção constante.',
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
        afirmacao: 'Eu honro minha visão e sei que ela se manifesta um passo de cada vez — começando por hoje.',
      },
      gift: {
        tituloPool: 'O Dom de Traduzir o Invisível',
        significado:
          'O 11 em dom é a CAPACIDADE DE SER A PONTE ENTRE O INVISÍVEL E O VISÍVEL. Você não é apenas visionário — você é o canal pelo qual a visão se torna realidade. O dom do 11 é a INTUIÇÃO APLICADA.',
        padrao:
          'Seu dom é a CLAREZA QUE INSPIRA. Você vê o que outros não veem E tem a capacidade de traduzir isso em linguagem que ressoa. Não é teoria — é intuição em ação. A diferença entre o 11 em dom e o 11 em sombra é simples: o dom pousa a visão em ação, o sombra漂浮 sem nunca pousar. O 11 em dom não precisa que o mundo valide a visão antes de agir — mas também não ignora o feedback do mundo.',
        aplicacao: {
          proposito: 'Seu propósito é ser o catalisador de mudanças que ainda não têm nome — o que o mundo ainda não sabe que precisa.',
          carreira: 'Na carreira, você brilha em funções de inovação, fundação, visión. Você é o que concebe o que ninguém pediu e depois o mundo não consegue mais viver sem.',
          relacionamentos: 'No amor, você traz profundidade visionária. Parceiros descrevem você como "a pessoa que me fez ver quem eu poderia ser".',
          espiritualidade: 'Na espiritualidade, você é o que traduz o que não pode ser dito — e essa tradução muda a forma como outros se relacionam com o invisível.',
          saude: 'O corpo do 11 em dom é sensível mas energizado — você sente muito mas a energia não se transforma em ansiedade.',
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
          proposito: 'Your purpose is to BE the vision — not to have it, not to share it, but to be it.',
          carreira: 'Your work becomes revelation made form.',
          relacionamentos: 'In love, you are the mirror that shows others their own highest vision of themselves.',
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
          proposito: 'No propósito, você tem a capacidade mas não a coragem — a gap entre visão e ação é o seu maior inimigo.',
          carreira: 'Na carreira, você ou está em algo pequeno (e se frustra) ou não está em nada (porque nada é grand o suficiente).',
          financas: 'Finanças reflete o padrão: oportunidades são recusadas porque "não são grand o suficiente" — e o seguro é acumulado.',
          relacionamentos: 'No amor, você pode ter um padrão ideal que ninguém alcana — e acaba sozinho esperando a pessoa perfeita.',
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
        afirmacao: 'Eu construo com excelência e sei que "pronto" é um ponto no caminho, não o fim.',
      },
      gift: {
        tituloPool: 'O Dom de Construir em Grande Escala',
        significado:
          'O 22 em dom é a CAPACIDADE DE CONSTRUIR O IMPOSSÍVEL. Você não escolhe entre sonhar grande e agir pequeno — você faz as duas coisas simultaneamente. O dom do 22 é a VISÃO ESTRATÉGICA.',
        padrao:
          'Seu dom é a ARQUITETURA DO LEGADO. Você consegue olhar para um caos e ver a estrutura que ele pode virar — e depois construir essa estrutura. Isso é raro: a maioria das pessoas ou é estratégica ou é visionária. O 22 em dom é as duas coisas. A diferença é que o 22 em dom sabe que o legado não é o building — é o que as pessoas Fazem com ele depois.',
        aplicacao: {
          proposito: 'Seu propósito é construir estruturas que duram — não monuments a você, mas fundações para outros.',
          carreira: 'Na carreira, você é o fundador, o arquiteto, o estrategista. Você olha para o sistema e vê como ele pode ser 10x melhor.',
          financas: 'Finanças refletem o dom: o 22 em dom constrói riqueza em escala porque não se limita ao que é seguro.',
          relacionamentos: 'No amor, você é o parceiro que constrói uma vida — não um relacionamento, mas uma VIDA compartilhada.',
          saude: 'O corpo do 22 em dom é fuerte e resistente — a estrutura física reflete a capacidade de construir.',
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
          proposito: 'Your purpose is to BE the constructed form through which life expresses its greatness.',
          carreira: 'Your work becomes a living architecture that serves generations.',
          financas: 'Wealth flows through you as through a perfectly designed system.',
          relacionamentos: 'In love, you build with — not for — your partner. The relationship itself is the construction.',
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
          proposito: 'No propósito, o 33 em sombra se perde: ou vira guru sem chão ou vira assistente sem fim. Em ambos, o EU se dissolve.',
          carreira: 'Na carreira, você ou está em uma função de serviço (e se frustra de não ser reconhecido) ou não consegue escolher carreira (porque todas parecem "egoístas demais").',
          relacionamentos: 'No amor, você é o que dá tudo — e se ressente de quem recebe sem oferecer o mesmo. Mas nunca pediu.',
          saude: 'O corpo do 33 em sombra é agotado cronicamente, com padrão de burnout recorrente.',
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
          proposito: 'Seu propósito é ser o catalisador de transformação — não o agente, mas o catalisador. others change by your presence, not by your instruction.',
          carreira: 'Na carreira, você brilha em ensino, mentoria, liderança espiritual. Sua presença no ambiente muda a dinâmica de todos.',
          espiritualidade: 'Na espiritualidade, você é o mestre que não precisa ser seguido — porque seguindo a própria vida, você já ensina.',
          relacionamentos: 'No amor, você traz uma frequência de elevação — parceiros se tornam mais de si mesmos na sua presença.',
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
        afirmacao: 'Eu ensino com minha presença e honro o direito dos outros de aprender à sua maneira.',
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
          relacionamentos: 'In love, you are the one whose presence allows others to remember who they truly are.',
          saude: 'The body becomes light — luminous, unburdened, serving as a perfect conduit for the highest frequency.',
        },
        afirmacao: 'Eu sou o amor — e ele flui através de mim sem que eu precise fazer nada além de estar presente.',
      },
    },
  },
};

// ─── Funções Públicas ──────────────────────────────────────────────────────

/**
 * Gera a interpretação profunda de um Número de Vida.
 *
 * @param numero - número de vida (1-9, 11, 22, 33)
 * @returns VidaInterpretation completa com 3 níveis (shadow/gift/siddhi)
 *          para cada uma das 9 áreas da vida.
 *
 * PILOTO: esta função é a primeira implementação do motor de interpretação
 * Akasha. Estende a shallow "descrição de número" para o modelo de 4 camadas:
 *   dado → significado → padrão → aplicação
 *
 * Os níveis shadow/gift/siddhi seguem o modelo Gene Keys adaptado para Akasha.
 */
export function interpretarVida(numero: number): VidaInterpretation {
  // Normalizar master numbers
  const n = numero;
  const isMaster = MASTER_NUMBERS.has(n);

  // Fallback para números fora do intervalo coberto
  if (!VIDA_CONTENT[n]) {
    return {
      numero: n,
      isMaster: false,
      levels: {
        shadow: buildFallback(n, 'shadow'),
        gift: buildFallback(n, 'gift'),
        siddhi: buildFallback(n, 'siddhi'),
      },
      mandato: `Seu Número de Vida é ${n}. Este número carrega uma energia única que convida você a descobrir seu significado através da experiência.`,
      arquetipoAkasha: `Número ${n}`,
    };
  }

  const content = VIDA_CONTENT[n];
  return {
    numero: n,
    isMaster,
    levels: {
      shadow: buildInterpretation(n, isMaster, content, 'shadow'),
      gift: buildInterpretation(n, isMaster, content, 'gift'),
      siddhi: buildInterpretation(n, isMaster, content, 'siddhi'),
    },
    mandato: content.mandato,
    arquetipoAkasha: content.arquetipoAkasha,
  };
}

/**
 * Gera a interpretação para uma área de vida específica de um Número de Vida.
 * Útil para mostrar apenas uma área (ex: "como este número afeta meus relacionamentos?").
 *
 * @param numero - número de vida
 * @param area - área de vida desejada
 * @param nivel - nível de profundidade (shadow | gift | siddhi)
 */
export function interpretarVidaArea(
  numero: number,
  area: LifeArea,
  nivel: AkashaLevel = 'gift',
): AreaInterpretation | null {
  const vida = interpretarVida(numero);
  const interp = vida.levels[nivel];
  if (!interp) return null;

  // Se a área existe na aplicação, usar
  if (interp.aplicacao[area]) {
    return interp;
  }
  return interp;
}
