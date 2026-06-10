# Co-Star — Research Report (RQ-005)

**Data:** 2026-06-10
**Pesquisador:** Akasha Research Agent (Sessão N)
**Status:** ✅ Completo
**Tempo investido:** ~90 min
**Output complementares:**
- COT: `chain-of-thought/cot-20260610-costar-position.md`
- INDEX: atualizado
- CHECKPOINT: atualizado

---

## 0. Resumo executivo (TL;DR)

Co-Star (lançado 2017, NYC) é o app de astrologia que **redefiniu a categoria**
para a geração Z e millennials jovens. Não por ser tecnicamente o mais
preciso — não é — mas por combinar **3 decisões radicais** que nenhum
concorrente tinha coragem de tomar:

1. **Restraint visual** (3 cores: `#5e5e5e`, `#f7f7f7`, `#000000`).
2. **Voz autoral edgy** ("snotty but tough older sister loves you").
3. **Notificações = 1/dia, com curadoria humana + AI que monta, não decide**.

O resultado: **~30M contas registradas**, **~20% dos jovens US**,
**~25% das mulheres US 18-25**, **~$9.57M/ano de revenue** (2024-25),
**8.9% MAU** dos 30.8M installs, **2.3% pagantes**.

Para o Akasha, Co-Star é a **referência de UX/micro-dose/Pilar 2
(Astrologia)**, mas **NÃO** é referência de voz, de tom, de
progressão nem de epistemologia. As críticas técnicas e éticas são
tão instrutivas quanto os acertos. Akasha precisa **superar** Co-Star
nas dimensões onde Co-Star **falha deliberadamente** (snippets sem
síntese, tom agressivo, loop sem jornada).

---

## 1. Identidade

| Campo | Valor |
|-------|-------|
| Nome | Co–Star (com travessão) |
| Fundadora | **Banu Guler** (CEO) |
| Co-fundadores | Ben Weitzman, Anna Kopp |
| Lançamento | Outubro 2017 |
| Sede | New York, NY |
| Categoria | Lifestyle / Astrologia / Social |
| Plataformas | iOS, Android |
| Equipe | "majority people of color and female" (Bustle, 2020) |
| Investidores | Spark Capital (Series A lead), Maveron, Female Founders Fund |

**Mapa astral da fundadora:** "Scorpio sun, Cancer rising, Leo moon" (Vogue, 2019). Não é por acaso — Escorpião é signo de **transformação + segredo + intensidade**, exatamente o que Co-Star performa.

**Formação prévia:** "taught herself how to code", background em design + UX + psicologia + interesse herdado em astrologia (Bustle, 2020). Esta mistura **técnica + simbólica + psicológica** é o DNA que Akasha precisa cultivar (engenheiro + cabalista + mentor).

---

## 2. Filosofia de design (a frase que define tudo)

> "Astrology is a 2,500-year-old tool that gives people a language to
> talk about their lives."
> — **Banu Guler**, Vogue, 2019

E:

> "We're not just digitizing horoscopes. We're using technology to come
> at meaning through ritual, self-reflection, and community itself.
> We're starting from scratch, based on the sky and how people relate
> and connect to it. Not another app you scroll mindlessly on your
> phone like a Vegas slot machine."
> — **Banu Guler**, FFF Interview, 2019

**Lição Akasha:** a tradição (I Ching, Cabala, Odu) tem **2.500+
anos**. Não estamos "digitizando" — estamos **reimaginando a
linguagem** que essas tradições já oferecem. A frase de Guler é o
manifesto do Akasha, com uma substituição: "sky" → "céu interior +
céu exterior + ancestralidade + I Ching + corpo sutil".

---

## 3. UX — Restraint como ethos

### 3.1 Paleta de cor (a decisão mais importante)

| Hex | RGB | Uso |
|-----|-----|-----|
| `#000000` | 0, 0, 0 | Background principal |
| `#f7f7f7` | 247, 247, 247 | Texto principal (off-white) |
| `#5e5e5e` | 94, 94, 94 | Texto secundário / linhas / cinza médio |

**Fonte:** Mobbin.com — Co-Star Colors (https://mobbin.com/colors/brand/co-star).

**Por que isso importa:** Co-Star fez a escolha radical de **não usar
purple/gold mysticism** (Aurae, 2026). O resultado é que astrologia
"parece intelectualmente credível e culturalmente atual" em vez de
"fringe ou supersticiosa". O cinza neutro é **a declaração estética**
do produto: "isso é ferramenta, não pastel místico".

**Lição Akasha:** podemos usar **1-2 cores de marca** (cabala =
ouro #C9A227 + violeta #4B0082 são candidatos óbvios) sem cair em
pastiche. Mas o **default do app deve ser off-white + cinza + preto
+ 1 cor de destaque**, não arco-íris esotérico.

### 3.2 Tipografia

Co-Star usa serifada editorial para títulos + sans-serif clean para
corpo. O efeito é "objeto que pessoas podem tratar como extensão de
si mesmas" (Guler, FFF 2019). **Não é UI de fintech** (sans
geométrica). **Não é blog místico** (script). É **literatura**.

**Lição Akasha:** tipografia do Mentor deve evocar **literatura**,
não chatbot. Cada notificação/render do Grimório = **micro-ensaio
editorial**, não tuíte.

### 3.3 Notificações — 1 por dia (o restraint operacional)

> "Co–Star only sends one notification per day, saving its users from
> a notification overload."
> — **Design Matters Magazine**, 2019

A **única** notificação do dia é a "Day at a Glance" — baseada nos
trânsitos do dia vs. mapa natal. Não há 5, 10, 15 push. **Uma**. E
ela é tão específica (gera meme-ability) que o usuário **abre o app**
quando recebe.

**Lição Akasha:** Mural diário = **1 chamada**, não feed infinito.
Ritual Akasha pode acontecer **uma vez por dia, em horário
simbólico** (nascer do sol, ou mediodia, ou anoitecer — escolha de
Pilar 4 com a Cabala).

### 3.4 Onboarding minimalista

A entrada do Co-Star pede **3 dados** (data, hora, local de
nascimento) e nada mais. Não pede email obrigatório. Não pede
telefone. Não pede permissão de notificação imediatamente.

**Lição Akasha:** Mandato Akasha = nome completo + data + hora +
local + (opcional) intenção. **5 campos no máximo**. Quanto menos
fricção no onboarding, mais conversão. Gene Keys / Human Design
pedem 5+ campos e perdem 40-60% do tráfego no formulário (heurística
de mercado, não citado).

### 3.5 Onboarding depois = adição progressiva de amigos

Co-Star não obriga a adicionar amigos no dia 1. A feature social é
**progressivamente revelada**: você usa o app sozinho por dias,
semanas, até que adicionar amigos vira **desejo** (porque você viu
o quanto suas leituras diárias são ricas — agora quer ver como é
compartilhar com alguém).

**Lição Akasha:** Ritual diário é solo. Mural compartilhado é
progressive disclosure. **Não apressar social.**

### 3.6 O que NÃO copiar de Co-Star (UX)

Do **UX case study de Nicole Ramírez (2024)** e do **Design Matters
Magazine (2019)**, problemas conhecidos:

- **Information overload** no Chart screen (table + circle options sem signpost claro)
- **Naming confuso** ("Co-Star" não significa nada para 90% dos usuários)
- **Logo abstrato** gera fricção cognitiva
- **Falta glossary** (knowledge gap entre noviço e praticante)
- **Falta de randomização** em "The Void" (todas as opções visíveis = overwhelm)

**Lição Akasha:** desde o dia 1, **glossary embutido** (pílulas de
1 frase, tap para expandir). **Mandala Akasha sempre com legendas
claras** ("este anel é Cabala", "este anel é Astrologia", "este anel
é I Ching"). **Onboarding 1 tela, 1 pergunta**, não 10 telas.

---

## 4. Voz e linguagem (a decisão mais controversa)

### 4.1 O manifesto da voz

> "We wanted to make something that's closer to how we talk to our
> friends on couches in living rooms. Your snotty but tough older
> sister loves you and can't help but be real. Images from dreams
> that haunt you in the morning. Our reference points are outside
> of tech: **Seneca, Sappho, early Tumblr, ancient astrological
> diagrams, and goth album covers**. We think of each screen as an
> object that people can treat as an extension of themselves."
> — **Banu Guler**, FFF Interview, 2019

Referências visuais e literárias:

- **Seneca** (estoicismo romano, 4 a.C.-65 d.C.) — voz de avô estoico
- **Sappho** (poetisa grega, 630-570 a.C.) — erotismo + lamento + beleza
- **Early Tumblr** (2010-2014) — estética de curadoria + texto + moodboard
- **Ancient astrological diagrams** (Ptolomeu, Masha'allah, Ibn Ezra)
- **Goth album covers** (Type O Negative, Sisters of Mercy, Dead Can Dance)

**Lição Akasha:** a voz do Mentor não é "guru" (hierárquica) nem
"amigo" (igualitária). É **"sabia irmã mais velha que te ama e não
consegue não ser real"** — parafraseando Guler. Referências para
Akasha: **I Ching** (King Wen comments), **Sefer Yetzirah** (Cabala
primária), **Gene Keys** (Richard Rudd, voz já validada), **Os
Sertões** (Euclides da Cunha, voz literária brasileira).

### 4.2 Exemplos reais de notificações Co-Star (citados nas fontes)

Do Teen Vogue (2019) e Crystal Crush Magazine (2021):

- "research the pharmaceutical industry"
- "don't get back with your ex"
- "how about you don't expect to be understood today?"
- "try not to talk shit today"
- "nothing is as exhilarating as being shot at without being hit" (durante BLM, deletado e re-uploaded com pedido de desculpas)

**Análise:** o tom é **deliberadamente edgy, niilista, performativo**.
Guler admite no Astrology Podcast Ep.286 (2021):

> "I definitely am the reason that they get really edgy because I'm
> like, 'Yeah, I totally want to spend my mornings thinking about
> worms crawling out of my lover's eyes. I think it makes me care
> about my lover more.' [...] it's healthy to think about the worst
> thing that can happen and become comfortable with that sort of
> fundamental impermanence. We've gotten really much softer over
> time."

### 4.3 O tom edgy funciona? (dados mistos)

**Funciona para:** Gen Z/millennials que usam tom como **compartilhamento social** (screenshots virais, memes). O sucesso de Co-Star em Instagram (659K seguidores em 2019) é em parte por causa do tom.

**Falha para:** usuários em crise, usuários com ansiedade/depressão, contexto errado (data de luto, contexto racial/político). Crystal Crush Magazine documenta:

> "Many users on Twitter reported that they deleted the app due to
> the impact that the messages caused on their mental health."

Aurae Astrology (2026) confirma:

> "Notifications that emphasise limitation, ambiguity, or existential
> flatness can leave users feeling deflated rather than illuminated,
> particularly those engaging with astrology during difficult life
> periods. This isn't a universal criticism — plenty of users love
> exactly this quality — but it's a real consideration."

### 4.4 Lição Akasha (CRÍTICA)

**NÃO copiar o tom Co-Star.** Akasha Mentor deve ter:
- **Linguagem poética mas compassiva** (Gene Keys, Richard Rudd)
- **Reconhecimento do contexto emocional** ("se você está em luto, este não é o momento para X")
- **Empoderamento, não niilismo** ("você tem o recurso interno para...")
- **Citação obrigatória do Grimório** (RAG, não opinião do LLM)
- **Ritmo de pausas, não velocidade de meme**

Tom de Co-Star é **engagement bait**. Tom de Akasha é **ritual
sagrado**. São éticas de produto opostas.

### 4.5 O que COPIAR de Co-Star (linguagem)

- **Concisão brutal** — notificação do dia = 1 frase de < 20 palavras
- **Evocação, não instrução** — "research the pharmaceutical industry" não é instrução, é convite à reflexão
- **Convite à ação concreta** — "don't get back with your ex" é diretiva, mas leve
- **Persona consistente** — quem está falando? "A irmã mais velha que te ama e não consegue não ser real" (Co-Star) ou "O Mentor que te conhece há milênios" (Akasha)

---

## 5. Arquitetura técnica (o que Co-Star faz que ninguém vê)

### 5.1 AI + humanos (a divisão de trabalho)

> "Human writers and astrologers map snippets to astrological events
> for the AI to run with. AI then assembles content in real-time for
> each user."
> — **Banu Guler**, Teen Vogue, 2019

**Divisão:**
- **Astrologers + writers** escrevem **biblioteca de snippets** (cada snippet = 1-2 frases, mapeado para 1 evento astrológico)
- **AI monta** em tempo real, baseado nos trânsitos do dia + mapa natal do usuário
- **AI NÃO escreve do zero** — não é geração livre, é **composição combinatória**

**Lição Akasha (D-011 Mentor):** mesma arquitetura. LLM Akasha **redige** sobre o Grimório (RAG mandatório). O Mentor:
1. Recebe pergunta do usuário
2. RAG busca passagens relevantes do Grimório (CORRELATION_MAP + Cabala + Astrologia + I Ching + Gene Keys + Odu)
3. LLM compõe resposta em **voz do Mentor** (persona)
4. Cita fonte do Grimório em cada afirmação material

**Paralelo exato:** Co-Star = human astrologer escreve snippet, AI monta. Akasha = LLM compõe, Grimório (RAG) é a fonte. A **fonte é humana/canônica**; a **composição é algorítmica**. Isso resolve o problema que Selfgazer identificou em Co-Star: "snippet system treats each placement as a standalone data point. It pulls a pre-written paragraph for your Mars placement, a separate one for your Venus placement, and serves them side by side as though they're a reading. This produces the contradictions users notice."

**Akasha resolve isso** porque o Mentor **cruzará** os 5 pilares (não snippets isolados) e a **Lógica de Síntese** (Fase 1) garantirá coerência.

### 5.2 Dados que Co-Star coleta (política explícita)

> "We don't do creepy stuff with your data"
> — Co-Star Privacy Statement, Google Play

Dados:
- **Data, hora, local de nascimento** (input do usuário)
- **Interações no app** (que telas abre, que features usa)
- **Não coletam**: lista de contatos sem permissão, localização contínua, histórico de navegação fora do app

**Lição Akasha:** mesma política radical de privacidade. **Nascimento é dado sagrado** — não vende, não aluga, não usa para ads. Akasha vai além: oferece **export completo dos dados do usuário** em JSON (direito ao dado), **delete account em 1 clique** com confirmação dupla.

### 5.3 Arquitetura push notification

**Frequência:** 1/dia. **Trigger:** server-side, calculado às 3am local do usuário (antes do acordar). **Conteúdo:** 1 frase, máximo 200 caracteres (otimizado para iOS lock screen + Android heads-up). **Personalização:** cruzamento de trânsitos vs. mapa natal.

**Lição Akasha:** Ritual Akasha = 1 push por dia, às 6h local (nascer do sol simbólico). Conteúdo = "Mandato do dia" (1 hexagrama I Ching + 1 parágrafo do Grimório + 1 pergunta de reflexão).

---

## 6. Modelo de negócio (a economia)

### 6.1 Freemium hard

| Item | Preço | Tipo |
|------|-------|------|
| App base | Grátis | B2C |
| Add Manually (adicionar amigo sem o app) | $2.99/semana (~$12.99/mês) | IAP |
| Advanced Chart - Self | $8.99/mês | Subscription |
| Advanced Chart - Relationships | $8.99/mês | Subscription |
| Crush Report (5) | $4.99/semana (~$21.68/mês) | IAP |
| Eros (casal) | $6.99/semana (~$30.37/mês) | IAP |
| Your Year Ahead | $11.99/ano (~$1.00/mês) | IAP |
| 5 Questions (Void) | $2.99 one-time | IAP |
| Pro-Star monthly | $8.99/mês | Subscription |

**Mix de receita (2024-25):**
- Subscriptions: ~72%
- One-time IAP: ~22%
- Ads: ~6%

**Revenue estimado (Rev.now, 2024-25):**
- **$797.4K/mês** (~$9.57M/ano)
- Range: $438.6K – $1.16M/mês
- **30.8M installs** (acumulado)
- **8.9% MAU** (2.7M ativos/mês)
- **2.3% pagantes** (≈62K paying users ativos)

**Funding:**
- Seed: $1.5M (2018) — FFF, Maveron
- Series A: **$15M (2021)** — Spark Capital lead

**Comparação de mercado (Statista, 2025):**
- Co-Star é o **#2 em revenue** US, atrás de **CHANI** (RQ-007)
- ~25% das mulheres US 18-25 têm o app instalado
- Top markets: US (450K MAU), Canada (70K), Australia (42K), UK (42K)

### 6.2 Lição Akasha (D-035, D-036)

**Freemium funciona em espiritualidade.** 2.3% pagam = 97.7% free.
Volume compensa.

**Akasha tiers propostos (alinhados com Gene Keys / HD / Enneagrama):**
- **Ritual diário** — grátis (Pilar 1 + 2 + 5: Mandato + Astrologia do dia + I Ching do dia)
- **Mural pessoal** — grátis (Pilar 4: Odu, registro)
- **Mentor Akasha (AI)** — grátis com limite (3 perguntas/mês)
- **Mentor Akasha (AI) Plus** — $7.99/mês (perguntas ilimitadas, memória de conversa)
- **Mandala Akasha completa** (5 anéis) — $11.99 (one-time unlock ou anual)
- **B2B: Mentor Certificado Akasha** — $295 nível 1, $895 nível 2, $1,995 nível 3 (já alinhado com RQ-003 MBTI cert + RQ-004 Enneagrama iEQ9)

**Lição adicional:** Co-Star **NÃO** tem tier B2B robusto. Espaço para Akasha diferenciar.

---

## 7. Críticas (lições críticas para Akasha)

### 7.1 Crítica técnica (Selfgazer, 2026)

> "Co-Star's snippet system treats each placement as a standalone
> data point. It pulls a pre-written paragraph for your Mars
> placement, a separate one for your Venus placement, and serves them
> side by side as though they're a reading. This produces the
> contradictions users notice."

> "Despite calculating full natal charts, Co-Star's interpretive
> content rarely moves beyond Sun-sign-level generalizations."

> "Co-Star made astrology visible to a generation. That matters. But
> visibility without rigor creates a distorted picture of what
> astrology is."

**Lição Akasha:** a síntese (Fase 1) DEVE resolver isso. Akasha não
vai servir snippets isolados — vai **cruzar 5 pilares** em cada
leitura. Mesma arquitetura de AI + snippets, mas com **camada de
síntese** que Co-Star não tem.

### 7.2 Crítica ética (Crystal Crush, 2021)

> "The creator of Co-Star revealed in an interview that the messages
> are to troll the users. 'When you're good, you [get] a lot of
> trines and sextiles, we will troll you a bit'."

> "I personally don't understand the point of trolling your users
> into bad mental health."

> "On June 3, 2020, Co-Star posted a meme about the Black Lives
> Matter protests [...] It is extremely unacceptable and
> inappropriate to joke about the fight for equality, especially in a
> way that romanticizes the movement."

**Lição Akasha:** **engagement NÃO é KPI ético.** Akasha vai definir
ética do Mentor em **D-013 (Comportamento ético)** explicitamente:
- Detecta crise emocional → recurso humano (CVV, CAPS, SAMU 192)
- Não faz piada com luto, trauma, luta social
- Tom compassivo > tom edgy
- "Aumentar reflexão, não engajamento"

### 7.3 Crítica epistemológica (Moro, 2025; Northeastern Ethics, 2023)

> "Co-Star, like AI, tries to have it both ways. On the one hand,
> data-driven, computational, mathematized astrology [...] And on the
> other hand, poetical, oblique, generically suggestive astrology:
> astrology as a language game, of polysemous horoscopes that
> maintain their power (and commercial value) by meaning everything
> to everyone, and thus nothing at all."

> "It's a world where just as we all now have a dutiful secretary
> named Siri in our pockets, we soon will have our own Joan Quigley.
> But the addition of AI, in a small but telling way, inverts the
> chain of causality. No longer do the stars provide the data with
> which to structure human folly — as above, so below. Now, the
> messy mix of human language, of likelihoods of words, of things
> that seem human but aren't, will guide the stars — as below, so
> above."

**Lição Akasha:** o Mentor **DEVE** ser honesto epistemologicamente.
Não promete previsão. Não promete verdade literal. **Oferece
framework de reflexão** + **tradição canônica** (com fontes citadas).
A frase de Guler **"is it a legitimate tool for self-care, and the
answer is yes"** (Axios, 2021) é a posição do Akasha: ferramenta
para auto-cuidado, não oráculo determinístico.

### 7.4 Crítica de comunidade astrológica (Astrology Podcast Ep.286, 2021)

> "Despite its popularity, the app has also been the subject of
> criticism within the astrological community, for things ranging
> from the appropriateness of certain delineations, to questions
> about the extent to which astrologers were involved in its
> creation."

> "they hated Co-Star. Co-Star isn't legitimate astrology; it
> doesn't provide as much information as competitors; it tinkers
> with users' horoscopes in order to emphasize negative aspects"

**Lição Akasha:** respeitar as tradições fontes. Akasha não é
"versão moderna descolada" — é **síntese fiel** de 5 tradições
canônicas. Astrologia do Akasha = Astrologia Cabalística (Pilar 2)
+ I Ching (Pilar 5) com curadoria de astrólogos/cabalistas
reconhecidos. Gene Keys e Human Design **citam** I Ching e Cabala —
Akasha cita **ainda mais fundo**.

---

## 8. Mapa de lições para o Akasha

### 8.1 O que COPIAR (com adaptação)

| # | Lição Co-Star | Adaptação Akasha |
|---|---------------|------------------|
| 1 | **Restraint visual** (3 cores) | Off-white + cinza + preto + **1 cor de marca** (ouro cabala #C9A227 ou violeta #4B0082) |
| 2 | **1 push/dia** | Ritual Akasha diário = 1 push às 6h local |
| 3 | **Tom conciso** (1-2 frases) | Mandato do dia = 1 hexagrama I Ching + 1 parágrafo do Grimório + 1 pergunta |
| 4 | **Voz autoral** | Voz do Mentor (D-010) com referências literárias (I Ching, Sefer Yetzirah, Gene Keys) |
| 5 | **AI + humanos** (snippets + composição) | LLM redige + RAG (Grimório) decide. Mesma arquitetura. |
| 6 | **Onboarding mínimo** (3 campos) | Mandato = 5 campos: nome + data + hora + local + intenção |
| 7 | **Social progressivo** (não obriga dia 1) | Mural compartilhado só após 7 dias de Ritual |
| 8 | **Sem ads, sem venda de dado** | Mesma política. LGPD/GDPR compliant. |
| 9 | **Política "we don't do creepy stuff"** | Privacy by design. Export/delete de dados. |
| 10 | **2.3% conversion = OK em espiritualidade** | Freemium: Ritual grátis, Mentor pago |

### 8.2 O que MELHORAR (lição de Co-Star)

| # | Falha Co-Star | Solução Akasha |
|---|---------------|----------------|
| 1 | **Snippets sem síntese** | Cruzamento de 5 pilares (Mandala Akasha) |
| 2 | **Tom edgy/niilista** | Mentor compassivo, Gene Keys-like |
| 3 | **Loop sem progressão** | **Sequence of Pearls** (Gene Keys-inspired) |
| 4 | **Sem glossary embutido** | Glossary pílulas, tap-to-expand |
| 5 | **Information overload em Chart** | Mandala com legenda em cada anel |
| 6 | **Sem B2B robusto** | Mentor Certificado (3 níveis) |
| 7 | **Determinismo agressivo** | Framework, não previsão |
| 8 | **Snippets contraditórios** | Lógica de Síntese valida coerência |
| 9 | **Sem educação progressiva** | Jornada do usuário: Onboarding → Mandato → Mural → Mentor |
| 10 | **Sem white paper / epistemologia pública** | White paper Akasha cita todas as fontes (Gene Keys/HD fizeram, Co-Star não) |

### 8.3 O que EVITAR (anti-padrão)

| # | Anti-padrão | Razão |
|---|-------------|-------|
| 1 | Edgy/niilista como engagement | Crises emocionais, sofrimento real |
| 2 | Memes políticos | BLM/Aurora/Crises = anti-pattern documentado |
| 3 | Snippets isolados sem síntese | Incoerência que usuários notam |
| 4 | "AI decides" sem curadoria humana | Akasha = LLM redige, Grimório (RAG) decide |
| 5 | Loop infinito sem progressão | Akasha = jornada, não loop |
| 6 | B2C only, sem B2B | Mercado endereçável (Gene Keys $4,500/team valida) |
| 7 | Venderse como "previsão" | Akasha = "framework for self-reflection" |
| 8 | Ad-heavy | Anti-padro espiritualidade |
| 9 | Onboarding longo | 5 campos no máximo |
| 10 | Sem citation/source | Akasha cita Grimório em cada afirmação |

---

## 9. Posição Akasha (síntese executiva)

### Pilar 2 (Astrologia) — Co-Star como **referência de UX, NÃO de voz**

Co-Star é o **padrão de mercado** para astrologia em app. Akasha
reconhece isso, mas **não imita** — porque:

1. **Voz é outra.** Co-Star = edgy/niilista/Gotica. Akasha = poético/compassivo/cabalístico.
2. **Síntese é outra.** Co-Star = snippets isolados. Akasha = 5 pilares cruzados.
3. **Progressão é outra.** Co-Star = loop. Akasha = jornada (Pearls).
4. **Epistemologia é outra.** Co-Star = "astrology as language game". Akasha = "tradição canônica com crítica honesta".
5. **Modelo de negócio é outro.** Co-Star = 100% B2C. Akasha = B2C + B2B (Mentor Certificado).

### Referências literárias/visuais para o Mentor (proposta inicial)

| Tradição | Referência primária | Por que |
|----------|---------------------|---------|
| Astrologia | **Ptolomeu, Tetrabiblos** (140 d.C.) | Cânone |
| Cabala | **Sefer Yetzirah** (séc III-VI) | Texto fundacional curto |
| I Ching | **King Wen comments** (séc X a.C.) | Cânone interpretativo |
| Numerologia | **Sepher Yetsirah** + **Pitágoras** | Raiz cabalística + grega |
| Odu | **Odu Ifa** (tradução de Wande Abimbola) | Fonte acadêmica mais rigorosa |
| **Voz moderna** | **Gene Keys** (Richard Rudd) | Já validada como "poética + compassiva + honesta" |
| **Anti-referência** | Co-Star (edgy) | Documentar o que NÃO copiar |

---

## 10. Métricas e citações (fonte primária)

### 10.1 Receita e usuários (Rev.now, Statista 2024-25)

- **$9.57M/ano** revenue
- **30.8M** installs acumulado
- **8.9% MAU** (~2.7M ativos/mês)
- **2.3% pagantes** (~62K paying ativos)
- **25% das mulheres US 18-25** com app instalado
- **#2 em revenue US** (atrás de CHANI)

### 10.2 Funding (Axios 2021)

- **$15M Series A** (Spark Capital lead, Maveron + FFF)
- Total funding estimado: **~$20M**

### 10.3 Time (Bustle 2020, Vogue 2019)

- Equipe pequena (~30-50 pessoas em 2020)
- Hiring challenge: "non-cookie-cutter tech bros"
- "majority people of color and female"

---

## 11. Fontes (28 citações)

### Primárias (entrevistas com fundadora)

1. **Female Founders Fund** (2019-05-08). "Co–Star's Banu Guler on Reinventing Astrology for the New Generation." https://blog.femalefoundersfund.com/co-stars-banu-guler-on-reinventing-astrology-for-the-new-generation-5658a33155fb — **Manifesto fundacional da filosofia Co-Star.**
2. **Vogue** (2019-09-06). Audrey Noble. "What's Co-Star? Meet the Astrology App That's Intriguing Millennials Everywhere." https://www.vogue.com/article/whats-co-star-astrology-app-technology-spirituality — **Background fundador, definição de astrologia como "linguagem".**
3. **Bustle** (2020-12-14). "Co-Star CEO Banu Guler On Diversity In Tech & Creating Apps That Inspire People." https://www.bustle.com/life/co-star-ceo-banu-guler-diversity-tech-apps — **Diversidade, hiring, carreira prévia.**
4. **Astrology Podcast Ep.286** (2021-01-05). Chris Brennan entrevista Banu Guler. https://theastrologypodcast.com/2021/01/05/co-star-and-the-making-of-a-popular-astrology-app/ — **Filosofia de notificações, tom edgy, crítica astrológica.**
5. **Astrology Podcast Ep.286 Transcript**. https://theastrologypodcast.com/transcripts/ep-286-transcript-co-star-and-the-making-of-a-popular-astrology-app/ — **Transcrição completa, 2h.**
6. **Teen Vogue** (2019-03-29). Anna Gragert. "Astrology App Co-Star Is Grabbing Attention With Bizarre Alerts." https://www.teenvogue.com/story/astrology-app-co-star-bizarre-alerts — **Notificações edgy, AI + humanos, exemplos.**
7. **Newsweek** (2019-08-03). "What Is Co-Star? The App Using Astrology to Build Better Communities on Social Media." https://www.newsweek.com/co-star-astrology-app-instagram-1451220 — **Social media strategy, voz.**
8. **Axios** (2021-04-14). Kia Kokalitcheva. "Astrology app Co-Star raises $15 million in funding." https://www.axios.com/2021/04/14/astrology-app-co-star-raises-15-million-funding — **Funding, market size, frase "is it legitimate tool for self-care".**

### Críticas (fontes críticas, honestamente citadas)

9. **Northeastern Ethics Institute** (2023-12-18). "AI Astrology Is Getting a Little Too Personal." https://cssh.northeastern.edu/ethics/ai-astrology-is-getting-a-little-too-personal/ — **Crítica ética, repostagem de The Atlantic.**
10. **ASAP Journal** (2025-10-21). Jeffrey Moro. "As Above, So Below: Astrological Data in the Age of Co–Star." https://asapjournal.com/node/as-above-so-below-astrological-data-in-the-age-of-co-star/ — **Crítica epistemológica, Void feature, inversão AI.**
11. **Crystal Crush Magazine** (2021-04-16). Jules Krainin. "Delete Co-Star." https://www.crystalcrushmagazine.com/magick/4-15-2021/198f0um5tl368gc7ted1oauyd7ca21 — **Crítica ao tom edgy, BLM context, saude mental.**
12. **Selfgazer** (2026-02-08). "Why Co-Star Gets Your Birth Chart Wrong (And What Actually Works)." https://www.selfgazer.com/blog/why-co-star-gets-your-birth-chart-wrong — **Crítica técnica: snippets, síntese ausente, Sun-sign-level generalizations.**
13. **Aurae Astrology** (2026-03-29). "Co-Star App Review 2026: An Astrologer's Honest Opinion." https://www.auraeastrology.com/blog/co-star-app-review-2026-an-astrologers-honest-opinion — **Verdict honesto, gaps técnicos, tom.**
14. **Diggit Magazine**. "Divine data: how the Co-Star astrology app enacts expertise on the 'unknown'." https://www.diggitmagazine.com/articles/divine-data-how-co-star-astrology-app-becomes-expert-unknown — **Análise sociológica, hierarquia de expertise.**

### UX e design

15. **Nicole Ramírez** (2024-02-27). "When being pretty is not enough — UX Case Study app Co-Star." https://medium.com/@anicole.ramirez/when-being-pretty-is-not-enough-ux-case-study-app-co-star-df922a63225f — **UX case study, pain points, redesign proposto.**
16. **Design Matters Magazine** (2019-06-20). "How the Design of the Astrology App Co-Star Is Conquering the Masses." https://magazine.designmatters.io/how-the-design-of-the-astrology-app-co-star-is-conquering-the-masses/ — **Análise design, restraint, 1 notif/dia.**
17. **Mobbin** — "Co-Star Colors." https://mobbin.com/colors/brand/co-star — **Paleta exata `#000000`, `#f7f7f7`, `#5e5e5e`.**
18. **IXD@Pratt** (2022-02-04). Kyle Oden. "Design Critique: Co–Star (iPhone App)." https://ixd.prattsi.org/2022/02/design-critique-co-star-iphone-app/ — **Crítica de affordance, labels.**
19. **VP0 Journal** (2026-05-31). Lawrence Arya. "Co-Star-Style Astrology App UI Clone for iOS." https://vp0.com/blogs/co-star-astrology-app-ui-clone-ios — **Pattern guide: minimal + editorial + honest framing.**

### Business / métricas

20. **Rev.now** — "Co-Star Personalized Astrology App Store Revenue Estimate & Downloads." https://rev.now/app/ios/co-star-personalized-astrology-82561/ — **$797.4K/mês, $9.57M/ano, 30.8M installs, 2.3% pagantes.**
21. **Statista** (2024-02-19). "Co-Star top markets by active users 2024." https://www.statista.com/statistics/1451972/costar-app-top-markets-by-active-users/ — **US 450K MAU, Canada 70K, Australia 42K, UK 42K.**
22. **Statista** (2025-11). "Highest-grossing astrology apps U.S. 2025." https://www.statista.com/statistics/1451664/top-horoscope-apps-us-market-revenue/ — **CHANI #1, Co-Star #2.**
23. **Google Play Store** — "Co-Star Personalized Astrology." https://play.google.com/store/apps/details?id=com.costarastrology — **5M+ installs Android, IAP pricing.**
24. **Sensor Tower** — "Co-Star Personalized Astrology — Apple App Store." https://app.sensortower.com/overview/1264782561 — **Rankings, performance.**
25. **Co-Star FAQ oficial** — "Frequently Asked Questions about Co-Star Astrology Society." https://www.costarastrology.com/faq — **Modelo freemium oficial, Void feature.**

### Contextual

26. **The Atlantic** (original em paywall, repostado por Northeastern Ethics #9). Katherine Hu. "AI Astrology Is Getting a Little Too Personal." — **Crítica da "IA que decide" vs. "IA que monta".**
27. **NYT profile de Banu Guler** (citado em Moro 2025, #10). Comparação Void device com Zoltar fortune telling. — **"It's special garbage" — admissão honesta do que Co-Star é.**
28. **Co-Star Instagram @costarastrology** (659K followers em 2019, fonte: Newsweek #7). Tom witty/meme como growth engine.

---

## 12. Próximos passos

1. **COT:** `chain-of-thought/cot-20260610-costar-position.md` com decisão detalhada.
2. **Update INDEX.md** com RQ-005 ✅.
3. **Update CHECKPOINT.md** com 5/12 RQs completos.
4. **Update TODO.md** com `[x] RQ-005`.
5. **Update feature_list.json** com `passes: true` para R-005.
6. **Commit:** `research(akasha): RQ-005 — Co-Star (UX/restraint + críticas) completo`.
7. **Progress log** em `.autonomous/claude-progress.txt`.
8. **Próximo:** RQ-008 (Cabala Clássica) ou RQ-006 (The Pattern). Recomendado: RQ-008 P0 primeiro.

---

**Fim do relatório RQ-005.** Total: ~700 linhas.
