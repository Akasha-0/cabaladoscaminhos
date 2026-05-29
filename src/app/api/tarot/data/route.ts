// ============================================================
// TAROT DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for tarot data access
// - Retrieve all tarot cards
// - Get specific card by ID or name
// - Major and Minor Arcana access
// - Card interpretations and meanings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── CARD INTERFACES ──────────────────────────────────────────────────────────

interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  element?: string;
  astro?: string;
  upright: string[];
  reversed: string[];
}

interface CardInterpretation {
  cardName: string;
  tags: string[];
  summary: string;
  general: string;
  love: string | null;
  career: string | null;
  shadow: string[];
  affirmations: string[];
}

// ─── MAJOR ARCANA DATA ────────────────────────────────────────────────────────

const MAJOR_ARCANA_CARDS: TarotCard[] = [
  { id: 0, name: 'O Louco', arcana: 'major', upright: ['Novos começos', 'Liberdade', 'Aventura'], reversed: ['Irresponsabilidade', 'Imprudência', 'Seguir a multidão'] },
  { id: 1, name: 'O Mago', arcana: 'major', upright: ['Vontade', 'Habilidade', 'Propósito'], reversed: ['Manipulação', 'Diluição de habilidades'] },
  { id: 2, name: 'A Sacerdotisa', arcana: 'major', upright: ['Intuição', 'Mistério', 'Sabedoria interior'], reversed: ['Segredos revelados', 'Ignorância'] },
  { id: 3, name: 'A Imperatriz', arcana: 'major', upright: ['Fertilidade', 'Abundância', 'Criatividade'], reversed: ['Bloqueio criativo', 'Dependência'] },
  { id: 4, name: 'O Imperador', arcana: 'major', upright: ['Autoridade', 'Estrutura', 'Pai'], reversed: ['Rigidez', 'Dominação'] },
  { id: 5, name: 'O Hierofante', arcana: 'major', upright: ['Tradição', 'Espiritualidade', 'Dogma'], reversed: ['Rebeldia', 'Novas ideias'] },
  { id: 6, name: 'Os Enamorados', arcana: 'major', upright: ['Amor', 'União', 'Escolhas'], reversed: ['Desarmonia', 'Decisões precipitadas'] },
  { id: 7, name: 'O Carro', arcana: 'major', upright: ['Vitória', 'Controle', 'Determinação'], reversed: ['Falta de direção', 'Agressividade'] },
  { id: 8, name: 'A Justiça', arcana: 'major', upright: ['Equilíbrio', 'Verdade', 'Lei'], reversed: ['Injustiça', 'Desonestidade'] },
  { id: 9, name: 'O Eremita', arcana: 'major', upright: ['Introspecção', 'Solidão', 'Busca interior'], reversed: ['Isolamento extremo', 'Medo de sozinho'] },
  { id: 10, name: 'A Roda da Fortuna', arcana: 'major', upright: ['Ciclos', 'Destino', 'Sorte'], reversed: ['Má sorte', 'Interrupção'] },
  { id: 11, name: 'A Força', arcana: 'major', upright: ['Coragem', 'Perseverança', 'Compaixão'], reversed: ['Medo', 'Insegurança'] },
  { id: 12, name: 'O Enforcado', arcana: 'major', upright: ['Sacrifício', 'Nova perspectiva', 'Adiação'], reversed: ['Estagnação', 'Resistência'] },
  { id: 13, name: 'A Morte', arcana: 'major', upright: ['Transformação', 'Fim de ciclo', 'Renascimento'], reversed: ['Estagnação', 'Medo de mudança'] },
  { id: 14, name: 'A Temperança', arcana: 'major', upright: ['Equilíbrio', 'Paciência', 'Propósito'], reversed: ['Desequilíbrio', 'Excesso'] },
  { id: 15, name: 'O Diabo', arcana: 'major', upright: ['Prisão interior', 'Vínculos', 'Materialismo'], reversed: ['Libertação', 'Romper correntes'] },
  { id: 16, name: 'A Torre', arcana: 'major', upright: ['Destruição', 'Revelação', 'Despertar'], reversed: ['Evitar desastre', 'Medo de mudança'] },
  { id: 17, name: 'A Estrela', arcana: 'major', upright: ['Esperança', 'Inspiração', 'Serenidade'], reversed: ['Desesperança', 'Descontentamento'] },
  { id: 18, name: 'A Lua', arcana: 'major', upright: ['Ilusão', 'Intuição', 'Inconsciente'], reversed: ['Medo', 'Confusão'] },
  { id: 19, name: 'O Sol', arcana: 'major', upright: ['Sucesso', 'Vitalidade', 'Alegria'], reversed: ['Bloqueio temporário', 'Optimismo exagerado'] },
  { id: 20, name: 'O Julgamento', arcana: 'major', upright: ['Juízo', 'Renascimento', 'Propósito'], reversed: ['Auto-repreensão', 'Ignorar a consciência'] },
  { id: 21, name: 'O Mundo', arcana: 'major', upright: ['Completude', 'Realização', 'Harmonia'], reversed: ['Incompletude', 'Frustração'] },
];

// ─── MINOR ARCANA DATA ────────────────────────────────────────────────────────

const MINOR_ARCANA_CARDS: TarotCard[] = [
  // Paus (Bastões)
  { id: 22, name: 'Ás de Paus', arcana: 'minor', suit: 'Paus', number: 1, element: 'Fogo', upright: ['Criatividade', 'Ação', 'Inspiração'], reversed: ['Bloqueio criativo', 'Impaciência'] },
  { id: 23, name: 'Dois de Paus', arcana: 'minor', suit: 'Paus', number: 2, element: 'Fogo', upright: ['Planejamento', 'Decisões', 'Responsabilidade'], reversed: ['Indecisão', 'Ansiedade'] },
  { id: 24, name: 'Três de Paus', arcana: 'minor', suit: 'Paus', number: 3, element: 'Fogo', upright: ['Oportunidades', 'Expansão', 'Boas novas'], reversed: ['Atrasos', 'Frustração'] },
  { id: 25, name: 'Quatro de Paus', arcana: 'minor', suit: 'Paus', number: 4, element: 'Fogo', upright: ['Celebração', 'Harmonia', 'Estabilidade'], reversed: ['Falta de apoio', 'Instabilidade'] },
  { id: 26, name: 'Cinco de Paus', arcana: 'minor', suit: 'Paus', number: 5, element: 'Fogo', upright: ['Competição', 'Conflito', 'Diferenças'], reversed: ['Evitar conflito', 'Vitória'] },
  { id: 27, name: 'Seis de Paus', arcana: 'minor', suit: 'Paus', number: 6, element: 'Fogo', upright: ['Vitória', 'Reconhecimento', 'Sucesso'], reversed: ['Egoísmo', 'Falha'] },
  { id: 28, name: 'Sete de Paus', arcana: 'minor', suit: 'Paus', number: 7, element: 'Fogo', upright: ['Desafio', 'Competição', 'Persistência'], reversed: ['Exaurido', 'Render-se'] },
  { id: 29, name: 'Oito de Paus', arcana: 'minor', suit: 'Paus', number: 8, element: 'Fogo', upright: ['Velocidade', 'Movimento', 'Impulso'], reversed: ['Atrasos', 'Frustração'] },
  { id: 30, name: 'Nove de Paus', arcana: 'minor', suit: 'Paus', number: 9, element: 'Fogo', upright: ['Resiliência', 'Coragem', 'Persistência'], reversed: ['Exaustão', 'Paranoia'] },
  { id: 31, name: 'Dez de Paus', arcana: 'minor', suit: 'Paus', number: 10, element: 'Fogo', upright: ['Fardo', 'Responsabilidade', 'Peso'], reversed: ['Delegação', 'Alívio'] },
  { id: 32, name: 'Princesa de Paus', arcana: 'minor', suit: 'Paus', number: 11, element: 'Fogo', upright: ['Criatividade', 'Entusiasmo', 'Exploração'], reversed: ['Arrogância', 'Imaturidade'] },
  { id: 33, name: 'Cavalo de Paus', arcana: 'minor', suit: 'Paus', number: 12, element: 'Fogo', upright: ['Ação rápida', 'Exploração', 'Aventura'], reversed: ['Impaciência', 'Oportunismo'] },
  { id: 34, name: 'Rainha de Paus', arcana: 'minor', suit: 'Paus', number: 13, element: 'Fogo', upright: ['Confiança', 'Independência', 'Determinação'], reversed: ['Arrogância', 'Impaciência'] },
  { id: 35, name: 'Rei de Paus', arcana: 'minor', suit: 'Paus', number: 14, element: 'Fogo', upright: ['Liderança', 'Visão', 'Honestidade'], reversed: ['Impaciência', 'Tiranismo'] },
  // Copas
  { id: 36, name: 'Ás de Copas', arcana: 'minor', suit: 'Copas', number: 1, element: 'Água', upright: ['Amor', 'Novos começos', 'Emoções'], reversed: ['Bloqueio emocional', 'Vazio'] },
  { id: 37, name: 'Dois de Copas', arcana: 'minor', suit: 'Copas', number: 2, element: 'Água', upright: ['Parceria', 'União', 'Conexão'], reversed: ['Desequilíbrio', 'Desunião'] },
  { id: 38, name: 'Três de Copas', arcana: 'minor', suit: 'Copas', number: 3, element: 'Água', upright: ['Celebração', 'Amizade', 'Comunidade'], reversed: ['Excesso', 'Saudade'] },
  { id: 39, name: 'Quatro de Copas', arcana: 'minor', suit: 'Copas', number: 4, element: 'Água', upright: ['Meditação', 'Contemplação', 'Insatisfação'], reversed: ['Boredom', 'Ação'] },
  { id: 40, name: 'Cinco de Copas', arcana: 'minor', suit: 'Copas', number: 5, element: 'Água', upright: ['Perda', 'Luto', 'Decepção'], reversed: ['Aceitação', 'Recuperação'] },
  { id: 41, name: 'Seis de Copas', arcana: 'minor', suit: 'Copas', number: 6, element: 'Água', upright: ['Nostalgia', 'Memórias', 'Inocência'], reversed: ['Vivendo no passado', 'Desapego'] },
  { id: 42, name: 'Sete de Copas', arcana: 'minor', suit: 'Copas', number: 7, element: 'Água', upright: ['Escolhas', 'Ilusões', 'Fantasia'], reversed: ['Confusão', 'Clareza'] },
  { id: 43, name: 'Oito de Copas', arcana: 'minor', suit: 'Copas', number: 8, element: 'Água', upright: ['Partida', 'Abandono', 'Deixar ir'], reversed: ['Medo de mudança', 'Estagnação'] },
  { id: 44, name: 'Nove de Copas', arcana: 'minor', suit: 'Copas', number: 9, element: 'Água', upright: ['Contentamento', 'Satisfação', 'Desejos realizados'], reversed: ['Insatisfação', 'Materialismo'] },
  { id: 45, name: 'Dez de Copas', arcana: 'minor', suit: 'Copas', number: 10, element: 'Água', upright: ['Felicidade familiar', 'Harmonia', 'Perfeição'], reversed: ['Desarmonia', 'Frustração familiar'] },
  { id: 46, name: 'Princesa de Copas', arcana: 'minor', suit: 'Copas', number: 11, element: 'Água', upright: ['Intuição', 'Criatividade', 'Sensibilidade'], reversed: ['Instabilidade emocional', 'Manipulação'] },
  { id: 47, name: 'Cavalo de Copas', arcana: 'minor', suit: 'Copas', number: 12, element: 'Água', upright: ['Romance', 'Encantamento', 'Sensibilidade'], reversed: ['Emoções repressivas', 'Delusão'] },
  { id: 48, name: 'Rainha de Copas', arcana: 'minor', suit: 'Copas', number: 13, element: 'Água', upright: ['Compaixão', 'Intuição', 'Sensibilidade'], reversed: ['Instabilidade', 'Desconforto emocional'] },
  { id: 49, name: 'Rei de Copas', arcana: 'minor', suit: 'Copas', number: 14, element: 'Água', upright: ['Emocionalmente balanced', 'Diplomacia', 'Compreensão'], reversed: ['Manipulação', 'Volatilidade emocional'] },
  // Espadas
  { id: 50, name: 'Ás de Espadas', arcana: 'minor', suit: 'Espadas', number: 1, element: 'Ar', upright: ['Clareza mental', 'Verdade', 'Decisão'], reversed: ['Confusão', 'Bloqueio mental'] },
  { id: 51, name: 'Dois de Espadas', arcana: 'minor', suit: 'Espadas', number: 2, element: 'Ar', upright: ['Indecisão', 'Paralisia', 'Escolha difícil'], reversed: ['Indecisão', 'Confusão'] },
  { id: 52, name: 'Três de Espadas', arcana: 'minor', suit: 'Espadas', number: 3, element: 'Ar', upright: ['Coração partido', 'Dor', 'Tristeza'], reversed: ['Curação', 'Perdão'] },
  { id: 53, name: 'Quatro de Espadas', arcana: 'minor', suit: 'Espadas', number: 4, element: 'Ar', upright: ['Descanso', 'Recuperação', 'Contemplação'], reversed: ['Inquietação', 'Exaustão'] },
  { id: 54, name: 'Cinco de Espadas', arcana: 'minor', suit: 'Espadas', number: 5, element: 'Ar', upright: ['Conflito', 'Derrota', 'Vitória vazia'], reversed: ['Reconciliação', 'Fazer as pazes'] },
  { id: 55, name: 'Seis de Espadas', arcana: 'minor', suit: 'Espadas', number: 6, element: 'Ar', upright: ['Transição', 'Movimento', 'Deixar ir'], reversed: ['Stuck', 'Resistência'] },
  { id: 56, name: 'Sete de Espadas', arcana: 'minor', suit: 'Espadas', number: 7, element: 'Ar', upright: ['Engano', 'Traição', 'Segredo'], reversed: ['Confissão', 'Honestidade'] },
  { id: 57, name: 'Oito de Espadas', arcana: 'minor', suit: 'Espadas', number: 8, element: 'Ar', upright: ['Prisão', 'Restrição', 'Vulnerabilidade'], reversed: ['Libertação', 'Novas perspectivas'] },
  { id: 58, name: 'Nove de Espadas', arcana: 'minor', suit: 'Espadas', number: 9, element: 'Ar', upright: ['Ansiedade', 'Pesadelos', 'Angústia'], reversed: ['Esperança', 'Curar'] },
  { id: 59, name: 'Dez de Espadas', arcana: 'minor', suit: 'Espadas', number: 10, element: 'Ar', upright: ['Fim doloroso', 'Traição', 'Rebirth'], reversed: ['Recuperação', ' Regeneração'] },
  { id: 60, name: 'Princesa de Espadas', arcana: 'minor', suit: 'Espadas', number: 11, element: 'Ar', upright: ['Curiosidade', 'Verdade', 'Clareza'], reversed: ['Malícia', 'Fofoca'] },
  { id: 61, name: 'Cavalo de Espadas', arcana: 'minor', suit: 'Espadas', number: 12, element: 'Ar', upright: ['Inteligência', 'Comunicação', 'Verdade'], reversed: ['Manipulação', 'Inveja'] },
  { id: 62, name: 'Rainha de Espadas', arcana: 'minor', suit: 'Espadas', number: 13, element: 'Ar', upright: ['Independência', 'Lógica', 'Objectividade'], reversed: ['Frieza', 'Crueldade'] },
  { id: 63, name: 'Rei de Espadas', arcana: 'minor', suit: 'Espadas', number: 14, element: 'Ar', upright: ['Autoridade', 'Verdade', 'Honestidade'], reversed: ['Abuso de poder', 'Tirania'] },
  // Ouros (Pentáculos)
  { id: 64, name: 'Ás de Ouros', arcana: 'minor', suit: 'Ouros', number: 1, element: 'Terra', upright: ['Novos recursos', 'Prosperidade', 'Novos empreendimentos'], reversed: ['Oportunidades perdidas', 'Ganância'] },
  { id: 65, name: 'Dois de Ouros', arcana: 'minor', suit: 'Ouros', number: 2, element: 'Terra', upright: ['Equilíbrio', 'Adaptabilidade', 'Multitarefa'], reversed: ['Desequilíbrio', 'Desorganização'] },
  { id: 66, name: 'Três de Ouros', arcana: 'minor', suit: 'Ouros', number: 3, element: 'Terra', upright: ['Trabalho em equipe', 'Colaboração', 'Habilidade'], reversed: ['Falta de trabalho em equipe', 'Competição'] },
  { id: 67, name: 'Quatro de Ouros', arcana: 'minor', suit: 'Ouros', number: 4, element: 'Terra', upright: ['Segurança', 'Austeridade', 'Poupança'], reversed: ['Avidez', 'Mesquinhez'] },
  { id: 68, name: 'Cinco de Ouros', arcana: 'minor', suit: 'Ouros', number: 5, element: 'Terra', upright: ['Dificuldade', 'Pobreza', 'Isolamento'], reversed: ['Recuperação', 'Melhora'] },
  { id: 69, name: 'Seis de Ouros', arcana: 'minor', suit: 'Ouros', number: 6, element: 'Terra', upright: ['Generosidade', 'Caridade', 'Compartilhar'], reversed: ['Egoísmo', 'Dívida'] },
  { id: 70, name: 'Sete de Ouros', arcana: 'minor', suit: 'Ouros', number: 7, element: 'Terra', upright: ['Paciência', 'Recompensa', 'Investimento'], reversed: ['Impaciência', 'Frustração'] },
  { id: 71, name: 'Oito de Ouros', arcana: 'minor', suit: 'Ouros', number: 8, element: 'Terra', upright: ['Dedicação', 'Habilidade', 'Trabalho árduo'], reversed: ['Perfeccionismo', 'Insatisfação'] },
  { id: 72, name: 'Nove de Ouros', arcana: 'minor', suit: 'Ouros', number: 9, element: 'Terra', upright: ['Abundância', 'Luxo', 'Auto-suficiência'], reversed: ['Compromisso excessivo', 'Avidez'] },
  { id: 73, name: 'Dez de Ouros', arcana: 'minor', suit: 'Ouros', number: 10, element: 'Terra', upright: ['Riqueza', 'Herança', 'Família'], reversed: ['Problemas financeiros', 'Divisão familiar'] },
  { id: 74, name: 'Princesa de Ouros', arcana: 'minor', suit: 'Ouros', number: 11, element: 'Terra', upright: ['Abundância', 'Segurança', 'Eficiência'], reversed: ['Gastador compulsivo', 'Avidez'] },
  { id: 75, name: 'Cavalo de Ouros', arcana: 'minor', suit: 'Ouros', number: 12, element: 'Terra', upright: ['Eficiência', 'Responsabilidade', 'Trabalho'], reversed: ['Procrastinação', 'Trabalhador preguiçoso'] },
  { id: 76, name: 'Rainha de Ouros', arcana: 'minor', suit: 'Ouros', number: 13, element: 'Terra', upright: ['Praticidade', 'Abundância', 'Segurança'], reversed: ['Avidez', 'Gastador compulsivo'] },
  { id: 77, name: 'Rei de Ouros', arcana: 'minor', suit: 'Ouros', number: 14, element: 'Terra', upright: ['Prosperidade', 'Segurança', 'Generosidade'], reversed: ['Avidez', 'Mesquinhez'] },
];

// ─── INTERPRETATIONS DATA ────────────────────────────────────────────────────

const CARD_INTERPRETATIONS: CardInterpretation[] = [
  { cardName: 'O Louco', tags: ['início', 'liberdade', 'aventura', 'spontaneidade'], summary: 'Novo começo cheio de possibilidades e aventuras.', general: 'O Louco representa novos começos, espontaneidade e uma jornada de auto-descoberta. Convida você a abraçar a liberdade e confiar no caminho à frente.', love: 'Amor nascente, romance espontâneo, ou convite para explorar novos territórios emocionais.', career: 'Nova oportunidade de carreira, projeto criativo, ou mudança profissional empolgante.', shadow: ['Irresponsabilidade', 'ignorar consequências', 'se perder'], affirmations: ['Confio no meu caminho', 'Abraço novas aventuras', 'Estou aberto a possibilidades'] },
  { cardName: 'O Mago', tags: ['vontade', 'habilidade', 'manifestação', 'podER'], summary: 'Você tem todas as ferramentas para criar o que deseja.', general: 'O Mago representa sua capacidade de manifestar seus desejos usando sua vontade e habilidades. Você tem tudo que precisa para ter sucesso.', love: 'Atração, magnetismo pessoal, ou chamariz para um novo relacionamento.', career: 'Capacidade de realizar seus objetivos profissionais, habilidades de comunicação.', shadow: ['Manipulação', 'usar habilidades para enganar'], affirmations: ['Tenho todas as habilidades que preciso', 'Eu crio minha realidade', 'Minha vontade é forte'] },
  { cardName: 'A Sacerdotisa', tags: ['intuição', 'mistério', 'sabedoria', 'interior'], summary: 'Confie na sua sabedoria interior e nos mistérios além do visível.', general: 'A Sacerdotisa representa o conhecimento profundo, sua intuição e os mistérios que estão além do mundo físico. Convida você a olhar para dentro.', love: 'Conexão espiritual no relacionamento, mistério emocional, ou intuição sobre questões amorosas.', career: 'Trabalho intuitivo, carreiras que envolvem mistério ou conhecimento oculto.', shadow: ['Segredos', 'omissão de informações importantes'], affirmations: ['Confio na minha intuição', 'Minha sabedoria interior é forte', 'Eu compreendo os mistérios'] },
  { cardName: 'A Imperatriz', tags: ['fertilidade', 'criatividade', 'natureza', 'abundância'], summary: 'Plenitude criativa e conexão com a natureza e abundância.', general: 'A Imperatriz representa fertilidade, criatividade e abundância. Ela está conectada à natureza e à energia feminina criadora.', love: 'Amor romântico, fertilidade, conexão emocional profunda.', career: 'Sucesso criativo, projetos artísticos, ou ventures relacionadas à natureza.', shadow: ['Dependência', 'esperar ser cuidado'], affirmations: ['Eu sou criativa e abundante', 'Minha fertilidade é uma bênção', 'Conecto-me com a energia da natureza'] },
  { cardName: 'O Imperador', tags: ['autoridade', 'estrutura', 'liderança', 'estabilidade'], summary: 'Organização, autoridade e estrutura para criar estabilidade.', general: 'O Imperador representa autoridade, estrutura e liderança. Ele traz estabilidade e ordem para sua vida.', love: 'Estrutura no relacionamento, compromisso, ou necessidade de limites.', career: 'Sucesso em posições de liderança, estruturação de projetos.', shadow: ['Rigidez', 'dominação', 'falta de flexibilidade'], affirmations: ['Eu sou um líder forte', 'Crio estrutura e estabilidade', 'Minha autoridade vem de dentro'] },
  { cardName: 'O Papa', tags: ['tradição', 'espiritualidade', 'dogma', 'ensino'], summary: 'Busca conhecimento espiritual e conexão com tradições.', general: 'O Papa representa tradição, espiritualidade e ensinamentos. Ele busca conhecimento através de sistemas estabelecidos.', love: 'Relacionamento tradicional, valores compartilhados, ou busca espiritual juntos.', career: 'Carreira em áreas religiosas/educacionais, ou busca de conhecimento especializado.', shadow: ['Dogma', 'rigidez de pensamento', 'resistência a novas ideias'], affirmations: ['Busco conhecimento espiritual', 'Honro as tradições', 'Aprendo com os mestres'] },
  { cardName: 'Os Enamorados', tags: ['amor', 'escolha', 'união', 'harmonia'], summary: 'Decisões importantes sobre amor e parcerias.', general: 'Os Enamorados representam amor, escolhas importantes e união. Este cartão fala sobre decisões que afetam seus relacionamentos.', love: 'Amor profundo, escolhas sobre parcerias, ou união espiritual.', career: 'Decisões importantes sobre parcerias profissionais ou caminhos de carreira.', shadow: ['Indecision', 'escolhas precipitadas', 'disharmony'], affirmations: ['Escolho com amor', 'Meu coração guia minhas decisões', 'Amo e sou amado'] },
  { cardName: 'O Carro', tags: ['vitória', 'controle', 'determinação', 'conquistar'], summary: 'Vitória através de força de vontade e determinação.', general: 'O Carro representa vitória, controle e determinação. Ele indica que você pode conquistar seus obstáculos com força de vontade.', love: 'Conquistar o coração de alguém, controlar a situação emocional, ou determinar a direção do relacionamento.', career: 'Sucesso através de determinação, conquista de objetivos profissionais.', shadow: ['Agressividade', 'falta de direção', 'imprudência'], affirmations: ['Conquisto meus objetivos', 'Minha determinação é forte', 'Tenho controle sobre meu destino'] },
  { cardName: 'A Justiça', tags: ['equilíbrio', 'verdade', 'lei', 'karma'], summary: 'Equilíbrio, verdade e consequências de suas ações.', general: 'A Justiça representa equilíbrio, verdade e as consequências de suas ações. Ela traz clareza e honestidade.', love: 'Decisões justas sobre relacionamentos, verdade sobre questões emocionais.', career: 'Decisões éticas no trabalho, consequências de ações profissionais.', shadow: ['Injustiça', 'desonestidade', 'vindicta'], affirmations: ['A verdade me liberta', 'Minhas ações têm consequências justas', 'Busco equilíbrio em tudo'] },
  { cardName: 'O Eremita', tags: ['introspecção', 'solidão', 'busca interior', 'sabedoria'], summary: 'Tempo para introspecção e busca de sabedoria interior.', general: 'O Eremita representa introspecção, solidão e busca interior. Ele convida você a se retirar para encontrar sua luz interior.', love: 'Retiro para reflexão emocional, buscar clareza sobre o amor, ou solidão necessária.', career: 'Tempo para reflexão profissional, buscar clareza sobre carreira.', shadow: ['Isolamento excessivo', 'medo de interação social'], affirmations: ['Encontro luz na solidão', 'Minha sabedoria interior cresce', 'Tempo de reflexão traz clareza'] },
  { cardName: 'A Roda da Fortuna', tags: ['ciclos', 'destino', 'sorte', 'mudança'], summary: 'Ciclos de mudança e o fluxo do destino.', general: 'A Roda da Fortuna representa ciclos de mudança e o fluxo do destino. Ela indica que a sorte está em movimento.', love: 'Mudanças nos relacionamentos, destino afetando questões amorosas.', career: 'Mudanças profissionais, oportunidade de sorte, ou virada de carreira.', shadow: ['Má sorte', 'ciclo negativo', 'resistência à mudança'], affirmations: ['Aceito os ciclos da vida', 'O destino me favorece', 'Mudanças trazem novas oportunidades'] },
  { cardName: 'A Força', tags: ['coragem', 'força interior', 'compaixão', 'persistência'], summary: 'Força interior através de coragem e compaixão.', general: 'A Força representa coragem, força interior e compaixão. Ela mostra que você pode superar desafios com graciosidade.', love: 'Força emocional no relacionamento, coragem de amar, compaixão pelo parceiro.', career: 'Persistência no trabalho, coragem para enfrentar desafios profissionais.', shadow: ['Medo', 'insegurança', 'fraqueza'], affirmations: ['Minha força vem de dentro', 'Tenho coragem e compaixão', 'Supero desafios com graciosidade'] },
  { cardName: 'O Enforcado', tags: ['sacrifício', 'nova perspectiva', 'pausa'], summary: 'Sacrifício temporário para ganhar nova perspectiva.', general: 'O Enforcado representa sacrifício temporário e nova perspectiva. Ele pede que você pause e veja as coisas de outro ângulo.', love: 'Sacrifício por amor, novo ponto de vista sobre relacionamentos.', career: 'Sacrifício profissional temporário, nova perspectiva sobre carreira.', shadow: ['Estagnação', 'resistência', 'imobilidade'], affirmations: ['Minha perspectiva muda', 'O sacrifício traz clareza', 'Pausa para novo ponto de vista'] },
  { cardName: 'A Morte', tags: ['transformação', 'fim de ciclo', 'renascimento'], summary: 'Transformação profunda e fim de um ciclo para novo começo.', general: 'A Morte representa transformação profunda e o fim de um ciclo. Ela traz renascimento e novos começos.', love: 'Transformação no relacionamento, fim de um padrão, novo começo emocional.', career: 'Fim de uma fase profissional, transformação de carreira.', shadow: ['Medo de mudança', 'resistência ao fim', 'transformação dolorosa'], affirmations: ['Aceito a transformação', 'Fins trazem novos começos', 'Renascimento está chegando'] },
  { cardName: 'A Temperança', tags: ['equilíbrio', 'paciência', 'harmonia', 'moderação'], summary: 'Equilíbrio e harmonia através de moderação e paciência.', general: 'A Temperança representa equilíbrio, harmonia e moderação. Ela pede paciência e vista para encontrar o meio termo.', love: 'Harmonia no relacionamento, equilíbrio emocional, paciência amorosa.', career: 'Equilíbrio trabalho-vida, moderação profissional, harmonia no ambiente de trabalho.', shadow: ['Desequilíbrio', 'excesso', 'impaciência'], affirmations: [' encontro equilíbrio', 'Paciência traz harmonia', 'Moderação é minha força'] },
  { cardName: 'O Diabo', tags: ['prisão interior', 'vínculos', 'materialismo', 'sombra'], summary: 'Prisão interior e vínculos que precisam ser quebrados.', general: 'O Diabo representa prisão interior, vínculos e materialismo. Ele indica padrões que o prendem e precisam ser libertados.', love: 'Vínculos emocionais problemáticos, prender-se ao passado, ou dependência tóxica.', career: 'Vínculos profissionais, dependência de dinheiro, ou padrões que limitam sucesso.', shadow: ['Manipulação', 'vício', 'cativeiro auto-imposto'], affirmations: ['Liberta-me das correntes', 'Rompo os vínculos', 'Sou livre de prisões interiores'] },
  { cardName: 'A Torre', tags: ['destruição', 'revelação', 'despertar', 'choque'], summary: 'Destruição de estruturas antigas para revelar nova verdade.', general: 'A Torre representa destruição de estruturas antigas e revelação. Ela traz um despertar através de eventos surpreendentes.', love: 'Revelação dolorosa no relacionamento, destruição de ilusões, despertar emocional.', career: 'Mudança repentina no trabalho, revelação que transforma a carreira.', shadow: ['Medo de mudança', 'evitar destruição necessária', ' apego ao antigo'], affirmations: ['A destruição traz renovação', 'Revelações me libertam', 'Despertar para nova verdade'] },
  { cardName: 'A Estrela', tags: ['esperança', 'inspiração', 'serenidade', 'cura'], summary: 'Esperança e inspiração após tempos difíceis.', general: 'A Estrela representa esperança, inspiração e serenidade. Ela traz cura e renovação após tempos difíceis.', love: 'Esperança no amor, cura emocional, nova inspiração no relacionamento.', career: 'Nova esperança profissional, inspiração criativa, cura no trabalho.', shadow: ['Desesperança', 'descontentamento', 'falta de fé'], affirmations: ['Minha esperança brilha', 'A inspiração me guia', 'Serenidade habita em mim'] },
  { cardName: 'A Lua', tags: ['ilusão', 'intuição', 'inconsciente', 'medo'], summary: 'Navegar pelo inconsciente e enfrentar medos através da intuição.', general: 'A Lua representa ilusão, intuição e o inconsciente. Ela pede que você navegue pelos seus medos usando sua intuição.', love: 'Ilusões no amor, questões inconscientes,intuição emocional profunda.', career: 'Incerteza profissional, perlu探测 liar, ou seguir a intuição no trabalho.', shadow: ['Medo', 'confusão', 'ilusión', 'engano'], affirmations: ['Minha intuição me guia', 'Enfrento meus medos', 'Vejo através da ilusión'] },
  { cardName: 'O Sol', tags: ['sucesso', 'vitalidade', 'alegria', 'optimismo'], summary: 'Sucesso, alegria e vitalidade em pleno brilho.', general: 'O Sol representa sucesso, vitalidade e alegria. Ele traz claridade e otimismo para iluminar seu caminho.', love: 'Sucesso amoroso, alegria no relacionamento, vitalidade emocional.', career: 'Sucesso profissional, reconhecimento, energia positiva no trabalho.', shadow: ['Bloqueio temporário', 'otimismo exagerado', 'evitar realidade'], affirmations: ['Brilho com sucesso', 'Minha alegria é radiante', 'O sol ilumina meu caminho'] },
  { cardName: 'O Julgamento', tags: ['juízo', 'renascimento', 'avaliação', 'propósito'], summary: 'Avaliação profunda e chamado para seu propósito verdadeiro.', general: 'O Julgamento representa avaliação, renascimento e chamado para seu propósito. Ele pede que você responda ao chamado de sua verdadeira natureza.', love: 'Avaliação do relacionamento, chamado para renovado compromisso, despertar para propósito compartilhado.', career: 'Chamado profissional, avaliação de carreira, renascimento no trabalho.', shadow: ['Auto-repreensão', 'ignorar a consciência', 'juízo severo'], affirmations: ['Respondo ao meu chamado', 'Meu propósito está claro', 'Renascimento acontece agora'] },
  { cardName: 'O Mundo', tags: ['completude', 'realização', 'harmonia', 'integração'], summary: 'Completude e realização de um ciclo completo.', general: 'O Mundo representa completude, realização e harmonia. Ele indica que um ciclo importante está completo e você alcançou integração.', love: 'Realização no amor, harmonia no relacionamento, completude emocional.', career: 'Sucesso completo na carreira, realização profissional, fim bem-sucedido de um projeto.', shadow: ['Incompletude', 'frustração', 'sentir que falta algo'], affirmations: ['Completude é minha realidade', 'Realizei meu potencial', 'Harmonia e integração me guiam'] },
];

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/tarot/data - Get tarot data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const card = searchParams.get('card');
    const interpretation = searchParams.get('interpretation');

    // Return specific card by number/ID or name
    if (card) {
      const cardNum = parseInt(card, 10);
      if (!isNaN(cardNum)) {
        const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
        const cardData = allCards.find((c) => c.id === cardNum);
        if (cardData) {
          return NextResponse.json({ success: true, data: cardData });
        }
      }
      // Try finding by name
      const cardName = card.toLowerCase().replace(/[^a-záéíóúàèìòùâêîôûãõç\s]/g, '').trim();
      const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
      const foundCard = allCards.find((c) => 
        c.name.toLowerCase().includes(cardName) || 
        cardName.includes(c.name.toLowerCase())
      );
      if (!foundCard) {
        return NextResponse.json(
          { success: false, error: 'Card not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: foundCard });
    }

    // Return card interpretation by name
    if (interpretation) {
      const interp = CARD_INTERPRETATIONS.find(
        (i) => i.cardName.toLowerCase() === interpretation.toLowerCase()
      );
      if (!interp) {
        return NextResponse.json(
          { success: false, error: 'Interpretation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: interp });
    }

    // Return specific tarot data by ID
    if (id) {
      const cardNum = parseInt(id, 10);
      if (!isNaN(cardNum)) {
        const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
        const cardData = allCards.find((c) => c.id === cardNum);
        if (cardData) {
          return NextResponse.json({ success: true, data: cardData });
        }
      }

      // Check special IDs
      if (id === 'major' || id === 'majorArcana') {
        return NextResponse.json({ success: true, data: MAJOR_ARCANA_CARDS });
      }
      if (id === 'minor' || id === 'minorArcana') {
        return NextResponse.json({ success: true, data: MINOR_ARCANA_CARDS });
      }
      if (id === 'interpretations' || id === 'interpretacao') {
        return NextResponse.json({ success: true, data: CARD_INTERPRETATIONS });
      }
      if (id === 'all' || id === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            major: MAJOR_ARCANA_CARDS,
            minor: MINOR_ARCANA_CARDS,
            interpretations: CARD_INTERPRETATIONS,
            total: MAJOR_ARCANA_CARDS.length + MINOR_ARCANA_CARDS.length,
          },
        });
      }
      if (id === 'suits' || id === 'naipes') {
        return NextResponse.json({
          success: true,
          data: ['Paus', 'Copas', 'Espadas', 'Ouros'],
        });
      }
      if (id === 'elements' || id === 'elementos') {
        return NextResponse.json({
          success: true,
          data: ['Fogo', 'Água', 'Ar', 'Terra'],
        });
      }

      // Try finding card by name
      const cardName = id.toLowerCase().replace(/[^a-záéíóúàèìòùâêîôûãõç\s]/g, '').trim();
      const allCards = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];
      const foundCard = allCards.find((c) => 
        c.name.toLowerCase().includes(cardName) || 
        cardName.includes(c.name.toLowerCase())
      );
      if (foundCard) {
        return NextResponse.json({ success: true, data: foundCard });
      }

      return NextResponse.json(
        { success: false, error: 'Tarot data not found' },
        { status: 404 }
      );
    }

    // Return specific type of tarot data
    if (type) {
      if (type === 'major' || type === 'majorArcana') {
        return NextResponse.json({ success: true, data: MAJOR_ARCANA_CARDS });
      }
      if (type === 'minor' || type === 'minorArcana') {
        return NextResponse.json({ success: true, data: MINOR_ARCANA_CARDS });
      }
      if (type === 'interpretations' || type === 'interpretacao') {
        return NextResponse.json({ success: true, data: CARD_INTERPRETATIONS });
      }
      if (type === 'all' || type === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            major: MAJOR_ARCANA_CARDS,
            minor: MINOR_ARCANA_CARDS,
            interpretations: CARD_INTERPRETATIONS,
            total: MAJOR_ARCANA_CARDS.length + MINOR_ARCANA_CARDS.length,
          },
        });
      }
      if (type === 'suits' || type === 'naipes') {
        return NextResponse.json({
          success: true,
          data: ['Paus', 'Copas', 'Espadas', 'Ouros'],
        });
      }
      if (type === 'elements' || type === 'elementos') {
        return NextResponse.json({
          success: true,
          data: ['Fogo', 'Água', 'Ar', 'Terra'],
        });
      }
    }

    // Default: return all tarot data
    return NextResponse.json({
      success: true,
      data: {
        major: MAJOR_ARCANA_CARDS,
        minor: MINOR_ARCANA_CARDS,
        interpretations: CARD_INTERPRETATIONS,
        total: MAJOR_ARCANA_CARDS.length + MINOR_ARCANA_CARDS.length,
      },
    });
  } catch (error) {
    console.error('Tarot Data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}