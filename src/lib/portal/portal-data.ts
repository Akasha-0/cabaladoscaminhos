/**
 * Portal data module
 * Provides mystical portal gateway data for the Cabala dos Caminhos system
 */

export interface PortalData {
  id: string;
  name: string;
  description: string;
  dimensions: string[];
  associatedPaths: string[];
  energy: string;
  symbols: string[];
  access: string;
}

export interface PortalDimension {
  realm: string;
  frequency: string;
  purpose: string;
}

export function getData(): {
  portals: PortalData[];
  dimensions: PortalDimension[];
} {
  return {
    portals: [
      {
        id: "portal-1",
        name: "Portal da Ascensão",
        description: "Gateway dimensional para elevação espiritual e consciência superior",
        dimensions: ["eterico", "celestial", "divino"],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-acao"],
        energy: "ascendente",
        symbols: ["estrela", "luz", "coroa"],
        access: "meditacao profunda"
      },
      {
        id: "portal-2",
        name: "Portal da Transformação",
        description: "Passagem para renovação interior e metamorfose da alma",
        dimensions: ["caos", "ordem", "equilibrio"],
        associatedPaths: ["caminho-do-amor", "caminho-da-acao"],
        energy: "transformadora",
        symbols: ["fenix", "borboleta", "espiral"],
        access: "ritual de passagem"
      },
      {
        id: "portal-3",
        name: "Portal da Memória Cósmica",
        description: "Conexão com registros akashicos e sabedoria ancestral",
        dimensions: ["passado", "presente", "futuro"],
        associatedPaths: ["caminho-da-sabedoria", "caminho-da-luz"],
        energy: "receptiva",
        symbols: ["olho", "espirito", "conhecimento"],
        access: "estado alterado"
      },
      {
        id: "portal-4",
        name: "Portal do Despertar",
        description: "Entrada para consciência expandida e despertação interior",
        dimensions: ["consciencia", "lucidez", "realidade"],
        associatedPaths: ["caminho-da-luz", "caminho-da-mistica"],
        energy: "iluminadora",
        symbols: ["sol", "aurora", "claridade"],
        access: "pranayama"
      },
      {
        id: "portal-5",
        name: "Portal da União",
        description: "Gateway para integração com o divino e unidade cósmica",
        dimensions: ["individual", "coletivo", "universal"],
        associatedPaths: ["caminho-do-amor", "caminho-da-mistica"],
        energy: "unificadora",
        symbols: ["coracao", "infinito", "cruz"],
        access: "devocao"
      },
      {
        id: "portal-6",
        name: "Portal da Cura",
        description: "Passagem para reequilíbrio energético e cura multidimensional",
        dimensions: ["fisico", "emocional", "espiritual"],
        associatedPaths: ["caminho-da-luz", "caminho-da-acao"],
        energy: "restauradora",
        symbols: ["agua", "flor", "cristal"],
        access: "energia receptiva"
      },
      {
        id: "portal-7",
        name: "Portal da Manifestação",
        description: "Canal para criação da realidade e materialização de intenções",
        dimensions: ["pensamento", "emocao", "acao"],
        associatedPaths: ["caminho-da-acao", "caminho-da-mistica"],
        energy: "criativa",
        symbols: ["triangulo", "piramide", "estrelas"],
        access: "visualizacao"
      }
    ],
    dimensions: [
      {
        realm: "eterico",
        frequency: "alta",
        purpose: "Elevacao espiritual"
      },
      {
        realm: "celestial",
        frequency: "muito alta",
        purpose: "Conexao divina"
      },
      {
        realm: "caos",
        frequency: "instavel",
        purpose: "Transformacao"
      },
      {
        realm: "ordem",
        frequency: "estavel",
        purpose: "Estrutura"
      },
      {
        realm: "consciencia",
        frequency: "expandida",
        purpose: "Despertar"
      },
      {
        realm: "divino",
        frequency: "transcendente",
        purpose: "Uniao com o todo"
      },
      {
        realm: "fisico",
        frequency: "baixa",
        purpose: "Manifestacao material"
      },
      {
        realm: "emocional",
        frequency: "media",
        purpose: "Processamento feeling"
      },
      {
        realm: "espiritual",
        frequency: "vibratoria",
        purpose: "Evolucao da alma"
      }
    ]
  };
}