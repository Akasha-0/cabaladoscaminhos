/**
 * odu-data.ts — Biblioteca estática dos 16 Odus maiores do Ifá
 *
 * Fonte: tradição nagô-yorubá (Ilé-Ifé).
 * REGRA CRÍTICA: apenas dados verificáveis da tradição. Nenhuma invenção.
 */

export type OduElement = 'fire' | 'water' | 'earth' | 'air';

export interface OduData {
  id: string;
  name: string;
  number: number;
  orixas: string[];
  element: OduElement;
  keywords: string[];
  preceitos: string[];
  quizilas: string[];
  essencia: string;
}

/**
 * Os 16 Odus maiores (Meji — duplicados, raízes do Odù).
 * Correspondências elementais seguem a associação clássica:
 * Fogo: Ogbe, Irosun, Ogunda, Osa
 * Água: Oyeku, Obara, Okanran, Ofu
 * Terra: Iwori, Owonrin, Ika, Irete
 * Ar: Odi, Oturupon, Otura, Ose
 */
const ODU_DATABASE: Record<string, OduData> = {
  ogbe: {
    id: 'ogbe',
    name: 'Ogbe',
    number: 1,
    orixas: ['Oxalá', 'Obatala'],
    element: 'fire',
    keywords: ['começo', 'luz', 'criação', 'autoridade', 'liderança'],
    preceitos: [
      'Cultivar paciência e humildade em todas as ações',
      'Respeitar os mais velhos e as tradições ancestrais',
      'Manter a palavra dada — a integridade é sua força',
      'Vestir roupas brancas para atrair clareza espiritual',
      'Oferecer gratidão antes de iniciar qualquer empreendimento',
    ],
    quizilas: [
      'Evitar alimentos de cor vermelha em dias de obrigação',
      'Não iniciar conflitos desnecessários',
      'Afastar-se de ambientes de discórdia e fofoca',
      'Evitar mentira e engano em qualquer forma',
    ],
    essencia:
      'Ogbe é o primeiro Odu da escrita do Ifá, portador da luz primordial. ' +
      'Representa o início de todos os ciclos, a autoridade espiritual e a capacidade de iluminar caminhos. ' +
      'Regido por Oxalá, o grande pai da criação, Ogbe traz consigo a energia do alvorecer — ' +
      'a promessa de recomeço, a força que precede a manifestação. ' +
      'Seu símbolo é a luz que atravessa a escuridão, revelando o que estava oculto.',
  },

  oyeku: {
    id: 'oyeku',
    name: 'Oyeku',
    number: 2,
    orixas: ['Obaluaiê', 'Iku'],
    element: 'water',
    keywords: ['morte', 'transformação', 'ancestralidade', 'renovação', 'mistério'],
    preceitos: [
      'Honrar os ancestrais com regularidade através de oferendas e orações',
      'Aceitar as transformações da vida como parte do ciclo natural',
      'Praticar desapego dos bens e situações que não servem mais',
      'Manter contato com as tradições dos antepassados',
    ],
    quizilas: [
      'Evitar frequentar cemitérios sem proteção espiritual adequada',
      'Não desprezar sinais e presságios do campo espiritual',
      'Afastar-se de situações de risco físico desnecessário',
      'Evitar descuido com a saúde e o corpo físico',
      'Não interromper ritos e cerimônias antes de sua conclusão',
    ],
    essencia:
      'Oyeku é o Odu da transição e do mistério. Regido por Obaluaiê, senhor das epidemias e da cura profunda, ' +
      'e pela força de Iku (a morte), este Odu revela que toda transformação passa por uma morte simbólica. ' +
      'Oyeku não é temido — é respeitado. Ele guarda os segredos dos ancestrais e ensina que o fim é sempre ' +
      'o prelúdio de um novo começo. Quem carrega Oyeku na testa aprende a dançar com o efêmero.',
  },

  iwori: {
    id: 'iwori',
    name: 'Iwori',
    number: 3,
    orixas: ['Xangô', 'Ogum'],
    element: 'earth',
    keywords: ['inteligência', 'mente', 'segredos', 'revelação', 'percepção'],
    preceitos: [
      'Desenvolver a mente através do estudo e da observação constante',
      'Guardar segredos confiados como tesouro sagrado',
      'Usar a inteligência a serviço do bem coletivo',
      'Cultivar discernimento antes de agir',
      'Honrar o conhecimento dos mais experientes',
    ],
    quizilas: [
      'Evitar fofoca e revelação de segredos alheios',
      'Não tomar decisões precipitadas sem reflexão adequada',
      'Afastar-se de relações baseadas em engano',
      'Evitar arrogância intelectual',
    ],
    essencia:
      'Iwori é o Odu da mente e dos segredos. Governado por Xangô, senhor da justiça, e pela força guerreira de Ogum, ' +
      'Iwori representa a inteligência que penetra a superfície e revela o que está escondido. ' +
      'Este Odu ensina que o conhecimento verdadeiro vem da observação paciente e da humildade diante do mistério. ' +
      'Quem caminha com Iwori desenvolve percepção aguçada e a capacidade de enxergar padrões invisíveis à maioria.',
  },

  odi: {
    id: 'odi',
    name: 'Odi',
    number: 4,
    orixas: ['Iemanjá', 'Oxum'],
    element: 'air',
    keywords: ['ventre', 'criatividade', 'gestação', 'mistério feminino', 'maternidade'],
    preceitos: [
      'Proteger o espaço interior e os projetos ainda em gestação',
      'Cultivar paciência com processos que levam tempo para amadurecer',
      'Honrar o sagrado feminino em todas as suas formas',
      'Manter a intimidade e os planos protegidos até o momento certo',
      'Alimentar-se com cuidado e atenção ao corpo',
    ],
    quizilas: [
      'Evitar expor projetos prematuramente antes do tempo certo',
      'Não descuidar da alimentação e da saúde do ventre',
      'Afastar-se de situações que violem o espaço íntimo',
      'Evitar conflitos relacionados a questões de família e linhagem',
    ],
    essencia:
      'Odi é o Odu do ventre e do mistério da criação. Regido pelas grandes mães das águas — Iemanjá e Oxum — ' +
      'este Odu guarda os segredos da gestação, seja ela biológica, criativa ou espiritual. ' +
      'Odi ensina que nem tudo deve ser revelado antes do tempo. Como o feto que cresce protegido no útero, ' +
      'as grandes obras da vida precisam de tempo, silêncio e proteção para se manifestar com plenitude.',
  },

  irosun: {
    id: 'irosun',
    name: 'Irosun',
    number: 5,
    orixas: ['Oxum', 'Iansã'],
    element: 'fire',
    keywords: ['sangue', 'vitória', 'amor', 'riqueza', 'fluxo vital'],
    preceitos: [
      'Celebrar a vida e o fluxo vital com alegria e gratidão',
      'Cuidar da circulação — física e energética',
      'Cultivar relações amorosas baseadas em reciprocidade',
      'Fazer oferendas às águas doces em momentos de gratidão',
      'Honrar o ciclo feminino como portal sagrado',
    ],
    quizilas: [
      'Evitar ambientes com muito derramamento de sangue ou violência',
      'Não desperdiçar recursos materiais e financeiros',
      'Afastar-se de relações possessivas e manipuladoras',
      'Evitar estagnação — o fluxo deve continuar sempre',
    ],
    essencia:
      'Irosun é o Odu do sangue e da vitória. Ligado a Oxum, rainha das águas doces, e à força tempestuosa de Iansã, ' +
      'Irosun celebra o fluxo vital que corre por todas as coisas. Representa amor, riqueza conquistada e a força ' +
      'que faz a seiva subir pelas árvores. Quem carrega Irosun aprende que a vida é movimento — ' +
      'e que estagnar é o maior dos riscos.',
  },

  owonrin: {
    id: 'owonrin',
    name: 'Owonrin',
    number: 6,
    orixas: ['Exu', 'Oxumarê'],
    element: 'earth',
    keywords: ['transformação', 'caos criativo', 'movimento', 'renovação', 'caminhos'],
    preceitos: [
      'Abraçar mudanças inesperadas como oportunidades de crescimento',
      'Abrir os caminhos fazendo oferendas a Exu antes das jornadas',
      'Cultivar flexibilidade diante do imprevisível',
      'Manter-se em movimento — nunca deixar que a inércia domine',
      'Honrar os cruzamentos e encruzilhadas como portais de decisão',
    ],
    quizilas: [
      'Evitar teimosia e rigidez diante das mudanças da vida',
      'Não ignorar os avisos que aparecem nos caminhos',
      'Afastar-se de situações de excesso — seja de comida, bebida ou emoções',
      'Evitar deixar os problemas sem resolução por tempo demais',
    ],
    essencia:
      'Owonrin é o Odu do caos criativo. Regido por Exu, senhor dos caminhos e da comunicação, e por Oxumarê, ' +
      'o arco-íris eterno, Owonrin traz a energia da mudança repentina e inevitável. ' +
      'Este Odu ensina que o caos não é inimigo — é o caldeirão onde novas formas nascem. ' +
      'Quem caminha com Owonrin aprende a dançar com o inesperado e a encontrar oportunidade onde outros veem desordem.',
  },

  obara: {
    id: 'obara',
    name: 'Obara',
    number: 7,
    orixas: ['Xangô', 'Oxalá'],
    element: 'water',
    keywords: ['realeza', 'riqueza', 'generosidade', 'autoridade', 'abundância'],
    preceitos: [
      'Exercer a liderança com generosidade e senso de justiça',
      'Partilhar os recursos com a comunidade',
      'Cultivar a dignidade e a postura nobre em todas as situações',
      'Honrar os compromissos assumidos publicamente',
      'Investir no crescimento espiritual como base da prosperidade',
    ],
    quizilas: [
      'Evitar arrogância e ostentação vazia',
      'Não usar a posição de liderança para oprimir ou manipular',
      'Afastar-se da avareza — a riqueza bloqueada perde o valor',
      'Evitar disputas de ego desnecessárias',
    ],
    essencia:
      'Obara é o Odu da realeza e da abundância. Governado por Xangô, rei da justiça, e pela luz de Oxalá, ' +
      'Obara representa a verdadeira riqueza — aquela que vem do espírito e se manifesta no mundo material. ' +
      'Este Odu ensina que a grandeza real não reside na posse, mas na capacidade de distribuir e elevar os que estão ao redor. ' +
      'Quem caminha com Obara é chamado à liderança com responsabilidade sagrada.',
  },

  okanran: {
    id: 'okanran',
    name: 'Okanran',
    number: 8,
    orixas: ['Xangô', 'Iansã'],
    element: 'water',
    keywords: ['conflito', 'resolução', 'coragem', 'confronto', 'clareza'],
    preceitos: [
      'Enfrentar os conflitos com coragem e clareza, sem fugir',
      'Buscar a resolução pacífica antes de recorrer ao confronto',
      'Cultivar a auto-honestidade como ferramenta de crescimento',
      'Pedir proteção espiritual antes de enfrentar adversários',
      'Aprender com cada batalha, mesmo quando a derrota chega',
    ],
    quizilas: [
      'Evitar provocar conflitos sem necessidade',
      'Não carregar rancores antigos — perdoar é estratégia espiritual',
      'Afastar-se de ambientes de violência gratuita',
      'Evitar impulsividade nas decisões importantes',
    ],
    essencia:
      'Okanran é o Odu do conflito e da resolução. Ligado à força do trovão de Xangô e ao vento tempestuoso de Iansã, ' +
      'este Odu ensina que o conflito é inevitável — e que evitá-lo é a pior estratégia. ' +
      'Okanran chama à clareza: enfrente o que precisa ser enfrentado, fale o que precisa ser dito, ' +
      'resolva o que está pendente. A tempestade que passa limpa o ar.',
  },

  ogunda: {
    id: 'ogunda',
    name: 'Ogunda',
    number: 9,
    orixas: ['Ogum'],
    element: 'fire',
    keywords: ['trabalho', 'abertura de caminhos', 'guerra', 'tecnologia', 'persistência'],
    preceitos: [
      'Trabalhar com dedicação e método — Ogum valoriza o esforço genuíno',
      'Limpar os caminhos antes de avançar: eliminar obstáculos com estratégia',
      'Cultivar disciplina física e mental como prática espiritual',
      'Honrar as ferramentas de trabalho como extensões do corpo',
      'Proteger os vulneráveis com a força conquistada',
    ],
    quizilas: [
      'Evitar a violência gratuita e o uso da força sem propósito',
      'Não abandonar projetos no meio do caminho sem razão clara',
      'Afastar-se de situações de injustiça sem tentar corrigi-las',
      'Evitar negligência com as ferramentas e o ambiente de trabalho',
    ],
    essencia:
      'Ogunda é o Odu do guerreiro trabalhador. Regido inteiramente por Ogum, senhor do ferro e dos caminhos, ' +
      'este Odu representa a força que abre o mato com o facão — não pela violência, mas pela necessidade do progresso. ' +
      'Ogunda ensina que os obstáculos existem para ser removidos com trabalho, estratégia e fé. ' +
      'Quem carrega este Odu é convocado à ação: o campo espiritual responde ao suor genuíno.',
  },

  osa: {
    id: 'osa',
    name: 'Osa',
    number: 10,
    orixas: ['Iansã', 'Oiá'],
    element: 'fire',
    keywords: ['mudança súbita', 'tempestade', 'transformação feminina', 'intuição', 'revelação'],
    preceitos: [
      'Confiar na intuição feminina como guia espiritual',
      'Abraçar as mudanças súbitas como chamados da vida',
      'Honrar os ventos e tempestades como forças purificadoras',
      'Cultivar a coragem de dizer a verdade mesmo quando é difícil',
      'Fazer oferendas a Iansã nos momentos de transição',
    ],
    quizilas: [
      'Evitar resistir às transformações que o tempo traz inevitavelmente',
      'Não sufocar a expressão emocional — a repressão cria tempestades internas',
      'Afastar-se de relações onde a autenticidade não é bem-vinda',
      'Evitar ambientes de estagnação e rotina sem sentido',
    ],
    essencia:
      'Osa é o Odu da tempestade e da revelação. Governado por Iansã-Oiá, senhora dos ventos, raios e das almas dos mortos, ' +
      'Osa traz a energia da mudança que não pede licença. Como um vendaval que varre o que estava podre, ' +
      'este Odu limpa o campo para o novo. Quem caminha com Osa aprende que as tempestades da vida ' +
      'são, na verdade, convites para a renovação mais profunda.',
  },

  ika: {
    id: 'ika',
    name: 'Ika',
    number: 11,
    orixas: ['Oxalufã', 'Oxumarê'],
    element: 'earth',
    keywords: ['persistência', 'sabedoria ancestral', 'longevidade', 'paciência', 'enraizamento'],
    preceitos: [
      'Cultivar paciência — as grandes obras levam tempo para amadurecer',
      'Honrar os ancestrais como coluna de sustentação espiritual',
      'Desenvolver raízes profundas antes de crescer para o alto',
      'Buscar a sabedoria nos mais velhos e nas tradições',
      'Cuidar do corpo como templo que abriga o espírito',
    ],
    quizilas: [
      'Evitar pressa excessiva e impulsividade nas decisões',
      'Não cortar raízes ancestrais em busca de novidade vazia',
      'Afastar-se de pessoas que não respeitam os mais velhos',
      'Evitar negligência com a saúde — especialmente ossos e articulações',
    ],
    essencia:
      'Ika é o Odu da sabedoria que vem com o tempo. Ligado à energia de Oxalufã, o Oxalá ancião que caminha lentamente ' +
      'mas com profunda sabedoria, e à serpente cósmica Oxumarê, Ika ensina o valor da paciência e do enraizamento. ' +
      'Como a árvore centenária que resistiu a todas as tempestades, quem carrega Ika possui uma força interior ' +
      'que cresce silenciosamente e se revela nos momentos de maior necessidade.',
  },

  oturupon: {
    id: 'oturupon',
    name: 'Oturupon',
    number: 12,
    orixas: ['Obaluaiê', 'Omulu'],
    element: 'air',
    keywords: ['cura', 'doença', 'transformação', 'limpeza', 'renascimento'],
    preceitos: [
      'Cuidar da saúde com atenção e prevenção',
      'Fazer limpezas espirituais regulares do corpo e do ambiente',
      'Honrar Obaluaiê com respeito, especialmente nas travessias difíceis',
      'Buscar cura para feridas antigas — físicas e emocionais',
      'Cultivar gratidão pela saúde presente',
    ],
    quizilas: [
      'Evitar descuido com a saúde física — sinais do corpo devem ser ouvidos',
      'Não negligenciar as limpezas espirituais periódicas',
      'Afastar-se de ambientes insalubres e energias pesadas',
      'Evitar usar a doença alheia como assunto de fofoca',
    ],
    essencia:
      'Oturupon é o Odu da cura e da transformação pela doença. Regido por Obaluaiê-Omulu, senhor das epidemias e da medicina, ' +
      'este Odu ensina que a enfermidade não é castigo — é mensagem. O corpo adoece quando o espírito precisa mudar. ' +
      'Oturupon guia os que passam por crises de saúde como portais de transformação, ' +
      'revelando que do lado de lá da doença existe um ser mais íntegro esperando para nascer.',
  },

  otura: {
    id: 'otura',
    name: 'Otura',
    number: 13,
    orixas: ['Oxalá', 'Orunmilá'],
    element: 'air',
    keywords: ['sabedoria divina', 'revelação', 'profecia', 'missão de vida', 'destino'],
    preceitos: [
      'Buscar o conhecimento de Ifá como guia da missão de vida',
      'Agir com sabedoria antes de falar — as palavras têm poder de criação',
      'Cumprir os itãs (obrigações) espirituais com fidelidade',
      'Cultivar a conexão com Orunmilá através da consulta ao Ifá',
      'Compartilhar a sabedoria recebida para benefício coletivo',
    ],
    quizilas: [
      'Evitar usar o conhecimento espiritual para manipular ou controlar',
      'Não revelar os segredos do Ifá para os não iniciados inadequadamente',
      'Afastar-se de pessoas que desprezam a sabedoria ancestral',
      'Evitar o orgulho espiritual — o conhecimento verdadeiro gera humildade',
    ],
    essencia:
      'Otura é o Odu da revelação divina. Governado por Oxalá e pela sabedoria de Orunmilá, testemunha da criação, ' +
      'Otura carrega a profecia da missão de vida. Este Odu é consultado quando se busca compreender o Orí (destino) ' +
      'e as escolhas que o alinharam ou distanciaram. Quem recebe Otura no jogo aprende que ' +
      'a vida tem um propósito maior — e que honrá-lo é o caminho da realização.',
  },

  irete: {
    id: 'irete',
    name: 'Irete',
    number: 14,
    orixas: ['Oxum', 'Oshun'],
    element: 'earth',
    keywords: ['amor', 'beleza', 'diplomacia', 'harmonia', 'relacionamentos'],
    preceitos: [
      'Cultivar a beleza interior como reflexo da graça espiritual',
      'Resolver conflitos com diplomacia e suavidade',
      'Honrar Oxum com mel, ouro e flores em momentos de pedido',
      'Cuidar das relações afetivas com atenção e carinho',
      'Apreciar as artes e a criatividade como expressões do sagrado',
    ],
    quizilas: [
      'Evitar conflitos desnecessários que destroem a harmonia',
      'Não ser cruel ou áspero nas palavras — a língua fere mais que a espada',
      'Afastar-se de relações que exigem abrir mão da dignidade',
      'Evitar ciúme excessivo que sufoca o amor',
    ],
    essencia:
      'Irete é o Odu do amor e da harmonia. Regido por Oxum, rainha das águas doces e do amor, ' +
      'Irete celebra a beleza como força espiritual. Este Odu ensina que a harmonia nos relacionamentos ' +
      'não é fraqueza — é inteligência. A diplomacia de Irete dissolve conflitos que a força bruta apenas piora. ' +
      'Quem caminha com Irete possui o dom de criar paz onde havia tensão, e beleza onde havia desolação.',
  },

  ose: {
    id: 'ose',
    name: 'Ose',
    number: 15,
    orixas: ['Oxum', 'Logun Edé'],
    element: 'air',
    keywords: ['prosperidade', 'fertilidade', 'abundância', 'saúde', 'vitalidade'],
    preceitos: [
      'Cultivar a prosperidade como consequência do alinhamento espiritual',
      'Cuidar da saúde como base de toda abundância',
      'Honrar a fertilidade em todas as suas formas — filhos, projetos, ideias',
      'Partilhar a prosperidade com generosidade',
      'Agradecer diariamente pelas bênçãos recebidas',
    ],
    quizilas: [
      'Evitar avareza e acúmulo sem partilha',
      'Não descuidar da saúde em nome do trabalho excessivo',
      'Afastar-se de ambientes que drenam a vitalidade',
      'Evitar pensamentos de escassez que bloqueiam o fluxo de abundância',
    ],
    essencia:
      'Ose é o Odu da prosperidade e da vitalidade. Ligado a Oxum e à energia jovem e andrógina de Logun Edé, ' +
      'filho de Oxum e Oxóssi, Ose representa a abundância que nasce do equilíbrio. ' +
      'Este Odu ensina que a verdadeira prosperidade inclui saúde, amor, recursos e conexão espiritual — ' +
      'nenhum destes elementos é completo sem os outros. Quem caminha com Ose é chamado à integralidade da vida.',
  },

  ofu: {
    id: 'ofu',
    name: 'Ofun',
    number: 16,
    orixas: ['Oxalá', 'Iemanjá'],
    element: 'water',
    keywords: ['completude', 'síntese', 'transcendência', 'encerramento', 'retorno ao sagrado'],
    preceitos: [
      'Encerrar os ciclos com gratidão e consciência',
      'Buscar a síntese — integrar todas as experiências como aprendizado',
      'Honrar o retorno ao sagrado como processo contínuo',
      'Cultivar a espiritualidade como coluna de sustentação da vida',
      'Preparar-se para novos ciclos com desapego do passado',
    ],
    quizilas: [
      'Evitar agarrar-se ao que já completou seu ciclo',
      'Não ignorar os chamados espirituais que chegam ao final dos ciclos',
      'Afastar-se de situações de estagnação que impedem o encerramento',
      'Evitar medo do novo que paralisa o encerramento do velho',
    ],
    essencia:
      'Ofun é o décimo sexto e último Odu maior, o grande encerramento do círculo sagrado. ' +
      'Regido por Oxalá, o pai de todos, e pelas águas profundas de Iemanjá, ' +
      'Ofun representa a completude — o ponto onde o fim encontra o começo. ' +
      'Este Odu guarda o mistério da transcendência: quando tudo foi vivido, aprendido e integrado, ' +
      'o espírito retorna ao sagrado para renascer com maior sabedoria no próximo ciclo.',
  },
};

export function getOduByName(name: string): OduData | undefined {
  const normalized = name.toLowerCase().trim();
  // Tentativa direta pela chave
  if (ODU_DATABASE[normalized]) return ODU_DATABASE[normalized];
  // Busca por nome (campo name)
  const direct = Object.values(ODU_DATABASE).find((odu) => odu.name.toLowerCase() === normalized);
  if (direct) return direct;
  // F-219: nomes canônicos ODUS_IFA vêm com parentético (ex.: 'Ogbe (Oxé)'
  // via calculateBirthOdu em @akasha/core-odus/odu-birth.ts). Strip
  // "(...)" e reaplica. Sem isso, o lookup falha e o glossary section
  // retorna null no system prompt da IA — alucinação do LLM.
  const stripped = normalized.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (stripped && stripped !== normalized) {
    if (ODU_DATABASE[stripped]) return ODU_DATABASE[stripped];
    return Object.values(ODU_DATABASE).find((odu) => odu.name.toLowerCase() === stripped);
  }
  return undefined;
}
