/**
 * Significados Curados — Escala Temporal (Mandato) (F-219, F-220)
 *
 * 4 escalas de Mandato:
 * - D (Dia) — 24h
 * - S (Semana) — 7 dias
 * - Z (Zodíaco) — 30 dias (trânsito solar)
 * - V (Vida) — ano pessoal, ciclo 9, fase de vida
 *
 * Fontes (axioma 4 VISION §3):
 * - VISION §4 (Mandato), synthesis_v1 §5.
 *
 * Princípios editoriais:
 * - PT-BR primeiro (Axioma 8).
 * - Cada `essencia` ≤22 palavras. Cada `pratica` 1 linha de UI.
 * - Citação obrigatória (Axioma 4).
 */
import type { SignificadoCurado } from './significados-curados';

export const ESCALA_TEMPORAL: SignificadoCurado[] = [
  {
    id: 'D',
    pilar: 'cabala',
    titulo: 'Escala · Dia',
    essencia: 'Mandato para as próximas 24h. O ritmo do dia. Atenção ao instante.',
    missao: 'O que faço AGORA? O que diz a respiração do dia?',
    sombra: 'Reagir a tudo, viver em emergência.',
    pratica: 'Verifique 1 vez: o que este dia está pedindo de você, em 1 frase.',
    conexao: 'Dia fala com Lua (P2), Hexagrama do dia (P5) e Pilar 1 ativo.',
    fonte: 'VISION §4 (Mandato); synthesis_v1 §5',
  },
  {
    id: 'S',
    pilar: 'cabala',
    titulo: 'Escala · Semana',
    essencia: 'Mandato para os próximos 7 dias. O ritmo de um arco semanal.',
    missao: 'Onde estou nesta semana? O que se completa, o que começa?',
    sombra: 'Acelerar demais, não respeitar o tempo da semana.',
    pratica: 'Revise o que você plantou 7 dias atrás. O que brotou?',
    conexao: 'Semana fala com Ano Pessoal (P1) e fases da Lua (P2).',
    fonte: 'VISION §4',
  },
  {
    id: 'Z',
    pilar: 'cabala',
    titulo: 'Escala · Zodíaco',
    essencia: 'Mandato para o ciclo de 30 dias (trânsito solar). O ritmo do mês.',
    missao: 'Que trânsito solar me atravessa este mês? O que ativa, o que pede atenção?',
    sombra: 'Viver em função do calendário, perder o tempo interior.',
    pratica: 'Verifique o trânsito do Sol. 1 planeta em aspecto forte. 1 prática em 1 frase.',
    conexao: 'Zodíaco fala com signos (P2) e Dasha (P2·Védica).',
    fonte: 'VISION §4',
  },
  {
    id: 'V',
    pilar: 'cabala',
    titulo: 'Escala · Vida',
    essencia: 'Mandato para o ciclo maior (ano pessoal, ciclo 9, fase da vida).',
    missao: 'Que fase da vida estou vivendo? O que o ciclo maior pede?',
    sombra: 'Projetar futuro infinito, perder o presente.',
    pratica: 'Identifique o Ano Pessoal em que você está. 1 tema. 1 ação.',
    conexao: 'Vida fala com Ano Pessoal (P1), Saturno retorna (P2), Mente Divina (P3·11).',
    fonte: 'VISION §4',
  },
];
