// @ts-nocheck
 

export interface ReikiSymbol {
  id: number;
  name: string;
  japaneseName: string;
  meaning: string;
  level: number;
  power: string;
  color: string;
  healingFocus: string[];
  activation: string;
  description: string;
}

const symbols: ReikiSymbol[] = [
  {
    id: 1,
    name: "Cho Ku Rei",
    japaneseName: "兆",
    meaning: "Power Symbol",
    level: 1,
    power: "Energia",
    color: "Vermelho",
    healingFocus: ["ativação", "proteção", "amplificação"],
    activation: "Desenhe horizontalmente da esquerda para a direita",
    description: "Símbolo de poder e amplificação. Usado para aumentar a energia em qualquer situação."
  },
  {
    id: 2,
    name: "Sei He Ki",
    japaneseName: "聖",
    meaning: "Mental/Emotional Symbol",
    level: 2,
    power: "Harmonização",
    color: "Azul",
    healingFocus: ["mente", "emoções", "purificação"],
    activation: "Desenhe verticalmente de cima para baixo",
    description: "Símbolo de harmonização mental e emocional. Usado para limpar padrões negativos e traumas."
  },
  {
    id: 3,
    name: "Hon Sha Ze Sho Nen",
    japaneseName: "本舍砂常念",
    meaning: "Distance Symbol",
    level: 2,
    power: "Distância",
    color: "Branco",
    healingFocus: ["distanciamento", "tempo", "espaço"],
    activation: "Desenhe em movimento circular",
    description: "Símbolo de distância atemporal. Usado para enviar Reiki a qualquer pessoa, lugar ou tempo."
  },
  {
    id: 4,
    name: "Dai Ko Myo",
    japaneseName: "大光明",
    meaning: "Master Symbol",
    level: 3,
    power: "Mestria",
    color: "Dourado",
    healingFocus: ["mestria", "iluminação", "transformação"],
    activation: "Desenhe em forma de coroa acima da cabeça",
    description: "Símbolo do mestre. Usado para despertar a consciência superior e acesso à energia divina."
  },
  {
    id: 5,
    name: "Raku",
    japaneseName: "楽",
    meaning: "Fire Serpent Symbol",
    level: 3,
    power: "Ascensão",
    color: "Laranja",
    healingFocus: ["kundalini", "ascensão", "canalização"],
    activation: "Desenhe em espiral ascendente",
    description: "Símbolo da serpente de fogo. Usado para ativar o fluxo ascendente de energia Kundalini."
  },
  {
    id: 6,
    name: "Shanti",
    japaneseName: "涅槃寂静",
    meaning: "Peace Symbol",
    level: 1,
    power: "Paz",
    color: "Azul Claro",
    healingFocus: ["paz", "tranquilidade", "calma"],
    activation: "Desenhe horizontalmente com movimento suave",
    description: "Símbolo de paz. Usado para trazer tranquilidade e harmonia ao ambiente e às pessoas."
  },
  {
    id: 7,
    name: "Tam",
    japaneseName: "多",
    meaning: "Three Treasure Symbol",
    level: 2,
    power: "Proteção Completa",
    color: "Prata",
    healingFocus: ["proteção", "equilíbrio", "integridade"],
    activation: "Desenhe em triângulo ascendente",
    description: "Símbolo dos três tesouros. Usado para proteção completa em todos os níveis do ser."
  },
  {
    id: 8,
    name: "Karuna",
    japaneseName: "迦楼羅",
    meaning: "Compassion Symbol",
    level: 4,
    power: "Compaixão",
    color: "Rosa",
    healingFocus: ["compaixão", "amor incondicional", "cura profunda"],
    activation: "Desenhe em forma de coração com raios",
    description: "Símbolo de compaixão. Usado para cura profunda através do amor incondicional e compaixão."
  },
  {
    id: 9,
    name: "Chee Lun She",
    japaneseName: "麒麟蛇",
    meaning: "Dragon Symbol",
    level: 4,
    power: "Poder Ancestral",
    color: "Verde",
    healingFocus: ["poder ancestral", "sabedoria", "transformação"],
    activation: "Desenhe em forma espiral ascendente",
    description: "Símbolo do dragão. Usado para acessar poderes ancestrais e transformação alquímica."
  },
  {
    id: 10,
    name: "Satya",
    japaneseName: "真理",
    meaning: "Truth Symbol",
    level: 3,
    power: "Verdade",
    color: "Branco Perolado",
    healingFocus: ["verdade", "clareza", "discernimento"],
    activation: "Desenhe verticalmente com movimento duplo",
    description: "Símbolo da verdade. Usado para revelar verdades ocultas e limpar enganos."
  }
];

export function getSymbols(): ReikiSymbol[] {
  return symbols;
}

export function getSymbolById(id: number): ReikiSymbol | undefined {
  return symbols.find((s) => s.id === id);
}

export function getSymbolByName(name: string): ReikiSymbol | undefined {
  return symbols.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function getSymbolsByLevel(level: number): ReikiSymbol[] {
  return symbols.filter((s) => s.level === level);
}

export function getSymbolsByPower(power: string): ReikiSymbol[] {
  return symbols.filter((s) => s.power.toLowerCase() === power.toLowerCase());
}