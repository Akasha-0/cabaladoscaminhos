/**
 * Os 16 Odus de Ifá (Merindilogun)
 * Constantes imutáveis do sistema Cabala dos Caminhos.
 *
 * @see docs/04_data-model.md §5.2
 *
 * Cada Odu possui:
 * - `id`      — número fixo de 1 a 16
 * - `name`    — nome do Odu
 * - `orixas`  — Orixás regentes
 * - `essence` — essência / palavra-força
 */

export interface Odu {
  /** Identificador numérico fixo (1..16) */
  id: number;
  /** Nome do Odu (grafia adotada pelo terapeuta) */
  name: string;
  /** Orixás regentes do Odu */
  orixas: ReadonlyArray<string>;
  /** Essência — palavra-força / significado central */
  essence: string;
  /** Quizila / preceito — o que evitar (Doc 15 §2). */
  quizila: string;
  /** Conselho-base — a direção que o Oráculo oferece (Doc 15 §2). */
  baseAdvice: string;
}

// fallow-ignore-next-line unused-export
export const ODUS: ReadonlyArray<Odu> = [
  { id: 1,  name: 'Ogbe',      orixas: ['Oxalá'],                          essence: 'Luz, origem, criação, renovação',                quizila: 'Não pular etapas; não desprezar o começo.',          baseAdvice: 'Recomece com fé; a luz já apontou o caminho.' },
  { id: 2,  name: 'Ejiokô',    orixas: ['Ibeji', 'Ogum'],                  essence: 'Dualidade, movimento, parcerias',                quizila: 'Evitar decisões sozinho; não duplicar conflitos.',   baseAdvice: 'Busque o par certo; a força está na união.' },
  { id: 3,  name: 'Etogundá',  orixas: ['Ogum', 'Ogun'],                   essence: 'Batalha, conquista, abertura de caminhos',       quizila: 'Não recuar na luta justa; evitar violência fútil.',  baseAdvice: 'Avance com coragem; abra o caminho à força.' },
  { id: 4,  name: 'Irosun',    orixas: ['Oxum', 'Iemanjá'],                essence: 'Atenção, sangue, cuidado com traições',          quizila: 'Cuidado com o que se come e com falsos amigos.',     baseAdvice: 'Atenção redobrada; proteja o que é seu.' },
  { id: 5,  name: 'Oxê',       orixas: ['Oxum', 'Iemanjá'],                essence: 'Beleza, amor, fertilidade, magnetismo',          quizila: 'Não usar o charme para enganar; evitar vaidade.',    baseAdvice: 'Ame e crie; sua doçura atrai a bênção.' },
  { id: 6,  name: 'Obará',     orixas: ['Xangô', 'Oxóssi'],                essence: 'Riqueza, glória, abundância, fartura',           quizila: 'Não desperdiçar; evitar ganância e ostentação.',     baseAdvice: 'A fartura chega; administre com sabedoria.' },
  { id: 7,  name: 'Odi',       orixas: ['Exu', 'Omolu'],                   essence: 'Segredos, transformação, cautela, limpeza',      quizila: 'Guardar segredos; evitar lugares e companhias densas.', baseAdvice: 'Limpe-se e transforme; o oculto se resolve.' },
  { id: 8,  name: 'Ejionile',  orixas: ['Xangô', 'Oxalá'],                 essence: 'Justiça, liderança, força, vitória',             quizila: 'Não ser injusto; evitar arrogância no poder.',       baseAdvice: 'Lidere com retidão; a justiça é seu trono.' },
  { id: 9,  name: 'Ossá',      orixas: ['Iemanjá', 'Oyá'],                 essence: 'Proteção feminina, sabedoria, turbulência',      quizila: 'Cuidado com tempestades emocionais; evitar fofoca.', baseAdvice: 'Acolha a proteção; a sabedoria acalma o vento.' },
  { id: 10, name: 'Ofun',      orixas: ['Oxalufan', 'Oxalá'],              essence: 'Espiritualidade profunda, equilíbrio mental',    quizila: 'Não negligenciar o espírito; evitar excesso mental.', baseAdvice: 'Aquiete a mente; o equilíbrio é seu remédio.' },
  { id: 11, name: 'Owarin',    orixas: ['Exu', 'Oyá'],                     essence: 'Dinâmica, perigo, astúcia, movimento rápido',    quizila: 'Cuidado com a pressa e o risco; evitar atalhos.',    baseAdvice: 'Mova-se com astúcia, mas não corra cego.' },
  { id: 12, name: 'Ejilaxebô', orixas: ['Ogum', 'Oxum'],                   essence: 'Honra, proteção, caminho aberto',                quizila: 'Honrar a palavra; evitar deslealdade.',              baseAdvice: 'O caminho está aberto; siga com honra.' },
  { id: 13, name: 'Oturupon',  orixas: ['Omolu', 'Nanã'],                  essence: 'Cura, purificação, ancestralidade',              quizila: 'Cuidar da saúde e dos ancestrais; evitar negligência.', baseAdvice: 'Cure as raízes; a ancestralidade te sustenta.' },
  { id: 14, name: 'Oturá',     orixas: ['Oxalá', 'Iemanjá'],               essence: 'Paz, benevolência, proteção divina',             quizila: 'Não romper a paz; evitar conflito desnecessário.',   baseAdvice: 'Mantenha a paz; a proteção divina te cobre.' },
  { id: 15, name: 'Iká',       orixas: ['Xangô', 'Oxum'],                  essence: 'Poder, estratégia, responsabilidade',            quizila: 'Não abusar do poder; evitar irresponsabilidade.',    baseAdvice: 'Use o poder com estratégia e responsabilidade.' },
  { id: 16, name: 'Ofurufu',   orixas: ['Oxalá', 'Todos os Orixás'],       essence: 'Completude, totalidade, bênção universal',       quizila: 'Não desperdiçar a graça; manter humildade.',         baseAdvice: 'A bênção é plena; agradeça e partilhe.' },
] as const;

/**
 * Helper — busca um Odu por id (1..16). Retorna `undefined` se inválido.
 */
export function getOduById(id: number): Odu | undefined {
  if (id < 1 || id > 16) return undefined;
  return ODUS[id - 1];
}
