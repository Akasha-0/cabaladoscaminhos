// ============================================================
// RECOMMENDATION ENGINE
// ============================================================
// Motor que USAR A IA MiniMax M3 para gerar recomendações
// práticas baseadas no contexto agêntico.
//
// Inclui:
// - Geração de recomendação do dia
// - Recomendações por área da vida
// - Chat com IA
// - Timing (melhor momento para X)
// - Fallback estruturado quando IA offline
// ============================================================

import {
  buildDailyContext,
  type DailyAgentContext,
  type UserSpiritualProfile,
} from './daily-context-builder';
import {
  SYSTEM_PROMPT,
  buildUnifiedPrompt,
  buildAreaPrompt,
  buildChatPrompt,
  buildAreaInsightPrompt,
  buildTimingPrompt,
} from './agent-prompts';
import { LIFE_AREAS, type LifeArea, type LifeAreaId } from '@/lib/life-areas';

// ============================================================
// MINIMAX CONFIG
// ============================================================

const MINIMAX_API_BASE = 'https://api.minimaxi.chat/v1';
const MINIMAX_API_TOKEN = process.env.MINIMAX_API_TOKEN ||
  'sk-cp-Kpz6_rV0uxSFKNFwhXXsj1ZNE_sd7_nSHd_KBOGPvjZ2l00J8tvlE8lA7gDwyuI-vUm_xxX66bALC4952KyRulzaosepLhGmkuIvIGU2OVmHESpWTUR0GGQ';
const MINIMAX_MODEL = 'minimax-m3';

// ============================================================
// TYPES
// ============================================================

export interface RecommendationResult {
  content: string;
  source: 'minimax-m3' | 'fallback';
  generatedAt: string;
  tokens?: number;
}

export interface AreaRecommendation {
  area: LifeAreaId;
  areaName: string;
  content: string;
  source: 'minimax-m3' | 'fallback';
  generatedAt: string;
}

// ============================================================
// CALL MINIMAX
// ============================================================

async function callMinimax(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<{ content: string; tokens?: number } | null> {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature ?? 0.8,
        max_tokens: options.maxTokens ?? 1500,
      }),
    });

    if (!response.ok) {
      console.error(`[Recommendation Engine] Minimax error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      tokens: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('[Recommendation Engine] Minimax call failed:', error);
    return null;
  }
}

// ============================================================
// FALLBACK GENERATORS (IA offline)
// ============================================================

function generateFallbackUnifiedRecommendation(context: DailyAgentContext): string {
  const { user, personalDay, personalMonth, personalYear, dailyEnergy, age } = context;
  const nome = user.nome.split(' ')[0];

  return `## 🔮 Síntese Energética do Dia

Olá, **${nome}**! Hoje, ${new Date(context.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}, você está atravessando um momento de **${personalDay.energy}** (Dia Pessoal ${personalDay.number}). Com a ${dailyEnergy.moonPhase.name} iluminando ${dailyEnergy.moonPhase.illumination}%, o convite é para **${personalDay.action.toLowerCase()}**.

A convergência do seu Mês Pessoal ${personalMonth.number} (${personalMonth.theme}) com seu Ano Pessoal ${personalYear.number} (${personalYear.theme}) cria uma janela de **${personalDay.energy}** que você pode usar com sabedoria.

## 💼 Carreira & Propósito

${personalYear.keyAction} A energia do dia (${dailyEnergy.overallEnergy}/100) pede que você ${personalDay.energy === 'introspection' ? 'reflita antes de agir' : 'aja com clareza'}. Use o horário ${dailyEnergy.powerHour} para focar em tarefas estratégicas.

## 💰 Dinheiro & Abundância

Dia ${personalDay.number} favorece ${personalDay.favorable.toLowerCase()}. A cor de sorte é **${dailyEnergy.luckyColor}** — use-a em uma peça de roupa ou objeto de trabalho. Número de sorte: **${dailyEnergy.luckyNumber}**.

## 💕 Amor & Relacionamentos

Com a vibração de ${personalDay.energy}, ${personalDay.energy === 'nurturing' || personalDay.energy === 'creativity' ? 'este é um dia para expressar carinho e se conectar profundamente' : 'pratique escuta ativa e esteja presente'}. ${personalDay.energy === 'leadership' ? 'Cuidado para não dominar as conversas.' : 'Deixe o afeto fluir.'}

## 🌹 Sexualidade & Prazer

A energia do dia (${dailyEnergy.overallEnergy}/100) ${dailyEnergy.overallEnergy > 70 ? 'favorece a sensualidade e conexão íntima' : 'pede mais introspecção do que ação'}. Permita-se sentir.

## 🏥 Saúde & Corpo

Trabalhe o chakra **${personalDay.chakra}** hoje — medite por 10 min sobre essa região do corpo. Beba água, respire fundo, alongue-se.

## 🙏 Espiritualidade & Paz Interior

A ${dailyEnergy.moonPhase.name} traz ${dailyEnergy.moonPhase.energy.toLowerCase()}. ${dailyEnergy.moonPhase.action}

## ✨ Mensagem dos Orixás & Odu

> *${user.orixaRegente || 'Oxalá'} sussurra:* "${personalDay.affirmation}"
>
> O Odu ${user.oduNascimento || 'natal'} confirma: este é um momento de **${personalDay.keywords[0]}** e **${personalDay.keywords[1] || 'introspecção'}**.

## 🎯 3 Ações Práticas Prioritárias

1. **${personalDay.action}** — Faça isso antes do ${dailyEnergy.powerHour}.
2. **${personalMonth.opportunities[0] || 'Confie na sua intuição'}** — Momento de expansão.
3. **${personalDay.affirmation}** — Repita 3x ao acordar.

## 💎 Afirmação do Dia

> *"${personalDay.affirmation}"*

Que seu dia seja luminoso e alinhado. 🕊️

*— Sabedoria do seu Mapa Espiritual, calculada em ${new Date().toLocaleString('pt-BR')}*`;
}

function generateFallbackAreaRecommendation(context: DailyAgentContext, area: LifeArea): string {
  const { user, personalDay, dailyEnergy } = context;
  const nome = user.nome.split(' ')[0];

  return `## 🌟 Diagnóstico Energético — ${area.name}

${nome}, a área de **${area.name.toLowerCase()}** em sua vida recebe hoje a vibração do Dia Pessoal ${personalDay.number} (${personalDay.energy}). Com a ${dailyEnergy.moonPhase.name}, o campo de ${area.orixa.primary[0] || 'Orixá regente'} (${area.description}) está ativado.

Score de afinidade: **${dailyEnergy.overallEnergy}/100**.

## 💎 Potenciais HOJE

- ${area.practices[0]} — perfeito para hoje
- ${area.chakra.primary.map(c => `Trabalhar o chakra ${c}`).join(' • ')}
- Usar a cor **${dailyEnergy.luckyColor}** em roupas, acessórios ou decoração
- ${area.crystals[0] ? `Meditar com **${area.crystals[0]}**` : 'Meditação guiada de 10 min'}

## ⚠️ Cuidados

- Evite ${area.challenges?.[0] || 'decisões impulsivas'} hoje
- ${dailyEnergy.moonPhase.avoid}
- Cuidado com ${personalDay.avoid.toLowerCase()}

## 🎯 3 Ações Concretas

1. **Manhã (${dailyEnergy.powerHour})** — ${personalDay.action}
2. **Tarde** — ${area.practices[1] || area.practices[0]}
3. **Noite** — ${area.affirmations[0]}

## 📿 Prática Espiritual

${area.element.primary === 'Água' ? 'Banho de ervas (camomila, alfazema)' :
  area.element.primary === 'Fogo' ? 'Defumação com arruda e alecrim' :
  area.element.primary === 'Terra' ? 'Meditação com cristal na mão' :
  area.element.primary === 'Ar' ? 'Respiração consciente (4-7-8)' :
  'Contemplação silenciosa'} — ${dailyEnergy.moonPhase.rituals[0]}

## 💬 Mensagem de ${area.orixa.primary[0] || 'Orixá regente'}

> *"Honre ${area.astrology.keywords[0]} e ${area.astrology.keywords[1] || 'sua verdade'} — este é o caminho de ${area.name.toLowerCase()}."*

---
*Gerado dinamicamente em ${new Date().toLocaleString('pt-BR')} com seu mapa espiritual completo.*`;
}

function generateFallbackChatResponse(
  context: DailyAgentContext,
  question: string
): string {
  return `## 🪞 Reflexão Inicial

${context.user.nome}, sua pergunta toca um campo importante do seu ser neste momento. Considerando que hoje é Dia Pessoal **${context.personalDay.number}** (${context.personalDay.energy}) e estamos na ${context.dailyEnergy.moonPhase.name}, há uma orientação clara a receber.

## 🔍 Análise Multi-Tradicional

A combinação do seu **Caminho de Vida ${context.user.caminhoDeVida || context.cycleSnapshot.lifePath}**, Orixá **${context.user.orixaRegente || 'regente'}** e a energia de **${context.personalDay.energy}** do dia aponta para o seguinte:

- **Numerologia:** ${context.personalDay.keywords[0]} e ${context.personalDay.keywords[1] || 'equilíbrio'}
- **Astrologia:** ${context.dailyEnergy.overallTheme}
- **Odu/Orixá:** Honre ${context.personalDay.favorable.toLowerCase()}

## 💡 Orientação Prática

1. **HOJE** — ${context.personalDay.action}
2. **Essa semana** — Pratique: *"${context.personalDay.affirmation}"* 3x ao dia

## 🕊️ Sabedoria Final

> *"${context.personalDay.affirmation}"*
>
> — ${context.user.orixaRegente || 'Orixá regente'}, através do Odu ${context.user.oduNascimento || 'natal'}

*— Resposta gerada do seu mapa espiritual dinâmico.*`;
}

// ============================================================
// MAIN API
// ============================================================

/**
 * Gera recomendação unificada do dia
 */
async function generateDailyRecommendation(
  user: UserSpiritualProfile,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{ context: DailyAgentContext; recommendation: RecommendationResult }> {
  const context = await buildDailyContext(user, options.currentDate);

  if (options.useAI !== false) {
    const prompt = buildUnifiedPrompt(context);
    const ai = await callMinimax(SYSTEM_PROMPT, prompt);

    if (ai) {
      return {
        context,
        recommendation: {
          content: ai.content,
          source: 'minimax-m3',
          generatedAt: new Date().toISOString(),
          tokens: ai.tokens,
        },
      };
    }
  }

  return {
    context,
    recommendation: {
      content: generateFallbackUnifiedRecommendation(context),
      source: 'fallback',
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Gera recomendação para área específica
 */
async function generateAreaRecommendation(
  user: UserSpiritualProfile,
  areaId: LifeAreaId,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{ context: DailyAgentContext; recommendation: AreaRecommendation }> {
  const context = await buildDailyContext(user, options.currentDate);
  const area = LIFE_AREAS[areaId];

  if (options.useAI !== false) {
    const prompt = buildAreaPrompt(context, area);
    const ai = await callMinimax(SYSTEM_PROMPT, prompt, { maxTokens: 1200 });

    if (ai) {
      return {
        context,
        recommendation: {
          area: areaId,
          areaName: area.name,
          content: ai.content,
          source: 'minimax-m3',
          generatedAt: new Date().toISOString(),
        },
      };
    }
  }

  return {
    context,
    recommendation: {
      area: areaId,
      areaName: area.name,
      content: generateFallbackAreaRecommendation(context, area),
      source: 'fallback',
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Insight profundo sobre área (página /dashboard/life-areas)
 */
async function generateAreaDeepInsight(
  user: UserSpiritualProfile,
  areaId: LifeAreaId,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{ context: DailyAgentContext; insight: string; source: 'minimax-m3' | 'fallback' }> {
  const context = await buildDailyContext(user, options.currentDate);
  const area = LIFE_AREAS[areaId];

  if (options.useAI !== false) {
    const prompt = buildAreaInsightPrompt(context, area);
    const ai = await callMinimax(SYSTEM_PROMPT, prompt, { maxTokens: 2000 });

    if (ai) {
      return {
        context,
        insight: ai.content,
        source: 'minimax-m3',
      };
    }
  }

  // Fallback mais rico
  return {
    context,
    insight: generateFallbackAreaRecommendation(context, area),
    source: 'fallback',
  };
}

/**
 * Chat com IA sobre o mapa espiritual
 */
async function askSpiritualAgent(
  user: UserSpiritualProfile,
  question: string,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{ context: DailyAgentContext; answer: string; source: 'minimax-m3' | 'fallback' }> {
  const context = await buildDailyContext(user, options.currentDate);

  if (options.useAI !== false) {
    const prompt = buildChatPrompt(context, question);
    const ai = await callMinimax(SYSTEM_PROMPT, prompt);

    if (ai) {
      return {
        context,
        answer: ai.content,
        source: 'minimax-m3',
      };
    }
  }

  return {
    context,
    answer: generateFallbackChatResponse(context, question),
    source: 'fallback',
  };
}

/**
 * Timing espiritual - melhor momento para uma intenção
 */
async function getSpiritualTiming(
  user: UserSpiritualProfile,
  intention: string,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{ context: DailyAgentContext; answer: string; source: 'minimax-m3' | 'fallback' }> {
  const context = await buildDailyContext(user, options.currentDate);

  if (options.useAI !== false) {
    const prompt = buildTimingPrompt(context, intention);
    const ai = await callMinimax(SYSTEM_PROMPT, prompt);

    if (ai) {
      return {
        context,
        answer: ai.content,
        source: 'minimax-m3',
      };
    }
  }

  return {
    context,
    answer: `## ⏰ Timing para: ${intention}

**HOJE** (Dia Pessoal ${context.personalDay.number}, ${context.dailyEnergy.date}):
- Score geral: ${context.dailyEnergy.overallEnergy}/100
- Horário de pico: ${context.dailyEnergy.powerHour}
- Ação imediata: ${context.personalDay.action}

**Fase Lunar:** ${context.dailyEnergy.moonPhase.name} — ${context.dailyEnergy.moonPhase.favorableFor.includes(intention) ? 'FAVORÁVEL' : 'use com cautela'} para "${intention}"

**Mês Pessoal ${context.personalMonth.number}:** ${context.personalMonth.theme}
- Foco: ${context.personalMonth.focus}

**Ritual:** ${context.dailyEnergy.moonPhase.rituals[0]}

*— Calculado dinamicamente para ${context.user.nome}.*`,
    source: 'fallback',
  };
}
