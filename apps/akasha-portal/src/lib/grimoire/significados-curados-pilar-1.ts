/**
 * Significados Curados — Pilar 1 · Cabala (F-219, F-220)
 *
 * 4 séries numéricas curadas:
 * - PILAR_1: Life Path (Caminho de Vida) — 1-9, 11, 22, 33
 * - PILAR_1_BIRTHDAY: derivação do dia — 1-9
 * - PILAR_1_EXPRESSION: expressão do nome — 1-9
 * - PILAR_1_ANO_PESSOAL: ano pessoal — 1-9
 *
 * Fontes (axioma 4 VISION §3):
 * - Mispar Hechrachi (Goldschmidt 2021) + Sefer Yetzirah cap. 4.
 *
 * Princípios editoriais:
 * - PT-BR primeiro (Axioma 8).
 * - Cada `essencia` ≤22 palavras. Cada `pratica` 1 linha de UI.
 * - Citação obrigatória (Axioma 4).
 *
 * Pilar 1 é o eixo — o número sintetiza todos os outros Pilares
 * (ver `significados-curados-helpers.ts`).
 */

import type { SignificadoCurado } from './significados-curados';

const PILAR_1: SignificadoCurado[] = [
  // ── Life Path (Caminho de Vida) — 1-9, 11, 22, 33
  {
    id: 1,
    pilar: 'cabala',
    titulo: 'Pioneiro',
    essencia: 'Liderar pelo exemplo. Iniciar caminhos onde não há trilha, com coragem solitária.',
    missao: 'Comece. Aja primeiro. Sua presença abre portas para outros.',
    sombra: 'Solidão, autoritarismo, medo de precisar dos outros.',
    pratica: 'Escolha 1 ideia que você defende em silêncio e a declare em voz alta hoje.',
    conexao:
      'Pioneiro (P1·1) precisa do Diplomata (P1·2) para ouvir, e do Buscador (P1·7) para parar.',
    fonte: 'Sefer Yetzirah 4:1-3; Mispar Hechrachi, 1 = unidade primordial',
  },
  {
    id: 2,
    pilar: 'cabala',
    titulo: 'Diplomata',
    essencia: 'Construir pontes. Sua força é a escuta, a cooperação, o trabalho em par.',
    missao: 'Conecte. Una. Traduza o que um sente e o outro não sabe dizer.',
    sombra: 'Dependência, indecisão, fusão com o outro perdendo a si.',
    pratica: 'Antes de responder a alguém hoje, repita mentalmente o que ouviu. Só então fale.',
    conexao: 'Diplomata (P1·2) é o par do Pioneiro (P1·1) — juntos, início + sustentação.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 3,
    pilar: 'cabala',
    titulo: 'Criador',
    essencia: 'Expressar. A palavra, a imagem, o som, o gesto. Criar é oração.',
    missao: 'Mostre algo seu. Diário, voz, desenho, dança — o canal importa menos que a verdade.',
    sombra: 'Dispersão, superficialidade, medo de ser profundo.',
    pratica: 'Crie 1 coisa em 3 minutos sem editar. Foto, frase, rabisco. Não mostre a ninguém.',
    conexao: 'Criador (P1·3) fala com o Realizador (P1·8) — expressão vira obra concreta.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 4,
    pilar: 'cabala',
    titulo: 'Construtor',
    essencia: 'Estruturar. Onde outros improvisam, você ergue o alicerce. Paciência é sua oração.',
    missao: 'Faça o que prometeu terminar. Mesmo pequeno. O hábito constrói o templo.',
    sombra: 'Rigidez, medo de mudar, trabalho por medo (não por visão).',
    pratica: 'Escolha 1 tarefa inacabada e dê 25 min focados a ela, sem notificação.',
    conexao: 'Construtor (P1·4) serve ao Humanista (P1·9) — estrutura para servir ao coletivo.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 5,
    pilar: 'cabala',
    titulo: 'Libertador',
    essencia: 'Mudar. Inquietude santa. Onde há sistema preso, você traz ar e movimento.',
    missao: 'Liberte-se de UMA coisa hoje. Pode ser crença, agenda, objeto, conversa.',
    sombra: 'Fuga, vício, liberdade que é só medo disfarçado.',
    pratica: 'Diga "não" para 1 compromisso hoje que você aceitaria por hábito.',
    conexao: 'Libertador (P1·5) precisa do Buscador (P1·7) para não dispersar sem direção.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 6,
    pilar: 'cabala',
    titulo: 'Guardião',
    essencia: 'Cuidar. Lar, família, comunidade, beleza. Você é o tecido que une.',
    missao: 'Sirva. Mas primeiro verifique: estou servindo por amor ou por dever?',
    sombra: 'Sacrifício excessivo, controle, culpa, assumir o peso do outro.',
    pratica:
      'Ofereça 1 ato de cuidado a alguém, e refuse 1 pedido de cuidado a si mesmo por vergonha.',
    conexao: 'Guardião (P1·6) complementa a Mente Divina (P3·11) — cuidar e transcender.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 7,
    pilar: 'cabala',
    titulo: 'Buscador',
    essencia: 'Investigar. Ir para dentro. Perguntar antes de responder. Sua casa é o silêncio.',
    missao: 'Questione 1 crença que você carrega há mais de 5 anos. Só questione; não decida.',
    sombra: 'Isolamento, ceticismo, fuga do mundo em nome da espiritualidade.',
    pratica: 'Fique 10 min em silêncio hoje. Sem música, sem tela, sem companhia.',
    conexao: 'Buscador (P1·7) conversa com Hexagrama 51 (P5) — o trovão que desperta.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 8,
    pilar: 'cabala',
    titulo: 'Realizador',
    essencia:
      'Manifestar no mundo. Poder com propósito. Dinheiro, autoridade, escala são seus materiais.',
    missao:
      'Assuma 1 decisão que você vem adiando. Decida com os 3 corpos: cabeça, coração, ventre.',
    sombra: 'Materialismo, controle, sucesso que esvazia.',
    pratica:
      'Liste 3 conquistas suas que não dependeram só de esforço. Reconheça a força que veio de fora.',
    conexao: 'Realizador (P1·8) com Corpo Radiante (P3·10) — brilhar com poder responsável.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  {
    id: 9,
    pilar: 'cabala',
    titulo: 'Humanista',
    essencia: 'Cuidar do todo. Visão ampla, compaixão universal, ciclos de conclusão.',
    missao: 'Abra o círculo. Inclua quem você costuma excluir. Acolha o ciclo que se encerra.',
    sombra: 'Idealismo, mártir, dificuldade de agir no local e específico.',
    pratica:
      'Agradeça 1 pessoa, 1 lugar, 1 capítulo da sua vida. O que termina bem libera caminho.',
    conexao: 'Humanista (P1·9) é par do Pioneiro (P1·1) — fim que abre novo início.',
    fonte: 'Sefer Yetzirah 4:1-3',
  },
  // ── Master Numbers (Mispar Hechrachi preserva 11, 22, 33)
  {
    id: 11,
    pilar: 'cabala',
    titulo: 'Iluminador · Mestre',
    essencia: 'Canal entre planos. Intuição aguda, visão, inspiração. Você sente antes de saber.',
    missao: 'Confie na primeira impressão. Masterre-a em algo concreto. Visão sem ação esvai.',
    sombra: 'Nervosismo, autoquestionamento, mediunidade sem proteção.',
    pratica: 'Anote 1 insight ao acordar, antes do celular. Releia-o no fim do dia.',
    conexao: 'Iluminador (P1·11) com Mente Divina (P3·11) — visão + transcendência.',
    fonte: 'Mispar Hechrachi; numerologia mestre (cap. Pinnock 2010)',
  },
  {
    id: 22,
    pilar: 'cabala',
    titulo: 'Construtor de Mundos · Mestre',
    essencia:
      'Visão grandiosa que vira matéria. O mais prático dos mestres. O mais visionário dos práticos.',
    missao: 'Escolha 1 projeto de 5 anos. Divida-o em 12 marcos mensais. Comece o primeiro.',
    sombra: 'Pressão interna enorme, sensação de "deveria estar mais à frente".',
    pratica: 'Escreva o que seria uma vida plena em 1 parágrafo. Releia daqui a 30 dias.',
    conexao: 'Mestre 22 (P1) com Construtor (P1·4) — visão alinhada à estrutura.',
    fonte: 'Mispar Hechrachi',
  },
  {
    id: 33,
    pilar: 'cabala',
    titulo: 'Mestre Cósmico · Mestre',
    essencia: 'Serviço incondicional. Cura, ensino, amor universal encarnado. Raro e exigente.',
    missao: 'Sirva sem esperar reconhecimento. Verifique: ainda há alegria no servir?',
    sombra: 'Burnout espiritual, onipotência, salvar o outro para não olhar para si.',
    pratica:
      'Hoje, sirva-se primeiro. 1 refeição em silêncio, 1 banho consciente, 1 sono completo.',
    conexao: 'Mestre 33 (P1) com Humanista (P1·9) e 4 Temperamentos: Fleumático em ação.',
    fonte: 'Mispar Hechrachi',
  },
];

// Pilar 1 — séries secundárias (birthday, expression, ano pessoal) — versões
// compactas. Mantemos o mesmo shape; curadoria profunda virá em F-220.
const PILAR_1_BIRTHDAY: SignificadoCurado[] = Array.from({ length: 9 }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    pilar: 'cabala' as const,
    titulo: `Talento ${n}`,
    essencia: 'Dom natural dado pelo dia de nascimento. Lição a ser vivida com leveza.',
    missao: 'Use-o hoje em algo concreto, sem esperar perfeição.',
    sombra: 'Desenvolver pouco por não reconhecer o dom como dom.',
    pratica: 'Nomeie 1 situação onde esse dom apareceu naturalmente.',
    conexao: 'O dom do dia complementa o Caminho de Vida — o dom é o dom; o caminho é a travessia.',
    fonte: 'Mispar Hechrachi, derivação dia',
  };
});

const PILAR_1_EXPRESSION: SignificadoCurado[] = Array.from({ length: 9 }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    pilar: 'cabala' as const,
    titulo: `Expressão ${n}`,
    essencia: 'Como você se mostra ao mundo. Ferramenta natural de ação e comunicação.',
    missao: 'Use esse canal — escrita, fala, gesto, técnica — sem diminuir.',
    sombra: 'Adequar-se demais ao que os outros esperam, perdendo o estilo próprio.',
    pratica: 'Observe 1 momento em que agiu no piloto automático. Como seria no seu estilo real?',
    conexao: 'A Expressão dá forma visível à missão do Caminho de Vida.',
    fonte: 'Mispar Hechrachi, derivação letras do nome',
  };
});

const PILAR_1_ANO_PESSOAL: SignificadoCurado[] = Array.from({ length: 9 }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    pilar: 'cabala' as const,
    titulo: `Ano ${n}`,
    essencia: `Tema dos próximos 12 meses a partir do seu aniversário. Ciclo ${n} ativo.`,
    missao: 'Siga o que esse ano pede — sem pressa de pular para o próximo.',
    sombra: 'Viver no ciclo errado: já planejando o que o ano ainda não trouxe.',
    pratica: 'Revise suas metas dos últimos 12 meses. O que cabe agora? O que já passou?',
    conexao: 'O Ano Pessoal colore o Mandato: 1 frase a mais no Diário para esse ciclo.',
    fonte: 'Mispar Hechrachi, ano pessoal (cálculo modular: dia+mês+ano)',
  };
});

export const PILAR_1_SERIES: SignificadoCurado[] = [
  ...PILAR_1,
  ...PILAR_1_BIRTHDAY,
  ...PILAR_1_EXPRESSION,
  ...PILAR_1_ANO_PESSOAL,
];
