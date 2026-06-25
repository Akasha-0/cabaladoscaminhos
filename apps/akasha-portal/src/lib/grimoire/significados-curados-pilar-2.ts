/**
 * Significados Curados — Pilar 2 · Astrologia (F-219, F-220)
 *
 * 3 séries curadas:
 * - PILAR_2_SIGNOS: 12 signos solares
 * - PILAR_2_FASES_LUA: 4 fases lunares (Nova, Crescente, Cheia, Minguante)
 * - PILAR_2_TRINITY: Tríade Sombra · Dom · Graça (R-015 §2.1)
 *
 * Fontes (axioma 4 VISION §3):
 * - Brennan, *Hellenistic Astrology* (2017) + trad. PT-BR de Raffaelli.
 * - R-015 §2.1 (Shadow→Gift→Siddhi), nomenclatura PT-BR R-015 D2.
 *
 * Princípios editoriais:
 * - PT-BR primeiro (Axioma 8).
 * - Cada `essencia` ≤22 palavras. Cada `pratica` 1 linha de UI.
 * - Citação obrigatória (Axioma 4).
 */
import type { PilarVisaoUniversal, SignificadoCurado } from './significados-curados';

const PILAR_2_SIGNOS: SignificadoCurado[] = [
  {
    id: 'Áries',
    pilar: 'astrologia',
    titulo: 'Sol em Áries',
    essencia: 'Iniciar, liderar, abrir caminhos. Sua luz é coragem nova.',
    missao: 'Comece algo hoje, mesmo pequeno. O ímpeto é sua oração.',
    sombra: 'Impaciência, conflito, começar sem terminar.',
    pratica: 'Acenda 1 vela ou inicie 1 lista com a mão dominante. Sinal físico de início.',
    conexao: 'Áries fala com Pioneiro (P1·1) — dois começos convergindo.',
    fonte: 'Brennan 2017, cap. 8',
  },
  {
    id: 'Touro',
    pilar: 'astrologia',
    titulo: 'Sol em Touro',
    essencia: 'Estabilidade, corpo, beleza, presença. Sua luz é o que permanece.',
    missao: 'Ande devagar hoje. Sinta o chão. Coma com atenção.',
    sombra: 'Teimosia, apego, medo de mudar.',
    pratica: 'Pare 1 vez hoje e sinta os pés no chão por 30 segundos.',
    conexao: 'Touro com Construtor (P1·4) — paciência materializada.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Gêmeos',
    pilar: 'astrologia',
    titulo: 'Sol em Gêmeos',
    essencia: 'Conexão, palavra, curiosidade. Sua luz é a ponte entre ideias.',
    missao: 'Pergunte mais. Escute mais. Conecte o que parece desconexo.',
    sombra: 'Dispersão, fofoca, falar sem escutar.',
    pratica: 'Converse 1 vez hoje perguntando só — sem dar sua opinião.',
    conexao: 'Gêmeos com Diplomata (P1·2) — duas pontes em diálogo.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Câncer',
    pilar: 'astrologia',
    titulo: 'Sol em Câncer',
    essencia: 'Cuidar, sentir, lembrar. Sua luz é o lar e o vínculo.',
    missao: 'Vá ao encontro de quem você ama hoje. Recorde quem te formou.',
    sombra: 'Defensividade, apego ao passado, confundir cuidar com controlar.',
    pratica: 'Ligue para 1 pessoa da família. Só escute, sem corrigir.',
    conexao: 'Câncer com Guardião (P1·6) — cuidar como vocação compartilhada.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Leão',
    pilar: 'astrologia',
    titulo: 'Sol em Leão',
    essencia: 'Brilhar, criar, liderar pelo coração. Sua luz é a cena.',
    missao: 'Mostre-se. Não peça desculpa por ocupar espaço.',
    sombra: 'Vaidade, medo de não ser visto, drama.',
    pratica: 'Vista 1 peça que te faça sentir inteiro. Não esconda sua luz hoje.',
    conexao: 'Leão com Realizador (P1·8) e Corpo Radiante (P3·10).',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Virgem',
    pilar: 'astrologia',
    titulo: 'Sol em Virgem',
    essencia: 'Discernir, organizar, servir nos detalhes. Sua luz é o ofício.',
    missao: 'Faça 1 coisa com maestria hoje. Pequena, mas inteira.',
    sombra: 'Autocrítica, perfeccionismo paralisante, preocupação crônica.',
    pratica: 'Termine 1 tarefa simples sem revisar. E aceite o resultado como suficiente.',
    conexao: 'Virgem com Construtor (P1·4) — ofício e estrutura.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Libra',
    pilar: 'astrologia',
    titulo: 'Sol em Libra',
    essencia: 'Equilibrar, harmonizar, relacionar. Sua luz é o espelho.',
    missao: 'Equilibre 1 polaridade na sua vida. Dê tempo igual a 2 partes.',
    sombra: 'Indecisão, dependência, perder-se no outro.',
    pratica: 'Tome 1 decisão adiada hoje. Decida em 5 minutos. Siga em frente.',
    conexao: 'Libra com Diplomata (P1·2) — justiça + cooperação.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Escorpião',
    pilar: 'astrologia',
    titulo: 'Sol em Escorpião',
    essencia: 'Ir ao fundo, transformar, morrer e renascer. Sua luz é a profundidade.',
    missao: 'Encare 1 verdade que você vem evitando. Não a solte. Apenas veja.',
    sombra: 'Controle, ciúme, guardar mágoas como troféu.',
    pratica:
      'Escreva 1 coisa que você ainda não disse a ninguém. Queime o papel (ou guarde em local seguro).',
    conexao: 'Escorpião com Libertador (P1·5) — morte e renascimento.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Sagitário',
    pilar: 'astrologia',
    titulo: 'Sol em Sagitário',
    essencia: 'Buscar sentido, expandir horizontes, dizer a verdade com amor.',
    missao: 'Diga 1 verdade hoje. Com corpo, com presença, com cuidado.',
    sombra: 'Pés no ar, prometer mais do que cumpre, dogmatismo.',
    pratica: 'Leia 1 página de algo que amplia sua visão (não sua timeline).',
    conexao: 'Sagitário com Buscador (P1·7) — sentido e introspecção.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Capricórnio',
    pilar: 'astrologia',
    titulo: 'Sol em Capricórnio',
    essencia: 'Estruturar, perseverar, construir tempo. Sua luz é o longo prazo.',
    missao: 'Honre o tempo. Faça o que precisa ser feito mesmo sem vontade.',
    sombra: 'Frieza, rigidez, viver para o trabalho.',
    pratica: 'Celebre 1 pequena vitória sua de meses atrás. Reconhecer também é estrutura.',
    conexao: 'Capricórnio com Construtor (P1·4) e Realizador (P1·8).',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Aquário',
    pilar: 'astrologia',
    titulo: 'Sol em Aquário',
    essencia: 'Inovar, libertar, servir ao futuro. Sua luz é o que ainda não existe.',
    missao: 'Imagine. Proponha. Não peça permissão para pensar diferente.',
    sombra: 'Frieza emocional, distância, rebeldia por rebeldia.',
    pratica: 'Conecte-se a 1 comunidade alinhada aos seus valores. Você não precisa fazer sozinho.',
    conexao: 'Aquário com Libertador (P1·5) e Humanista (P1·9).',
    fonte: 'Brennan 2017',
  },
  {
    id: 'Peixes',
    pilar: 'astrologia',
    titulo: 'Sol em Peixes',
    essencia: 'Sonhar, compadecer, dissolver fronteiras. Sua luz é o invisível.',
    missao: 'Confie na intuição. Permita-se sentir sem racionalizar.',
    sombra: 'Fuga, confusão, perder a si no mar dos outros.',
    pratica: 'Ande 10 min sem destino. Deixe seu corpo escolher o caminho.',
    conexao: 'Peixes com Iluminador (P1·11) e Mente Divina (P3·11).',
    fonte: 'Brennan 2017',
  },
];

const PILAR_2_FASES_LUA: SignificadoCurado[] = [
  {
    id: 'nova',
    pilar: 'astrologia',
    titulo: 'Lua Nova',
    essencia: 'Início. Semente plantada no escuro. A intenção cria o campo.',
    missao: 'Escolha 1 intenção para as próximas 4 semanas. Escreva à mão.',
    sombra: 'Iniciar e esquecer, plantar sem regar.',
    pratica: 'Acenda 1 vela. Escreva 1 frase de intenção. Olhe-a 1 vez por dia.',
    conexao: 'Lua Nova fala com Pioneiro (P1·1) e Hexagrama 1 (P5) — o Criador.',
    fonte: 'Brennan 2017, cap. 14 (fases lunares)',
  },
  {
    id: 'crescente',
    pilar: 'astrologia',
    titulo: 'Lua Crescente',
    essencia: 'Crescer. A semente rompe a terra. Tensões pedem ação.',
    missao: 'Atue. Faça ajustes. A fase convida ao movimento intencional.',
    sombra: 'Pular etapas, crescer sem raiz.',
    pratica: 'Dê 1 passo concreto hoje na direção do que você iniciou na Lua Nova.',
    conexao: 'Lua Crescente com Construtor (P1·4) — paciência ativa.',
    fonte: 'Brennan 2017',
  },
  {
    id: 'cheia',
    pilar: 'astrologia',
    titulo: 'Lua Cheia',
    essencia: 'Colheita. Revelação. O que estava escondido aparece. Iluminação e tensão.',
    missao: 'Olhe. Veja. Liberte o que já não cabe. Não force — apenas observe e solte.',
    sombra: 'Drama, reatividade, expor o que precisa de calma.',
    pratica: 'Escreva 3 realizações dos últimos 14 dias. Agradeça. Solte 3 tensões.',
    conexao: 'Lua Cheia com Humanista (P1·9) — colheita e visão do todo.',
    fonte: 'Brennan 2017',
  } as SignificadoCurado,
  {
    id: 'minguante',
    pilar: 'astrologia',
    titulo: 'Lua Minguante',
    essencia: 'Soltar. O que termina abre espaço. Desapego consciente.',
    missao: 'Abandone 1 hábito, crença, objeto ou pessoa que já não serve.',
    sombra: 'Forçar término antes da hora, melancolia sem movimento.',
    pratica: 'Limpe 1 gaveta ou arquivo digital. Solte 5 itens. Sinta o espaço.',
    conexao: 'Minguante com Libertador (P1·5) e Humanista (P1·9) — fim que precede início.',
    fonte: 'Brennan 2017',
  },
];

const PILAR_2_TRINITY: SignificadoCurado[] = [
  {
    id: 'sombra',
    pilar: 'astrologia',
    titulo: 'Tríade · Sombra',
    essencia: 'Tensão. Onde os planetas pedem trabalho. O desconforto que ensina.',
    missao: 'Não fuja. Aproxime-se. Pergunte: o que essa tensão quer de mim?',
    sombra: 'Fingir que a tensão não existe, projeção no outro.',
    pratica: 'Nomeie 1 tensão atual em 1 frase. Escreva o que ela pode estar te ensinando.',
    conexao: 'Sombra (P2) com Construtor (P1·4) e Hexagrama 36 (P5) — escuro iluminado.',
    fonte: 'R-015 §2.1 (Shadow→Gift→Siddhi), nomenclatura PT-BR R-015 D2',
  },
  {
    id: 'dom',
    pilar: 'astrologia',
    titulo: 'Tríade · Dom',
    essencia: 'Harmonia. Onde os planetas fluem. Recurso natural, talento encarnado.',
    missao: 'Use. Não espere permissão. Seus dons são responsabilidade.',
    sombra: 'Dormir no talento, repetir sem crescer.',
    pratica: 'Use 1 dom seu hoje em algo concreto. Note o que flui.',
    conexao: 'Dom (P2) com Realizador (P1·8) e Corpo Radiante (P3·10).',
    fonte: 'R-015 §2.1',
  },
  {
    id: 'graca',
    pilar: 'astrologia',
    titulo: 'Tríade · Graça',
    essencia: 'Alinhamento raro. Onde cosmos e intenção coincidem. Ato que transcende técnica.',
    missao: 'Reconheça. Agradeça. Não pegue para si — a Graça é presente, não posse.',
    sombra: 'Apropriar-se da Graça, querer replicar o que é irrepetível.',
    pratica: 'Hoje, ao receber 1 momento de sincronicidade, pare, respire e diga obrigado(a).',
    conexao: 'Graça (P2) com Iluminador (P1·11) e Mente Divina (P3·11).',
    fonte: 'R-015 §2.1 (Siddhi)',
  },
];

export const PILAR_2_SERIES: SignificadoCurado[] = [
  ...PILAR_2_SIGNOS,
  ...PILAR_2_FASES_LUA,
  ...PILAR_2_TRINITY,
];

// ─── Wave 20.1 — Visão Universal do Pilar 2 (Astrologia) ────────────────
//
// Pilar 2 (Astrologia) responde à pergunta **"que céu você trouxe consigo"**.
// Brennan + R-015 mapeiam Sol/Lua/Ascendente/fases/tríade como espelho
// do cosmos no seu primeiro suspiro. Aqui reformulamos em chave
// universalista (5 tradições falando do mesmo) e visceral (fala com corpo).
//
// expandableDetails preserva TODO o conteúdo (12 signos + 4 fases + 3 tríade
// = 19 entradas) — zero info loss.

export const PILAR_2_VISAO_UNIVERSAL: PilarVisaoUniversal = {
  pilar: 'astrologia',
  verdadeUniversal:
    'O céu é espelho, não destino — o mapa mostra o que você pode cultivar.',
  vozesPorTradicao: {
    cabala:
      'O zodíaco é a Árvore da Vida projetada no tempo. Cada signo, uma sefirá do corpo que você veste.',
    astrologia:
      'Sol, Lua, Ascendente, fases, tríade — o cosmos fotografado no primeiro suspiro convida ao livre-arbítrio.',
    tantra:
      'Lua Nova = Corpo 1 (Alma). Lua Cheia = Corpo 10 (Radiante). O zodíaco rege os 11 corpos.',
    odu:
      'As fases da Lua regem ebós e oferendas. Cada lua pede um Ori-don diferente — terreiro confirma.',
    iching:
      '64 hexagramas = 4 fases × 16 estados. A Lua mostra em que fase você respira AGORA.',
  },
  acoesParaCliente: [
    'Olhe o céu hoje. Sem medir, sem julgar.',
    'Siga o trânsito como convite, não como sentença.',
    'Honre a Lua do mês com 1 gesto simples.',
  ],
  expandableDetails: PILAR_2_SERIES.map(
    (s) =>
      `[${s.pilar}|${s.id}] ${s.titulo}\n` +
      `  Essência: ${s.essencia}\n` +
      `  Missão: ${s.missao}\n` +
      `  Sombra: ${s.sombra}\n` +
      `  Prática: ${s.pratica}\n` +
      `  Conexão: ${s.conexao}\n` +
      `  Fonte: ${s.fonte}`
  ).join('\n\n'),
};
