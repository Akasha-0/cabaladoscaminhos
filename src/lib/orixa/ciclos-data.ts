// Ciclos data

export interface CicloData {
  title: string;
  description: string;
  items: CicloItem[];
}

export interface CicloItem {
  id: number;
  name: string;
  value: string;
  meaning: string;
}

const ciclosData: CicloData = {
  title: "Ciclos",
  description: " Ciclos espirituais fundamentales de ritmo e conex\u00e3o com o sagrado.",
  items: [
    {
      id: 1,
      name: "Ciclo Solar",
      value: "365 dias",
      meaning: "Ciclo de vitalidade e energia solar, renew yearly with the sun's journey.",
    },
    {
      id: 2,
      name: "Ciclo Lunar",
      value: "29.5 dias",
      meaning: "Ciclo de sensibilidades e estado an\u00edmico, renewing each lunar phase.",
    },
    {
      id: 3,
      name: "Ciclo de If\u00e1",
      value: "16",
      meaning: "Ciclo dos 16 Odus principais, representing the paths of destiny and wisdom.",
    },
    {
      id: 4,
      name: "Harmonia de Ciclos",
      value: "sincronia",
      meaning: "Alinhando ciclos pessoais com os ritmos naturais e c\u00f3smicos.",
    },
    {
      id: 5,
      name: "Ponto Cr\u00edtico",
      value: "transi\u00e7\u00e3o",
      meaning: "Momento de intersec\u00e7\u00e3o dos ciclos, requiring special care and devotion.",
    },
    {
      id: 6,
      name: "Montanha e Vale",
      value: "ascens\u00e3o e descida",
      meaning: "Per\u00edodos naturais de alta e baixa energia dentro de cada ciclo.",
    },
    {
      id: 7,
      name: "Renovação",
      value: "E Gb\u00e9",
      meaning: "Ponto de partida de um novo ciclo, energia fresca e potencial ilimitado.",
    },
    {
      id: 8,
      name: "Estabilidade",
      value: "equil\u00edbrio",
      meaning: "Pico intermedi\u00e1rio do ciclo para desempenho \u00f3timo e clareza.",
    },
    {
      id: 9,
      name: "Sintonia C\u00f3smica",
      value: "conex\u00e3o",
      meaning: "Alinhando ciclos pessoais com os orix\u00e1s e as for\u00e7as do universo.",
    },
    {
      id: 10,
      name: "Transformação",
      value: "evolu\u00e7\u00e3o",
      meaning: "Crescimento e metamorfose atrav\u00e9s da compreens\u00e3o dos padr\u00f5es c\u00edclicos.",
    },
    {
      id: 11,
      name: "Ciclo de Oxumar",
      value: "arco-\u00edris",
      meaning: "Ciclo de purifica\u00e7\u00e3o e transforma\u00e7\u00e3o, brilho das \u00e1guas celestiais.",
    },
    {
      id: 12,
      name: "Ciclo de Oxossi",
      value: "ca\u00e7ador",
      meaning: "Ciclo de busca e conquista, caminhando pelos caminhos da floresta.",
    },
  ],
};

export function getData(): CicloData {
  return ciclosData;
}