/**
 * synthesis-engine/odu-narrative-engine.ts — F-226 split
 *
 * Odu narrative builder — all 16 Odu × 6 life-area narratives + fallback.
 * Self-contained; imported by narrative-generator.ts via re-export.
 */
import type { OduBirth } from '@akasha/types';

/**
 * Deep ODU narratives: all 16 Odu per-area content.
 * Each entry maps to one of 6 life areas.
 */
const ODU_AREA_NARRATIVES: Record<string, Record<string, string>> = {
  // ── OGUN / FERRO ────────────────────────────────────────────────────────
  Ogbe: {
    vitalidadeEnergia:
      'Ogbe é o Odu da criação primordial — o sopro que tudo inicia. Seu corpo com Ogbe sente antes de pensar: a intuição é o seu GPS. Vitalidade oscila em ciclos — você tem picos de energia seguidos de vazio. A armadilha: forçar o vazio a ser cheio. Prática: ao acordar, permaneça 5 min em silêncio antes de agir.',
    conexoesAmor:
      'Ogbe no amor traz intensidade criativa — você inicia, transforma, reinicia. Seu corpo atrai quem também tem capacidade de mudança. A crise surge quando o parceiro não acompanha seu ritmo. Não force a transformação alheia. A lição: você atrai pela sua presença, não pela sua insistência.',
    carreiraProsperidade:
      'Ogbe na carreira é o Odu do pioneiro. Você vê o que não existe ainda e cria o caminho andando. Mas Ogbe sem fundamento vira exaustão: você começa 10 coisas e termina nenhuma. Prática: defina 1 projeto por vez. A prosperidade vem quando você termina, não quando você inicia.',
    oriCabecaQuizilas:
      'Ogbe na mente traz percepção aguda — você vê o padrão por trás do comportamento. Mas Ogbe também traz agitação mental: pensamentos que começam e não param. A prática: escreva os pensamentos antes de agir sobre eles. Isso ancora a percepção sem dispersar.',
    missaoDestino:
      'Ogbe é Odu de iniciação. Você veio para criar o que não existia — ideias, projetos, caminhos. A sua missão não é continuar o que outros fizeram, é abrir trilhas novas. O medo de começar é a sombra; a coragem de iniciar é o dom.',
    desafiosSombras:
      'Ogbe nos desafios manifesta-se como pressa de agir. Você quer resolver agora. A sabedoria de Ogbe: nem tudo precisa ser iniciado hoje. Pergunte-se: isto é urgência real ou ansiedade disfarçada?',
  },

  // ── OYEKU / RUÍNA ──────────────────────────────────────────────────────
  Oyeku: {
    vitalidadeEnergia:
      'Oyeku é Odu da transformação interior — o fuego queima para dentro. Você não irradia; você processa. Seu corpo pede stillness para digerir o que sente. Forçar expressão quando o corpo pede silêncio é a armadilha. Confie no ciclo: descida é parte do processo, não falha.',
    conexoesAmor:
      'Oyeku no amor é profundo e exigente. Você não quer superficialidade — precisa de intimidade que transforme. A quantidade de parceiros importa menos que a profundidade de cada encontro. A armadilha: exigir do outro o que você não se permite.',
    carreiraProsperidade:
      'Oyeku na carreira atrai recursos por meio de transformação — você limpa o terreno antes de construir. Mas o tempo entre "limpar" e "construir" pode ser longo demais. Defina prazos. A prosperidade de Oyeku vem quando você aceita que a transformação já aconteceu.',
    oriCabecaQuizilas:
      'Oyeku na mente opera pela introspecção. Você pensa melhor em silêncio, sozinho. O risco: isolar-se da realidade concreta. Dados, números, fatos são seu antídoto. Não confie só no feeling.',
    missaoDestino:
      'Oyeku é Odu de destruição criativa — você dissolve o que não funciona para que o novo possa nascer. Sua missão não é manter, é limpar. Mas limpar não é fim: é preparação. Aceite o vazio como parte do caminho.',
    desafiosSombras:
      'Oyeku nos desafios tende a autodestruição sutil — abandono, neglect, sabotagem. Você pode estar sabotando a si mesmo sem perceber. Pergunte: o que estou tentando destruir que ainda serve?',
  },

  // ── IWORI / ÁGUAS PRIMORDIAIS ──────────────────────────────────────────
  Iwori: {
    vitalidadeEnergia:
      'Iwori é Odu da percepção profunda. Você sente o que outros só imaginam. Seu corpo é receptor de alta sensibilidade — ambientes, pessoas, energias. A armadilha: carregar o que não é seu. Prática: ao entrar em espaço, tome 3 respirações e defina: "isto é meu ou do ambiente?"',
    conexoesAmor:
      'Iwori no amor é intenso e profundo. Você ama com o corpo inteiro, não só com o coração. A percepção aguçada permite saber coisas sobre o parceiro antes de serem ditas. O risco: usar a percepção para controlar em vez de compreender.',
    carreiraProsperidade:
      'Iwori na carreira traz clareza de visão — você vê o que está por trás dos números, das estratégias, dos relatórios. Use isso para tomar decisões que outros não conseguem ver. A prosperidade vem quando você confia na sua leitura do todo.',
    oriCabecaQuizilas:
      'Iwori na mente é investigativa e profunda. Você vai na raiz das coisas. Mas a profundidade pode virar obsessão: você investiga demais sem agir. A prática: ao investigar, defina um tempo. Depois do tempo, aja com o que descobriu.',
    missaoDestino:
      'Iwori é Odu da sabedoria oculta. Você veio para descobrir verdades escondidas — suas e dos outros. Sua missão não é guardar segredo, é revelar o que precisa ser revelado, no tempo certo.',
    desafiosSombras:
      'Iwori nos desafios revela paranoia — você vê ameaças onde não há. A percepção aguçada mal direcionada vira conspiração. Pergunte: estou vendo realidade ou criando cenário?',
  },

  // ── ODI / ESPELHO ──────────────────────────────────────────────────────
  Odi: {
    vitalidadeEnergia:
      'Odi é Odu do ventre e do mistério da criação. Você sente no corpo antes de entender pela mente. Intuição ginecológica: você sabe quando algo está certo ou errado antes de ter palavras para isso. A armadilha: esperar demais do corpo sem dar input concreto.',
    conexoesAmor:
      'Odi no amor opera como espelho — você reflete e amplifica a energia do outro. Se o parceiro está bem, você brilha. Se está em crise, você absorve. A prática: antes de entrar em relação, verifique: estou eu ou estou espelhando?',
    carreiraProsperidade:
      'Odi na carreira traz capacidade de gerar recursos de forma invisível — você atrai sem precisar perseguir. Mas essa energia pode ser mal direcionada se você não sabe o que quer. Defina: o que eu quero construir? Sem resposta clara, Odi atrai dispersão.',
    oriCabecaQuizilas:
      'Odi na mente opera pelo mistério — você sabe sem saber como sabe. O risco: usar o não saber como desculpa para não agir. Mas Odi também ensina: nem tudo precisa ser compreendido para ser verdadeiro. Aceite que a sabedoria do corpo é válida.',
    missaoDestino:
      'Odi é Odu da gestação — você carrega algo que ainda não nasceu. A missão não é revelada antes da hora. Aceite o mistério como parte do caminho. Não force a revelação.',
    desafiosSombras:
      'Odi nos desafios manifesta-se como ilusão — você pode acreditar em narrativas sobre si que não são suas. Verifique: isto que acredito sobre mim é verdade ou é espelho de algo que absorvi de outro?',
  },

  // ── IROSUN / TROVÃO ────────────────────────────────────────────────────
  Irosun: {
    vitalidadeEnergia:
      'Irosun é Odu da fartura e da alegria incarnada. Seu corpo irradia energia quando está em fluxo — você precisa de movimento, celebração, expressão. Sequestrar Irosun gera tensão física que se manifesta como inquietação. Prática: dance diariamente, mesmo que só 5 minutos.',
    conexoesAmor:
      'Irosun no amor traz sensualidade e charme natural. Você atrai pelo brilho, não pela profundidade — pelo menos no início. O risco: superficialidade que vira hábito. A profundidade vem quando você permite vulnerabilidade.',
    carreiraProsperidade:
      'Irosun na carreira é Odu de expansão — você atrai oportunidades e pessoas. Mas sem foco, a fartura se dispersa. Defina 1 prioridade clara. A abundância de Irosun flui quando há direção.',
    oriCabecaQuizilas:
      'Irosun na mente é rápido e associativo — você conecta ideias em velocidade. O risco: superficialidade por velocidade. A prática: ao ter um insight, escreva-o. Não deixe que o próximo pensamento leve o anterior.',
    missaoDestino:
      'Irosun é Odu da alegria incarnada. Você veio para mostrar que espiritualidade pode ser leve, que sagrada não precisa ser triste. Sua missão é ser a prova viva de que serviço e alegria coexistem.',
    desafiosSombras:
      'Irosun nos desafios manifesta-se como dispersão — você quer tudo, faz tudo, e no final não tem nada. A armadilha: confundir movimento com progresso. Pergunte: isto me aproxima do que importa ou só me mantém ocupado?',
  },

  // ── OWONRIN / ARCO-ÍRIS / CAOS ────────────────────────────────────────
  Owonrin: {
    vitalidadeEnergia:
      'Owonrin é Odu do caos criativo — mudanças rápidas e inesperadas. Seu corpo funciona melhor quando há variação: rotina é inimiga. Você precisa de novidade para não entrar em estagnação. Mas caos sem âncora é só confusão. Encontre seu centro antes de buscar a mudança.',
    conexoesAmor:
      'Owonrin no amor traz intensidade emocional e imprevisibilidade. Você sente profundamente e reage intensamente. A armadilha: dramatizar. A prática: quando sentir a reação intensificar, respire fundo antes de agir. Nem toda emoção precisa ser expressada imediatamente.',
    carreiraProsperidade:
      'Owonrin na carreira é Odu de mudança de rumo — você atrai reviravoltas. Isso pode ser dom ou destruição, dependendo de como você integra. A prática: após cada mudança, escreva o que aprendeu antes de agir. Isso transforma caos em sabedoria.',
    oriCabecaQuizilas:
      'Owonrin na mente opera por insight súbito — você sabe de repente o que antes não sabia. O risco: acreditar que todo insight é verdade. Alguns insights são reais; outros são ruído. Verifique com os fatos antes de decidir.',
    missaoDestino:
      'Owonrin é Odu da reinvenção. Você veio para atravessar transições que assustam outros. Sua missão é mostrar que mudança não é perda — é portal. Mas só atravessa se você não estiver se agarrando ao que precisa ser solto.',
    desafiosSombras:
      'Owonrin nos desafios revela-se como instabilidade — você muda de direção constantemente sem nunca estabelecer base. A armadilha: usar "mudança" como fuga de compromisso. Defina um terreno que não muda, mesmo quando tudo ao redor muda.',
  },

  // ── OBARÁ / CORDA / ABUNDÂNCIA ───────────────────────────────────────
  Obara: {
    vitalidadeEnergia:
      'Obara é Odu da realeza e da Lei Sagrada incarnada. Seu corpo funciona melhor quando há estrutura e propósito claro. Você precisa sentir que o que faz tem significado. Sem propósito, o corpo entra em letargia. Prática: toda manhã, nomeie 1 coisa que você vai fazer que importa.',
    conexoesAmor:
      'Obara no amor traz fidelidade e profundidade. Você ama com comprometimento — o corpo, a mente e o espírito. A armadilha: confundir dever com amor. Você pode estar cumprindo papel de parceiro sem sentir a conexão real. Pergunte: estou amando ou só cumprindo?',
    carreiraProsperidade:
      'Obara na carreira é Odu de liderança com responsabilidade. Você não lidera para dominar — lidera para proteger e fazer crescer. Mas se você não estiver no comando, pode sentir-se deslocado. A prosperidade de Obara vem quando você lidera sem controlar.',
    oriCabecaQuizilas:
      'Obara na mente opera pela lei — você tem senso agudo de certo e errado, justo e injusto. O risco: rigidez moral. A prática: antes de julgar, pergunte: isto é regra minha ou regra universal? Às vezes sua intuição de justo/injusto é cultural, não cósmica.',
    missaoDestino:
      'Obara é Odu da liderança sagrada. Você veio para liderar com integridade — ser a prova de que poder e bondade coexistem. A sua missão não é ter razão, é fazer o bem. Quando essas duas coisas divergem, escolha o bem.',
    desafiosSombras:
      'Obara nos desafios revela orgulho disfarçado de dignidade. Você pode estar mais preocupado com a própria imagem de justo do que com a justiça real. Pergunte: estou fazendo o certo ou só parecendo que sim?',
  },

  // ── OKANRAN / CONFLITO ────────────────────────────────────────────────
  Okanran: {
    vitalidadeEnergia:
      'Okanran é Odu do conflito e da resolução. Seu corpo reage fortemente a tensão — você sente quando algo não está certo. Essa é sua antena, não seu inimigo. Use a tensão para investigar, não para atacar. A prática: quando sentir tensão, pergunte "o que está fora de lugar?" antes de reagir.',
    conexoesAmor:
      'Okanran no amor traz intensidade e drama. Você sente profundamente e tende a expressar o conflito antes de processá-lo. A armadilha: transformar divergência em guerra. A prática: antes de confrontar, escreva o que você quer dizer. Isso transforma reação em comunicação.',
    carreiraProsperidade:
      'Okanran na carreira atrai situações de crise — você é chamado quando algo precisa ser resolvido. Esse é seu dom, não sua maldição. Mas se você só resolve crises e nunca cria, fica refém do caos alheio. A prática: aparte tempo para criar, não só reagir.',
    oriCabecaQuizilas:
      'Okanran na mente opera por contraste — você entende as coisas vendo o oposto. O risco: ver só conflito onde há nuance. A prática: ao avaliar uma situação, liste 3 coisas que estão funcionando além das 3 que não estão. Equilibre o diagnóstico.',
    missaoDestino:
      'Okanran é Odu do conflito necessário. Você veio para enfrentar o que outros evitam — e resolver. Sua missão não é criar paz artificial, é resolver o que precisa ser resolvido para que a paz possa existir. Mas às vezes a resolução pede sacrifício seu. Esteja pronto.',
    desafiosSombras:
      'Okanran nos desafios manifesta-se como ressentimento — você guarda o que foi feito contra você. A armadilha: deixar o passado governar o presente. A prática: diariamente, escreva 1 coisa do passado que você escolhe liberar. Não por perdão — por liberdade.',
  },

  // ── OGUNDÁ / PORTA / MUDANÇA ───────────────────────────────────────────
  Ogunda: {
    vitalidadeEnergia:
      'Ogunda é Odu do guerreiro trabalhador. Seu corpo é instrumento de ação — você precisa usar os músculos, caminhar, construir. Sedentarismo drena sua energia mais rápido que em qualquer outro Odu. Prática: mova o corpo antes de tomar decisões. Caminhada, não academia — movimento com direção.',
    conexoesAmor:
      'Ogunda no amor traz intensidade emocional e imprevisibilidade. Você sente profundamente e tende a expressar o conflito antes de processá-lo. A armadilha: dramatizar. A prática: quando sentir a reação intensificar, respire fundo antes de agir. Nem toda emoção precisa ser expressada imediatamente.',
    carreiraProsperidade:
      'Ogunda na carreira é Odu de conquista material. Você obtém o que persegue com trabalho constante. A teimosia é sua aliada quando o objetivo é certo, inimiga quando é errado. Verifique: o que estou perseguindo serve à vida que quero ou só serve ao meu orgulho?',
    oriCabecaQuizilas:
      'Ogunda na mente opera pela abertura — você é a porta por onde passam ideias e energias. O risco: absorver demais sem filtrar. A prática: ao receber informação nova, pergunte "isto é meu ou é de quem me falou?" before deciding.',
    missaoDestino:
      'Ogunda é Odu de abertura de caminhos. Você veio para abrir portas que estavam fechadas — não para você, mas para outros entrarem também. A missão é criar passagem. O que você abre hoje é o caminho de quem vem depois.',
    desafiosSombras:
      'Ogunda nos desafios revela teimosia — você insiste no que não funciona porque parar é admitir erro. A sabedoria: insistir no que não funciona não é coragem, é ego. Mude de direção antes que o custo seja seu.',
  },

  // ── OSA / CAÇA / ABUNDÂNCIA ───────────────────────────────────────────
  Osa: {
    vitalidadeEnergia:
      'Osa é Odu da fartura e da caça criativa. Seu corpo precisa de variedade — você fica entediado com rotina. A energia flui quando há objetivo claro, mas diversificado. Prática: tenha 3 projetos simultâneos — 1 que sustenta (dinheiro), 1 que nutre (criativo), 1 que expande (aprendizado).',
    conexoesAmor:
      'Osa no amor traz sensualidade e apetite por novidade. Você é atraído pela diversidade, não pela monotonia. A armadilha: confundir excitação com amor. A prática: observe se o que sente pelo parceiro é presença ou só ausência prolongada. Paixão sem presença é só dependência química.',
    carreiraProsperidade:
      'Osa na carreira atrai abundância por meio de múltiplas fontes — você não confia em uma só. Isso é sábio, mas pode dispersar. A prática: enquanto explora novas fontes, termine pelo menos 1 coisa que começou. O que não termina não vira prosperidade real.',
    oriCabecaQuizilas:
      'Osa na mente opera por múltiplas ideias simultâneas — você conecta campos distintos. O risco: dispersão. A prática: ao ter uma ideia nova, anote e continue com a anterior. Dez ideias escritas valem mais que uma executada e nove esquecidas.',
    missaoDestino:
      'Osa é Odu da abundância plural. Você veio para mostrar que prosperidade não é só dinheiro — inclui saúde, relações, conhecimento, experiência. Sua missão é viver a abundância em todas as suas formas, não só na que o mundo reconhece.',
    desafiosSombras:
      'Osa nos desafios manifesta-se como gula — você quer mais, sempre mais, sem chegar a lugar nenhum. A armadilha: confundir acumulação com plenitude. Pergunte: quanto é suficiente? Se não sabe, você está correndo sem destino.',
  },

  // ── IKA / MISTÉRIO ────────────────────────────────────────────────────
  Ika: {
    vitalidadeEnergia:
      'Ika é Odu do mistério e da transformação invisível. Você funciona melhor quando ninguém está olhando — o trabalho silencioso é seu dom. Seu corpo pede privacidade para processar. A armadilha: só funcionar quando invisível e não conseguir atuar na frente dos outros.',
    conexoesAmor:
      'Ika no amor traz profundidade que não se expressa facilmente. Você ama em silêncio — com gestos, não com palavras. A armadilha: esperar que o outro leia suas intenções sem você falar. Diga o que você sente. A profundidade que você carrega precisa de palavras para ser recebida.',
    carreiraProsperidade:
      'Ika na carreira é Odu de insight — você vê o que não é óbvio. Use isso para criar soluções onde outros veem problemas. A prosperidade de Ika vem quando você traduz seu insight privado em valor público. O que você sabe sozinho não sustenta — o que você compartilha transforma.',
    oriCabecaQuizilas:
      'Ika na mente opera por intuição profunda — você sabe coisas que não consegue explicar. O risco: confiar demais na intuição sem verificação. A prática: quando tiver um insight, teste-o com dados antes de decidir. Intuição mais fato é sabedoria; intuição sem fato é aposta.',
    missaoDestino:
      'Ika é Odu do mistério como caminho. Você veio para guardar segredos sagrados — não para guardá-los só para si, mas para revelá-los no tempo certo. A missão é ser o mensageiro, não a fonte. Fale quando for a hora, não antes.',
    desafiosSombras:
      'Ika nos desafios revela-se como segredo patológico — você esconde o que não precisa esconder e revela o que deveria guardar. A armadilha: usar mistério como proteção de não ser visto. Pergunte: estou protegendo a verdade ou fugindo de ser conhecido?',
  },

  // ── OTURUPON / COROA ──────────────────────────────────────────────────
  Oturupon: {
    vitalidadeEnergia:
      'Oturupon é Odu da cura e da transformação pela crise. Seu corpo é sensor de doença antes que ela se manifeste — você sabe quando algo está errado no ambiente ou nas pessoas antes de ter provas. Use isso para prevenir, não só para reagir depois.',
    conexoesAmor:
      'Oturupon no amor opera como espaço de cura — você é o lugar onde outros vêm para se sentir melhores. A armadilha: ser o curador que nunca se cura. Você dá o que tem, mas recebe pouco. Prática: semanalmente, receba cuidado de alguém. Sem pedir, só permita.',
    carreiraProsperidade:
      'Oturupon na carreira atrai posições de responsabilidade moral — você é chamado a decisões que afetam outros. Isso pode ser exaustivo se você não tiver limites. A prática: após decisões difíceis, reserve 30 minutos só para você. Decisão sem autocuidado vira esgotamento.',
    oriCabecaQuizilas:
      'Oturupon na mente opera pela reflexão — você entende situações complexas pensando nelas, não agindo sobre elas. O risco: pensar sem agir. A prática: ao refletir sobre um problema, defina um prazo para a reflexão. Passado o prazo, aja com o que entendeu — mesmo que incompleto.',
    missaoDestino:
      'Oturupon é Odu da cura sagrada. Você veio para ser a prova viva de que a cura existe — não só falar sobre ela, mas vivê-la. A missão não é só curar os outros, é mostrar que a cura é possível pelo que você é, não só pelo que você faz. Outros vão acreditar na mensagem quando a virem na sua vida.',
    desafiosSombras:
      'Oturupon nos desafios manifesta-se como fardo — você sente o peso da responsabilidade que os outros não assumem. A armadilha: carregar o que não é seu. A prática: diariamente, pergunte: isto é meu ou estou carregando porque ninguém mais quis? Se não é seu, devolva — mentalmente, se não for possível fisicamente.',
  },

  // ── OTURA / MESTRE ────────────────────────────────────────────────────
  Otura: {
    vitalidadeEnergia:
      'Otura é Odu da maestria e do encerramento. Você funciona melhor no efeito platô — após a conquista, antes da próxima aventura. A energia sustentada é seu dom, não o pico. Preserve-se para o trabalho de longa duração, não para o sprint.',
    conexoesAmor:
      'Otura no amor traz estabilidade e profundidade. Você não é o início do fogo — é a brasa que permanece. A armadilha: confundir permanência com estagnação. Relacionamentos estáveis também precisam de atualização. Pergunte ao parceiro anualmente: ainda estamos crescendo juntos?',
    carreiraProsperidade:
      'Otura na carreira é Odu de consolidação. Você coleta os frutos do que plantou — e sabe administrá-los. A prosperidade vem para quem sabe guardar, não só quem sabe conquistar. A prática: mensalmente guarde uma parte do que ganha. Isso não é austeridade — é respeito pelo seu trabalho.',
    oriCabecaQuizilas:
      'Otura na mente opera pela sabedoria acumulada — você sabe porque viveu, não só porque pensou. O risco: usar a experiência como desculpa para não aprender mais. A prática: anualmente, aprenda algo completamente novo, fora da sua área. Isso mantém a mente jovem.',
    missaoDestino:
      'Otura é Odu da mestria incarnada. Você veio para ser a prova viva de que consistência supera talento. A missão é mostrar que o caminho comum é o mais profundo. Não procure atalhos — os atalhos são para quem não tem consistência.',
    desafiosSombras:
      'Otura nos desafios revela konservatismo extremo — você resiste a mudanças mesmo quando necessário. A armadilha: chamar de "tradição" o que é medo de novo. A prática: anualmente, mude algo fundamental na sua vida. Não precisa ser grande — precisa ser real.',
  },

  // ── IRETE / FORÇA ─────────────────────────────────────────────────────
  Irete: {
    vitalidadeEnergia:
      'Irete é Odu da força vital e da saúde. Seu corpo é resiliente — você se recupera rápido de problemas que outros levam semanas. Mas isso não é motivo para descuidar. A armadilha: usar a resiliência como desculpa para não parar. Mesmo resiliente, você precisa de descanso.',
    conexoesAmor:
      'Irete no amor traz paixão e dinamismo. Você ama com o corpo, não só com o coração — energia física, contato, presença. A armadilha: confundir intensidade com profundidade. A prática: além da intensidade física, invista em presença emocional. Dê ao parceiro tempo de qualidade, não só energia.',
    carreiraProsperidade:
      'Irete na carreira atrai oportunidades por mérito — você obtém o que merece, não o que pede. A prosperidade vem do trabalho reconhecido. A prática: semanalmente, documente o que você alcançou. Não é vaidade — é prova concreta de que você merece o que tem.',
    oriCabecaQuizilas:
      'Irete na mente opera pela certeza — você sabe o que sabe, sem dúvida. O risco: confundir certeza com arrogância. A prática: ao tomar uma decisão forte, peça a opinião de alguém que pensa diferente. Isso não enfraquece sua certeza — testa se ela é sólida ou só hábito.',
    missaoDestino:
      'Irete é Odu da força vital incarnada. Você veio para mostrar que a verdadeira força não é a que impõe — é a que sustenta. A missão é ser a presença que as pessoas confiam quando tudo ao redor desmorona. Outros encontram seu centro quando você está presente.',
    desafiosSombras:
      'Irete nos desafios manifesta-se como teimosia de não pedir ajuda. Você aguenta até não aguentar — e aí quebra. A armadilha: achar que pedir ajuda é fraqueza. Na verdade, pedir ajuda no tempo certo é sabedoria. A prática: antes de alcançar seu limite, peça apoio. Antecipe, não só reaja.',
  },

  // ── OFUN / SILÊNCIO ──────────────────────────────────────────────────
  Ofun: {
    vitalidadeEnergia:
      'Ofun é Odu do silêncio e da completude. Seu corpo funciona melhor em paz — ruído, pressa e estimulação excessiva drenam você. Você precisa de tempo sozinho, sem input, sem output. A armadilha: usar silêncio como fuga. Prática: diariamente, 10 minutos de silêncio genuíno — sem música, sem tela, sem conversa. Só presença.',
    conexoesAmor:
      'Ofun no amor opera na profundidade, não na frequência. Você ama poucos, mas profundamente. A armadilha: usar a profundidade como desculpa para evitar a vulnerabilidade do contato regular. A prática: force-se a ter momentos de presença plena com o parceiro — não só morar juntos, mas estar presente quando juntos.',
    carreiraProsperidade:
      'Ofun na carreira atrai sabedoria — você é consultado para decisões complexas. A prosperidade vem de ser a referência em que outros confiam. Mas a armadilha: dar demais sem receber. A prática: cada vez que alguém se beneficia da sua sabedoria, peça algo em troca — nem que seja só gratidão expressada. Isso equilibra o fluxo.',
    oriCabecaQuizilas:
      'Ofun na mente opera pelo silêncio interior — você pensa melhor quando aparenta não estar pensando. O risco: ficar demais no silêncio sem chegar a conclusões. A prática: ao fim de cada silêncio, escreva 1 coisa que aprendeu. Isso transforma contemplação em insight.',
    missaoDestino:
      'Ofun é Odu da completude — você veio para encerrar ciclos. Sua presença facilita a conclusão: de projetos, de relacionamentos, de fases. A missão não é só encerrar — é encerrar com sabedoria, de forma que o que termina bem libera o que começa.',
    desafiosSombras:
      'Ofun nos desafios manifesta-se como melancolia — a sensação de que tudo já foi dito, feito, que nada mais importa. A armadilha: usar "já sei como é" como desculpa para não participar. A prática: diariamente, encontre 1 coisa nova — uma música, uma conversa, um caminho diferente. O novo não precisa ser grande. Só precisa ser real.',
  },
};

/**
 * Build a rich per-area fallback using Odu metadata.
 * Called only when Odu IS present but has no specific per-area narrative.
 */
function buildAreaGenericFallback(
  area: string,
  oduName: string,
  elementalForce: string,
  lifeLesson: string,
  orixaRegency: string,
): string {
  const elem = elementalForce;
  const orixa = orixaRegency;

  const fallbacks: Record<string, string> = {
    vitalidadeEnergia:
      elem
        ? ` Energia de ${oduName}: sua vitalidade é regida pela força ${elem.toLowerCase()}. O corpo sente antes da mente — confie nas sensações físicas como indicador.${orixa ? ` A presença de ${orixa} neste Odu sugere que sua energia se renova no contacto com o elemento terra e trabalho manual.` : ''}`
        : ` A energia de ${oduName} opera em ciclos — há picos de força e momentos de recuo. Não interprete o recuo como falha; é o corpo recalibrando.${orixa ? ` A regência por ${orixa} indica que sua vitalidade se fortalece quando você actua com propósito claro.` : ''}`,
    conexoesAmor:
      ` No amor, ${oduName} influencia como você se liga e se desliga.${lifeLesson ? ` A lição deste Odu é: ${lifeLesson.toLowerCase()}.` : ''} Observe: você tende a iniciar ou a receber? A resposta revela muito sobre seu padrão relacional.${orixa ? ` Com ${orixa} como regente, suas conexões são profundas mas poucas — valorize a qualidade sobre a quantidade.` : ''}`,
    carreiraProsperidade:
      ` Na carreira, ${oduName} aponta para um estilo de prosperidade.${elem ? ` A energia ${elem.toLowerCase()} indica que abundance vem por meio de acção concreta, não de planificação infinita.` : ''} Você tende a criar riqueza pela força do trabalho ou pela persistência paciente?${orixa ? ` A regência por ${orixa} sugere que sua prosperidade está ligada a uma vocação de serviço — encontre o sentido e o recurso segue.` : ''}`,
    oriCabecaQuizilas:
      ` Na mente, ${oduName} traz um estilo de processamento próprio.${elem ? ` A força ${elem.toLowerCase()} indica que você pensa melhor quando há contacto com o elemento terra — caminhe, cozinhe, toque superfícies naturais.` : ''} Os quizilas deste Odu pedem que você observe o que não deve ser dito em voz alta.${lifeLesson ? ` A lição: ${lifeLesson.toLowerCase()}.` : ''}${orixa ? ` A presença de ${orixa} sugere que seu pensamento mais profundo acontece em silêncio, não em conversa.` : ''}`,
    missaoDestino:
      ` ${oduName} é parte da sua missão — não um detalhe, o eixo.${lifeLesson ? ` A lição de vida que este Odu carrega é: ${lifeLesson.toLowerCase()}.` : ''} Aceite o Odu não como destino fixo, mas como direcção cardeal.${elem ? ` A energia ${elem.toLowerCase()} colore como você cumpre esta missão — não fighting o estilo, usá-lo.` : ''}${orixa ? ` A regência por ${orixa} indica que sua contribuição passa pelo elemento humano — outros são o campo da sua missão.` : ''}`,
    desafiosSombras:
      ` Nos desafios, ${oduName} manifesta-se como um padrão repetitivo.${lifeLesson ? ` A lição de vida pede que você enfrente directamente: ${lifeLesson.toLowerCase()}.` : ' Pergunte: qual é a situação que mais repete na sua vida?'} A armadilha é usar o Odu como desculpa — "é o meu destino" — em vez de como bússola.${orixa ? ` A presença de ${orixa} neste Odu indica que o desafio passa pela relação com o sagrado — recuse o profano como refúgio.` : ''}`,
  };

  return fallbacks[area] ?? ` Este Odu carrega uma mensagem que se revela com o tempo. Observe as situações que se repetem — elas são o caminho.`;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Builds the Odu narrative block for a given life area.
 *
 * Logic:
 * 1. Return specific per-Odu+area text if found in ODU_AREA_NARRATIVES.
 * 2. Otherwise build a generic per-area fallback using Odu metadata.
 */
export function buildAncestralidadeOduNarrative(
  odu: OduBirth | null,
  area: string,
): string {
  if (!odu?.oduName)
    return 'O Odu de nascimento não foi registrado. A ancestralidade fala mesmo em silêncio — ouça o corpo.';

  const name = odu.oduName;
  const elemental = odu.elementalForce ?? '';
  const lesson = odu.lifeLesson ?? '';
  const orixa = odu.orixaRegency?.[0] ?? '';

  // Lookup specific per-Odu per-area text
  const oduSpecific = ODU_AREA_NARRATIVES[name]?.[area];
  if (oduSpecific) return oduSpecific;

  // Generic fallback
  const generic =
    `${name}${elemental ? ' (' + elemental + ')' : ''}${orixa ? ' — regido por ' + orixa : ''}. ` +
    `${lesson ? 'Lição de vida: ' + lesson : 'Este Odu guarda uma mensagem que ainda não foi revelada.'} `;
  return generic + buildAreaGenericFallback(area, name, elemental, lesson, orixa);

}
