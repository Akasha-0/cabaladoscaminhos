/**
 * Ancestor data module
 * Provides ancestral lineage and wisdom data for the Cabala dos Caminhos system
 */

export interface AncestorLineage {
  id: string;
  name: string;
  namePt: string;
  origin: string;
  qualities: string[];
  teachings: string[];
  guidance: string[];
}

export interface AncestorWisdom {
  id: string;
  theme: string;
  themePt: string;
  teachings: string[];
  practices: string[];
  affirmation: string;
  affirmationPt: string;
}

export function getData(): {
  lineages: AncestorLineage[];
  wisdom: AncestorWisdom[];
} {
  return {
    lineages: [
      {
        id: ' lineage-prophetic',
        name: 'Linhagem Profética',
        namePt: 'Linhagem Profética',
        origin: 'Tradições visionárias e mediúnicas',
        qualities: ['Intuição elevada', 'Visão clara', 'Comunicação espiritual', 'Discernimento'],
        teachings: [
          'O dom da visão interior supera todas as externe',
          'A profecia emerge da escuta silenciosa da alma',
          'O futuro se revela àqueles que sabem esperar'
        ],
        guidance: [
          'Pratique a meditação em silêncio profundo',
          'Cultive a paciência e a observação',
          'Honre seus sonhos como mensagens'
        ]
      },
      {
        id: 'lineage-healing',
        name: 'Linhagem de Cura',
        namePt: 'Linhagem de Cura',
        origin: 'Tradições xamânicas e holísticas',
        qualities: ['Energia curativa', 'Compaixão profunda', 'Sabedoria medicinal', 'Restauração'],
        teachings: [
          'A cura começa no reconhecimento da wholeness',
          'O corpo é templo e o espírito é a luz que o habita',
          'Receber cura é permitir que a energia flua'
        ],
        guidance: [
          'Trabalho com cristais e ervas sagradas',
          'Pratique imposição de mãos',
          'Honre o corpo como instrumento sagrado'
        ]
      },
      {
        id: 'lineage-sacred-fire',
        name: 'Linhagem do Fogo Sagrado',
        namePt: 'Linhagem do Fogo Sagrado',
        origin: 'Tradições de mistérios solares e Firekeepers',
        qualities: ['Transmutação', 'Purificação', 'Vitalidade', 'Inspiração'],
        teachings: [
          'O fogo consome o que não serve e revela o essencial',
          'A chama interior nunca se apaga',
          'A transformação acontece no ventre do fogo'
        ],
        guidance: [
          'Pratique rituais com fogo controlado',
          'Medite visualizando a chama interna',
          'Honre o elemento fire em todas as formas'
        ]
      },
      {
        id: 'lineage-earth-keepers',
        name: 'Linhagem dos Guardiões da Terra',
        namePt: 'Linhagem dos Guardiões da Terra',
        origin: 'Tradições indígenas e telúricas',
        qualities: ['Ancoramento', 'Sabedoria natural', 'Conexão planetária', 'Sustentação'],
        teachings: [
          'A Terra é nossa mãe e nós somos seus filhos',
          'O ancoramento traz paz e clareza',
          'Tudo que a natureza oferece é um presente'
        ],
        guidance: [
          'Passe tempo em contato com a natureza',
          'Pratique caminhadas conscientes na terra',
          'Honre os ciclos naturais'
        ]
      },
      {
        id: 'lineage-light-workers',
        name: 'Linhagem dos Trabalhadores da Luz',
        namePt: 'Linhagem dos Trabalhadores da Luz',
        origin: 'Tradições ascensionistas e angélicas',
        qualities: ['Luz interior', 'Proteção divina', 'Elevação', 'Channeling'],
        teachings: [
          'A luz que habita em você é maior que qualquer escuridão',
          'Você veio para iluminar o caminho',
          'A proteção divina é seu direito de nascença'
        ],
        guidance: [
          'Pratique visualizações de luz dourada',
          'Trabalhe com mantras de proteção',
          'Coneecte-se com seus guias de luz'
        ]
      },
      {
        id: 'lineage-mystics',
        name: 'Linhagem dos Místicos',
        namePt: 'Linhagem dos Místicos',
        origin: 'Tradições contemplativas e sufis',
        qualities: ['União divina', 'Amor incondicional', 'Devoção', 'Êxtase sagrado'],
        teachings: [
          'A separação é ilusão; todos somos um',
          'O amor é a força mais poderosa do universo',
          'Na entrega há Libertação'
        ],
        guidance: [
          'Pratique a contemplação silenciosa',
          'Cultive o amor por todos os seres',
          'Sintonize-se com a presença divine'
        ]
      }
    ],
    wisdom: [
      {
        id: 'wisdom-lineage',
        theme: 'Lineage & Heritage',
        themePt: 'Linhagem e Legado',
        teachings: [
          'Seus ancestrais vivem através de você',
          'O sangue carrega sabedoria de gerações',
          'Você é o guardião de um legado sagrado'
        ],
        practices: [
          'Rituais de abertura de linha ancestral',
          'Meditações de conexão com ancestrais',
          'Honra aos mortos em datas sagradas'
        ],
        affirmation: 'I honor my ancestors and carry their wisdom forward with grace',
        affirmationPt: 'Eu honro meus ancestrais e carrego sua sabedoria adiante com graça'
      },
      {
        id: 'wisdom-healing-ancestral',
        theme: 'Ancestral Healing',
        themePt: 'Cura Ancestral',
        teachings: [
          'Padrões herdados podem ser transmutados',
          'A cura dos antepassados libera as gerações futuras',
          'Perdoar aos ancestrais liberta você e a eles'
        ],
        practices: [
          'Rituais de perdão ancestral',
          'Meditações de libertação de padrões',
          'Terapia de constelação familiar'
        ],
        affirmation: 'I release ancestral patterns that no longer serve my highest good',
        affirmationPt: 'Eu libero padrões ancestrais que não servem mais meu maior bem'
      },
      {
        id: 'wisdom-wisdom-keepers',
        theme: 'Wisdom Keepers',
        themePt: 'Guardiões da Sabedoria',
        teachings: [
          'Os anciãos detêm sabedoria que transcende o tempo',
          'A humildade abre as portas do conhecimento ancestral',
          'Você é um guardião tanto quanto um herdeiro'
        ],
        practices: [
          'Diálogos imaginários com anciãos',
          'Estudo de tradições ancestrais',
          'Ensinar o que aprendeu a outros'
        ],
        affirmation: 'I receive the wisdom of the elders and pass it forward with gratitude',
        affirmationPt: 'Eu recebo a sabedoria dos anciãos e a transmito com gratidão'
      },
      {
        id: 'wisdom-sacred-contracts',
        theme: 'Soul Contracts',
        themePt: 'Contratos de Alma',
        teachings: [
          'Você tem acordos sagrados com almas aparentadas',
          'Algumas almas concordaram em se encontrar nesta vida',
          'Contratos de alma transcendem famílias biológicas'
        ],
        practices: [
          'Meditações de reconhecimento de almas aparentadas',
          'Rituais de cumprimento de contratos',
          'Journaling sobre conexões soul profundas'
        ],
        affirmation: 'I honor my soul contracts and welcome those meant to cross my path',
        affirmationPt: 'Eu honro meus contratos de alma e acolho aqueles destinados a cruzar meu caminho'
      }
    ]
  };
}
