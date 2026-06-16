/**
 * synthesis-engine/derive-daily-transit.ts
 *
 * F-224: Overlay diário por área integrando Astrologia (trânsitos),
 * Ifá (Odu) e Tantra (energia do dia da semana).
 * Split de synthesis-engine.ts.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type {
  DailyTransitOverlay,
  LifeArea,
  TransitAspectOverlay,
} from './synthesis-types';

const AREA_PLANETS: Record<LifeArea, string[]> = {
  vitalidadeEnergia:    ['Sol', 'Marte', 'Venus'],
  conexoesAmor:         ['Venus', 'Lua', 'Júpiter'],
  carreiraProsperidade:  ['Saturno', 'Júpiter', 'Mercúrio'],
  oriCabecaQuizilas:    ['Mercúrio', 'Netuno', 'Lua'],
  missaoDestino:        ['Sol', 'Plutão', 'Netuno'],
  desafiosSombras:      ['Saturno', 'Quíron', 'Plutão'],
};

const PLANET_INTERPRETATIONS: Record<string, { harmonioso: string; desafiador: string; harmonioso_rec: string; desafiador_rec: string }> = {
  sol:       { harmonioso: 'Hoje você brilha naturalmente nesta área. Sua energia está clara e irradiante.', desafiador: 'Tensão entre seu eu interior e como você se expressa.', harmonioso_rec: 'Apresente suas ideias. Lidere.', desafiador_rec: 'Não force a validação externa.' },
  venus:     { harmonioso: 'Energia de atrativo, cooperação e prazer. Relaciones nesta área fluem com graça.', desafiador: 'Tensão em relações ou valores.', harmonioso_rec: 'Convide alguém para um momento compartilhado.', desafiador_rec: 'Evite negociar valores importantes hoje.' },
  marte:     { harmonioso: 'Energia de ação, coragem e iniciativa. Bom dia para avançar.', desafiador: 'Irritação, impaciência ou frustração.', harmonioso_rec: 'Use a energia para agir com propósito.', desafiador_rec: 'Evite conflitos. Faça exercício físico.' },
  saturno:   { harmonioso: 'Estrutura e disciplina trabalham a seu favor.', desafiador: 'Restrições, cobranças ou sentimentos de incapacidade.', harmonioso_rec: 'Faça o trabalho de longo prazo.', desafiador_rec: 'Não se cobre em excesso.' },
  jupiter:   { harmonioso: 'Expansão, sorte e otimismo. Tudo tende a dar certo nesta área.', desafiador: 'Exagero, complacência ou gastos desnecessários.', harmonioso_rec: 'Aproveite para investir, viajar ou estudar.', desafiador_rec: 'Modere-se.' },
  mercurio:  { harmonioso: 'Comunicação clara, negócios fluem, ideias se concretizam.', desafiador: 'Mal-entendidos e falhas de comunicação.', harmonioso_rec: 'Negocie e comunique-se claramente.', desafiador_rec: 'Evite assinar contratos hoje.' },
  lua:       { harmonioso: 'Intuição forte, emoções estáveis.', desafiador: 'Instabilidade emocional e hipersensibilidade.', harmonioso_rec: 'Confie na sua intuição.', desafiador_rec: 'Evite decisões emocionais.' },
  netuno:    { harmonioso: 'Inspiração, criatividade, espiritualidade.', desafiador: 'Ilusões, confusão, autoengano.', harmonioso_rec: 'Dedique-se à espiritualidade ou arte.', desafiador_rec: 'Não assine nada sem ler.' },
  plutão:    { harmonioso: 'Transformação profunda, poder pessoal, renascimento.', desafiador: 'Forças obscuras, ciúmes, manipulação.', harmonioso_rec: 'Use o poder para se transformar.', desafiador_rec: 'Evite situações de poder.' },
};

const ODU_TRANSITO: Record<string, { odu: string; meaning: string; advice: string }> = {
  'Eji':     { odu: 'Eji',    meaning: 'Fortuna. O dia favorece o que é coletivo e generoso.', advice: 'Compartilhe. O que você retém hoje, perde amanhã.' },
  'Ogbe':    { odu: 'Ogbe',   meaning: 'Criação — O primeiro Odu. Favorece iniciativa e liderança.', advice: 'Comece algo novo. O momento é propício para ação.' },
  'Awon':    { odu: 'Awon',   meaning: 'Reflexão — Parceria e espelho.', advice: 'Observe mais do que fala. A verdade está no silêncio.' },
  'Iwon':    { odu: 'Iwon',   meaning: 'Disciplina — Sabedoria difícil.', advice: 'A resposta não vem depressa. Aguarde com quietude.' },
  'Akran':   { odu: 'Akran',  meaning: 'Captura — Magnetismo pessoal em alta.', advice: 'Manifeste o que quer. Use sua voz com autoridade.' },
  'Mejí':    { odu: 'Mejí',   meaning: 'Duplo — Iluminação.', advice: 'Escolha com coerência. A duplicidade prejudica.' },
  'Owonrin': { odu: 'Owonrin', meaning: 'Lamento — O que sai pela boca se cumpre.', advice: 'Fale com intenção. Palavras têm poder hoje.' },
  'Obara':   { odu: 'Obara',  meaning: 'Força — Lei e ordem.', advice: 'Ajuste o que está torto. Organize sua casa e pensamentos.' },
  'Ica':     { odu: 'Ica',    meaning: 'Bênção — Proteção divina.', advice: 'Receba com gratidão. O bem está chegando.' },
};

const TANTRA_DAY_ENERGY: Record<number, { element: string; quality: string; recommendation: string }> = {
  0: { element: 'Fogo',        quality: 'Renovação e purificação',        recommendation: 'Pratique respirações de fogo ou sauna seca.' },
  1: { element: 'Terra',       quality: 'Estabilização e ancoragem',      recommendation: 'Caminhe descalça. Conecte-se com o chão.' },
  2: { element: 'Ar',           quality: 'Comunicação e clareza mental',   recommendation: 'Pratique kapalabhati ou respire ao ar livre.' },
  3: { element: 'Água',         quality: 'Fluxo emocional e intimidade',  recommendation: 'Beba água em abundância. Tome banho de imersão.' },
  4: { element: 'Akasha',       quality: 'Consciência e integração',       recommendation: 'Medite em silêncio. Pratique yoga nidra.' },
  5: { element: 'Fogo+Terra',   quality: 'Poder pessoal e manifestação',   recommendation: 'Faça exercício físico intenso seguido de alongamento.' },
  6: { element: 'Akasha+Água',  quality: 'Transformação e transcendência', recommendation: 'Pratique tantra yoga ou massagem relaxante profunda.' },
};

export function deriveDailyTransitOverlay(
  astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  odu: OduBirth | null,
  area: LifeArea,
  date: Date = new Date()
): DailyTransitOverlay {
  const relevantPlanets = AREA_PLANETS[area] ?? [];

  const astrologiaTransito: TransitAspectOverlay[] = relevantPlanets.map(planet => {
    const natalPlanet = (astro as any)?.planets?.find((p: any) => p.planet === planet);
    const pData = PLANET_INTERPRETATIONS[planet.toLowerCase()] ?? {
      harmonioso: `Energia de ${planet} favorece esta área.`,
      desafiador: `Tensão de ${planet} nesta área.`,
      harmonioso_rec: 'Aproveite a energia positiva.',
      desafiador_rec: 'Modere-se e pratique autocompaixão.',
    };
    return {
      planet,
      aspect: natalPlanet?.sign ?? 'trânsito em curso',
      energy: 'neutro' as const,
      description: pData.harmonioso,
      recommendation: pData.harmonioso_rec,
    };
  });

  const oduName = odu?.oduName ?? String(odu?.oduNumber ?? '');
  const oduTransito = oduName
    ? ODU_TRANSITO[oduName] ?? { odu: oduName, meaning: `${oduName} influencia seu dia.`, advice: 'Respeite energia do seu Odu.' }
    : null;

  const dayOfWeek = date.getDay();
  const tantraDay = TANTRA_DAY_ENERGY[dayOfWeek] ?? TANTRA_DAY_ENERGY[4];

  const positiveTransit = astrologiaTransito.find(t => t.energy === 'harmonioso');
  const todayPhrase = positiveTransit
    ? `Hoje: ${positiveTransit.recommendation}`
    : oduTransito
    ? `Odu ${oduTransito.odu}: ${oduTransito.advice}`
    : `Hoje: ${tantraDay.recommendation}`;

  return {
    astrologiaTransito,
    oduTransito,
    tantraEnergia: {
      element: tantraDay.element,
      quality: tantraDay.quality,
      recommendation: tantraDay.recommendation,
    },
    todayPhrase,
  };
}
