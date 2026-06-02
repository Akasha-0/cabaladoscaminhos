// Lenormand Card Data
export const LENORMAND_CARDS = ['O Cavaleiro', 'A Trevo', 'O Navio', 'A Casa', 'A Árvore', 'A Nuvem', 'A Serpente', 'O Caixão', 'O Buquê', 'A Foice', 'A Chicotada', 'O Pássaro', 'O Menino', 'A Raposa', 'O Urso', 'As Estrelas', 'A Cegonha', 'O Cão', 'A Torre', 'O Jardim', 'O Monte', 'O Caminho', 'Os Ratinhos', 'O Coração', 'O Anel', 'O Livro', 'A Carta', 'O Cavalheiro', 'A Dama', 'O Lírio', 'O Sol', 'O Pôr do Sol', 'A Chave', 'O Pássaro Bento', 'A Criança', 'A Caveira', 'O Padre', 'A Dama Bea', 'O Rapaz', 'A Flor', 'A Espada', 'O Escudo'];

function getCardByNumero(num: number): string {
  return LENORMAND_CARDS[num % LENORMAND_CARDS.length];
}

export const CASAS_TEMATICAS = ['Situação Atual', 'Obstáculo', 'Fundação', 'Passado', 'Futuro', 'Eu Superior', 'Meio Ambiente', 'Esperanças'];
