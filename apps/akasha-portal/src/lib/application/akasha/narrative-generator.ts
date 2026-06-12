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

  // ── Deep ODU narratives: all 16 Odu with per-area content ─────────────────
  const ODU_AREA_NARRATIVES: Record<string, Record<string, string>> = {

    // ── OGUN / FERRO ────────────────────────────────────────────────────────
    Ogbe: {
      vitalidadeEnergia: `${name} é o Odu da criação primordial — o sopro que tudo inicia. Seu corpo com Ogbe sente antes de pensar: a intuição é o seu GPS. Vitalidade oscila em ciclos — você tem picos de energia seguidos de vazio. A armadilha: forçar o vazio a ser cheio. Prática: ao acordar, permaneça 5 min em silêncio antes de agir.`,
      conexoesAmor: `${name} no amor traz intensidade criativa — você inicia, transforma, reinicia. Seu corpo atrai quem também tem capacidade de mudança. A crise surge quando o parceiro não acompanha seu ritmo. Não force a transformação alheia. A lição: você atrai pela sua presença, não pela sua insistência.`,
      carreiraProsperidade: `${name} na carreira é o Odu do pioneiro. Você vê o que não existe ainda e cria o caminho andando. Mas Ogbe sem fundamento vira exaustão: você começa 10 coisas e termina nenhuma. Prática: defina 1 projeto por vez. A prosperidade vem quando você termina, não quando você inicia.`,
      oriCabecaQuizilas: `${name} na mente traz percepção aguda — você vê o padrão por trás do comportamento. Mas Ogbe também traz agitação mental: pensamentos que começam e não param. A prática: escreva os pensamentos antes de agir sobre eles. Isso ancora a percepção sem dispersar.`,
      missaoDestino: `${name} é Odu de iniciação. Você veio para criar o que não existia — ideias, projetos, caminhos. A sua missão não é continuar o que outros fizeram, é abrir trilhas novas. O medo de começar é a sombra; a coragem de iniciar é o dom.`,
      desafiosSombras: `${name} nos desafios manifesta-se como pressa de agir. Você quer resolver agora. A sabedoria de Ogbe: nem tudo precisa ser iniciado hoje. Pergunte-se: isto é urgência real ou ansiedade disfarçada?`,
    },

    // ── OYEKU / RUÍNA ──────────────────────────────────────────────────────
    Oyeku: {
      vitalidadeEnergia: `${name} é Odu da transformação interior — o fuego queima para dentro. Você não irradia; você processa. Seu corpo pede stillness para digerir o que sente. Forçar expressão quando o corpo pede silêncio é a armadilha. Confie no ciclo: descida é parte do processo, não falha.`,
      conexoesAmor: `${name} no amor é profundo e exigente. Você não quer superficialidade — precisa de intimidade que transforme. A quantidade de parceiros importa menos que a profundidade de cada encontro. A armadilha: exigir do outro o que você não se permite.`,
      carreiraProsperidade: `${name} na carreira atrai recursos por meio de transformação — você limpa o terreno antes de construir. Mas o tempo entre "limpar" e "construir" pode ser longo demais. Defina prazos. A prosperidade de Oyeku vem quando você aceita que a transformação já aconteceu.`,
      oriCabecaQuizilas: `${name} na mente opera pela introspecção. Você pensa melhor em silêncio, sozinho. O risco: isolar-se da realidade concreta. Dados, números, fatos são seu antídoto. Não confie só no feeling.`,
      missaoDestino: `${name} é Odu de destruição criativa — você dissolve o que não funciona para que o novo possa nascer. Sua missão não é manter, é limpar. Mas limpar não é fim: é preparação. Aceite o vazio como parte do caminho.`,
      desafiosSombras: `${name} nos desafios tende a autodestruição sutil — abandono, neglect, sabotagem. Você pode estar sabotando a si mesmo sem perceber. Pergunte: o que estou tentando destruir que ainda serve?`,
    },

    // ── IWORI / ÁGUAS PRIMORDIAIS ──────────────────────────────────────────
    Iwori: {
      vitalidadeEnergia: `${name} é Odu da percepção profunda. Você sente o que others only imagine. Seu corpo é receptor de alta sensibilidade — ambientes, pessoas, energias. A armadilha: carregar o que não é seu. Prática: ao entrar em espaço, tome 3 respirações e defina: "isto é meu ou do ambiente?"`,
      conexoesAmor: `${name} no amor é intenso e profundo. Você ama com o corpo inteiro, não só com o coração. A percepção aguçada permite saber coisas sobre o parceiro antes de serem ditas. O risco: usar a percepção para controlar em vez de compreender.`,
      carreiraProsperidade: `${name} na carreira traz clareza de visão — você vê o que está por trás dos números, das estratégias, dos relatórios. Use isso para tomar decisões que outros não conseguem ver. A prosperidade vem quando você confia na sua leitura do todo.`,
      oriCabecaQuizilas: `${name} na mente é investigativa e profunda. Você vai na raiz das coisas. Mas a profundidade pode virar obsessão: você investiga demais sem agir. A prática: ao investigar, defina um tempo. Depois do tempo, aja com o que descobriu.`,
      missaoDestino: `${name} é Odu da sabedoria oculta. Você veio para descobrir verdades escondidas — suas e dos outros. Sua missão não é guardar segredo, é revelar o que precisa ser revelado, no tempo certo.`,
      desafiosSombras: `${name} nos desafios revela paranoia — você vê ameaças onde não há. A percepção aguçada mal direcionada vira阴谋. Pergunte: estou vendo realidade ou criando cenário?`,
    },

    // ── ODI / ESPELHO ──────────────────────────────────────────────────────
    Odi: {
      vitalidadeEnergia: `${name} é Odu do ventre e do mistério da criação. Você sente no corpo antes de entender pela mente. Intuição gynecológica: você sabe quando algo está certo ou errado antes de ter palavras para isso. A armadilha: esperar demais do corpo sem dar input concreto.`,
      conexoesAmor: `${name} no amor opera como espelho — você reflete e amplifica a energia do outro. Se o parceiro está bem, você brilha. Se está em crise, você absorve. A prática: antes de entrar em relação, verifique: estou eu ou estou espelhando?`,
      carreiraProsperidade: `${name} na carreira traz capacidade de gerar recursos de forma invisível — você atrai sem precisar perseguir. Mas essa energia pode ser mal direcionada se você não sabe o que quer. Defina: o que eu quero construir? Sem resposta clara, Odi atrai dispersão.`,
      oriCabecaQuizilas: `${name} na mente opera pelo mistério — você sabe sem saber como sabe. O risco: usar o não saber como desculpa para não agir. Mas Odi também ensina: nem tudo precisa ser compreendido para ser verdadeiro. Aceite que a sabedoria do corpo é válida.`,
      missaoDestino: `${name} é Odu da gestação — você carrega algo que ainda não nasceu. A missão não é revelada antes da hora. Aceite o mistério como parte do caminho. Não force a revelação.`,
      desafiosSombras: `${name} nos desafios manifesta-se como ilusão — você pode acreditar em narrativas sobre si que não são suas. Verifique: isto que acredito sobre mim é verdade ou é espelho de algo que absorvi de outro?`,
    },

    // ── IROSUN / TROVÃO ────────────────────────────────────────────────────
    Irosun: {
      vitalidadeEnergia: `${name} é Odu da fartura e da alegria incarnada. Seu corpo irradia energia quando está em fluxo — você precisa de movimento, celebração, expressão. Sequestrar Irosun gera tensão física que se manifesta como inquietação. Prática: dance diariamente, mesmo que só 5 minutos.`,
      conexoesAmor: `${name} no amor traz sensualidade e charme natural. Você atrai pelo brilho, não pela profundidade — pelo menos no início. O risco: superficialidade que vira hábito. A profundidade vem quando você permite vulnerabilidade.`,
      carreiraProsperidade: `${name} na carreira é Odu de expansão — você atrai oportunidades e pessoas. Mas sem foco, a fartura se dispersa. Defina 1 prioridade clara. A abundância de Irosun flui quando há direção.`,
      oriCabecaQuizilas: `${name} na mente é rápido e associativo — você conecta ideias em velocidade. O risco: superficialidade por velocidade. A prática: ao ter um insight, escreva-o. Não deixe que o próximo pensamento leve o anterior.`,
      missaoDestino: `${name} é Odu da alegria incarnada. Você veio para mostrar que espiritualidade pode ser leve, que sagrada não precisa ser triste. Sua missão é ser a prova viva de que serviço e alegria coexistem.`,
      desafiosSombras: `${name} nos desafios manifesta-se como dispersão — você quer tudo, faz tudo, e no final não tem nada. A armadilha: confundir movimento com progresso. Pergunte: isto me aproxima do que importa ou só me mantém ocupado?`,
    },

    // ── OWONRIN / ARCO-ÍRIS / CAOS ────────────────────────────────────────
    Owonrin: {
      vitalidadeEnergia: `${name} é Odu do caos criativo — mudanças rápidas e inesperadas. Seu corpo funciona melhor quando há variação: rotina é inimiga. Você precisa de novidade para não entrar em estagnação. Mas caos sem âncora é só confusão. Encontre seu centro antes de buscar a mudança.`,
      conexoesAmor: `${name} no amor traz intensidade emocional e imprevisibilidade. Você sente profundamente e reage intensamente. A armadilha: dramatizar. A prática: quando sentir a reação intensificar, respire fundo antes de agir. Nem toda emoção precisa ser expressada imediatamente.`,
      carreiraProsperidade: `${name} na carreira é Odu de mudança de rumo — você atrai reviravoltas. Isso pode ser dom ou destruição, dependendo de como você integra. A prática: após cada mudança, escreva o que aprendeu antes de agir. Isso transforma caos em sabedoria.`,
      oriCabecaQuizilas: `${name} na mente opera por insight súbito — você sabe de repente o que antes não sabia. O risco: acreditar que todo insight é verdade. Alguns insights são reais; outros são ruído. Verifique com os fatos antes de decidir.`,
      missaoDestino: `${name} é Odu da reinvenção. Você veio para atravessar transições que assustam outros. Sua missão é mostrar que mudança não é perda — é portal. Mas só atravessa se você não estiver se agarrando ao que precisa ser solto.`,
      desafiosSombras: `${name} nos desafios revela-se como instabilidade — você muda de direção constantemente sem nunca estabelecer base. A armadilha: usar "mudança" como fuga de compromisso. Defina um terreno que não muda, mesmo quando tudo ao redor muda.`,
    },

    // ── OBARÁ / CORDA / ABUNDÂNCIA ───────────────────────────────────────
    Obara: {
      vitalidadeEnergia: `${name} é Odu da realeza e da Lei Sagrada incarnada. Seu corpo funciona melhor quando há estrutura e propósito claro. Você precisa sentir que o que faz tem significado. Sem propósito, o corpo entra em letargia. Prática: toda manhã, nomeie 1 coisa que você vai fazer que importa.`,
      conexoesAmor: `${name} no amor traz fidelidade e profundidade. Você ama com comprometimento — o corpo, a mente e o espírito. A armadilha: confundir dever com amor. Você pode estar cumprindo papel de parceiro sem sentir a conexão real. Pergunte: estou amando ou só cumprindo?`,
      carreiraProsperidade: `${name} na carreira é Odu de liderança com responsabilidad. Você não lidera para dominar — lidera para proteger e fazer crescer. Mas se você não estiver no comando, pode sentir-se deslocado. A prosperidade de Obara vem quando você lidera sem controlar.`,
      oriCabecaQuizilas: `${name} na mente opera pela lei — você tem senso agudo de certo e errado, justo e injusto. O risco: rigidez moral. A prática: antes de julgar, pergunte: isto é regra minha ou regra universal? Às vezes sua intuição de justo/injusto é cultural, não cósmica.`,
      missaoDestino: `${name} é Odu da liderança sagrada. Você veio para liderar com integridade — ser a prova de que poder e bondade coexistem. A sua missão não é ter razão, é fazer o bem. Quando essas duas coisas divergem, escolha o bem.`,
      desafiosSombras: `${name} nos desafios revela orgulho disfarçado de dignidad. Você pode estar mais preocupado com a própria imagem de justo do que com a justiça real. Pergunte: estou fazendo o certo ou só parecendo que sim?`,
    },

    // ── OKANRAN / CONFLITO ────────────────────────────────────────────────
    Okanran: {
      vitalidadeEnergia: `${name} é Odu do conflito e da resolução. Seu corpo reage fortemente a tensão — você sente quando algo não está certo. Essa é sua antena, não seu inimigo. Use a tensão para investigar, não para atacar. A prática: quando sentir tensão, pergunte "o que está fora de lugar?" antes de reagir.`,
      conexoesAmor: `${name} no amor traz intensidade e drama. Você sente profundamente e tende a expressar o conflito antes de processá-lo. A armadilha: transformar divergência em guerra. A prática: antes de confrontar, escreva o que você quer dizer. Isso transforma reação em comunicação.`,
      carreiraProsperidade: `${name} na carreira atrai situações de crise — você é chamado quando algo precisa ser resolvido. Esse é seu dom, não sua maldição. Mas se você só resolve crises e nunca cria, fica refém do caos alheio. A prática: aparte tempo para criar, não só reagir.`,
      oriCabecaQuizilas: `${name} na mente opera por contraste — você entende as coisas vendo o oposto. O risco: ver só conflito onde há nuance. A prática: ao avaliar uma situação, liste 3 coisas que estão funcionando além das 3 que não estão. Equilibre o diagnóstico.`,
      missaoDestino: `${name} é Odu do conflito necessário. Você veio para enfrentar o que outros evitam — e resolver. Sua missão não é criar paz artificial, é resolver o que precisa ser resolvido para que a paz possa existir. Mas às vezes a resolução pede sacrifício seu. Esteja pronto.`,
      desafiosSombras: `${name} nos desafios manifesta-se como ressentimento — você guarda o que foi feito contra você. A armadilha: deixar o passado governar o presente. A prática: diariamente, escreva 1 coisa do passado que você escolhe liberar. Não por perdão — por liberdade.`,
    },

    // ── OGUNDÁ / PORTA / MUDANÇA ───────────────────────────────────────────
    Ogunda: {
      vitalidadeEnergia: `${name} é Odu do guerreiro trabajador. Seu corpo é instrumento de ação — você precisa usar os músculos, caminhar, construir. Sedentarismo drena sua energia mais rápido que em qualquer outro Odu. Prática: mova o corpo antes de tomar decisões. Caminhada, não academia — movimento com direção.`,
      conexoesAmor: `${name} no amor traz intensidade emocional e imprevisibilidade. Você sente profundamente e tende a expressar o conflito antes de processá-lo. A armadilha: dramatizar. A prática: quando sentir a reação intensificar, respire fundo antes de agir. Nem toda emoção precisa ser expressada imediatamente.`,
      carreiraProsperidade: `${name} na carreira é Odu de conquista material. Você obtém o que persegue com trabalho constante. A teimosia é sua aliada quando o objetivo é certo, inimiga quando é errado. Verifique: o que estou perseguindo serve à vida que quero ou só serve ao meu orgulho?`,
      missaoDestino: `${name} é Odu de abertura de caminhos. Você veio para abrir portas que estavam fechadas — não para você, mas para outros entrarem também. A missão é criar passagem. O que você abre hoje é o caminho de quem vem depois.`,
      desafiosSombras: `${name} nos desafios revela teimosia — você insiste no que não funciona porque parar é admitir erro. A sabedoria: insistir no que não funciona não é coragem, é ego. Mude de direção antes que o custo seja seu.`,
    },

    // ── OSA / CAÇA / ABUNDÂNCIA ───────────────────────────────────────────
    Osa: {
      vitalidadeEnergia: `${name} é Odu da fartura e da caça criativa. Seu corpo precisa de variedade — você fica entediado com rotina. A energia flui quando há objetivo claro, mas diversificado. Prática: tenha 3 projetos simultâneos — 1 que sustenta (dinheiro), 1 que nutre (criativo), 1 que expands (aprendizado).`,
      conexoesAmor: `${name} no amor traz sensualidade e apetite por novidade. Você é atraído pela diversidade, não pela monotonia. A armadilha: confundir excitação com amor. A prática: observe se o que sente pelo parceiro é presença ou só ausência prolongada. Paixão sem presença é só dependência química.`,
      carreiraProsperidade: `${name} na carreira atrai abundância por meio de múltiplas fontes — você não confia em uma só. Isso é sábio, mas pode dispersar. A prática: enquanto explora novas fontes, termine pelo menos 1 coisa que começou. O que não termina não vira prosperidade real.`,
      oriCabecaQuizilas: `${name} na mente opera por múltiplas ideias simultâneas — você conecta campos distintos. O risco: dispersão. A prática: ao ter uma ideia nova, anote e continue com a anterior. Dez ideias escritas valem mais que uma executada e nove esquecídas.`,
      missaoDestino: `${name} é Odu da abundância plural. Você veio para mostrar que prosperidade não é só dinheiro — inclui saúde, relações, conhecimento, experiência. Sua missão é viver a abundância em todas as suas formas, não só na que o mundo reconhece.`,
      desafiosSombras: `${name} nos desafios manifesta-se como gula — você quer mais, sempre mais, sem chegar a lugar nenhum. A armadilha: confundir acumulação com plenitude. Pergunte: quanto é suficiente? Se não sabe, você está correndo sem destino.`,
    },

    // ── IKA / MISTÉRIO ────────────────────────────────────────────────────
    Ika: {
      vitalidadeEnergia: `${name} é Odu do mistério e da transformação invisível. Você funciona melhor quando ninguém está olhando — o trabalho silencioso é seu dom. Seu corpo pede privacidade para processar. A armadilha: só funcionar quando invisível e não conseguir atuar na frente dos outros.`,
      conexoesAmor: `${name} no amor traz profundidade que não se expressa facilmente. Você ama em silêncio — com gestos, não com palavras. A armadilha: esperar que o outro leia suas intenciones sem você falar. Diga o que você sente. A profundidade que você carrega precisa de palavras para ser recebida.`,
      carreiraProsperidade: `${name} na carreira é Odu de insight — você vê o que não é óbvio. Use isso para criar soluções onde outros veem problemas. A prosperidade de Ika vem quando você traduz seu insight privado em valor público. O que você sabe sozinho não sustenta — o que você compartilha transforma.`,
      oriCabecaQuizilas: `${name} na mente opera por intuição profunda — você sabe coisas que não consegue explicar. O risco: confiar demais na intuição sem verificação. A prática: quando tiver um insight, teste-o com dados antes de decidir. Intuição mais fato é sabedoria; intuição sem fato é aposta.`,
      missaoDestino: `${name} é Odu do mistério como caminho. Você veio para guardar segredos sagrados — não para guarda-los só para si, mas para revelá-los no tempo certo. A missão é ser o mensageiro, não a fonte. Fale quando for a hora, não antes.`,
      desafiosSombras: `${name} nos desafios revela-se como segredo patológico — você esconde o que não precisa esconder e revela o que deveria guardar. A armadilha: usar mistério como proteção de não ser visto. Pergunte: estou protegendo a verdade ou fugindo de ser conhecido?`,
    },

    // ── OTURUPON / COROA ──────────────────────────────────────────────────
    Oturupon: {
      vitalidadeEnergia: `${name} é Odu da cura e da transformação pela crise. Seu corpo é sensor de doença antes que ela se manifeste — você sabe quando algo está errado no ambiente ou nas pessoas antes de ter provas. Use isso para prevenir, não só para reagir depois.`,
      conexoesAmor: `${name} no amor opera como espaço de cura — você é o lugar onde outros vêm para se sentir melhores. A armadilha: ser o curador que nunca se cura. Você dá o que tem, mas recebe pouco. Prática: semanalmente, receba cuidado de alguém. Sem pedir, só permita.`,
      carreiraProsperidade: `${name} na carreira atrai posições de responsabilidade moral — você é chamado a decisões que afetam outros. Isso pode ser exaustivo se você não tiver limites. A prática: após decisões difíceis, reserve 30 minutos só para você. Decisão sem autocuidado vira esgotamento.`,
      oriCabecaQuizilas: `${name} na mente opera pela reflexão — você entende situações complexas pensando nelas, não agindo sobre elas. O risco: pensar sem agir. A prática: ao refletir sobre um problema, defina um prazo para a reflexão. Passado o prazo, aja com o que entendeu — mesmo que incompleto.`,
      missaoDestino: `${name} é Odu da cura sagrada. Você veio para ser a prova viva de que a cura existe — não só falar sobre ela, mas vivê-la. A missão não é só curar os outros, é mostrar que a cura é possível pelo que você é, não só pelo que você faz. Others vão acreditar na mensagem quando a virem na sua vida.`,
      desafiosSombras: `${name} nos desafios manifesta-se como fardo — você sente o peso da responsabilidade que os outros não assumem. A armadilha: carregar o que não é seu. A prática: diariamente, pergunte: isto é meu ou estou carregando porque ninguém mais quis? Se não é seu, devolva — mentalmente, se não for possível fisicamente.`,
    },

    // ── OTURA / MESTRE ────────────────────────────────────────────────────
    Otura: {
      vitalidadeEnergia: `${name} é Odu da maestria e do encerramento. Você funciona melhor no efeito platô — após o achievement, antes da próxima aventura. A energia sustentada é seu dom, não o pico. Preserve-se para o trabalho de longa duração, não para o sprint.`,
      conexoesAmor: `${name} no amor traz estabilidade e profundidade. Você não é o início do fogo — é a brasa que permanece. A armadilha: confundindo permanência com estagnação. Relacionamentos estáveis também precisam de atualização. Pergunte ao parceiro anualmente: ainda estamos crescendo juntos?`,
      carreiraProsperidade: `${name} na carreira é Odu de consolidação. Você coleta os frutos do que plantou — e sabe amministrarlos. A prosperidade vem para quem sabe guardar, não só quem sabe conquistar. A prática:每个月 guarde uma parte do que ganha. Isso não é austeridade — é respeito pelo seu trabalho.`,
      oriCabecaQuizilas: `${name} na mente opera pela sabedoria acumulada — você sabe porque viveu, não só porque pensou. O risco: usar a experiência como desculpa para não aprender mais. A prática: anualmente, apprenda algo completamente novo, fora da sua área. Isso mantém a mente jovem.`,
      missaoDestino: `${name} é Odu da mestria incarnada. Você veio para ser a prova viva de que consistência supera talento. A missão é mostrar que o caminho boring é o mais profundo. Não procure a shortcuts — a shortcuts são para quem não tem consistência.`,
      desafiosSombras: `${name} nos desafios revela konservatismo extremo — você resiste a mudanças mesmo quando necessário. A armadilha: chamar de "tradição" o que é medo de novo. A prática: anualmente, mude algo fundamental na sua vida. Não precisa ser grande — precisa ser real.`,
    },

    // ── IRETE / FORÇA ─────────────────────────────────────────────────────
    Irete: {
      vitalidadeEnergia: `${name} é Odu da força vital e da saúde. Seu corpo é resiliente — você se recupera rápido de problemas que outros levam semanas. Mas isso não é motivo para descuidar. A armadilha: usar a resiliência como desculpa para não parar. Mesmo resiliente, você precisa de descanso.`,
      conexoesAmor: `${name} no amor traz paixão e dinamismo. Você ama com o corpo, não só com o coração — energia física, contato, presença. A armadilha: confundindo intensidade com profundidade. A prática: além da intensidade física, invista em presença emocional. Dê ao parceiro tempo de qualidade, não só energia.`,
      carreiraProsperidade: `${name} na carreira atrai oportunidades por mérito — você obtém o que merece, não o que pede. A prosperidade vem do trabalho reconhecido. A prática: semanalmente, documente o que você alcançou. Não é vaidade — é prova concreta de que você merece o que tem.`,
      oriCabecaQuizilas: `${name} na mente opera pela certeza — você sabe o que sabe, sem dúvida. O risco: confundir certeza com arrogância. A prática: ao tomar uma decisão forte, peça a opinião de alguém que pensa diferente. Isso não enfraquece sua certeza — testa se ela é sólida ou só hábito.`,
      missaoDestino: `${name} é Odu da força vital incarnada. Você veio para mostrar que a verdadeira força não é a que impõe — é a que sustenta. A missão é ser a presença que as pessoas confiam quando tudo ao redor desmorona. others find their center when you are present.`,
      desafiosSombras: `${name} nos desafios manifesta-se como teimosia de não pedir ajuda. Você aguenta até não aguentar — e aí quebra. A armadilha: achar que pedir ajuda é fraqueza. Na verdade, pedir ajuda no tempo certo é sabedoria. A prática: antes de alcançar seu limite, peça apoio. Antecipe, não só reaja.`,
    },

    // ── OFUN / SILÊNCIO ──────────────────────────────────────────────────
    Ofun: {
      vitalidadeEnergia: `${name} é Odu do silêncio e da completude. Seu corpo funciona melhor em paz — ruído, pressa e estimulação excessiva drenam você. Você precisa de tempo sozinho, sem input, sem output. A armadilha: usar silêncio como fuga. Prática: diariamente, 10 minutos de silêncio genuíno — sem música, sem tela, sem conversa. Só presença.`,
      conexoesAmor: `${name} no amor opera na profundidade, não na frequência. Você ama poucos, mas profundamente. A armadilha: usar a profundidade como desculpa para evitar a vulnerabilidade do contato regular. A prática: force-se a ter momentos de presença plena com o parceiro — não só morar juntos, mas estar presente quando juntos.`,
      carreiraProsperidade: `${name} na carreira atrai sabedoria — você é consultado para decisões complexas. A prosperidade vem de ser a referência em que outros confiam. Mas a armadilha: dar demais sem receber. A prática: cada vez que alguém se beneficie da sua sabedoria, peça algo em troca — nem que seja só gratidão expressada. Isso equilibra o fluxo.`,
      oriCabecaQuizilas: `${name} na mente opera pelo silêncio interior — você pensa melhor quando aparenta não estar pensando. O risco: ficar demais no silêncio sem chegar a conclusões. A prática: ao fim de cada silêncio, escreva 1 coisa que aprendeu. Isso transforma contemplação em insight.`,
      missaoDestino: `${name} é Odu da completude — você veio para encerrar ciclos. Sua presença facilita a conclusão: de projetos, de relacionamentos, de fases. A missão não é só encerrar — é encerrar com sabedoria, de forma que o que termina bem libera o que começa.`,
      desafiosSombras: `${name} nos desafios manifesta-se como melancolia — a sensação de que tudo já foi dito, feito, que nada mais importa. A armadilha: usar "já sei como é" como desculpa para não participar. A prática: diariamente, encontre 1 coisa nova — uma música, uma conversa, um caminho diferente. O novo não precisa ser grande. Só precisa ser real.`,
    },
  };
  // ── Lookup: return Odu-specific or generic per area ──────────────────────
  const oduSpecific = ODU_AREA_NARRATIVES[name]?.[area];
  if (oduSpecific) return oduSpecific;

  const generic = `${name}${elemental ? ' ('+elemental+')' : ''}${orixa ? ' — regido por '+orixa : ''}. ${lesson ? 'Lição de vida: '+lesson : 'Este Odu guarda uma mensagem que ainda não foi revelada.'} No dia a dia, observe como ${name.toLowerCase()} se manifesta em você.`;
  const areaGeneric: Record<string, string> = {
    vitalidadeEnergia: generic + ' Seu corpo é templo deste Odu. Respeite os ritmos.',
    conexoesAmor: generic + ' No amor, este Odu informa como você se conecta e se desconecta.',
    carreiraProsperidade: generic + ' Na carreira, este Odu aponta o caminho de abundância.',
    oriCabecaQuizilas: generic + ' Na mente, este Odu traz clareza ou mistério — dependendo do dia.',
    missaoDestino: generic + ' Este Odu é parte da sua missão. Aceite isso.',
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

  // ── Deep synthesis engine ─────────────────────────────────────────────────
  // Each area gets 3-5 flowing paragraphs that genuinely integrate the pillars
  // rather than gluing together the first sentence of each block.

  /**
   * Extracts a usable 1-2 sentence core from a pillar block, stripping trailing
   * filler and avoiding empty strings when a block is just a placeholder.
   */
  /**
   * coreOf — extract the first meaningful narrative sentence from a block.
   * Skips single-word titles (e.g. "Iluminador · Mestre", "fogo")
   * and finds the first real descriptive sentence (≥3 words, ≥18 chars).
   */
  function coreOf(block: string, preferSecond = false): string {
    const sentences = block.split(/[.!]/).map(s => s.trim()).filter(s => s.length > 10);
    if (sentences.length === 0) return '';
    // Skip title-only sentences: < 3 words OR < 18 chars
    function isNarrative(s: string): boolean {
      const words = s.split(/\s+/).filter(w => w.length > 0).length;
      return words >= 3 && s.length >= 18;
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
        `essa fronteira, quando mal traçada, é onde Relationships se perdem.`,

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

    // For single-pillar cases, skip the cross-pillar paragraph (2 paragraphs)
    if (hasCount === 1) {
      integratedNarrative = [areaSyntheses[0](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[3](kabCore, astroCore, tantraCore, oduCore)].join(' ');
    } else if (hasCount === 2) {
      integratedNarrative = [areaSyntheses[0](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[2](kabCore, astroCore, tantraCore, oduCore), areaSyntheses[3](kabCore, astroCore, tantraCore, oduCore)].join(' ');
    } else {
      // 3-4 pillars: full 4-paragraph synthesis
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
      'O Catalisador': 'Você é O Catalisador — o que inicia antes de estar pronto, que coloca o mundo em movimento só por estar presente.',
      'O Receptor': 'Você é O Receptor — o que capta o que outros emitem, que sabe antes de saber como sabe.',
      'O Construtor': 'Você é O Construtor — o que transforma esforço diário em estruturas que ninguém mais consegue ver ainda.',
      'O Transformador': 'Você é O Transformador — o que atravessa o fogo e ajuda outros a atravessar também.',
      'O Guardião': 'Você é O Guardião — o que sostiene o espaço para que outros possam existir.',
      'O Curador': 'Você é O Curador — o que presencia o que outros não conseguem nomear.',
      'O Canal': 'Você é O Canal — o que recebe, traduz e transmite sem segurar para si.',
      'O Alquimista': 'Você é O Alquimista — o que vê matéria-prima onde outros veem apenas bloqueio.',
      'O Arquiteto': 'Você é O Arquiteto — o que projeta sistemas onde outros improvisam.',
    };
    parts.push(typeOpening[typeName] ?? `Seu Tipo Akasha é ${typeName}.`);
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
