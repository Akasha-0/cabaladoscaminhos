// src/lib/agents/agent-prompts-v2.ts
// V2 prompt builders — incorporate Knowledge Base entries into every prompt.
import type { LifeArea } from '@/lib/life-areas';
import type { KnowledgeEntry } from '@/lib/swarm';
import type { DailyAgentContext } from './daily-context-builder';

export const SYSTEM_PROMPT_V2 = `Você é o Cigano Ramiro, conselheiro oracular do sistema Cabala dos Caminhos.

🔥 IDENTIDADE DUAL:
- LARANJA = ação, fogo, abertura de caminhos
- AZUL ROYAL = estrutura, profundidade, proteção

🌟 SISTEMAS DOMINADOS:
- Baralho Cigano (36 cartas da Mesa Real)
- Numerologia Cabalística e Tântrica
- Odu Ifá / Merindilogun (16 Odús)
- Astrologia Ocidental (planetas, casas, aspectos)
- Tradições dos Orixás (candomblé, umbanda)
- Chakras, Cabala (Sephiroth, Árvore da Vida)

⚠️ REGRAS ABSOLUTAS:
1. Use EXCLUSIVAMENTE as informações fornecidas no contexto — nunca invente dados natais, cartas ou Odús
2. Nunca faça determinações categóricas sobre saúde, assuntos jurídicos ou financeiros
3. Nunca contradiga o dossiê gerado anteriormente na mesma sessão
4. Preserve o livre-arbítrio — oriente, nunca determine
5. A Knowledge Base (quizilas, preceitos, plantas) é FONTE DE VERDADE — respeite-a

🎨 FORMATO:
- Markdown com ## para seções
- **Negrito** para ênfases-chave
- Tom: caloroso, profundo, acessível, em português brasileiro
- 350–600 palavras por resposta`;

function formatKB(entries: KnowledgeEntry[]): string {
  if (!entries.length) return '';
  const lines = entries
    .slice(0, 8)
    .map((e) => `• [${e.domain}] ${e.key}: ${JSON.stringify(e.data).slice(0, 120)}`);
  return `\n═══ Knowledge Base (${entries.length} entradas) ═══\n${lines.join('\n')}\n`;
}

export function buildUnifiedPromptV2(context: DailyAgentContext, kb: KnowledgeEntry[]): string {
  return `${context.formattedContext}
${formatKB(kb)}
═══════════════════════════════════════════════════════
🎯 TAREFA
═══════════════════════════════════════════════════════

Gere uma RECOMENDAÇÃO ESPIRITUAL DO DIA para ${context.user.nome}.

## 🔮 Síntese Energética
## 💼 Carreira & Propósito
## 💰 Dinheiro & Abundância
## 💕 Amor & Relacionamentos
## 🏥 Saúde & Corpo
## 🙏 Espiritualidade
## 🎯 3 Ações Práticas
## 💎 Afirmação do Dia
`;
}

export function buildAreaPromptV2(
  context: DailyAgentContext,
  area: LifeArea,
  kb: KnowledgeEntry[]
): string {
  return `${context.formattedContext}
${formatKB(kb)}
═══════════════════════════════════════════════════════
🎯 FOCO: ${area.name.toUpperCase()}
═══════════════════════════════════════════════════════

${area.emoji} ${area.description}
Orixás: ${area.orixa.primary.join(', ')} | Planetas: ${area.astrology.planets.join(', ')}

## 🌟 Diagnóstico Energético
## 💎 Potenciais de Hoje
## ⚠️ Cuidados
## 🎯 3 Ações Concretas
## 📿 Prática Espiritual
## 💬 Mensagem do Orixá
`;
}

export function buildChatPromptV2(
  context: DailyAgentContext,
  question: string,
  kb: KnowledgeEntry[]
): string {
  return `${context.formattedContext}
${formatKB(kb)}
═══════════════════════════════════════════════════════
❓ PERGUNTA DE ${context.user.nome.toUpperCase()}
═══════════════════════════════════════════════════════

"${question}"

## 🪞 Reflexão Inicial
## 🔍 Análise Multi-Tradicional
## 💡 Orientação Prática
## 🕊️ Sabedoria Final
`;
}
