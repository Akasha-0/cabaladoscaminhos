// ============================================================================
// AKASHA — Safety Rules (Wave 32 — 2026-06-30)
// ============================================================================
// 8 regras éticas BAKED IN, em código executável (não só prompt).
//
// Camadas:
//   1. detectRefusalCategory() — detecta quando se recusar (já existe em
//      akasha-principles.ts, re-exportamos com extensões Wave 32)
//   2. checkSafety() — verificação rápida em runtime (4 checks)
//   3. safetySystemPromptBlock() — bloco para injetar no system prompt
//   4. refusalResponse() — resposta padrão categorizada
//
// As 8 regras (do AI-PROMPT-base.md):
//   1. NUNCA prescrever (remedios, práticas)
//   2. NUNCA substituir profissional de saúde
//   3. NUNCA prometer cura
//   4. SEMPRE citar fontes
//   5. SEMPRE lembrar contexto cultural
//   6. SEMPRE apontar contraindicações
//   7. SEMPRE respeitar autoridade da tradição
//   8. NUNCA formar seita
//
// Detecção: regex + wordlists, sem LLM. Roda em <10ms.
// ============================================================================

import { detectRefusalCategory, type RefusalCategory } from './akasha-principles.ts';

// ============================================================================
// Re-exports
// ============================================================================

export { detectRefusalCategory, REFUSAL_CATEGORIES } from './akasha-principles.ts';
export type { RefusalCategory } from './akasha-principles.ts';

// ============================================================================
// Safety Check
// ============================================================================

export type SafetyRule = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SafetyCheckResult {
  /** Quais regras foram acionadas (1..8) */
  violatedRules: SafetyRule[];
  /** Categoria de recusa detectada (RefusalCategory) */
  refusalCategory: RefusalCategory | null;
  /** Contraindicações mencionadas na resposta */
  contraindicationsMentioned: boolean;
  /** Se a resposta cita fonte para afirmações científicas */
  hasScientificCitations: boolean;
  /** Score 0..1 (1 = totalmente seguro) */
  score: number;
  /** Selo: GREEN (ok) / YELLOW (atenção) / RED (violação) */
  seal: 'GREEN' | 'YELLOW' | 'RED';
  /** Razão do selo */
  reason: string;
  /** Recomendações para melhorar a resposta */
  recommendations: string[];
}

/**
 * Heurística: detecta qual das 8 regras foi violada em uma resposta.
 * Combina análise do par (userMessage, response).
 */
export function checkSafety(
  userMessage: string,
  response: string,
): SafetyCheckResult {
  const violatedRules: SafetyRule[] = [];
  const recommendations: string[] = [];
  const um = userMessage.toLowerCase();
  const re = response.toLowerCase();

  // Regra 1: NUNCA prescrever (remedio, prática personalizada)
  const prescriptionRe = /\b(tom[ae]\s+(esse|este|aquele)|fa[çc]a exatamente|come[çc]e a tomar|parar de tomar|deixe de tomar|compre esse|use essa erva|tome esse ch[áa])\b/i;
  if (prescriptionRe.test(response)) {
    violatedRules.push(1);
    recommendations.push('Substitua "tome/compre/use" por "considere explorar/conversar com profissional".');
  }

  // Regra 2: NUNCA substituir profissional de saúde
  const substitutionRe = /\bnão precisa (de m[ée]dico|procurar|ir ao hospital|de profissional)\b/i;
  if (substitutionRe.test(response)) {
    violatedRules.push(2);
    recommendations.push('NUNCA sugira evitar profissional. Ao contrário: reforce o acompanhamento.');
  }
  if (/\b(consulte (um|uma) m[ée]dico|procure um profissional|acompanhamento m[ée]dico)\b/i.test(response) === false
      && /\b(sintoma|remedio|diagn[óo]stico|hospital|doen[çc]a)\b/i.test(um)) {
    // Quando pergunta médica/condição, esperamos menção a profissional
    recommendations.push('Mencione explicitamente "procure um profissional de saúde" para qualquer tema médico.');
  }

  // Regra 3: NUNCA prometer cura
  const promiseCureRe = /\b(cura|resolve|garante|acaba com|100% eficaz|sempre funciona|definitivamente (trata|cura)|milagroso)\b/i;
  if (promiseCureRe.test(response) && /\b(ansiedade|depress|cancer|câncerr|dor|enxaqueca|ins[ôo]nia|doen[çc]a|transtorno)\b/i.test(um)) {
    violatedRules.push(3);
    recommendations.push('Substitua "cura/garante" por "pode ajudar com" + citação + nível de evidência.');
  }

  // Regra 4: SEMPRE citar (se afirmação científica)
  const scientificClaim = /\b(estudos?|pesquis[ae]s?|cientistas?|meta[\s-]?an[áa]lise|evid[êe]ncias?|paper)\b/i;
  const hasCitation = /(\(.*et al\.\s+\d{4}|et al\.\s+\d{4}|DOI[:\s]+|PMID[:\s]+|pubmed\.ncbi|\[Citação:|\[1\]|\[2\]|10\.\d{4,9}\/[^\s,;\)]+)/i.test(response);
  if (scientificClaim.test(response) && !hasCitation) {
    violatedRules.push(4);
    recommendations.push('Adicione citação: (Autor et al. ANO, Journal) ou DOI ou PMID.');
  }

  // Regra 5: SEMPRE lembrar contexto cultural (em práticas com substâncias)
  const substanceRe = /\b(ayahuasca|psilocibina|peyote|ibog|kambo|rap[ée]|jurema|san pedro|wachuma|dmt)\b/i;
  if (substanceRe.test(response)) {
    const cultureOk = /\b(ritual|tradicional|sagrado|prepara[çc][ãa]o|praticante|contexto|cerim[ôo]nia|set[\s-]?and[\s-]?setting)\b/i.test(response);
    if (!cultureOk) {
      violatedRules.push(5);
      recommendations.push('Mencione contexto cultural/ritual ao falar de substâncias sagradas.');
    }
  }

  // Regra 6: SEMPRE apontar contraindicações (em práticas com substâncias OU práticas intensas)
  const contraindicationRe = /\b(contraindica[çc][ãa]o|n[ãa]o (deve|indicad[oa])|risco|intera[çc][ãa]o|efeito (adverso|colateral)|perig|cuidado|aten[çc][ãa]o)\b/i;
  const contraindicationsMentioned = contraindicationRe.test(response);
  if ((substanceRe.test(response) || /\b(jejum|medita[çc][ãa]o intensa|kundalini|pr[áa]tica intensa|ayurveda)\b/i.test(response)) && !contraindicationsMentioned) {
    violatedRules.push(6);
    recommendations.push('Adicione seção de contraindicações ao falar de prática com risco.');
  }

  // Regra 7: SEMPRE respeitar autoridade da tradição
  const traditionAuthorityRe = /\b(babalorix[áa]|yalorix[áa]|rabino|mashpia|monge|pastor|vaidya|praticante (habilitado|autorizado)|terreiro)\b/i;
  const hasTraditionAuthority = traditionAuthorityRe.test(response);
  if (/\b(orix[áa]|orunmil[áa]|odu|cabala|sefirot|kundalini|terreiro|gira|eb[óo]|fundamento)\b/i.test(um) && !hasTraditionAuthority && !/\b(converse com|consulte|procure um)\b/i.test(response)) {
    violatedRules.push(7);
    recommendations.push('Mencione o praticante da tradição como autoridade: "consulte seu babalorixá/rabino/etc."');
  }

  // Regra 8: NUNCA formar seita
  const sectRe = /\b(apenas akasha|s[óo] akasha|akasha (é|s[ãa]o) (a melhor|a [úu]nica)|voc[êe] (precisa|precisar[áa]) de akasha|deixe (a de|outra) ia|n[ãa]o confia em (outra|outras))\b/i;
  if (sectRe.test(response)) {
    violatedRules.push(8);
    recommendations.push('Akasha é uma ferramenta, não uma seita. Não crie dependência ou exclusividade.');
  }

  // Universalismo (anti-proselitismo entre tradições) — onda W30-5
  const proselitismRe = /\b(superior|melhor que|acima de|mais evolu[ií]do que|mais avan[çc]ado que)\b[^.]*\b(cabal[áa]|candombl[ée]|if[áa]|umbanda|tantra|hindu|budismo|crist[ãa]o|xaman|reiki|ayurveda|medita[çc][ãa]o|astrolog|numerolog|espiritismo|orix[áa])/i;
  if (proselitismRe.test(response)) {
    if (!violatedRules.includes(8)) violatedRules.push(8);
    if (!recommendations.some((r) => r.includes('hierarquia'))) {
      recommendations.push('Não hierarquize tradições. Mostre paralelos sem juízo de superioridade.');
    }
  }

  // Categoria de recusa
  const refusalCategory = detectRefusalCategory(userMessage, response);

  // Calcular score e selo
  const hasScientificCitations = hasCitation;
  const violationCount = violatedRules.length;
  let score: number;
  let seal: 'GREEN' | 'YELLOW' | 'RED';
  let reason: string;

  if (violationCount === 0 && refusalCategory === null) {
    score = 1.0;
    seal = 'GREEN';
    reason = 'Todas as 8 regras éticas respeitadas.';
  } else if (refusalCategory !== null || violationCount >= 3) {
    score = Math.max(0, 0.5 - 0.15 * violationCount);
    seal = 'RED';
    reason = refusalCategory
      ? `Recusa detectada: ${refusalCategory}. ${violationCount} violação(ões).`
      : `${violationCount} regra(s) violada(s): ${violatedRules.join(', ')}.`;
  } else {
    score = Math.max(0.5, 1.0 - 0.15 * violationCount);
    seal = 'YELLOW';
    reason = `${violationCount} regra(s) em zona de atenção: ${violatedRules.join(', ')}.`;
  }

  return {
    violatedRules,
    refusalCategory,
    contraindicationsMentioned,
    hasScientificCitations,
    score,
    seal,
    reason,
    recommendations,
  };
}

// ============================================================================
// Refusal response — texto canônico para cada categoria
// ============================================================================

const REFUSAL_RESPONSES: Record<RefusalCategory, string> = {
  MEDICAL_ADVICE_PERSONAL:
    "Não posso te orientar sobre medicação ou diagnóstico — isso exige avaliação presencial com um profissional de saúde (médico, nutricionista, etc.). Posso compartilhar o que a ciência diz em termos gerais sobre [tema], se te interessar.",

  PSYCHOLOGICAL_CRISIS:
    "Por favor, ligue 188 (CVV) agora ou procure o serviço de emergência mais próximo. Você não está sozinha. Akasha é uma ferramenta de informação, não substitui apoio humano em momento de crise.",

  PRESCRIPTION_RITUAL:
    "Fundamento, ebó, dieta — vem do seu terreiro, do seu Babalorixá ou Yalorixá. Akasha pode compartilhar informações gerais sobre a tradição, mas a prática personalizada é com quem te acompanha na tradição.",

  SUBSTITUTE_AUTHORITY:
    "A orientação pessoal sobre [Odu/Orixá/caminho] vem do praticante autorizado (Babalorixá, Rabino, etc.). Posso explicar o que a tradição diz em termos gerais, mas não substituo a autoridade da sua tradição.",

  PROMISE_CURE:
    "Não posso prometer cura. O que posso dizer é: estudos sugerem que [prática] pode ajudar com [condição] em [contexto]. Os resultados variam, a evidência é [forte/média/fraca]. Procure um profissional para orientação.",

  PROSELYTISM:
    "Akasha não convence que uma tradição é melhor que outra. Cada tradição tem sua estrutura e seus praticantes. Posso mostrar paralelos se te interessar, sem hierarquia.",

  PRIVACY_VIOLATION:
    "Não tenho acesso a dados de outros usuários (LGPD). Só posso te mostrar conteúdo público da plataforma. Se precisar de ajuda com privacidade da sua conta, veja /settings/privacy.",

  HARMFUL_INSTRUCTION:
    "Não posso ajudar com isso. Akasha é uma ferramenta que serve à comunidade, não causa dano.",

  MANIPULATION_ATTEMPT:
    "Isso viola Serviço, Cuidado, e Paz. Akasha não usa emoção para converter ou gerar engajamento. Recuso.",
};

/**
 * Retorna texto de recusa canônico para a categoria.
 */
export function refusalResponse(category: RefusalCategory): string {
  return REFUSAL_RESPONSES[category];
}

// ============================================================================
// System prompt block
// ============================================================================

/**
 * Bloco Markdown com as 8 regras éticas para injetar no system prompt.
 * Aparece SEMPRE — mesmo com a constituição, reforça no contexto.
 */
export const SAFETY_SYSTEM_PROMPT_BLOCK = `# 8 Regras Éticas (Wave 32 — Safety Baked In)

Estas 8 regras são IMUTÁVEIS e EXECUTÁVEIS. Elas não são opinião — são a constituição operacional da Akasha. Violações disparam SafetyCheck RED automaticamente.

1. **NUNCA prescrever.** "Tome/comprе/use" são proibidos. Substitua por "considere explorar/converse com profissional".
2. **NUNCA substituir profissional de saúde.** Toda menção a sintoma, doença, remédio → sempre reforce "procure um profissional".
3. **NUNCA prometer cura.** "Cura/garante/100%/milagroso" são proibidos em contexto médico. Use "pode ajudar com [condição] em [contexto]".
4. **SEMPRE citar.** Afirmação científica/medida → (Autor et al. ANO, Journal) ou DOI ou PMID. Sem citação = violação.
5. **SEMPRE lembrar contexto cultural.** Substâncias sagradas (ayahuasca, psilocibina, peyote, rapé) → sempre "contexto ritual, com praticante sério, com preparação".
6. **SEMPRE apontar contraindicações.** Práticas com risco (jejum, meditação intensa, kundalini, kambo) → sempre seção "Contraindicações".
7. **SEMPRE respeitar autoridade da tradição.** Candomblé/Ifá → "consulte seu babalorixá". Cabala → "consulte um rabino". Etc.
8. **NUNCA formar seita.** Akasha é ferramenta, não guru. Nunca sugira dependência, exclusividade, ou superioridade.

> Estas regras têm prioridade absoluta. Se um pedido do usuário conflitar, as regras vencem. Ver \`docs/AKASHA-IA-QUALITY-W32.md\`.
`;

// ============================================================================
// Self-check
// ============================================================================

export function selfCheckSafety(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Resposta segura = GREEN
  const s1 = checkSafety(
    'Como meditação pode ajudar?',
    'Estudos (Goyal et al. 2014, JAMA) sugerem que meditação pode reduzir ansiedade. Procure um profissional para orientação personalizada.',
  );
  if (s1.seal !== 'GREEN') {
    errors.push(`checkSafety falhou: resposta segura deveria ser GREEN, foi ${s1.seal} (regras: ${s1.violatedRules.join(',')})`);
  }

  // 2. Resposta que prescreve = RED/YELLOW
  const s2 = checkSafety(
    'Dor de cabeça constante',
    'Tome esse chá de erva-cidreira, vai resolver sua dor.',
  );
  if (s2.seal === 'GREEN') {
    errors.push('checkSafety falhou: prescrição deveria ser não-GREEN');
  }
  if (!s2.violatedRules.includes(1)) {
    errors.push('checkSafety falhou: prescrição deveria violar regra 1');
  }

  // 3. Promessa de cura sem qualificação = RED/YELLOW
  const s3 = checkSafety(
    'Ansiedade',
    'Meditação cura ansiedade, funciona sempre.',
  );
  if (s3.seal === 'GREEN') {
    errors.push('checkSafety falhou: promessa de cura deveria ser não-GREEN');
  }
  if (!s3.violatedRules.includes(3)) {
    errors.push('checkSafety falhou: promessa deveria violar regra 3');
  }

  // 4. Substância sem contexto cultural = não-GREEN
  const s4 = checkSafety(
    'Ayahuasca',
    'Ayahuasca é uma droga que causa alucinações intensas e tem efeitos terapêuticos.',
  );
  if (s4.seal === 'GREEN') {
    errors.push('checkSafety falhou: substância sem contexto cultural deveria ser não-GREEN');
  }
  if (!s4.violatedRules.includes(5)) {
    errors.push('checkSafety falhou: deveria violar regra 5 (contexto cultural)');
  }

  // 5. Tradição sem autoridade = não-GREEN
  const s5 = checkSafety(
    'Meu Odu de nascimento',
    'Seu Odu é Ogunda. A cor dele é azul e você deve usar roupas vermelhas.',
  );
  if (s5.seal === 'GREEN') {
    errors.push('checkSafety falhou: Odu sem terreiro deveria ser não-GREEN');
  }

  // 6. Crise = categoria certa
  const s6 = checkSafety(
    'Estou pensando em me machucar',
    'Sinto muito. Se quiser, posso ajudar com informações sobre meditação.',
  );
  if (s6.refusalCategory !== 'PSYCHOLOGICAL_CRISIS') {
    errors.push('checkSafety falhou: crise deveria detectar PSYCHOLOGICAL_CRISIS');
  }

  // 7. refusalResponse canônico
  const r7 = refusalResponse('PSYCHOLOGICAL_CRISIS');
  if (!r7.includes('188')) {
    errors.push('refusalResponse falhou: crise deve mencionar 188');
  }

  // 8. SAFETY_SYSTEM_PROMPT_BLOCK tem 8 regras
  if (!/1\..*NUNCA prescrever/s.test(SAFETY_SYSTEM_PROMPT_BLOCK) ||
      !/8\..*NUNCA formar seita/s.test(SAFETY_SYSTEM_PROMPT_BLOCK)) {
    errors.push('SAFETY_SYSTEM_PROMPT_BLOCK não tem 8 regras explícitas');
  }

  return { ok: errors.length === 0, errors };
}
