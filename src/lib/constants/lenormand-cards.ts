/**
 * As 36 Cartas Ciganas (Lenormand)
 * Constantes imutáveis do sistema Cabala dos Caminhos.
 *
 * @see docs/04_data-model.md §5.1
 *
 * Cada carta possui:
 * - `id`     — número fixo de 1 a 36
 * - `name`   — nome tradicional em português
 * - `keywords` — palavras-chave que resumem os significados
 *
 * A ordem e nomenclatura seguem a convenção adotada pelo terapeuta
 * (Doc 02 §C.2). Esses 36 nomes são os mesmos usados para nomear
 * as 36 casas da Mesa Real — as cartas e as casas compartilham o
 * mesmo espaço simbólico.
 */

export interface LenormandCard {
  /** Identificador numérico fixo (1..36) */
  id: number;
  /** Nome tradicional em português (com artigo definido) */
  name: string;
  /** Palavras-chave que resumem os significados */
  keywords: string;
}

export const LENORMAND_CARDS: ReadonlyArray<LenormandCard> = [
  { id: 1,  name: 'O Cavaleiro',   keywords: 'Notícias, movimento, mensagens, velocidade' },
  { id: 2,  name: 'O Trevo',       keywords: 'Sorte, pequenas oportunidades, esperança' },
  { id: 3,  name: 'O Navio',       keywords: 'Viagem, negócios, distância, importação/exportação' },
  { id: 4,  name: 'A Casa',        keywords: 'Lar, família, estabilidade, propriedade' },
  { id: 5,  name: 'A Árvore',      keywords: 'Saúde, raízes, crescimento, ancestralidade' },
  { id: 6,  name: 'As Nuvens',     keywords: 'Confusão, dúvidas, instabilidade mental, nebulosidade' },
  { id: 7,  name: 'A Serpente',    keywords: 'Perigo, traição, sexualidade, sabedoria oculta' },
  { id: 8,  name: 'O Caixão',      keywords: 'Fim, transformação, encerramento de ciclos, crise' },
  { id: 9,  name: 'Os Buquês',     keywords: 'Presentes, surpresas felizes, beleza, reconhecimento' },
  { id: 10, name: 'A Foice',       keywords: 'Corte, decisão, colheita, separação' },
  { id: 11, name: 'O Chicote',     keywords: 'Conflito, repetição, estresse, padrões destrutivos' },
  { id: 12, name: 'Os Pássaros',   keywords: 'Comunicação, parceria, nervosismo, conversas' },
  { id: 13, name: 'A Criança',     keywords: 'Novo começo, inocência, projeto inicial, juventude' },
  { id: 14, name: 'A Raposa',      keywords: 'Astúcia, estratégia, autossuficiência, cautela' },
  { id: 15, name: 'O Urso',        keywords: 'Poder, autoridade, finanças, força, chefe' },
  { id: 16, name: 'A Estrela',     keywords: 'Esperança, espiritualidade, guia, brilho, sonhos' },
  { id: 17, name: 'A Cegonha',     keywords: 'Mudança, renovação, melhoria, gestação' },
  { id: 18, name: 'O Cachorro',    keywords: 'Lealdade, amizade, confiança, proteção' },
  { id: 19, name: 'A Torre',       keywords: 'Isolamento, autoridade, ego, solidão consciente' },
  { id: 20, name: 'O Jardim',      keywords: 'Vida social, público, eventos, natureza' },
  { id: 21, name: 'A Montanha',    keywords: 'Obstáculo, bloqueio, desafio, inimigo oculto' },
  { id: 22, name: 'Os Caminhos',   keywords: 'Escolha, bifurcação, decisão, múltiplas direções' },
  { id: 23, name: 'O Rato',        keywords: 'Perda, desgaste, ansiedade, roubo de energia' },
  { id: 24, name: 'O Coração',     keywords: 'Amor, sentimentos, emoções, desejo' },
  { id: 25, name: 'O Anel',        keywords: 'Comprometimento, contrato, ciclo, aliança' },
  { id: 26, name: 'O Livro',       keywords: 'Segredo, conhecimento, educação, mistério' },
  { id: 27, name: 'A Carta',       keywords: 'Documento, notícia escrita, comunicação formal' },
  { id: 28, name: 'O Cigano',      keywords: 'Figura masculina, ação, protagonismo, o consulente homem' },
  { id: 29, name: 'A Cigana',      keywords: 'Figura feminina, intuição, receptividade, a consulente mulher' },
  { id: 30, name: 'Os Lírios',     keywords: 'Paz, maturidade, pureza, sabedoria, sexualidade madura' },
  { id: 31, name: 'O Sol',         keywords: 'Sucesso máximo, clareza, vitalidade, conquista' },
  { id: 32, name: 'A Lua',         keywords: 'Intuição, reconhecimento, honrarias, emoções profundas' },
  { id: 33, name: 'A Chave',       keywords: 'Solução, abertura, resposta, importância' },
  { id: 34, name: 'Os Peixes',     keywords: 'Dinheiro, abundância, fluxo financeiro, negócios' },
  { id: 35, name: 'A Âncora',      keywords: 'Estabilidade, trabalho fixo, permanência, segurança' },
  { id: 36, name: 'A Cruz',        keywords: 'Fardo, karma, destino, teste espiritual, responsabilidade' },
] as const;

/**
 * Helper — busca uma carta por id.
 * Retorna `undefined` se o id estiver fora do intervalo 1..36.
 */
export function getLenormandCardById(id: number): LenormandCard | undefined {
  if (id < 1 || id > 36) return undefined;
  return LENORMAND_CARDS[id - 1];
}

/**
 * As 36 casas da Mesa Real (mesma nomenclatura e ordem das cartas).
 * A "casa" é a posição fixa no grid 9x4; a carta é a carta tirada
 * naquela posição. Em ambos os casos o nome é o mesmo.
 */
export const MESA_REAL_HOUSES: ReadonlyArray<LenormandCard> = LENORMAND_CARDS;
