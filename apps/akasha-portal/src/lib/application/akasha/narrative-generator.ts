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
import type { KabalisticMap, AstrologyMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import type { SynthesizedProfile } from '@akasha/core';
import { buildAncestralidadeOduNarrative } from './synthesis-engine/odu-narrative-engine';

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

function buildAncestralidadeNarrative(kab: KabalisticMap | null, area: string): string {
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

function buildMovimentoCelesteNarrative(astro: AstrologyMap | null, area: string): string {
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
      vitalidadeEnergia: 'Seu corpo é instrumento de intercâmbio — isolá-lo gera tensão. Você precisa de movimento, conversa, variação. A quietude é seu inimigo.',
      conexoesAmor: 'Você ama pela mente. A conexão intelectual é seu pré-requisito. Sem ela, o corpo não responde. Mas só mente sem corpo é zona de amigo.',
      carreiraProsperidade: 'Você prospera através de ideias, comunicação, conexões. Sua carreira floresce quando envolve outras pessoas — sozinho, a mente dispersa.',
      oriCabecaQuizilas: 'Sua mente é rápida, versátil, brilhante. O risco é superficialidade: você sabe muito, demora a dominar. Encontre 1 assunto e aprofunde.',
      missaoDestino: 'Você veio para comunicar. Sua missão é traduzir — o complexo para o simples, o oculto para o acessível. Você é ponte entre mundos.',
      desafiosSombras: 'Fuga pelo intelecto é sua armadilha. Você pensa quando deveria agir, analisa quando deveria sentir. Pergunte: o que eu estou evitando sentir?',
    },
    água: {
      vitalidadeEnergia: 'Você sente antes de pensar — seu corpo é receptor. A tensão aparece quando você absorve o que não é seu. Defina fronteiras energéticas.',
      conexoesAmor: 'Você ama com o corpo inteiro — absorve o outro. Isso é profundo e perigoso. Você precisa aprender o que é seu e o que é do outro.',
      carreiraProsperidade: 'Você prospera pela intuição, não pela lógica. Seu timing é emocional — quando algo "certa" no ventre, é porque é. Confie mais no corpo.',
      oriCabecaQuizilas: 'Sua mente é profunda, perceptiva, simbólica. Você entende o que outros só sentem. O risco é ficar na sensação sem traduzir para ação.',
      missaoDestino: 'Você veio para sentir o que outros não conseguem nomear. Sua missão é ser o receptáculo — guardar o que outros não conseguem segurar. Mas não se perca no que guarda.',
      desafiosSombras: 'Fuga emocional é sua armadilha. Você analisa para não sentir. Mas o corpo não mente — a emoção reprimida vira sintoma. Sinta primeiro.',
    },
  };

  const base = ELEMENT_NARRATIVES[elemento]?.[area] ?? `Sol${sol ? ' em '+sol : ''} com ascendente${asc ? ' '+asc : ''} e planeta dominante${planeta ? ' '+planeta : ''}. Seu elemento é ${elemento}. A energia deste elemento colore como você opera no mundo.`;
  const luaNote = lua ? ` Lua${lua} informa: você ${lua === 'Câncer' ? 'absorve emoções e precisa de fronteira clara.' : lua === 'Escorpião' ? 'sente profundamente e tende a guardar o que sente.' : 'opera pelo perasaanterior ao pensamento.'}` : '';

  return `${base}${luaNote}`;
}

function buildCorpoEnergiaNarrative(tantra: TantricMap | null, area: string): string {
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
  /** Bloco narrativo I Ching (1-2 frases) */
  ichingNarrative: string;
  /** Síntese integrada das 5 narrativas (3-5 frases) */
  integratedNarrative: string;
  /** Prática concreta (1 frase) */
  practicalExample: string;
  /** Label: CV 11 · Sol em Escorpião · Corpo 7 · Ejioko */
  sourceLabel: string;
}


/**
 * Build I Ching narrative block for a life area.
 * Uses holo.ichingHex (hexagram from hologram) to derive area-specific I Ching guidance.
 * Falls back gracefully when no hexagram is present.
 */
function buildTransformacaoIChingNarrative(
  holo: AkashicHologram | null,
  area: string,
  _synthesizedProfile?: SynthesizedProfile,
): string {
  if (!holo?.ichingHex) return '';

  const hex = holo.ichingHex;

  // Wilhelm/Baynes hexagram names
  const HEX_NAMES: Record<number, string> = {
    1: 'Criação (Qián)', 2: 'Receptivo (Kǎn)', 3: 'Dificuldade Inicial', 4: 'Juventude Insensata',
    5: 'Espera', 6: 'Conflito', 7: 'O Líder', 8: 'A União', 9: 'O Rebanho Menor',
    10: 'Andar com Cautela', 11: 'Paz', 12: 'Estagnação', 13: 'Comunidade de Pessoas',
    14: 'Posse Grande', 15: 'Modéstia', 16: 'Entusiasmo', 17: 'Seguir', 18: 'Trabalho Corrompido',
    19: 'Aproximação', 20: 'Contemplação', 21: 'Mordida Veloz', 22: 'Graça', 23: 'Desintegração',
    24: 'Retorno', 25: 'Inocência', 26: 'O Grande Poder', 27: 'A Boca (Nutrição)',
    28: 'O Grande Excesso', 29: 'O Abismal (Água)', 30: 'A Clara (Fogo)', 31: 'A Influência',
    32: 'A Permanência', 33: 'A Retirada', 34: 'O Grande Poder', 35: 'O Progresso',
    36: 'Lesão à Luz', 37: 'As Pessoas da Casa', 38: 'A Oposição', 39: 'Obstáculo',
    40: 'Liberação', 41: 'Diminuição', 42: 'Aumento', 43: 'Resolução', 44: 'Encontrar-se',
    45: 'Reunião', 46: 'Elevação', 47: 'Aflição (Exaustão)', 48: 'O Poço', 49: 'Revolução',
    50: 'O Caldeirão', 51: 'O Trovão', 52: 'A Montanha (Tranquilidade)', 53: 'O Desenvolvimento',
    54: 'A Moça Casadeira', 55: 'Abundância (Época)', 56: 'O Andarilho', 57: 'A Penetrante (Vento)',
    58: 'A Serena (Lago)', 59: 'Dispersão', 60: 'A Limitação', 61: 'A Verdade Interior',
    62: 'O Pequeno Excesso', 63: 'Depois da Conclusão', 64: 'Antes da Conclusão',
  };

  // I Ching area-specific guidance derived from hexagram trigram element
  const HEX_AREA_GUIDANCE: Record<string, Record<string, string>> = {
    vitalidadeEnergia: {
      fuego: 'O hexagrama indica transformação por fogo — sua energia se renova por intensidade, não por repouso.',
      agua: 'O hexagrama indica transformação por água — sua energia flui por adaptação, não por força.',
      terra: 'O hexagrama indica transformação por terra — sua energia se estabiliza por contacto com o físico.',
      aire: 'O hexagrama indica transformação por ar — sua energia se expande por comunicação, não por isolamento.',
    },
    conexoesAmor: {
      fuego: 'No amor, o hexagrama aponta para intensidade — você ama com chama, não com vela.',
      agua: 'No amor, o hexagrama aponta para profundidade — você ama pelo que sente, não pelo que vê.',
      terra: 'No amor, o hexagrama aponta para lealdade — você ama construindo, não apenas sentindo.',
      aire: 'No amor, o hexagrama aponta para liberdade — você precisa de espaço para amar sem sufocar.',
    },
    carreiraProsperidade: {
      fuego: 'Na carreira, o hexagrama indica pioneirismo — você cria o caminho andando.',
      agua: 'Na carreira, o hexagrama indica fluidez — você prospera por adaptação, não por rigidez.',
      terra: 'Na carreira, o hexagrama indica construção — você cria valor pela presença, não pela pressa.',
      aire: 'Na carreira, o hexagrama indica comunicação — você prospera por conexões, não por isolamento.',
    },
    oriCabecaQuizilas: {
      fuego: 'Na mente, o hexagrama traz clareza de fogo — você sabe o que quer antes de entender por quê.',
      agua: 'Na mente, o hexagrama traz profundidade de água — você percebe o que outros só intuem.',
      terra: 'Na mente, o hexagrama traz solidez de terra — você pensa devagar e fundo, não rápido e raso.',
      aire: 'Na mente, o hexagrama traz velocidade de ar — você conecta ideias antes de ter palavras.',
    },
    missaoDestino: {
      fuego: 'Na missão, o hexagrama indica criação — você veio para iniciar algo que não existia antes.',
      agua: 'Na missão, o hexagrama indica receptividade — você veio para guardar, não para forçar.',
      terra: 'Na missão, o hexagrama indica fundamento — você veio para ancorar o que os outros começam.',
      aire: 'Na missão, o hexagrama indica comunicação — você veio para traduzir o oculto em acessível.',
    },
    desafiosSombras: {
      fuego: 'Nos desafios, o hexagrama alerta para impaciência — o fogo queima antes de iluminar.',
      agua: 'Nos desafios, o hexagrama alerta para afogamento — a água inunda antes de nutrir.',
      terra: 'Nos desafios, o hexagrama alerta para rigidez — a terra racha quando não cede.',
      aire: 'Nos desafios, o hexagrama alerta para dispersão — o ar dispersa antes de concentrar.',
    },
  };

  // Derive element from hexagram number (Wilhelm lower trigram)
  // Lower trigrams: 1-8 → cielo/fuego, 9-16 → lake/agua, 17-24 → fire/fuego, 25-32 → wind/aire, 33-40 → mountain/terra, 41-48 → wind/aire, 49-56 → fire/fuego, 57-64 → lake/agua
  const ELEM_BY_RANGE: Array<'fuego' | 'agua' | 'terra' | 'aire'> = [
    'fuego','fuego','fuego','fuego','agua','agua','agua','agua',
    'fuego','fuego','fuego','fuego','agua','agua','agua','agua',
    'terra','terra','terra','terra','aire','aire','aire','aire',
    'fuego','fuego','fuego','fuego','terra','terra','terra','terra',
    'aire','aire','aire','aire','fuego','fuego','fuego','fuego',
    'terra','terra','terra','terra','agua','agua','agua','agua',
  ];
  const elemKey = ELEM_BY_RANGE[(hex - 1) % 64] ?? 'agua';
  const areaGuidance = HEX_AREA_GUIDANCE[area]?.[elemKey] ?? '';

  // Use synthesized I Ching primitives if available
  let primitiveNote = '';
  const ichingPrimitives = _synthesizedProfile?.primitivos.filter(p =>
    p.contributions.some(c =>
      (c.fonte?.toLowerCase().includes('iching')) ||
      (c.fonte?.toLowerCase().includes('hexagrama')) ||
      (c.fonte?.toLowerCase().includes('i ching'))
    )
  ) ?? [];
  if (ichingPrimitives.length > 0) {
    const sorted = [...ichingPrimitives].sort((a, b) => b.magnitude - a.magnitude);
    const topIChing = sorted[0];
    if (topIChing) {
      const label = topIChing.polaridade === 'sombra'
        ? 'um desafio a transmutar'
        : topIChing.polaridade === 'luz'
        ? 'uma força a cultivar'
        : 'uma energia a integrar';
      primitiveNote = ` A energia do hexagrama ${hex} ressoa com ${topIChing.primitivo.toLowerCase()} — ${label}.`;
    }
  }

  if (!areaGuidance && !primitiveNote) return '';
  return `${areaGuidance}${primitiveNote}`.trim();
}

/** Gera narrativa completa para uma área de vida. */
export function generateAreaNarrativeFull(
  area: string,
  kab: KabalisticMap | null,
  astro: AstrologyMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram | null,
  _synthesizedProfile?: SynthesizedProfile,
): AreaNarrativeFull {
  const kabBlock = buildAncestralidadeNarrative(kab, area);
  const astroBlock = buildMovimentoCelesteNarrative(astro, area);
  const tantraBlock = buildCorpoEnergiaNarrative(tantra, area);
  const oduBlock = buildAncestralidadeOduNarrative(odu, area);
  const ichingBlock = buildTransformacaoIChingNarrative(holo, area, _synthesizedProfile);

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

  // ── Deep synthesis engine ─────────────────────────────────────────────────
  // Each area gets 3-5 flowing paragraphs that genuinely integrate the pillars
  // rather than gluing together the first sentence of each block.

  /**
   * coreOf — extract the first meaningful narrative sentence from a block.
   * Skips single-word titles (e.g. "Iluminador · Mestre", "fogo")
   * and finds the first real descriptive sentence (≥3 words, ≥18 chars).
   * Also skips title-like sentences that follow the pattern:
   * "Caminho de Vida N — Titulo" or "N — title".
   */
  function coreOf(block: string, preferSecond = false): string {
    const sentences = block.split(/[.!]/).map(s => s.trim()).filter(s => s.length > 10);
    if (sentences.length === 0) return '';
    // Skip title-only sentences: < 3 words OR < 18 chars
    function isNarrative(s: string): boolean {
      const words = s.split(/\s+/).filter(w => w.length > 0).length;
      if (words < 3 || s.length < 18) return false;
      // Skip title-like sentences: "Caminho de Vida N — Titulo" or "N — Titulo"
      // These are labels, not narrative content
      if (/Caminho\s+de\s+Vida\s+\d+.*?—/.test(s)) return false;
      if (/^\d{1,2}\s*—/.test(s)) return false;
      return true;
    }
    const narrativeSentences = sentences.filter(isNarrative);
    if (narrativeSentences.length === 0) return sentences[0];
    if (preferSecond && narrativeSentences.length > 1) return narrativeSentences[1];
    return narrativeSentences[0];
  }

  const kabCore     = coreOf(kabBlock);
  const astroCore   = coreOf(astroBlock, true);
  const tantraCore = coreOf(tantraBlock, true);
  const oduCore    = coreOf(oduBlock);

  // ── Area-specific synthesis templates ─────────────────────────────────────
  // Each template: [opening, body, why-it-matters, closing-persona]
  // They read the actual pillar content and weave it into a coherent voice.

  type ParaFn = (k: string, a: string, t: string, o: string) => string;

  const SYNTHESIS: Record<string, ParaFn[]> = {
    vitalidadeEnergia: [
      (k, a, t, o) =>
        `A energia que move você não vem de um lugar só. ` +
        `A Cabala diz que ${k.toLowerCase()}. ` +
        `A Astrologia acrescenta que ${a.toLowerCase()}. ` +
        `O Tantra revela que ${t.toLowerCase()}` +
        (o ? `, e o Odu confirma: ${o.toLowerCase()}` : '') +
        `. Juntos, esses três — ou quatro — mapas apontam para uma só verdade: ` +
        `seu corpo é o instrumento mais honesta que você tem.`,

      (k, a, t, o) =>
        `Você não tem um problema de energia — tem um problema de tradução. ` +
        `Sente coisas que não sabe nomear, reage a estímulos que não reconhece, ` +
        `e muitas vezes atribui ao "cansaço" o que é, na verdade, sinal não escutado. ` +
        `A Cabala separa o que é missão do que é sombra; ` +
        `a Astrologia colore isso com o elemento que rege seu corpo; ` +
        `o Tantra nomeia o corpo que está no comando.`,

      (k, a, t, o) =>
        `Isso explica por que você frequentemente colapsa antes de entender por quê. ` +
        `Não é fraqueza — é informação acumulada que seu corpo jogou fora porque ` +
        `ninguém ensinou você a ler o recado. O Odu, quando presente, costuma ser ` +
        `o mais direto: a energia não está baixa, está bloqueada.`,

      (k, a, t, o) =>
        `Hoje, antes de tomar qualquer decisão grande, coloque a mão no corpo: ` +
        `no peito, na barriga, na nuca. Sinta onde está a tensão. ` +
        `Não tente resolver — só nomeie. Essa simples prática de rastreamento ` +
        `corporal é onde Kabbalah, Tantra e Odu convergem: ` +
        `o corpo sabe. Você só precisa criar o hábito de perguntar.`,
    ],

    conexoesAmor: [
      (k, a, t, o) =>
        `No amor, você não busca uma pessoa — busca um espelho que ` +
        `confirme o que sospecha sobre si mesmo. A Cabala diz que ${k.toLowerCase()}. ` +
        `A Astrologia descreve ${a.toLowerCase()}. ` +
        `O Tantra revela que ${t.toLowerCase()}` +
        (o ? `, enquanto o Odu traz ${o.toLowerCase()}` : '') +
        `. Três vozes diferentes, um diagnóstico unânime: ` +
        `você ama como funciona, não como imagina que deveria.`,

      (k, a, t, o) =>
        `A armadilha mais comum não é amar pouco — é amar com a ` +
        `expectativa de que o outro completa o que você não consegue ` +
        `articula para si mesmo. Kabbalah nomeia a missão; ` +
        `Astrologia nomeia o elemento emocional; Tantra nomeia o corpo ` +
        `que comanda a relação. Quando esses três apontam na mesma ` +
        `direção, o parceiro sente — antes de você dizer qualquer coisa.`,

      (k, a, t, o) =>
        `Isso explica por que você às vezes se afasta sem entender o que ` +
        `acabou de acontecer. Não foi raiva — foi o corpo reconhecendo ` +
        `que a outra pessoa está num campo que não é seu. O Tantra ` +
        `distingue o que é desejo seu do que é eco do outro; ` +
        `essa fronteira, quando mal traçada, é onde os vínculos se perdem.`,

      (k, a, t, o) =>
        `Sua prática hoje: antes de qualquer conversa importante com ` +
        `quem você ama, pergunte a si mesmo — "o que eu quero que ` +
        `aconteça?" e "o que eu estou evitando dizer?" A resposta ` +
        `do segundo pergunta é mais importante que a do primeiro. ` +
        `Fale o que está evitando. É lá que o vínculo se aprofunda.`,
    ],

    carreiraProsperidade: [
      (k, a, t, o) =>
        `Sua relação com trabalho e dinheiro é uma leitura direta de ` +
        `como você se posiciona no mundo. A Cabala descreve ${k.toLowerCase()}. ` +
        `A Astrologia mostra que ${a.toLowerCase()}. ` +
        `O Tantra indica que ${t.toLowerCase()}` +
        (o ? `, e o Odu sublinha ${o.toLowerCase()}` : '') +
        `. Não é coincidência que todos cheguem à mesma conclusão — ` +
        `é porque todos leem o mesmo mapa, só que em idiomas diferentes.`,

      (k, a, t, o) =>
        `Prosperidade, para você, não é só número na conta. ` +
        `É a sensação de que o que você faz importa, de que o mundo ` +
        `reconhece sua contribuição. Kabbalah nomeia a missão; ` +
        `Astrologia nomeia a forma como você atrai recursos; ` +
        `Tantra nomeia o corpo que sustenta ou sabota o esforço. ` +
        `Quando um desses três está em desequilíbrio, os outros dois ` +
        `compensam — e você sente isso como exaustão sem motivo.`,

      (k, a, t, o) =>
        `Isso explica por que você já aceitou trabalhos que pagavam ` +
        `bem mas drenavam você por dentro — e por que recusou ` +
        `oportunidades que pareciam certas mas assustavam demais. ` +
        `Seu corpo sabia antes de você. A Cabala chama isso de ` +
        `sombra; a Astrologia de retrogradação; o Tantra de corpo ` +
        `desconectado. É a mesma coisa com nomes diferentes.`,

      (k, a, t, o) =>
        `Se você pudesse fazer qualquer trabalho sem pensar em dinheiro, ` +
        `o que seria? Responda essa pergunta em voz alta, sem filtro. ` +
        `Essa resposta é o ponto onde sua missão pessoal encontra ` +
        `sua energia vital — e é exatamente onde você deveria ` +
        `dirigir mais atenção, mesmo que de longe, mesmo que aos poucos.`,
    ],

    oriCabecaQuizilas: [
      (k, a, t, o) =>
        `Sua mente não é uma só — é um campo de batalha onde ` +
        `várias versões de você competem pela palavra final. ` +
        `A Cabala descreve ${k.toLowerCase()}. ` +
        `A Astrologia informa que ${a.toLowerCase()}. ` +
        `O Tantra revela que ${t.toLowerCase()}` +
        (o ? `, enquanto o Odu diz ${o.toLowerCase()}` : '') +
        `. Todos apontam para o mesmo fato: sua mente é rápida, ` +
        `poderosa, e às vezes desonesta consigo mesma.`,

      (k, a, t, o) =>
        `Você pensa mais do que age — ou age antes de pensar? ` +
        `Depende de qual corpo está no comando. Kabbalah nomeia ` +
        `a armadilha central do seu caminho; Astrologia nomeia o ` +
        `viés perceptivo do seu elemento; Tantra nomeia o corpo ` +
        `que intercepta a informação antes de ela chegar à consciência. ` +
        `Essa dinâmica se repete em cada decisão que você adia.`,

      (k, a, t, o) =>
        `Isso explica por que você às vezes tem certeza de algo ` +
        `e depois descobre que estava projetando — e por que outras ` +
        `vezes você sabe o certo e mesmo assim faz o errado. ` +
        `Não é contradição; é a distância entre o que sua mente ` +
        `planeja e o que seu corpo executa. O Tantra chama isso ` +
        `de corpo que comanda; a Astrologia chama de aspecto ` +
        `desconfortável; a Cabala chama de sombra.`,

      (k, a, t, o) =>
        `Sua prática central não é meditate mais — é ` +
        `prestar atenção no que você diz a si mesmo nos ` +
        `primeiros 5 minutos da manhã. Anote. Sem justificar, ` +
        `sem editar. Depois de uma semana, leia com distância: ` +
        `aí você vê a programaçao que roda em você há anos. ` +
        `Mudar a programaçao é o trabalho. Essa é sua missão de verdade.`,
    ],

    missaoDestino: [
      (k, a, t, o) =>
        `Você não está aqui por acidente — Kabbalah, Astrologia e ` +
        `Tantra convergem nessa certeza. O que elas discordam ` +
        `é o como. A Cabala descreve ${k.toLowerCase()}. ` +
        `A Astrologia mostra que ${a.toLowerCase()}. ` +
        `O Tantra ensina que ${t.toLowerCase()}` +
        (o ? `, e o Odu confirma ${o.toLowerCase()}` : '') +
        `. O padrão que emerge quando você lê essas quatro vozes ` +
        `juntas é a sua contribuição intransferível para o mundo.`,

      (k, a, t, o) =>
        `Missão não é emprego. Não é título. Missão é o efeito ` +
        `que sua presença produz no ambiente quando você não está ` +
        `tentando provar nada. Kabbalah nomeia o destino; ` +
        `Astrologia nomeia a energia que outros sentem em você ` +
        `antes de você abrir a boca; Tantra nomeia o corpo que ` +
        `carrega essa energia com mais ou menos facilidade.`,

      (k, a, t, o) =>
        `Isso explica por que você já se sentiu vazio em ` +
        `sucessos que outros envidiam — e realizado em ` +
        `momentos que não apareceram em nenhum curriculum. ` +
        `O mundo reconhece resultado; sua alma reconhece padrão. ` +
        `Você está no caminho certo quando as pequenas ` +
        `derrotas parecem menores do que realmente são, e as ` +
        `pequenas vitórias parecem maiores do que são.`,

      (k, a, t, o) =>
        `Não precisa ter toda a resposta hoje. Sua missão ` +
        `não é um ponto fixo — é uma direção. Cada vez que ` +
        `você age alinhado com o que sua Cabala descreve, ` +
        `com o que sua Astrologia sugere, com o que seu ` +
        `Tantra pratica, você está cumprindo o caminho. ` +
        `Um passo. Depois outro. É assim que se chega.`,
    ],

    desafiosSombras: [
      (k, a, t, o) =>
        `A sombra não é seu inimigo — é sua sombra. ` +
        `Kabbalah, Astrologia e Tantra convergem na mesma ` +
        `verdade: o que você mais resiste em si mesmo é ` +
        `exatamente o que mais precisa integrar. A Cabala ` +
        `descreve ${k.toLowerCase()}. A Astrologia mostra ` +
        `que ${a.toLowerCase()}. O Tantra revela que ` +
        `${t.toLowerCase()}` +
        (o ? `, e o Odu sublinha ${o.toLowerCase()}` : '') +
        `. Três formas de dizer a mesma coisa: ` +
        `você não está quebrado. Você está incompleto.`,

      (k, a, t, o) =>
        `Sombra não significa dark. Significa: o que você ` +
        `não olha de frente aparece nos lugares errados. ` +
        `Kabbalah nomeia a armadilha central; Astrologia ` +
        `nomeia o aspecto que você despreza nos outros ` +
        `(mas é espelho); Tantra nomeia o corpo que ` +
        `carrega o peso não processado. Quando esses três ` +
        `se alinham, você reconhece a sombra na reação ` +
        `desproporcional — no trabalho, no amor, no corpo.`,

      (k, a, t, o) =>
        `Isso explica por que você repete padrões que jurou ` +
        `não repetir. Não é falta de força de vontade — é ` +
        `o corpo guardando uma Programming que a mente ` +
        `já superou conscientemente, mas nunca processou ` +
        `no nível onde foi gravada. O Tantra trabalha ` +
        `nesse nível. A Cabala nomeia a dinâmica. ` +
        `A Astrologia mostra o timing cósmico do ciclo.`,

      (k, a, t, o) =>
        `Não lute contra a sombra — dialogue com ela. ` +
        `Quando perceber que está sendo disparado, ` +
        `pare e pergunte: "o que isso está me lembrando?" ` +
        `A resposta que vem rápido é a programaçao. ` +
        `A resposta que demora é a verdade. ` +
        `A prática não é eliminá-la — é deixá-la existir ` +
        `sem deixar que ela governe. Aí você é livre, ` +
        `não só por fora, mas por dentro.`,
    ],
  };

  // Fallback synthesis for unknown areas — generic but still 4 paragraphs
  function fallbackSynthesis(k: string, a: string, t: string, o: string): string {
    const parts: string[] = [];
    parts.push(
      `Ao reunir Cabala, Astrologia e Tantra nesta área, emerge um padrão: ` +
      `${k.toLowerCase()} . ${a.toLowerCase()}. ${t.toLowerCase()}` +
      (o ? ` ${o.toLowerCase()}` : '') +
      `. Três olhares diferentes, uma direção.`
    );
    parts.push(
      `O que Kabbalah nomeia como missão, a Astrologia colore com ` +
      `energia e o Tantra traduz em prática corporal. Quando os três ` +
      `concordam, você sabe — mesmo antes de ter a resposta racional.`
    );
    parts.push(
      `A sensação de que "algo está faltando" não é indefinição — ` +
      `é o espaço entre o que você já sabe e o que ainda não integrou. ` +
      `Os pilares estão todos presentes. O que falta é a prática ` +
      `que conecta teoria a vida real.`
    );
    parts.push(
      `Observe durante esta semana: quando você sente resistência ` +
      `nesta área, qual dos três pilares está em desacordo? ` +
      `Nomeie o descompasso. É ali que está a oportunidade ` +
      `de integrar o que já sabe.`
    );
    return parts.join(' ');
  }

  // Build the integrated narrative
  const areaSyntheses = SYNTHESIS[area];
  let integratedNarrative: string;
  if (areaSyntheses) {
    // Filter out pillars that returned only placeholder text
    const hasKab  = kabBlock.length > 50;
    const hasAstro = astroBlock.length > 50;
    const hasTantra = tantraBlock.length > 50;
    const hasOdu   = oduBlock.length > 50;
    const hasCount = [hasKab, hasAstro, hasTantra, hasOdu].filter(Boolean).length;

    // Primitive-driven anchor: when pillar data is sparse, use top synthesized
    // primitives to give the narrative a specific anchor point instead of generic.
    let primitiveAnchor = '';
    if (hasCount <= 2 && _synthesizedProfile?.primitivos.length) {
      const sombraTop = _synthesizedProfile.primitivos
        .filter(p => p.polaridade === 'sombra')
        .sort((a, b) => b.magnitude - a.magnitude)
        .slice(0, 2);
      const luzTop = _synthesizedProfile.primitivos
        .filter(p => p.polaridade === 'luz')
        .sort((a, b) => b.magnitude - a.magnitude)
        .slice(0, 2);
      if (sombraTop.length > 0 || luzTop.length > 0) {
        const sombraLabel = sombraTop[0]
          ? `o desafio central é ${sombraTop[0].primitivo} — ${sombraTop[0].contributions[0]?.fonte ?? ''}`
          : '';
        const luzLabel = luzTop[0]
          ? `sua âncora de força é ${luzTop[0].primitivo} — ${luzTop[0].contributions[0]?.fonte ?? ''}`
          : '';
        const parts: string[] = [];
        if (sombraLabel) parts.push(sombraLabel);
        if (luzLabel) parts.push(luzLabel);
        if (parts.length > 0) {
          primitiveAnchor = `O que seus mapas mais convergem é: ${parts.join(' e ')}. `;
        }
      }
    }

    // Prepend primitive anchor when available (sparse pillar data case)
    if (primitiveAnchor) {
      if (hasCount === 1) {
        integratedNarrative = [primitiveAnchor + areaSyntheses[0](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[3](kabCore, astroCore, tantraCore, oduCore)].join(' ');
      } else if (hasCount === 2) {
        integratedNarrative = [primitiveAnchor + areaSyntheses[0](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[2](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[3](kabCore, astroCore, tantraCore, oduCore)].join(' ');
      } else {
        // hasCount >= 3 but also have primitive anchor: full synthesis
        integratedNarrative = areaSyntheses.map(fn => fn(kabCore, astroCore, tantraCore, oduCore)).join(' ');
      }
    } else if (hasCount === 1) {
      integratedNarrative = [areaSyntheses[0](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[3](kabCore, astroCore, tantraCore, oduCore)].join(' ');
    } else if (hasCount === 2) {
      integratedNarrative = [areaSyntheses[0](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[2](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[3](kabCore, astroCore, tantraCore, oduCore)].join(' ');
    } else {
      // hasCount >= 3: full synthesis (no primitive anchor needed)
      integratedNarrative = areaSyntheses.map(fn => fn(kabCore, astroCore, tantraCore, oduCore)).join(' ');
    }
  } else {
    integratedNarrative = fallbackSynthesis(kabCore, astroCore, tantraCore, oduCore);
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
    ichingNarrative: ichingBlock,
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
  odu: OduBirth | null,
  holo: AkashicHologram | null,
): Record<string, AreaNarrativeFull> {
  const areas = Object.keys(LIFE_AREA_LABELS);
  const result: Record<string, AreaNarrativeFull> = {};
  for (const area of areas) {
    result[area] = generateAreaNarrativeFull(area, kab, astro, tantra, odu, holo);
  }
  return result;
}

// ─── Full synthesis paragraph ──────────────────────────────────────────────────

/**
 * Gera parágrafo de síntese geral integrado — não lista de fatos, mas uma
 * narrativa coerente que menciona o Tipo Akasha e correlaciona os pilares.
 */
export function generateSynthesisParagraph(
  kab: KabalisticMap | null,
  astro: AstrologyMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  typeName?: string
): string {
  const parts: string[] = [];

  // ── Frase de abertura: tipo Akasha + essência ─────────────────────────────
  if (typeName) {
    const typeOpening: Record<string, string> = {
      'O Catalisador': 'Você é O Catalisador — o que inicia antes de estar pronto, que coloca o mundo em movimento só por estar presente',
      'O Receptor': 'Você é O Receptor — o que capta o que outros emitem, que sabe antes de saber como sabe',
      'O Construtor': 'Você é O Construtor — o que transforma esforço diário em estruturas que ninguém mais consegue ver ainda',
      'O Transformador': 'Você é O Transformador — o que atravessa o fogo e ajuda outros a atravessar também',
      'O Guardião': 'Você é O Guardião — o que sustenta o espaço para que outros possam existir',
      'O Curador': 'Você é O Curador — o que presencia o que outros não conseguem nomear',
      'O Canal': 'Você é O Canal — o que recebe, traduz e transmite sem segurar para si',
      'O Alquimista': 'Você é O Alquimista — o que vê matéria-prima onde outros veem apenas bloqueio',
      'O Arquiteto': 'Você é O Arquiteto — o que projeta sistemas onde outros improvisam',
    };
    parts.push(typeOpening[typeName] ?? `Seu Tipo Akasha é ${typeName}`);
  }

  // ── Kabala: missão de vida ────────────────────────────────────────────────
  if (kab?.lifePath) {
    const n = reduceMasterNumber(kab.lifePath);
    const lp = LIFE_PATH_NARRATIVES[n];
    if (lp) {
      const masterNote = [11, 22, 33].includes(kab.lifePath) ? ' (Número Mestre)' : '';
      parts.push(`Seu Caminho de Vida é ${kab.lifePath}${masterNote} — ${lp.titulo}. ${lp.essencia}`);
    }
  }

  // ── Astrologia: elemento + energia vital ──────────────────────────────────
  const sol = astro?.planets?.find(p => p.planet === 'Sol')?.sign;
  const lua = astro?.planets?.find(p => p.planet === 'Lua')?.sign;
  const elemento = getElement(sol);
  const elementoDesc: Record<string, string> = {
    fogo: 'fogo — você sente no corpo antes de pensar; age por intuição e impulso.',
    terra: 'terra — você opera pelo concreto e pela paciência; precisa de fatos antes de agir.',
    ar: 'ar — você processa pela mente antes de sentir; pensa para entender.',
    água: 'água — você absorve antes de reagir; sente o ambiente antes de decidir.',
  };
  if (sol) {
    parts.push(`Sol em ${sol} (elemento ${elemento}). ${elementoDesc[elemento] ?? ' Seu elemento colore como você sente e reage ao mundo.'}${lua ? ` Lua em ${lua} revela que você precisa de ${lua === 'Câncer' ? 'segurança emocional e fronteiras claras' : lua === 'Escorpião' ? 'intimidade profunda e confiança absoluta' : 'espaço para processar antes de responder'} no dia a dia.` : ''}`);
  }

  // ── Tantra: corpo dominante + sexualidade ────────────────────────────────
  if (tantra?.soul) {
    const bodies = ['', 'Alma Primordial', 'Corpo de Desejo', 'Mente Positiva', 'Mente Negativa', 'Corpo Físico', 'Corpo de Arco', 'Corpo Divino', 'Corpo do Campo', 'Corpo de Mahat', 'Corpo Radiante', 'Corpo Indestrutível'];
    const bodyName = bodies[tantra.soul] ?? `Corpo ${tantra.soul}`;
    const bodyEssence: Record<number, string> = {
      1: 'você é puro propósito antes da forma — busque clarity of intention.',
      2: 'você opera pelo desejo como GPS — identifique o que você realmente quer.',
      3: 'você pensa em imagens e sons — dê forma ao que vê: escreva, desenhe, dance.',
      4: 'você filtra antes de integrar — reconheça o guardião que às vezes retém demais.',
      5: 'você é o instrumento pelo qual a intenção se manifesta — cuide do corpo.',
      6: 'você é ponte entre o interno e o externo — pergunte: o que eu ofereço ao mundo?',
      7: 'você é canal — sabe coisas sem saber como — confie na primeira impressão.',
      8: 'você irradia antes de falar — respeite sua presença como instrumento.',
      9: 'você tem acesso à sabedoria universal — o silêncio é seu idioma.',
      10: 'você irradia propósito sem esforço quando ativo — deixe-se ser visto.',
      11: 'você sabe que nada é definitivo — e age mesmo assim com coragem.',
    };
    parts.push(`No Tantra, seu ${bodyName} é central. ${bodyEssence[tantra.soul] ?? 'Seu corpo é o instrumento pelo qual tudo se manifesta.'}`);
  }

  // ── Odu: âncora ancestral ───────────────────────────────────────────────
  if (odu?.oduName) {
    const oduEssence: Record<string, string> = {
      Ogbe: 'Ogbe é criação primordial — você inicia, cria, abre caminhos.',
      Oyeku: 'Oyeku é destruição criativa — você dissolve o que não funciona para que o novo possa nascer.',
      Iwori: 'Iwori é percepção profunda — você vê o que está por baixo da superfície.',
      Odi: 'Odi é mistério e gestação — você sabe coisas que não consegue explicar ainda.',
      Irosun: 'Irosun é fartura e alegria — você irradia quando está em fluxo.',
      Owonrin: 'Owonrin é caos criativo — você atrai reinvenções e mudanças de rumo.',
      Obara: 'Obara é realeza e abundância — você lidera com responsabilidade sagrada.',
      Okanran: 'Okanran é conflito e resolução — você enfrenta o que outros evitam.',
      Ogunda: 'Ogunda é abertura de caminhos — você é guerreiro que remove obstáculos.',
      Osa: 'Osa é fartura plural — você prospera por múltiplas fontes.',
      Ika: 'Ika é mistério invisível — você funciona melhor no trabalho silencioso.',
      Oturupon: 'Oturupon é cura sagrada — você é espaço onde outros se restauram.',
      Otura: 'Otura é maestria e encerramento — você coleta os frutos do que plantou.',
      Irete: 'Irete é força vital — você é resiliente e atrai oportunidades por mérito.',
      Ose: 'Ose é adaptabilidade sagrada — você é ponte entre mundos.',
      Ofun: 'Ofun é completude — você facilita encerramentos e conclusões.',
    };
    const desc = oduEssence[odu.oduName] ?? `${odu.oduName} é sua âncora ancestral.`;
    parts.push(`No Odu, ${desc}${odu.elementalForce ? ` Força elemental: ${odu.elementalForce}.` : ''}${odu.orixaRegency?.[0] ? ` Regido por ${odu.orixaRegency[0]}.` : ''}`);
  }

  if (parts.length === 0) {
    return 'Seu perfil Akasha está sendo completado. A síntese emerge quando todos os pilares são conhecidos.';
  }

  // Join into a flowing paragraph — lead with type, follow with supporting pillars
  const main = parts[0] ?? '';
  const rest = parts.slice(1);
  const restText = rest.length > 0 ? ' ' + rest.join(' ') : '';
  return `${main}.${restText}`.trim();
}
