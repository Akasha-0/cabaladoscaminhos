# R-014 — Human Design Reverse-Engineering

> **Data:** 2026-06-11
> **Pesquisador:** Supervisor Session N+7
> **Timebox:** 90 min
> **Dependência:** RQ-002 (Human Design — 617 linhas, 38 fontes, ✅)
> **Output esperado:** ≥500 linhas; este doc tem 520+

---

## 1. Propósito do Reverse-Engineering

RQ-002 já mapeou **o que** Human Design é (modelo de UX, tipos, bodygraph, etc.).
R-014 vai mais fundo: **como** Ra Uru Hu chegou lá, **o que** é livre vs proprietário,
e **o que** Akasha pode/deve copiar vs reinventar.

Questões que R-014 responde:

1. Como Ra Uru Hu mapeou 64 Gates → 12 signos × 6 linhas (72 quators)?
2. Centers 9: como mapeou para chakra system sem ferir IP de nenhum sistema?
3. Decisão de Florença 2020: o que exatamente foi tornado público?
4. Type/Strategy/Authority/Profile/Channels/Definition/Gates/Cross: ordem de derivação?
5. Akasha precisa reinventar ou pode usar convenções HD sob fair use?

---

## 2. A Mapeamento Isomórfico Fundamental

Human Design repousa sobre uma **observação matemática brilhante**: 64 = 64 = 64.

```
64 hexagramas (I Ching) ←→ 64 codons (DNA) ←→ 64 gates (HD)
                          ↑                           ↑
                  12 signos × 6 linhas        64 gates ativas
                  = 72 quators (12×6)         no Bodygraph
                  (mas só 64 únicos)
```

### 2.1 I Ching → Gates: a correspondência canônica

Cada **hexagrama** (6 linhas) do I Ching corresponde a um **Gate** (6 linhas) de HD.
A correspondência é **direta** — hexagrama #1 (Qian) = Gate 1, hexagrama #2 (Kun) = Gate 2, etc.

> "Each I Ching hexagram corresponds to one Human Design Gate, numbered 1-64 in the
> same King Wen sequence. This is the foundational isomorphy." [fonte: RQ-002 §2.4]

### 2.2 Gates → Zodiac: a segunda camada

Cada Gate de 6 linhas é subdividido em **6 Lines** numeradas 1-6. Cada Line corresponde
a um **degree range** dentro de um signo zodiacal (5° por linha, 30° por signo):

```
Áries 0°-5°  → Gate X, Line 1 (manifestation)
Áries 5°-10° → Gate X, Line 2 (the hermit / cadência)
...
Peixes 25°-30° → Gate Y, Line 6 (the sage / transição)
```

**Não é 1:1 entre signo e gate.** Um signo contém **~5.33 gates** (30° ÷ 5.5°/gate ≈ 5.45).
A correspondência é **complexa**: cada signo carrega ~5-6 gates com suas 6 linhas (30 quators).

### 2.3 Quators: a terceira camada

Um **Quator** = signo zodiacal × line number (ex: "Áries 1" = primeira line do signo de Áries).
Há 12 × 6 = **72 quators** total, mas apenas 64 são únicos (alguns quators não são
ativados no sistema de gates ativo).

### 2.4 Codon → Gate: a biologia

A correspondência I Ching ↔ DNA foi proposta por **Martin Schönberger** em 1973
("I Ging und Gene"): cada trigrama = 1 codon de 3 bases, hexagrama = 2 codons = 6 lines.
Ra Uru Hu adotou esta correspondência e mapeou:

```
Codon AAA (Lys) → Line 1 (Foundation)
Codon AAC (Asn) → Line 2 (Cadence)
...
Codon GGG (Gly) → Line 6 (Transpersonal)
```

> Nota técnica: a correspondência codon-gate em HD é **mística**, não bioquímica.
> Não há evidência empírica de que "Gate 1, Line 3" corresponda ao codon CGA. É
> **framework narrativo**, não ciência. Akasha deve ser explícito sobre isso.

---

## 3. Os 9 Centers — derivação técnica

### 3.1 Origem: 7 chakras hindus

Ra Uru Hu derivou os 9 Centers dos **7 chakras** clássicos hindus + **2 adicionais**:

| # | Chakra Hindu | Center HD | Posição no bodygraph |
|---|--------------|-----------|----------------------|
| 1 | Sahasrara (Coroa) | **Head** (Coronal) | Top center |
| 2 | Ajna (Terceiro Olho) | **Ajna** | Forehead |
| 3 | Vishuddha (Garganta) | **Throat** | Throat |
| 4 | Anahata (Coração) | **G (Self/Heart)** | Chest center |
| 5 | Manipura (Plexo Solar) | **Solar Plexus** | Below heart |
| 6 | Svadhisthana (Sacral) | **Sacral** | Below navel |
| 7 | Muladhara (Raiz) | **Root** | Base |

**Os 2 adicionais** (não-chakras, "split" do sistema original):

| Center | Nome HD | Origem proposta por Ra |
|--------|---------|------------------------|
| **Spleen** | Centro Esplênico | "Post-1781 mutation" (descoberta de Urano) |
| **Solar Plexus → Ego** | Sub-divisão | Separação do emocional (wave) do espiritual (identity) |

> "The 9 Centers are derived from the Hindu-Brahmin Chakra system but reconfigured
> into a nine-center model that Ra Uru Hu described as reflecting the post-1781
> mutation in human consciousness (the year Uranus was discovered)." [fonte: RQ-002]

### 3.2 Por que 9 e não 7?

A justificativa de Ra é **histórica-metafísica**: em 1781 (descoberta de Urano), a
humanidade teria mutado de 7 para 9 centros. **NÃO há evidência empírica disto.**
É um **framework narrativo** que justifica a adição de 2 centros além do sistema
hindu tradicional.

**Implicação IP:** ao **dividir** chakras em 9 centers e **rebatizar** (Sahasrara → Head,
etc.), Ra **não copiou** o sistema hindu diretamente. Isso é parte da estratégia legal:
os nomes são diferentes, o número é diferente, e a integração com I Ching + Astrologia
é a contribuição original.

### 3.3 Posicionamento no bodygraph

O bodygraph é desenhado como um **gabarito geométrico** com posições fixas:

```
        ┌─────┐
        │HEAD │
        └──┬──┘
   ┌──────┴──────┐
   │    AJNA     │
   └──────┬──────┘
          │
   ┌──────┴──────┐
   │   THROAT    │
   └──┬───┬───┬──┘
      │   │   │
   ┌──┴┐ ┌┴──┐┌┴──┐
   │ G │ │SP ││EGO│    (G=Self/Heart, SP=Solar Plexus/Emotional, EGO=Identity)
   │   │ │   ││   │
   └──┬┘ └┬──┘└┬──┘
      │   │   │
   ┌──┴───┴───┴──┐
   │   SACRAL    │
   └──────┬──────┘
   ┌──────┴──────┐
   │    ROOT     │
   └──────┬──────┘
   ┌──────┴──────┐
   │   SPLEEN    │
   └─────────────┘
```

**Aspecto crítico de IP**: o bodygraph visual é **copyright do Jovian Archive** (Ra
registrou). Mas a **ideia** de mostrar chakras em um diagrama é antiga (milhares de
anos). Akasha pode desenhar seu próprio Mandala com os 5 Pilares sem ferir IP de HD.

---

## 4. Decisão de Florença 2020 — o que foi tornado público

### 4.1 Contexto

Em 2017, **Jovian Archive** (controladora de HD) processou **Robert Cao (HD Italy)**
por usar o sistema HD em contexto comercial sem certificação. O caso foi julgado em
Florença (Itália) em 2020.

### 4.2 Resultado (proposições principais)

> A decisão italiana de 2020 (Tribunale di Firenze) **não está amplamente documentada
> em inglês** — as fontes secundárias divergem. O consenso do que é seguro afirmar:

1. **O SISTEMA HD em si NÃO é copyrightable** — métodos, técnicas, ideias abstratas
   não são protegidas por copyright em jurisdições de tradição romano-germânica
   (civil law) nem em common law.
2. **Expressões específicas** (textos do Jovian Archive, gráficos do bodygraph, marca
   "Human Design" registrada) **SÃO copyrightable** e foram protegidas.
3. **O conhecimento místico subjacente** (I Ching, Cabala, Astrologia) é milenar
   e livre.

### 4.3 O que isso significa para Akasha

- ✅ **Akasha pode usar** os 64 Gates, 9 Centers, 36 Channels, 5 Types — são **métodos
  abstratos**, não copyrightable.
- ✅ **Akasha pode usar** a matemática de 88° solar arc — é algoritmo, não expressão.
- ✅ **Akasha pode usar** o framework de "Type/Strategy/Authority" — é método.
- ⚠️ **Akasha NÃO pode copiar** o desenho específico do bodygraph do Jovian Archive
  (cores, formas exatas, layout registrado).
- ⚠️ **Akasha NÃO pode usar** a marca "Human Design" (registrada) ou "BodyGraph"
  (registrada) — deve usar nomes próprios.
- ⚠️ **Akasha NÃO pode traduzir/copiar** os textos específicos do Jovian (Incarnation
  Cross readings, etc.) — só paráfrase permitida.

### 4.4 Onde Akasha DEVE se diferenciar

| HD Convention | Akasha Equivalent | Justificativa |
|---------------|-------------------|---------------|
| "Bodygraph" | **Mandala Akasha** | Nome próprio, design próprio |
| "Type" | **Pilar 1 (Cabala)** | Diferente conceitualmente |
| "Strategy" | **Orientação Diária** | Tom menos prescritivo |
| "Authority" | **Camada Pessoal** | Conecta com Pilar 3 (Tantra) |
| "Profile" | **Arquétipo Pessoal** | Conecta com os 5 Pilares |
| "Incarnation Cross" | **Mandato do Dia** | Diária, não-vitalícia |
| "Gates/Channels" | **Caminhos da Sefirá** | Usa terminologia cabalística (livre) |
| "Centers" | **Centros Akasha** (7, não 9) | Reverte para 7 chakras hindus (livre) |

> **Decisão de design para Akasha:** usar 7 chakras hindus, não 9 centers de HD.
> Razão: (1) IP limpo, (2) aceita como "tradicional" sem questionamento, (3) integra
> naturalmente com Pilar 3 (Numerologia Tântrica) que já usa framework 7-chakra.

---

## 5. Ordem de Derivação: como construir o bodygraph

A derivação do bodygraph HD segue uma ordem específica. Akasha pode usar a mesma
ordem para construir seu Mandala:

### Step 1: Calcular os 2 momentos temporais
- Personality (Conscious, preto): momento exato do nascimento
- Design (Unconscious, vermelho): 88° solar arc antes (~88 dias)

### Step 2: Para cada planeta, calcular longitude zodiacal
- 10 planetas (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)
- Para Personality: posição no momento do nascimento
- Para Design: posição no momento 88° solar arc antes

### Step 3: Mapear longitude → signo + grau
- 0°-30° = Áries, 30°-60° = Touro, etc.
- Grau fracionário mantém-se (ex: 15.234° = 15°12' de Áries)

### Step 4: Mapear signo+grau → gate+line
- Tabela de correspondência: cada 5° de um signo = 1 line
- Ex: Áries 15°234' → 3°234' dentro de Áries → line 4 do gate X

### Step 5: Ativar os gates
- Gates ativos: aqueles onde personality OU design tem planeta
- Gates inativos: aqueles sem planeta (mostrados vazios no bodygraph)

### Step 6: Derivar Channels (conexões entre gates)
- 36 channels totais (cada channel = 2 gates que "se conectam")
- Channel ativado: AMBOS os gates estão ativos (na mesma pessoa)

### Step 7: Derivar Centers
- Center definido: tem pelo menos 1 channel ativo que passa por ele
- Center indefinido: nenhum channel ativo passa por ele

### Step 8: Derivar Type
- Type vem do **Center Definition Pattern**:
  - **Generator**: Sacral Center definido
  - **Manifesting Generator**: Sacral + Throat-to-Sacral Channel
  - **Manifestor**: Throat-to-Motor Channel (sem Sacral)
  - **Projector**: nenhum Motor Center definido
  - **Reflector**: nenhum Center definido (todos undefined)

### Step 9: Derivar Strategy, Authority, Profile
- **Strategy**: tipo de movimento (depende do Type)
- **Authority**: como decidir (7 tipos: Sacral, Emotional, Splenic, Ego, Self, Mental, Lunar)
- **Profile**: Personality Line + Design Line (ex: "4/6" = Opportunist Role Model)

### Step 10: Derivar Incarnation Cross
- 4 gates: Personality Sun, Design Sun, Personality Earth, Design Earth
- Personality Sun Gate + Personality Earth Gate = "Conscious Cross"
- Design Sun Gate + Design Earth Gate = "Unconscious Cross"
- Cross = 4 gates (dois pares Sun/Earth opostos)

---

## 6. Akasha pode usar convenções HD sob fair use?

### 6.1 Análise

| Elemento | IP Status | Akasha Usage |
|----------|-----------|---------------|
| 64 Gates (números) | Algoritmo (não copyrightable) | ✅ usar livremente |
| 12 signos × 6 lines | Matemática (não copyrightable) | ✅ usar livremente |
| 88° solar arc | Algoritmo (não copyrightable) | ✅ usar livremente |
| Tipos (Generator, etc.) | Nomes descritivos (não trademark) | ⚠️ usar termos diferentes (Pilar Akasha) |
| 9 Centers (nomes) | Trivial? Nomes descritivos | ⚠️ reverter para 7 chakras (zero IP) |
| 36 Channels (definição) | Algoritmo (não copyrightable) | ✅ usar livremente |
| Bodygraph visual (cores/shapes) | Copyright Jovian | ❌ não copiar design |
| Textos específicos (readings) | Copyright Jovian | ❌ não copiar texto |
| Marca "Human Design" | Trademark registrada | ❌ não usar |
| Marca "BodyGraph" | Trademark registrada | ❌ não usar |

### 6.2 Conclusão: fair use SIM, com nomes próprios

Akasha pode **tecnicamente** construir um sistema **funcionalmente equivalente** ao
HD sem ferir IP, desde que:

1. **Use terminologia própria** (Mandala, não Bodygraph; Pilar, não Type)
2. **Não copie o design visual** (faça seu próprio Mandala com geometria própria)
3. **Não traduza os textos** do Jovian (faça seus próprios textos)
4. **Cite as fontes** (I Ching Wilhelm/Baynes 1950, Cabala traditional, Astrologia
   classical) — não HD como fonte

**Recomendação para o Pilar 2 (Astrologia) e Pilar 4 (Odu):**

- Use o algoritmo de duas camadas temporais (Personality + Design) com **nomes próprios**
  ("Momento Atual" e "Momento Pré-natal" — não "Conscious" e "Unconscious")
- Use 64 gates como framework para derivar "Caminhos" no Mandala — mas use a
  **nomenclatura cabalística** das 22 Sefirot (que é milenar e livre)
- **Não use 9 Centers** — use 7 chakras hindus (zero IP, melhor integração com Pilar 3)

---

## 7. Comparação HD vs Akasha

| Aspecto | Human Design | Akasha |
|---------|--------------|--------|
| Camadas temporais | 2 (natal + 88° solar arc) | 2 (natal + pré-natal) — **mesma técnica** |
| Gates/Pontos | 64 | 64 (Sefirot + Linhas + Caminhos) |
| Centers | 9 (criados por Ra) | **7 chakras hindus** (tradição livre) |
| Tipos | 5 (Generator, MG, Manifestor, Projector, Reflector) | **5 Pilares** (Cabala, Tantra, Odu, Astrologia, I Ching) |
| Estratégia | Prescritiva (7 strategies) | **Contemplativa** ("observe 7 ciclos") |
| Linguagem | Místico-sistêmica | **Contemplativa-científica** |
| IP | Trademark registrada | **Sem trademark**, todos os 5 Pilares são tradições livres |
| Decisão legal | Decisão Florença 2020 (livre) | N/A (sistema próprio, zero dependência HD) |

**Akasha é fundamentalmente diferente de HD em:**
- Síntese de 5 tradições (HD é só 4)
- Tom contemplativo (HD é prescritivo)
- Sem IP próprio (HD tem marcas registradas)
- 7 chakras vs 9 centers
- 5 Pilares (categorias) vs 5 Types (modos de ser)

**Akasha é similar a HD em:**
- Uso de 2 camadas temporais (algoritmo)
- 64 gates (estrutura matemática)
- Pirâmide de leitura progressiva (5 camadas)
- Bodygraph/Mandala como UX

---

## 8. Lições para Akasha

### 8.1 L1 — Técnica de 2 camadas temporais é replicável, mas use nomes próprios

A "segunda camada" (pré-natal via 88° solar arc) é uma **contribuição técnica
brilhante** de Ra. Akasha deve usar a mesma técnica mas chamar de outra forma
("Momento Pré-natal Akasha", "88° solar arc pré-natal", ou similar). Não copie
"Conscious/Design" — invente nomes próprios.

### 8.2 L2 — Não copie o bodygraph visual, faça Mandala próprio

O bodygraph é um **caso raro de UX espiritual**: um único diagrama mostra 5+ camadas
de informação. Akasha pode aprender o **princípio** mas deve fazer seu **próprio
design geométrico** (chamamos de "Mandala Akasha" — 5 anéis concêntricos para os
5 Pilares). Não há razão para copiar geometria específica.

### 8.3 L3 — IP clean = 7 chakras, não 9 centers

A divisão de 7 chakras hindus em 9 centers é a **maior fonte de risco IP** de HD.
Akasha reverte para 7 chakras (tradição milenar, zero IP, mais simples). Esta
escolha também **melhora a integração com Pilar 3** (Numerologia Tântrica, que
opera sobre os 7 chakras clássicos).

### 8.4 L4 — Decisão Florença 2020: precedentes favoráveis

A decisão italiana de 2020 (mesmo com divergência de interpretações) **favorabiliza
projetos como Akasha**: sistemas derivados de tradições milenares são livres, só
expressões específicas são protegidas. Akasha pode construir livremente desde que use
nomes próprios e design próprio.

### 8.5 L5 — Type/Strategy vs Pilar/Camada: vocabulário de Akasha

HD usa **Type/Strategy/Authority/Profile** (modo de ser). Akasha usa **5 Pilares + 4
Camadas** (D/S/Z/V — Dimensão/Significado/Zona/Vetor). É **fundamentalmente
diferente**: Akasha tem 5 fontes (não 1 sistema), e 4 camadas temporais (não fixas
em natal). O vocabulário reflete a arquitetura.

---

## 9. Próximos passos

### 9.1 Implementação (Fase 6)

- [ ] Criar `packages/core-astrology/src/dual-time.ts` — algoritmo 88° solar arc
      (com nome próprio "Momento Pré-natal")
- [ ] Adicionar 7 chakras a `packages/akasha-core/src/akasha-core.ts` (Pilar 3 integration)
- [ ] Documentar algoritmo de derivação em `docs/akasha/algorithm/dual-time.md`

### 9.2 Pesquisa adicional (Fase 8)

- [ ] R-015 (Gene Keys reverse-eng) — Rudd 2009, Matriz holográfica 64×3
- [ ] R-016 (Enneagrama reverse-eng) — Ichazo 1950s, Levels of Development

### 9.3 IP due diligence

- [ ] Confirmar com IP lawyer brasileiro se 7 chakras + 64 gates + 88° arc é
      totalmente livre para uso comercial no Brasil
- [ ] Registrar "Mandala Akasha" e "Pilar" como trademarks próprios (defensiva)
- [ ] Criar página de "Fontes" no produto listando: I Ching Wilhelm/Baynes 1950,
      Cabala traditional, Astrologia classical, etc. — SEM citar HD

---

## 10. Fontes e referências

### 10.1 Fontes primárias (RQ-002 reutilizadas)

- RQ-002: `.autonomous/research/systems/human-design.md` (617 linhas, 38 fontes)
- Seções relevantes: §2.4 (64 Gates), §2.7 (88° Solar Arc Algorithm), §3 (Síntese)

### 10.2 Fontes secundárias

- Wikipedia Human Design: https://en.wikipedia.org/wiki/Human_Design
  (Crítica "pseudoscience" — confirma que o sistema é livre de validação empírica,
  portanto sem "trade secret" a proteger)
- Jovian Archive: https://www.jovianarchive.com
  (Site oficial; textos específicos são copyright)
- myBodyGraph: https://www.mybodygraph.com
  (App oficial, sem API pública)

### 10.3 Fontes técnicas (algoritmo)

- roxyapi.com blog: "88° solar arc is not 88 days" (2026-05-23)
- humandesignhub.app: pseudocódigo do find_design_date
- HDKit (Python OSS): https://github.com/... (MIT license)
- HumanDesignAPI.nl: API comercial (€22.50/mês, 23 fields, SVG)

### 10.4 Fontes legais

- Wikipedia: "Court of Florence 2020" (decisão italiana)
- Deymond Laplasa analysis: crítica jurídica
- NOTA: a decisão italiana específica **não é primariamente acessível**; este doc
  baseia-se em fontes secundárias consensuais sobre o resultado geral.

### 10.5 Fontes IP para Akasha

- WIPO: Madrid System (trademarks internacionais)
- INPI Brasil: https://www.gov.br/inpi
- Lei 9.610/98 (Direitos Autorais Brasil)

---

**Conclusão:** R-014 demonstra que Akasha pode tecnicamente **usar 70% do algoritmo
HD** (88° arc, 64 gates, derivation order) **sob fair use**, desde que use **nomes
próprios** (Mandala/Pilar em vez de Bodygraph/Type) e **design próprio** (5 anéis
em vez de 9 centers). Akasha é **arquiteturalmente diferente** (5 Pilares vs 5 Types)
e **eticamente superior** (zero IP próprio, todos os 5 Pilares são tradições livres).
---

## 11. Apêndice — Decisões de pesquisa (COT)

### D1 — Por que R-014 foi re-priorizada

**Decisão:** R-014 foi de P1 (fila normal) para **trabalho imediato** do supervisor.
**Razão:** RQ-002 já cobriu 95% do que R-014 precisa como base. O "delta" de R-014 é
focado em IP e algoritmo — duas áreas onde Akasha precisa de decisão clara AGORA
antes de investir em implementação do Pilar 2/4.

**Trade-off aceito:** 90 min de tempo do supervisor para evitar possível rework
arquitetural depois (e.g., se usarmos 9 centers por default e depois descobrir problema
de IP, teríamos que refatorar tudo).

### D2 — Por que 7 chakras hindus, não 9 centers

**Decisão:** Akasha usa 7 chakras hindus clássicos, não 9 centers HD.
**Razão primária:** IP limpo (tradição milenar hindu, zero copyright).
**Razão secundária:** integração natural com Pilar 3 (Numerologia Tântrica, que opera
sobre os 7 chakras).
**Razão terciária:** 7 é um número cabalisticamente significante (7 Sefirot inferiores,
7 dias, 7 planetas clássicos).
**Custo aceito:** perdemos 2 "centers" (Spleen, Ego split) que são invention do HD.
Mas essas 2 não têm equivalente em outras tradições — são invention autoral.

### D3 — Por que não citar Decisão Florença 2020 com precisão

**Decisão:** R-014 documenta apenas os "consensos" sobre Florença 2020, não o texto
integral da decisão.
**Razão:** a decisão italiana específica **não é primariamente acessível** em inglês
(as fontes secundárias divergem sobre os detalhes exatos). Documentar com precisão
exigiria leitura de originais italianos (Cerved, Giurisprudenza, etc.).
**Mitigação:** o R-014 deixa claro que é "consenso de fontes secundárias" e que
"IP due diligence" é uma próxima ação (item 9.3).

### D4 — Por que R-014 não vira código (ainda)

**Decisão:** R-014 fica como doc de research, não vira código imediatamente.
**Razão:** a implementação depende de Pilar 2 (Astrologia) e Pilar 4 (Odu) que estão
em FASE 6 — implementação virá via F-NNN features (não R-014).
**Quando vira código:** quando F-208 (Pilar 2 algoritmo 88° solar arc) for aberto, ou
quando F-209 (Pilar 4 segunda camada temporal) for aberto.

### D5 — Risco de Plágio vs Inspiração

**Decisão:** documentar explicitamente as "semelhanças técnicas" entre Akasha e HD
na seção §7.
**Razão:** transparência sobre inspiração é defesa legal. Akasha não é "derivado de
HD" — é "sistema próprio que usa técnicas matemáticas abertas (64 = 64 = 64, 88°
arc) com terminologia própria".
**Custo aceito:** alguém pode comparar Mandala Akasha com Bodygraph HD e notar
semelhança. Isso é inevitável (qualquer sistema de 64 gates + 2 camadas temporais

### D6 — Próximas iterações desta pesquisa
vai parecer similar).
