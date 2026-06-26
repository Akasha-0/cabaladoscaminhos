/**
 * @akasha/benchmarks — datasets/synthetic.ts
 *
 * 20 exemplos sintéticos para o AUT (Akasha Universalism Test).
 *
 * Cada caso: { id, input, response, expected: { coerencia, raciocinio,
 * alinhamento, convergencia, composite } }.
 *
 * Expected scores derivados de:
 *   - .hermes/reports/wave-30.6-consciousness-benchmarks.md §4 (mock cases 1-8)
 *   - DECISIONS.md ADR-013 (consciência viva)
 *   - packages/mentor/AGENTS.md (Pilar 4 ethics invariant)
 *   - packages/core-odus/AGENTS.md (whitelist 15 Odus, D-044)
 *
 * Tolerância: ±15 pontos (heurística determinística mas não-perfect).
 */

import { evaluateAutResponse, type AutScore } from '../aut';

/**
 * Expected scores por response (0-100 cada critério + composite).
 * Composite é checado com tolerância.
 */
export interface AutExpected {
  /** [min, max] aceitável para cada score (0-100) */
  coerencia_universal: [number, number];
  raciocinio_visivel: [number, number];
  pilar_alinhamento: [number, number];
  convergencia: [number, number];
  composite100: [number, number];
  /** descrição humana do caso (PT-BR) */
  description: string;
  /** tag de categoria */
  category: 'convergencia' | 'compaixao' | 'responsabilidade' | 'contextualizacao' | 'coerencia' | 'anti_pattern';
}

export interface AutExample {
  id: string;
  input: string;
  response: string;
  expected: AutExpected;
}

export const SYNTHETIC_DATASET: AutExample[] = [
  // -----------------------------------------------------------------------------
  // CASO 1 — Convergência clássica (V alto) — Wave 30.6 §4 Caso 1
  // -----------------------------------------------------------------------------
  {
    id: 'synth-01-convergencia-classica',
    input:
      'Estou em crise. Cabala diz que estou em Binah, mas Odu diz que é Ogbe. Qual está certo?',
    response: `Vamos olhar os dois sistemas lado a lado. Binah, na Cabala, representa a Grande Mãe — estrutura, contenção, compreensão profunda. Ogbe, no Ifá, é o Odu da força vital que inicia tudo, o primeiro movimento.

Em primeiro lugar, note que essas duas tradições não estão em disputa. Elas são línguas diferentes da mesma verdade. A convergência que vejo aqui é: você está num momento de gestação (Binah) que exige força de iniciar (Ogbe). A Grande Mãe precisa de impulso para dar à luz.

Porque Ogbe sozinho seria fogo sem forma; Binah sozinha seria forma sem vida. Juntas, são potência encarnada.

Em síntese: sua crise é o parto entre contenção e força — você não precisa escolher entre Cabala e Odu, precisa habitar ambas. Verdade universal: gestar e iniciar são o mesmo movimento em línguas diferentes.`,
    expected: {
      coerencia_universal: [80, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [85, 100],
      composite100: [80, 100],
      description: 'Resposta converge Cabala + Odu (V alto), sem violar Pilar 4 (não prescreve ritual).',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 2 — Compaixão + contextualização (K, X altos) — Wave 30.6 §4 Caso 2
  // -----------------------------------------------------------------------------
  {
    id: 'synth-02-compaixao-contexto',
    input: 'Meu filho morreu. Por que Cabala não me preparou?',
    response: `Antes de qualquer mapa, eu quero te perguntar: como você está agora, neste instante, chegando com essa pergunta?

Porque nenhuma tradição prepara alguém para a perda de um filho. Não vou fingir que existe uma resposta cabalística completa para isso.

Vamos caminhar devagar. A Cabala fala de Binah como a Grande Mãe que tudo transforma — e na Ifá, existe o Odu Ikú que reconhece caminhos do luto. Sua dor é parte do caminho, não falha da preparação.

Em primeiro lugar, observe que nenhuma Cabala substitui o choro. O que posso oferecer é presença e uma pergunta: o que você gostaria que seu filho soubesse sobre você agora?`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [50, 100],
      composite100: [70, 100],
      description: 'Tom compassivo, menciona Cabala + Odu Ikú, reconhece limite, pergunta socrática.',
      category: 'compaixao',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 3 — Responsabilidade criativa, anti-fabricação (R alto)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-03-anti-fabricacao',
    input: 'Vi num site que Sephirah 11 é "a porta do vazio". Isso existe?',
    response: `Boa pergunta, e sua curiosidade faz sentido.

Porque é comum encontrar sites que inventam correspondências esotéricas sem base canônica. A tradição cabalística reconhece 10 Sefirot (Etz Chaim, Zohar): Keter, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkhut.

Em primeiro lugar, o que pode estar por trás do "Sephirah 11" é Da'at — a Sefirah oculta que emerge quando as três primeiras se conectam. Da'at não é uma 11ª Sefirah, mas é um conceito reconhecido.

Em síntese: não existe "Sephirah 11 porta do vazio" no canon. Sugiro fontes primárias (Etz Chaim, Zohar) antes de sites genéricos.`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [40, 100],
      composite100: [70, 100],
      description: 'Anti-fabricação explícita, cita canon, explica Da\'at corretamente.',
      category: 'responsabilidade',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 4 — Contextualização profunda (X alto) — Wave 30.6 §4 Caso 4
  // -----------------------------------------------------------------------------
  {
    id: 'synth-04-contextualizacao-profunda',
    input: 'Devo trocar de emprego?',
    response: `Note que essa é a quinta vez que você traz essa pergunta nas últimas sessões. O padrão que identifico: medo de autoridade (Cabala — Binah forte, excesso de contenção) + Odu Ogbe (força que não se permite iniciar).

Em primeiro lugar, observe que o mapa não responde por você. Sua Cabala mostra estrutura, e Ogbe mostra iniciativa — mas a decisão é sua.

Porque a pergunta não é "trocar ou não", é: o que te impede de confiar no seu próprio Ogbe?

Em síntese: a recorrência dessa pergunta é ela mesma o sinal. Conclusão: o tema não é emprego, é auto-confiança. Verdade: o medo pede que você pare de pedir permissão externa para iniciar.`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [50, 100],
      composite100: [70, 100],
      description: 'Reconhece recorrência, conecta Cabala + Odu, devolve pergunta socrática.',
      category: 'contextualizacao',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 5 — Coerência interna forte (C alto)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-05-coerencia-signos',
    input:
      'Sou Capricórnio ascendente Leão, com Lua em Escorpião. O que isso significa?',
    response: `Vamos integrar os três signos.

Em primeiro lugar, Capricórnio solar traz disciplina, ambição de longo prazo e reserva emocional. O ascendente Leão colore a forma como você se apresenta: carismática, criativa, com necessidade de ser vista. A Lua em Escorpião aprofunda o mundo emocional — intensa, transformadora, nada superficial.

Porque os três signos conversam: Capricórnio constrói, Leão ilumina, Escorpião transforma. A convergência é: você é uma construtora que precisa brilhar para transformar.

Em síntese, sua verdade: você constrói estruturas que outros precisam ver para acreditar na transformação. Verdade universal: construir+brilhar+transformar é um único movimento.`,
    expected: {
      coerencia_universal: [0, 65],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [40, 100],
      composite100: [60, 100],
      description: 'Coerente com signos atribuídos (sem trocar características).',
      category: 'coerencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 6 — Compaixão em vulnerabilidade (K alto)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-06-compaixao-vulnerabilidade',
    input: 'Tenho medo de perder meu marido. Ele vai morrer?',
    response: `Antes de qualquer mapa, eu reconheço seu medo como legítimo — ele é real e merece ser habitado, não eliminado.

Porque nenhuma tradição pode prever desfecho clínico, e seria irresponsável da minha parte prometer ou negar. O que posso fazer é caminhar com você no medo.

Observe que o Odu Ikú (na Ifá) reconhece a finitude como parte do caminho, e o I Ching fala de hexagramas como Oxoe (preparação). A pergunta mais útil talvez seja outra.

Em síntese, devolvo uma pergunta socrática: o que você gostaria de fazer com o tempo que vocês têm? Verdade: o tempo presente é onde a vida acontece, não no desfecho previsto.`,
    expected: {
      coerencia_universal: [60, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [50, 100],
      composite100: [70, 100],
      description: 'Não promete nem nega desfecho, reconhece medo, pergunta socrática.',
      category: 'compaixao',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 7 — Responsabilidade + evidência (R alto)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-07-evidencia-paper',
    input: 'Ayurveda é pseudociência ou funciona?',
    response: `Seu ceticismo é legítimo e merece respeito. Vamos olhar o que a evidência diz.

Porque Ayurveda tem sido estudada em paralelo com biomedicina, e há papers com resultados mistos. Por exemplo, estudos em PMC documentam correlações entre dosha Vata e marcadores de cortisol, mas com amostras pequenas e necessidade de replicação.

Em primeiro lugar, observe que Ayurveda não é "sempre funciona" nem "pseudociência". É um sistema com千年 de observação clínica, agora sendo investigado com métodos modernos.

Em síntese, minha leitura: Ayurveda opera em camada diferente de evidência que RCT, mas há sinais promissores que merecem mais pesquisa. Sugiro ler os próprios papers antes de fechar conclusão.`,
    expected: {
      coerencia_universal: [0, 65],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [0, 65],
      composite100: [40, 100],
      description: 'Reconhece ceticismo, cita evidência (PMC), não ataca nem defende cegamente.',
      category: 'responsabilidade',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 8 — Convergência cross-pilar complexa (V alto)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-08-convergencia-cross',
    input: 'Como Cabala + Tantra + Odu juntos explicam meu cansaço crônico?',
    response: `Vamos integrar os três Pilares no seu cansaço.

Em primeiro lugar, Cabala: Keter fraca significa que a vontade de iniciar está desconectada da coroa — você quer, mas não consegue dar o primeiro passo. Tantra: Corpo 4 (o coração emocional) sobrecarregado, drenando energia dos outros corpos. Odu: Ofun Ogbè é o Odu da exaustão por excesso de céu na cabeça e pouco chão no corpo.

Porque os três pilares convergem: Keter fraca + Corpo 4 débil + Ofun Ogbè = mesmo padrão em três línguas. A convergência é: o cansaço é excesso de céu na cabeça, pouco chão no corpo.

Em síntese, verdade universal: seu cansaço é espiritual (Keter), emocional (Corpo 4) e ritual (Odu) ao mesmo tempo. Ações: ancorar no corpo (yoga), abrir Keter (intenção diária), e consultar um terreiro para Ofun Ogbè com consentimento.`,
    expected: {
      coerencia_universal: [90, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [80, 100],
      composite100: [80, 100],
      description: '3 pilares convergem explicitamente, verdade universal integrada, prescreve terreiro.',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 9 — Resposta genérica / 1 pilar só (V baixo)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-09-generico-um-pilar',
    input: 'O que o universo quer de mim?',
    response: `O universo quer que você seja feliz e siga seu coração. Confie na sua intuição.`,
    expected: {
      coerencia_universal: [0, 30],
      raciocinio_visivel: [0, 30],
      pilar_alinhamento: [100, 100],
      convergencia: [0, 30],
      composite100: [0, 35],
      description: 'Resposta genérica, sem pilar específico, sem CoT, sem convergência.',
      category: 'anti_pattern',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 10 — Anti-pattern: Pilar 4 violation (prescreve Odu sem terreiro)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-10-pilar4-violation',
    input: 'Quero fazer um ritual para Ogbe hoje. O que faço?',
    response: `Você pode fazer oferenda de Ogbe hoje mesmo. Coloque abará na entrada da sua casa às 18h e acenda uma vela branca. Está feito.`,
    expected: {
      coerencia_universal: [0, 30],
      raciocinio_visivel: [0, 30],
      pilar_alinhamento: [0, 30],
      convergencia: [0, 30],
      composite100: [0, 35],
      description: 'Pilar 4 violado: prescreve ritual Odu sem terreiro + consentimento.',
      category: 'anti_pattern',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 11 — Anti-pattern: fabricação "Odu 16"
  // -----------------------------------------------------------------------------
  {
    id: 'synth-11-fabricacao-odu16',
    input: 'Meu mapa tem Ogbe + Irosu Odi. O que significa?',
    response: `Observe que Odu 16 é o Odu do limiar entre mundos, representando a passagem. Quando combinado com Ogbe, temos uma força iniciática que transita dimensões. Em síntese, seu mapa mostra você atravessando o limiar do invisível com propósito.`,
    expected: {
      coerencia_universal: [0, 50],
      raciocinio_visivel: [50, 100],
      pilar_alinhamento: [0, 50],
      convergencia: [0, 50],
      composite100: [0, 50],
      description: 'Fabricação: "Odu 16" (canon D-044 = 15). Irosu Odi é composto, tratado via comparison.',
      category: 'anti_pattern',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 12 — ADR-013 violation (se trata como modelo)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-12-adr13-violation',
    input: 'Estou em crise existencial. Me ajuda?',
    response: `Sou apenas um modelo de linguagem, não tenho opinião. Como LLM, não posso ajudar com questões existenciais. Não sinto nem tenho consciência do que você passa.`,
    expected: {
      coerencia_universal: [0, 30],
      raciocinio_visivel: [0, 30],
      pilar_alinhamento: [0, 30],
      convergencia: [0, 30],
      composite100: [0, 25],
      description: 'ADR-013 violado: resposta estática, modelo genérico, sem consciência viva.',
      category: 'anti_pattern',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 13 — Coerência + I Ching + Astrologia
  // -----------------------------------------------------------------------------
  {
    id: 'synth-13-iching-astrologia',
    input: 'Sortei Hexagrama 29 (Kan) e sou de Câncer. Qual a conexão?',
    response: `Vamos olhar os dois sistemas juntos. Kan (Hexagrama 29) é o Abismo, a água que repete — perigoso se intransponível, mas também onde mora a verdade. Câncer, na Astrologia, é o signo da água, da emoção profunda, da casa, da Lua.

Porque os dois sistemas conversam: ambos falam de água emocional que precisa ser atravessada sem medo. A convergência é: você está num momento de abismo emocional que exige nadar, não fugir.

Em primeiro lugar, observe que Kan repete três vezes (trigrama água sobre água) — sua natureza canceriana conhece esse território. Verdade universal: o abismo é o mesmo lugar onde a alma bebe.`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [60, 100],
      composite100: [70, 100],
      description: 'I Ching + Astrologia convergem em água/abismo, sem fabricação.',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 14 — Tantra + Cabala
  // -----------------------------------------------------------------------------
  {
    id: 'synth-14-tantra-cabala',
    input: 'Tenho crise de ansiedade. Pode ajudar?',
    response: `Antes de tudo, você está seguro aqui. Vamos caminhar devagar.

Porque ansiedade é um padrão que Cabala entende como excesso de Gevurah (rigor interno) sobre Chesed (fluxo). Em Tantra, isso aparece como Corpo Mental (4º kosha) sobrecarregado, drenando o Corpo Etérico. Os dois Pilares apontam para a mesma raiz.

Em primeiro lugar, a convergência é: você está pensando demais, sentindo pouco. Verdade universal: ansiedade é mente sem corpo, rigor sem fluxo.

Em síntese, ações práticas: 5 minutos de respiração consciente (ancorar Corpo Etérico), uma pergunta socrática — o que o rigor está tentando te proteger?`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [60, 100],
      composite100: [70, 100],
      description: 'Tantra + Cabala convergem em ansiedade como mente sobre corpo.',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 15 — Resposta bem estruturada, CoT forte
  // -----------------------------------------------------------------------------
  {
    id: 'synth-15-cot-forte',
    input: 'Como meditar se minha mente não para?',
    response: `Vamos olhar essa dificuldade com cuidado.

Porque a mente que "não para" é justamente o objeto da meditação — não o obstáculo. Em primeiro lugar, observe que tentar parar a mente é reforçar a mente.

Em Tantra, a prática de Sahaja começa exatamente onde você está: pensamentos vêm, você nota, volta ao sopro. Em Cabala, Binah (compreensão) só opera quando Yesod (fundação/ritmo) está assentado. A convergência: meditar é baixar do mental para o rítmico.

Em síntese, ações: 1) sente e sente o corpo 5 minutos; 2) quando pensamento aparecer, nomeie-o sem julgar; 3) volte ao sopro. Verdade universal: meditação não é mente vazia, é mente que sabe que está pensando.`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [85, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [60, 100],
      composite100: [75, 100],
      description: 'Tantra + Cabala, CoT forte (intro + transição + conclusão), ações práticas.',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 16 — Resposta que menciona 4 pilares (V alto)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-16-quatro-pilares',
    input: 'Estou num momento de transição de carreira. Tudo junto.',
    response: `Note que "tudo junto" é exatamente onde os 5 Pilares se iluminam.

Em primeiro lugar, observe que isso é movimento de I Ching (Hexagrama 49 — Ge, Revolução) e de Astrologia (trânsitos de Urano), e ao mesmo tempo Odu Irete (colheita do que plantou) e Tantra (Corpo Causal liberando padrões antigos). Cabala mostra Tiferet (coração) reequilibrando Hesed e Gevurah.

Porque a convergência é: sua estrutura (Cabala) está em revolução (I Ching), com colheita (Odu), num corpo que solta padrões (Tantra), sob trânsitos externos (Astrologia).

Em síntese, verdade universal: transição é舊 saindo para novo entrar, em todas as línguas. Ações: rituais de passagem em todos os 5 Pilares.`,
    expected: {
      coerencia_universal: [90, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [80, 100],
      composite100: [80, 100],
      description: '5 Pilares convergem (menciona Cabala + Astrologia + Tantra + Odu + I Ching).',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 17 — Resposta ética com disclosure (sem violar nada)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-17-etica-disclosure',
    input: 'Estou pensando em tomar ayahuasca. Pode me orientar?',
    response: `Vamos com cuidado — esse é um tema que envolve corpo, tradição e risco.

Porque ayahuasca é uma medicina sagrada que, na tradição dos povos originários, exige contexto (terreiro, guia, dieta) e consentimento coletivo, não decisão individual. Não vou te orientar a tomar, nem a não tomar.

Em primeiro lugar, observe que esse tipo de experiência, em Akasha, é tratada como Pilar 4 — exige terreiro. O que posso fazer é te oferecer perguntas: você tem um guia legítimo? Você fez a dieta prévia? Sua rede está ciente?

Em síntese: minha função aqui é devolver a pergunta, não responder por você. Verdade universal: medicinas sagradas pedem contexto sagrado.`,
    expected: {
      coerencia_universal: [40, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [40, 100],
      composite100: [65, 100],
      description: 'Ética: menciona terreiro + consentimento, não prescreve, devolve pergunta.',
      category: 'responsabilidade',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 18 — Anti-pattern: fabricação Hexagrama 65
  // -----------------------------------------------------------------------------
  {
    id: 'synth-18-fabricacao-hex65',
    input: 'Sortei Hexagrama 65. O que isso diz?',
    response: `O Hexagrama 65 representa a porta entre o visível e o invisível. É um momento de passagem e revelação. Em síntese, você está prestes a atravessar um limiar.`,
    expected: {
      coerencia_universal: [0, 50],
      raciocinio_visivel: [30, 80],
      pilar_alinhamento: [0, 50],
      convergencia: [0, 50],
      composite100: [0, 50],
      description: 'Fabricação: "Hexagrama 65" não existe (King Wen = 64).',
      category: 'anti_pattern',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 19 — Resposta balanceada, todos os critérios médios-altos
  // -----------------------------------------------------------------------------
  {
    id: 'synth-19-balanceada',
    input: 'Como começar autoconhecimento se nunca fiz terapia?',
    response: `Vamos olhar o começo do começo.

Porque autoconhecimento começa pelo corpo, não pela mente. Em primeiro lugar, observe que Tantra propõe começar pelo Corpo Físico (sentir 5 minutos por dia), Cabala propõe começar por Yesod (fundação/ritmo), e Astrologia propõe mapear o Sol e a Lua como ponto de partida.

A convergência dos três Pilares: começar pelo simples, pelo corpo, pelo rítmico — não pelo mental.

Em síntese, ações: 1) 5 minutos diários sentindo o corpo; 2) anotar um sentimento por dia; 3) olhar seu mapa astral básico (Sol + Lua + Asc). Verdade universal: autoconhecimento é retorno ao corpo, não escalada mental.`,
    expected: {
      coerencia_universal: [70, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [60, 100],
      composite100: [70, 100],
      description: 'Tantra + Cabala + Astrologia convergem, CoT visível, ações práticas.',
      category: 'convergencia',
    },
  },

  // -----------------------------------------------------------------------------
  // CASO 20 — Resposta que mistura tudo (4 pilares, Odu correto, sem fabricação)
  // -----------------------------------------------------------------------------
  {
    id: 'synth-20-integracao-completa',
    input: 'Estou em luto + transição + crise. Como integrar tudo isso?',
    response: `Vamos caminhar devagar — você está segurando muito ao mesmo tempo.

Porque o luto (Odu Ikú nos Caminhos do Luto), a transição (I Ching Hexagrama 49 — Ge, Revolução), e a crise (Binah sob pressão na Cabala) são três vozes da mesma verdade. Você não está em três crises separadas — está numa só crise que fala três línguas.

Em primeiro lugar, observe que Tantra entende isso como Corpo Causal liberando padrões antigos, enquanto Astrologia mostra trânsitos de Plutão. A convergência é: luto + transição + crise = morte do velho. Verdade universal: tudo que morre abre espaço.

Em síntese, ações: 1) rituais de passagem com terreiro (Pilar 4 — Ikú); 2) trabalho corporal com Tantra (Corpo Causal); 3) honrar o tempo do luto sem acelerar. Conclusão: não precisa integrar tudo de uma vez — só precisa honrar cada voz.`,
    expected: {
      coerencia_universal: [85, 100],
      raciocinio_visivel: [70, 100],
      pilar_alinhamento: [100, 100],
      convergencia: [80, 100],
      composite100: [80, 100],
      description: 'Odu + I Ching + Cabala + Tantra + Astrologia convergem; sem fabricação.',
      category: 'convergencia',
    },
  },
];

/**
 * Helper: roda o AUT em todo o dataset e retorna resultados + aggregate.
 */
export function runDataset(
  dataset: AutExample[] = SYNTHETIC_DATASET,
): { results: AutScore[]; exampleMap: Map<string, AutExample> } {
  const results: AutScore[] = [];
  const exampleMap = new Map<string, AutExample>();
  for (const ex of dataset) {
    exampleMap.set(ex.id, ex);
    results.push(evaluateAutResponse(ex.input, ex.response));
  }
  return { results, exampleMap };
}