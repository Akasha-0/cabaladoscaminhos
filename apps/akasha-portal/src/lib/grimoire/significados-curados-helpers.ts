/**
 * Helper extraído de `significados-curados.ts` (F-219, F-220).
 *
 * Visão geral por Pilar (entrada agregada). Usada quando a API entrega
 * apenas o Pilar ativo (ex: 'cabala') sem o símbolo específico (ex: 11, 22).
 * Permite entregar significado já na página Diario, sem esperar F-220
 * expandir o contrato da API.
 *
 * Princípios (VISION.md §3 axiomas):
 * - Axioma 3: Curadoria contínua de dados/fundamentos. O Grimório é vivo.
 * - Axioma 4: Citação obrigatória. Toda afirmação cita fonte.
 * - Axioma 8: PT-BR primeiro.
 */
import type { Pilar, SignificadoCurado } from './significados-curados';

export function significadoGenericoDoPilar(pilar: Pilar): SignificadoCurado {
  const visoes: Record<Pilar, Omit<SignificadoCurado, 'id' | 'pilar'>> = {
    cabala: {
      titulo: 'Caminho de Vida',
      essencia:
        'Sua missão no mundo, lida pelo cálculo numerológico cabalístico. O número que emerge do seu nascimento revela o tema central desta encarnação.',
      missao:
        'Caminhe o número. Não a carreira, não o status — o número como prática diária de alinhamento.',
      sombra:
        'Viver o número do outro (família, expectativa, comparação) e não o seu. Confundir missão com performance.',
      pratica:
        'Anote 1 decisão sua recente. Ela veio do que você É (número), ou do que esperam de você?',
      conexao:
        'O Pilar 1 (Cabala) é o eixo — o número sintetiza o que os outros 4 Pilares detalhham.',
      fonte: 'Sefer Yetzirah; Mispar Hechrachi',
    },
    astrologia: {
      titulo: 'Céu do seu nascimento',
      essencia:
        'O mapa do céu no momento em que você nasceu. Sol, Lua, Ascendente, planetas, casas, aspectos — o cosmos fotografado no seu primeiro suspiro.',
      missao:
        'Use o céu como espelho, não como destino. O mapa mostra POTENCIAL; você escolhe o que cultivar.',
      sombra: 'Determinismo, fatalismo, viver pelo horóscopo em vez de pelo livre-arbítrio.',
      pratica: 'Leia 1 trânsito do dia. Não como previsão — como convite. O que ele ativa em você?',
      conexao:
        'O Pilar 2 (Astrologia) é a TEMPORALIDADE — o céu se move, o Pilar 1 (Cabala) é fixo.',
      fonte: 'Brennan, Hellenistic Astrology (2017)',
    },
    tantrica: {
      titulo: 'Anatomia sutil',
      essencia:
        'Os 11 corpos tântricos (kundalini yoga): do físico ao divino. Sua anatomia invisível, cotidiana, à mão.',
      missao: 'Sinta o que está vivo. Cada corpo fala. Você tem 11 canais — use mais do que 1.',
      sombra: 'Viver só no corpo 5 (físico), achar que "corpo sutil" é metáfora e não prática.',
      pratica:
        'Pare 1 min. Pergunte: qual corpo está mais ativo AGORA em mim? Físico? Emocional? Intuitivo?',
      conexao: 'O Pilar 3 (Tântrica) é o CORPO — o que sente, o que respira, o que vibra.',
      fonte: 'KRI 2007, Aquarian Teacher (Yogi Bhajan)',
    },
    odu: {
      titulo: 'Ori do seu nascimento',
      essencia:
        'O Odu que rege sua chegada ao mundo. Fornece ancestralidade, Ori (cabeça), caminho de realização dentro da tradição iorubá.',
      missao:
        'Receba com respeito. O Odu não é "seu" — é um vínculo com terreiro, com ancestrais, com a tradição viva. Aprofunde com babalaô/yaô de sua confiança.',
      sombra:
        'Tratar Odu como produto, como curiosidade esotérica, como se pudesse ser interpretado sem terreiro e sem rito.',
      pratica:
        'Pesquise 1 Odu ancestral seu (pai, mãe, avó) e pergunte a 1 mais velho o que ele lembra. Comece pelo vínculo familiar.',
      conexao: 'O Pilar 4 (Odu) é ANCESTRALIDADE — o que veio antes e sustenta o que está aqui.',
      fonte: 'Verger 1973; Mbiti 1969',
      requer_terreiro: true,
    },
    iching: {
      titulo: 'Mutação do seu caminho',
      essencia:
        'O hexagrama (1-64) que rege sua jornada. Muda com o dia, com o mês, com a vida. Não é destino — é cenário do agora.',
      missao:
        'Consulte com regularidade. Não para "prever" — para ESCUTAR. O I Ching é o espelho da mudança.',
      sombra: 'Viver consultando 100x por dia, viciar a leitura, substituir ação por consulta.',
      pratica:
        'Jogue 1 moeda 6 vezes (ouça o I Ching por 3 moedas). Anote o hexagrama. Releia em 7 dias.',
      conexao:
        'O Pilar 5 (I Ching) é MUTAÇÃO — o que muda no tempo, entre os outros 4 Pilares fixos.',
      fonte: 'Wilhelm/Baynes, I Ching: O Livro das Mutações (1950)',
    },
  };
  const v = visoes[pilar];
  return { id: pilar, pilar, ...v };
}
