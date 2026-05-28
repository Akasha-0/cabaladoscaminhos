// @ts-nocheck
// SKIP_LINT

/**
 * Omale Data Module
 * Spiritual data for Omale, the orixá of destiny, primordial creation, and divine providence
 */

export interface OmaleData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  destinyPrinciples: string[];
  creationMyth: string;
  providenceAspects: ProvidenceData[];
}

export interface ProvidenceData {
  aspect: string;
  description: string;
  practice: string;
}

const OMALE_DATA: OmaleData = {
  id: "omale",
  name: "Omale",
  namePortuguese: "Omalé",
  path: "O Arquiteto do Destino e a Mão Invisivel",
  element: "providencia",
  colors: ["dourado", "branco", "prata"],
  dayOfWeek: "terca-feira",
  numbersSacred: [3, 7, 12, 21],
  greeting: "Eêê Omale!",
  archetype: "Destino, Criacao Primordial e Providencia Divina",
  qualities: [
    "destino",
    "providencia",
    "criacao",
    "sabedoria eterna",
    "justica divina",
    "misericordia",
    "ordem cosmica",
    "conhecimento secreto"
  ],
  challenges: [
    "rigidez do destino",
    "fatalismo",
    "dificuldade em aceitar o invisivel",
    "separacao entre mundo espiritual e material"
  ],
  rulingPlanet: "Sol e Lua",
  sacredAnimals: ["falcao", "coruja branca", "serpente primordial"],
  plants: ["mandioca sagrada", "planta do destino", "ervas de protecao"],
  offerings: ["akara", "mel", "farinha de mandioca", "agua de coco", "flores brancas"],
  chants: ["Ora Omale", "Omale Eê", "Destino eh Lei"],
  symbols: ["enigma", "chave do destino", "corda de mandanga", "olho que tudo ve"],
  mythology:
    "Omale e a forca divina que tecendo os fios do destino, ordena o universo. E considerado o arquiteto invisivel que establece as LEIS que governam toda existencia. Como a mao que nao se ve mas faz, Omale trabalha nos bastidores da vida, determinando nascimentos, encontros e sinas. Esta entidade representa a suma sabiduria que conhece o principio e o fim de todas as coisas, guiando cada ser pelo caminho que lhe foi designado desde a eternidade.",
  spiritualLesson:
    "O destino nao e uma corrente que nos prende, mas uma linha que nos guia. Aceitar a vontade divina nao significa/passividade, mas sim comprender que existe uma ordem superior que nos leva ao nosso verdadeiro proposito. Conhecer Omale e conhecer a si mesmo.",
  affirmation:
    "Meu destino estawritten em luz dourada. Aceito minha path com sabedoria e courage, sabendo que cada passo e uma lição sagrada.",
  meditation:
    "Permaneça em silencio absoluto. Visualize os fios dourados do destino entrelaçando-se ao seu redor. Sinta a presença invisivel de Omale, a mao que tudo ordena, e pede iluminação para compreender seu caminho.",
  destinyPrinciples: [
    "Tudo foi escrito antes do tempo",
    "O destino se manifesta atraves das escolhas",
    "Conhecer o destino e transforma-lo",
    "A morte e apenas uma virgula no texto eterno",
    "Cada encontro tem um proposito escondido",
    "Aprovacao e rechazo fazem parte do plano",
    "O livre arbitrio opera dentro dos limites do destino"
  ],
  creationMyth:
    "No principio, existia apenas Omale. Com a palavra, tecendo fios de luz e sombra, criou o universo e a tudo que nele ha. Cada ser recebeu sua mandanga - seu destino escrito em，银色e dourado. Os orixas nasceram como reflexos de sua luz, cada um carregando um fragmento de seu poder. Entre os orixas e os seres humanos, Omale colocou o tempo e o espaco, tecendo encontros e desencontros que formariam a grande tapeçaria da existencia.",
  providenceAspects: [
    {
      aspect: "Destino Escrito",
      description: "A capacidade de conhecer e aceitar o caminho traçado pela eternidade",
      practice: "Consultar a Ifa para compreender a mandanga e aceitar o que nao pode ser mudado"
    },
    {
      aspect: "Providencia Invisivel",
      description: "A forca que age nos bastidores para guiar os passos do ser",
      practice: "Fazer oferendas de mel e farinha para solicitar a protecao de Omale"
    },
    {
      aspect: "Ordem Cosmica",
      description: "O equilibrio que sustenta toda a existencia atraves de leyes sagradas",
      practice: "Manter rituals diarios de gratidao e respeito pela ordem universal"
    },
    {
      aspect: "Sina e Contra-Sina",
      description: "O jogo entre o que foi destined e o que pode ser transformado",
      practice: "Estudar os odus de Ifa para descobrir como navegar entre destino e escolha"
    },
    {
      aspect: "Misericordia Divina",
      description: "A capacidade de Omale de modificar destinos quando há arrependimento sincero",
      practice: "Fazer ebos de reconciliação quando o caminho parece bloqueado"
    }
  ]
};

export function getData(): OmaleData {
  return OMALE_DATA;
}

export function getDataById(id: string): OmaleData | undefined {
  return id === 'omale' ? OMALE_DATA : undefined;
}

export function getDestinyPrinciples(): string[] {
  return OMALE_DATA.destinyPrinciples;
}

export function getProvidenceAspects(): ProvidenceData[] {
  return OMALE_DATA.providenceAspects;
}

export function getOmaleByArchetype(archetype: string): OmaleData | undefined {
  return OMALE_DATA.archetype.toLowerCase().includes(archetype.toLowerCase()) ? OMALE_DATA : undefined;
}