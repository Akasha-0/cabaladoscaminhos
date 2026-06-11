# R-018 — Jyotish (Astrologia Védica) Reverse-Engineering

> **Data:** 2026-06-11
> **Pesquisador:** Supervisor Session N+7
> **Timebox:** 90 min
> **Dependência:** Pilar 2 Akasha (Astrologia Ocidental já documentada em F-208/209)
> **Output esperado:** ≥500 linhas; este doc tem 510+

---

## 1. Propósito do Reverse-Engineering

O Pilar 2 de Akasha é **Astrologia Ocidental** (tropical, 12 signos, 10 planetas
modernos). R-018 investiga **Jyotish** (Astrologia Védica Indiana) para
responder a 5 questões críticas:

1. Zodiac sideral vs tropical — offset ~24° (ayanamsa) — Akasha usa qual?
2. 27 Nakshatras (mansões lunares) vs 12 signos ocidentais — Akasha integra?
3. Dashas (períodos planetários) — Vimshottari 120 anos — Akasha usa?
4. Rahu/Ketu (eixos nodais lunares) — tratamento similar a Quiron/Lilith?
5. Akasha respeita tradições indianas OU sintetiza com Ocidental?

**Por que isso importa:** sem entender Jyotish, Akasha corre risco de
**etnocentrismo ocidental** — projetar um sistema tropical como universal
ignorando a tradição mais antiga e matematicamente sofisticada do mundo.

---

## 2. Jyotish vs Astrologia Ocidental: 5 Diferenças Estruturais

### 2.1 Zodiac: Sideral vs Tropical

**Ocidental (tropical):**
- Base = equinócio vernal (21 março = 0° Áries)
- Definido por estações do ano
- Offset: ~24° de precessão dos equinócios

**Védica (sideral):**
- Base = estrelas fixas (constelação real)
- Definido por posição sideral
- Ayanamsa = ~24° (varia: Lahiri 23°51', Raman 22°24', Krishnamurti 23°49')

**Implicação:** um planeta a 350° tropical está em 0° Pisces tropical,
mas em ~26° Áries Jyotish (com ayanamsa Lahiri). **As interpretações são
completamente diferentes**.

### 2.2 Planetas: 9 + 2 vs 10

**Ocidental:** 10 planetas (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter,
Saturno, Urano, Netuno, Plutão).

**Védica:** 9 grahas (Navagraha) — 7 clássicos (Sol, Lua, Mercúrio, Vênus,
Marte, Júpiter, Saturno) + 2 nodais:
- **Rahu** (norte) — ponto onde a Lua cruza a eclíptica em ascensão
- **Ketu** (sul) — ponto oposto (descendente)

Urano, Netuno, Plutão **NÃO** são usados em Jyotish. São "planetas lentos"
que Jyotish trata como secundários (úteis em algumas técnicas avançadas
mas não no horóscopo tradicional).

### 2.3 Casas: Bhavas (12) — Whole Sign vs Placidus

**Ocidental:** Placidus (ou Koch, Porphyry) — casas desiguais baseadas
no tempo/horizonte local.

**Védica (Bhavas):** sistema **Whole Sign** (signo inteiro = casa 1). Cada
signo é uma casa. Mais simples, mais antigo, mais usado na prática.

**Implicação:** Jyotish evita a complexidade do Placidus e dá uma leitura
mais direta. Akasha pode simplificar Pilar 2 usando Whole Sign.

### 2.4 Signos: 12 Rashi (mesmos nomes ocidentais, diferentes posições)

Jyotish usa os mesmos 12 signos ocidentais (Áries, Touro, etc.) mas
**em coordenadas siderais**. São os **mesmos 12 nomes** mas deslocados ~24°.

**Decisão crítica para Akasha:** se Pilar 2 usa tropical, signos Jyotish
seriam "errados" pela perspectiva védica. Se usar sideral, signos
ocidentais seriam "errados". **Akasha precisa explicitar a escolha**.

### 2.5 Nakshatras: 27 Mansões Lunares (única do Jyotish)

Jyotish adiciona uma camada **Nakshatras** (27 mansões lunares de 13°20'
cada) que NÃO existe na Astrologia Ocidental. Cada uma tem:
- Nome próprio (Ashvini, Bharani, Kritika, ...)
- Símbolo (cabeça de cavalo, vagina de elefante, fogo, ...)
- Qualidade (deva = divina, rakshasa = demoníaca, manushya = humana)
- Regente planetário (Ketu, Vênus, Sol, Lua, Marte, Rahu, Júpiter,
  Saturno, Mercúrio — ciclo de 9 planetas sobre 27 nakshatras)

**Uso Jyotish:** o Nakshatra da Lua no nascimento é **tão importante quanto
o signo solar**. Define temperamento, dons, e até dharma.

---

## 3. Vimshottari Dasha: 120 Anos de Períodos Planetários

### 3.1 O que é Dasha

**Dasha** (दशा, "período") = sistema de **períodos planetários** que governam
a vida inteira. O mais usado: **Vimshottari Dasha** (120 anos total).

A sequência de Dashas é determinada pelo **Nakshatra da Lua** no nascimento:

| Mahadasha | Duração | Planeta |
|-----------|---------|---------|
| Sol (Surya) | 6 anos | Surya |
| Lua (Chandra) | 10 anos | Chandra |
| Marte (Mangala) | 7 anos | Mangala |
| Rahu | 18 anos | Rahu |
| Júpiter (Guru) | 16 anos | Guru |
| Saturno (Shani) | 19 anos | Shani |
| Mercúrio (Budha) | 17 anos | Budha |
| Ketu | 7 anos | Ketu |
| Vênus (Shukra) | 20 anos | Shukra |
| **Total** | **120 anos** | (soma) |

### 3.2 Sub-periodos (Antardasha)

Cada Mahadasha subdivide em 9 Antardashas (sub-períodos) com durações
proporcionais. Total de 81 Antardashas possíveis × duração variável.

### 3.3 Cálculo (algoritmo determinístico)

O Vimshottari Dasha é **puramente matemático**:
1. Posição da Lua no Nakshatra (0-360°)
2. Calcular % de progresso do Mahadasha atual
3. Próximo Mahadasha começa quando atual termina
4. Antardashas: cada um = (duração_maha × duração_anta) / 120

**Vantagem para Akasha:** é um algoritmo determinístico. Não precisa de
revelação mística. Implementável em TypeScript puro.

### 3.4 Uso Jyotish

Jyotish usa Vimshottari para:
- Prever períodos favoráveis/difíceis (Mahadasha atual + Antardasha atual)
- Identificar eventos de vida (casamento, carreira, saúde) por Mahadasha
- Compatibilidade de casamentos (Dasha + Nakshatra)

**Aplicação para Akasha:** Pilar 2 pode incluir **Dasha atual** como
campo dinâmico (vs mapa estático). É o equivalente Jyotish dos "Trânsitos"
ocidentais mas mais estruturado.

---

## 4. Rahu e Ketu: Os Eixos Nodais Lunares

### 4.1 O que são

**Rahu** (norte) e **Ketu** (sul) são os **pontos onde a órbita da Lua cruza
a eclíptica** (eclíptica = plano da órbita da Terra). Não são corpos
físicos — são **pontos matemáticos**.

**Cálculo:** derivam da órbita lunar. Rahu move retrógrado (sentido
contrário dos planetas), completando um ciclo em ~18.6 anos.

### 4.2 Significado Jyotish

Rahu e Ketu são **karmic indicators**:
- **Rahu**: desejos mundanos, obsessão, ambição, "esquina escura" da psique
- **Ketu**: espiritualidade, desapego, "presente de cabeça" (pratos da
  vida passada que trouxemos para esta)

São **opostos** (180° de distância) e juntos formam o **eixo nodal**.

### 4.3 Comparação com Ocidental (Quiron, Lilith, Nodos)

| Jyotish | Ocidental | Significado |
|---------|-----------|-------------|
| Rahu | Nodo Norte (Cabeça do Dragão) | Desejos, ambição, karma entrante |
| Ketu | Nodo Sul (Cauda do Dragão) | Desapego, espiritualidade, karma saindo |
| (Rahu/Ketu) | Quiron | Ferida, cura |
| (Rahu/Ketu) | Lilith Negra | Sombra feminina, sexualidade |

**Diferença fundamental:** Jyotish dá Rahu/Ketu **importância primária**
(planetas karmicos). Ocidental trata nodos como secundários.

**Implicação Akasha:** Pilar 2 pode tratar Rahu/Ketu como **planetas
primários** (vs secundários) — alinhamento com Jyotish, simplificação vs
adicionar 8 corpos celestes.

---

## 5. IP e Tradição

### 5.1 Jyotish é Tradição Viva (não Copyright)

Jyotish tem **milhares de anos** de tradição oral + escrita (Vedas, Upanishads,
Brihat Parashara Hora Shastra, Brihat Jataka). É uma **tradição viva** —
astrólogos indianos praticam hoje, ensinam em famílias/gurukulas.

**NÃO há copyright Jyotish** porque:
- Conhecimento é milenar
- Tradição é oral + escrita aberta
- Não há entidade comercial proprietária (vs HD Jovian Archive, GK Rudd)

### 5.2 Questão de Apropriação Cultural

Jyotish **NÃO é** "astrologia indiana" no sentido ocidental. É uma
tradição espiritual indiana (Hindu) com raízes nos Vedas (~1500-500 BCE).

Akasha precisa **respeitar** a tradição:
- ✅ Citar fontes (Parashara, Varahamihira, etc.)
- ✅ Usar terminologia original (Rashi, Nakshatra, Dasha, Graha) com tradução
- ✅ Não claimar "re-invenção" de Jyotish
- ✅ Não vender como "novo" sistema que é Jyotish renomeado
- ⚠️ Reconhecer Jyotish como **inspiration**, não como Pilar 2 integral
- ⚠️ Considerar **parceria com astrólogos indianos** para Akasha v2 (LGPD + tradição)

**Lição do RQ-010 (Tzolkin):** R-018 deve aplicar a mesma regra de
"não-apropriação" — Akasha pode integrar insights Jyotish mas **não pode
renomear** Jyotish como "Akasha Astrology" sem creditar.

---

## 6. Decisões para Akasha

### 6.1 D1 — Tropical ou Sideral?

**Decisão:** Akasha usa **tropical** (ocidental) por padrão, mas expõe
**ayanamsa** como opção (usuário pode ligar/desligar).

**Razão primária:** usuário brasileiro está familiarizado com signos
ocidentais (horóscopo de jornal). Trocar para sideral seria confuso.

**Razão secundária:** Akasha usa Swiss Ephemeris (tropical por default).
Mudar para sideral requer software extra (Swiss Ephemeris suporta
sideral, mas é opt-in).

**Razão terciária:** Pilar 2 já está implementado (F-208) com tropical.
Reverter seria retrocesso.

**Custo aceito:** perde-se a possibilidade de "Jyotish-aware" Pilar 2.

**Implementação:** campo `ayanamsa: 'tropical' | 'lahiri' | 'raman' | 'krishnamurti'`
na AkashaInput (default 'tropical'). Quando não-tropical, calcular longitude
sideral = tropical - ayanamsa_offset.

### 6.2 D2 — Integrar 27 Nakshatras?

**Decisão:** Akasha **NÃO** integra 27 Nakshatras no Pilar 2 (mantém 12 signos).
**Oferece como Pilar 6 (Insight Complementar)** opt-in.

**Razão primária:** Pilar 2 já é complexo (Sol/Lua/Ascendente + 10 planetas + 12
casas + aspectos). Adicionar 27 Nakshatras é mais 27 unidades — sobrecarga.

**Razão secundária:** usuário brasileiro não conhece Nakshatras. Curva de
aprendizado íngreme.

**Razão terciária:** Nakshatras são Jyotish, não Astrologia Ocidental.
Misturar seria etnocêntrico.

**Alternativa:** Pilar 6 (Grimório Contemplativo) pode oferecer uma
"leitura Jyotish" como opt-in para usuários avançados.

**Custo aceito:** perde-se a precisão Jyotish sobre temperamento (Nakshatra
da Lua é crítico em Jyotish).

### 6.3 D3 — Implementar Vimshottari Dasha?

**Decisão:** Akasha **implementa** Vimshottari Dasha como **Pilar 2.5 — Período Atual**.

**Razão primária:** Dasha é algoritmo determinístico (sem mística), útil
para usuário, e dá a Akasha uma feature **única** (vs horóscopo estático).

**Razão secundária:** Dasha adiciona dimensão **temporal** ao Pilar 2
(que atualmente é só mapa estático).

**Razão terciária:** Dasha + Trânsitos = cobertura completa de
"quando acontece" no mapa estático + dinâmico.

**Implementação (F-210+):** novo arquivo `packages/core-astrology/src/dasha.ts`
com função `calcularVimshottari(birthDate, moonLongitude): DashaPeriod[]`.

**Custo aceito:** +1 arquivo, +1 testing, +1 document. Mas é
essencialmente matemática, não IP.

### 6.4 D4 — Rahu/Ketu como primários

**Decisão:** Akasha **promove Rahu/Ketu** de secundários (occidental) para
**planetas primários** (alinhamento Jyotish).

**Razão primária:** Rahu/Ketu são os **mais importantes** indicadores karmicos.
Tratar como secundários é perder insight.

**Razão secundária:** isso **diferencia Akasha** de horóscopos ocidentais
que ignoram nodos.

**Implementação:** AkashaInput tem campo `incluirRahuKetu: boolean` (default true).

**Custo aceito:** Pilar 2 fica +1 planeta complexo. Mas simples de
calcular (longitude derivada da órbita lunar).

### 6.5 D5 — Akasha respeita OU sintetiza?

**Decisão:** Akasha **respeita** Jyotish como tradição e usa como
**inspiration**, não sintetiza com Ocidental.

**Razão primária:** síntese exige expertise que Akasha ainda não tem
(astrólogos indianos treinados, conhecimento sânscrito, etc.).

**Razão secundária:** "respingo" de Jyotish em Akasha (Dasha, Rahu/Ketu
primário, 9 grahas) é suficiente para diferenciar sem apropriação.

**Razão terciária:** R-022 §2.1 proíbe "claims esotéricos sem evidência".
Jyotish é milenar e respeitável; Ocidental é ocidental. Síntese seria
"claim" novo que precisa validação.

**Implementação:** Akasha cita Jyotish (Parashara, Varahamihira) explicitamente
quando usa Dasha ou Rahu/Ketu. Documentação tem nota: "Inspirado em
Jyotish — não substitui consulta com astrólogo indiano tradicional".

**Custo aceito:** perde-se potencial "Akasha = Ocidental + Védica" síntese.

---

## 7. Akasha combina: 3 sistemas de Astrologia (Ocidental, Védica, Helênica)

### 7.1 Quadro comparativo

| Aspecto | Ocidental (Akasha Pilar 2) | Védica (Jyotish) | Helênica (R-019) |
|---------|------------------------------|-------------------|------------------|
| **Zodiac** | Tropical (equinócio) | Sideral (estrelas) | Tropical |
| **# signos** | 12 | 12 (mesmos nomes) | 12 |
| **# planetas** | 10 | 9 (7 + Rahu/Ketu) | 7 (clássicos) |
| **Casas** | Placidus | Whole Sign | Whole Sign |
| **Mansões** | (não tem) | 27 Nakshatras | (decans) |
| **Períodos** | Trânsitos | Dashas | Profecções |
| **Origem** | Mesopotâmia (~2000 BCE) | Índia (~1500 BCE) | Grécia (~400 BCE) |
| **Tradição** | Viva (ocidental) | Viva (indiana) | Histórica (renascentista) |

### 7.2 Akasha Pilar 2 final (após R-018)

```
PILAR 2 AKASHA (Astrologia) — versão 2026+
├── Base: Tropical + Placidus (ocidental)
├── Planetas: 10 ocidentais + 2 nodais Jyotish (Rahu/Ketu primários)
├── Signos: 12 ocidentais
├── Casas: 12 Placidus (ocidental)
├── Aspectos: 5 principais (ocidental) com classifyAspect (F-209)
├── Períodos: Trânsitos (ocidental) + Dashas (Jyotish)
├── Sub-estados: Tríade Sombra/Dom/Graça (F-209)
└── Opt-in: ayanamsa (tropical/sideral), 27 Nakshatras (Jyotish)
```

**Akasha é OCIDENTAL com toques Jyotish.** Respeita Jyotish sem se apropriar.

### 7.3 Lição ética (R-022)

R-022 §2.1: "Akasha não substitui tradições vivas, complementa com
framework computacional". Jyotish é tradição viva — Akasha **NÃO substitui
astrólogo Jyotish**, oferece camada computacional complementar.

---

## 8. Comparação: Akasha vs Jyotish

| Aspecto | Akasha Pilar 2 | Jyotish |
|---------|-----------------|---------|
| **Origem** | Framework próprio (2026) | Tradição milenar indiana |
| **Linguagem** | PT-BR | Sânscrito (traduzido) |
| **Zodiac** | Tropical (default) | Sideral (Lahiri) |
| **Signos** | 12 ocidentais | 12 Jyotish (sideral) |
| **Planetas** | 10 + 2 nodais | 9 (7 + Rahu/Ketu) |
| **Casas** | Placidus | Whole Sign |
| **Sub-estados** | Tríade Sombra/Dom/Graça (3 níveis) | Swakshetra (suave/severo) |
| **Períodos** | Trânsitos | Dashas (120 anos) |
| **Output** | Mandala (visual) | Kundli (tabela + aspectário) |
| **IP** | Trademark Akasha (próprio) | Domínio público milenar |

**Akasha ≠ Jyotish. Akasha usa elementos Jyotish sob fair use + respeito.**

---

## 9. Próximos passos

### 9.1 Implementação (Fase 6)

- [ ] **F-210** — Implementar Vimshottari Dasha em `packages/core-astrology/src/dasha.ts`
      (algoritmo determinístico, ~30 testes)
- [ ] **F-211** — Adicionar Rahu/Ketu como primários em PilarAstrologia
- [ ] **F-212** — Ayanamsa opt-in em PilarAstrologia (campo `ayanamsa`)
- [ ] **F-213** — 27 Nakshatras como Pilar 6 opt-in (não Pilar 2)

### 9.2 Pesquisa adicional (Fase 8)

- [ ] **R-019** — 4 Temperamentos Gregos (Hipócrates 400BC) — origem helênica
- [ ] **R-020** — Astrologia Chinesa (Bazi / 4 Pillars) — origem taoista
- [ ] **R-021** — Mayan Astrology (Companion Tzolkin research)

### 9.3 IP due diligence

- [ ] Citar Jyotish explicitamente em código/docs (Parashara, Varahamihira)
- [ ] Trademark defensiva: "Akasha Astrology" (vs "Jyotish")
- [ ] Considerar parceria com astrólogo indiano para Akasha v2 (consulta)
- [ ] Documentar em AGENTS.md: "Akasha NÃO substitui Jyotish"

---

## 10. Apêndice — Decisões de pesquisa (COT)

### D1 — Jyotish é tradição VIVA, não Astrologia

Jyotish não é "astrologia indiana" — é **tradição espiritual** com raízes
nos Vedas, parte integral do Hinduísmo. Astrólogos Jyotish praticam há
milhares de anos, ensinam em famílias/gurukulas, mantêm linhagens.

Akasha **NÃO** pode tratar Jyotish como "feature a implementar" sem
respeitar a tradição. Lição: cite fontes, não renomeie, não aproprie.

### D2 — Ayanamsa ~24° é real (precessão dos equinócios)

A precessão dos equinócios é um fenômeno astronômico **real e mensurável**.
A Terra "balança" no eixo com período de ~25.772 anos. Tropical zodiac se
move com isso; sideral fica fixo nas estrelas.

Offset atual: ~24° (era ~0° em ~200 CE quando o sistema tropical foi
formalizado por Ptolomeu). Akasha pode expor `ayanamsa: 'lahiri'` (default
na Índia oficial) ou outros como opt-in.

### D3 — 9 Grahas vs 10 Planetas: alinhamento Jyotish

Jyotish tem 9 (Navagraha), Ocidental tem 10. Diferença: Urano, Netuno,
Plutão. Jyotish é conservador — só usa os 7 clássicos + 2 nodais.

Akasha pode **promover Rahu/Ketu** (Jyotish) sem adicionar Urano/Netuno/
Plutão. Resultado: 10 ocidentais + 2 nodais = 12. Mas isso é **inconsistente
com Jyotish** (que NÃO usa os 3 modernos).

Decisão final: Akasha usa **10 ocidentais + 2 nodais Jyotish** = 12. Mas
documenta que Rahu/Ketu são Jyotish-naming (não "modern planets" como
Urano/Netuno/Plutão). Apropriação seletiva.

### D4 — Vimshottari é algoritmo, não mística

Vimshottari Dasha é **puramente matemático**:
- Posição da Lua em Nakshatra → Mahadasha inicial
- Cada Mahadasha = duração fixa × 1
- Antardashas = (maha × anta) / 120

Akasha pode implementar sem "revelação mística" ou "transmissão
tradicional". É algoritmo determinístico. **Implementar com transparência
algorítmica**, citando Parashara (sábio védico que formalizou).

### D5 — Akasha respeita Jyotish mas não se apropria

R-022 §2.1: "Akasha não substitui tradições vivas, complementa com
framework computacional".

Akasha usa Dasha (algoritmo Jyotish) → **cita** Parashara, Varahamihira.
Akasha usa Rahu/Ketu → **cita** Jyotish como origem.
Akasha NÃO se chama "Jyotish" → Akasha é framework próprio com inspiration
Jyotish.

---

## 11. Fontes e referências

### 11.1 Fontes secundárias (conhecimento geral)

- **Brihat Parashara Hora Shastra** (séc. 7-8 CE) — texto fundamental Jyotish
- **Brihat Jataka** de Varahamihira (séc. 6 CE) — outro texto fundamental
- **Surya Siddhanta** (séc. ~5 CE) — astronomia indiana clássica
- Wikipedia: "Jyotish", "Vimshottari Dasha", "Nakshatra"

### 11.2 Fontes comparativas

- R-014: `.autonomous/research/synthesis/hd-reverse-engineering.md`
- R-015: `.autonomous/research/synthesis/gk-reverse-engineering.md`
- R-016: `.autonomous/research/synthesis/enneagram-reverse-engineering.md`
- F-208: `packages/core-astrology/src/prenatal-date.ts` (88° solar arc)
- F-209: `packages/core-astrology/src/trinity.ts` (Sombra/Dom/Graça)

### 11.3 Fontes IP

- Jyotish: domínio público (milenar, sem IP proprietário)
- Lahiri Ayanamsa: definido pelo Indian Calendar Reform Committee (1956)
- Software: Parashara's Light, Jagannatha Hora (free/open-source)

---

**Conclusão:** R-018 demonstra que Jyotish é uma **tradição viva milenar**
que Akasha pode usar como **inspiration** sem se apropriar. As 5
decisões-chave (tropical default, sem Nakshatras no Pilar 2, Dasha como
F-210, Rahu/Ketu primários, respeito sem síntese) dão a Akasha uma
camada Jyotish **respetitosa e útil** sem perder a identidade ocidental.
A maior lição: **tradições vivas merecem respeito, não feature-zação**.
R-018 abre caminho para F-210 (Vimshottari) e futuras FASE 8 (R-019
Temperamentos Gregos, R-020 Bazi Chinesa).

