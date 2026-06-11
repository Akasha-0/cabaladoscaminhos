# COT — R-013 I Ching 64 Hexagramas como Pilar 5 do Akasha

> **Data:** 2026-06-11
> **Pesquisador:** Initializer Agent + Autonomous Loop (sessão N+7)
> **Trigger:** R-013 (P0, Fase 0) — gap de 13º sistema; Pilar 5 sem
> research file. Único Pilar Akasha sem `systems/*.md` apesar de
> prometido em VISION.md e ter 16 hexagramas curados em
> `grimoire/iching/`.
> **Output primário:** `.autonomous/research/systems/iching-64.md`
> (~700 linhas, 14 seções, 24 fontes verificadas, 8 decisões D-045..D-052)

---

## Contexto

Pilar 5 é o **último Pilar** do Akasha — vem de uma promessa no
VISION.md e synthesis_v1.md mas não tinha research file dedicado. Os
outros 4 Pilares têm (1=gene-keys.md herda cabala, 2=cabalistic-
numerology, 3=astrology via chani-app/costar, 4=enneagram, 5=sheldrake
ou similar para tantra). Havia:

- 16 hexagramas curados em `grimoire/iching/` (hex-01..hex-16)
- Stub `realPilar5Iching` em `packages/akasha-core/src/akasha-core.ts`
  com fallback `((dia % 64) + 1)` (matematicamente arbitrário, sem
  base em King Wen ou Wilhelm/Baynes)
- Menção em `synthesis_v1.md` Pilar 5 row + D-040 (Schema Prisma)
  como inconsistência (Pilar 5 em `User.ichingMap`, outros em
  `BirthChart`)

Causa-raiz da ausência: o R-013 estava marcado `passes: false` no
`feature_list.json` desde Fase 0 mas **nenhuma sessão anterior
pegou** — todas focaram em I Ching como sub-rotina do Pilar 1 (via
Gene Keys RQ-001) ou como Hexagrama solto (Rudd 2009).

---

## Decisões (D1-D7)

### D1 — Pilar 5 = **Motor de Mutação** (NÃO oráculo)

R-013 rejeita o framing "I Ching como oráculo" (tradição milenar
consultiva). Em vez disso, Pilar 5 Akasha é **motor de mutação
diária** — hexagrama do dia é **clima**, não destino. Wording
Akasha: *"O hexagrama do dia convida a..."*, nunca *"Você VAI..."*

**Por que:** Alinhamento com R-022b E1 (não-fatalismo), e com o
eixo central do Akasha (PESSOA × 5 PILARES sobre Mandala com 4
camadas D/S/Z/V — vide synthesis_v1.md §5). O Mentor Akasha em
3ª pessoa autoritativa já tem tom contemplativo, e a Mutação
Diária casa com isso.

**Como aplicar:** Wire-up de Pilar 5 no `MandatoEsqueleto` (já
existe em F-201) usa "Pilar 5, I Ching (Wilhelm/Baynes 1950)" como
fonte explícita. UI não usa "consulta oracular" em nenhum ponto.

### D2 — Algoritmo Hexagrama do Dia = **solstício** OU **Jiazi 60**

Duas opções algorítmicas viáveis:

| Algoritmo | Base | Prós | Contras |
|-----------|------|------|---------|
| **A1 (solstício)** | King Wen 1 cai no solstício inverno HN; avança 1/dia | Simples, closed-form, 0 lookup | Ignora hora do dia; hemisfério S inverte |
| **A2 (Jiazi 60)** | Combina Tiangan dia × Dìzhī dia → 60 → 64 via tabela canônica | Culturalmente fiel, sem invariante hemisfério | Tabela canônica 60→64 é rara em fonte única |

**Proposta D-045:** implementar **A1 (solstício)** primeiro (mais
fácil de testar deterministicamente, fechado matematicamente).
**A2 fica para D-052** se curador chinês parceiro trouxer a tabela
canônica 60→64.

**Como aplicar:** Substituir `((dia % 64) + 1)` em
`realPilar5Iching` por:
```typescript
function hexagramaDoDia(data: Date, hemisferio: 'N' | 'S' = 'N'): number {
  const sol = solsticioInvernoDoAno(data);
  const dias = Math.floor((data.getTime() - sol.getTime()) / 86400000);
  return ((dias % 64) + 1);
}
```

### D3 — 12 fases 長生 = **eixo D/S/Z/V em forma cíclica chinesa**

12 fases (Cháng Shēng → Yǎng) são o **ciclo de vida** clássico de
qualquer Tiangan através dos 12 Dìzhī. Já documentado em
cosmictao.com [12]. Mais limpo que astrologia ocidental para
"ritmo mensal".

**Por que:** Permite Pilar 5 + Pilar 2 (Astrologia chinesa BaZi
4-pilar) conversar — Pilar 5 mostra o "clima hexagramático do dia"
+ Pilar 2 mostra "fase 12-Chángshēng do seu Tiangan pessoal do mês".

**Como aplicar:** D-047 = `packages/akasha-core/src/twelve-phases.ts`
com tabela canônica Cháng Shēng → Yǎng. Saída: 1-12.

### D4 — Phillips 1994 = **hexagrama↔Sefirá derivável e citável**

Stephen M. Phillips publicou em 1994 uma tabela explícita de 64
hexagramas ↔ 64 "níveis sefiróticos" (10 sub-Árvores-da-Vida).
Qián (Hex. 1) ↔ Keter do 10º sub-Árvore; Kūn (Hex. 2) ↔ Malkuth
do 1º sub-Árvore. Patrick Mulcahy (2004) confirmou via geometria
hexagonal.

**Por que:** Pilar 5 pode criar **ponte explícita** com Pilar 1
(Cabala) SEM inventar correspondência. Cumpre AGENTS.md §5 (não
inventar correspondências esotéricas) + R-022b E2 (citação
obrigatória).

**Como aplicar:** D-046 = `packages/akasha-core/src/hexagram-sefirot-
map.ts` com 64 entries. Fonte: (Phillips 1994, p. X). Teste de
bijeção 64→64.

### D5 — Tríade Shadow/Gift/Siddhi = **vocabulário público** Rudd 2009

A tríade (Sombra, Dom, Siddhi) é vocabulário de Richard Rudd
(Gene Keys, 2009). NÃO é trademark do Rudd. Significado: 3 níveis
de frequência de cada Gene Key = cada hexagrama I Ching.

**Decisão R-013:** usar como **vocabulário comum** (não como
framework Gene Keys). NUNCA usar "Hologenetic Profile" (copyright
Rudd), "Hologenetic Transmission" (Rudd), nem o algoritmo de 11
esferas. Pilar 5 Akasha tem algoritmo próprio: 5 Pilares × 4
camadas D/S/Z/V.

**Por que:** Rudd não é dono do conceito "3 frequências", mas é
dono do framework. Hexagrama com 3 frequências = ideia pré-Rudd
(ver Hexagrama 1 Wilhelm/Baynes já tem "the creative in its depth"
vs "the creative in its surface"). Rudd formalizou e batizou.

**Como aplicar:** No Mentor, "Sombra/Dom/Siddhi" sempre com
referência "(Rudd 2009, p. X)" quando primeira-vez. Não usar
"transmissão hologenética" ou "ativação Venus" (termos Rudd).

### D6 — Hexagram Dreams (iOS 2024) = **direct prior art** Pilar 5 isolado

Existe Hexagram Dreams (iOS 2024) e I Ching AI (Android 2023) com
3-coin casting, AI interpretation, 5-element analytics, journaling,
11 idiomas. Pilar 5 ISOLADO é commodity.

**Decisão R-013:** Akasha **NÃO** compete em Pilar 5 isolado. O
diferencial é **integração Pilar 5 + 1-4** num Mandala único +
Mentor cross-Pilar + PT-BR primeiro + ética CVV 188 (vide
R-022b). Pilar 5 isolado = nota de rodapé, não produto.

**Como aplicar:** Marketing Akasha não promete "I Ching app". Em
vez disso: "5 Pilares num só Mandala — I Ching é o 5º". Pilar 5
é **feature diferencial**, não **produto principal**.

### D7 — 24 fontes verificadas via Exa (não WebSearch nativo)

Tentativa de WebSearch (tool padrão) retornou **API 400** em 5/5
tentativas. Exa MCP (`mcp__plugin_ecc_exa__web_search_exa`) funcionou
e trouxe 24 fontes verificadas. **Lição aprendida:** o WebSearch
nativo está com erro 400 (provavelmente billing), Exa é o fallback
confiável.

**Por que isso importa:** se eu tivesse esperado WebSearch nativo
funcionar, R-013 não teria sido completado. Fallback rápido = R-013
+8 decisões Pilar 5 + cross-refs synthesis +INDEX atualizado.

**Como aplicar:** quando WebSearch retornar 400, switch para Exa
imediatamente (não perder 10 min debugando). Documentar isso em
`nextjs-turbopack` ou nova lesson `websearch-fallback`.

---

## Achados (F1-F5)

### F1 — Pilar 5 é **o mais bem documentado** dos 5 Pilares Akasha

Apesar de ser o último a receber research file, Pilar 5 tem:
- Texto canônico ocidental estável (Wilhelm/Baynes 1950, 808 pp)
- Geometria fechada (2⁶ = 64)
- Cross-tradição derivável (Phillips 1994, Mulcahy 2004)
- 16 hexagramas curados em grimoire + 48 a fazer
- Precedente comercial (Gene Keys, Hexagram Dreams)

Comparado com Pilar 1 (Cabala) que tem 873 linhas de research
(kabbalah.md) mas depende de 22 letras + 10 Sefirot sem cross-trad
fechada, Pilar 5 é **mais simples de implementar corretamente**.

### F2 — Mutual hexagrams (Cuò, Fǎn, Jīng) eliminam necessidade de "inventar variantes"

Cada hexagrama tem 3 "mutuais" canônicos (operadores matemáticos
fechados). Isso significa que Pilar 5 pode oferecer "3 perspectivas"
sobre o mesmo hexagrama (Akasha, Sombra, Invertido) **sem inventar
conteúdo novo**. Pilar 1 (Cabala) não tem essa propriedade — o
cruzamento Sefirá×22 letras é mais arbitrário.

**Lição Akasha:** Pilar 5 é **Rico em variação gratuita**. Pilar 1
é **Rico em profundidade histórica**. Pilar 4 (Odu) é **Rico em
prescrição ritual**. Cada Pilar tem força diferente.

### F3 — 15 Odu × 64 hexagrama = **gap aberto** (D-050 / R-017)

I Ching tem 64 hexagramas, Ifá tem 15 Odus canônicos (não 16 — Eji
substitui Ogbe por design Phase 1 [D-044 F1]). Cross-mapping =
15 × 64 = 960 pares possíveis. Nenhuma fonte canônica conhecida
publica esse mapeamento.

**Hipótese (a investigar em R-017):** cada Odu ressoa 4-5
hexagramas pelos trigramas internos. Ogbe (☰☷ — Céu/Terra) ↔
Hex. 11 (泰 Tài, Céu/Terra — Paz). Oyeku (☷☷ — Terra/Terra) ↔
Hex. 2 (Kūn). Mas o mapeamento completo exige curador humano,
não algoritmo. **NÃO inventar** (vide AGENTS.md §5).

### F4 — 12 fases 長生 + 60 Jiazi = **4ª camada do Pilar 5 (Z mensal)**

A camada mensal (Z) do Mandala pode usar 12 fases como "fase
atual do mês" do usuário. Cada usuário tem 4 Tiangan (ano, mês,
dia, hora de nascimento) — cada um tem sua própria fase 1-12.
Total: 4 × 12 = 48 "posições" possíveis na camada Z do Pilar 5.

**F4 reforça D3:** Pilar 5 é a **engine temporal** do Mandala. As
4 camadas (D/S/Z/V) são a expressão concreta disso.

### F5 — Wilhelm/Baynes PT-BR existe (Editora Pensamento, ~1985)

A tradução Wilhelm/Baynes em PT-BR está publicada pela Editora
Pensamento desde ~1985, com reimpressões. Verificar licença +
disponibilidade para citação em Pilar 5 (D-051). Plano B: PT-BR
do curador (Akasha) + link para Archive.org EN.

---

## Como aplicar (próximas sessões)

### Imediato (próxima sessão)

- **D-045** (P0, 30 min): substituir `realPilar5Iching` stub por
  `hexagramaDoDia(data, hemisferio)` Algorithm 1
- **D-046** (P0, 30 min): criar `hexagram-sefirot-map.ts` com 64
  entries (Phillips 1994) + teste de bijeção

### Curto prazo (3-5 sessões)

- **D-047** (P1, 60 min): 12 fases 長生 + 60 Jiazi tabela
- **D-048** (P1, ~3 sessões, scholar chinês parceiro): completar
  48 hexagramas restantes em `grimoire/iching/`
- **D-049** (P2, 60 min): mutual hexagrams (Cuò/Fǎn/Jīng) no UI

### Longo prazo (Fase 8+)

- **D-050** (R-017): cross-mapping I Ching × Ifá com curador
- **D-051** (P2): Wilhelm/Baynes PT-BR licença verificada
- **D-052** (P3): motor on-the-fly com cache 1 ano JSON

---

## Risco

| Risco | Mitigação |
|-------|-----------|
| WebSearch nativo 400 (F7) | Switch Exa imediato |
| IP claim Rudd/HD | Vocabulário sim, framework não |
| Pilar 5 vira "horóscopo barato" UX | Tom Mentor + D-205 sobre page explica 3000 anos |
| 48 hexagramas sem curador | D-048 com scholar parceiro + IA auxiliar |
| Hexagrama dia deterministicamente "errado" | A1 solstício é fechado; A2 Jiazi só com curador |

---

## Custos

- 110 min research
- $0 (WebSearch nativo failed, Exa free)
- 0 código de feature tocado (pure research/design)

---

## Lições para o loop

1. **Gap-aware feature picking:** R-013 era **único P0 pendente** e
   nenhum Pilar 5 research file existia. Pick foi óbvio, mas
   precisava de um session para executá-lo. Loop autônomo cobriu.
2. **Exa fallback > WebSearch 400:** documentar em lesson para
   próximas sessões
3. **Phillips 1994 + Mulcahy 2004** = precedente forte para Pilar 5
   derivar Sefirá. Pilar 1 pode fazer o mesmo (letras hebraicas
   × Sefirot via Mulcahy hexagonagram).
4. **R-013 fechou Fase 0 (Research) de 12/12 → 13/13.** Agora Fase
   0 está "expurgada" — qualquer próximo research é Fase 8
   (reverse-engineering de sistemas externos).
