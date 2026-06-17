/**
 * Significados Curados — Pilar 3 · Tântrica (F-219, F-220)
 *
 * 3 séries curadas:
 * - PILAR_3_CORPOS: 11 corpos (Yogi Bhajan, Aquarian Teacher)
 * - PILAR_3_TRIGEMEO: 3 trigêmeos (Físico, Astral, Mental)
 * - PILAR_3_TEMPERAMENTO: 4 temperamentos gregos (Hipócrates, Kant)
 *
 * Fontes (axioma 4 VISION §3):
 * - Yogi Bhajan, *The Aquarian Teacher* (KRI 2007).
 * - Integração com 4 Temperamentos Gregos (R-019) via Hipócrates
 *   *Sobre a Natureza do Homem* (c. 400 a.C.) e Kant *Antropologia* (1798).
 *
 * Princípios editoriais:
 * - PT-BR primeiro (Axioma 8).
 * - Cada `essencia` ≤22 palavras. Cada `pratica` 1 linha de UI.
 * - Citação obrigatória (Axioma 4).
 */

import type { SignificadoCurado } from './significados-curados';

const PILAR_3_CORPOS: SignificadoCurado[] = [
  {
    id: 1,
    pilar: 'tantrica',
    titulo: 'Corpo da Alma',
    essencia: 'Você. Núcleo. Identidade. Presença que sustenta todos os outros corpos.',
    missao: 'Sente-se. Respire. Volte a si. Tudo começa aqui.',
    sombra: 'Buscar a si nos outros. Solidão que pede reconhecimento.',
    pratica: 'Coloque a mão no coração. Sinta o bater por 1 minuto.',
    conexao: 'Corpo 1 (P3) fala com Hexagrama 1 (P5) — fundamento, semente.',
    fonte: 'KRI 2007, Aquarian Teacher: 10 corpos + Mente Divina (11)',
  },
  {
    id: 2,
    pilar: 'tantrica',
    titulo: 'Mente Negativa',
    essencia: 'Discernimento. Capacidade de dizer não, filtrar, proteger.',
    missao: 'Use o "não" como ferramenta. Recuse 1 coisa hoje.',
    sombra: 'Paralisia, ceticismo, medo travestido de prudência.',
    pratica: 'Quando o "não" surgir, antes de justificar, apenas diga: "Não, hoje não."',
    conexao: 'Mente Negativa (P3·2) com Construtor (P1·4) — estrutura interna.',
    fonte: 'KRI 2007',
  },
  {
    id: 3,
    pilar: 'tantrica',
    titulo: 'Mente Positiva',
    essencia: 'Expansão. Capacidade de dizer sim, de confiar, de abrir.',
    missao: 'Diga sim a 1 possibilidade nova. Mesmo com medo.',
    sombra: 'Sim excessivo, ingenuidade, dispersão.',
    pratica: 'Diga sim a 1 convite ou ideia que você costuma recusar por reflexo.',
    conexao: 'Mente Positiva (P3·3) com Pioneiro (P1·1) — abertura ao novo.',
    fonte: 'KRI 2007',
  },
  {
    id: 4,
    pilar: 'tantrica',
    titulo: 'Mente Neutra',
    essencia: 'Mediadora. Onde a negativa e a positiva dialogam. Centro.',
    missao: 'Observe. Não julgue. Apenas veja o que surge e o que passa.',
    sombra: 'Apatia confundida com paz, neutralidade cúmplice.',
    pratica: 'Quando opinião forte surgir, espere 30 segundos antes de falar.',
    conexao: 'Mente Neutra (P3·4) com Buscador (P1·7) — presença que escuta.',
    fonte: 'KRI 2007',
  },
  {
    id: 5,
    pilar: 'tantrica',
    titulo: 'Corpo Físico',
    essencia: 'Templo. A casa onde tudo acontece. Honre o corpo, honre a jornada.',
    missao: 'Mexa-se. Coma com presença. Durma com propósito.',
    sombra: 'Negligência ou obsessão. Corpo como máquina ou como fardo.',
    pratica: 'Caminhe 15 min hoje sem fone, sem tela. Apenas ande.',
    conexao: 'Corpo Físico (P3·5) com Touro (P2) e Construtor (P1·4).',
    fonte: 'KRI 2007',
  },
  {
    id: 6,
    pilar: 'tantrica',
    titulo: 'Linha do Arco',
    essencia: 'Integridade. A linha invisível entre céu e terra que você sustenta.',
    missao: 'Fique reto. Palavra e ato alinhados. O que você diz, seja o que você faz.',
    sombra: 'Desvio, incoerência, promessa vazia.',
    pratica: 'Releia 1 conversa recente. Você disse o que quis dizer?',
    conexao: 'Linha do Arco (P3·6) com Capricórnio (P2) e Construtor (P1·4).',
    fonte: 'KRI 2007',
  },
  {
    id: 7,
    pilar: 'tantrica',
    titulo: 'Aura',
    essencia: 'Campo. O que você irradia além do corpo. Sua atmosfera.',
    missao: 'Note o que você emite. Limpe o que carrega. Proteja o que é seu.',
    sombra: 'Vampirismo, deixar o campo ser invadido.',
    pratica: 'Pare 1 vez hoje. Imagine uma luz de 1 metro ao seu redor. Respire dentro dela.',
    conexao: 'Aura (P3·7) com Escorpião (P2) e Buscador (P1·7).',
    fonte: 'KRI 2007',
  },
  {
    id: 8,
    pilar: 'tantrica',
    titulo: 'Corpo Prânico',
    essencia: 'Vitalidade. Energia que anima. Respiração, vigor, sexo, ânimo.',
    missao: 'Respire fundo. Recarregue. Sinta a energia que você tem.',
    sombra: 'Esgotamento, dispersão da energia, sedentarismo.',
    pratica: 'Faça 3 respirações longas hoje. Inspirar 4, segurar 4, soltar 6.',
    conexao: 'Corpo Prânico (P3·8) com Leão (P2) e Realizador (P1·8).',
    fonte: 'KRI 2007',
  },
  {
    id: 9,
    pilar: 'tantrica',
    titulo: 'Corpo Sutil',
    essencia: 'Intuição. Onde o não-dito se mostra. Voz dos sonhos, pressentimentos.',
    missao: 'Escute. O corpo sutil fala baixo, mas sempre fala. Anote 1 sinal hoje.',
    sombra: 'Ignorar a intuição, viver só do racional.',
    pratica: 'Ao acordar, antes de pensar, pergunte: "O que preciso saber hoje?" Anote o que vier.',
    conexao: 'Corpo Sutil (P3·9) com Peixes (P2) e Iluminador (P1·11).',
    fonte: 'KRI 2007',
  },
  {
    id: 10,
    pilar: 'tantrica',
    titulo: 'Corpo Radiante',
    essencia: 'Brilho. Onde você é visto. A expressão da alma no mundo.',
    missao: 'Brilhe com coragem. Não diminua seu fogo para caber em ambientes pequenos.',
    sombra: 'Apagar-se para ser aceito, medo de ser visto.',
    pratica: 'Hoje, vista 1 peça que te faça sentir radiante. Saia com ela.',
    conexao: 'Corpo Radiante (P3·10) com Leão (P2) e Realizador (P1·8).',
    fonte: 'KRI 2007',
  },
  {
    id: 11,
    pilar: 'tantrica',
    titulo: 'Mente Divina',
    essencia: 'Transcendência. Você como canal. Inspiração, visão, silêncio que fala.',
    missao: 'Confie no invisível. Receba. Não force. A Mente Divina responde ao silêncio.',
    sombra: 'Onipotência, mediunidade sem ancoragem.',
    pratica: 'Sente-se 5 min em silêncio absoluto. Não peça nada. Apenas esteja.',
    conexao: 'Mente Divina (P3·11) com Iluminador (P1·11) e Graça (P2·graca).',
    fonte: 'KRI 2007',
  },
];

const PILAR_3_TRIGEMEO: SignificadoCurado[] = [
  {
    id: 'fisico',
    pilar: 'tantrica',
    titulo: 'Trigêmeo · Físico',
    essencia: 'Ação no corpo. Serviço direto, presença, mãos no mundo.',
    missao: 'Sirva com o corpo hoje. Mexa, carregue, prepare, esteja presente.',
    sombra: 'Ativismo sem reflexão, cansaço por não saber parar.',
    pratica: 'Caminhe 1 km com atenção em cada passo. Termine com 3 respirações.',
    conexao: 'Trigêmeo Físico (P3) com Corpo Físico (P3·5) e Touro (P2).',
    fonte: 'KRI 2007',
  },
  {
    id: 'astral',
    pilar: 'tantrica',
    titulo: 'Trigêmeo · Astral',
    essencia: 'Coração. Onde se sente. Amor, devoção, presença emocional.',
    missao: 'Vá ao coração. Antes de agir, sinta. Antes de decidir, ame.',
    sombra: 'Drama, dependência emocional, confundir sentir com ser.',
    pratica: 'Coloque a mão no coração. Sinta 1 gratidão. Apenas isso, por 1 minuto.',
    conexao: 'Trigêmeo Astral (P3) com Câncer (P2) e Guardião (P1·6).',
    fonte: 'KRI 2007',
  },
  {
    id: 'mental',
    pilar: 'tantrica',
    titulo: 'Trigêmeo · Mental',
    essencia: 'Clareza. Onde se compreende. Discernimento, visão, comunicação.',
    missao: 'Pense com clareza. Pergunte antes de afirmar. Ouça antes de ensinar.',
    sombra: 'Cerebralidade excessiva, frieza, paralisia por análise.',
    pratica: 'Escreva 1 frase que resuma o que você vem pensando há dias.',
    conexao: 'Trigêmeo Mental (P3) com Gêmeos (P2) e Buscador (P1·7).',
    fonte: 'KRI 2007',
  },
];

const PILAR_3_TEMPERAMENTO: SignificadoCurado[] = [
  {
    id: 'sanguineo',
    pilar: 'tantrica',
    titulo: 'Temperamento · Sanguíneo',
    essencia: 'Ar + umidade. Social, comunicativo, otimista. Conecta pessoas.',
    missao: 'Use seu dom de unir. Mas ancore com escuta profunda.',
    sombra: 'Superficialidade, dispersão, falar demais.',
    pratica: 'Em 1 conversa hoje, escute até o fim antes de responder.',
    conexao: 'Sanguíneo (P3) com Diplomata (P1·2) e Gêmeos (P2).',
    fonte: 'Hipócrates, *Sobre a Natureza do Homem* c. 400 a.C.; Kant 1798',
  },
  {
    id: 'colerico',
    pilar: 'tantrica',
    titulo: 'Temperamento · Colérico',
    essencia: 'Fogo + seco. Líder, decidido, executa. Energia para abrir caminhos.',
    missao: 'Lidere, mas verifique: estou liderando para servir ou para controlar?',
    sombra: 'Autoritarismo, impaciência, conflito desnecessário.',
    pratica: 'Antes de decidir hoje, espere 3 respirações. Só então aja.',
    conexao: 'Colérico (P3) com Pioneiro (P1·1) e Áries (P2).',
    fonte: 'Hipócrates c. 400 a.C.',
  },
  {
    id: 'melancolico',
    pilar: 'tantrica',
    titulo: 'Temperamento · Melancólico',
    essencia: 'Terra + seco. Profundo, analítico, sensível. Vê o que outros não veem.',
    missao: 'Aprofunde. Mas não se perca no fundo. Volte ao corpo e à ação.',
    sombra: 'Inação, autocrítica, isolamento.',
    pratica: 'Compartilhe 1 pensamento seu com 1 pessoa de confiança.',
    conexao: 'Melancólico (P3) com Buscador (P1·7) e Escorpião (P2).',
    fonte: 'Hipócrates c. 400 a.C.',
  },
  {
    id: 'fleumatico',
    pilar: 'tantrica',
    titulo: 'Temperamento · Fleumático',
    essencia: 'Água + umidade. Pacífico, constante, acolhedor. Presença que acalma.',
    missao: 'Estabilize. Mas ancore com iniciativa — não espere demais.',
    sombra: 'Passividade, inércia, evitar conflito a qualquer custo.',
    pratica: 'Tome 1 iniciativa hoje, mesmo pequena, sem pedir aprovação.',
    conexao: 'Fleumático (P3) com Guardião (P1·6) e Câncer (P2).',
    fonte: 'Hipócrates c. 400 a.C.',
  },
];

export const PILAR_3_SERIES: SignificadoCurado[] = [
  ...PILAR_3_CORPOS,
  ...PILAR_3_TRIGEMEO,
  ...PILAR_3_TEMPERAMENTO,
];
