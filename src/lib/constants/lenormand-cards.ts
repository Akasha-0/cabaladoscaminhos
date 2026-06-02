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
  /** Significado-base canônico (frase-verdade injetada no prompt — Doc 15 §1). */
  baseMeaning: string;
  /** Face desafiadora (sombra) — para o Oráculo dosar o aviso com proteção. */
  shadow: string;
}

export const LENORMAND_CARDS: ReadonlyArray<LenormandCard> = [
  { id: 1,  name: 'O Cavaleiro',   keywords: 'Notícias, movimento, mensagens, velocidade', baseMeaning: 'Algo se aproxima; o primeiro impulso e a notícia que chega.', shadow: 'Precipitação, mensagem que não vem.' },
  { id: 2,  name: 'O Trevo',       keywords: 'Sorte, pequenas oportunidades, esperança', baseMeaning: 'Pequena sorte passageira; janela breve a aproveitar.', shadow: 'Otimismo ingênuo, sorte que escapa.' },
  { id: 3,  name: 'O Navio',       keywords: 'Viagem, negócios, distância, importação/exportação', baseMeaning: 'Jornada, comércio e horizontes que se ampliam.', shadow: 'Distância, saudade, demora.' },
  { id: 4,  name: 'A Casa',        keywords: 'Lar, família, estabilidade, propriedade', baseMeaning: 'A base, o lar e a estrutura que protege.', shadow: 'Apego, estagnação doméstica.' },
  { id: 5,  name: 'A Árvore',      keywords: 'Saúde, raízes, crescimento, ancestralidade', baseMeaning: 'A vitalidade e as raízes que sustentam a vida.', shadow: 'Cansaço, raiz adoecida.' },
  { id: 6,  name: 'As Nuvens',     keywords: 'Confusão, dúvidas, instabilidade mental, nebulosidade', baseMeaning: 'Véu sobre a mente; o que ainda não está claro.', shadow: 'Engano, indecisão prolongada.' },
  { id: 7,  name: 'A Serpente',    keywords: 'Perigo, traição, sexualidade, sabedoria oculta', baseMeaning: 'A força oculta: desejo, perigo e sabedoria que morde.', shadow: 'Traição, sedução destrutiva.' },
  { id: 8,  name: 'O Caixão',      keywords: 'Fim, transformação, encerramento de ciclos, crise', baseMeaning: 'O fim necessário que abre espaço ao novo.', shadow: 'Perda, luto, resistência ao fim.' },
  { id: 9,  name: 'Os Buquês',     keywords: 'Presentes, surpresas felizes, beleza, reconhecimento', baseMeaning: 'A bênção, o reconhecimento e a alegria que chega.', shadow: 'Superficialidade, presente vazio.' },
  { id: 10, name: 'A Foice',       keywords: 'Corte, decisão, colheita, separação', baseMeaning: 'O corte certeiro: decisão e colheita do que se plantou.', shadow: 'Ruptura abrupta, corte precipitado.' },
  { id: 11, name: 'O Chicote',     keywords: 'Conflito, repetição, estresse, padrões destrutivos', baseMeaning: 'O atrito que se repete até ser compreendido.', shadow: 'Discórdia, padrão destrutivo.' },
  { id: 12, name: 'Os Pássaros',   keywords: 'Comunicação, parceria, nervosismo, conversas', baseMeaning: 'A troca, a conversa e o par que dialoga.', shadow: 'Fofoca, ansiedade, ruído.' },
  { id: 13, name: 'A Criança',     keywords: 'Novo começo, inocência, projeto inicial, juventude', baseMeaning: 'O recomeço puro e o projeto em sua semente.', shadow: 'Imaturidade, vulnerabilidade.' },
  { id: 14, name: 'A Raposa',      keywords: 'Astúcia, estratégia, autossuficiência, cautela', baseMeaning: 'A inteligência que protege e a estratégia que vence.', shadow: 'Engano, desconfiança, malícia.' },
  { id: 15, name: 'O Urso',        keywords: 'Poder, autoridade, finanças, força, chefe', baseMeaning: 'O poder pessoal, a autoridade e o sustento forte.', shadow: 'Dominação, controle, peso.' },
  { id: 16, name: 'A Estrela',     keywords: 'Esperança, espiritualidade, guia, brilho, sonhos', baseMeaning: 'A luz que guia, a fé e o sonho de alma.', shadow: 'Ilusão, expectativa irreal.' },
  { id: 17, name: 'A Cegonha',     keywords: 'Mudança, renovação, melhoria, gestação', baseMeaning: 'A mudança benéfica e o que está nascendo.', shadow: 'Mudança temida, inquietação.' },
  { id: 18, name: 'O Cachorro',    keywords: 'Lealdade, amizade, confiança, proteção', baseMeaning: 'O aliado fiel e o vínculo de confiança.', shadow: 'Dependência, falsa lealdade.' },
  { id: 19, name: 'A Torre',       keywords: 'Isolamento, autoridade, ego, solidão consciente', baseMeaning: 'A reclusão consciente e a estrutura que se ergue só.', shadow: 'Orgulho, isolamento doentio.' },
  { id: 20, name: 'O Jardim',      keywords: 'Vida social, público, eventos, natureza', baseMeaning: 'O encontro, o público e a exposição social.', shadow: 'Dispersão, máscara social.' },
  { id: 21, name: 'A Montanha',    keywords: 'Obstáculo, bloqueio, desafio, inimigo oculto', baseMeaning: 'O grande obstáculo e o inimigo que atrasa.', shadow: 'Bloqueio crônico, muro interno.' },
  { id: 22, name: 'Os Caminhos',   keywords: 'Escolha, bifurcação, decisão, múltiplas direções', baseMeaning: 'A encruzilhada: a escolha que define o rumo.', shadow: 'Dúvida paralisante, fuga da decisão.' },
  { id: 23, name: 'O Rato',        keywords: 'Perda, desgaste, ansiedade, roubo de energia', baseMeaning: 'O desgaste lento que rói sem ser visto.', shadow: 'Roubo de energia, escassez, medo.' },
  { id: 24, name: 'O Coração',     keywords: 'Amor, sentimentos, emoções, desejo', baseMeaning: 'O amor, o afeto e o desejo do coração.', shadow: 'Carência, paixão cega.' },
  { id: 25, name: 'O Anel',        keywords: 'Comprometimento, contrato, ciclo, aliança', baseMeaning: 'O pacto, o vínculo e o ciclo que se sela.', shadow: 'Prisão, contrato que aperta.' },
  { id: 26, name: 'O Livro',       keywords: 'Segredo, conhecimento, educação, mistério', baseMeaning: 'O saber guardado e o segredo a revelar.', shadow: 'Ocultação, ignorância imposta.' },
  { id: 27, name: 'A Carta',       keywords: 'Documento, notícia escrita, comunicação formal', baseMeaning: 'A mensagem oficial e o documento que chega.', shadow: 'Notícia adiada, burocracia.' },
  { id: 28, name: 'O Cigano',      keywords: 'Figura masculina, ação, protagonismo, o consulente homem', baseMeaning: 'O homem, a energia ativa/yang que age.', shadow: 'Imposição, agressividade.' },
  { id: 29, name: 'A Cigana',      keywords: 'Figura feminina, intuição, receptividade, a consulente mulher', baseMeaning: 'A mulher, a energia receptiva/yin que intui.', shadow: 'Manipulação, passividade.' },
  { id: 30, name: 'Os Lírios',     keywords: 'Paz, maturidade, pureza, sabedoria, sexualidade madura', baseMeaning: 'A paz madura e a sexualidade serena.', shadow: 'Frieza, moralismo, distância.' },
  { id: 31, name: 'O Sol',         keywords: 'Sucesso máximo, clareza, vitalidade, conquista', baseMeaning: 'A vitória plena, a clareza e o ápice.', shadow: 'Ego inflado, ofuscamento.' },
  { id: 32, name: 'A Lua',         keywords: 'Intuição, reconhecimento, honrarias, emoções profundas', baseMeaning: 'O reconhecimento, o psiquismo e a emoção profunda.', shadow: 'Ilusão emocional, oscilação.' },
  { id: 33, name: 'A Chave',       keywords: 'Solução, abertura, resposta, importância', baseMeaning: 'A solução que se abre e a porta destrancada.', shadow: 'Resposta que tarda, falsa chave.' },
  { id: 34, name: 'Os Peixes',     keywords: 'Dinheiro, abundância, fluxo financeiro, negócios', baseMeaning: 'O fluxo financeiro e a abundância material.', shadow: 'Ganância, descontrole, perda.' },
  { id: 35, name: 'A Âncora',      keywords: 'Estabilidade, trabalho fixo, permanência, segurança', baseMeaning: 'A permanência, o trabalho firme e a segurança.', shadow: 'Estagnação, peso que prende.' },
  { id: 36, name: 'A Cruz',        keywords: 'Fardo, karma, destino, teste espiritual, responsabilidade', baseMeaning: 'O fardo kármico e o teste que redime.', shadow: 'Martírio, culpa, sentença.' },
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
