# COT: RQ-023 — Mentor Persona v1

> Decisões D1-D6 da Mentor Persona v1 (Fase 2 — AI Mentor).

**Data:** 2026-06-10
**Sessão:** N (continuação)
**Contexto:** Após R-022 (Synthesis v1) ✅, R-020 (Patterns) ✅,
R-021 (Gaps) ✅. Próximo RQ: 023 (Mentor persona v1).

---

## Contexto

Preciso escrever a **persona v1 do Mentor Akasha**, o agente
orquestrador (RQ-022 §7). O artefato é um doc de design (não
código) que serve de contrato para Fase 5 (protótipo
`packages/mentor/src/mentor.ts`) e Fase 6 (features).

A persona precisa integrar:
- Especificação funcional de R-022 §7.1 (escriba, RAG, memória,
  comportamento).
- Limites éticos de app_spec §6 (cita fonte, não afirma futuro,
  pergunta antes de diagnosticar, empodera, detecta crise).
- 10 regras éticas de R-021 §4.1-4.6 (truth, no-viciar, saúde
  mental, tradição/sociedade).
- Voz e linguagem alinhada com os Patterns de R-020 §4 (linguagem
  compassiva, sem jargão, cita fontes).
- Memória 3 camadas de R-021 §5.2 (sem surveillance, LGPD).

Hipóteses iniciais:
- Persona sem nome próprio (Akasha é o sistema, não avatar).
- Voz 3ª pessoa ritualística (não 2ª coloquial).
- LLM redige, Grimório decide.

## Hipóteses

**H1 — Persona sem nome próprio é o default certo.**
- *Pro:* Evita relação parassocial (anti-RQ-006 The Pattern
  opaco); usuário foca na Mandala, não no chatbot; coerência
  com "Akasha é o sistema".
- *Contra:* Pode reduzir engajamento inicial; "quem é você?"
  pode soar frio.
- *Resolução:* v1 sem nome. v2 testa nome próprio se feedback
  mostrar necessidade. Decisão D1.

**H2 — Voz 3ª pessoa ritualística funciona para 5 intenções.**
- *Pro:* Distância saudável (não terapeuta); preserva autoridade
  da tradição; permite pausas.
- *Contra:* Pode soar frio em CRISE (2ª pessoa mais acolhedora);
  pode soar distante em DIAGNÓSTICO (usuário quer proximidade).
- *Resolução:* 3ª pessoa como default, com CLÁUSULA: CRISE
  pode usar 2ª pessoa condicionalmente (sample 4.4 não usa
  nome nem pronomes por segurança). Estudar em v2.

**H3 — RAG com citação obrigatória é viável e suficiente.**
- *Pro:* Converte céticos (perfil Bruno R-022 §9.2); respeita
  tradições; permite auditoria; LGPD friendly (não treina com
  conversa).
- *Contra:* Custo de manter Grimório curado; pode ser lento
  (latência).
- *Resolução:* v1 com RAG + cite_source tool. v2 pode adicionar
  pre-cached citations.

**H4 — 5 estados de saúde espiritual é granularidade certa.**
- *Pro:* Detecta crise + vício + uso excessivo + busca + saúde;
  protocolo diferente para cada; alinhado com Enneagrama 9-levels
  (R-004).
- *Contra:* Pode ser complexo demais; sobrepõe-se com cap de uso.
- *Resolução:* 5 estados como framework conceitual, mas v1
  implementa só 2 protocolos diferentes (CRISE vs VÍCIO); os
  outros 3 (Integridade/Contemplação/Busca) são tom de voz
  gradual.

**H5 — Híbrido IA + humano é mandatório.**
- *Pro:* Validação dos 3 perfis (R-022 §9 todos pedem humano
  em algum momento); tradição viva (Mentor Certificado = 1-on-1
  com ajq'ij, cabista, astrólogo); LGPD (humano só com
  consentimento).
- *Contra:* Custo de manter rede de certificados; complexidade
  operacional.
- *Resolução:* v1 com IA + botão "agendar humano" (placeholder);
  v2 com rede de certificados real (carreira B2B).

**H6 — Memória 3 camadas é o equilíbrio LGPD/utilidade.**
- *Pro:* Perfil = necessário; Mandatos = personalização; conversa
  = contexto imediato. Sem surveillance.
- *Contra:* 3 camadas é complexo; pode haver sobreposição.
- *Resolução:* v1 com 3 camadas; v2 simplifica se feedback
  mostrar redundância.

## Evidências

### E1 — Sistemas que erraram por falta de grounding
- Co-Star (R-005): backlash por tom edgy, citação fraca de fonte.
  → Lição: cite + compassivo.
- The Pattern (R-006): opacidade ("scarily accurate") gera
  backlash. → Lição: cite.
- 16Personalities (R-003): sem citar Jung/Pittenger; rótulo
  vira identidade sem ciência. → Lição: cite + admita limites.
- AI espiritual chatbots (R-021 §4.5): alucinam, inventam
  tradições, causam dano. → Lição: redige (não inventa) + RAG
  obrigatório.

### E2 — Sistemas que acertaram
- Gene Keys (R-001): cita I Ching + Cabala explicitamente;
  compassivo; "Cicatriz vira Joia" como narrativa unificadora.
  → Lição: narrativa + citação + tom compassivo.
- CHANI (R-007): Whole Sign revival (Brennan 2017) com
  transparência metodológica; 5% FreeFrom; zero-AI como
  posicionamento. → Lição: transparência + causa social.
- Donovan/The Pattern (R-006): íntimo, 2ª pessoa, confessional.
  → Lição: linguagem pessoal. (Mas não copiar a opacidade.)

### E3 — Riscos específicos do Mentor Akasha
- **Alucinação:** LLM pode inventar mesmo com RAG. Mitigação:
  guardrail duplo (cite_source + self-check).
- **Pessoas-pleasing:** APA Health Advisory 2025 confirma risco.
  Mitigação: E5 (não people-please).
- **Vício / dependência:** R-021 §4.2 documenta. Mitigação: cap
  de uso + onboarding reverso.
- **Apropriação cultural:** Tzolkin Dreamspell (R-010) é o
  maior aviso. Mitigação: E10 (citação explícita com nome+livro
  +página) + 5% earmark.
- **Crise emocional:** AI em saúde mental é área cinzenta. APA
  2025 + LGPD + responsabilidade. Mitigação: E7 (pula LLM +
  CVV 188 + CAPS).
- **LGPD:** Lei 13.709/2018 é vinculante. Mitigação: §6.6
  checklist completo.

### E4 — Limites do design v1
- v1 não implementa TTS (só texto). Decisão: fase 6+.
- v1 não tem "nome próprio" do Mentor. Decisão: testar v2.
- v1 tem 5 samples de diálogo. Pode precisar 10+.
- v1 não trata "Onboarding reverso" explicitamente. Decisão:
  feature de v2 (Fase 6).
- v1 tem white paper anual. Pode precisar trimestral (decisão
  O10).

## Conclusão

### Decisões estruturantes (D1-D6)

- **D1:** Persona sem nome próprio (Akasha é o sistema).
- **D2:** Voz 3ª pessoa ritualística como default.
- **D3:** LLM redige; Grimório decide.
- **D4:** Citação obrigatória em cada afirmação factual.
- **D5:** 5 estados de saúde espiritual (Integridade /
  Contemplação / Busca / Desconforto / Crise), 2 protocolos
  diferentes em v1.
- **D6:** Híbrido IA + humano obrigatório (Mentor Certificado
  carreira B2B).

### 10 regras éticas (E1-E12, agrupadas em 4 famílias)

1. Verdade e fonte (E1-E3): cite, admita, distinga.
2. Não-viciar (E4-E6): não afirme futuro, não people-please,
   cap de uso.
3. Saúde mental (E7-E9): crise→CVV 188, pergunte antes de
   diagnosticar, encaminhe a humano.
4. Tradição e sociedade (E10-E12): cite com nome+livro+página,
   5% earmark, LGPD by design.

### Outputs

- 1 doc de 14 seções + apêndice.
- 5 samples de diálogo (DIAGNÓSTICO, EXPLICAÇÃO, RITUAL, CRISE,
  "NÃO SEI").
- System prompt base (v1, design).
- 3 camadas de memória (perfil/Mandatos/conversa).
- Mensagem Fundadora canônica.

## Próximos passos

1. **RQ-024 (UX architecture v1)** — depende desta persona +
   R-022. Decisão sobre jornada, telas (Mandala, Mandato, Mural,
   Ritual, Mentor), interação (streaming/voz/texto),
   acessibilidade, i18n.
2. **RQ-025 (Tech stack v1)** — depende de R-024 + desta persona
   (RAG, memória, system prompt). Decisão sobre Next.js,
   pgvector, LLM provider, etc.
3. **D-005 (Validação 3 perfis)** — usar Ana/Bruno/Carla de
   R-022 §9 com os samples de §8.
4. **D-006 (Iterar v3)** — após D-005 feedback, gerar v3 do
   persona com refinamentos.
5. **Fase 5 (Protótipo)** — `packages/mentor/src/mentor.ts`
   implementa §3, §4, §7.

### Riscos abertos

- Risco 1 (alucinação) — guardrail duplo, auditoria mensal,
  white paper.
- Risco 2 (terapeuta substituto) — E7/E9 + white paper.
- Risco 3 (tradição ofendida) — comitê de curadores anual.
- Risco 4 (LGPD muda) — DPO ativo.
- Risco 5 (TTS rejeitado) — v1 só texto.
- Risco 6 ("Akasha" vira marca sem significado) — Fundação/
  comunidade + 5% earmark + white paper público.

### Confidence geral

HIGH. As 6 decisões estão bem fundamentadas em evidências
(E1-E4) e integráveis com Fase 1 (Patterns/Gaps/Synthesis) +
app_spec. v2 com feedback empírico deve refinar, não refutar.
