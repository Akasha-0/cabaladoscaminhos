// ============================================================
// LIFE AREAS AI INSIGHTS
// ============================================================
// Gera insights profundos com IA MiniMax para cada área da vida
// ============================================================

import { LifeArea, LifeAreaId, LIFE_AREAS } from './life-areas-engine';
import { AreaCorrelation, LifeMapResult, UserProfile } from './life-areas-correlator';

const MINIMAX_API_BASE = 'https://api.minimaxi.chat/v1';
const MINIMAX_API_TOKEN = process.env.MINIMAX_API_TOKEN || 'sk-cp-Kpz6_rV0uxSFKNFwhXXsj1ZNE_sd7_nSHd_KBOGPvjZ2l00J8tvlE8lA7gDwyuI-vUm_xxX66bALC4952KyRulzaosepLhGmkuIvIGU2OVmHESpWTUR0GGQ';
const MINIMAX_MODEL = 'minimax-m3';

// ============================================================
// TYPES
// ============================================================

export interface AIInsight {
  area: LifeAreaId;
  areaName: string;
  content: string;
  generatedAt: string;
  source: 'minimax-m3' | 'fallback';
}

// ============================================================
// PROMPT BUILDER
// ============================================================

// fallow-ignore-next-line complexity
function buildInsightPrompt(
  user: UserProfile,
  area: LifeArea,
  correlation: AreaCorrelation
): string {
  const matchesText = correlation.matches
    .map(m => `- ${m.category}: ${m.value} (ressonância ${m.resonance}%) — ${m.interpretation}`)
    .join('\n');

  return `Você é um(a) conselheiro(a) espiritual com profundo conhecimento em:
- Numerologia Cabalística e Tântrica
- Astrologia (incluindo Lilith, nodos lunares, casas e aspectos)
- Odu de Ifá (16 odus principais e suas variantes)
- Orixás e tradições afro-brasileiras
- Chakras e sistema tântrico
- Elementos da natureza
- Cura e transformação interior

Analise o perfil espiritual abaixo e gere um insight PROFUNDO e ACIONÁVEL sobre a área de **${area.name}**.

═══════════════════════════════════
PERFIL ESPIRITUAL
═══════════════════════════════════

Nome: ${user.nome}
Data de Nascimento: ${user.dataNascimento}
Signo Solar: ${user.signoSolar}${user.ascendente ? `\nAscendente: ${user.ascendente}` : ''}${user.lua ? `\nLua: ${user.lua}` : ''}${user.planetaDominante ? `\nPlaneta Dominante: ${user.planetaDominante}` : ''}
Caminho de Vida: ${user.caminhoDeVida}
Número de Destino: ${user.numeroDestino}
Ano Pessoal Atual: ${user.anoPessoal}
Odu de Nascimento: ${user.oduNascimento}
Orixá Regente: ${user.orixaRegente}${user.chakraDominante ? `\nChakra Dominante: ${user.chakraDominante}` : ''}${user.elementoDominante ? `\nElemento Dominante: ${user.elementoDominante}` : ''}

═══════════════════════════════════
ÁREA ANALISADA: ${area.name.toUpperCase()}
═══════════════════════════════════

Score de Afinidade: ${correlation.score}% (${correlation.intensidade})

Correspondências encontradas:
${matchesText || 'Nenhuma correspondência direta'}

Dons: ${correlation.gifts.join(', ')}
Desafios: ${correlation.challenges.join(', ')}

Palavras-chave da área: ${area.description}
Elemento: ${area.element.primary}
Planetas regentes: ${area.astrology.planets.join(', ')}
Casas astrológicas: ${area.astrology.houses.join(', ')}
Orixás regentes: ${area.orixa.primary.join(', ')}

═══════════════════════════════════
TAREFA
═══════════════════════════════════

Gere um insight profundo em PORTUGUÊS, com no mínimo 350 palavras, contemplando:

1. **Visão Integrada** (2-3 parágrafos): Como os diferentes sistemas convergem para esta área na vida de ${user.nome}.

2. **O Que a Vida Está Pedindo** (1-2 parágrafos): Os aprendizados e curas específicas que esta área traz nesta fase.

3. **Ação Prática** (1-2 parágrafos): 2-3 ações concretas e rituais que a pessoa pode fazer HOJE/MES para alinhar essa área.

4. **Mensagem dos Orixás/Odu** (1 parágrafo): Uma mensagem simbólica vinda de ${user.orixaRegente} e do Odu ${user.oduNascimento} para esta área.

Tom: caloroso, místico, profundo, com linguagem acessível. Use emojis com moderação. Formate com subtítulos em markdown. Evite clichês vazios. Seja específico ao perfil.`;
}

// ============================================================
// CALL MINIMAX
// ============================================================

async function callMinimax(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${MINIMAX_API_BASE}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MINIMAX_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Você é um(a) sábio(a) conselheiro(a) espiritual especialista em sistemas místicos multi-tradicionais. Suas palavras unem profundidade, calor humano e clareza prática. Você fala português do Brasil com autoridade espiritual mas sem jargões desnecessários. Suas análises são altamente personalizadas e específicas para o perfil apresentado.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      console.error(`[LifeAreas AI] Minimax error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('[LifeAreas AI] Minimax call failed:', error);
    return null;
  }
}

// ============================================================
// FALLBACK INSIGHT (sem IA)
// ============================================================

function buildFallbackInsight(
  user: UserProfile,
  area: LifeArea,
  correlation: AreaCorrelation
): string {
  const topMatch = correlation.matches[0];

  return `## ${area.emoji} Sua Jornada em ${area.name}

Olá, **${user.nome}**. Esta é uma área significativa no seu mapa espiritual.

### Visão Integrada

Com seu **Caminho de Vida ${user.caminhoDeVida}**, a energia de **${user.orixaRegente}** como seu Orixá regente, e o Odu **${user.oduNascimento}** trazendo suas lições fundamentais, a área de ${area.name.toLowerCase()} ressoa com intensidade de **${correlation.score}%** na sua vida.

${topMatch ? `A correspondência mais forte vem de **${topMatch.category}**: ${topMatch.interpretation}` : 'Sua jornada nesta área é de construção paciente e fiel.'}

O elemento **${area.element.primary}** rege esta área, trazendo a energia de **${area.element.favorable.join(' e ')}** para nutrir sua evolução.

### O Que a Vida Está Pedindo

Esta fase pede que você honre os princípios de **${area.orixa.primary[0]}** — o(a) Orixá que guarda este campo da sua existência. ${area.questions[0]}

A cura necessária aqui passa por integrar as energias de **${area.chakra.primary.join(' e ')}**, com o mantra **${area.chakra.mantra}** como ferramenta de reconexão.

### Ação Prática

1. **${area.practices[0]}** — pratique por 7 dias seguidos
2. Use o cristal **${area.crystals[0]}** como aliado nesta jornada
3. Repita a afirmação: *"${area.affirmations[0]}"*

### Mensagem dos Orixás

> *${user.orixaRegente} sussurra:* "${area.description}"
>
> Honre este campo com presença. O Odu ${user.oduNascimento} confirma: este é um caminho de **${area.astrology.keywords[0]}** e **${area.astrology.keywords[1]}**.

Que sua jornada seja leve e profunda. 🙏`;
}

// ============================================================
// MAIN: Generate insight for a single area
// ============================================================

async function generateAreaInsight(
  user: UserProfile,
  areaId: LifeAreaId,
  correlation: AreaCorrelation,
  options: { useAI?: boolean } = {}
): Promise<AIInsight> {
  const area = LIFE_AREAS[areaId];
  const useAI = options.useAI !== false;

  if (useAI) {
    const prompt = buildInsightPrompt(user, area, correlation);
    const aiContent = await callMinimax(prompt);

    if (aiContent) {
      return {
        area: areaId,
        areaName: area.name,
        content: aiContent,
        generatedAt: new Date().toISOString(),
        source: 'minimax-m3',
      };
    }
  }

  // Fallback to local generation
  return {
    area: areaId,
    areaName: area.name,
    content: buildFallbackInsight(user, area, correlation),
    generatedAt: new Date().toISOString(),
    source: 'fallback',
  };
}

// ============================================================
// MAIN: Generate insights for top areas
// ============================================================

async function generateTopAreasInsights(
  result: LifeMapResult,
  options: { useAI?: boolean; maxAreas?: number } = {}
): Promise<AIInsight[]> {
  const max = options.maxAreas || 3;
  const top = result.correlations.slice(0, max);

  const insights: AIInsight[] = [];

  for (const corr of top) {
    const insight = await generateAreaInsight(result.user, corr.area.id, corr, options);
    insights.push(insight);

    // Add small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  return insights;
}

// ============================================================
// MAIN: Generate insight for ONE specific area (used by detail page)
// ============================================================

export async function generateDetailedAreaInsight(
  user: UserProfile,
  areaId: LifeAreaId,
  correlation: AreaCorrelation
): Promise<AIInsight> {
  return generateAreaInsight(user, areaId, correlation, { useAI: true });
}
