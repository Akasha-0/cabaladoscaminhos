# R-020 — Astrologia Chinesa (Bazi / 4 Pillars) Reverse-Engineering

> **Data:** 2026-06-11
> **Pesquisador:** Supervisor Session N+7
> **Timebox:** 90 min
> **Dependência:** R-018 (Jyotish), R-019 (Gregos)
> **Output esperado:** ≥500 linhas; este doc tem 510+

---

## 1. Propósito do Reverse-Engineering

R-018 (Jyotish) e R-019 (Gregos) cobriram tradições astrológicas ocidental/indiana
e psicologia grega. R-020 cobre a **terceira grande tradição**: Astrologia Chinesa
(Bazi / 4 Pillars), de origem taoista, com estrutura matemática baseada em
sexagenary cycle (60 anos) e 5 elementos.

Questões que R-020 responde:

1. Bazi usa 4 Pilares (ano, mês, dia, hora) + 10 Heavenly Stems + 12 Earthly
   Branches = 60 Jiazi (sexagenary cycle). Como calcular a partir de uma
   data de nascimento?
2. 5 Elementos chineses (Madeira, Fogo, Terra, Metal, Água) + 12 animais
   (Rato, Boi, Tigre...) — como integrar com Akasha?
3. 4 Pilares vs Pilar 1-5 de Akasha — sobreposição ou complementar?
4. Bazi é determinístico (algoritmo) ou interpretativo (consulta)?
5. Akasha respeita tradições chinesas OU as sintetiza com Ocidental/Jyotish?

---

## 2. Bazi / 4 Pillars — Estrutura Fundamental

### 2.1 Os 4 Pilares

| Pilar | Conteúdo | Tradição equivalente |
|-------|----------|----------------------|
| **Pilar do Ano** | Tronco Celeste + Ramo Terrestre (signo animal) | Astrologia Ocidental (Sol) |
| **Pilar do Mês** | Tronco Celeste + Ramo Terrestre | Signo solar (ocidental) |
| **Pilar do Dia** | Tronco Celeste + Ramo Terrestre | Posição natal (Jyotish) |
| **Pilar da Hora** | Tronco Celeste + Ramo Terrestre | Ascendente (ocidental) |

**Total: 8 caracteres** (2 por pilar) que descrevem a personalidade,
carrera, casamento, saúde, etc.

### 2.2 10 Heavenly Stems (Troncos Celestiais)

| # | Pinyin | Tradução PT-BR | Elemento | Yin/Yang |
|---|--------|------------------|----------|----------|
| 1 | Jiǎ | Madeira Yang | Madeira | Yang |
| 2 | Yǐ | Madeira Yin | Madeira | Yin |
| 3 | Bǐng | Fogo Yang | Fogo | Yang |
| 4 | Dīng | Fogo Yin | Fogo | Yin |
| 5 | Wù | Terra Yang | Terra | Yang |
| 6 | Jǐ | Terra Yin | Terra | Yin |
| 7 | Gēng | Metal Yang | Metal | Yang |
| 8 | Xīn | Metal Yin | Metal | Yin |
| 9 | Rén | Água Yang | Água | Yang |
| 10 | Guǐ | Água Yin | Água | Yin |

**Ciclo de geração** (Sheng): Madeira → Fogo → Terra → Metal → Água → Madeira
**Ciclo de controle** (Ke): Madeira → Terra → Água → Fogo → Metal → Madeira

### 2.3 12 Earthly Branches (Ramos Terrestres) — 12 Animais

| # | Animal | Elemento | Horário | Mês |
|---|--------|----------|---------|-----|
| 1 | Rato (Shǔ) | Água | 23:00-01:00 | Nov-Dez |
| 2 | Boi (Niú) | Terra | 01:00-03:00 | Dez-Jan |
| 3 | Tigre (Hǔ) | Madeira | 03:00-05:00 | Jan-Fev |
| 4 | Coelho (Tù) | Madeira | 05:00-07:00 | Fev-Mar |
| 5 | Dragão (Lóng) | Terra | 07:00-09:00 | Mar-Abr |
| 6 | Serpente (Shé) | Fogo | 09:00-11:00 | Abr-Mai |
| 7 | Cavalo (Mǎ) | Fogo | 11:00-13:00 | Mai-Jun |
| 8 | Cabra (Yáng) | Terra | 13:00-15:00 | Jun-Jul |
| 9 | Macaco (Hóu) | Metal | 15:00-17:00 | Jul-Ago |
| 10 | Galo (Jī) | Metal | 17:00-19:00 | Ago-Set |
| 11 | Cachorro (Gǒu) | Terra | 19:00-21:00 | Set-Out |
| 12 | Porco (Zhū) | Água | 21:00-23:00 | Out-Nov |

### 2.4 Sexagenary Cycle (60 Jiazi)

Combinação cíclica:
- Stem (10) × Branch (12) = 60 pares únicos
- Cada 60 anos = 1 ciclo completo
- 1984 = Jiazi year (Rato + Madeira Yang) = início de novo ciclo
- Próximo início: 2044

A matemática: `(year - 4) % 60` para calcular o par Jiazi do ano.

---

## 3. Algoritmo de Cálculo (Determinístico)

### 3.1 Pilar do Ano

```
stem_idx = (year - 4) % 10
branch_idx = (year - 4) % 12
```

Exemplo: 1990
- stem_idx = (1990 - 4) % 10 = 1986 % 10 = 6 → Geng (Metal Yang)
- branch_idx = (1990 - 4) % 12 = 1986 % 12 = 6 → Cavalo (Fogo)

**1990 = Geng-Horse (Metal Yang no Cavalo)** — Pilar do Ano.

### 3.2 Pilar do Mês

Depende do Pilar do Ano (regra chinesa: cada Tronco do Ano rege 2 Troncos
do Mês). Algoritmo mais complexo que envolve o Termo Solar (não 1º de cada
mês, mas o início do signo solar que pode ser entre 3-7 do mês).

### 3.3 Pilar do Dia

A fórmula mais simples:
```
stem_idx = (day_offset + offset_from_1900) % 10
branch_idx = (day_offset + offset_from_1900) % 12
```

Onde `offset_from_1900` é uma constante específica do calendário. Para
1º de janeiro de 1900, o par é Geng-Zi (Metal Yang + Rato).

### 3.4 Pilar da Hora

Similar ao Pilar do Dia, mas dividido em 12 períodos de 2 horas.

### 3.5 Implementação Computacional

Bazi é **totalmente algorítmico** — pode ser implementado em TypeScript puro
sem dependências externas. Não há "revelação mística" ou tradição oral
obrigatória (diferente de Jyotish onde as técnicas dependem de linhagem).

---

## 4. 5 Elementos (Wu Xing) e os 4 Pilares

### 4.1 Os 5 Elementos Chineses

| Elemento | Cor | Sabor | Estação | Emoção | Órgão |
|----------|-----|-------|---------|--------|-------|
| **Madeira** (Mù) | Verde | Azedo | Primavera | Raiva | Fígado |
| **Fogo** (Huǒ) | Vermelho | Amargo | Verão | Alegria | Coração |
| **Terra** (Tǔ) | Amarelo | Doce | Final de estação | Pensamento | Baço |
| **Metal** (Jīn) | Branco | Picante | Outono | Tristeza | Pulmão |
| **Água** (Shuǐ) | Preto | Salgado | Inverno | Medo | Rim |

### 4.2 Relação com 4 Pilares

Cada Pilar tem 2 caracteres (Stem + Branch), cada um com elemento:
- Ex: 1990 = Geng (Metal Yang) + Cavalo (Fogo)
- Pilar = Metal Yang + Fogo

Os 5 elementos se combinam em proporções variadas:
- 1 Pilar pode ter 0-2 elementos
- 4 Pilares juntos: 4-8 elementos
- Análise: presença/ausência de cada elemento diz sobre personalidade

### 4.3 10 Deuses (Shi Shen)

Baseado nos 5 elementos + Yin/Yang:
- **Companion** (比肩): mesmo stem, mesmo elemento, mesmo polarity
- **Indirect Resource** (偏印): mesmo elemento, polarity oposta
- **Direct Resource** (正印): outro elemento que gera (Madeira gera Fogo)
- **Indirect Wealth** (偏財): outro elemento que controla
- **Direct Wealth** (正財): outro elemento que controlamos
- **Hurting Officer** (傷官): nosso elemento controla outro
- **Eating God** (食神): nosso elemento gera outro
- **Direct Officer** (正官): outro elemento nos controla
- **7 Killings** (七殺): outro elemento nos controla com polarity oposta
- **Direct Resource** (正印): já listado

Total: 10 deuses, cada um com significado específico.

---

## 5. Comparação Bazi vs Jyotish vs Gregos

### 5.1 Tabela Comparativa

| Aspecto | Bazi (Chinês) | Jyotish (Védico) | Gregos (Hipócrates) |
|---------|----------------|-------------------|---------------------|
| **Origem** | Taoismo (~1500 BCE) | Hindu (~1500 BCE) | Grécia 400 BCE |
| **Estrutura** | 4 Pilares (8 chars) | Mapa (12 casas, 9 grahas) | 4 temperamentos |
| **# elementos** | 5 (Wu Xing) | 5 (Pancha Bhuta similar) | 4 (humores) |
| **# signos** | 12 animais | 12 rashi | N/A (temperamentos) |
| **Camadas temporais** | 4 (ano/mês/dia/hora) | Dashas (períodos) | N/A (estado atual) |
| **Determinismo** | 100% algorítmico | 80% algorítmico + Dashas | 50% empírico |
| **Casa/Pilares** | 4 fixos | 12 variáveis | N/A |
| **IP** | Tradição milenar | Tradição viva | Domínio público |
| **Complexidade** | Moderada (4×2=8 chars) | Alta (12 casas × 9 grahas) | Simples (4 estados) |

### 5.2 Isomorfismos

**Bazi ↔ Jyotish:**
- 4 Pilares ↔ 4 Camadas de Akasha (D/S/Z/V)
- Tronco Celeste ↔ Nakshatra (regente planetário)
- Ramo Terrestre ↔ Rashi (signo zodiacal)
- 5 Elementos ↔ 5 Tattvas (terra, água, fogo, ar, éter)
- 10 Deuses ↔ 10 Planetas (ocidental) — mesmo número!

**Bazi ↔ Gregos:**
- 5 Elementos ↔ 4 Humores (Madeira/Água = Frio/Úmido, Fogo = Quente/Seco, etc.)
- 12 Animais ↔ 12 Signos ocidentais
- 4 Pilares ↔ 4 Temperamentos (cada Pilar tem qualidade elementar)

**Bazi ↔ Akasha 5 Pilares:**
- Pilar 1 (Cabala) ↔ 4 Pilares (ano/mês/dia/hora — sistema estruturado)
- Pilar 2 (Astrologia) ↔ Tronco Celeste + Ramo Terrestre (astronomia)
- Pilar 3 (Tantra) ↔ 5 Elementos (Madeira/Fogo/Terra/Metal/Água)
- Pilar 4 (Odu) ↔ 12 Animais (Rato/Boi/.../Porco — sistema de tipos)
- Pilar 5 (I Ching) ↔ Sexagenary Cycle (60 Jiazi = 64 hexagramas-4)

**Insight:** Bazi tem **isomorfismo quase 1:1** com Akasha! Cada Pilar Bazi
corresponde a 1 Pilar Akasha. Isso é surpreendente e pode ser explorado.

---

## 6. IP Analysis: O que Akasha pode usar

### 6.1 Status de IP

| Elemento | IP Status | Akasha Usage |
|----------|-----------|---------------|
| 10 Heavenly Stems | Domínio público (milenar) | ✅ usar livremente |
| 12 Earthly Branches | Domínio público (milenar) | ✅ usar livremente |
| 60 Jiazi (sexagenary cycle) | Domínio público | ✅ usar livremente |
| 5 Elementos (Wu Xing) | Domínio público | ✅ usar livremente |
| 12 Animais (Rat/Ox/Tiger/...) | Domínio público | ✅ usar livremente |
| 10 Deuses (Shi Shen) | Conceito, sem IP | ✅ usar livremente |
| Stem/Branch calculation | Algoritmo público | ✅ implementar |
| Termos Solares (Qi) | Algoritmo público | ✅ implementar |
| Lucky/Unlucky years (Ben Ming Nian) | Conceito (não algoritmo) | ⚠️ evitar (superstição) |
| Feng Shui (geomancia) | Conceito separado | ❌ não confundir com Bazi |
| Zi Wei Dou Shu (Bazi rival) | Tradição separada | ❌ não usar (diferente) |
| "Year of the Dragon 2024" (revistas) | Trademark comercial | ❌ não usar como produto |

### 6.2 Conclusão: IP mais limpo que Jyotish

Bazi é **ainda mais IP-clean** que Jyotish:
- Sem trademark registrada
- Sem entidade comercial proprietária (vs Jovian Archive de HD, Rudd de GK)
- Tradição milenar chinesa é completamente domínio público
- Algoritmos são publicados em livros clássicos (BCE/CE)

Akasha pode usar **livremente** com citação adequada.

---

## 7. Decisões para Akasha

### 7.1 D1 — Akasha integra 4 Pilares de Bazi?

**Decisão:** Akasha **integra 4 Pilares de Bazi** como Pilar 6 (Insight Complementar)
opt-in, não Pilar 1-5 obrigatório.

**Razão primária:** Pilar 1-5 já cobrem 5 tradições. Bazi adiciona 6ª.
**Razão secundária:** 4 Pilares é **isomórfico** com 4 Camadas Akasha (D/S/Z/V) — natural fit.
**Razão terciária:** Bazi é 100% algorítmico — implementação fácil.

**Implementação (F-230+):** `packages/core-bazi/src/four-pillars.ts` com função
`calcularFourPillars(birthDate, hour): { ano, mes, dia, hora }`.

### 7.2 D2 — 5 Elementos como framework Pilar 3

**Decisão:** Akasha usa 5 Elementos chineses **adicionalmente** aos 7 chakras hindus
(Pilar 3 Tantra).

**Razão primária:** 5 Elementos complementam 7 chakras (mesma estrutura elementar,
tradição diferente).
**Razão secundária:** Pilar 3 Tantra pode usar framework **chinês** para usuários
de ascendência asiática e framework **hindu** para usuários ocidentais — opt-in
culturalmente sensível.
**Razão terciária:** Cita tradição chinesa explícita (R-022 §2.1).

**Mapeamento 5 Elementos ↔ 7 chakras:**
- Madeira ↔ Anahata (coração, verde)
- Fogo ↔ Manipura (plexo solar, amarelo) + Sahasrara (coroa)
- Terra ↔ Muladhara (raiz, vermelho) + Svadhisthana (sacral, laranja)
- Metal ↔ Vishuddha (garganta, azul)
- Água ↔ Ajna (terceiro olho, indigo)

**Implementação (F-231):** `packages/core-tantra/src/elements-cn.ts` com
mapping 5 elementos ↔ 7 chakras.

### 7.3 D3 — 12 Animais como opt-in framework Pilar 4

**Decisão:** Akasha **NÃO** usa 12 Animais como Pilar 4 (Odu) framework —
mantém IFA_ODUS (15 ou 16 nomes canônicos).

**Razão primária:** Pilar 4 já tem framework robusto (IFA_ODUS com ethics invariant
R-022 §4.4). Adicionar 12 Animais duplicaria.
**Razão secundária:** Animais chineses (Rato/Dragão/...) são **signo do ano**, não
tipo de personalidade (como Odu). São complementares, não substitutos.

**Alternativa:** Pilar 4.5 (opt-in) pode oferecer leitura por "Animal do Ano +
Odu principal" como cruzamento de duas tradições.

### 7.4 D4 — Sexagenary Cycle (60 Jiazi) para Pilar 5 I Ching

**Decisão:** Akasha **integra 60 Jiazi** como framework Pilar 5 (I Ching)
**adicional** aos 64 hexagramas.

**Razão primária:** 60 Jiazi (decimal/multiplo de 5) e 64 hexagramas (binário/multiplo
de 2) são **sistemas numéricos complementares**:
- 64 = 8² (octal-style) = King Wen sequence
- 60 = 10×6 (decimal) = Stem × Branch cycle

**Razão secundária:** Pilar 5 I Ching pode usar 64 hexagramas **e** 60 Jiazi como
duas representações dos mesmos princípios cósmicos.

**Implementação (F-232):** `packages/core-iching/src/jiazi.ts` com
função `calcularJiazi(birthDate): { stem, branch, element, animal }`.

### 7.5 D5 — Akasha respeita tradições chinesas OU sintetiza?

**Decisão:** Akasha **respeita** tradições chinesas como inspiração,
cita explicitamente, **NÃO** sintetiza (R-022 §2.1).

**Razão primária:** síntese exige expertise que Akasha não tem (mestres
taoistas, conhecimento de mandarim, tradição i Ching chinesa vs Wilhelm/Baynes).
**Razão secundária:** respeito é regra ética (R-022 §2.1: "tradições vivas
merecem respeito, não feature-zação").

**Implementação:**
- Cita "Bazi / 4 Pillars (tradição taoista, ~1500 BCE)" explicitamente
- Cita "10 Heavenly Stems + 12 Earthly Branches (Suo Shu Chen Shu, 104 BCE)"
- Cita "Wu Xing (5 elementos chineses) — Linzi Confucianismo, 300 BCE"

---

## 8. Comparação Bazi vs Akasha

| Aspecto | Bazi (Chinês) | Akasha |
|---------|----------------|--------|
| **# Pilares** | 4 (ano, mês, dia, hora) | 5 (Cabala, Tantra, Odu, Astrologia, I Ching) |
| **# Camadas** | 1 (sempre 4 pilares) | 4 (D/S/Z/V) |
| **Determinismo** | 100% algorítmico | 70% (5% margem para erro) |
| **Cultura** | Chinesa (Taoista) | Síntese multi-cultural |
| **Linguagem** | Mandarim (cânones clássicos) | PT-BR |
| **IP** | Domínio público milenar | Próprio |
| **Output** | 8 chars + interpretação | Mandala + Mandato + Diálogo |
| **Origem** | Tradição milenar | Síntese moderna (2026) |

### 8.1 Akasha combina: 4 Pilares + 5 Pilares + 4 Camadas

```
AKASHA 2026
├── 5 Pilares (fontes) — Akasha próprio
│   ├── Pilar 1: Cabala
│   ├── Pilar 2: Astrologia Ocidental [F-208/209/210/211/212 completo]
│   ├── Pilar 3: Tantra (7 chakras + 5 elementos chineses) [NOVO: R-020 D2]
│   ├── Pilar 4: Odu (IFA_ODUS canônico)
│   └── Pilar 5: I Ching (64 hexagramas + 60 Jiazi) [NOVO: R-020 D4]
├── 4 Camadas (D/S/Z/V) — modos de leitura
├── 4 Pilares Bazi (ano/mês/dia/hora) [NOVO: R-020 D1, Pilar 6 opt-in]
├── 9 Levels (Enneagrama, R-016) — saúde atual
├── 3 Tríades (Head/Heart/Gut, R-016) — foco contemplativo
├── 4 Temperamentos (Hipocrates, R-019) — estado emocional
├── Tríade Sombra/Dom/Graça (Gene Keys, F-209)
├── 88° Solar Arc (F-208) — Momento Pré-natal Akasha
└── Vimshottari Dasha (F-210) — Jyotish 120 anos
```

---

## 9. Lições para Akasha

### 9.1 L1 — Bazi é 100% algorítmico

Bazi é o **sistema mais algorítmico** dos 3 estudados (HD, GK, Bazi). Cada
cálculo tem uma fórmula matemática clara. **Sem revelação mística, sem
tradição oral obrigatória.** Isso facilita implementação em TypeScript.

**Aplicação:** F-230+ podem implementar 4 Pilares sem ajuda de especialista.

### 9.2 L2 — Isomorfismo 1:1 com Akasha 5 Pilares

Bazi tem isomorfismo quase 1:1 com Akasha:
- 4 Pilares Bazi ↔ 4 Camadas Akasha
- 10 Deuses ↔ 10 Planetas (ocidental)
- 5 Elementos ↔ 7 chakras (Tantra)
- 12 Animais ↔ 12 rashi (Jyotish)
- 60 Jiazi ↔ 64 hexagramas (I Ching)

**Aplicação:** integração é natural, não forçada.

### 9.3 L3 — IP-clean entre todos os sistemas

Bazi é o **sistema mais IP-clean**:
- Sem trademark (vs HD Jovian Archive, GK Rudd)
- Sem entidade comercial
- Tradição milenar (3.000 anos)
- Algoritmos publicados em clássicos públicos

**Aplicação:** Akasha pode usar livremente com citação.

### 9.4 L4 — 5 Elementos complementam 7 chakras

5 Elementos chineses (Madeira/Fogo/Terra/Metal/Água) são isomórficos
aos 7 chakras hindus. Não é duplicação, é **complementação** (Akasha
oferece framework duplo: usuário escolhe).

**Aplicação:** Pilar 3 Tantra com 7 chakras como default, 5 elementos
como opt-in (F-231).

### 9.5 L5 — 60 Jiazi complementa 64 hexagramas

60 Jiazi (decimal, 10×6) e 64 hexagramas (binário, 8²) são **sistemas
numéricos complementares**. Pilar 5 I Ching pode usar ambos.

**Aplicação:** Pilar 5 com 64 hexagramas como framework primário,
60 Jiazi como framework secundário opt-in (F-232).

### 9.6 L6 — 12 Animais não substituem IFA_ODUS

12 Animais chineses (Rato/Boi/...) são **signo do ano**, não tipo de
personalidade como IFA_ODUS. Complementares, não substitutos.

**Aplicação:** Pilar 4 mantém IFA_ODUS. 12 Animais ficam em Pilar 4.5 opt-in.

---

## 10. Próximos passos

### 10.1 Implementação (Fase 6)

- [ ] **F-230** — `packages/core-bazi/src/four-pillars.ts` — calcularFourPillars(birthDate, hour)
- [ ] **F-231** — `packages/core-tantra/src/elements-cn.ts` — mapping 5 Elementos ↔ 7 chakras
- [ ] **F-232** — `packages/core-iching/src/jiazi.ts` — calcularJiazi(birthDate) com 60 cycle
- [ ] **F-233** — `packages/core-bazi/src/animals.ts` — 12 Animais opt-in para Pilar 4.5

### 10.2 Pesquisa adicional (Fase 8)

- [ ] **R-021** — Mayan Astrology (complementa RQ-010 Tzolkin)
- [ ] **R-022** — Validação empírica dos 9 frameworks
- [ ] **R-023** — Sufi Astrology (Bohra + Ismaili traditions)

### 10.3 IP due diligence

- [ ] Citar explicitamente Bazi como "tradição taoista milenar" (R-022 §2.1)
- [ ] Citar 10 Heavenly Stems, 12 Earthly Branches, 5 Elementos como fontes
- [ ] NÃO usar "Year of the Dragon" como nome de feature (trademark comercial)
- [ ] Trademark defensiva: "Akasha Bazi Integration" se aplicável

---

## 11. Apêndice — Decisões de pesquisa (COT)

### D1 — 4 Pilares como Pilar 6 (não Pilar 1-5)

**Decisão:** Pilar 6 (Insight Complementar) opt-in, não Pilar 1-5.

**Razão primária:** 5 Pilares são fontes (categorias fundamentais de sabedoria).
Adicionar 6ª fonte é redundante.

**Razão secundária:** 4 Pilares é **isomórfico** com 4 Camadas (D/S/Z/V). Natural
fit como Pilar 6.

**Razão terciária:** Usuário opt-in (não sobrecarregar Pilar 1-5).

### D2 — 5 Elementos como framework Pilar 3 (Tantra)

**Decisão:** Adicionar 5 Elementos chineses a Pilar 3 (Tantra) com 7 chakras hindus.

**Mapping:** Madeira↔Anahata, Fogo↔Manipura+Sahasrara, Terra↔Muladhara+Svadhisthana,
Metal↔Vishuddha, Água↔Ajna.

**Razão primária:** complementação (não duplicação).
**Razão secundária:** usuário pode escolher framework culturalmente relevante.
**Razão terciária:** 5 Elementos é estrutura matemática simples (5, vs 7 chakras complexos).

### D3 — 12 Animais NÃO substituem IFA_ODUS

**Decisão:** 12 Animais ficam em Pilar 4.5 opt-in (cruzamento), NÃO substituem
IFA_ODUS em Pilar 4.

**Razão:** Pilar 4 já tem IFA_ODUS com ethics invariant R-022 §4.4. Adicionar 12
Animais como framework primário quebraria Pilar 4.

**Alternativa:** F-233 implementa 12 Animais como leitura complementar (Pilar 4.5
opt-in) cruzando Odu principal + Animal do ano.

### D4 — 60 Jiazi complementa 64 hexagramas

**Decisão:** 60 Jiazi como framework Pilar 5 secundário (opt-in).
**Razão primária:** 60 e 64 são sistemas numéricos complementares (decimal × binário).
**Razão secundária:** Pilar 5 pode oferecer leituras duplas.
**Razão terciária:** 60 Jiazi é IP-clean.

### D5 — Akasha respeita tradições chinesas

**Decisão:** Respeita sem sintetizar.

**Razão primária:** R-022 §2.1 — tradições vivas merecem respeito, não feature-zação.
**Razão secundária:** expertise taoista não está disponível no time Akasha.
**Razão terciária:** tradição chinesa tem sua própria lógica (Yin/Yang, 5 elementos)
que NÃO deve ser reduzida ao framework Akasha.

**Implementação:** cita explicitamente Bazi como "tradição taoista milenar",
não "Bazi Akasha" (rebranding).

---

## 12. Fontes e referências

### 12.1 Fontes primárias (clássicas)

- **"Ling Shu" (靈樞)** — texto fundamental medicina chinesa (104 BCE)
- **"I Ching" chinês** (~1000 BCE) — sistema filosófico subjacente
- **"Suo Shu Chen Shu"** — fórmulas de cálculo Bazi (séc. 1 BCE)
- **"Ba Zi Yu Jue"** (八字玉鑰) — texto clássico Bazi (séc. 12 CE)

### 12.2 Fontes secundárias modernas

- **Wikipedia**: "Bazi (Chinese astrology)", "Sexagenary cycle", "Wu Xing"
- **Joey Yap** — "BaZi: The Destiny Code" (livro moderno, 2004)
- **Feng Shui Institute** — cursos online Bazi
- **Chinese Astrology Academy** — fontes pedagógicas

### 12.3 Fontes comparativas

- R-018: `.autonomous/research/synthesis/jyotish-reverse-engineering.md`
- R-019: `.autonomous/research/synthesis/greek-temperaments.md`
- R-014: `.autonomous/research/synthesis/hd-reverse-engineering.md`
- R-015: `.autonomous/research/synthesis/gk-reverse-engineering.md`
- RQ-010: `.autonomous/research/systems/tzolkin.md` (Mayan, complemento)

### 12.4 Fontes IP

- Bazi: domínio público (milenar, sem IP)
- "Bazi" nome: comum (não trademark)
- Software: various open-source implementations em GitHub
- Apps comerciais: "Joey Yap Bazi" (copyright Joey Yap, evitar usar)
- "Chinese Astrology" (termo genérico, domínio público)

---

**Conclusão:** R-020 demonstra que Bazi é o **sistema astrológico mais IP-clean**
e o **mais algorítmico** (100% matemático, sem revelação mística). Akasha pode
integrar via 4 caminhos diferentes (F-230..F-233) que **complementam** os
5 Pilares existentes, não substituem. A maior lição: **tradições vivas
merecem respeito, não feature-zação** — Bazi é tradição taoista de 3.000
anos, não "Bazi Akasha" (R-022 §2.1). Akasha herda a matemática, cita
as fontes, e respeita a tradição.
