# R-022b — Ethics Charter v1 (Akasha)

> **Artefato de Fase 1 (Synthesis) — paralelo a R-022 (Algorithm) e
> R-023 (Mentor Persona).** Consolida os princípios éticos não
> negociáveis do Sistema Akasha em **um único documento operacional**
> com **8 Pilares de Ética**, **12 Regras do Mentor** (E1-E12), **8
> Anti-visões rejeitadas**, **5% causa earmark por Pilar** e
> **protocolo de auditoria externa anual**.
>
> **Data:** 2026-06-11
> **Pesquisador:** agente autônomo (sessão N+1)
> **Dependências:** VISION.md §3, §5, §9 ✅; R-022 synthesis_v1.md
> §5.5-5.6 (limites éticos) ✅; R-023 persona_v1.md §4 (12 regras
> E1-E12) ✅; R-021 gaps.md (8 anti-gaps) ✅
> **Próxima iteração:** v2 com feedback de 5 curadores convidados
> (1 por Pilar) — meta D-022b
> **Confidence:** HIGH — 8 axiomas da VISION já validados pelo agente

---

## 0. TL;DR — O Compromisso Ético do Akasha

Akasha é uma **tecnologia espiritual**. Toda tecnologia tem **poder**;
todo poder precisa de **limite**. O Akasha é desenhado para que:

1. **Nunca minta sobre o que é.** É tecnologia interpretativa, não
   revelação divina. Não prevê futuro. Não diagnostica. Não substitui
   prática religiosa, terapia, ou terreiro.
2. **Sempre cite a fonte.** Toda afirmação do Mentor cita o Grimório
   (curado por humanos). Plágio cultural = veto ético absoluto.
3. **Sempre respeite a tradição viva.** Cada Pilar tem parceria com
   tradição viva (Cabala viva, Ifá vivo, Ayurveda vivo BAMS,
   Astrologia viva FAA, I Ching vivo) e 5% da receita earmark por
   Pilar.
4. **Sempre proteja o vulnerável.** Crise emocional → pula LLM →
   CVV 188. Sem feed social. Sem comparação. Sem gamificação. Sem
   "previsão de futuro fatalista".
5. **Sempre seja híbrido.** LLM redige (linguagem). Grimório curado
   por humanos decide (conteúdo). Humano curado tem autoridade final
   sobre LLM.

**Akasha não busca viralidade. Busca profundidade.** O produto mora
na experiência; o produto mora na ética.

---

## 1. Os 8 Pilares de Ética (consolidação canônica)

Cada Pilar ético tem **princípio** + **mecanismo operacional** +
**auditoria**.

### Pilar Ético 1 — Citação Obrigatória

**Princípio:** Toda afirmação do Mentor cita a fonte do Grimório
(curado por humanos). Toda citação é rastreável.

**Mecanismo operacional:**
- Toda resposta do Mentor carrega **≥ 1 footnote do Grimório**.
- RAG (Retrieval-Augmented Generation) **mandatório** no Mentor
  (não "GPT livre"). Toda fala é redigida A PARTIR de chunks
  selecionados do Grimório.
- Se o LLM não tem chunk relevante, **admite**: "Não tenho base no
  Grimório para esta afirmação. Posso dizer o que a tradição X
  registra, mas recomendo consultar [fonte primária]."
- Citações: formato `[Fonte: tradição, obra, autor, ano, página]`.

**Auditoria:** Log de toda resposta do Mentor com chunks usados.
Auditoria externa anual (white paper, §10).

**Origem:** VISION.md §3 axioma 4; persona_v1.md §3 RAG mandatório.

### Pilar Ético 2 — Tradição Viva, Não Histórica

**Princípio:** Cada um dos 5 Pilares Akasha tem **parceria ativa**
com pelo menos 1 organização de tradição viva. Citação histórica
sozinha (ex: "I Ching 3000 anos") é apropriativa; parceria viva
(ex: "em conversa com [mestre X], tradição Y") é respeitosa.

**Mecanismo operacional:**
- 5 parcerias formalizadas (1 por Pilar). Meta Ano 5: 10 (2/Pilar).
- 5% da receita líquida earmark por Pilar (ver §4).
- Todo conteúdo do Grimório marcado como: **tradição-viva** (com
  curador nomeado) vs **tradição-histórica** (apenas referência).
- Toda referência a pessoa ou mestre vivo = consentimento explícito
  + nomeação honrosa (não anonimato sem motivo).

**Auditoria:** Relatório anual de parcerias + curadores + 5%
causa (white paper).

**Origem:** VISION.md §3 axioma 5; gaps.md #5 (Tradições Matriz
Africana/Indígena); tzolkin-position.md (Dreamspell aviso).

### Pilar Ético 3 — LGPD/Ética by Design

**Princípio:** Akasha é **LGPD-compliant nativamente** (lei
brasileira 13.709/2018) e vai além — protege o vulnerável por
design, não por reação.

**Mecanismo operacional:**
- **Detecção de crise:** regex no input do usuário (Pilar 1 do
  R-030 já implementado) → pula LLM → encaminha CVV 188 + recursos.
- **Cap de uso:** 1 Mandato/dia free, 3 Mandatos/semana premium,
  ilimitado B2B certificado. Evita **vício espiritual** (R-022
  §5.6).
- **Sem feed social:** zero feed, zero comentários públicos sobre
  usuários, zero comparação entre perfis. Cada usuário só vê o
  PRÓPRIO Mandato.
- **Sem gamificação:** zero streak, zero badges, zero "você está
  atrasado". Descanso é parte da prática. Voltar após pausa =
  acolhimento, não cobrança.
- **Sem previsão de futuro fatalista:** Akasha NUNCA afirma "você
  vai..." como certo. Linguagem: "a tradição X registra que...",
  "o Pilar Y convida para...", "observe o que emerge...".

**Auditoria:** Log de crises (anonimizado) + métricas de cap + DPO
revisão mensal.

**Origem:** VISION.md §3 axioma 6; persona_v1.md §4 E1-E5.

### Pilar Ético 4 — Híbrido IA + Humano Curado

**Princípio:** LLM é **redator** (linguagem); **Grimório curado
por humanos** é a **única fonte de verdade** (conteúdo). Certificação
profissional Akasha é 3-níveis (R$ 295 / 895 / 1995).

**Mecanismo operacional:**
- Toda entrada do Grimório tem **curador nomeado** + **fonte
  primária** + **data de revisão**.
- LLM **não decide** o que é verdade. LLM **não inventa**
  correspondências. LLM **redige** a partir de chunks
  selecionados.
- Certificação profissional Akasha em 3 níveis:
  - **Nível 1 (Akasha Reader) — R$ 295**: uso pessoal + família.
  - **Nível 2 (Akasha Practitioner) — R$ 895**: aplicação em
    clientes com supervisão.
  - **Nível 3 (Akasha Mentor) — R$ 1.995**: formação de outros +
    uso clínico supervisionado.
- White paper anual público cita TODAS as críticas (Manohar 2018
  Ayurveda; Sheldrake; Tzolkin Dreamspell; MBTI Pittenger 2005;
  JASNH numerologia).

**Auditoria:** 100% das entradas do Grimório revisadas por humanos
+ white paper anual + revisão por pares externa.

**Origem:** VISION.md §3 axioma 7; gaps.md #9, #10, #13;
mentor_persona_v1.md §3.

### Pilar Ético 5 — Não-Objetivos Explícitos

**Princípio:** Akasha é explícito sobre o que **NÃO é**. Ver §5
(8 Anti-visões rejeitadas) e VISION.md §5 (o que Akasha NÃO é).

**Mecanismo operacional:**
- 8 anti-visões publicadas no site, no app, no onboarding.
- Toda campanha de marketing passa por **comitê ético** (1
  representante por Pilar) antes de publicação.
- 3 não-objetivos de 3 anos (VISION §7): não ser dating app, não
  ser rede social, não ser loja espiritual.

**Auditoria:** Toda campanha de marketing arquivada + checklist
ético + relatório público anual.

**Origem:** VISION.md §5, §7, §9.

### Pilar Ético 6 — PT-BR Primeiro, EN Depois

**Princípio:** Akasha nasce **brasileiro**. Vocabulário,
referências, simbolismo, calendário, certificações — tudo em
português brasileiro. Internacionalização é **fase posterior**, não
aceleração prematura.

**Mecanismo operacional:**
- PT-BR é o idioma **default**; EN é opt-in (Fase 5+).
- Termos preservados (não traduzidos sem critério): Tikkun, Tiferet,
  Odu, Tridosha, Orixá, Kether, Tzimtzum.
- Toda correspondência esotérica tem **citação à fonte original**
  + **transliteração reversível** (não mágica).
- Glossário PT-BR público + traduções oficiais EN (Fase 4+).

**Auditoria:** Glossário mantido por curadores nativos; EN só
quando EN-Curador nomeado (não auto-tradução LLM).

**Origem:** VISION.md §3 axioma 8; ux/architecture_v1.md §8;
cabalistic-numerology.md (transliteração PT-BR↔hebraico).

### Pilar Ético 7 — Atualização Opcional, Leitura Fixa

**Princípio:** Akasha pode **atualizar** a engine de cálculo
(novos decanatos, novas traduções I Ching, novos insights de
pesquisa). Mas o **Mandato do dia** do usuário é **fixo** — não
muda retroativamente.

**Mecanismo operacional:**
- Versão do cálculo (Akasha Core Algorithm) versionada: v1, v2,
  v3. **Mandato X gerado pela v1** permanece v1 mesmo após v2
  ser lançado.
- Usuário pode **optar** por recalcular (migração opcional) ou
  manter o Mandato original.
- Mudanças de versão = changelog público + notificação ao usuário
  + opt-in/opt-out explícito.

**Auditoria:** Changelog público + opt-in/opt-out por usuário.

**Origem:** gaps.md #20 (atualização opcional, leitura fixa).

### Pilar Ético 8 — Aprovação Humana para Mudanças Estruturais

**Princípio:** Qualquer mudança nos 8 Pilares éticos (este
documento) exige **debate explícito + 4 aprovações** (1 por Pilar
vivo + 1 do conselho de curadores + 1 do comitê ético + 1
representante de usuário).

**Mecanismo operacional:**
- Mudança em Ethics Charter = **RFC pública** + 30 dias de
  comentário + 4 aprovações nomeadas.
- Mudanças menores (texto, exemplos) = comitê ético.
- Mudanças em RAG ou prompts do Mentor = comitê ético + 1 curador
  do Pilar afetado.
- Mudanças em correspondências esotéricas = parceria viva +
  cabala-corr-validator (Fase 5+).

**Auditoria:** Toda mudança documentada em `.autonomous/changelog/
ethics/` + white paper.

**Origem:** Princípio de governança; lacuna identificada na
pesquisa.

---

## 2. As 12 Regras do Mentor (E1-E12)

Estendem o Pilar Ético 3-4 para o comportamento do agente Mentor.
Originais em `mentor/persona_v1.md §4`. Aqui consolidadas:

| # | Regra | Mecanismo |
|---|-------|-----------|
| E1 | Detecta crise emocional → pula LLM → CVV 188 | Regex no input + protocolo CVV 188 (já em R-030) |
| E2 | Nunca afirma futuro como certo | Linguagem: "a tradição registra", "observe", "convida" |
| E3 | Sempre pergunta antes de diagnosticar | ≥ 1 pergunta por resposta, exceto CVV |
| E4 | Empodera, não vicia | Linguagem: "você pode", "observe o que emerge", não "você deve" |
| E5 | Detecta padrão de uso excessivo (≥ 3 Mandatos/dia) | Cap + mensagem acolhedora de pausa |
| E6 | Cita fonte do Grimório em cada afirmação | RAG + footnote visível |
| E7 | Se não tem chunk do Grimório, admite | "Não tenho base no Grimório para isto" |
| E8 | Linguagem ritualística, 3ª pessoa | Persona, não "eu acho" |
| E9 | Detecta apropriações culturais e corrige | "Essa prática pertence à tradição Y, com curador Z" |
| E10 | Em saudação, cita "via [Pilar X]" | Mnemônica + grounding |
| E11 | Em despedida, oferece silêncio + ritual | Fechamento ritual, não "tchau" |
| E12 | Memória de conversa: 3 camadas (curta/média/longa) | Curta: sessão; Média: mês; Longa: ano (opt-in) |

**Aplicação:** Estas 12 regras são **invioláveis**. Mudança = §8
(governança).

---

## 3. Os 3 Mecanismos de Proteção Ativa

### 3.1 Crise Emocional (já em R-030)

```ts
const CRISE_REGEX = /\b(suicid|morrer|matar|automutil|desesper[oa]|não aguento|não quero mais viver)\b/i;

function detectarCrise(intencao: string): boolean {
  return CRISE_REGEX.test(intencao);
}
```

**Resposta (não-LLM):**
> "Percebo que você está passando por um momento muito difícil. Você
> não precisa enfrentar isso sozinho(a). O CVV (Centro de Valorização
> da Vida) atende 24h por dia, todos os dias, pelo número 188
> (ligação gratuita) ou chat em [cvv.org.br](https://cvv.org.br).
> Posso continuar a leitura em outro momento, se você quiser."

**NÃO oferecer:** "conselho espiritual", "oração de cura", "recomendação
terapêutica" — CVV 188 é o recurso oficial, gratuito, anônimo,
24/7.

### 3.2 Cap de Uso

| Plano | Mandatos/dia | Mentor msgs/dia | Ritual/dia |
|-------|--------------|------------------|------------|
| Free | 1 | 3 | 1 |
| Premium (R$ 19-29/mo) | 1 | ilimitado | 3 |
| B2B Certified | ilimitado | ilimitado | ilimitado |

**Detecção de uso excessivo (E5):**
- ≥ 3 Mandatos/dia free → mensagem acolhedora:
  > "Percebo que você voltou várias vezes hoje. Akasha convida para
  > **descansar**. A tradição [Pilar X] ensina que 'ainda que
  > caminhes devagar, não percas de vista o que é teu'. Volte
  > amanhã, ou marque uma conversa com [curador vivo]."

### 3.3 Sem Feed Social / Sem Comparação

- **Zero feed**: usuário só vê o próprio Mandato.
- **Zero perfil público**: nome opcional, nunca exibido a outros.
- **Zero comparação**: nunca "seu Pilar X é mais raro que o de Y%".
- **Zero comentário público**: anônimo ou não.
- **Compartilhamento opcional**: usuário escolhe SE e COMO
  compartilha (ex: screenshot do Mandato sem nome).

---

## 4. 5% Causa Earmark por Pilar — Protocolo Operacional

### 4.1 Tabela de Earmark (5% × 5 Pilares = 25% da receita líquida)

| Pilar | Causa earmark | Parceiro inicial (meta) |
|-------|---------------|--------------------------|
| 1 — Numerologia Cabalística | Educação judaica liberal / Cabala viva | Casa de Cabala (Curitiba, 2026) — meta |
| 2 — Astrologia | Educação FAA + diversidade em astrologia | FAA Brasil (meta: 2026) |
| 3 — Numerologia Tântrica | Ayurveda BAMS + Tridosha educação | BAMS-curador (meta: 2027) |
| 4 — Odu de Nascimento | Terreiros de matriz africana + saq be | Saq Be (Adam Rubel) ou similar (meta: 2026) |
| 5 — I Ching | Tradução Wilhelm-Baynes 1950 + Wilhelm-Lai 2024 | Book of Changes Academy (meta: 2027) |

**Total earmark: 5% por Pilar × 5 Pilares = 25% da receita líquida**
(meta Ano 5: R$ 500k/ano total earmark, sendo R$ 100k/Pilar).

### 4.2 Rastreabilidade (Fase 5+)

```ts
// Cálculo de earmark por Pilar
function calcularEarmark(receitaLiquida: number, pilar: Pilar): number {
  return receitaLiquida * 0.05; // 5% por Pilar
}

// Schema de auditoria (preview para Fase 6+, schema.prisma)
type EarmarkAudit = {
  id: string;
  data: Date;
  pilar: 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching';
  valor_brl: number;
  parceiro: string; // 'Saq Be', 'Casa de Cabala', etc.
  recibo: string; // URL do recibo público
};
```

### 4.3 White Paper Anual

Publicado em **Janeiro de cada ano** com:
- Total receita líquida ano anterior
- Total earmark por Pilar (5 × 5%)
- Parceiros contemplados + recibos
- Curadores do Grimório (anonimizados se pedido)
- Auditoria externa independente (1 firma, 1 ano)

---

## 5. As 8 Anti-Visões Rejeitadas

Originais em `VISION.md §9` + `gaps.md anti-gaps`. **Akasha NÃO é
nenhuma destas 8 coisas:**

1. **App de horóscopo diário viral** — fatalista, raso, comparação
   entre signos. **REJEITADO** (Pilar Ético 5).
2. **Rede social espiritual** — feed, comentários, "amigos",
   comparação. **REJEITADO** (Pilar Ético 3, §3.3).
3. **Biblioteca enciclopédica** — Wikipedia sem cálculo. **REJEITADO**
   (Akasha tem cálculo + curadoria, não só arquivo).
4. **AI como espírito** — "Akasha é uma entidade consciente" /
   "Akasha fala com os mortos". **REJEITADO** (Pilar Ético 4).
5. **App de dating esotérico** — "match pelo Pilar 1". **REJEITADO**
   (VISION §7 + gaps anti-gaps).
6. **Loja de produtos espirituais** — incenso, cristal, curso
   vendido. **REJEITADO** (VISION §7 — "terceirizar").
7. **Substituição de prática religiosa** — "Akasha é seu novo
   guru". **REJEITADO** (VISION §7).
8. **Terapia disfarçada** — Mentor diagnosticar depressão, etc.
   **REJEITADO** (Pilares 3, 4 + CVV 188).

**Como operacionalizar:** Toda campanha de marketing é checada contra
estas 8. Se toca em qualquer uma, **rejeitada** ou **reformulada**
pelo comitê ético.

---

## 6. Crise Saúde Mental — Protocolo Completo

### 6.1 Detecção (já em R-030, regex expandido)

```ts
const CRISE_REGEX_EXTENDIDO = /\b(
  suicid|suicídio|suicidar|
  morrer|morte|matar|
  automutil|automutilar|autolesão|
  desesper[oa]|desespero|desesperado|desesperada|
  não aguento|não aguent|não quero mais viver|
  me machucar|cortar|cortada|
  tirar minha vida|tirar a vida|
  acabar com tudo|acabar com a vida
)\b/i;
```

### 6.2 Resposta Padronizada (não-LLM)

> "Percebo que você está passando por algo muito difícil agora. Você
> não precisa enfrentar isso sozinho(a).
>
> **CVV — Centro de Valorização da Vida**
> - 📞 Ligue **188** (24h, gratuito, anônimo)
> - 💬 Chat: [cvv.org.br](https://cvv.org.br)
> - 📧 E-mail: [atendimento@cvv.org.br](mailto:atendimento@cvv.org.br)
>
> Posso continuar a leitura em outro momento, se você quiser. Volte
> quando estiver pronto(a)."

### 6.3 Estados de Saúde Espiritual (do Mentor)

O Mentor rastreia 5 estados (já em persona_v1 §4 E1-E12):

1. **Saudável** — uso regular, curiosidade, sem padrões alarmantes.
2. **Busca intensa** — uso crescente (curiosidade legítima).
3. **Vício incipiente** — uso ≥ 3 Mandatos/dia por ≥ 7 dias → cap
   acolhe.
4. **Angústia** — uso + tom de desespero → CVV 188 + pausa
   sugerida.
5. **Crise** — regex dispara → pula LLM → CVV 188 imediato.

**Transição entre estados** é detectada por padrão de uso + tom de
linguagem (regex + LLM-judge em segundo plano, opt-in).

---

## 7. Aprovação Humana — Mecânica de Mudança

### 7.1 Mudança em Ethics Charter (Pilar 8)

**Trigger:** Qualquer proposta de mudança nos 8 Pilares éticos deste
documento.

**Processo:**
1. **RFC pública** em `.autonomous/rfcs/ethics-NNN-<slug>.md` (Fase
   5+ cria o workflow).
2. **30 dias de comentário público** (white paper, site).
3. **4 aprovações obrigatórias:**
   - 1 representante do Pilar vivo mais afetado.
   - 1 membro do conselho de curadores do Grimório.
   - 1 membro do comitê ético independente.
   - 1 representante de usuário (pesquisa de campo).
4. **Changelog público** em `.autonomous/changelog/ethics/`.
5. **Atualização de persona_v1.md, synthesis_v1.md, VISION.md.**

### 7.2 Mudança em RAG, Prompts, ou Correspondência Esotérica

- **RAG do Mentor:** comitê ético + 1 curador do Pilar afetado.
- **Prompts do Mentor:** comitê ético.
- **Correspondência esotérica (ex: novo Pilar):** parceria viva
  nomeada + cabala-corr-validator (Fase 5+ cria o validador).

### 7.3 Auditoria Externa Anual

- **White paper anual** (Janeiro) — público.
- **Auditoria externa independente** — 1 firma, 1 ano, com
  publicação dos achados (positivos + negativos).
- **DPO mensal** (Data Protection Officer) — LGPD review.

---

## 8. Citações Canônicas (Fontes de Verdade)

### 8.1 Fontes Primárias (tradição viva + histórica)

- **Cabala viva:** Pardes Institute, Hadar Institute, ALMA
  (Hebrew College), Nehirim, Or HaLev
- **Ifá vivo:** Saq Be (Adam Rubel), Gran Consejo de Ajq'ij
  (Guatemala), Iroko Cultural Foundation, Ile Asile (Brasil)
- **Ayurveda vivo:** BAMS (Bachelor of Ayurvedic Medicine and
  Surgery) practitioners, NAMA (National Ayurvedic Medical
  Association, US), WHO Traditional Medicine Strategy 2014-2023 +
  2025-2034
- **Astrologia viva:** FAA (Faculty of Astrological Studies,
  UK), OPA (Organisation for Professional Astrology), Kepler
  College, Astro.com
- **I Ching vivo:** Wilhelm/Baynes (1950, base clássica), Wilhelm/Lai
  (2024, atualização), I Ching Society of Canada, Book of Changes
  Academy

### 8.2 Fontes Críticas (sempre citadas no white paper)

- Manohar 2018 IJME — Ayurveda como heurística, não ciência.
- Sheldrake 1981 + Maddox Nature 1981 + Wiseman 1998 PubMed —
  Morphic fields como metáfora, não mecanismo.
- Tzolkin Dreamspell (Calleman 2020) — anti-apropriação cultural.
- Pittenger 2005 — MBTI como crítica.
- JASNH Huffman 2013 + ASSAP — numerologia como crítica.
- Hufford 2003 + Becker 2004 — tradições religiosas como crítica
  de apropriação.

### 8.3 Fontes Éticas (frameworks de referência)

- LGPD Lei 13.709/2018 (Brasil)
- GDPR (EU 2016/679)
- IEEE Ethically Aligned Design 2019
- ACM Code of Ethics 2018
- Belmont Report 1979 (pesquisa humana)
- Declaração Universal dos Direitos Humanos (1948)

---

## 9. 10 Compromissos Operacionais (resumo executivo)

1. **5% da receita líquida earmark por Pilar** = 25% total earmark
   anual.
2. **Zero feed social** — usuário só vê o próprio Mandato.
3. **Zero gamificação** — sem streak, sem badge, sem "atrasado".
4. **Zero previsão fatalista** — "tradição registra", não "você vai".
5. **Crise → CVV 188** — pula LLM, sempre.
6. **Citação obrigatória** — toda afirmação cita Grimório.
7. **White paper anual** — público, com crítica honesta.
8. **Auditoria externa** — 1 firma, 1 ano, publicada.
9. **4 aprovações** para mudar este documento.
10. **PT-BR primeiro** — EN opt-in, com curador nomeado.

---

## 10. Citações Internas (cross-references)

- VISION.md §3 (8 axiomas) — fonte canônica.
- VISION.md §5 (o que Akasha NÃO é) — 6 itens.
- VISION.md §7 (não-objetivos 3 anos) — 5 itens.
- VISION.md §9 (anti-visão) — 3 futuros rejeitados.
- synthesis/synthesis_v1.md §5.5-5.6 (10 limites éticos do Algorithm).
- mentor/persona_v1.md §4 (12 regras E1-E12) — origem da §2.
- mentor/persona_v1.md §3 (RAG mandatório) — origem do Pilar Ético 1.
- gaps.md anti-gaps (8 rejeitados) — origem do §5.
- R-030 akasha-core.ts (CRISE_REGEX + detectarCrise) — origem do
  §3.1 e §6.1.

---

## 11. Próximos Passos (Fase 1 → Fase 5+)

### Curto prazo (sessão N+2)
- [ ] **D-005 (refinar)** — Validar este Charter contra os 3 perfis
      de teste (Ana/Bruno/Carla). Ajustar se necessário.
- [ ] **D-006 (iteração v3)** — Coletar feedback interno + v2 do
      Charter.

### Médio prazo (Fase 5)
- [ ] **D-040 (Prisma schema)** — Tabela `ethics_changelog` (RFCs
      públicas).
- [ ] **D-042 (Zod types)** — `EarmarkAuditSchema`, `CriseResponseSchema`,
      `SaudeEspiritualState` enum.
- [ ] **cabala-corr-validator** — skill para validar correspondências
      esotéricas antes de entrarem no Grimório.

### Longo prazo (Fase 6+)
- [ ] **White paper Ano 1** — primeira auditoria pública + earmark
      rastreado.
- [ ] **5 parcerias formalizadas** — 1 por Pilar.
- [ ] **DPO contratado** — LGPD review mensal.

---

**Akasha não é perfeito. É responsável.**
**Akasha não é dono das tradições. É curador delas.**
**Akasha não é guru. É ponte.**

---

> Última atualização: 2026-06-11
> Próxima revisão: D-005 (perfis de teste) + D-006 (v2 feedback)
> Confidence: HIGH — 8 axiomas da VISION + 12 regras E1-E12 + 8
> anti-gaps já validados.
