// ============================================================================
// 16 ODUS DO IFÁ (MERINDILOGUN) — Dados Canônicos
// ============================================================================
// Fonte: IDEIA.md §5 — Odus canônicos do Sistema Akasha
// ⚠️ D4 provisional: spelling variants pendentes de validação com especialista
// ============================================================================

export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  orixaRegente: string;
  quizilas: string[];
  preceptos: string[];
}

export const ODUS_IFA: OduInfo[] = [
  {
    numero: 1,
    nome: 'Ogbe (Oxé)',
    significado: 'A luz que ilumina o caminho. Vitória, criação, renascimento, autoridade divina.',
    elemento: 'Fogo',
    orixaRegente: 'Oxalá',
    quizilas: ['Cachaça em excesso', 'Andar na rua ao meio-dia'],
    preceptos: ['Cultivar a paciência', 'Honrar a criação'],
  },
  {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, a parceria, o movimento. Início de jornada, escolha entre caminhos.',
    elemento: 'Ar / Terra',
    orixaRegente: 'Ibeji, Ogum',
    quizilas: [],
    preceptos: ['Buscar equilíbrio', 'Honrar as parcerias'],
  },
  {
    numero: 3,
    nome: 'Etogundá',
    significado: 'A batalha, a conquista, a abertura de caminhos. Força, vitória, superação.',
    elemento: 'Fogo / Terra',
    orixaRegente: 'Ogum, Ogun',
    quizilas: [],
    preceptos: ['Enfrentar batalhas com coragem', 'Abrir caminhos com ética'],
  },
  {
    numero: 4,
    nome: 'Irosun',
    significado: 'O aviso, a atenção, o cuidado com traições. Intuição, pressentimento, alerta.',
    elemento: 'Fogo / Terra',
    orixaRegente: 'Oxum, Iemanjá',
    quizilas: [],
    preceptos: ['Manter vigilância', 'Confiar na intuição'],
  },
  {
    numero: 5,
    nome: 'Oxê (Ogunda)',
    significado: 'A beleza, o amor, a fertilidade, o magnetismo. Conquista, doçura, poder feminino.',
    elemento: 'Água',
    orixaRegente: 'Oxum',
    quizilas: [],
    preceptos: ['Honrar a beleza interior', 'Cultivar o amor próprio'],
  },
  {
    numero: 6,
    nome: 'Obará',
    significado: 'A riqueza, a glória, a abundância, a fartura. Prosperidade, fartura material e espiritual.',
    elemento: 'Terra',
    orixaRegente: 'Xangô, Oxóssi',
    quizilas: [],
    preceptos: ['Compartilhar a fartura', 'Honrar a terra'],
  },
  {
    numero: 7,
    nome: 'Odi',
    significado: 'Os segredos, a transformação, a cautela, a limpeza. Mistério, profundidade, renascimento.',
    elemento: 'Terra / Água',
    orixaRegente: 'Exu, Omolu',
    quizilas: [],
    preceptos: ['Respeitar os mistérios', 'Cultivar a limpeza interior'],
  },
  {
    numero: 8,
    nome: 'Ejionile',
    significado: 'A justiça, a liderança, a força, a vitória. Equilíbrio, retidão, poder legítimo.',
    elemento: 'Fogo / Água',
    orixaRegente: 'Xangô, Oxalá',
    quizilas: [],
    preceptos: ['Buscar a justiça', 'Liderar com retidão'],
  },
  {
    numero: 9,
    nome: 'Ossá',
    significado: 'A proteção feminina, a sabedoria, a turbulência das águas. Cuidado maternal, proteção.',
    elemento: 'Água',
    orixaRegente: 'Iemanjá, Oyá',
    quizilas: [],
    preceptos: ['Honrar as águas', 'Buscar proteção divina'],
  },
  {
    numero: 10,
    nome: 'Ofun',
    significado: 'A espiritualidade profunda, o equilíbrio mental, a meditação. Sabedoria ancestral.',
    elemento: 'Ar',
    orixaRegente: 'Oxalufan, Oxalá',
    quizilas: [],
    preceptos: ['Meditar regularmente', 'Honrar a ancestralidade'],
  },
  {
    numero: 11,
    nome: 'Owarin',
    significado: 'A dinâmica, o perigo, a astúcia, o movimento rápido. Transformação veloz, alerta.',
    elemento: 'Ar / Fogo',
    orixaRegente: 'Exu, Oyá',
    quizilas: [],
    preceptos: ['Agir com astúcia', 'Manter-se alerta'],
  },
  {
    numero: 12,
    nome: 'Ejilaxebô',
    significado: 'A honra, a proteção, o caminho aberto. Reconhecimento, vitória merecida.',
    elemento: 'Ar',
    orixaRegente: 'Ogum, Oxum',
    quizilas: [],
    preceptos: ['Honrar o mérito', 'Proteger os seus'],
  },
  {
    numero: 13,
    nome: 'Oturupon',
    significado: 'A cura, a purificação, a ancestralidade. Saúde, limpeza, conexão com os mortos.',
    elemento: 'Terra',
    orixaRegente: 'Omolu, Nanã',
    quizilas: [],
    preceptos: ['Honrar os ancestrais', 'Cultivar a cura interior'],
  },
  {
    numero: 14,
    nome: 'Oturá',
    significado: 'A paz, a benevolência, a proteção divina. Harmonia, tranquilidade, segurança.',
    elemento: 'Água',
    orixaRegente: 'Oxalá, Iemanjá',
    quizilas: [],
    preceptos: ['Buscar a paz interior', 'Confiar na proteção divina'],
  },
  {
    numero: 15,
    nome: 'Iká',
    significado: 'O poder, a estratégia, a responsabilidade. Autoridade, comando, decisão.',
    elemento: 'Fogo',
    orixaRegente: 'Xangô, Oxum',
    quizilas: [],
    preceptos: ['Usar o poder com responsabilidade', 'Decidir com ética'],
  },
  {
    numero: 16,
    nome: 'Ofurufu',
    significado: 'A completude, a totalidade, a bênção universal. Integração, plenitude, fim de jornada.',
    elemento: 'Éter',
    orixaRegente: 'Oxalá, todos os Orixás',
    quizilas: [],
    preceptos: ['Buscar a totalidade', 'Integrar todas as lições'],
  },
];

/** Busca Odu por número (1..16). */
export function getOduPorNumero(numero: number): OduInfo | undefined {
  return ODUS_IFA.find((o) => o.numero === numero);
}
