/**
 * Tarot-Tarot Spiritual Correlation
 * Correlates pairs of Tarot Major Arcana cards (0-21) through mystical connections,
 * thematic relationships, elemental correspondences, and complementary archetypes.
 * Represents the interplay between different perspectives within the same tradition.
 */

/**
 * Represents a correlation between two Tarot Major Arcana cards
 */
export interface TarotTarotMapping {
  /** The first arcano in the correlation */
  arcano_primario: {
    /** Card name */
    nome: string;
    /** Card number in the Major Arcana (0-21) */
    numero_carta: number;
  };
  /** The second arcano in the correlation */
  arcano_secundario: {
    /** Card name */
    nome: string;
    /** Card number in the Major Arcana (0-21) */
    numero_carta: number;
  };
  /** Type of relationship between the cards */
  tipo_correlacao: 'complementar' | 'progressivo' | 'contraste' | 'reflexivo' | 'transformativo';
  /** How these two cards relate spiritually */
  conexao_espiritual: string;
  /** Combined meaning when these cards appear together */
  significado_combinado: string;
  /** Ritual or meditation that combines both energies */
  ritual_recomendado: string;
}

// ─── Tarot Major Arcana Pairing Mapping ─────────────────────────────────

/**
 * Complete mapping of Tarot Major Arcana pairs.
 * Each pair represents a meaningful spiritual connection.
 */
export const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // ─── O Louco ────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Louco', numero_carta: 0 },
    arcano_secundario: { nome: 'O Mundo', numero_carta: 21 },
    tipo_correlacao: 'reflexivo',
    conexao_espiritual:
      'O Louco é o início da jornada e O Mundo é sua conclusão. Juntos representam o ciclo completo de experiência espiritual - da liberdade selvagem do primeiro passo à integração sagrada do retorno. O Louco não sabe onde vai; O Mundo sabe que já chegou.',
    significado_combinado:
      'Ciclo completo de manifestação. O salto inicial que leva à completude final. Representa a jornada do peregrino que começa sem destino e termina em sabedoria, mantendo a mesma liberdade original.',
    ritual_recomendado:
      'Medite sobre seu caminho: onde você começou e onde está agora. Observe como a liberdade do início se transformou na sabedoria do fim sem perder a essência.',
  },
  {
    arcano_primario: { nome: 'O Louco', numero_carta: 0 },
    arcano_secundario: { nome: 'A Estrela', numero_carta: 17 },
    tipo_correlacao: 'complementar',
    conexao_espiritual:
      'O Louco carrega a energia da aventura sem medo, enquanto A Estrela oferece esperança e orientação no caminho. O Louco precisa de esperança para seguir; A Estrela oferece luz para o viajante.',
    significado_combinado:
      'Esperança radiante no início da jornada. Confiança de que há uma estrela guiando seus passos, mesmo quando o caminho parece selvagem e desconhecido.',
    ritual_recomendado:
      'Coloque uma vela amarela e olhe para as estrelas. Peça orientação para sua próxima aventura, confiando que o universo responde aos que se atrevem a saltar.',
  },
  {
    arcano_primario: { nome: 'O Louco', numero_carta: 0 },
    arcano_secundario: { nome: 'A Torre', numero_carta: 16 },
    tipo_correlacao: 'transformativo',
    conexao_espiritual:
      'O Louco representa a disposição para mudar tudo, enquanto A Torre é a destruição que viabiliza a mudança. O Louco inicia a jornada que inevitavelmente leva à queda dos velhos structures.',
    significado_combinado:
      'Destruição criativa que liberta. A coragem de derrubar sua própria torre interna para reconstruir algo autêntico. O Louco dentro de você quer destruir para se reinventar.',
    ritual_recomendado:
      'Escreva em um papel o que precisa ser destruído em sua vida. Queime-o ao entardecer, fazendo um som de libertação, e sinta O Louco vibrar com a energia da renovação.',
  },

  // ─── A Sacerdotisa ──────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Sacerdotisa', numero_carta: 1 },
    arcano_secundario: { nome: 'A Lua', numero_carta: 18 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Sacerdotisa é a guardiã dos mistérios ocultos; A Lua navega pelos reinos oníricos onde esses mistérios se revelam. A Sacerdotisa contém o conhecimento; A Lua o manifesta em forma de sonho.',
    significado_combinado:
      'Intuição lunar nos seus níveis mais profundos. A sabedoria silenciosa que emerge dos sonhos, revelando verdades ocultas que a mente waking não consegue acessar.',
    ritual_recomendado:
      'Medite à noite com iluminação lunar. Deixe a mente vagar livremente e registre os sonhos ao despertar - eles carregam mensagens da sua alma.',
  },
  {
    arcano_primario: { nome: 'A Sacerdotisa', numero_carta: 1 },
    arcano_secundario: { nome: 'A Justiça', numero_carta: 8 },
    tipo_correlacao: 'contraste',
    conexao_espiritual:
      'A Sacerdotisa revela verdades ocultas em silêncio; A Justiça manifesta a verdade publicamente com equilíbrio. A Sacerdotisa é o mistério; A Justiça é a revelação.',
    significado_combinado:
      'A verdade que se revela aos poucos, primeiro emintuição, depois em equilíbrio. O caminho do conhecimento oculto para a sabedoria do justo.',
    ritual_recomendado:
      'Pratique o discernimento: antes de decisões importantes, medite em silêncio (como A Sacerdotisa), depois aplique a justiça interna (como A Justiça) ao escolher.',
  },

  // ─── A Imperatriz ───────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Imperatriz', numero_carta: 2 },
    arcano_secundario: { nome: 'O Sol', numero_carta: 19 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Imperatriz nutre a vida em todas as suas formas; O Sol ilumina e vitaliza essa criação. A Imperatriz é a mãe; O Sol é o filho iluminado que emerge dela.',
    significado_combinado:
      'Fertilidade criativa que resulta em claridad. A expressão criativa que nasce do nurturing, desabrochando em brilho e vitalidade radiante.',
    ritual_recomendado:
      'Passe tempo na natureza, cultivando algo. Depois, exponha-se à luz solar direta, permitindo que a energia criativa se transforma em expressão autêntica.',
  },
  {
    arcano_primario: { nome: 'A Imperatriz', numero_carta: 2 },
    arcano_secundario: { nome: 'A Estrela', numero_carta: 17 },
    tipo_correlacao: 'complementar',
    conexao_espiritual:
      'A Imperatriz é a fertilidade da terra; A Estrela é a esperança do céu. A Imperatriz nutre a abundância material; A Estrela oferece orientação espiritual.',
    significado_combinado:
      'Abundância que flui do céu para a terra. A conexão entre a fertilidade terrena e a esperança celestial, criando um fluxo contínuo de bênçãos.',
    ritual_recomendado:
      'Plante sementes ou cuide de plantas enquanto mantém seu olhar no céu. Peça que a abundância da terra se conecte com a esperança do cosmos.',
  },

  // ─── O Imperador ───────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Imperador', numero_carta: 3 },
    arcano_secundario: { nome: 'O Hierofante', numero_carta: 5 },
    tipo_correlacao: 'complementar',
    conexao_espiritual:
      'O Imperador representa a autoridade terrena e a estrutura; O Hierofante representa a autoridade espiritual e a tradição. Juntos governam tanto o reino físico quanto o espiritual.',
    significado_combinado:
      'Ordem sagrada em todos os níveis. A disciplina que serve ao crescimento espiritual, estruturando a vida para que os valores mais elevados possam florescer.',
    ritual_recomendado:
      'Estabeleça uma rotina espiritual que combine disciplina (Imperador) com reverência (Hierofante). Uma prática que estrutura o corpo para elevação da alma.',
  },
  {
    arcano_primario: { nome: 'O Imperador', numero_carta: 3 },
    arcano_secundario: { nome: 'A Torre', numero_carta: 16 },
    tipo_correlacao: 'contraste',
    conexao_espiritual:
      'O Imperador constrói estruturas sólidas; A Torre as destrói. O Imperador cria ordem; A Torre dissolve para reconstruir. São opostos necessários.',
    significado_combinado:
      'Destruição das estruturas de poder que não servem mais. A queda do imperador interno que se tornou tirano, para que um governante mais sábio possa emergir.',
    ritual_recomendado:
      'Identifique estruturas em sua vida que se tornaram rígidas e restritivas. Reconheça quando o Imperador se tornou opressor e permita que A Torre traga libertação.',
  },

  // ─── O Hierofante ───────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Hierofante', numero_carta: 4 },
    arcano_secundario: { nome: 'O Eremita', numero_carta: 9 },
    tipo_correlacao: 'contraste',
    conexao_espiritual:
      'O Hierofante ensina através da tradição e da comunidade; O Eremita busca sozinho nos recessos internos. O Hierofante é o mestre exterior; O Eremita é o mestre interior.',
    significado_combinado:
      'A sabedoria que vem tanto de fora quanto de dentro. O caminho do mestre externo que leva ao mestre interno, integrando tradição com autoconhecimento.',
    ritual_recomendado:
      'Estude uma tradição sagrada (Hierofante), depois medite em solidão sobre o que aprendeu (Eremita). Deixe que o conhecimento externo se transforme em sabedoria interna.',
  },
  {
    arcano_primario: { nome: 'O Hierofante', numero_carta: 4 },
    arcano_secundario: { nome: 'O Louco', numero_carta: 0 },
    tipo_correlacao: 'transformativo',
    conexao_espiritual:
      'O Hierofante representa a tradição e a conformidade; O Louco representa a liberdade e a desobediência. Este par revela o desafio de equilibrar respeito pela tradição com a necessidade de inovação.',
    significado_combinado:
      'O sagrado que se torna selvagem. A tradição transformada em liberdade, onde as regras se dissolvem na essência original do ensinamento.',
    ritual_recomendado:
      'Honre uma tradição que respeite, mas permita que seu espírito a transcenda. Pergunte: o que a tradição está realmente tentando ensinar? A resposta pode surpreender.',
  },

  // ─── Os Enamorados ──────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'Os Enamorados', numero_carta: 6 },
    arcano_secundario: { nome: 'A Lovers (Two of Cups)', numero_carta: 99 },
    tipo_correlacao: 'complementar',
    conexao_espiritual:
      'Os Enamorados representam a escolha do coração no nível do arcano; Os Copos representam a união emocional no nível dos pequenos arcanos. O amor no seu aspecto mais transformador.',
    significado_combinado:
      'Escolha amorosa que cria união emocional. A decisão de abrir o coração que resulta em conexão profunda com outro ser.',
    ritual_recomendado:
      'Beba água juntos de duas taças, simbolizando a união. Faça escolhas em alinhamento com o coração antes de buscar aprovação externa.',
  },
  {
    arcano_primario: { nome: 'Os Enamorados', numero_carta: 6 },
    arcano_secundario: { nome: 'O Diabo', numero_carta: 15 },
    tipo_correlacao: 'contraste',
    conexao_espiritual:
      'Os Enamorados escolhem com o coração; O Diabo prende com a obsessão. Os Enamorados representam o amor livre; O Diabo representa o amor que se torna prisão.',
    significado_combinado:
      'Liberdade ou prisão no amor. Este par questiona: você ama com liberdade ou está preso em laços que criou? Reconheça a diferença.',
    ritual_recomendado:
      'Examine seus relacionamentos: são fontes de liberdade ou cadeias? Se são prisões, pergunte-se que tipo de escolha você fez para chegar aqui.',
  },

  // ─── O Carro ────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Carro', numero_carta: 7 },
    arcano_secundario: { nome: 'A Roda da Fortuna', numero_carta: 10 },
    tipo_correlacao: 'complementar',
    conexao_espiritual:
      'O Carro conquista através da vontade; A Roda segue o destino. O Carro controla o cavalo; A Roda controla o condutor. Juntos representam a vontade em harmonia com o destino.',
    significado_combinado:
      'Direção Voluntária no Fluxo do Destino. Avanzar com determinação enquanto aceita que a vida tem seus próprios planos. A sabedoria de lutar quando possível e fluir quando necessário.',
    ritual_recomendado:
      'Defina sua intenção (Carro), depois solte o controle e permita que a vida flua (Roda). Observe onde sua vontade e seu destino se encontram.',
  },
  {
    arcano_primario: { nome: 'O Carro', numero_carta: 7 },
    arcano_secundario: { nome: 'A Morte', numero_carta: 13 },
    tipo_correlacao: 'transformativo',
    conexao_espiritual:
      'O Carro avançafirme; A Morte transforma tudo. O Carro mantém o controle; A Morte o entrega. O Carro vence batalhas; A Morte vence a guerra.',
    significado_combinado:
      'Avanço através da transformação. O movimento que requer soltar o antigo para que o novo possa nascer. O Carro que conduz através da Morte.',
    ritual_recomendado:
      'Identifique o que precisa morrer para que você avance. Não lute contra a transformação; conduza seu carro através dela com coragem.',
  },

  // ─── A Força ─────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Força', numero_carta: 11 },
    arcano_secundario: { nome: 'O Eremita', numero_carta: 9 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Força domina o leão através da compaixão; O Eremita ilumina com a luz interior. Ambos representam poder suave - a força que não precisa de violência.',
    significado_combinado:
      'Força compassiva que ilumina. O poder de domar nossos instintos mais selvagens com gentileza, criando espaço para a sabedoria interior brilhar.',
    ritual_recomendado:
      'Pratique a força gentil: quando sentir raiva ou frustração, não as reprima, mas as abraça com compaixão. Deixe que a luz do Eremita ilumine sua capacidade de amar.',
  },

  // ─── O Eremita ───────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Eremita', numero_carta: 9 },
    arcano_secundario: { nome: 'A Temperança', numero_carta: 14 },
    tipo_correlacao: 'complementar',
    conexao_espiritual:
      'O Eremita busca a luz na solidão; A Temperança busca o equilíbrio na síntese. O Eremita se retira do mundo; A Temperança traz a sabedoria do retiro de volta ao mundo.',
    significado_combinado:
      'Sabedoria interior que equilibra o mundo. A luz que o eremita encontra na escuridão, depois retorna para harmonizar os extremos da vida cotidiana.',
    ritual_recomendado:
      'Periodicamente, retire-se para silêncio e escuridão (Eremita). Depois, volte ao mundo aplicando a sabedoria encontrada com equilíbrio (Temperança).',
  },

  // ─── A Roda da Fortuna ──────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Roda da Fortuna', numero_carta: 10 },
    arcano_secundario: { nome: 'O Julgamento', numero_carta: 20 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Roda gira entre ascensão e queda; O Julgamento é o momento de despertar quando a roda para. A Roda representa o ciclo; O Julgamento representa o fim do ciclo.',
    significado_combinado:
      'Chamada para despertar quando os ciclos se completam. A roda da vida para todos nós em algum momento, e这时响起 a chamada do Juízo para renascermos.',
    ritual_recomendado:
      'Reconheça os ciclos em sua vida. Quando um ciclo termina, permita que o chamado do Julgamento o desperte para uma nova fase de expressão.',
  },

  // ─── A Justiça ──────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Justiça', numero_carta: 8 },
    arcano_secundario: { nome: 'O Julgamento', numero_carta: 20 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Justiça pesa as ações passadas; O Julgamento avalia a resposta presente. A Justiça é o julgamento cooler; O Julgamento é o despertar mais intenso.',
    significado_combinado:
      'Retribuição cósmica que desperta a alma. O equilíbrio das ações passadas que culmina em um chamado para renascer como seu EU superior.',
    ritual_recomendado:
      'Examine suas ações passadas com honestidade (Justiça). Depois, pergunte ao seu Eu Superior o que ele quer que você se torne (Julgamento).',
  },

  // ─── O Enforcado ─────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Enforcado', numero_carta: 12 },
    arcano_secundario: { nome: 'A Estrela', numero_carta: 17 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'O Enforcado entrega o controle através do sacrifício; A Estrela oferece esperança após a entrega. O Enforcado espera; A Estrela guía.',
    significado_combinado:
      'Entrega que resulta em esperança. O sacrifício do controle egoico que abre espaço para a esperança celestial guiar você.',
    ritual_recomendado:
      'Pratique a entrega consciente: solte a necessidade de controlar resultados. Na quietude que se segue, permita que a esperança (Estrela) se revele.',
  },

  // ─── A Morte ────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Morte', numero_carta: 13 },
    arcano_secundario: { nome: 'O Mundo', numero_carta: 21 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Morte transforma; O Mundo integra. A Morte é a metamorfose; O Mundo é a borboleta que emerge. A Morte é o fim; O Mundo é o novo começo.',
    significado_combinado:
      'Transformação que resulta em completude. A morte do velho self que possibilitou a integração do novo, culminando na realizade da alma.',
    ritual_recomendado:
      'Honre seus morreres - os finais que viveram em sua vida. Reconheça que cada morte foi um portal para um mundo mais completo.',
  },
  {
    arcano_primario: { nome: 'A Morte', numero_carta: 13 },
    arcano_secundario: { nome: 'O Sol', numero_carta: 19 },
    tipo_correlacao: 'transformativo',
    conexao_espiritual:
      'A Morte dissolve; O Sol ilumina. A Morte remove os véus; O Sol revela a verdade. A Morte é a noite; O Sol é o amanhecer.',
    significado_combinado:
      'Renascimento através da luz. A escuridão da morte que precede o brilho do sol interior. A certeza de que após toda noite vem o dia.',
    ritual_recomendado:
      'Nas horas mais escuras, lembre-se: o sol sempre nasce. A morte que você enfrenta agora é apenas o portal para o brilho que virá.',
  },

  // ─── A Temperança ───────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Temperança', numero_carta: 14 },
    arcano_secundario: { nome: 'O Diabo', numero_carta: 15 },
    tipo_correlacao: 'contraste',
    conexao_espiritual:
      'A Temperança equilibra; O Diabo prende. A Temperançaharmoniza opostos; O Diabo cria extremos. A Temperança é o caminho do meio; O Diabo é o caminho do excessivo.',
    significado_combinado:
      'Libertação dos extremos. Reconhecer quando o equilíbrio se tornou prisão ou quando a prisão se disfarça de equilíbrio. A sabedoria de discriminar.',
    ritual_recomendado:
      'Examine onde você está em extremos: excesso de auto-restrição ou excesso de indulgência? Onde quer que esteja,温柔mente traga equilíbrio como A Temperança.',
  },

  // ─── O Diabo ────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Diabo', numero_carta: 15 },
    arcano_secundario: { nome: 'O Louco', numero_carta: 0 },
    tipo_correlacao: 'transformativo',
    conexao_espiritual:
      'O Diabo representa as correntes da matéria; O Louco representa a liberdade absoluta. Este par mostra que a libertação vem quando você reconhece que as correntes são ilusórias.',
    significado_combinado:
      'Libertação através da loucura sagrada. As cadeias que prendem são construções da mente; a liberdade está no salto além delas.',
    ritual_recomendado:
      'Identifique suas "correntes" - medos, crenças limitantes, hábitos. Depois, faça algo "louco" que desafie essas correntes. Sinta a liberdade que já estava em você.',
  },

  // ─── A Torre ────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Torre', numero_carta: 16 },
    arcano_secundario: { nome: 'A Imperatriz', numero_carta: 2 },
    tipo_correlacao: 'transformativo',
    conexao_espiritual:
      'A Torre destrói a arrogância; A Imperatriz nutre a vida. A Torre remove para que A Imperatriz possa reconstruir. A Torre limpa o terreno para novo crescimento.',
    significado_combinado:
      'Destruição que prepara para criação. A queda que abre espaço para a fertilidade. O divino que destrói seus ídolos para que você possa criar algo autêntico.',
    ritual_recomendado:
      'Quando a torre cair, não entre em pânico. Espere o momento de plantar novas sementes (Imperatriz) no terreno recém-limpo.',
  },

  // ─── A Estrela ──────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Estrela', numero_carta: 17 },
    arcano_secundario: { nome: 'O Julgamento', numero_carta: 20 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'A Estrela oferece esperança; O Julgamento responde com o chamado da alma. A Estrela ilumina o caminho; O Julgamento convite para segui-lo.',
    significado_combinado:
      'Esperança que se torna chamado. A luz da estrela que guia até o momento em que a alma é chamada para despertar e responder.',
    ritual_recomendado:
      'Mantenha sua esperança viva, mesmo quando o caminho parece longo. Em algum momento, a esperança se transformará em um chamado que você não podrá ignorar.',
  },
  {
    arcano_primario: { nome: 'A Estrela', numero_carta: 17 },
    arcano_secundario: { nome: 'A Esperança', numero_carta: 17 },
    tipo_correlacao: 'reflexivo',
    conexao_espiritual:
      'A Estrela refletida em si mesma. Este par representa a esperança iluminando a esperança, o ciclo de fé que sustenta a alma através das provas.',
    significado_combinado:
      'Fé que sustenta a si mesma. A esperança que não precisa de validação externa, que brilha por dentro mesmo na mais profunda escuridão.',
    ritual_recomendado:
      'Feche os olhos e visualize uma estrela brilhando dentro do seu peito. Permita que ela ilumine seus medos e dúvidas, criando um espaço de paz infinita.',
  },

  // ─── A Lua ───────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'A Lua', numero_carta: 18 },
    arcano_secundario: { nome: 'O Sol', numero_carta: 19 },
    tipo_correlacao: 'contraste',
    conexao_espiritual:
      'A Lua oferece luz incerta, refletida e frequentemente ilusória; O Sol oferece claridad absoluta, direta e verdadeira. Juntos representam a oposição entre aparência e realidade.',
    significado_combinado:
      'Discernimento entre luz verdadeira e falsa. A capacidade de navegar pelas ilusões da Lua até encontrar a claridad do Sol. A sabedoria da Lua que encontra a verdade do Sol.',
    ritual_recomendado:
      'Pratique ver através das ilusões (Lua) até encontrar a verdad (Sol). Quando confuso, espere o amanhecer - a claridad sempre retorna.',
  },

  // ─── O Sol ───────────────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Sol', numero_carta: 19 },
    arcano_secundario: { nome: 'O Mundo', numero_carta: 21 },
    tipo_correlacao: 'progressivo',
    conexao_espiritual:
      'O Sol ilumina; O Mundo integra. O Sol é a claridad; O Mundo é a completude que vem dessa claridad. O Sol é o brilho; O Mundo é o brilho que retorna ao Uno.',
    significado_combinado:
      'Iluminação que resulta em integración. A luz do sol que permite ver a wholeness do universo, culminando na realization de que você é parte do todo.',
    ritual_recomendado:
      'Passe tempo banhando-se na luz solar. Deixe que ela ilumine cada canto de sua mente, até que você perceba que a luz e a escuridão são uma coisa só.',
  },

  // ─── O Julgamento ───────────────────────────────────────────────────────
  {
    arcano_primario: { nome: 'O Julgamento', numero_carta: 20 },
    arcano_secundario: { nome: 'A Sacerdotisa', numero_carta: 1 },
    tipo_correlacao: 'reflexivo',
    conexao_espiritual:
      'O Julgamento representa o chamado público; A Sacerdotisa representa o conhecimento oculto. Este par revela que todo julgamento público é precedido por um conhecimento silencioso.',
    significado_combinado:
      'Chamado que nasce do silêncio. A sabedoria oculta que se manifesta como chamado público. A intuição da Sacerdotisa que culmina no despertar do Julgamento.',
    ritual_recomendado:
      'Antes de qualquer decisão importante, medite em silêncio (Sacerdotisa). Quando a clarity vier, permita que ela se manifeste em ação (Julgamento).',
  },
];

// Freeze the array to prevent modifications
Object.freeze(TAROT_TAROT_MAP);

/**
 * Get a tarot-tarot correlation by primary card number
 * @param numeroCarta - The primary Major Arcana card number (0-21)
 * @returns Array of TarotTarotMapping objects where this card appears as primary
 */
export function getTarotTarotByPrimary(numeroCarta: number): TarotTarotMapping[] {
  if (!Number.isInteger(numeroCarta) || numeroCarta < 0 || numeroCarta > 21) {
    throw new Error(`Número do arcano fora do intervalo válido (0-21). Recebido: ${numeroCarta}`);
  }
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano_primario.numero_carta === numeroCarta
  );
}

/**
 * Get a tarot-tarot correlation by secondary card number
 * @param numeroCarta - The secondary Major Arcana card number (0-21)
 * @returns Array of TarotTarotMapping objects where this card appears as secondary
 */
export function getTarotTarotBySecondary(numeroCarta: number): TarotTarotMapping[] {
  if (!Number.isInteger(numeroCarta) || numeroCarta < 0 || numeroCarta > 21) {
    throw new Error(`Número do arcano fora do intervalo válido (0-21). Recebido: ${numeroCarta}`);
  }
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano_secundario.numero_carta === numeroCarta
  );
}

/**
 * Get all tarot-tarot correlations for a specific card (either primary or secondary)
 * @param numeroCarta - The Major Arcana card number (0-21)
 * @returns Array of TarotTarotMapping objects for this card
 */
export function getTarotTarotByCard(numeroCarta: number): TarotTarotMapping[] {
  if (!Number.isInteger(numeroCarta) || numeroCarta < 0 || numeroCarta > 21) {
    throw new Error(`Número do arcano fora do intervalo válido (0-21). Recebido: ${numeroCarta}`);
  }
  return TAROT_TAROT_MAP.filter(
    (m) =>
      m.arcano_primario.numero_carta === numeroCarta ||
      m.arcano_secundario.numero_carta === numeroCarta
  );
}

/**
 * Get correlations filtered by type
 * @param tipo - The correlation type to filter by
 * @returns Array of TarotTarotMapping objects matching the type
 */
export function getTarotTarotByType(
  tipo: TarotTarotMapping['tipo_correlacao']
): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.tipo_correlacao === tipo);
}

/**
 * Get a specific pair correlation
 * @param numeroPrimario - First card number (0-21)
 * @param numeroSecundario - Second card number (0-21)
 * @returns The correlation mapping or null if not found
 */
export function getTarotPair(
  numeroPrimario: number,
  numeroSecundario: number
): TarotTarotMapping | null {
  if (
    !Number.isInteger(numeroPrimario) ||
    numeroPrimario < 0 ||
    numeroPrimario > 21 ||
    !Number.isInteger(numeroSecundario) ||
    numeroSecundario < 0 ||
    numeroSecundario > 21
  ) {
    throw new Error(`Número do arcano fora do intervalo válido (0-21).`);
  }
  return (
    TAROT_TAROT_MAP.find(
      (m) =>
        (m.arcano_primario.numero_carta === numeroPrimario &&
          m.arcano_secundario.numero_carta === numeroSecundario) ||
        (m.arcano_primario.numero_carta === numeroSecundario &&
          m.arcano_secundario.numero_carta === numeroPrimario)
    ) || null
  );
}

/**
 * Get all tarot-tarot mappings
 * @returns Array of all TarotTarotMapping objects
 */
export function getAllTarotTarots(): TarotTarotMapping[] {
  return [...TAROT_TAROT_MAP];
}

/**
 * Check if two cards have a defined correlation
 * @param numeroCarta1 - First card number (0-21)
 * @param numeroCarta2 - Second card number (0-21)
 * @returns True if correlation exists
 */
export function hasTarotPair(numeroCarta1: number, numeroCarta2: number): boolean {
  return getTarotPair(numeroCarta1, numeroCarta2) !== null;
}

/**
 * Default export with all functions
 */
export default {
  getTarotTarotByPrimary,
  getTarotTarotBySecondary,
  getTarotTarotByCard,
  getTarotTarotByType,
  getTarotPair,
  getAllTarotTarots,
  hasTarotPair,
  TAROT_TAROT_MAP,
};