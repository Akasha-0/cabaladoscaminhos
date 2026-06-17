/**
 * Foco do Dia por Área — F-239
 *
 * O Diario mostra hoje 8 (ou 9, pós-F-235 sexualidade) Áreas com traduções
 * do Pilar principal. Mas em qualquer dia real, o usuário SABE em qual
 * Área precisa de luz. Ele não quer ver todas — quer foco.
 *
 * Este módulo devolve 1 priorização personalizada:
 *   - Mensagem do Pilar principal PARA a Área escolhida
 *   - Ecos dos outros 4 Pilares para esta Área
 *   - Conexões que tocam esta Área
 *   - 1 Sombra para observar
 *   - 1 Prática concreta de 3-5 min
 *   - 1 Frase de acolhimento
 *
 * Cruza o Pilar principal do dia com a Área priorizada. Pilar é
 * FILTRO — Área é FOCO. Resultado: 1 tela, 1 voz.
 *
 * Pilar 4 (Odu) marca `requer_terreiro: true` (R-022 §4.4).
 */

import { traducaoPara, type Area } from './traducao-areas';
import { conexoesDe, type ConexaoPilar } from './conexoes-pilares';
import { significadoGenericoDoPilar, type Pilar } from './significados-curados';

export interface FocoDoDia {
  area: Area;
  pilar: Pilar;
  /** O que o Pilar principal diz PARA essa Área (1 frase direta). */
  mensagem_pilar: string;
  /** Como os outros 4 Pilares conversam com a Área (1 linha cada). */
  ecos_dos_pilares: string[];
  /** Conexões (Pilar → outro Pilar) que tocam esta Área via "frase". */
  conexoes: ConexaoPilar[];
  /** 1 sombra para observar. */
  sombra: string;
  /** 1 prática concreta de 3-5 min. */
  pratica: string;
  /** 1 frase de acolhimento. */
  acolhimento: string;
  /** Se Pilar 4 (Odu) — recomenda terreiro. */
  requer_terreiro: boolean;
}

const ACOLHIMENTOS: ReadonlyArray<string> = [
  'Você está aqui. Isso já é começo.',
  'Escolher uma área é escolher onde habitar HOJE. Respire.',
  'A luz não se busca — ela se permite. Você escolheu bem.',
  '1 Área de cada vez. Sem pressa. Sem cobrança.',
  'Sua alma pediu essa área. Confie.',
];

const PRATICAS_FOCO: Record<Area, string> = {
  paz: 'Sente 5 min em silêncio. Coloque a mão no coração. Apenas sinta. Sem objetivo. Apenas presença.',
  saude: 'Ande 15 min sem tela, sem fone. Apenas ande. Termine com 3 respirações longas.',
  relacoes: 'Escolha 1 pessoa e diga 1 coisa que você NORMALMENTE não diria. Verdade simples. Sem cálculo.',
  dinheiro: 'Escreva em 1 frase: "O que minha vida pede AGORA em troca de meu tempo?" Releia em 3 dias.',
  trabalho: 'Liste 3 tarefas que você ama. Coloque 1 delas como prioridade do dia. As outras esperam.',
  proposito: 'Escreva 1 frase: "O que eu faria HOJE se soubesse que ninguém vai julgar?" Aja como se a resposta fosse SIM.',
  criatividade: 'Crie 1 coisa em 5 min — sem editar, sem mostrar, sem julgar. A criação pede movimento, não perfeição.',
  espiritualidade: 'Sente 10 min em silêncio TOTAL. Sem música, sem mantra, sem intenção. Apenas esteja.',
};

const SOMBRAS_FOCO: Record<Area, string> = {
  paz: 'Tens medo de silenciar porque o que você não ouve pode ser maior do que o que você ouve.',
  saude: 'Tens usado o corpo como máquina. O corpo também é templo. Cuida de hoje.',
  relacoes: 'Tens confundido "amar" com "controlar" ou "ser controlado". Volte ao centro.',
  dinheiro: 'Tens tratado dinheiro como prova de valor. Ele é troca, não veredito.',
  trabalho: 'Tens confundido ocupar tempo com cumprir propósito. Volte ao que importa.',
  proposito: 'Tens adiado a pergunta "para quê?" até que ela virou ruído. Responda HOJE.',
  criatividade: 'Tens julgado a criação antes de criar. Crie primeiro, julhe depois (ou nunca).',
  espiritualidade: 'Tens praticado para performar, não para silenciar. Volte ao simples.',
};

const EMOJI: Record<Area, string> = {
  paz: '☮', saude: '♥', relacoes: '◉', dinheiro: '◆',
  trabalho: '⚒', proposito: '✶', criatividade: '✎', espiritualidade: '✦',
};

/** Gera o Foco do Dia dado Pilar principal + Área escolhida. */
export function gerarFocoDoDia(pilar: Pilar, area: Area): FocoDoDia {
  const traducao = traducaoPara(pilar, area);
  const sig = significadoGenericoDoPilar(pilar);

  // Conexões que tocam esta Área via "frase" (heurística)
  const conexoes = conexoesDe(pilar).filter((c) => {
    const f = c.frase.toLowerCase();
    return f.includes(area);
  });

  // Ecos dos outros 4 Pilares para esta Área
  const outrosPilares: Pilar[] = (['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as Pilar[])
    .filter((p) => p !== pilar);
  const ecos_dos_pilares = outrosPilares
    .map((p) => traducaoPara(p, area))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
    .map((t) => `${EMOJI[area]} ${t.frase}`);

  const mensagem_pilar = traducao?.frase ?? sig.essencia;
  const sombra = SOMBRAS_FOCO[area] ?? sig.sombra;
  const pratica = PRATICAS_FOCO[area] ?? sig.pratica;
  const acolhe = ACOLHIMENTOS[Math.floor(Math.random() * ACOLHIMENTOS.length)];
  const requer_terreiro = pilar === 'odu' || traducao?.requer_terreiro === true;

  return {
    area,
    pilar,
    mensagem_pilar,
    ecos_dos_pilares,
    conexoes,
    sombra,
    pratica,
    acolhimento: acolhe,
    requer_terreiro,
  };
}
