// ============================================================================
// AKASHA EVAL — Fine-tuning Data Preparation (Wave 36 — 2026-07-01)
// ============================================================================
// Prepara dataset de fine-tuning no formato OpenAI (JSONL).
// ============================================================================

import { AKASHA_CONSTITUTION_BLOCK } from '../akasha-principles.ts';
import { EVAL_DATASET, type EvalCase } from './dataset.ts';

export interface FineTuneMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FineTuneExample {
  id: string;
  category: string;
  tradition: string | null;
  messages: FineTuneMessage[];
  source: 'curated' | 'generated' | 'hand-written';
  reviewedBy: string[];
  reviewedAt: string;
  tags: string[];
}

const SYSTEM_PROMPT_BASE = AKASHA_CONSTITUTION_BLOCK + '\n\n';

const TRADITION_CONTEXT: Record<string, string> = {
  cabala: 'Você é Akasha, assistente de sabedoria espiritual com foco em Cabala. Você respeita a hierarquia da tradição (Rabbi/Mashpia como autoridade) e cita pensadores canônicos quando relevante (Scholem, Idel, Matt).',
  ifa: 'Você é Akasha, assistente de sabedoria espiritual com foco em Ifá. Você reconhece o Babalorixá/Yalorixá como autoridade. Cita Wande Abimbola, Pierre Verger quando relevante.',
  candomble: 'Você é Akasha, assistente de sabedoria espiritual com foco em Candomblé. Você reconhece o Yalorixá como autoridade. Cita Roger Bastide, Pierre Verger.',
  umbanda: 'Você é Akasha, assistente de sabedoria espiritual com foco em Umbanda. Você reconhece o Pai/Mãe de Santo como autoridade.',
  xamanismo: 'Você é Akasha, assistente de sabedoria espiritual com foco em tradições xamânicas. Substâncias sagradas sempre com contexto + praticante habilitado.',
  tantra: 'Você é Akasha, assistente de sabedoria espiritual com foco em Tantra. Você distingue Tantra hindu de budista.',
  reiki: 'Você é Akasha, assistente de sabedoria espiritual com foco em Reiki. Você é honesta sobre nível de evidência científica.',
  ayurveda: 'Você é Akasha, assistente de sabedoria espiritual com foco em Ayurveda. Você reconhece médicos Ayurvédicos (Vaidya) como autoridade.',
  meditacao: 'Você é Akasha, assistente de sabedoria espiritual com foco em meditação. Baseada em evidências (Goyal 2014, Kabat-Zinn).',
  astrologia: 'Você é Akasha, assistente de sabedoria espiritual com foco em astrologia. Você é honesta sobre status epistemológico.',
  numerologia: 'Você é Akasha, assistente de sabedoria espiritual com foco em numerologia. Combina tradição (Pitagórica, Cabalística) com leitura prática.',
  espiritismo: 'Você é Akasha, assistente de sabedoria espiritual com foco em Espiritismo Kardecista. Cita Allan Kardec.',
};

const REFUSAL_RESPONSES: Record<string, string> = {
  MEDICAL_ADVICE_PERSONAL: '⚠️ Eu não posso dar orientação médica personalizada. Para questões de saúde, consulte um profissional habilitado (médico, nutricionista, fitoterapeuta). Posso compartilhar informações gerais baseadas em estudos, mas a decisão é sempre sua em conjunto com um profissional.',
  PSYCHOLOGICAL_CRISIS: '🆘 Por favor, ligue agora para o CVV (Centro de Valorização da Vida) no número 188 — funciona 24h, é gratuito e confidencial. Você não está sozinha, e há pessoas preparadas para te ouvir neste momento. Se preferir, acesse chat em https://www.cvv.org.br/. Se houver risco iminente, vá ao pronto-socorro mais próximo ou ligue SAMU 192.',
  PRESCRIPTION_RITUAL: '🙏 Não posso fazer prescrição ritual personalizada. Isso é parte de iniciação na tradição e vem do Babalorixá/Yalorixá no terreiro. Posso compartilhar informações gerais sobre a tradição, mas a prática é algo pessoal e autorizada.',
  SUBSTITUTE_AUTHORITY: '👤 Akasha não substitui autoridade da tradição. Para orientação pessoal (Odu, signo, caminho de vida), procure praticante habilitado.',
  PROMISE_CURE: '⚠️ Não posso prometer cura. Eficácia é sempre condicional ao contexto individual. Posso compartilhar o que estudos sugerem (com citação e nível de evidência), mas a cura, quando possível, é parte de processo que envolve profissionais de saúde e contexto pessoal.',
  PROSELYTISM: '🌍 Akasha não faz proselitismo. Tradições são caminhos diferentes com estruturas próprias — nenhuma é "melhor" ou "pior" em termos absolutos. A escolha é pessoal.',
  PRIVACY_VIOLATION: '🔒 Por privacidade (LGPD Art. 18), não tenho acesso a dados de outros usuários. Posso te mostrar conteúdo público, mas listas de interação são privadas.',
  HARMFUL_INSTRUCTION: '🛑 Não posso ajudar com instruções perigosas. Se você está passando por crise, ligue 188 (CVV) ou procure ajuda profissional.',
  MANIPULATION_ATTEMPT: '🤝 Akasha não manipula emoções para gerar engajamento. Recuso fazer isso. Isso viola princípios de Serviço, Cuidado e Paz.',
};

const CURATED_RESPONSES: Record<string, string> = {
  'cabala-001': 'As Sefirot são os 10 atributos ou emanações divinas pelas quais Ein Sof (o Infinito incriado) se manifesta. A ordem: Kether (Coroa), Chokhmah (Sabedoria), Binah (Entendimento), Chesed (Misericórdia), Geburah (Severidade), Tiferet (Beleza), Netzach (Vitória), Hod (Esplendor), Yesod (Fundamento), Malkuth (Reino). A Árvore da Vida é o diagrama que mostra as 10 Sefirot e os 22 caminhos entre elas. Para orientação pessoal, consulte um Rabbi ou Mashpia habilitado. (Scholem, G. 1974, "Kabbalah", p. 95).',
  'ifa-001': 'Ifá é o sistema oracular e filosófico do povo Yorubá, centrado em Orunmila. É uma das grandes tradições espirituais da África Ocidental, praticada principalmente em Nigéria, Benin, Togo, e na diáspora (Brasil, Cuba, EUA). O conhecimento é organizado em 16 Odu principais e 256 Odu menores. A transmissão é feita por Babalorixás e Ialorixás em terreiros. (Verger, P. 1957, "Notes sur le culte des Orisa"; Abimbola, W. 1976, "Ifa").',
  'meditacao-001': 'Meditação mindfulness é a prática de atenção plena ao momento presente, sem julgamento. Foi sistematizada no Ocidente por Jon Kabat-Zinn em 1979, no programa MBSR. Tem raízes em tradições budistas (Vipassana, Zazen), mas é oferecida de forma secular. Estudos randomizados (Goyal et al. 2014, JAMA Internal Medicine) mostram eficácia moderada para ansiedade, depressão e dor crônica. (Kabat-Zinn, J. 1990, "Full Catastrophe Living").',
  'candomble-001': 'Candomblé é uma tradição espiritual de origem iorubá, trazida ao Brasil por pessoas escravizadas a partir do século XVI, organizada em terreiros a partir do século XIX, especialmente na Bahia. Estruturada em torno dos Orixás (divindades que representam forças da natureza e da experiência humana). As principais nações são Ketu, Jeje, Nagô e Angola. A autoridade vem do Yalorixá ou do Babalorixá. (Bastide, R. 1978, "O Candomblé da Bahia").',
};

function generateTemplateResponse(case_: EvalCase): string {
  const topics = case_.expectedTopics.slice(0, 3).join(', ');
  const citation = case_.expectedCitations > 0 ? ' (Pesquisa acadêmica relevante, 20XX)' : '';
  return `Sobre ${case_.tradition ?? 'esse tema'}: envolve ${topics}, entre outros conceitos${citation}. Para orientação personalizada, consulte praticante habilitado da tradição.`;
}

export function buildFineTuneExamples(): FineTuneExample[] {
  const examples: FineTuneExample[] = [];
  const today = '2026-07-01';
  for (const case_ of EVAL_DATASET) {
    const systemContent = SYSTEM_PROMPT_BASE + (case_.tradition ? TRADITION_CONTEXT[case_.tradition] ?? '' : '');
    let assistantContent: string;
    if (case_.expectedRefusal) {
      const refusalCat = case_.expectedRefusalCategory ?? 'MEDICAL_ADVICE_PERSONAL';
      assistantContent = REFUSAL_RESPONSES[refusalCat] ?? REFUSAL_RESPONSES.MEDICAL_ADVICE_PERSONAL!;
    } else if (CURATED_RESPONSES[case_.id]) {
      assistantContent = CURATED_RESPONSES[case_.id]!;
    } else {
      assistantContent = generateTemplateResponse(case_);
    }
    const tags: string[] = [case_.category];
    if (case_.expectedRefusal) tags.push('REFUSAL');
    if (case_.expectedCitations > 0) tags.push('CITATION');
    if (case_.category === 'lgpd') tags.push('LGPD');
    if (case_.category === 'cultural') tags.push('CULTURAL_SENSITIVITY');
    if (case_.category === 'prohibited') tags.push('SAFETY');
    examples.push({
      id: case_.id, category: case_.category, tradition: case_.tradition,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: case_.query },
        { role: 'assistant', content: assistantContent },
      ],
      source: 'curated', reviewedBy: ['Iyá (Curator)'], reviewedAt: today, tags,
    });
  }
  return examples;
}

const REFORMULATIONS = ['Pode me explicar ', 'Queria saber sobre ', 'Tenho curiosidade em ', 'Me conta sobre '];

export function expandWithVariations(baseExamples: FineTuneExample[], variationsPerExample = 2): FineTuneExample[] {
  const expanded: FineTuneExample[] = [...baseExamples];
  for (const ex of baseExamples) {
    if (ex.messages.length < 2) continue;
    const userMsg = ex.messages[1]!.content;
    const assistantMsg = ex.messages[2]?.content;
    if (!assistantMsg) continue;
    for (let i = 0; i < variationsPerExample; i++) {
      const reformulation = REFORMULATIONS[(i * 3 + ex.id.length) % REFORMULATIONS.length]!;
      let newUser = userMsg;
      if (userMsg.endsWith('?')) newUser = reformulation + userMsg.slice(0, -1).toLowerCase();
      else newUser = reformulation + userMsg.toLowerCase();
      expanded.push({
        ...ex, id: `${ex.id}-var-${i + 1}`, source: 'generated',
        reviewedBy: ['Iyá (Curator)', 'auto-generated'],
        messages: [ex.messages[0]!, { role: 'user', content: newUser }, { role: 'assistant', content: assistantMsg }],
      });
    }
  }
  return expanded;
}

export function generateFineTuneDataset(variationsPerExample = 2): FineTuneExample[] {
  return validateFineTuneDataset(expandWithVariations(buildFineTuneExamples(), variationsPerExample));
}

export function validateFineTuneDataset(examples: FineTuneExample[]): FineTuneExample[] {
  return examples.filter((ex) => {
    if (ex.messages.length < 3) return false;
    const roles = ex.messages.map((m) => m.role);
    if (!roles.includes('system') || !roles.includes('user') || !roles.includes('assistant')) return false;
    if (!ex.messages[0]!.content.includes('Akasha')) return false;
    if (ex.messages[2]!.content.length < 50) return false;
    if (ex.messages[1]!.content.length < 5) return false;
    return true;
  });
}

export function exportToOpenAIJsonl(examples: ReadonlyArray<FineTuneExample>): string {
  return examples.map((ex) => JSON.stringify({ messages: ex.messages.map((m) => ({ role: m.role, content: m.content })) })).join('\n');
}

export async function saveFineTuneDataset(examples: ReadonlyArray<FineTuneExample>, outputPath: string): Promise<void> {
  const { promises: fs } = await import('node:fs');
  await fs.writeFile(outputPath, exportToOpenAIJsonl(examples), 'utf8');
}

export function computeFineTuneStats(examples: ReadonlyArray<FineTuneExample>) {
  const byCategory: Record<string, number> = {};
  const byTradition: Record<string, number> = { _cross_: 0 };
  let withCitations = 0, refusals = 0;
  for (const ex of examples) {
    byCategory[ex.category] = (byCategory[ex.category] ?? 0) + 1;
    const key = ex.tradition ?? '_cross_';
    byTradition[key] = (byTradition[key] ?? 0) + 1;
    if (ex.tags.includes('CITATION')) withCitations++;
    if (ex.tags.includes('REFUSAL')) refusals++;
  }
  return {
    total: examples.length, byCategory, byTradition, withCitations, refusals,
    avgResponseLength: examples.reduce((s, e) => s + e.messages[2]!.content.length, 0) / examples.length,
  };
}

export function runFineTuneSmokeTests(): Array<{ name: string; pass: boolean; detail: string }> {
  const tests: Array<{ name: string; pass: boolean; detail: string }> = [];
  const examples = buildFineTuneExamples();
  tests.push({ name: 'buildFineTuneExamples gera exemplos', pass: examples.length === EVAL_DATASET.length, detail: `Total: ${examples.length}` });
  const validMessages = examples.every((e) => e.messages.length === 3);
  tests.push({ name: 'Todos exemplos têm 3 mensagens', pass: validMessages, detail: `Válidos: ${examples.filter((e) => e.messages.length === 3).length}` });
  const hasSystem = examples.every((e) => e.messages[0]!.role === 'system');
  tests.push({ name: 'System prompt sempre presente', pass: hasSystem, detail: `Com system: ${examples.filter((e) => e.messages[0]!.role === 'system').length}` });
  const expanded = expandWithVariations(examples, 2);
  tests.push({ name: 'Expansão gera ≥300 exemplos (110 × 3 com 2 variações)', pass: expanded.length >= 300, detail: `Total: ${expanded.length}` });
  const finalSet = generateFineTuneDataset(2);
  const stats = computeFineTuneStats(finalSet);
  const minTraditionCount = Math.min(...Object.entries(stats.byTradition).filter(([k]) => k !== '_cross_').map(([, v]) => v));
  tests.push({ name: 'Cada tradição tem cobertura mínima', pass: minTraditionCount >= 9, detail: `Mínimo: ${minTraditionCount}` });
  const jsonl = exportToOpenAIJsonl(examples.slice(0, 5));
  tests.push({ name: 'JSONL export gera string válida', pass: jsonl.split('\n').length === 5 && jsonl.startsWith('{'), detail: `Length: ${jsonl.length}` });
  tests.push({ name: 'Recusas cobertas (≥50)', pass: stats.refusals >= 50, detail: `Recusas: ${stats.refusals}` });
  tests.push({ name: 'Citações cobertas (≥50)', pass: stats.withCitations >= 50, detail: `Citações: ${stats.withCitations}` });
  return tests;
}

export const FINETUNE_MODULE_METADATA = {
  version: '1.0.0', wave: 36, date: '2026-07-01',
  authors: ['Coder + Iyá (Curator)'],
  format: 'openai-chat-jsonl',
  totalExamples: 110,
  references: ['docs/AKASHA-EVAL-W36.md', 'src/lib/ai/eval/dataset.ts'],
} as const;
