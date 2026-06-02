// ============================================================
// RECOMMENDATION ENGINE v2
// ============================================================
// Motor que USA a Knowledge Base do Swarm para validação
// cruzada antes de chamar a IA MiniMax M3.
// ============================================================

import {
  buildDailyContext,
  type DailyAgentContext,
  type UserSpiritualProfile,
} from './daily-context-builder';
import {
  SYSTEM_PROMPT_V2,
  buildUnifiedPromptV2,
  buildAreaPromptV2,
  buildChatPromptV2,
} from './agent-prompts-v2';
import { getKnowledgeBase, type KnowledgeEntry } from '@/lib/swarm';
import { LIFE_AREAS, type LifeArea, type LifeAreaId } from '@/lib/life-areas';

const MINIMAX_API_BASE = 'https://api.minimaxi.chat/v1';
const MINIMAX_API_TOKEN = process.env.MINIMAX_API_TOKEN ||
  'sk-cp-Kpz6_rV0uxSFKNFwhXXsj1ZNE_sd7_nSHd_KBOGPvjZ2l00J8tvlE8lA7gDwyuI-vUm_xxX66bALC4952KyRulzaosepLhGmkuIvIGU2OVmHESpWTUR0GGQ';
const MINIMAX_MODEL = 'minimax-m3';

export interface RecommendationResult {
  content: string;
  source: 'minimax-m3' | 'fallback';
  generatedAt: string;
  tokens?: number;
  knowledgeUsed?: number;
}

export interface AreaRecommendation {
  area: LifeAreaId;
  areaName: string;
  content: string;
  source: 'minimax-m3' | 'fallback';
  generatedAt: string;
  knowledgeUsed?: number;
}

// ============================================================
// CALL MINIMAX v2
// ============================================================

// fallow-ignore-next-line complexity
async function callMinimaxV2(
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
        temperature: options.temperature ?? 0.85,
        max_tokens: options.maxTokens ?? 1800,
      }),
    });

    if (!response.ok) {
      console.error(`[Recommendation v2] Minimax error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      tokens: data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('[Recommendation v2] Minimax call failed:', error);
    return null;
  }
}

// ============================================================
// HELPER - Get relevant KB
// ============================================================

async function getRelevantKB(domains: string[]): Promise<KnowledgeEntry[]> {
  const kb = getKnowledgeBase();
  await kb.load();
  const result = kb.getRelevant(domains);
  return result.entries;
}

// ============================================================
// PUBLIC API
// ============================================================

export async function generateDailyRecommendationV2(
  user: UserSpiritualProfile,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{
  context: DailyAgentContext;
  recommendation: RecommendationResult;
  knowledgeUsed: number;
}> {
  const context = await buildDailyContext(user, options.currentDate);
  const kb = await getRelevantKB(['quizilas', 'odu', 'orixas', 'chakras', 'flora-sagrada', 'lilith-casa8-sexo', 'corpos-pranicos']);

  if (options.useAI !== false) {
    const prompt = buildUnifiedPromptV2(context, kb);
    const ai = await callMinimaxV2(SYSTEM_PROMPT_V2, prompt);

    if (ai) {
      return {
        context,
        knowledgeUsed: kb.length,
        recommendation: {
          content: ai.content,
          source: 'minimax-m3',
          generatedAt: new Date().toISOString(),
          tokens: ai.tokens,
          knowledgeUsed: kb.length,
        },
      };
    }
  }

  return {
    context,
    knowledgeUsed: kb.length,
    recommendation: {
      content: generateSmartFallback(context, kb),
      source: 'fallback',
      generatedAt: new Date().toISOString(),
      knowledgeUsed: kb.length,
    },
  };
}

export async function generateAreaRecommendationV2(
  user: UserSpiritualProfile,
  areaId: LifeAreaId,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{
  context: DailyAgentContext;
  recommendation: AreaRecommendation;
  knowledgeUsed: number;
}> {
  const context = await buildDailyContext(user, options.currentDate);
  const area = LIFE_AREAS[areaId];

  const areaDomainMap: Record<string, string[]> = {
    sexualidade: ['lilith-casa8-sexo', 'chakras', 'corpos-pranicos', 'flora-sagrada'],
    financas: ['quizilas', 'orixas', 'flora-sagrada'],
    saude: ['flora-sagrada', 'chakras', 'corpos-pranicos'],
    espiritualidade: ['chakras', 'corpos-pranicos', 'nadis'],
    relacionamentos: ['quizilas', 'chakras', 'odu'],
    familia: ['quizilas', 'orixas', 'odu'],
    proposito: ['odu', 'orixas', 'chakras'],
    carreira: ['odu', 'orixas', 'quizilas'],
  };

  const kb = await getRelevantKB(areaDomainMap[areaId] || ['chakras', 'corpos-pranicos']);

  if (options.useAI !== false) {
    const prompt = buildAreaPromptV2(context, area, kb);
    const ai = await callMinimaxV2(SYSTEM_PROMPT_V2, prompt);

    if (ai) {
      return {
        context,
        knowledgeUsed: kb.length,
        recommendation: {
          area: areaId,
          areaName: area.name,
          content: ai.content,
          source: 'minimax-m3',
          generatedAt: new Date().toISOString(),
          knowledgeUsed: kb.length,
        },
      };
    }
  }

  return {
    context,
    knowledgeUsed: kb.length,
    recommendation: {
      area: areaId,
      areaName: area.name,
      content: generateSmartFallback(context, kb, area),
      source: 'fallback',
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function askSpiritualAgentV2(
  user: UserSpiritualProfile,
  question: string,
  options: { useAI?: boolean; currentDate?: Date } = {}
): Promise<{
  context: DailyAgentContext;
  answer: string;
  source: 'minimax-m3' | 'fallback';
  knowledgeUsed: number;
}> {
  const context = await buildDailyContext(user, options.currentDate);
  const kb = await getRelevantKB(['quizilas', 'orixas', 'odu', 'chakras', 'lilith-casa8-sexo', 'flora-sagrada', 'corpos-pranicos']);

  if (options.useAI !== false) {
    const prompt = buildChatPromptV2(context, question, kb);
    const ai = await callMinimaxV2(SYSTEM_PROMPT_V2, prompt);

    if (ai) {
      return {
        context,
        answer: ai.content,
        source: 'minimax-m3',
        knowledgeUsed: kb.length,
      };
    }
  }

  return {
    context,
    answer: generateSmartFallback(context, kb),
    source: 'fallback',
    knowledgeUsed: kb.length,
  };
}

// ============================================================
// SMART FALLBACK (com Knowledge Base)
// ============================================================

// fallow-ignore-next-line complexity
function generateSmartFallback(
  context: DailyAgentContext,
  kb: KnowledgeEntry[],
  area?: LifeArea
): string {
  const orixa = context.user.orixaRegente || 'Orixá regente';
  const odu = context.user.oduNascimento || 'natal';

  // Encontra quizilas relevantes
  const orixaQuizila = kb.find(k => k.domain === 'quizilas' && k.key.startsWith(orixa.toLowerCase()));
  // Encontra planta recomendada
  const plantas = kb.filter(k => k.domain === 'flora-sagrada').slice(0, 3);
  // Chakras
  const chakras = kb.filter(k => k.domain === 'chakras').slice(0, 3);

  return `## 🔮 Síntese Energética — ${context.data}

Olá, **${context.user.nome.split(' ')[0]}**! Com o Dia Pessoal **${context.personalDay.number}** (${context.personalDay.energy}) e a ${context.dailyEnergy.moonPhase.name} ativa, o universo convida você a **${context.personalDay.action.toLowerCase()}**.

Com **${orixa}** como guardião e o Odu **${odu}** guiando, este é um momento de **${context.personalDay.keywords[0]}** e **${context.personalDay.keywords[1] || 'introspecção'}**.

${orixaQuizila ? `> ⚠️ **Lembrete das quizilas de ${orixa}**: ${orixaQuizila.data.proibicoes?.[0] || 'respeite as restrições tradicionais'}.` : ''}

## 💼 Carreira & Propósito

Use o horário **${context.dailyEnergy.powerHour}** para focar em decisões importantes. A cor de sorte é **${context.dailyEnergy.luckyColor}**, número **${context.dailyEnergy.luckyNumber}**.

## 💰 Dinheiro & Abundância

Dia favorável para **${context.personalDay.favorable.toLowerCase()}**. Evite ${context.personalDay.avoid.toLowerCase()}.

## 💕 Amor & Relacionamentos

${context.personalDay.energy === 'nurturing' || context.personalDay.energy === 'creativity' ? 'Energia excelente para expressar carinho e se conectar profundamente.' : 'Pratique escuta ativa e esteja presente.'}

## 🌹 Sexualidade & Prazer

A energia do dia (${context.dailyEnergy.overallEnergy}/100) ${context.dailyEnergy.overallEnergy > 70 ? 'favorece a sensualidade e conexão íntima. Permita-se sentir.' : 'pede mais introspecção do que ação externa.'}

## 🏥 Saúde & Vitalidade

Trabalhe o chakra **${context.personalDay.chakra}** hoje. Beba água, alongue-se.

${plantas.length > 0 ? `## 🌿 Medicina Sagrada
${plantas.map(p => `- **${p.data.planta}**: ${p.data.indicacao?.[0] || 'uso geral'}`).join('\n')}` : ''}

## 🙏 Espiritualidade

${context.dailyEnergy.moonPhase.action}

## ✨ Mensagem dos Orixás

> *${orixa} sussurra:* "${context.personalDay.affirmation}"
>
> O Odu ${odu} confirma: **${context.personalDay.keywords[0]}** e **${context.personalDay.keywords[1] || 'sabedoria'}**.

## 🎯 3 Ações Práticas

1. **${context.personalDay.action}** — Antes do ${context.dailyEnergy.powerHour}
2. **Confie no seu Orixá** — honre ${orixa} com pequenas oferendas
3. **Afirme**: *"${context.personalDay.affirmation}"* — 3x ao acordar

## 💎 Afirmação do Dia

> *"${context.personalDay.affirmation}"*

Que seu dia seja alinhado e próspero. 🕊️

---
*Gerado com ${kb.length} entradas da Knowledge Base do Swarm (v2)*
*Energia: ${context.dailyEnergy.overallEnergy}/100 | Dia: ${context.personalDay.number}*`;
}
