/**
 * Orixá-Orixá Correlation Module
 * Maps spiritual relationships between Orixás based on energy affinities, mythological connections, and ritual practices
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export type RelationshipType = 
  | 'pai_filho'    // Father-son/daughter relationship
  | 'mae_filha'    // Mother-daughter relationship
  | 'irmao_irma'   // Brother-sister relationship
  | 'conjuge'      // Spouse/partner relationship
  | 'ex_conjuge'   // Former spouse/partner relationship
  | 'aliado'       // Ally partnership
  | 'complementar' // Complementary energies
  | 'ancestral';  // Ancestral connection

export interface OrixaRelation {
  orixa: string;
  related_orixa: string;
  relationship_type: RelationshipType;
  spiritual_meaning: string;
  ritual互补?: string[];
  energy_flow?: 'bidirectional' | 'orixa_to_related' | 'related_to_orixa';
}

/**
 * Orixá to Orixá relationship mappings
 * Based on IDEIA.md - sacred relationships and mythological connections
 */
const ORIXA_ORIXA_MAP: OrixaRelation[] = [
  // Oxalá relationships (Creator Father)
  {
    orixa: 'Oxalá',
    related_orixa: 'Iemanjá',
    relationship_type: 'complementar',
    spiritual_meaning: 'Pai-Mãe divino. Oxalá representa o princípio masculino da criação, enquanto Iemanjá representa o princípio feminino das águas geradoras. Juntos formam a dualidade criadora que originou todos os Orixás. Sua união simboliza o casamento sagrado entre o éter e a água, dando origem à vida no mundo espiritual.',
    ritual互补: ['Canjica branca para ambos', 'Velas brancas', 'Tapete de boldo', 'Água do mar abençoada'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Oxalá',
    related_orixa: 'Xangô',
    relationship_type: 'pai_filho',
    spiritual_meaning: 'Oxalá é o pai de Xangô na tradição iorubá. Xangô herdou do pai o poder do fogo e a autoridade sobre os raios. Esta relação representa a transmissão da sabedoria divina e do poder real através das gerações. Xangô é considerado o filho favorito de Oxalá, recebendo sua bênção para governar com justiça.',
    ritual互补: ['Amalá para Xangô', 'Bori para Oxalá', 'Dourado e branco nas oferendas', 'Orações ancestrais'],
    energy_flow: 'orixa_to_related',
  },
  {
    orixa: 'Oxalá',
    related_orixa: 'Oxóssi',
    relationship_type: 'pai_filho',
    spiritual_meaning: 'Oxalá é o pai de Oxóssi, o caçador divino. Esta relação representa a provisão sagrada e a conexão entre o Criador e a abundância da natureza. Oxóssi recebe de Oxalá a missão de prover alimento espiritual e material para toda a comunidade, sendo a manifestação da fartura divina no mundo terrestre.',
    ritual互补: ['Flechas ornamentadas', 'Alecrim e boldo', 'Canjica para Oxalá', 'Frutas silvestres para Oxóssi'],
    energy_flow: 'orixa_to_related',
  },
  {
    orixa: 'Oxalá',
    related_orixa: 'Ogum',
    relationship_type: 'pai_filho',
    spiritual_meaning: 'Ogum é filho de Oxalá, recebendo dele a força para abrir caminhos e vencer batalhas. Esta relação representa a conexão entre a paz criadora e a energia guerreira. Ogum carrega em si a determinação paterna de fazer novos caminhos quando os antigos se fecham, usando a espada como extensão da vontade divina de Oxalá.',
    ritual互补: ['Espada consagrada', 'Boldo e guiné', 'Velas branca e vermelha', 'Aroeira como ponte'],
    energy_flow: 'orixa_to_related',
  },

  // Iemanjá relationships (Mother of Waters)
  {
    orixa: 'Iemanjá',
    related_orixa: 'Oxum',
    relationship_type: 'irmao_irma',
    spiritual_meaning: 'Iemanjá e Oxum são irmãs na tradição iorubá, ambas filhas de Olokun. Esta relação representa duas expressões da energia aquática: Iemanjá como mãe das águas profundas e Oxum como senhora das águas doces e do ouro. Juntas,她们 trazemo equilíbrio entre a vastidão do mar e a delicadeza dos rios, simbolizando a completude do elemento água.',
    ritual互补: ['Canjica na beira-mar', 'Flores brancas e rosas', 'Colônia e alcaparra', 'Banhos de mel e sal'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Iemanjá',
    related_orixa: 'Nanã',
    relationship_type: 'irmao_irma',
    spiritual_meaning: 'Iemanjá e Nanã compartilham a energia das águas, sendo ambas ligadas ao elemento água na Umbanda. Nanã é considerada a mais antiga das duas, representando a sabedoria das águas paradas e do barro primordial. Iemanjá traz a energia das águas vivas e dos mares. Esta relação une a juventude nutridora à anciã guardiã dos mistérios.',
    ritual互补: ['Barro e água de chuva', 'Folhas de assa-peixe', 'Velas lilases e azuis', 'Oferendas na lama'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Iemanjá',
    related_orixa: 'Omolu',
    relationship_type: 'mae_filha',
    spiritual_meaning: 'Na tradição umbandista, Iemanjá é mãe de Omolu, o senhor das doenças e da cura. Esta relação representa o ciclo da vida onde a mãe nutre e o filho enfrenta os desafios da existência material. Omolu traz a energia de que nada permanece eternamente, assim como as marés de Iemanjá renovam constantemente as praias.',
    ritual互补: ['Pipoca e colônia', 'Folhas de boldo e assa-peixe', 'Velas pretas e brancas', 'Banhos de limpeza pesada'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Iemanjá',
    related_orixa: 'Oxumaré',
    relationship_type: 'complementar',
    spiritual_meaning: 'Iemanjá e Oxumaré representam o ciclo eterno da água: Iemanjá como a água que desce e Oxumaré como o arco-íris que sobe ao céu. Juntos他们 completam o ciclo hidrológico espiritual, representando a transformação contínua entre estados. Oxumaré é marido de Iemanjá na tradição, simbolizando a união do princípio aquático com o princípio cíclico.',
    ritual互补: ['Água do mar', 'Arco-íris de oferendas', 'Alecrim e mastruz', 'Velas de todas as cores'],
    energy_flow: 'bidirectional',
  },

  // Oxum relationships (Wealth and Love)
  {
    orixa: 'Oxum',
    related_orixa: 'Iansã',
    relationship_type: 'irmao_irma',
    spiritual_meaning: 'Oxum e Iansã são irmãs na tradição iorubá, ambas filhas de Olokun. Oxum representa a doçura e a prosperidade das águas doces, enquanto Iansã traz a energia transformadora dos ventos e tempestades. Esta relação ensina que a abundância de Oxum pode se transformar na força guerreira de Iansã quando necessário, e vice-versa.',
    ritual互补: ['Acarajé para ambas', 'Mel e pinhão roxo', 'Velas rosa e laranja', 'Banhos de erva doce'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Oxum',
    related_orixa: 'Logun Edé',
    relationship_type: 'mae_filha',
    spiritual_meaning: 'Oxum é mãe de Logun Edé, o Orixá andrógino que carrega a beleza de Oxum e a sabedoria de Oxóssi. Esta relação representa a manifestação da harmonia entre os princípios masculino e feminino. Logun Edé herda de Oxum o magnetismo, a elegância e o amor pela beleza, representando a integração sagrada dos opostos.',
    ritual互补: ['Balangandãs', 'Flores coloridas', 'Mel e girassóis', 'Perfumes finos'],
    energy_flow: 'orixa_to_related',
  },

  // Ogum relationships (Warrior and Opener of Paths)
  {
    orixa: 'Ogum',
    related_orixa: 'Iansã',
    relationship_type: 'conjuge',
    spiritual_meaning: 'Ogum e Iansã são esposos na tradição iorubá, representando a união entre a força telúrica e a energia ígnea. Ogum abre os caminhos com sua espada, enquanto Iansã sopra os ventos da mudança. Juntos, eles garantem que os caminhos abertos sejam mantidos abertos e que as transformações necessárias ocorram com poder. Compartilham a Terça-feira como dia sagrado.',
    ritual互补: ['Espada e pinhão roxo', 'Guiné e fumo', 'Velas vermelha e laranja', 'Defumações de proteção'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Ogum',
    related_orixa: 'Oxóssi',
    relationship_type: 'irmao_irma',
    spiritual_meaning: 'Ogum e Oxóssi são irmãos na tradição iorubá, ambos filhos de Oduduwa. Ogum representa a conquista e a abertura de novos territórios, enquanto Oxóssi representa a busca pela abundância nos territórios já abertos. Esta relação simboliza a parceria entre o guerreiro que vence batalhas e o caçador que prove, garantindo sobrevivência e prosperidade.',
    ritual互补: ['Guiné e alecrim', 'Espada e flecha', 'Velas verde e vermelha', 'Inhame e frutas silvestres'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Ogum',
    related_orixa: 'Xangô',
    relationship_type: 'aliado',
    spiritual_meaning: 'Ogum e Xangô são aliados na tradição iorubá. Ogum fabricou a espada de Xangô e帮他治理王国. Esta relação representa a aliança entre o ferreiro que cria as ferramentas e o rei que as utiliza. Juntos, 他们 vencem batalhas e mantêm a ordem, sendo Ogum a força que abre caminhos e Xangô a justiça que os governa.',
    ritual互补: ['Espada de Ogum', 'Pedra de raio de Xangô', 'Aroeira e quebra-pedra', 'Velas vermelha e amarela'],
    energy_flow: 'bidirectional',
  },

  // Xangô relationships (Justice and Thunder)
  {
    orixa: 'Xangô',
    related_orixa: 'Iansã',
    relationship_type: 'ex_conjuge',
    spiritual_meaning: 'Xangô e Iansã foram esposos na tradição iorubá, tendo se separado em meio a conflitos. Esta relação representa a energia de transformação e mudança - quando a união não funciona, a separação pode trazer evolução. Iansã trouxe a Xangô a capacidade de mudança, enquanto ele lhe deu a força do raio. Embora separados, eles mantêm respeito mútuo e energia complementar.',
    ritual互补: ['Amalá e acarajé', 'Pinhão roxo e pedra de raio', 'Velas amarela e laranja', 'Defumações de proteção'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Xangô',
    related_orixa: 'Omolu',
    relationship_type: 'aliado',
    spiritual_meaning: 'Xangô e Omolu são aliados na tradição iorubá. Xangô governa com justiça no mundo material, enquanto Omolu governa sobre as doenças e curas. Esta relação representa a conexão entre a ação e a consequência - Xangô decreta e Omolu executa. Juntos, eles mantêm o equilíbrio entre o que é justo e o que é necessário para a cura.',
    ritual互补: ['Pedra de raio e pipoca', 'Quiabo e palma', 'Velas amarela e preta', 'Amalá quente'],
    energy_flow: 'bidirectional',
  },

  // Iansã relationships (Storm and Wind)
  {
    orixa: 'Iansã',
    related_orixa: 'Omolu',
    relationship_type: 'aliado',
    spiritual_meaning: 'Iansã e Omolu são aliados poderosos na Umbanda. Iansã traz as mudanças radicais e a quebra de estruturas, enquanto Omolu trabalha com as consequências dessas mudanças - a cura das feridas deixadas pelas transformações. Juntos, 他们 representam o ciclo de destruição e reconstrução, morte e renascimento, essencial para a evolução espiritual.',
    ritual互补: ['Pinhão roxo e assa-peixe', 'Fumo e ervas de limpeza', 'Velas laranja e preta', 'Defumações pesadas'],
    energy_flow: 'bidirectional',
  },

  // Omolu relationships (Disease and Healing)
  {
    orixa: 'Omolu',
    related_orixa: 'Nanã',
    relationship_type: 'pai_filho',
    spiritual_meaning: 'Omolu é filho de Nanã na tradição umbandista. Nanã é a anciã das águas paradas e do barro, tendo ensinado a Omolu os segredos das doenças e da cura através da transformação. Esta relação representa a passagem da sabedoria ancestral para a aplicação prática - Nanã guarda os mistérios e Omolu os manifesta no mundo material.',
    ritual互补: ['Barro e pipoca', 'Assa-peixe e manjericão roxo', 'Velas preta e lilás', 'Oferendas na terra'],
    energy_flow: 'related_to_orixa',
  },

  // Nanã relationships (Ancient Wisdom)
  {
    orixa: 'Nanã',
    related_orixa: 'Omolu',
    relationship_type: 'complementar',
    spiritual_meaning: 'Nanã e Omolu representam a sabedoria dos anciãos aplicada à cura. Nanã guarda os segredos do barro primordial e das águas paradas, enquanto Omolu trabalha com esses conhecimentos para curar e transformar. Esta relação ensina que a verdadeira cura vem da compreensão profunda dos processos naturais e da aceitação da impermanência.',
    ritual互补: ['Barro e água de chuva', 'Avenca e trapoeraba', 'Velas lilás e preta', 'Oferendas de humildade'],
    energy_flow: 'bidirectional',
  },

  // Oxóssi relationships (Hunter and Provider)
  {
    orixa: 'Oxóssi',
    related_orixa: 'Logun Edé',
    relationship_type: 'pai_filho',
    spiritual_meaning: 'Oxóssi é pai de Logun Edé, que representa a integração dos princípios masculino e feminino. Logun Edé herda de Oxóssi a sabedoria da caça e a conexão com a natureza, combinando-a com a beleza e o magnetismo de Oxum. Esta relação simboliza a busca espiritual completa - tanto a provisão material quanto a elevação espiritual.',
    ritual互补: ['Flecha e leque', 'Jurema e alecrim', 'Velas verde e rosa', 'Frutas e girassóis'],
    energy_flow: 'orixa_to_related',
  },
  {
    orixa: 'Oxóssi',
    related_orixa: 'Omolu',
    relationship_type: 'irmao_irma',
    spiritual_meaning: 'Oxóssi e Omolu são irmãos na tradição iorubá. Enquanto Oxóssi busca a abundância nos territórios da floresta, Omolu trabalha nos subterrâneos da existência. Esta relação representa a complementaridade entre a luz e a escuridão, entre a busca da provisão e o trabalho com as sombras necessárias para a transformação completa.',
    ritual互补: ['Guiné e samambaia', 'Pipoca e alecrim', 'Velas verde e preta', 'Ofereendas de frutas na mata'],
    energy_flow: 'bidirectional',
  },

  // Additional cross-tradition relationships
  {
    orixa: 'Oxalá',
    related_orixa: 'Orunmilá',
    relationship_type: 'complementar',
    spiritual_meaning: 'Oxalá e Orunmilá representam a sabedoria divina em suas diferentes expressões. Oxalá é o Criador que estabelece a ordem, enquanto Orunmilá é o Babalawo que revela os segredos do destino. Juntos, 他们 conectam o plano da criação ao plano da revelação, guiando a humanidade do estado de ignorância à compreensão sagrada.',
    ritual互补: ['Tapete de boldo', 'Opele de Ifá', 'Velas branca e dourada', 'Silêncio e rezas'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Iemanjá',
    related_orixa: 'Olokun',
    relationship_type: 'mae_filha',
    spiritual_meaning: 'Iemanjá é filha de Olokun na tradição iorubá. Olokun é o senhor das profundezas do oceano, o guardião dos tesouros submarinos e dos mistérios abissais. Iemanjá recebeu de Olokun o domínio sobre as águas e a capacidade de nutrir. Esta relação representa a conexão entre a superfície e as profundezas, entre o visível e o oculto.',
    ritual互补: ['Água do mar profundo', 'Colônia e alcaparra', 'Velas azul escuro e preta', 'Oferendas nas profundezas'],
    energy_flow: 'related_to_orixa',
  },
  {
    orixa: 'Exu',
    related_orixa: 'Ogum',
    relationship_type: 'irmao_irma',
    spiritual_meaning: 'Exu e Ogum são irmãos na tradição iorubá. Exu é o mensageiro que abre os caminhos da comunicação, enquanto Ogum é o guerreiro que abre os caminhos materiais. Juntos, eles garantem que todas as mensagens cheguem ao destino e que todos os caminhos estejam abertos para a ação. Sem Exu, Ogum não saberia onde lutar.',
    ritual互补: ['Guiné e arruda', 'Pinhão roxo e espada', 'Velas vermelha e preta', 'Cachaça e pirão'],
    energy_flow: 'bidirectional',
  },
  {
    orixa: 'Exu',
    related_orixa: 'Iansã',
    relationship_type: 'aliado',
    spiritual_meaning: 'Exu e Iansã são aliados fundamentais na Umbanda. Exu abre os caminhos para as spiritual energies entrarem no mundo material, enquanto Iansã sopra esses ventos de transformação. Sem Exu, Iansã não teria como manifestar suas tempestades. Sem Iansã, Exu não teria a força para mover estruturas. Juntos, 他们 garantem que a mudança seja possível.',
    ritual互补: ['Pinhão roxo e arruda', 'Fumo e bambú', 'Velas preta e laranja', 'Defumações nas encruzilhadas'],
    energy_flow: 'bidirectional',
  },
];

/**
 * Get the relationship between two Orixás
 * @param orixa - Primary Orixá name
 * @param related_orixa - Related Orixá name
 * @returns OrixaRelation or undefined if no relationship exists
 */
export function getOrixaOrixa(orixa: string, related_orixa: string): OrixaRelation | undefined {
  const normalize = (s: string) => s.trim().toLowerCase();
  return ORIXA_ORIXA_MAP.find(
    rel =>
      (normalize(rel.orixa) === normalize(orixa) && normalize(rel.related_orixa) === normalize(related_orixa)) ||
      (normalize(rel.orixa) === normalize(related_orixa) && normalize(rel.related_orixa) === normalize(orixa))
  );
}

/**
 * Get all relationships for a specific Orixá
 * @param orixa - Orixá name
 * @returns Array of OrixaRelation objects where the Orixá appears
 */
export function getAllOrixaRelations(orixa: string): OrixaRelation[] {
  const normalize = (s: string) => s.trim().toLowerCase();
  return ORIXA_ORIXA_MAP.filter(
    rel => normalize(rel.orixa) === normalize(orixa) || normalize(rel.related_orixa) === normalize(orixa)
  );
}

/**
 * Get all Orixá-Orixá relationships
 * @returns Array of all OrixaRelation objects
 */
export function getAllOrixaOrixas(): OrixaRelation[] {
  return ORIXA_ORIXA_MAP;
}

/**
 * Get relationships by type
 * @param type - Relationship type filter
 * @returns Array of OrixaRelation objects of the specified type
 */
export function getRelationshipsByType(type: RelationshipType): OrixaRelation[] {
  return ORIXA_ORIXA_MAP.filter(rel => rel.relationship_type === type);
}

/**
 * Get Orixás that have bidirectional energy flow with a given Orixá
 * @param orixa - Orixá name
 * @returns Array of related Orixás with bidirectional energy
 */
export function getBidirectionalOrixas(orixa: string): string[] {
  const normalize = (s: string) => s.trim().toLowerCase();
  const normalizedOrixa = normalize(orixa);
  return ORIXA_ORIXA_MAP
    .filter(
      rel =>
        (normalize(rel.orixa) === normalizedOrixa || normalize(rel.related_orixa) === normalizedOrixa) &&
        rel.energy_flow === 'bidirectional'
    )
    .map(rel => (normalize(rel.orixa) === normalizedOrixa ? rel.related_orixa : rel.orixa));
// Required aliases per acceptance criteria
export const getOrixaOrixas = getAllOrixaOrixas;
export const getAllOrixaRellations = getAllOrixaRelations;
export default {
  getOrixaOrixa,
  getAllOrixaRelations,
  getAllOrixaOrixas,
  getRelationshipsByType,
  getBidirectionalOrixas,
  getOrixaOrixas,
  getAllOrixaRellations,
};