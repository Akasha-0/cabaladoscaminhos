// Lenormand Card Data
// @deprecated desde Ciclo 120 — AD-02 do Doc 16: baralho obsoleto de 42 cartas
// (carta 36 = "A Caveira"; a canônica 36 é "A Cruz"). A fonte única é
// `src/lib/constants/lenormand-cards.ts` (Doc 15). Mantido apenas porque
// `/api/lenormand/route.ts` (já quarentenado pelo middleware via flag
// LEGACY_B2C=off) ainda o importa. Não usar em código novo. Não deletar
// até migrar a rota legada ou confirmar que a quarentena é permanente.
export const LENORMAND_CARDS = [
  'O Cavaleiro',
  'A Trevo',
  'O Navio',
  'A Casa',
  'A Árvore',
  'A Nuvem',
  'A Serpente',
  'O Caixão',
  'O Buquê',
  'A Foice',
  'A Chicotada',
  'O Pássaro',
  'O Menino',
  'A Raposa',
  'O Urso',
  'As Estrelas',
  'A Cegonha',
  'O Cão',
  'A Torre',
  'O Jardim',
  'O Monte',
  'O Caminho',
  'Os Ratinhos',
  'O Coração',
  'O Anel',
  'O Livro',
  'A Carta',
  'O Cavalheiro',
  'A Dama',
  'O Lírio',
  'O Sol',
  'O Pôr do Sol',
  'A Chave',
  'O Pássaro Bento',
  'A Criança',
  'A Caveira',
  'O Padre',
  'A Dama Bea',
  'O Rapaz',
  'A Flor',
  'A Espada',
  'O Escudo',
];

function getCardByNumero(num: number): string {
  return LENORMAND_CARDS[num % LENORMAND_CARDS.length];
}

export const CASAS_TEMATICAS = [
  'Situação Atual',
  'Obstáculo',
  'Fundação',
  'Passado',
  'Futuro',
  'Eu Superior',
  'Meio Ambiente',
  'Esperanças',
];
