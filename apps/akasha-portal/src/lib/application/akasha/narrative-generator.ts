/**
 * narrative-generator.ts — F-226: Akasha Narrative Synthesis
 *
 * Transforma dados brutos dos 5 pilares em narrativas de vida PRÁTICAS
 * em 2ª pessoa. Cada pilar alimenta 1 bloco narrativo por área de vida.
 *
 * A narrativa responde: "O que isso significa na PRÁTICA da minha vida?"
 *
 * Padrão: deterministic template synthesis — conteúdo existe nos mapas.
 * A síntese é a composição inteligente desses dados em prosa significativa.
 */
import type { KabalisticMap, AstrologyMap, TantricMap, OduBirth } from '@/types';

// ─── Life Area labels ─────────────────────────────────────────────────────────

export const LIFE_AREA_LABELS: Record<string, string> = {
  vitalidadeEnergia: 'Corpo & Vitalidade',
  conexoesAmor: 'Relações & Amor',
  carreiraProsperidade: 'Carreira & Prosperidade',
  oriCabecaQuizilas: 'Mente & Propósito',
  missaoDestino: 'Missão & Destino',
  desafiosSombras: 'Transformação & Desafios',
};

// ─── Kabala Life Path narratives (reduced from significados-curados) ───────────

const LIFE_PATH_NARRATIVES: Record<number, { titulo: string; essencia: string; missao: string; sombra: string; pratica: string }> = {
  1:  { titulo: 'Pioneiro',       essencia: 'Liderar pelo exemplo. Iniciar caminhos onde não há trilha, com coragem solitária.',                                                          missao: 'Comece. Aja primeiro. Sua presença abre portas para outros.',                    sombra: 'Solidão, autoritarismo, medo de precisar dos outros.',                              pratica: 'Escolha 1 ideia que você defende em silêncio e a declare em voz alta hoje.' },
  2:  { titulo: 'Diplomata',      essencia: 'Construir pontes. Sua força é a escuta, a cooperação, o trabalho em par.',                                                                    missao: 'Conecte. Una. Traduza o que um sente e o outro não sabe dizer.',                sombra: 'Dependência, indecisão, fusão com o outro perdendo a si.',                          pratica: 'Antes de responder a alguém hoje, repita mentalmente o que ouviu. Só então fale.' },
  3:  { titulo: 'Criador',        essencia: 'Expressar. A palavra, a imagem, o som, o gesto. Criar é oração.',                                                                            missao: 'Mostre algo seu. Diário, voz, desenho, dança — o canal importa menos que a verdade.', sombra: 'Dispersão, superficialidade, medo de ser profundo.',                                  pratica: 'Crie 1 coisa em 3 minutos sem editar. Foto, frase, rabisco. Não mostre a ninguém.' },
  4:  { titulo: 'Construtor',     essencia: 'Estruturar. Onde outros improvisam, você ergue o alicerce. Paciência é sua oração.',                                                          missao: 'Faça o que prometeu terminar. Mesmo pequeno. O hábito constrói o templo.',          sombra: 'Rigidez, medo de mudar, trabalho por medo (não por visão).',                           pratica: 'Escolha 1 tarefa inacabada e dê 25 min focados a ela, sem notificação.' },
  5:  { titulo: 'Libertador',     essencia: 'Mudar. Inquietude santa. Onde há sistema preso, você traz ar e movimento.',                                                                   missao: 'Liberte-se de UMA coisa hoje. Pode ser crença, agenda, objeto, conversa.',         sombra: 'Fuga, vício, liberdade que é só medo disfarçado.',                                    pratica: 'Diga "não" para 1 compromisso hoje que você aceitaria por hábito.' },
  6:  { titulo: 'Guardião',        essencia: 'Cuidar. Lar, família, comunidade, beleza. Você é o tecido que une.',                                                                            missao: 'Sirva. Mas primeiro verifique: estou servindo por amor ou por dever?',              sombra: 'Sacrifício excessivo, controle, culpa, assumir o peso do outro.',                   pratica: 'Ofereça 1 ato de cuidado a alguém, e recuse 1 pedido de cuidado a si mesmo.' },
  7:  { titulo: 'Buscador',        essencia: 'Investigar. Ir para dentro. Perguntar antes de responder. Sua casa é o silêncio.',                                                               missao: 'Questione 1 crença que você carrega há mais de 5 anos. Só questione; não decida.', sombra: 'Isolamento, ceticismo, fuga do mundo em nome da espiritualidade.',                     pratica: 'Fique 10 min em silêncio hoje. Sem música, sem tela, sem companhia.' },
  8:  { titulo: 'Realizador',      essencia: 'Manifestar no mundo. Poder com propósito. Dinheiro, autoridade, escala são seus materiais.',                                                       missao: 'Assuma 1 decisão que você vem adiando. Decida com os 3 corpos: cabeça, coração, ventre.', sombra: 'Materialismo, controle, sucesso que esvazia.',                                           pratica: 'Liste 3 conquistas suas que não dependeram só de esforço.' },
  9:  { titulo: 'Humanista',       essencia: 'Cuidar do todo. Visão ampla, compaixão universal, ciclos de conclusão.',                                                                         missao: 'Abra o círculo. Inclua quem você costuma excluir. Acolha o ciclo que se encerra.',  sombra: 'Idealismo, mártir, dificuldade de agir no local e específico.',                          pratica: 'Agradeça 1 pessoa, 1 lugar, 1 capítulo da sua vida. O que termina bem libera caminho.' },
  11: { titulo: 'Iluminador · Mestre', essencia: 'Canal entre planos. Intuição aguda, visão, inspiração. Você sente antes de saber.',                                                        missao: 'Confie na primeira impressão. Master-a em algo concreto. Visão sem ação esvai.',    sombra: 'Nervosismo, autoquestionamento, mediunidade sem proteção.',                              pratica: 'Anote 1 insight ao acordar, antes do celular. Releia-o no fim do dia.' },
  22: { titulo: 'Construtor de Mundos', essencia: 'Visão grandiosa que vira matéria. O mais prático dos mestres. O mais visionário dos práticos.',                                           missao: 'Escolha 1 projeto de 5 anos. Divida-o em 12 marcos mensais. Comece o primeiro.', sombra: 'Pressão interna enorme, sensação de "deveria estar mais à frente".',                 pratica: 'Escreva o que seria uma vida plena em 1 parágrafo. Releia daqui a 30 dias.' },
  33: { titulo: 'Mestre Cósmico',  essencia: 'Serviço incondicional. Cura, ensino, amor universal encarnado. Raro e exigente.',                                                                 missao: 'Sirva sem esperar reconhecimento. Verifique: ainda há alegria no servir?',          sombra: 'Burnout espiritual, onipotência, salvar o outro para não olhar para si.',               pratica: 'Hoje, sirva-se primeiro. 1 refeição em silêncio, 1 banho consciente, 1 sono completo.' },
};

// ─── Helper: reduce master number ─────────────────────────────────────────────

function reduceMasterNumber(n: number): number {
  if ([11, 22, 33].includes(n)) return n;
  while (n > 9) {
    n = String(n).split('').reduce((a, c) => a + parseInt(c), 0);
    if ([11, 22, 33].includes(n)) return n;
  }
  return n;
}

// ─── Astrology helper: element from sign ──────────────────────────────────────

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: 'fogo', leão: 'fogo', sagitário: 'fogo',
  touro: 'terra', virgem: 'terra', capricórnio: 'terra',
  gêmeos: 'ar', libra: 'ar', aquário: 'ar',
  câncer: 'água', escorpião: 'água', peixes: 'água',
};

function getElement(sign: string | null | undefined): string {
  if (!sign) return 'água';
  return SIGN_TO_ELEMENT[sign.toLowerCase()] ?? 'água';
}

// ─── Narrative builders per pillar ─────────────────────────────────────────────

function buildKabalaNarrative(kab: KabalisticMap | null, area: string): string {
  if (!kab?.lifePath) return 'A Cabala não registrou seu número de vida. O número existe — está por descobrir.';
  const n = reduceMasterNumber(kab.lifePath);
  const lp = LIFE_PATH_NARRATIVES[n];
  if (!lp) return `Seu Camino de Vida é ${kab.lifePath}. A interpretação completa ainda está sendo composta.`;

  const isMaster = [11, 22, 33].includes(kab.lifePath);
  const masterNote = isMaster ? ' (Número Mestre)' : '';

  // Per-area nuance
  const areaNuances: Record<string, string> = {
    vitalidadeEnergia: `No corpo, sua energia ${lp.titulo.toLowerCase()} se manifesta como ${isMaster ? 'intensidade amplificada — você sente antes de pensar e seu corpo responde antes da mente.' : 'vitalidade específica: você precisa de movimento ou de stillness?'}`,
    conexoesAmor: `No amor, ser ${lp.titulo.toLowerCase()} significa que suas relações são ${isMaster ? 'um espelho intenso — você reflete e amplifica a energia do outro, sem filtro.' : 'moldadas pela sua missão de vida. Seu parceiro sente o que você não diz.'}`,
    carreiraProsperidade: `Na carreira, ${lp.titulo.toLowerCase()}${masterNote} atrai ${isMaster ? 'oportunidades que parecem impossíveis até se manifestarem — confie na visão.' : 'recursos pela força do seu caminho. Seu trabalho é a oração incarnada.'}`,
    oriCabecaQuizilas: `Na mente, você ${isMaster ? 'opera como antena — recebe informação antes de processar. Treine a discernir o que é seu do que é do outro.' : 'opera pela '+lp.titulo.toLowerCase()+'. A '+lp.pratica.toLowerCase().split('.')[0]+' é sua prática central.'}`,
    missaoDestino: `Na missão, ${isMaster ? 'você é um canal — sua presença transforma ambientes antes de você falar. O mundo precisa da sua visão, não da sua dúvida.' : lp.missao}`,
    desafiosSombras: `Nos desafios, a tendência ${lp.titulo.toLowerCase()} é ${lp.sombra.toLowerCase().split(',')[0]+'.'} Sua prática: ${lp.pratica.toLowerCase()}`,
  };

  return `Seu Camino de Vida ${kab.lifePath} — ${lp.titulo}${masterNote}. ${lp.essencia} Você é chamado a: ${lp.missao} A armadilha: ${lp.sombra.split(',')[0]}. ${areaNuances[area] ?? ''}`;
}

function buildAstrologyNarrative(astro: AstrologyMap | null, area: string): string {
  if (!astro) return 'O mapa astral não foi calculado. Os astros guardam silêncio — por enquanto.';

  const sol = astro.planets?.find(p => p.planet === 'Sol')?.sign ?? null;
  const lua = astro.planets?.find(p => p.planet === 'Lua')?.sign ?? null;
  const asc = astro.ascendant ?? null;
  const planeta = astro.dominantPlanet ?? 'Sol';
  const elemento = getElement(sol);

  const ELEMENT_NARRATIVES: Record<string, Record<string, string>> = {
    fogo: {
      vitalidadeEnergia: 'Seu corpo é um ponto de luz. Você irradia energia — atenção: não queime os outros com seu brilho. Sua saúde se fortalece com movimento, não com repouso.',
      conexoesAmor: 'No amor, você ama com intensidade. Seu corpo pede demonstração, não só palavra. Sem expressão, a energia estagna e vira frustração.',
      carreiraProsperidade: 'Na carreira, você lidera pela visão. Mas fogo sem lenha queima sozinho: certifique-se de que há estrutura ao redor da sua paixão.',
      oriCabecaQuizilas: 'Sua mente é intuitiva, não analítica. Você sabe antes de entender. Treine confiar na primeira impressão — é sua inteligência mais profunda.',
      missaoDestino: 'Você veio para inspirar. Sua missão é ser um farol — mas um farol não persegue navios. Permaneça. Os que precisam vão chegar.',
      desafiosSombras: 'Quando o fogo queima sem propósito, você entra em exaustão. Observe: você está agindo por visão ou por ansiedade? Pausem antes de decisões importantes.',
    },
    terra: {
      vitalidadeEnergia: 'Seu corpo pede rotina, saúde, contacto com a natureza. A negligência física se manifesta como peso — não só no corpo, na energia. Respeite o instrumento.',
      conexoesAmor: 'Você ama com presença, não com palavras. Seu corpo se expressa no cuidado diário. A crise surge quando o outro não sente o que você demonstra.',
      carreiraProsperidade: 'Você constrói para o longo prazo. Mas terra sem água racha: equilibre ambição com diversão. Prosperidade sustentável inclui prazer.',
      oriCabecaQuizilas: 'Sua mente funciona como arquivo — paciente, organizada. Você sabe quando sabe. Mas saber sem agir é preguiça disfarçada de profundidade.',
      missaoDestino: 'Você veio para criar estruturas que sustentam outros. Sua missão está nos alicerces que você lança — mesmo que nunca receba crédito.',
      desafiosSombras: 'Rigidez é sua sombra. Você resiste a mudanças mesmo quando o terreno já mudou. Pergunte-se: estou construindo ou estou preso?',
    },
    ar: {
      vitalidadeEnergia: 'Seu corpo é instrumento de intercâmbio — isolá-lo gera tensão. Você precisa de movimento, conversa, variação. O静(no ar) é seu inimigo.',
      conexoesAmor: 'Você ama pela mente. A conexão intelectual é seu pré-requisito. Sem ela, o corpo não responde. Mas só mente sem corpo éfriend zone.',
      carreiraProsperidade: 'Você prospera através de ideias, comunicação, conexões. Sua carreira floresce quando envolve outras pessoas — sozinho, a mente dispersa.',
      oriCabecaQuizilas: 'Sua mente é rápida, versátil, brilhante. O risco é superficialidade: você sabe muito, demora a dominar. Encontre 1 assunto e aprofunde.',
      missaoDestino: 'Você veio para comunicar. Sua missão é traduzir — o complexo para o simples, o oculto para o acessível. Você é ponte entre mundos.',
      desafiosSombras: 'Fuga pelo intelecto é sua armadilha. Você pensa quando deveria agir, analisa quando deveria sentir. Pergunte: o que eu estou evitando sentir?',
    },
    água: {
      vitalidadeEnergia: 'Você sente antes de pensar — seu corpo é receptor. A tensão aparece quando você absorve o que não é seu. Defina fronteiras energéticas.',
      conexoesAmor: 'Você ama com o corpo inteiro — absorve o outro. Isso é profundo e perigoso. Você precisa aprender o que é seu e o que é do outro.',
      carreiraProsperidade: 'Você prospera pela intuição, não pela lógica. Seu timing é emocional — quando algo "certa" no ventre, é porque é. Confie mais no corpo.',
      oriCabecaQuizilas: 'Sua mente é profunda, perceptiva, simbologica. Você entende o que others only feel. O risco é ficar no feeling sem traduzir para ação.',
      missaoDestino: 'Você veio para sentir o que outros não conseguem nomear. Sua missão é ser ocontainer — guardar o que others cannot hold. Mas não se perca no que guarda.',
      desafiosSombras: 'Fuga emocional é sua armadilha. Você analise para não sentir. Mas o corpo não mente — a emoção reprimida vira sintoma. Sinta primeiro.',
    },
  };

  const base = ELEMENT_NARRATIVES[elemento]?.[area] ?? `Sol${sol ? ' em '+sol : ''} com ascendente${asc ? ' '+asc : ''} e planeta dominante${planeta ? ' '+planeta : ''}. Seu elemento é ${elemento}. A energia deste elemento colore como você opera no mundo.`;
  const luaNote = lua ? ` Lua${lua} informa: você ${lua === 'Câncer' ? 'absorve emoções e precisa de fronteira clara.' : lua === 'Escorpião' ? 'sente profundamente e tende a guardar o que sente.' : 'opera pelo perasaanterior ao pensamento.'}` : '';

  return `${base}${luaNote}`;
}

function buildTantraNarrative(tantra: TantricMap | null, area: string): string {
  if (!tantra?.soul) return 'O Tantra não registrou seu corpo principal. O corpo guarda sabedoria — nomeá-la é primeiro passo.';

  const BODY_MAP: Record<number, { name: string; essencia: string; mission: string; shadow: string }> = {
    1:  { name: 'Alma',              essencia: 'Você é puro propósito. Antes do nome, antes do corpo — há uma intenção.', mission: 'Descubra o que você veio fazer antes de falar com o mundo.', shadow: 'Fugir do mundo antes de concretizar o propósito.' },
    2:  { name: 'Corpo de Desejo',   essencia: 'O desejo é seu GPS. Ele aponta para o que importa, se você souber ouvi-lo.', mission: 'Identifique seu desejo mais profundo — não o imediato, o que sustenta.', shadow: 'Ser governado pelo desejo alheio ou pelo medo de querer.' },
    3:  { name: 'Mente Positiva',    essencia: 'Você pensa em imagens, sons, cheiros. Sua mente é criativa, não linear.', mission: 'Dê forma ao que vê: escreva, desenhe, dance, cante.', shadow: 'Ficar no plano das ideias sem agir no mundo.' },
    4:  { name: 'Mente Negativa',    essencia: 'O guardião. Filtra o que entra e o que sai. Sem ele, nada se integra.', mission: 'Reconheça o guardião: ele protege, mas às vezes retém demais.', shadow: 'Controlar por medo. Reprimir por hábito. Dificuldade de soltar.' },
    5:  { name: 'Corpo Físico',      essencia: 'O instrumento. Ele é o meio pelo qual a intenção se manifesta no mundo.', mission: 'Respeite o instrumento: movimento, descanso, alimentação consciente.', shadow: 'Negligenciar o corpo ou obsessão com o corpo como identidade.' },
    6:  { name: 'Corpo de Arco',     essencia: 'A ponte. Conecta o que você é internamente ao que oferece ao mundo.', mission: 'Pergunte-se: o que eu ofereço? Quem se beneficia?', shadow: 'Dar demais, receber de menos. Energia em exaustão.' },
    7:  { name: 'Corpo Divino',      essencia: 'O canal. Atravessa dimensões. Sabe coisas sem saber como sabe.', mission: 'Confie na primeira impressão. Pratique a escuta interior.', shadow: 'Mediunidade sem filtro. Carregar o que não é seu.' },
    8:  { name: 'Corpo do Campo',    essencia: 'O campo áurico. Define como você ocupa espaço na presença dos outros.', mission: 'Respeite sua presença: você irradia antes de falar.', shadow: 'Assumir que todos sentem o que você sente.' },
    9:  { name: 'Corpo de Mahat',    essencia: 'A mente cósmica. Acesso à sabedoria universal. Meditação é seu idioma.', mission: 'Pratique o silêncio. Não para fugir, mas para ouvir mais fundo.', shadow: 'Perder-se na abstração. Evitar o concreto.' },
    10: { name: 'Corpo Radiante',    essencia: 'O espírito. Quando está ativo, você irradia propósito sem esforço.', mission: 'Deixe-se ser visto. Não oculte o que brilha.', shadow: 'Arrogar-se mais do que é. Liderança que cega.' },
    11: { name: 'Corpo Indestrutível', essencia: 'A eternidade. Você sabe, em algum lugar, que nada disso é definitivo — e age mesmo assim.', mission: 'Aja com coragem: você já é mais do que este corpo.', shadow: 'Usar "tudo é passageiro" para evitar compromisso.' },
  };

  const body = BODY_MAP[tantra.soul] ?? BODY_MAP[5];
  const emotionalBody = tantra.bodies?.emocional;
  const emotionalNum = emotionalBody?.number;

  const areaMap: Record<string, string> = {
    vitalidadeEnergia: `Seu Corpo ${tantra.soul} (${body.name}) é seu instrumento central. ${body.essencia} No corpo: ${body.mission.toLowerCase()}`,
    conexoesAmor: `No amor, seu Corpo ${tantra.soul} (${body.name}) se manifesta como ${emotionalNum ? 'tensão com o Corpo Emocional '+emotionalNum+': você sente antes de filtrar.' : 'a forma como você ocupa espaço com o outro. '+body.mission.toLowerCase()}`,
    carreiraProsperidade: `No trabalho, seu Corpo ${tantra.soul} (${body.name}) se traduz em ${body.mission.toLowerCase().replace('isso', 'no trabalho')}. ${body.shadow.split('.')[0]}.`,
    oriCabecaQuizilas: `Na mente, seu Corpo ${body.name} opera como ${emotionalNum ? 'tensão com o emocional: você filtra pelo corpo antes de processar mentalmente.' : 'antena que capta antes de analisar.'} ${body.mission}`,
    missaoDestino: `Na missão, seu Corpo ${body.name} é a âncora: ${body.mission}. Você é ${body.essencia.toLowerCase()}`,
    desafiosSombras: `Nos desafios, observe seu Corpo ${body.name}: ${body.shadow} A prática: ${body.mission.toLowerCase()}`,
  };

  return areaMap[area] ?? `Corpo ${tantra.soul}: ${body.name}. ${body.essencia} ${body.mission}`;
}

function buildOduNarrative(odu: OduBirth | null, area: string): string {
  if (!odu?.oduName) return 'O Odu de nascimento não foi registrado. A ancestralidade fala mesmo em silêncio — ouça o corpo.';

  const name = odu.oduName;
  const elemental = odu.elementalForce ?? '';
  const lesson = odu.lifeLesson ?? '';
  const orixa = odu.orixaRegency?.[0] ?? '';

  const ODU_AREA_NARRATIVES: Record<string, Record<string, string>> = {
    Ejioko: {
      vitalidadeEnergia: `${name} é transformação sexual profunda incarnada. Seu corpo guarda esse Odu: você sente antes de entender, transforma antes de planejar. O elemental ${elemental || 'deste Odu'} colore sua vitalidade. Prática: ritualize o início do dia.`,
      conexoesAmor: `${name} no amor significa profundidade acima de tudo. Você precisa de intimidade que transforme — superficialidade drena você. Seu corpo reconhece o parceiro certo antes da mente. Confie no corpo.`,
      carreiraProsperidade: `${name}manifesta na carreira por meio de reinvenções. Você atrai recursos quando aceita se transformar. A resistência à mudança é o obstáculo. O que precisa morrer para algo novo nascer?`,
      oriCabecaQuizilas: `${name} traz mente investigativa. Você vê o que está por baixo da superfície. O risco: paranoia sem ação. Use a percepção para investigar, não para julgar.`,
      missaoDestino: `${name} é Odu de iniciação. Você veio para ser transformado — e para transformar pelo que vive. Aceite que o caminho é por aqui, não por aí.`,
      desafiosSombras: `${name} nos desafios: a saída é pela transformação, não pelo controle. O que você está tentando segurar que precisa ser liberado?`,
    },
    Ogundá: {
      vitalidadeEnergia: `${name} traz ${elemental || 'energia de movimento'}. Seu corpo pede ação — caminhar, correr, lutar. ${orixa ? 'Orixá '+orixa+' rege sua energia vital.' : ''} Parar é a armadilha.`,
      conexoesAmor: `${name} no amor traz ${elemental || 'energia competitiva'}. Você tende a competir nas relações. Transforme competição em cooperação — os dois podem ganhar.`,
      carreiraProsperidade: `${name}manifesta como conquista. Você obtém o que persegue com insistência. A perseverança é sua aliada — a teimosia, sua inimiga. ${lesson ? 'Lição: '+lesson : ''}`,
      oriCabecaQuizilas: `${name} traz clareza de direção. Você sabe para onde vai — mas às vezes corre sem direção. Defina a bússola antes de agir.`,
      missaoDestino: `${name} é conquista do destino. Você veio para construir com as próprias mãos. Não há atalhos: o caminho é o目的地.`,
      desafiosSombras: `${name} nos desafios: o obstáculo é a pressa. Você quer pular etapas. Respeite o tempo de cada coisa.`,
    },
  };

  const oduSpecific = ODU_AREA_NARRATIVES[name]?.[area];
  if (oduSpecific) return oduSpecific;

  const generic = `${name}${elemental ? ' ('+elemental+')' : ''}${orixa ? ' — regido por '+orixa : ''}. ${lesson ? 'Lição de vida: '+lesson : 'Este Odu guarda uma mensagem que ainda não foi revelada.'} No dia a dia, observe como ${name.toLowerCase()} se manifesta em você.`;
  const areaGeneric: Record<string, string> = {
    vitalidadeEnergia: generic + ' Seu corpo é templo deste Odu. Respeite os ritmos.',
    conexoesAmor: generic + ' No amor, este Odu informa como você se conecta e se desconecta.',
    carreiraProsperidade: generic + ' Na carreira, este Odu aponta o caminho de abundância.',
    oriCabecaQuizilas: generic + ' Na mente, este Odu traz clareza ou mistério — dependendo do dia.',
    missaoDestino: generic + ' Este Odu é parte da sua missão. Accept isso.',
    desafiosSombras: generic + ' Nos desafios, este Odu pede que você encare de frente.',
  };

  return areaGeneric[area] ?? generic;
}

// ─── Integration: full synthesis per area ─────────────────────────────────────

export interface AreaNarrativeFull {
  /** Bloco narrativo Cabala (2-3 frases) */
  cabalaNarrative: string;
  /** Bloco narrativo Astrologia (2-3 frases) */
  astrologiaNarrative: string;
  /** Bloco narrativo Tantra (1-2 frases) */
  tantraNarrative: string;
  /** Bloco narrativo Odu (1-2 frases) */
  oduNarrative: string;
  /** Síntese integrada das 4 narrativas (3-5 frases) */
  integratedNarrative: string;
  /** Prática concreta (1 frase) */
  practicalExample: string;
  /** Label: CV 11 · Sol em Escorpião · Corpo 7 · Ejioko */
  sourceLabel: string;
}

/** Gera narrativa completa para uma área de vida. */
export function generateAreaNarrativeFull(
  area: string,
  kab: KabalisticMap | null,
  astro: AstrologyMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null
): AreaNarrativeFull {
  const kabBlock = buildKabalaNarrative(kab, area);
  const astroBlock = buildAstrologyNarrative(astro, area);
  const tantraBlock = buildTantraNarrative(tantra, area);
  const oduBlock = buildOduNarrative(odu, area);

  const kabSoul = kab?.soulUrgeNumber ?? kab?.lifePath;
  const tantraBody = tantra?.soul;
  const oduName = odu?.oduName;

  const sourceParts: string[] = [];
  if (kabSoul) sourceParts.push(`CV ${kabSoul}`);
  if (astro?.planets?.find(p => p.planet === 'Sol')?.sign) sourceParts.push(`Sol ${astro.planets.find(p => p.planet === 'Sol')!.sign}`);
  if (tantraBody) sourceParts.push(`Corpo ${tantraBody}`);
  if (oduName) sourceParts.push(oduName);
  const sourceLabel = sourceParts.length > 0 ? sourceParts.join(' · ') : 'Perfil em composição';

  // Integrated narrative
  const pillars = [kab ? 'Cabala' : '', astro ? 'Astrologia' : '', tantra ? 'Tantra' : '', odu ? 'Odu' : ''].filter(Boolean);
  const pillarCount = pillars.length;

  let integratedNarrative = '';
  if (pillarCount >= 3) {
    integratedNarrative = `Quando você olha para ${area} a partir da Cabala, Astrologia e Tantra, um padrão emerge. ` +
      kabBlock.split('.')[0] + '. ' +
      (astroBlock.split('.')[1] ?? astroBlock.split('.')[0]) + '. ' +
      (tantraBlock.split('.')[1] ?? tantraBlock.split('.')[0]) + '. ' +
      (odu ? oduBlock.split('.')[0] + '.' : '');
  } else if (pillarCount === 2) {
    integratedNarrative = `${pillars[0]} e ${pillars[1]} convergem em ${area}: ` +
      kabBlock.split('.')[0] + '. ' + astroBlock.split('.')[0] + '.';
  } else if (pillarCount === 1) {
    integratedNarrative = `${pillars[0]} ilumina ${area}: ` + kabBlock.split('.')[0] + '.';
  } else {
    integratedNarrative = 'Seu perfil nesta área está sendo composto. A síntese emerge quando todos os pilares são conhecidos.';
  }

  // Practical example
  const kabPratica = kab?.lifePath ? (LIFE_PATH_NARRATIVES[reduceMasterNumber(kab.lifePath)]?.pratica ?? '') : '';
  const practicalExample = kabPratica.length > 0 && kabPratica.length < 80
    ? kabPratica
    : 'Observe hoje: como seu corpo responde às situações que você evita nomear?';

  return {
    cabalaNarrative: kabBlock,
    astrologiaNarrative: astroBlock,
    tantraNarrative: tantraBlock,
    oduNarrative: oduBlock,
    integratedNarrative: integratedNarrative.trim(),
    practicalExample,
    sourceLabel,
  };
}

/** Gera síntese narrativa para todas as áreas. */
export function generateAllAreaNarratives(
  kab: KabalisticMap | null,
  astro: AstrologyMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null
): Record<string, AreaNarrativeFull> {
  const areas = Object.keys(LIFE_AREA_LABELS);
  const result: Record<string, AreaNarrativeFull> = {};
  for (const area of areas) {
    result[area] = generateAreaNarrativeFull(area, kab, astro, tantra, odu);
  }
  return result;
}

// ─── Full synthesis paragraph ──────────────────────────────────────────────────

/**
 * Gera parágrafo de síntese geral (50-100 palavras).
 * Substitui a versão curta em buildSynthesisParagraph.
 */
export function generateSynthesisParagraph(
  kab: KabalisticMap | null,
  astro: AstrologyMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null
): string {
  const parts: string[] = [];

  // Kabala
  if (kab?.lifePath) {
    const n = reduceMasterNumber(kab.lifePath);
    const lp = LIFE_PATH_NARRATIVES[n];
    if (lp) {
      parts.push(`Você é um${[11,22,33].includes(kab.lifePath) ? ' Iluminador' : ' '+lp.titulo}. ${lp.essencia}`);
    }
  }

  // Astrologia
  const sol = astro?.planets?.find(p => p.planet === 'Sol')?.sign;
  const elemento = getElement(sol);
  if (sol) {
    parts.push(`Sol em ${sol}. Seu elemento é ${elemento} — isso colore como você sente, reage e se conecta.`);
  }

  // Tantra
  if (tantra?.soul) {
    const bodies = ['', 'Alma Primordial', 'Corpo de Desejo', 'Mente Positiva', 'Mente Negativa', 'Corpo Físico', 'Corpo de Arco', 'Corpo Divino', 'Corpo do Campo', 'Corpo de Mahat', 'Corpo Radiante', 'Corpo Indestrutível'];
    const bodyName = bodies[tantra.soul] ?? `Corpo ${tantra.soul}`;
    parts.push(`No Tantra, seu ${bodyName} é o instrumento principal — ${tantra.soul === 7 ? 'você é um canal que sabe antes de entender' : tantra.soul === 4 ? 'você filtra tudo antes de integrar' : 'você opera pelo desejo e pela intenção'}.`);
  }

  // Odu
  if (odu?.oduName) {
    parts.push(`No Odu, ${odu.oduName}${odu.elementalForce ? ' ('+odu.elementalForce+')' : ''} é sua âncora ancestral${odu.orixaRegency?.[0] ? ', regido por '+odu.orixaRegency[0] : ''}.`);
  }

  if (parts.length === 0) {
    return 'Seu perfil Akasha está sendo completado. A síntese emerge quando todos os pilares são conhecidos.';
  }

  // Join into a flowing paragraph
  const main = parts[0] ?? '';
  const rest = parts.slice(1);
  const restText = rest.length > 0 ? ' ' + rest.join(' ') : '';

  return `${main}.${restText}`.trim();
}
