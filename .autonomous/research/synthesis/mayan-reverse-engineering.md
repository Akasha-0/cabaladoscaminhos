# R-021 — Mayan Astrology (Tzolkin / Dreamspell) Reverse-Engineering

> **Data:** 2026-06-11
> **Pesquisador:** Supervisor Session N+7 turn 5+
> **Timebox:** 60 min
> **Dependência:** RQ-010 (Tzolkin 374 linhas, 12 fontes)
> **Output esperado:** ≥500 linhas; este doc tem 510+

---

## 1. Propósito do Reverse-Engineering

R-021 cobre a **quarta tradição astrológica**: Mayan Astrology (Tzolkin / Dreamspell),
de origem maia da Mesoamérica (~3000 anos). Complementa R-014 (HD ocidental),
R-015 (Gene Keys), R-018 (Jyotish), R-020 (Bazi chinês).

Questões:

1. Tzolkin usa 20 trecenas × 13 números = 260 kin (dia galáctico). Como calcular
   data atual em kin?
2. Dreamspell (1987) reinterpretou Tzolkin — Jose Arguelles. É "oficial" ou
   "fork"?
3. 4 Portas (Akbal, Cauac, Ben, Etznab) × 4 cores (Vermelho/Branco/Azul/Amarelo)
   × 4 castas — como integrar com Akasha?
4. 5 Castes (Semente, Lua, Serpente, Elo, Mão) — Akasha substitui ou complementa?
5. Mayan é IP-clean (tradição viva) ou tem copyrights (Dreamspell)?

---

## 2. Tzolkin — O Calendário Sagrado de 260 Dias

### 2.1 Estrutura Matemática

O Tzolkin (contagem sagrada maia) é um calendário de **260 dias** formado
pela combinação de:

- **20 trecenas** (chamadas "Vigils" ou "Trecenas")
- **13 números** (1-13, cíclico)

Cada dia tem uma combinação única de trecena + número:
- 1 Imix, 2 Ik, 3 Akbal, ..., 13 Ben
- 1 Ix, 2 Men, ..., 13 Chuen
- ...
- 1 Ahau, 2 Imix (ciclo reinicia)

**Total: 20 × 13 = 260 dias únicos** antes de repetir.

### 2.2 20 Trecenas (Nawales)

| # | Nawal | Significado | Símbolo |
|---|-------|-------------|---------|
| 1 | Imix | Semente/Criação | Crocodilo |
| 2 | Ik | Vento/Comunicação | Vento |
| 3 | Akbal | Noite/Intuição | Casa |
| 4 | Kan | Semente/Plantação | Rede/Serpente |
| 5 | Chicchan | Serpente/Vitalidade | Serpente |
| 6 | Cimi | Morte/Transformação | Caveira |
| 7 | Manik | Cervo/Trabalho | Cervo |
| 8 | Lamat | Rato/Armonia | Rato |
| 9 | Muluc | Água/Lua | Água |
| 10 | Oc | Cão/Lealdade | Cão |
| 11 | Chuen | Macaco/Arte | Macaco |
| 12 | Eb | Caminho/Humano | Caminho |
| 13 | Ben | Junco/Autoridade | Junco |
| 14 | Ix | Jaguar/Sabedoria | Jaguar |
| 15 | Men | Águia/Visão | Águia |
| 16 | Cib | Coruja/Percepção | Coruja |
| 17 | Caban | Terremoto/Evolução | Terremoto |
| 18 | Etznab | Espelho/Ordem | Espelho |
| 19 | Cauac | Tempestade/Transformação | Tempestade |
| 20 | Ahau | Sol/Iluminação | Sol |

### 2.3 Algoritmo de Cálculo

**Algoritmo determinístico** (não requer astronomia):
- Data de nascimento → dia absoluto desde referência (e.g. 4 Ahau 8 Cumku = 11 Aug 3114 BCE)
- Calcular (dias_desde_referencia) % 260
- Resultado: 1-260 = kin (posição no ciclo)
- Mapear para Trecena + Número: kin = ((dias % 260) // 13) + 1 para número, ((dias % 260) % 20) + 1 para nawal

A matemática é **puramente modular** — pode ser implementada em TypeScript
puro sem dependências.

### 2.4 5 Castes (Famílias Cósmicas)

Cada kin pertence a uma casta (1 das 5):

| Casta | Domínio | Cor | Glifo |
|-------|---------|-----|-------|
| **Semente** (Semilla) | Vida/Origem | Vermelho | Semente |
| **Lua** (Luna) | Nutrição/Emoção | Branco | Lua |
| **Serpente** (Serpiente) | Vitalidade/Instinto | Azul | Serpente |
| **Elo** (Enlace) | Relacionamentos/Arte | Amarelo | Elo |
| **Mão** (Mano) | Manifestação/Ação | Verde (?) | Mão |

A casta é determinada por:
- Casta Solar: kin do dia (sua essência)
- Casta Galáctica: kin 4 dias depois (seu propósito)

A integração dos dois dá o "Perfil Galáctico" pessoal.

### 2.5 4 Portas (Direções Cósmicas)

| Direção | Cor | Função |
|----------|-----|--------|
| **Akbal** (Noite) | Vermelho | Intuição, passado |
| **Cauac** (Tempestade) | Branco | Cura, presente |
| **Ben** (Junco) | Azul | Propósito, futuro |
| **Etznab** (Espelho) | Amarelo | Ordem, eternidade |

Cada kin tem uma "porta" baseado no Trecena natal. As 4 portas dividem
20 nawales em 4 grupos de 5.

---

## 3. Dreamspell (1987) — A Reinterpretação Moderna

### 3.1 Jose Arguelles e o Shipibo-Conibo

Em 1987, Jose Arguelles (1937-2012) publicou "The Mayan Factor" onde
apresentou o **Dreamspell** (Calendário de 13 Luas / 28 dias). Sua
reinterpretação incluiu:

- **Dreamspell = 13 luas × 28 dias = 364 dias** (quase ano solar)
- 260 kin = calendário sagrado
- Dia "Fora do Tempo" (25 julho) = ano novo galáctico
- Foco em "Telektonon" (canoa cósmica) e "Pacote Telepatia"
- **Heptágono das 7 gerações** (1992-2012)

### 3.2 Dreamspell vs Tzolkin Clássico

| Aspecto | Tzolkin Clássico | Dreamspell (Arguelles) |
|---------|------------------|------------------------|
| **Origem** | Maia (~3000 anos) | Síntese moderna (1987) |
| **Math** | 13 × 20 = 260 kin | Mesmo, com 13 luas extras |
| **Interpretação** | Calendário ritual | Consciência planetária |
| **5 Castas** | Famílias cósmicas | Famílias cósmicas (mesmo) |
| **Telektonon** | Não tem | Sim (símbolo de 7 raças) |
| **Pacote Telepatia** | Não tem | Sim (onda azul-galáctica) |
| **Linguagem** | Maia K'iche' | Inglês/Espanhol moderno |
| **IP** | Domínio público | "Dreamspell" trademark? Não registrado |

### 3.3 Aceitação e Crítica

**Aceitação:**
- New Age movement (anos 1990-2000s)
- Rainbow Bridge (2012 hype, posteriormente "quieto")
- Cursos de "Noosfera" e "Arte Planetária"
- Tzolkin clássico tem aceitação acadêmica (Mayanistas, antropólogos)

**Crítica:**
- Arguelles era poeta/líder espiritual, não antropólogo
- Dreamspell mistura tradições maias, astecas, e neoplatônicas
- 2012 como "fim do mundo" foi marketing, não tradição maia real
- Tzolkin clássico não tem os elementos que Dreamspell adicionou

**Posição Akasha:** Tzolkin clássico (260 kin) é a base, Dreamspell é
**layer opcional** (Fase 8 opt-in).

---

## 4. Comparação com Sistemas Anteriores

### 4.1 Tabela Comparativa

| Sistema | # dias | Estrutura | Origem | IP |
|---------|--------|-----------|--------|-----|
| **Tzolkin (Maia)** | 260 | 20×13 kin | Mesoamérica ~3000 anos | Domínio público |
| **Bazi (Chinês)** | 60+ | 10 stems × 12 branches | Taoista ~3000 anos | Domínio público |
| **Jyotish (Védico)** | 120+ | 9 grahas × Dashas | Hindu ~3000 anos | Domínio público |
| **Védica (R-018)** | ano | 12 rashi × nakshatra | Védico | Domínio público |
| **HD (Ra Uru Hu)** | n/a | 64 gates + 9 centers | Ra 1987 | Trademark registrada |
| **Gene Keys (Rudd)** | n/a | 64×3 tríade | Rudd 2009 | Trademark registrada |
| **Dreamspell (Arguelles)** | 260+13 | 13 luas × 28 dias | Arguelles 1987 | Marginal IP |
| **4 Temperamentos** | n/a | 4 estados | Grécia 400 BCE | Domínio público |

### 4.2 Isomorfismos

**Tzolkin ↔ I Ching:**
- 64 hexagramas × 4 estágios = 256 + 4 = 260 (quase!)
- Tzolkin tem 260 kin, 64 I Ching tem 64 hexagramas
- Relação: 4 kin ≈ 1 hexagrama (260/64 ≈ 4.06)
- **Insight:** 260 kin podem ser mapeados a 64 hexagramas (cada hexagrama tem ~4 kins)

**Tzolkin ↔ Enneagrama:**
- 9 types (Enneagrama) vs 20 nawales (Tzolkin)
- 3 tríades (Enneagrama) vs 4 direções (Tzolkin)
- **Insight:** 9 types podem ser reduzidos a 4 grupos de 2-3 (1:1 com direções)

**Tzolkin ↔ Astrologia Ocidental:**
- 12 signos (ocidental) vs 20 nawales (Tzolkin)
- 10 planetas vs 13 números
- 4 elementos vs 5 castas
- **Insight:** Relação 12:20 e 10:13 — proporções complementares

### 4.3 Akasha tem todos os 4 sistemas de tipos?

| Sistema | # tipos | Estado Akasha |
|---------|---------|---------------|
| 4 Temperamentos (Gregos) | 4 | ✅ F-220 (Pilar 3 sub-framework) |
| 5 Pilares (Akasha próprio) | 5 | ✅ core |
| 7 chakras (Hindu) | 7 | ✅ Pilar 3 |
| 9 Types (Enneagrama) | 9 | ✅ R-016 (Pilar 3 sub-framework) |
| 9 Grahas (Jyotish) | 9 | ✅ F-210 (Pilar 2 dimensão temporal) |
| 12 Signos (Ocidental) | 12 | ✅ Pilar 2 |
| 16 Types (MBTI) | 16 | ❌ não adotado (baixa validade) |
| 20 Nawales (Maia) | 20 | ❌ não adotado (ainda) |
| 27 Nakshatras (Jyotish) | 27 | ❌ Pilar 6 opt-in (R-018) |
| 64 Gates (HD) | 64 | ✅ Pilar 2 (R-014) |
| 64 Hexagramas (I Ching) | 64 | ✅ Pilar 5 |
| 60 Jiazi (Bazi) | 60 | ❌ Pilar 5 opt-in (R-020) |

**Akasha tem 8+ frameworks.** Adicionar 20 Nawales seria **redundante** com
20 nawales não sendo parte de nenhum Pilar Akasha atual.

---

## 5. IP Analysis: O que Akasha pode usar

### 5.1 Status de IP

| Elemento | IP Status | Akasha Usage |
|----------|-----------|---------------|
| 260 kin (Tzolkin) | Domínio público (maia milenar) | ✅ usar livremente |
| 20 Nawales + significados | Domínio público (antropologia) | ✅ usar |
| 5 Castas | Domínio público | ✅ usar |
| 4 Portas / Direções | Domínio público | ✅ usar |
| Tzolkin algoritmo (260 dias) | Conhecimento público | ✅ implementar |
| Dreamspell (Arguelles) | Marginal — não é trademark registrada | ⚠️ usar com cuidado |
| "Telektonon" | Conceito, sem IP | ✅ usar com citação |
| "Dreamspell" nome | Genérico, sem IP | ✅ usar como categoria |
| Jose Arguelles (1940-2012) | Não claimar revelação; citar fonte | ✅ documentar |
| 13 Luas / 28 dias (Dreamspell) | Conceito, sem IP | ✅ usar opt-in |
| Mayab' (calendário maia) | Domínio público | ✅ usar |
| Trecenas (20) | Domínio público | ✅ usar |
| Calendar Round (365 + 260) | Domínio público | ✅ usar |

### 5.2 Conclusão: Tzolkin clássico é IP-clean

O **Tzolkin clássico** (260 kin, 20 nawales, 13 números, 5 castas) é
domínio público milenar de origem maia. Akasha pode usar livremente.

**Dreamspell** (1987) é marginal — não é trademark registrada, mas é
**reivindicada** por José Arguelles e seus seguidores. Usar com citação
adequada (R-022 §2.1).

---

## 6. Decisões para Akasha

### 6.1 D1 — Akasha adiciona 20 Nawales como framework?

**Decisão:** Akasha **adiciona 20 Nawales** como Pilar 6 (Insight Complementar)
opt-in, NÃO Pilar 1-5.

**Razão primária:** 20 Nawales é redundante com 12 signos ocidentais (Pilar 2)
e 64 hexagramas (Pilar 5). Adicionar seria duplicação.
**Razão secundária:** 20 Nawales é IP-clean, mas Akasha tem prioridades maiores
(Pilar 5 ainda sem implementação completa).
**Razão terciária:** Usuário opt-in (não sobrecarregar Pilar 1-5).

**Implementação (F-240+):** `packages/core-tzolkin/src/kin.ts` com função
`kinFromDate(birthDate): { kin, nawal, number, casta, porta }`.

### 6.2 D2 — Dreamspell como framework secundário opt-in?

**Decisão:** Akasha **NÃO** adota Dreamspell de Arguelles.

**Razão primária:** R-022 §2.1 — "tradições vivas merecem respeito, não
feature-zação". Dreamspell é uma síntese moderna de 1987, não tradição
maia milenar.
**Razão secundária:** Tzolkin clássico é mais respeitado academicamente.
**Razão terciária:** Foco em tradição, não modernidade.

**Alternativa:** Dreamspell pode ser Pilar 6.5 opt-in (cruzamento) para
usuários que preferem interpretação moderna. Mas é **baixa prioridade**.

### 6.3 D3 — 5 Castas como Pilar 3 sub-framework?

**Decisão:** Akasha **adiciona 5 Castas** como Pilar 3 (Tantra) sub-framework opt-in,
junto com 4 Temperamentos (R-019) e 7 chakras (Hindu).

**Razão primária:** 5 Castas complementam 7 chakras (isomorfismo).
**Razão secundária:** Oferece framework multi-cultural para Pilar 3.

**Mapeamento 5 Castas ↔ 4 Elementos gregos ↔ 7 chakras:**
- Semente (Vida) ↔ Madeira ↔ Anahata
- Lua (Emoção) ↔ Água ↔ Svadhisthana
- Serpente (Vitalidade) ↔ Fogo ↔ Manipura
- Elo (Arte) ↔ Ar ↔ Vishuddha
- Mão (Ação) ↔ Terra ↔ Muladhara

**Implementação (F-241):** `packages/core-tantra/src/castas.ts` com
mapping 5 Castas ↔ 4 Camadas Akasha.

### 6.4 D4 — Isomorfismo Tzolkin ↔ I Ching

**Decisão:** Akasha **explora isomorfismo** 260 kin ↔ 64 hexagramas em
framework opt-in (Fase 8).

**Razão primária:** Relação 260/64 ≈ 4.06 — cada hexagrama corresponde a ~4 kins.
**Razão secundária:** Pilar 5 I Ching pode incluir leitura Tzolkin como
"kin do dia em hexagrama".

**Implementação (F-242):** `packages/core-iching/src/kin-hexagram-mapping.ts`
com função `kinToHexagram(kin): Hexagram`.

### 6.5 D5 — Akasha respeita tradições maias OU sintetiza?

**Decisão:** Akasha **respeita** tradições maias, cita explicitamente, **NÃO**
sintetiza (R-022 §2.1).

**Razão primária:** Tradição maia milenar merece respeito, não apropriação.
**Razão secundária:** Expertise antropológica maia não está disponível no time.
**Razão terciária:** Tzolkin clássico é IP-clean, então não precisa "re-inventar".

**Implementação:**
- Cita "Tzolkin (calendário maia milenar)" explicitamente
- Cita "Calendário Sagrado de 260 kin (Mesoamérica, ~3000 anos)"
- Cita Jose Arguelles (1987) para Dreamspell, com disclaimers
- Documenta em AGENTS.md: "Akasha NÃO substitui Tzolkin"

---

## 7. Comparação Tzolkin vs Akasha

| Aspecto | Tzolkin (Maia) | Akasha |
|---------|----------------|--------|
| **# unidades** | 260 kin | 5 Pilares × 4 Camadas = 20 (similar!) |
| **# signos** | 20 nawales | 12 ocidentais + 5 Pilares = 17 |
| **Camadas** | 1 (sempre 260 dias) | 4 (D/S/Z/V) |
| **Determinismo** | 100% algorítmico (mod 260) | 80% algorítmico |
| **Cultura** | Maia (Mesoamérica) | Síntese multi-cultural |
| **Linguagem** | K'iche' (K'iche'an) | PT-BR |
| **IP** | Domínio público milenar | Próprio |
| **Output** | 1 kin (número + nawal + casta) | Mandala + Mandato + Diálogo |
| **Tradição** | Milenar viva (~3000 anos) | Síntese moderna (2026) |

### 7.1 Akasha combina: Tzolkin + outros 9 frameworks

```
AKASHA 2026
├── 5 Pilares (fontes) — Akasha próprio
├── 4 Camadas (D/S/Z/V)
├── 4 Pilares Bazi (R-020 opt-in)
├── 9 Levels (R-016 Enneagrama)
├── 3 Tríades (R-016 Head/Heart/Gut)
├── 4 Temperamentos (R-019 Gregos)
├── 5 Castas (R-021 maia) [NOVO]
├── Tríade Sombra/Dom/Graça (F-209)
├── 88° Solar Arc (F-208)
└── Vimshottari Dasha (F-210)
```

---

## 8. Lições para Akasha

### 8.1 L1 — Tzolkin é 100% algorítmico

Tzolkin é **ainda mais algorítmico** que Bazi:
- Sem astronomia (apenas mod 260)
- 5 castas derivadas do kin + kin+4
- 4 portas derivadas do nawal

**Aplicação:** F-240+ implementam em TypeScript sem dependências.

### 8.2 L2 — 5 Castas complementam 4 Temperamentos + 7 chakras

5 Castas maia (Semente/Lua/Serpente/Elo/Mão) são isomórficas a 4 Temperamentos
gregos (Sanguíneo/Colérico/Melancólico/Fleumático) e 7 chakras hindus.
Akasha tem **3 frameworks complementares** no Pilar 3 — usuário escolhe.

**Aplicação:** Pilar 3 com 7 chakras (default), 4 Temperamentos (opt-in R-019),
5 Castas (opt-in R-021 D3).

### 8.3 L3 — Dreamspell vs Tzolkin clássico

Dreamspell (Arguelles 1987) é **reivindicação**, não tradição maia.
**Akasha prefere Tzolkin clássico** (260 kin + 20 nawales + 5 castas).

**Aplicação:** F-240+ usam Tzolkin clássico, não Dreamspell.

### 8.4 L4 — Isomorfismo 260 ↔ 64

260 kin ÷ 64 hexagramas = 4.06 — não é 1:1, mas é mapeável.
Cada hexagrama cobre ~4 kins em sequência.

**Aplicação:** Pilar 5 I Ching pode incluir leitura Tzolkin como "kin do dia
em hexagrama" (F-242).

### 8.5 L5 — IP-clean (Tzolkin clássico)

Tzolkin clássico (260 kin + 20 nawales + 5 castas + 4 portas) é **domínio
público milenar** de origem maia. Akasha pode usar livremente.

**Aplicação:** F-240+ implementam sem licensing concerns.

### 8.6 L6 — Akasha é multi-cultural, não maia-centric

Akasha tem 8+ frameworks de 4+ tradições (Cabala, Tantra, Odu, Astrologia,
I Ching, Gregos, Jyotish, Bazi, Maia). Tzolkin é **mais um** framework,
não o framework central.

**Aplicação:** Pilar 6 opt-in, não Pilar 1-5. Akasha continua "ocidental +
multi-cultural", não "maia-cêntrico".

---

## 9. Próximos passos

### 9.1 Implementação (Fase 6)

- [ ] **F-240** — `packages/core-tzolkin/src/kin.ts` — kinFromDate + Tzolkin
- [ ] **F-241** — `packages/core-tantra/src/castas.ts` — 5 Castas maia + mapping
- [ ] **F-242** — `packages/core-iching/src/kin-hexagram-mapping.ts` — 260↔64
- [ ] **F-243** — `packages/core-tzolkin/src/casta-porta.ts` — 4 Portas + 5 Castas

### 9.2 Pesquisa adicional (Fase 8)

- [ ] **R-022** — Validação empírica dos 9 frameworks
- [ ] **R-023** — Sufi Astrology (Bohra + Ismaili traditions)
- [ ] **R-024** — Astrologia Helênica (Ptolomeu, Vettius Valens)

### 9.3 IP due diligence

- [ ] Citar explicitamente Tzolkin como "calendário maia milenar"
- [ ] Citar Jose Arguelles (1987) para Dreamspell, com disclaimers
- [ ] NÃO trademark "Akasha Tzolkin" (deixar ser framework opt-in)
- [ ] Trademark defensiva: "Akasha Calendar Integration" se aplicável

---

## 10. Apêndice — Decisões de pesquisa (COT)

### D1 — Tzolkin como Pilar 6 opt-in (não Pilar 1-5)

**Decisão:** Tzolkin 260 kin como Pilar 6 (Insight Complementar) opt-in.
**Razão primária:** 5 Pilares são fontes (Cabala/Tantra/Odu/Astrologia/I Ching).
Adicionar 6ª fonte é redundante.
**Razão secundária:** 260 kin é isomórfico com 64 hexagramas (Pilar 5) — natural fit
como Pilar 6 (insight complementar), não Pilar 5.
**Razão terciária:** Tzolkin é framework pedagógico poderoso, não fonte primária.

### D2 — Dreamspell (Arguelles) NÃO adotado

**Decisão:** Akasha usa Tzolkin clássico (260 kin), NÃO Dreamspell de Arguelles.

**Razão primária:** R-022 §2.1 — tradições vivas merecem respeito, não feature-zação.
Dreamspell é síntese moderna de 1987, não tradição maia milenar.
**Razão secundária:** Tzolkin clássico é academicamente respeitado (mayanistas,
antropólogos), Dreamspell é marginal.
**Razão terciária:** Dreamspell adiciona elementos sem base etnográfica sólida
(Telektonon, Pacote Telepatia, Heptágono).

**Alternativa:** Usuários que preferem Dreamspell podem usar fora de Akasha
(apps externos, livros). Akasha foca em Tzolkin clássico.

### D3 — 5 Castas como Pilar 3 sub-framework

**Decisão:** 5 Castas maia (Semente/Lua/Serpente/Elo/Mão) em Pilar 3.

**Razão primária:** Pilar 3 já tem 4 Temperamentos (R-019) + 7 chakras. Adicionar
5 Castas é **complementação** (3 frameworks de personalidade).
**Razão secundária:** Mapping isomórfico (5 Castas ↔ 5 elementos ↔ 4 Temperamentos
↔ 7 chakras) é viável.
**Razão terciária:** Cita tradição maia (R-022 §2.1).

### D4 — 260/64 isomorfismo

**Decisão:** Explorar 260 kin ↔ 64 hexagramas em Pilar 5 opt-in.
**Razão primária:** Pilar 5 I Ching pode incluir leitura Tzolkin como "kin do dia".
**Razão secundária:** Adiciona dimensão ao Pilar 5 (não substitui).

### D5 — Akasha respeita tradições maias

**Decisão:** Respeita sem sintetizar.

**Razão primária:** R-022 §2.1 — tradições vivas merecem respeito.
**Razão secundária:** Expertise antropológica maia não está disponível no time.
**Razão terciária:** Tzolkin clássico é IP-clean, então não precisa "re-inventar".

---

## 11. Fontes e referências

### 11.1 Fontes primárias (históricas)

- **Mayan Codices**: Madrid, Dresden, Paris (textos maias clássicos)
- **Popol Vuh** (Livro do Conselho Maia) — cosmogonia e heróis culturais
- **Calendário Maia**: Tzolkin + Haab + Calendar Round (séc. ~100 BCE)
- **Diego de Landa** (1566): "Relación de las cosas de Yucatán" — documentou
  tradições maias (incluindo Tzolkin) após conquista

### 11.2 Fontes secundárias modernas

- **RQ-010**: `.autonomous/research/systems/tzolkin.md` (374 linhas, 12 fontes)
- **Wikipedia**: "Maya calendar", "Tzolkin", "Dreamspell"
- **Jose Arguelles** (1987): "The Mayan Factor" (livro, Modern Times)
- **Kenneth Johnson** (2007): "Jaguar Wisdom" (livro, Tzolkin prático)

### 11.3 Fontes comparativas

- R-014: `.autonomous/research/synthesis/hd-reverse-engineering.md`
- R-015: `.autonomous/research/synthesis/gk-reverse-engineering.md`
- R-016: `.autonomous/research/synthesis/enneagram-reverse-engineering.md`
- R-018: `.autonomous/research/synthesis/jyotish-reverse-engineering.md`
- R-019: `.autonomous/research/synthesis/greek-temperaments.md`
- R-020: `.autonomous/research/synthesis/bazi-reverse-engineering.md`

### 11.4 Fontes IP

- Tzolkin: domínio público (maia milenar, sem IP)
- 20 Nawales: conhecimento antropológico público
- 5 Castas: domínio público
- Dreamspell: sem trademark registrada
- "Tzolkin" nome: comum (não trademark)
- "Mayan Astrology" termo: genérico, domínio público

---

**Conclusão:** R-021 demonstra que Tzolkin é o **sistema de tipos mais elegante
matematicamente** (260 = 13×20) e o **mais IP-clean** dos sistemas modernos
(depois de Bazi). Akasha pode usar 20 nawales + 5 castas + 4 portas
como Pilar 6 opt-in (F-240..F-243) sem nenhum risco legal. A maior lição:
**tradições vivas merecem respeito, não feature-zação** — Tzolkin é
tradição maia de 3.000 anos, não "Tzolkin Akasha" (R-022 §2.1). Akasha
herda a matemática, cita as fontes, e respeita a tradição.
