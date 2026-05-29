/**
 * Cross-System Correlation Engine
 * Based on IDEIA.md - Unified Kabbalistic System
 */

// System types enum
export type SystemType = 'chakra' | 'tarot' | 'orixa' | 'odu' | 'numerology' | 'astrology' | 'sephirah' | 'planet';

// Cross-system correlation interface
export interface CrossSystemCorrelation {
  source: SystemType;
  target: SystemType;
  correlation: string;
  strength: 'strong' | 'medium' | 'weak';
  description: string;
}

// Correlation query interface
export interface CorrelationQuery {
  inputSystem: SystemType;
  inputValue: string;
  targetSystems?: SystemType[];
}

// Correlation result interface
export interface CorrelationResult {
  correlations: CrossSystemCorrelation[];
  summary: string;
  recommendations: string[];
}

// Odu to Tarot correlation (from IDEIA.md table on page 150-167)
export const ODU_TAROT_CORRELATIONS: Record<number, string> = {
  1: "O Mago / O Louco",   // Okaran → Kether to Chokmah
  2: "A Sacerdotisa",       // Ejiokô → Chokmah to Binah
  3: "A Imperatriz",        // Etaogundá → Binah to Chesed
  4: "O Imperador",        // Irosun → Chesed to Geburah
  5: "O Hierofante",       // Oxé → Geburah to Tiphereth
  6: "Os Enamorados",      // Obará → Tiphereth to Netzach
  7: "O Carro",            // Odi → Tiphereth to Hod
  8: "A Justiça / A Força", // EjiOníle → Hod to Yesod
  9: "O Eremita",          // Ossá → Yesod to Malkuth
  10: "A Roda da Fortuna",  // Ofun → Malkuth (Return)
  11: "A Justiça",          // Owarin → same axis
  12: "O Enforcado",        // Ejilsebora → reflection
  13: "A Morte",            // Olobón → transformation
  14: "A Temperança",       // Iká → balance
  15: "O Diabo",            // Ogbogbé → shadow work
  16: "A Força / O Pendurado", // Alafia → full alignment (master 11)
};

// Orixá to Chakra mapping (from IDEIA.md table on page 65-77)
export const ORIXA_CHAKRA_MAP: Record<string, { chakra: string; day: string; planet: string; colors: string[] }> = {
  "Oxalá": { chakra: "7º Coronário", day: "Sexta-feira", planet: "Sol / Júpiter", colors: ["Branco", "Marfim", "Opala"] },
  "Iemanjá": { chakra: "6º Frontal", day: "Sábado", planet: "Lua / Netuno", colors: ["Azul Escuro", "Branco", "Transparente"] },
  "Oxum": { chakra: "4º Cardíaco", day: "Sábado", planet: "Vênus", colors: ["Rosa", "Amarelo-ouro", "Azul-celeste"] },
  "Ogum": { chakra: "5º Laríngeo", day: "Terça-feira", planet: "Marte", colors: ["Azul Claro", "Vermelho", "Verde"] },
  "Oxóssi": { chakra: "4º Cardíaco", day: "Quinta-feira", planet: "Júpiter", colors: ["Verde", "Azul-turquesa"] },
  "Xangô": { chakra: "3º Plexo Solar", day: "Quarta-feira / Domingo", planet: "Sol", colors: ["Amarelo", "Marrom", "Vermelho", "Branco"] },
  "Iansã": { chakra: "2º Sacro", day: "Terça-feira / Quarta-feira", planet: "Urano / Plutão", colors: ["Laranja", "Amarelo", "Vermelho", "Coral"] },
  "Omolu": { chakra: "1º Básico", day: "Segunda-feira", planet: "Saturno", colors: ["Preto e Branco", "Vermelho e Preto", "Violeta"] },
  "Nanã": { chakra: "1º Básico", day: "Terça-feira / Sábado", planet: "Saturno / Lua", colors: ["Lilás", "Roxo", "Azul-violeta"] },
  "Oxumaré": { chakra: "2º Sacro", day: "Terça-feira", planet: "Mercúrio / Vênus", colors: ["Arco-íris", "Amarelo", "Verde"] },
  "Exu": { chakra: "1º Básico", day: "Segunda-feira", planet: "Plutão", colors: ["Preto e Vermelho", "Preto"] },
};

// Day Portal Analysis (from IDEIA.md table on page 136-148)
export const DAY_PORTALS = {
  "Segunda-feira": { chakra: ["1º Básico", "6º Frontal"], planet: ["Lua", "Saturno"], orixa: ["Omolu", "Exu"], sephirah: ["Malkuth", "Yesod"], arcano: ["A Sacerdotisa", "O Mundo"], lunarPhase: "Lua Minguante / Nova" },
  "Terça-feira": { chakra: ["2º Sacro"], planet: ["Marte", "Plutão"], orixa: ["Iansã", "Ogum"], sephirah: ["Geburah"], arcano: ["A Torre", "O Carro"], lunarPhase: "Lua Nova / Crescente" },
  "Quarta-feira": { chakra: ["3º Plexo Solar"], planet: ["Mercúrio"], orixa: ["Xangô", "Iansã"], sephirah: ["Hod"], arcano: ["O Mago", "O Eremita"], lunarPhase: "Lua Crescente" },
  "Quinta-feira": { chakra: ["4º Cardíaco"], planet: ["Júpiter"], orixa: ["Oxóssi"], sephirah: ["Chesed"], arcano: ["O Hierofante"], lunarPhase: "Lua Crescente / Cheia" },
  "Sexta-feira": { chakra: ["7º Coronário"], planet: ["Vênus"], orixa: ["Oxalá"], sephirah: ["Kether"], arcano: ["O Imperador", "O Louco"], lunarPhase: "Lua Cheia" },
  "Sábado": { chakra: ["4º Cardíaco", "6º Frontal"], planet: ["Saturno", "Urano"], orixa: ["Oxum", "Iemanjá"], sephirah: ["Binah", "Tiphereth"], arcano: ["A Imperatriz", "A Estrela"], lunarPhase: "Lua Cheia" },
  "Domingo": { chakra: ["3º Plexo Solar"], planet: ["Sol"], orixa: ["Xangô (Solar)"], sephirah: ["Tiphereth"], arcano: ["O Sol"], lunarPhase: "Lua Cheia / Crescente" },
} as const;

// Odú Day Mapping (from IDEIA.md table on page 29-37)
export const ODU_DAY_MAP: Record<string, { odu: string[]; meaning: string }> = {
  "Segunda-feira": { odu: ["Okaran (1)", "Obará (6)"], meaning: "Abertura de caminhos, destino, ancestralidade, transmutação" },
  "Terça-feira": { odu: ["Odi (7)", "Ejilsebora (12)"], meaning: "Força de guerra, movimento rápido, coragem" },
  "Quarta-feira": { odu: ["Obará (6)", "Ejilsebora (12)"], meaning: "Justiça, equilíbrio mental, verdade" },
  "Quinta-feira": { odu: ["Irosun (4)", "Oxé (5)"], meaning: "Fartura, expansão, direcionamento da mente" },
  "Sexta-feira": { odu: ["EjiOníle (8)", "Alafia (16)"], meaning: "Paz absoluta, pureza, sabedoria divina" },
  "Sábado": { odu: ["Oxé (5)", "Ossá (9)"], meaning: "Amor incondicional, intuição, fertilidade" },
  "Domingo": { odu: ["Obará (6)", "EjiOníle (8)"], meaning: "Brilho pessoal, realeza, vitalidade" },
};

/**
 * Get correlations for a given query
 */
export function getCorrelations(query: CorrelationQuery): CorrelationResult {
  const correlations: CrossSystemCorrelation[] = [];

  // Odu correlations
  if (query.inputSystem === 'odu') {
    const oduNum = parseInt(query.inputValue, 10);
    if (!isNaN(oduNum) && oduNum >= 1 && oduNum <= 16) {
      const tarot = ODU_TAROT_CORRELATIONS[oduNum];
      if (tarot) {
        correlations.push({
          source: 'odu',
          target: 'tarot',
          correlation: tarot,
          strength: oduNum <= 10 ? 'strong' : oduNum <= 14 ? 'medium' : 'strong',
          description: `Odú ${oduNum} correlaciona-se com ${tarot} na tradição tarotológica.`,
        });
      }
    }

    // Find day correlations for Odu
    for (const [day, data] of Object.entries(ODU_DAY_MAP)) {
      if (data.odu.some(o => o.includes(query.inputValue))) {
        const portal = DAY_PORTALS[day as keyof typeof DAY_PORTALS];
        if (portal) {
          correlations.push({
            source: 'odu',
            target: 'planet',
            correlation: portal.planet.join(', '),
            strength: 'medium',
            description: `Odú ${query.inputValue} ressoa com ${portal.planet.join(' e ')} em ${day}.`,
          });
        }
      }
    }
  }

  // Orixá correlations
  if (query.inputSystem === 'orixa') {
    const orixaData = ORIXA_CHAKRA_MAP[query.inputValue];
    if (orixaData) {
      correlations.push({
        source: 'orixa',
        target: 'chakra',
        correlation: orixaData.chakra,
        strength: 'strong',
        description: `${query.inputValue} governa o ${orixaData.chakra}.`,
      });
      correlations.push({
        source: 'orixa',
        target: 'planet',
        correlation: orixaData.planet,
        strength: 'strong',
        description: `${query.inputValue} está associado(a) a ${orixaData.planet}.`,
      });
    }
  }

  // Day portal correlations
  const portal = DAY_PORTALS[query.inputValue as keyof typeof DAY_PORTALS];
  if (portal && query.inputSystem === 'astrology') {
    correlations.push({
      source: 'astrology',
      target: 'chakra',
      correlation: portal.chakra.join(', '),
      strength: 'strong',
      description: `${query.inputValue} potencializa os chakras ${portal.chakra.join(' e ')}.`,
    });
  }

  const summary = correlations.length > 0
    ? `Encontradas ${correlations.length} correlação(ões) para ${query.inputValue} no sistema ${query.inputSystem}.`
    : `Nenhuma correlação encontrada para ${query.inputValue}.`;

  const recommendations = correlations.map(c => c.description);

  return { correlations, summary, recommendations };
}

/**
 * Get day portal information
 */
export function getDayPortal(day: string): typeof DAY_PORTALS[keyof typeof DAY_PORTALS] | undefined {
  return DAY_PORTALS[day as keyof typeof DAY_PORTALS];
}

/**
 * Get Odu correlations as cross-system correlations
 */
export function getOduCorrelations(oduNumber: number): CrossSystemCorrelation[] {
  const correlations: CrossSystemCorrelation[] = [];

  if (oduNumber < 1 || oduNumber > 16) {
    return correlations;
  }

  const tarot = ODU_TAROT_CORRELATIONS[oduNumber];
  if (tarot) {
    correlations.push({
      source: 'odu',
      target: 'tarot',
      correlation: tarot,
      strength: oduNumber <= 10 ? 'strong' : 'medium',
      description: `Odú ${oduNumber} → ${tarot}`,
    });
  }

  // Find day mapping for this Odu
  for (const [day, data] of Object.entries(ODU_DAY_MAP)) {
    if (data.odu.some(o => o.includes(`(${oduNumber})`))) {
      const portal = DAY_PORTALS[day as keyof typeof DAY_PORTALS];
      if (portal) {
        correlations.push({
          source: 'odu',
          target: 'chakra',
          correlation: portal.chakra.join(', '),
          strength: 'medium',
          description: `Dia de ${day} → Chakras ${portal.chakra.join(' e ')}`,
        });
        correlations.push({
          source: 'odu',
          target: 'planet',
          correlation: portal.planet.join(', '),
          strength: 'medium',
          description: `Dia de ${day} → Planetas ${portal.planet.join(' e ')}`,
        });
      }
    }
  }

  return correlations;
}