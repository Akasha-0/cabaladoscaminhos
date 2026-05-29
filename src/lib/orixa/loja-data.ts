// @ts-nocheck

/**
 * Loja Data Module
 * Comprehensive spiritual data for Loja
 */

export interface LojaData {
  nome: string;
  nomePortugues: string;
  categoria: string;
  caminho: string;
  elementos: string[];
  meses: string[];
  dias: string[];
  orixasRelacionados: string[];
  flores: string[];
  ebós: string[];
  quizilas: string[];
  mensagens: string[];
  significado: {
    geral: string;
    espiritual: string;
    material: string;
  };
  qualidade: string;
  regencia: string;
  cores: string[];
  pedras: string[];
  alimentos: string[];
  numSagrado: number[];
  planeta: string;
  chakra: string;
  sefirot: string[];
  tarot: string[];
  direcao: string;
  periodo: string;
}

export const LOJA_DATA: LojaData = {
  nome: "Loja",
  nomePortugues: "Loja",
  categoria: "Orixá",
  caminho: "Candomblé",
  elementos: ["Terra", "Água"],
  meses: ["Setembro", "Outubro"],
  dias: ["Segunda-feira"],
  orixasRelacionados: ["Oxum", "Iemanjá", "Obá"],
  flores: ["Rosa amarela", "Girassol", "Cróton"],
  ebós: [
    "Água de côco",
    "Melancia",
    "Flores amarelas",
    "Dende",
    "Farinha de mandioca"
  ],
  quizilas: [
    "Não comer porco",
    "Não comer foods rígidos",
    "Evitar bebidas alcóolicas",
    "Não pisar em terreiro de fuera"
  ],
  mensagens: [
    "Loja traz a sabedoria da terra fértil",
    " Seus pedidos são ouvids quando feitos com humildade",
    "A paciência é sua maior virtuse",
    "Protege os filhos nelle combate"
  ],
  significado: {
    geral: "Loja é un orixá relacionado à terra, à fertilidade e à prosperidade material",
    espiritual: "Representa a abundancia espiritual e a conexao com a terra sagrada",
    material: " associated with harvest, agriculture and material abundance"
  },
  qualidade: "Abundância, prosperidade, fertilidade, sabedoria da terra",
  regencia: "Terra e águas profundas",
  cores: ["Amarelo", "Dourado", "Verde"],
  pedras: ["Quartzo amarelo", "Amber", "Pedra de sol"],
  alimentos: ["Milho", "Feijão", "Inhame", "Cará"],
  numSagrado: [7, 14, 21],
  planeta: "Júpiter",
  chakra: "Chakra do Plexo Solar",
  sefirot: ["Chesed", "Gevurah"],
  tarot: ["O Mundo", "A Estrela"],
  direcao: "Centro",
  periodo: "Manhã cedo"
};

export function getData(): LojaData {
  return LOJA_DATA;
}

export function getLojaByType(type: keyof LojaData): LojaData[keyof LojaData] | LojaData {
  if (type in LOJA_DATA) {
    return LOJA_DATA[type];
  }
  return LOJA_DATA;
}

export function getMensagens(): string[] {
  return LOJA_DATA.mensagens;
}

export function getQuizilas(): string[] {
  return LOJA_DATA.quizilas;
}

export function getEbós(): string[] {
  return LOJA_DATA.ebós;
}

export function getCores(): string[] {
  return LOJA_DATA.cores;
}

export function getPedras(): string[] {
  return LOJA_DATA.pedras;
}

export function getAlimentos(): string[] {
  return LOJA_DATA.alimentos;
}

export function getNumSagrado(): number[] {
  return LOJA_DATA.numSagrado;
}
