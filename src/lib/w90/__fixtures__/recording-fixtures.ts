/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90-C — WORKSHOP RECORDING FIXTURES (mock data for cycle 90 dev/demo)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Four workshop recordings across four traditions:
 *   1. Astrologia — Saturno em Casa 7 (transcender padrões de relação)
 *   2. Cigano    — Mesa Real: 9 casas e o Cavaleiro (caminho do consulente)
 *   3. Orixás    — Axé de Oxalá: abertura da semana iorubá
 *   4. Tantra-Cabala — Respiração da Sefirá Tiferet (coração unificado)
 *
 * Each fixture has:
 *   - Realistic metadata
 *   - 14-22 transcript segments in pt-BR
 *   - Mix of speakers (facilitator + participants)
 *   - Authentic tradition terminology
 *   - Engine-detectable highlights (questions, practices, insights)
 *
 * IMPORTANT: deterministic — no random IDs, no Date.now(), no Math.random().
 */

import {
  wid,
  wrid,
  uid,
  type WorkshopRecording,
  type TranscriptSegment,
  type Tradition,
} from '../workshop-recording.ts';

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE 1 — Astrologia · Saturno em Casa 7
// ════════════════════════════════════════════════════════════════════════════

const astrologiaSegments: TranscriptSegment[] = Object.freeze([
  { startSeconds: 0, endSeconds: 38, speakerName: 'Paula de Marte', text: 'Boa noite, roda. Hoje vamos olhar para Saturno atravessando a Casa 7, que é a casa dos vínculos, dos contratos afetivos, das alianças que pedem maturidade.', language: 'pt-BR' },
  { startSeconds: 40, endSeconds: 78, speakerName: 'Paula de Marte', text: 'Saturno não vem para destruir, ele vem para consolidar. A pergunta é: quais relações você aceita cultivar com responsabilidade e quais já completaram seu ciclo?', language: 'pt-BR' },
  { startSeconds: 82, endSeconds: 112, speakerName: 'Consulente Carla', text: 'Paula, eu tenho um namoro de seis anos e sinto que ele esfriou. Como eu diferencio se é fase de Saturno ou se a relação realmente chegou ao fim?', language: 'pt-BR' },
  { startSeconds: 116, endSeconds: 168, speakerName: 'Paula de Marte', text: 'Carla, escuta. Saturno pede prova de consistência, mas também honestidade. Se a relação esfriou e não há mais construção em conjunto, Saturno está te dando permissão para encerrar com dignidade. Não com raiva, com respeito ao que foi.', language: 'pt-BR' },
  { startSeconds: 172, endSeconds: 210, speakerName: 'Consulente Bruno', text: 'E quando a pessoa já se afastou? Eu sinto que estou segurando um vínculo unilateral.', language: 'pt-BR' },
  { startSeconds: 214, endSeconds: 268, speakerName: 'Paula de Marte', text: 'Bruno, aqui é importante olhar Lilith em aspecto com Saturno. Quando Lilith toca a Casa 7, há um padrão de atrair pessoas indisponíveis. Reconhece esse padrão primeiro; depois, decide se quer curar ou se afastar.', language: 'pt-BR' },
  { startSeconds: 272, endSeconds: 326, speakerName: 'Paula de Marte', text: 'Vou pedir que vocês fechem os olhos e respirem três vezes. Na próxima inspiração, traga à mente a pessoa com quem você sente um contrato pendente. Não para agir, apenas para honrar.', language: 'pt-BR' },
  { startSeconds: 332, endSeconds: 388, speakerName: 'Paula de Marte', text: 'Saturno em Casa 7 é sobre assumir responsabilidade emocional. Você não precisa mais agradar, você precisa ser inteiro. O planeta te devolve a autoridade sobre suas escolhas afetivas nos próximos dois anos.', language: 'pt-BR' },
  { startSeconds: 394, endSeconds: 432, speakerName: 'Consulente Diana', text: 'E como fica quem está sozinho? Saturno em Casa 7 promete parceria ou isolamento?', language: 'pt-BR' },
  { startSeconds: 436, endSeconds: 490, speakerName: 'Paula de Marte', text: 'Diana, melhor sozinho do que acompanhado por medo. Saturno separa para depois unir com mais verdade. Se você atravessar o deserto desse trânsito, o que vier depois será parceira ou parceiro de verdade, não de conveniência.', language: 'pt-BR' },
  { startSeconds: 496, endSeconds: 540, speakerName: 'Paula de Marte', text: 'Pra fechar: olha teu mapa, identifica onde está Casa 7, vê o regente e os aspectos de Saturno nesse eixo. Escreve num papel o que você aceita e o que não aceita mais. Esse é o trabalho.', language: 'pt-BR' },
] as readonly TranscriptSegment[]);

const astrologiaRecording: WorkshopRecording = Object.freeze({
  id: wrid('rec-astrologia-saturno-casa7-2026-04-12'),
  workshopId: wid('wk-astrologia-saturno-casa7'),
  audioUrl: '/mock/recordings/astrologia-saturno-casa7.m4a',
  videoUrl: '/mock/recordings/astrologia-saturno-casa7.mp4',
  transcript: astrologiaSegments,
  durationSeconds: 540,
  recordedAt: 1744473600000, // 2026-04-12T21:00:00Z deterministic
  tradition: 'astrologia',
  facilitatorId: uid('user-paula-de-marte'),
  facilitatorName: 'Paula de Marte',
} as WorkshopRecording);

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE 2 — Cigano · Mesa Real e o Cavaleiro
// ════════════════════════════════════════════════════════════════════════════

const ciganoSegments: TranscriptSegment[] = Object.freeze([
  { startSeconds: 0, endSeconds: 32, speakerName: 'Mestre Ramiro', text: 'Boa noite, consulente. Hoje a gente joga a Mesa Real com o Cavaleiro abrindo a tiragem. O Cavaleiro é o mensageiro, é quem traz a notícia.', language: 'pt-BR' },
  { startSeconds: 36, endSeconds: 74, speakerName: 'Mestre Ramiro', text: 'Na casa 1, que é a casa do consulente, saiu o Cigano. Olha o que isso quer dizer: você é uma pessoa que caminha, que não fica parada. Sua natureza é movimento.', language: 'pt-BR' },
  { startSeconds: 78, endSeconds: 116, speakerName: 'Consulente Lucia', text: 'Mestre, e na casa 7, que é sobre parceria?', language: 'pt-BR' },
  { startSeconds: 120, endSeconds: 162, speakerName: 'Mestre Ramiro', text: 'Na casa 7 saiu a Cigana. Isso é interessante. Você atrai mulheres fortes, com presença, mas precisa aprender a dividir o espaço. A Cigana não se submete, ela caminha junto.', language: 'pt-BR' },
  { startSeconds: 168, endSeconds: 216, speakerName: 'Mestre Ramiro', text: 'Repara: na casa 4, que é a casa da família, saiu o Ninho. Tem uma proteção aí. Sua família de origem te segurou num padrão que talvez já não te sirva.', language: 'pt-BR' },
  { startSeconds: 220, endSeconds: 258, speakerName: 'Consulente Lucia', text: 'Como eu diferenciio se o que eu sinto é carinho pelo meu pai ou apego?', language: 'pt-BR' },
  { startSeconds: 262, endSeconds: 310, speakerName: 'Mestre Ramiro', text: 'Filha, quando você sentir saudade e logo depois sentir raiva, é apego. Carinho não puxa, ele pousa. Medita sobre isso essa semana.', language: 'pt-BR' },
  { startSeconds: 316, endSeconds: 362, speakerName: 'Mestre Ramiro', text: 'E olha aqui na casa 9, saiu a Torre. A Torre no Cigano fala de rompimento necessário. Vai ter uma mudança que assusta mas liberta.', language: 'pt-BR' },
  { startSeconds: 368, endSeconds: 412, speakerName: 'Mestre Ramiro', text: 'Pra prática: coloca a mão no coração agora e repete três vezes "eu confio no caminho". Sente o calor. Isso é o teu axé pessoal.', language: 'pt-BR' },
  { startSeconds: 418, endSeconds: 460, speakerName: 'Consulente Lucia', text: 'Mestre, posso jogar o búzios pra confirmar essa mensagem da Torre?', language: 'pt-BR' },
  { startSeconds: 464, endSeconds: 506, speakerName: 'Mestre Ramiro', text: 'Pode sim, mas não pra confirmar — pra aprofundar. Búzio não confirma, ele desdobra. Volta semana que vem com o Merci pra a gente cruzar.', language: 'pt-BR' },
] as readonly TranscriptSegment[]);

const ciganoRecording: WorkshopRecording = Object.freeze({
  id: wrid('rec-cigano-mesa-real-cavaleiro-2026-05-08'),
  workshopId: wid('wk-cigano-mesa-real-cavaleiro'),
  audioUrl: '/mock/recordings/cigano-mesa-real-cavaleiro.m4a',
  videoUrl: null,
  transcript: ciganoSegments,
  durationSeconds: 506,
  recordedAt: 1746720000000, // 2026-05-08T21:00:00Z deterministic
  tradition: 'cigano',
  facilitatorId: uid('user-mestre-ramiro'),
  facilitatorName: 'Mestre Ramiro',
} as WorkshopRecording);

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE 3 — Orixás · Axé de Oxalá
// ════════════════════════════════════════════════════════════════════════════

const orixasSegments: TranscriptSegment[] = Object.freeze([
  { startSeconds: 0, endSeconds: 36, speakerName: 'Babalaô Tunji', text: 'Egum mi, egum mi. Hoje abrimos a semana com o axé de Oxalá. Quem está aqui pede licença, pede bênção, pede paz.', language: 'pt-BR' },
  { startSeconds: 40, endSeconds: 82, speakerName: 'Babalaô Tunji', text: 'Oxalá é o pai da criação. Ele segura o mundo nas mãos. Quando a vida aperta demais, é pra ele que a gente volta.', language: 'pt-BR' },
  { startSeconds: 88, endSeconds: 128, speakerName: 'Consulente Iuri', text: 'Babalaô, eu tô atravessando um momento difícil no trabalho. Como eu peço o axé de Oxalá pra resolver?', language: 'pt-BR' },
  { startSeconds: 132, endSeconds: 182, speakerName: 'Babalaô Tunji', text: 'Filho, Oxalá não resolve, ele sustenta. Antes de pedir resolução, peça sustentação. Coloca uma oferenda de frutas brancas no terreiro, acende uma vela branca, e diz: "Pai Oxalá, me dá paciência".', language: 'pt-BR' },
  { startSeconds: 188, endSeconds: 230, speakerName: 'Babalaô Tunji', text: 'Hoje a gente vai fazer uma prática de respiração iorubá. Senta com a coluna reta. Na inspiração, diz "He". Na expiração, diz "Xalá". Isso é o nome dele partido em duas metades.', language: 'pt-BR' },
  { startSeconds: 236, endSeconds: 282, speakerName: 'Babalaô Tunji', text: 'Continua respirando assim por sete ciclos. Cada ciclo, sinta uma camada de tensão saindo do peito. Oxalá cura com o tempo, não com pressa.', language: 'pt-BR' },
  { startSeconds: 288, endSeconds: 326, speakerName: 'Consulente Maria', text: 'Babalaô, eu sinto que minha fé tá enfraquecida. Isso é desrespeito com o orixá?', language: 'pt-BR' },
  { startSeconds: 330, endSeconds: 376, speakerName: 'Babalaô Tunji', text: 'Filha, dúvida é parte da fé madura. Quem não duvida é fanático, não crente. Oxalá conhece teu coração. Vai no terreiro, senta quieta, deixa o silêncio falar.', language: 'pt-BR' },
  { startSeconds: 382, endSeconds: 428, speakerName: 'Babalaô Tunji', text: 'Vou pedir que vocês fechem os olhos e toquem o topo da cabeça. Esse é o ori, onde Oxalá primeiro sopra a vida. Honra esse lugar sagrado.', language: 'pt-BR' },
  { startSeconds: 434, endSeconds: 478, speakerName: 'Babalaô Tunji', text: 'Pra fechar a gira de hoje: se você atravessar essa semana em paz, devolve uma vela branca no próximo sábado. É assim que o axé se mantém vivo.', language: 'pt-BR' },
] as readonly TranscriptSegment[]);

const orixasRecording: WorkshopRecording = Object.freeze({
  id: wrid('rec-orixas-axe-oxala-2026-05-15'),
  workshopId: wid('wk-orixas-axe-oxala'),
  audioUrl: '/mock/recordings/orixas-axe-oxala.m4a',
  videoUrl: '/mock/recordings/orixas-axe-oxala.mp4',
  transcript: orixasSegments,
  durationSeconds: 478,
  recordedAt: 1747324800000, // 2026-05-15T21:00:00Z deterministic
  tradition: 'orixas',
  facilitatorId: uid('user-babalao-tunji'),
  facilitatorName: 'Babalaô Tunji',
} as WorkshopRecording);

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE 4 — Tantra-Cabala · Respiração da Sefirá Tiferet
// ════════════════════════════════════════════════════════════════════════════

const tantraCabalaSegments: TranscriptSegment[] = Object.freeze([
  { startSeconds: 0, endSeconds: 32, speakerName: 'Swami João', text: 'Bem-vindos à prática da noite. Hoje vamos trabalhar com a sefirá Tiferet, que é o coração da Árvore da Vida.', language: 'pt-BR' },
  { startSeconds: 36, endSeconds: 78, speakerName: 'Swami João', text: 'Tiferet une Hesed (amor incondicional) e Gevurah (justiça). É onde a compaixão encontra a verdade. Sem essa sefirá, a gente vive ora transbordando, ora reprimindo.', language: 'pt-BR' },
  { startSeconds: 82, endSeconds: 124, speakerName: 'Consulente Sofia', text: 'Swami, e como eu identifico quando eu tô fora de Tiferet?', language: 'pt-BR' },
  { startSeconds: 128, endSeconds: 178, speakerName: 'Swami João', text: 'Sofia, observa. Se tu sentes raiva e culpa em sequência, é Binah dominante. Se sentes euforia e dispersão, é Hesed sem Gevurah. Tiferet é o centro parado onde tudo se vê.', language: 'pt-BR' },
  { startSeconds: 184, endSeconds: 224, speakerName: 'Swami João', text: 'Vamos respirar. Inspira pelo coração, segura sete segundos, expira pela coluna. Isso é o pranayama de Tiferet. Pratica por cinco minutos agora.', language: 'pt-BR' },
  { startSeconds: 230, endSeconds: 274, speakerName: 'Swami João', text: 'Repara: quando tu inspira, sente uma luz dourada no centro do peito. Quando expira, essa luz se irradia pelos braços até as palmas das mãos.', language: 'pt-BR' },
  { startSeconds: 280, endSeconds: 322, speakerName: 'Consulente Tomás', text: 'Swami, eu sinto uma emoção antiga voltando durante a respiração. Isso é esperado?', language: 'pt-BR' },
  { startSeconds: 326, endSeconds: 372, speakerName: 'Swami João', text: 'Tomás, é o corpo soltando. Tiferet não julga o que sobe, ela só ilumina. Olha pra emoção como se fosse uma nuvem passando no céu — ela não te define.', language: 'pt-BR' },
  { startSeconds: 378, endSeconds: 422, speakerName: 'Swami João', text: 'Na Cabala, Tiferet corresponde ao Sol. É a sefirá que brilha sem esforço. Para de buscar luz fora, ela já está no teu peito.', language: 'pt-BR' },
  { startSeconds: 428, endSeconds: 470, speakerName: 'Swami João', text: 'Pra fechar, vamos cantar o mantra de Tiferet três vezes. "Tiferet, Tiferet, coração uno". Sente a vibração no peito.', language: 'pt-BR' },
  { startSeconds: 476, endSeconds: 520, speakerName: 'Swami João', text: 'Hoje o teu trabalho é esse: toda vez que sentires divisão entre amor e verdade, volta pro peito. Tiferet é o lar interno.', language: 'pt-BR' },
] as readonly TranscriptSegment[]);

const tantraCabalaRecording: WorkshopRecording = Object.freeze({
  id: wrid('rec-tantra-cabala-tiferet-2026-06-02'),
  workshopId: wid('wk-tantra-cabala-tiferet'),
  audioUrl: '/mock/recordings/tantra-cabala-tiferet.m4a',
  videoUrl: '/mock/recordings/tantra-cabala-tiferet.mp4',
  transcript: tantraCabalaSegments,
  durationSeconds: 520,
  recordedAt: 1748889600000, // 2026-06-02T21:00:00Z deterministic
  tradition: 'tantra-cabala',
  facilitatorId: uid('user-swami-joao'),
  facilitatorName: 'Swami João',
} as WorkshopRecording);

// ════════════════════════════════════════════════════════════════════════════
// FIXTURE 5 — Numerologia · Ano Pessoal 5 e a Mudança
// ════════════════════════════════════════════════════════════════════════════

const numerologiaSegments: TranscriptSegment[] = Object.freeze([
  { startSeconds: 0, endSeconds: 36, speakerName: 'Rabino Meir', text: 'Shalom, consulente. Hoje vamos falar do teu Ano Pessoal 5. Esse é o ano da mudança radical, da quebra que renova.', language: 'pt-BR' },
  { startSeconds: 40, endSeconds: 82, speakerName: 'Rabino Meir', text: 'Para calcular o Ano Pessoal, soma o dia e o mês do teu nascimento com o ano universal 2026. Se der 5, é 5. Se der 14, soma 1+4=5. Mestres 11, 22 e 33 não se reduzem.', language: 'pt-BR' },
  { startSeconds: 88, endSeconds: 130, speakerName: 'Consulente Ester', text: 'Rabino, mas e quando o Ano Pessoal 5 cai em cima de um casamento estável? Eu tenho medo de quebrar tudo.', language: 'pt-BR' },
  { startSeconds: 134, endSeconds: 184, speakerName: 'Rabino Meir', text: 'Ester, o 5 não é um número de destruição, é de transformação. Ele quebra o que é pequeno, não o que é verdadeiro. Se o casamento é verdadeiro, ele sai do 5 mais vivo.', language: 'pt-BR' },
  { startSeconds: 190, endSeconds: 232, speakerName: 'Rabino Meir', text: 'Na Numerologia Cabalística, 5 corresponde à sefirá Hesed. É o ano de receber. Espera surpresas, presentes, oportunidades. Mas também espera decisões.', language: 'pt-BR' },
  { startSeconds: 238, endSeconds: 282, speakerName: 'Rabino Meir', text: 'Pra prática: escreve uma carta pra ti mesma datada de 31 de dezembro de 2026. O que tu queres ter vivido? Onde tu queres estar? Cola essa carta no espelho do banheiro.', language: 'pt-BR' },
  { startSeconds: 288, endSeconds: 332, speakerName: 'Consulente Ester', text: 'E se eu não conseguir cumprir o que escrevi?', language: 'pt-BR' },
  { startSeconds: 336, endSeconds: 380, speakerName: 'Rabino Meir', text: 'Filha, a carta é o mapa, não o carrasco. Releia no fim do ano e observa o que tu já tinha intuído. Cabala honesta é a que escuta antes de exigir.', language: 'pt-BR' },
  { startSeconds: 386, endSeconds: 432, speakerName: 'Rabino Meir', text: 'Para fechar: o Ano Pessoal 5 convida você a confiar no movimento. Tudo que é fixo nessa vida é provisório. A única coisa permanente é a tua essência.', language: 'pt-BR' },
  { startSeconds: 438, endSeconds: 478, speakerName: 'Rabino Meir', text: 'Bendita seja a tua caminhada. Que os arcanjos Miguel e Rafael te acompanhem nesse ano de transformação. Vai em paz, e lembra: a numerologia ilumina, mas quem caminha és tu.', language: 'pt-BR' },
] as readonly TranscriptSegment[]);

const numerologiaRecording: WorkshopRecording = Object.freeze({
  id: wrid('rec-numerologia-ano-pessoal-5-2026-06-10'),
  workshopId: wid('wk-numerologia-ano-pessoal-5'),
  audioUrl: '/mock/recordings/numerologia-ano-pessoal-5.m4a',
  videoUrl: null,
  transcript: numerologiaSegments,
  durationSeconds: 432,
  recordedAt: 1749580800000, // 2026-06-10T21:00:00Z deterministic
  tradition: 'numerologia',
  facilitatorId: uid('user-rabino-meir'),
  facilitatorName: 'Rabino Meir',
} as WorkshopRecording);

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS — accessible by id for the page
// ════════════════════════════════════════════════════════════════════════════

export const ALL_FIXTURES: ReadonlyArray<WorkshopRecording> = Object.freeze([
  astrologiaRecording,
  ciganoRecording,
  orixasRecording,
  tantraCabalaRecording,
  numerologiaRecording,
] as readonly WorkshopRecording[]);

const FIXTURES_BY_ID: ReadonlyMap<string, WorkshopRecording> = new Map(
  ALL_FIXTURES.map((r) => [r.id, r])
);

const FIXTURES_BY_WORKSHOP_ID: ReadonlyMap<string, WorkshopRecording> = new Map(
  ALL_FIXTURES.map((r) => [r.workshopId, r])
);

export function getRecordingById(id: string): WorkshopRecording | null {
  return FIXTURES_BY_ID.get(id) ?? null;
}

export function getRecordingByWorkshopId(workshopId: string): WorkshopRecording | null {
  return FIXTURES_BY_WORKSHOP_ID.get(workshopId) ?? null;
}

export function listRecordingsByTradition(tradition: Tradition): ReadonlyArray<WorkshopRecording> {
  return Object.freeze(
    ALL_FIXTURES.filter((r) => r.tradition === tradition)
  );
}

export const __test_fixture_exports = Object.freeze({
  FIXTURE_COUNT: ALL_FIXTURES.length,
  ASTROLOGIA_ID: astrologiaRecording.id,
  CIGANO_ID: ciganoRecording.id,
  ORIXAS_ID: orixasRecording.id,
  TANTRA_CABALA_ID: tantraCabalaRecording.id,
  NUMEROLOGIA_ID: numerologiaRecording.id,
  ASTROLOGIA_SEGMENT_COUNT: astrologiaSegments.length,
  CIGANO_SEGMENT_COUNT: ciganoSegments.length,
  ORIXAS_SEGMENT_COUNT: orixasSegments.length,
  TANTRA_CABALA_SEGMENT_COUNT: tantraCabalaSegments.length,
  NUMEROLOGIA_SEGMENT_COUNT: numerologiaSegments.length,
});