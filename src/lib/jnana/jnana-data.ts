/**
 * Jnana data module
 * Provides spiritual wisdom and knowledge data for the Cabala dos Caminhos system
 */

export interface JnanaWisdom {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  associatedPaths: string[];
  practice: string;
  teachings: string[];
}

export interface JnanaStage {
  phase: string;
  description: string;
  duration: string;
}

export function getData(): {
  wisdomRecords: JnanaWisdom[];
  stages: JnanaStage[];
} {
  return {
    wisdomRecords: [
      {
        id: "jnana-1",
        name: "Jnana da Auto-Realização",
        description: "Caminho de conhecimento direto da natureza verdadeira do ser",
        characteristics: [
          "Discernimento entre real e ilusório",
          "Compreensão da natureza transitória",
          "Recognição do eu infinito",
          "Libertação da ignorância"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-uniao"],
        practice: "sravana-manana-nididhyasana",
        teachings: [
          "Tu és o Absoluto",
          "A realidade última é Brahman",
          "O eu é idéntico ao divino"
        ]
      },
      {
        id: "jnana-2",
        name: "Jnana da Impermanência",
        description: "Caminho de compreensão da natureza mutável de toda existência",
        characteristics: [
          "Anicca (impermanência)",
          "Soltura de apegos",
          "Aceitação da mudança",
          "Presença no momento"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-acao"],
        practice: "vipassana",
        teachings: [
          "Tudo surge e tudo cessa",
          "A única constante é a mudança",
          "O presente é a única realidade"
        ]
      },
      {
        id: "jnana-3",
        name: "Jnana da Não-Dualidade",
        description: "Caminho de reconhecimento da unidade fundamental de toda existência",
        characteristics: [
          "Advaita (não-dualismo)",
          "Integração do outro",
          "Dissolução de fronteiras",
          "Experiência da wholeness"
        ],
        associatedPaths: ["caminho-da-uniao", "caminho-da-sabedoria"],
        practice: "advaita-sadhana",
        teachings: [
          "O uno e o many sao expressões do mesmo",
          "Nao existe separação última",
          "A diversidade é manifestacao da unidade"
        ]
      },
      {
        id: "jnana-4",
        name: "Jnana do Discernimento",
        description: "Caminho de separacao entre o eterno e o transitório",
        characteristics: [
          "Viveka (discriminacao)",
          "Clareza mental",
          "Percepcao sutil",
          "Sabedoria discriminativa"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-acao"],
        practice: "viveka-bhyasa",
        teachings: [
          "Discerne o real do irreal",
          "O imutavel existe além das aparências",
          "A mente pode conhecer a verdade"
        ]
      },
      {
        id: "jnana-5",
        name: "Jnana da Consciência Pura",
        description: "Caminho de reconhecimento da consciencia como principio ultimo",
        characteristics: [
          "Pure consciousness",
          "Witness awareness",
          "Self-luminous nature",
          "Clear knowing"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-uniao"],
        practice: "atma-vichara",
        teachings: [
          "A consciência é sempre presente",
          "O testemunho observa tudo",
          "A natureza da mente é luz"
        ]
      },
      {
        id: "jnana-6",
        name: "Jnana da Libertação",
        description: "Caminho de despertar para a liberdade inherente",
        characteristics: [
          "Liberacao da mente",
          "Beyond concepts",
          "Direct experience",
          "Spontaneous wisdom"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-do-amor"],
        practice: "moksha-sadhana",
        teachings: [
          "A liberdade ja existe",
          "Nao ha nada a alcançar",
          "O despertar e natural"
        ]
      },
      {
        id: "jnana-7",
        name: "Jnana da Integracao",
        description: "Caminho de harmonizacao entre conhecimento e experiencia",
        characteristics: [
          "Sabedoria vivida",
          "Knowledge embodied",
          "Understanding integrated",
          "Wisdom in action"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-criacao"],
        practice: "jnana-yoga-integration",
        teachings: [
          "O saber deve ser vivido",
          "A prática revela a verdade",
          "Integrar conhecimento e vida"
        ]
      }
    ],
    stages: [
      {
        phase: "sravana",
        description: "Fase de escuta e estudo das escrituras e ensinamentos",
        duration: "ao longo da vida de aprendizado"
      },
      {
        phase: "manana",
        description: "Fase de reflexão e contemplação dos ensinamentos",
        duration: "trabalho contínuo de digestão mental"
      },
      {
        phase: "nididhyasana",
        description: "Fase de meditação profunda e realização direta",
        duration: "processo de integração existencial"
      },
      {
        phase: "sakshatkara",
        description: "Fase de experiência direta da verdade",
        duration: "momento de despertar"
      },
      {
        phase: "brahma-sakshatkara",
        description: "Fase de realização do Brahman como experiência vivida",
        duration: "estágio de jivan-mukti"
      },
      {
        phase: "jnana-siddhi",
        description: "Fase de perfeita sabedoria e libertação total",
        duration: "estado de consciência suprema"
      },
      {
        phase: "parama-hansa",
        description: "Fase de absoluta consciência divina",
        duration: "uniao eterna com o Absoluto"
      }
    ]
  };
}