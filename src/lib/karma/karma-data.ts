/**
 * Karma data module
 * Provides spiritual evolution data for the Cabala dos Caminhos system
 */

export interface KarmaData {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  associatedPaths: string[];
  cycle: string;
  lessons: string[];
}

export interface KarmaCycle {
  phase: string;
  description: string;
  duration: string;
}

export function getData(): {
  karmaRecords: KarmaData[];
  cycles: KarmaCycle[];
} {
  return {
    karmaRecords: [
      {
        id: "karma-1",
        name: "Karma da Libertação",
        description: "Caminho de transformação através da soltura de padrões antigos e crenças limitantes",
        characteristics: [
          "Desapego material",
          "Renúncia consciente",
          "Libertação de traumas",
          "Transição espiritual"
        ],
        associatedPaths: ["caminho-do-amor", "caminho-da-sabedoria"],
        cycle: "renovacao",
        lessons: [
          "Aceitar a impermanência",
          "Confiar no processo de soltar",
          "Encontrar liberdade na simplicidade"
        ]
      },
      {
        id: "karma-2",
        name: "Karma do Dever",
        description: "Caminho de cumprimento de responsabilidades cósmicas e acordos sagrados",
        characteristics: [
          "Compromisso espiritual",
          "Responsabilidade compartilhada",
          "Lealdade cósmica",
          "Serviço dedicado"
        ],
        associatedPaths: ["caminho-da-acao", "caminho-da-sabedoria"],
        cycle: "cumprimento",
        lessons: [
          "Honrar compromissos",
          "Servir com excelência",
          "Manter integridade sob pressão"
        ]
      },
      {
        id: "karma-3",
        name: "Karma da Criação",
        description: "Caminho de manifestação e births criativos no plano físico e espiritual",
        characteristics: [
          "Manifestação consciente",
          "Criação artística",
          "Geração de vida",
          "Expressão autêntica"
        ],
        associatedPaths: ["caminho-da-acao", "caminho-da-uniao"],
        cycle: "nascimento",
        lessons: [
          "Canalizar energia criativa",
          "Manifestar intenções",
          "Nutrir o novo"
        ]
      },
      {
        id: "karma-4",
        name: "Karma da União",
        description: "Caminho de integração e reconciliação de opostos dentro da alma",
        characteristics: [
          "Integração de sombras",
          "Harmonização de opostos",
          "Reconciliação interna",
          " wholeness completa"
        ],
        associatedPaths: ["caminho-da-uniao", "caminho-do-amor"],
        cycle: "integracao",
        lessons: [
          "Aceitar a dualidade",
          "Integrar sombras",
          "Encontrar wholeness"
        ]
      },
      {
        id: "karma-5",
        name: "Karma da Sabedoria",
        description: "Caminho de conhecimento íntimo e compreensão profunda da verdade",
        characteristics: [
          "Discernimento",
          "Sabedoria prática",
          "Compreensão profunda",
          "Conhecimento íntimo"
        ],
        associatedPaths: ["caminho-da-sabedoria", "caminho-do-amor"],
        cycle: "consolidacao",
        lessons: [
          "Discernir a verdade",
          "Integrar conhecimento",
          "Viver com sabedoria"
        ]
      },
      {
        id: "karma-6",
        name: "Karma do Amor",
        description: "Caminho de expansão do coração e conexão universal",
        characteristics: [
          "Compaixão infinita",
          "Aceitação incondicional",
          "Conexão universal",
          "Amor transcedente"
        ],
        associatedPaths: ["caminho-do-amor", "caminho-da-uniao"],
        cycle: "expansao",
        lessons: [
          "Abrir o coração",
          "Aceitar o outro",
          "Amar sem condições"
        ]
      },
      {
        id: "karma-7",
        name: "Karma da Ação",
        description: "Caminho de movimento e transformação através da prática",
        characteristics: [
          "Iniciativa",
          "Determinação",
          "Transformação ativa",
          "Progresso intencional"
        ],
        associatedPaths: ["caminho-da-acao", "caminho-da-criacao"],
        cycle: "movimento",
        lessons: [
          "Agir com propósito",
          "Perseverar na jornada",
          "Transformar pela prática"
        ]
      }
    ],
    cycles: [
      {
        phase: "renovacao",
        description: "Fase de soltar o antigo para dar espaço ao novo",
        duration: "variavel conforme trabalho interno"
      },
      {
        phase: "cumprimento",
        description: "Fase de ação responsável sobre acordos estabelecidos",
        duration: "ciclos de 7 anos aproximadamente"
      },
      {
        phase: "nascimento",
        description: "Fase de criação e manifestação de novas possibilidades",
        duration: "momento presente e transitorio"
      },
      {
        phase: "integracao",
        description: "Fase de harmonização e wholeness dos opostos",
        duration: "trabalho continuo ao longo da vida"
      },
      {
        phase: "consolidacao",
        description: "Fase de integração e aplicação do conhecimento adquirido",
        duration: "anni de maturacao espiritual"
      },
      {
        phase: "expansao",
        description: "Fase de abertura e crescimento além dos limites conhecidos",
        duration: "processo continuo de abertura"
      },
      {
        phase: "movimento",
        description: "Fase de ação transformadora e progresso intencional",
        duration: "dinamico e orientado por intenção"
      }
    ]
  };
}