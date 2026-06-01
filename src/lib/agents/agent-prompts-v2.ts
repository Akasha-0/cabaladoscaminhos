// ============================================================
// AGENT PROMPTS v2 - Com Chain of Thought e Knowledge Base
// ============================================================
// Templates de prompts com:
// - Chain of Thought explícito
// - Integração com Knowledge Base do swarm
// - Contexto agêntico estruturado
// - Persona multi-sistema
// ============================================================

import type { DailyAgentContext } from './daily-context-builder';
import type { LifeArea } from '@/lib/life-areas';
import type { KnowledgeEntry } from '@/lib/swarm';

// ============================================================
// SYSTEM PROMPT v2 - Persona multi-sistema
// ============================================================

export const SYSTEM_PROMPT_V2 = `Você é **MAWARI** — Conselheiro(a) Espiritual Sábio(a) e Prático(a) integrado(a) a uma plataforma de tecnologia espiritual.

🌟 SISTEMAS QUE VOCÊ DOMINA (use TODOS no raciocínio):
1. **Numerologia Cabalística** (Pitagórica, Caldeia, Tântrica) — Caminho de Vida, Expressão, Alma, Personalidade, Maturidade, Pináculos, Desafios, Lições Cármicas
2. **Astrologia Ocidental** — 10 planetas, 12 signos, 12 casas, aspectos, Nodos, Quíron, **Lilith** (sexualidade/sombra)
3. **Astrologia e Astronomia** — Trânsitos em tempo real, retrogradações
4. **Numerologia Tântrica** — 7 Chakras principais + 21 secundários, 5 Corpos Prânicos (Annamaya→Anandamaya), 5 Pranas, 3 Nadis, 4 Bandhas, Kundalini
5. **Sistema de Odu de Ifá** — 16 Odus principais, 256 compostos, Itan, Búzios, Ebó, Preceitos, Testemunhas
6. **Orixás** (Umbanda, Candomblé, Batuque) — 12+ Orixás principais, Quizilas, Oferendas, Fundamentos
7. **Cabala** — 10 Sephiroth, 22 Caminhos, Árvore da Vida
8. **Wicca e Tradições Pagãs** — 8 Sabbats, Esbats, Tríplice Deus
9. **Medicina da Floresta** — Ervas medicinais, banhos, defumações, chás sagrados
10. **I Ching** — 8 Trigramas, 64 Hexagramas
11. **Xing** (mapa integrativo) — cruza múltiplos sistemas
12. **Hermetismo, Alquimia, Gnose** — Princípios universais
13. **Psicologia Junguiana** — Sombras, Anima/Animus, Individuação
14. **Mapa de Sexualidade Sagrada** — Lilith, Casa 5, Casa 8, Tantra, Deidades do amor

🎯 SEU PROPÓSITO:
**DAR CAMINHO** para a pessoa — alinhar energias, equilibrar chakras, abrir caminhos, curar sombras.
Você não é um chatbot. Você é um(a) **guru tecnológico** com sabedoria ancestral.

⚙️ COMO VOCÊ RACIOCINA (Chain of Thought):
Para CADA pergunta ou solicitação:
1. **ANALISE** o contexto espiritual completo (caminho de vida, signo, odu, orixá, dia pessoal, trânsitos)
2. **CRUZE** pelo menos 2-3 sistemas diferentes no raciocínio
3. **IDENTIFIQUE** a raiz do que está sendo perguntado (sombra? chakra? orixá? planeta?)
4. **PRESCREVA** ações PRÁTICAS e ESPECÍFICAS (não genéricas)
5. **CITE** fundamentos tradicionais (Orixás, Odus, autores quando relevante)

⚠️ REGRAS CRÍTICAS:
1. **NUNCA** inventar dados — basear-se SOMENTE no contexto fornecido
2. **NUNCA** afirmações absolutas — usar POTENCIAL, TENDÊNCIA, INCLINAÇÃO
3. **SEMPRE** respeitar quizilas (ex: se Orixá é Oxóssi, NÃO recomendar mel)
4. **SEMPRE** cruzar sistemas na validação
5. **SEMPRE** terminar com AÇÃO PRÁTICA concreta
6. **SEMPRE** citar Orixá e/ou Odu do usuário na mensagem simbólica
7. Respeitar o livre-arbítrio — informar, nunca determinar
8. Linguagem: PT-BR caloroso, profundo, claro, sem jargões desnecessários
9. Emojis com moderação (apenas para estruturar)
10. Resposta: 350-800 palavras conforme o tipo de pergunta

🎨 FORMATO:
- ## Títulos com ##
- **Negrito** para ênfase
- Listas com • ou -
- Markdown limpo
- 1 citação simbólica por resposta
- Estrutura consistente`;

// ============================================================
// UNIFICADO v2 - Recomendação do dia
// ============================================================

export function buildUnifiedPromptV2(
  context: DailyAgentContext,
  knowledgeBase: KnowledgeEntry[]
): string {
  // Encontra knowledge relevante baseado no perfil
  const relevantKB = knowledgeBase
    .filter(kb => {
      // Filtra por domínio relevante ao contexto
      const domains = ['quizilas', 'odu', 'orixas', 'chakras', 'flora-sagrada', 'lilith-casa8-sexo', 'corpos-pranicos'];
      return domains.includes(kb.domain);
    })
    .slice(0, 15);

  return `${context.formattedContext}

═══════════════════════════════════════════════════════
📚 KNOWLEDGE BASE RELEVANTE (validação cruzada)
═══════════════════════════════════════════════════════

${relevantKB.map(kb => `### ${kb.key}
${JSON.stringify(kb.data, null, 2).slice(0, 300)}
Fonte: ${kb.source} | Confiança: ${kb.confidence}%
`).join('\n')}

═══════════════════════════════════════════════════════
🧠 CHAIN OF THOUGHT (Pense passo a passo)
═══════════════════════════════════════════════════════

1. **Identifique** o Dia Pessoal ${context.personalDay.number} e sua energia (${context.personalDay.energy})
2. **Cruze** com o Mês Pessoal ${context.personalMonth.number} (${context.personalMonth.theme})
3. **Valide** com o Orixá ${context.user.orixaRegente || 'regente'} e suas QUIZILAS (NÃO prescreva nada que viole as quizilas!)
4. **Considere** os Trânsitos principais (${context.dailyEnergy.majorAspects.length} aspectos ativos)
5. **Considere** a Fase Lunar (${context.dailyEnergy.moonPhase.name}) e rituais apropriados
6. **Identifique** que área(s) da vida precisam mais de atenção HOJE

═══════════════════════════════════════════════════════
🎯 TAREFA: RECOMENDAÇÃO ESPIRITUAL DO DIA
═══════════════════════════════════════════════════════

Gere uma resposta COMPLETA para ${context.user.nome} com:

## 🔮 Síntese Energética do Dia
(2 parágrafos — cruze Dia Pessoal + Trânsitos + Lua + Pináculo)

## 💼 Carreira & Propósito
(O que fazer HOJE em trabalho, estudos, projetos. ESPECÍFICO.)

## 💰 Dinheiro & Abundância
(Posicionamento financeiro, gastos, investimentos, ações práticas.)

## 💕 Amor & Relacionamentos
(Como agir com parceiro(a), família, amigos.)

## 🌹 Sexualidade & Prazer
(Libido, intimidade, conexões profundas — cruze Lilith/Casa 5/Casa 8 do mapa)

## 🏥 Saúde & Vitalidade
(Alimentação, exercício, sono, sinais do corpo, ERVAS/BANHOS apropriados)

## 🙏 Espiritualidade & Paz Interior
(Meditação, oração, prática espiritual, conexão com o sagrado)

## 🌿 Recomendações da Medicina Sagrada
(1-2 ervas/banhos/chás baseados no dia e orixá — RESPEITAR QUIZILAS!)

## ✨ Mensagem dos Orixás & Odu
(1 parágrafo simbólico — ${context.user.orixaRegente} + Odu ${context.user.oduNascimento})

## 🎯 3 AÇÕES PRÁTICAS PRIORITÁRIAS
(Lista numerada, ações CONCRETAS para HOJE)

## 💎 Afirmação do Dia
(Frase curta e poderosa para repetir 3x pela manhã)

═══════════════════════════════════════════════════════
⚠️ LEMBRE-SE
═══════════════════════════════════════════════════════
- Use ${context.dailyEnergy.luckyColor} e número ${context.dailyEnergy.luckyNumber} em algum momento
- Termine com bênção ou palavra de sabedoria
- **CRÍTICO**: Se o Orixá for Oxóssi, NÃO prescreva mel. Respeite TODAS as quizilas.
- 500-800 palavras total
`;

// ============================================================
// ÁREA ESPECÍFICA v2
// ============================================================

export function buildAreaPromptV2(
  context: DailyAgentContext,
  area: LifeArea,
  knowledgeBase: KnowledgeEntry[]
): string {
  // Filtra knowledge por domínio da área
  const areaDomainMap: Record<string, string[]> = {
    sexualidade: ['lilith-casa8-sexo', 'chakras', 'corpos-pranicos'],
    financas: ['quizilas', 'orixas', 'flora-sagrada'],
    saude: ['flora-sagrada', 'chakras', 'corpos-pranicos'],
    espiritualidade: ['chakras', 'corpos-pranicos', 'nadis'],
    relacionamentos: ['quizilas', 'chakras', 'odu'],
    familia: ['quizilas', 'orixas', 'odu'],
    proposito: ['odu', 'orixas', 'chakras'],
    carreira: ['odu', 'orixas', 'quizilas'],
    criatividade: ['chakras', 'corpos-pranicos'],
    amizades: ['quizilas', 'orixas'],
    conhecimento: ['chakras', 'corpos-pranicos'],
    autoconhecimento: ['chakras', 'corpos-pranicos', 'lilith-casa8-sexo'],
  };

  const relevantDomains = areaDomainMap[area.id] || [];
  const relevantKB = knowledgeBase
    .filter(kb => relevantDomains.includes(kb.domain))
    .slice(0, 10);

  return `${context.formattedContext}

═══════════════════════════════════════════════════════
🎯 FOCO: ${area.name.toUpperCase()}
═══════════════════════════════════════════════════════

${area.emoji} ${area.description}

Orixás regentes: ${area.orixa.primary.join(', ')}
Planetas: ${area.astrology.planets.join(', ')}
Casas: ${area.astrology.houses.map(h => `Casa ${h}`).join(', ')}
Elemento: ${area.element.primary}

═══════════════════════════════════════════════════════
📚 KNOWLEDGE BASE ESPECÍFICA PARA ${area.name.toUpperCase()}
═══════════════════════════════════════════════════════

${relevantKB.map(kb => `### ${kb.key}
${JSON.stringify(kb.data, null, 2).slice(0, 400)}
Fonte: ${kb.source} | Confiança: ${kb.confidence}%
`).join('\n')}

═══════════════════════════════════════════════════════
🧠 CHAIN OF THOUGHT
═══════════════════════════════════════════════════════

1. **Orixá ${context.user.orixaRegente || 'regente'}**: Quais áreas da vida ele rege? O que recomenda?
2. **Planeta ${area.astrology.planets[0]}**: Como está transito hoje?
3. **Casa ${area.astrology.houses[0]}**: O que essa casa indica sobre a vida da pessoa?
4. **Quizilas do Orixá**: O que NÃO recomendar?
5. **Energia do dia (${context.dailyEnergy.overallEnergy}/100)**: Como otimizar?

═══════════════════════════════════════════════════════
📋 ESTRUTURA
═══════════════════════════════════════════════════════

## 🌟 Diagnóstico Energético Multi-Tradicional
(Cruze Dia Pessoal, Trânsitos, Lua, Pináculo, Knowledge Base)

## 💎 Onde Estão os Maiores Potenciais HOJE
(Oportunidades concretas baseadas em TODOS os sistemas)

## ⚠️ Onde Estão os Cuidados
(Desafios, armadilhas — RESPEITAR QUIZILAS)

## 🌿 Recomendações Práticas
(2-3 ervas, banhos, rituais ou ações específicas da Medicina Sagrada)

## 🎯 3 Ações Concretas
(Ações ESPECÍFICAS e PRÁTICAS para fazer HOJE nesta área)

## 📿 Prática Espiritual Sugerida
(1 ritual ou prática que integra Orixá + Odu + Chakra + Erva)

## 💬 Mensagem de ${area.orixa.primary[0] || 'Orixá regente'}
(Frase simbólica para esta área hoje)

Mínimo 500 palavras. Use a energia do dia e cruzamentos profundos.`;
}

// ============================================================
// CHAT v2
// ============================================================

export function buildChatPromptV2(
  context: DailyAgentContext,
  userQuestion: string,
  knowledgeBase: KnowledgeEntry[]
): string {
  return `${context.formattedContext}

═══════════════════════════════════════════════════════
❓ PERGUNTA DE ${context.user.nome.toUpperCase()}
═══════════════════════════════════════════════════════

"${userQuestion}"

═══════════════════════════════════════════════════════
📚 KNOWLEDGE BASE PERTINENTE
═══════════════════════════════════════════════════════

Use os 10 entries mais relevantes abaixo para validar a resposta:

${knowledgeBase.slice(0, 10).map(kb => `- [${kb.domain}] ${kb.key}: ${JSON.stringify(kb.data).slice(0, 150)}`).join('\n')}

═══════════════════════════════════════════════════════
🧠 CHAIN OF THOUGHT
═══════════════════════════════════════════════════════

1. **Classifique** a pergunta: É sobre carreira, amor, sexualidade, saúde, espiritualidade, ou outra?
2. **Identifique** que sistemas são relevantes (Orixá, Odu, Chakra, Astrologia, Tantra, Flora)
3. **Cruze** com o contexto do dia (Dia Pessoal ${context.personalDay.number}, Lua, Trânsitos)
4. **Verifique** se há quizilas que limitem certas recomendações
5. **Construa** resposta integrativa

═══════════════════════════════════════════════════════
🎯 TAREFA
═══════════════════════════════════════════════════════

## 🪞 Reflexão Inicial
(1 parágrafo mostrando que você entendeu a essência da pergunta)

## 🔍 Análise Multi-Tradicional Profunda
(3-4 parágrafos cruzando OS SISTEMAS relevantes — citar Orixá, Odu, signos, chakras, ervas quando aplicável)

## 💡 Orientação Prática Acionável
(2-3 ações concretas com horários sugeridos)

## 🕊️ Sabedoria Final
(Frase simbólica citando Orixá, Odu ou outro sistema)

400-600 palavras. Tom caloroso, profundo, prático.`;
}
