# 👥 Personas — Akasha Portal

> **Wave:** 15 | **Data:** 2026-06-27 | **Branch:** main
> **Status:** Documento de design (validação de produto)
> **Pergunta respondida:** "Para quem estamos desenhando o Akasha Portal?"
> **Base empírica:** `docs/UX-RESEARCH.md` v1.0 (2026-06-26) + desk research (Calm, Headspace, Insight Timer, 7 Cups, TalkLife, Woebot, Amino Apps, Reddit r/spirituality)

---

## TL;DR

5 personas cobrindo **5 tradições principais** + **5 estágios de maturidade espiritual** + **5 perfis de uso (intelectual → terapêutico → comunitário)**.

| # | Persona | Idade | Tradição primária | Canal principal | Aha moment | Deal breaker |
|---|---|---|---|---|---|---|
| 1 | **Ana, a Cabalista** | 32 | Cabala | Substack + Twitter/X | "Minha mapa cabalístico cruzou com Ifá e fez sentido" | Pergunta raso + "previsão genérica" |
| 2 | **João, o Bábalaô** | 45 | Ifá (Candomblé) | WhatsApp + YouTube | "Os mais velhos do terreiro validam o que o app diz" | Falsa equivalência entre tradições |
| 3 | **Marina, a Tantrika** | 28 | Tantra moderno | Instagram + podcasts | "A Akasha IA fala de corpo sem ser cringe nem clínico" | Linguagem esotérica sem cuidado com trauma |
| 4 | **Carlos, o Terapeuta** | 55 | Meditação clínica | Email newsletter + Academia | "Posso indicar pra pacientes com confiança" | Promessas de cura + falta de disclaimer |
| 5 | **Lúcia, a Xamã Jovem** | 22 | Xamanismo / Neo-paganismo | TikTok + Discord | "Encontrei minha tribo sem virar meme" | App "sério demais" ou "superficial demais" |

---

## Persona 1 — Ana, a Cabalista Exploradora

```
┌─────────────────────────────────────────────────────────────┐
│  ANA, 32                                                  │
│  "Quero entender a estrutura por trás do mistério."      │
└─────────────────────────────────────────────────────────────┘

Idade:       32
Localização: São Paulo, SP (capital, zona sul)
Tradição:    Cabala (Hermética) — 4 anos de estudo formal
Background:  Designer UX, formada em Design pela ESPM.
             Vegana, terapeuta holística em formação.
             Leu "O Poder do Agora", "A Cabala Mística",
             "As 72 Faces do Êxtase".

Devices:     iPhone 14 (90% do tempo), MacBook Air (deep work)
Tráfego:     Conexão wifi estável + 4G. Night-mode sempre ON.

Channels (onde ela ESTÁ):
  • Substack pessoal (writer)
  • Twitter/X (filosofia, tarot, Jung)
  • Pocket (salva artigos pra ler depois)
  • Podcasts: "Palavra Cruzada", "That's So Retrograde"
  • YouTube: "ReligionForBreakfast", "Patrícia Abravanel" (rs)

Goals (3):
  1. Compreender correlações entre tradições (Cabala + Ifá + Astrologia)
     sem cair em sincretismo raso.
  2. Construir um diário espiritual estruturado que CRESCE com ela
     (não só "postar pra likes").
  3. Encontrar uma comunidade de praticantes sérios — não espiritualidade
     de Instagram ("✨manifestando✨").

Pain points (3):
  1. Apps de tarot/astrologia são rasos — sentem como horóscopo de revista.
  2. Discord/Telegram de Cabala são tóxicos ou paywalled demais.
  3. Não consegue aprofundar sem virar "acadêmica de tradição" —
     precisa de camadas (introdutório + avançado no mesmo app).

Aha moment (o que faria ela AMAR):
  → O mapa cabalístico dela (Sephirot + Caminhos + Tiferet)
  CRUZOU com o Odu de Nascimento + Mapa Astral num único dashboard
  com explicações escritas POR praticantes de cada tradição,
  não por IA genérica. "Finalmente alguém trata Cabala com a
  profundidade que ela merece, mas sem exigir 10 anos de estudo."

Deal breaker (o que faria ela ABANDONAR):
  → Ver uma única equivalência forçada tipo "Kether = Oxalá"
  sem contexto. Ou ler um post que mistura Cabala com "lei da
  atração" genérica. Ela detecta superficialidade em 5 segundos.
```

---

## Persona 2 — João, o Bábalaô Tradicional

```
┌─────────────────────────────────────────────────────────────┐
│  JOÃO, 45                                                │
│  "O conhecimento dos mais velhos precisa estar            │
│   na mão dos mais novos."                                 │
└─────────────────────────────────────────────────────────────┘

Idade:       45
Localização: Salvador, BA (Pelourinho / Santo Antônio)
Tradição:    Ifá / Candomblé (Ketu) — 20 anos de axé
Background:  Zelador de santo há 12 anos. Pai de Ogum.
             Trabalha como professor de história do ensino
             fundamental. Renda média, celular intermediário
             (Samsung Galaxy A34).
Devices:     Android (85% do tempo). Notebook compartilhado
             com filhos pra trabalho.
Tráfego:     4G instável em casa (periferia). Wi-fi só na escola.

Channels (onde ele ESTÁ):
  • WhatsApp (grupos do terreiro + correntes)
  • YouTube (Babalawos gringos, "Ponto de Ifá", "Odù Ifá")
  • Facebook (grupos de Candomblé — sim, ainda)
  • Instagram (apenas pra stories do terreiro)
  • Rádio web (sim, ele ouve Awurewa)

Goals (3):
  1. Ensinar Ifá pros filhos de santo sem virar "pregador
     de Instagram" — manter a tradição ORAL com apoio digital.
  2. Validar/comparar seu conhecimento com outros Bábalaôs
     e Zeladores sem expor iniciantes ao ridículo.
  3. Ter um caderno digital de Odu que respeite a hierarquia
     (senhor do Odu, orixá regente, fundamento, ebó).

Pain points (3):
  1. Apps espirituais ignoram Ifá — ou pior, mercantilizam
     ("jogue Ifá online R$ 9,90").
  2. Falsa equivalência entre tradições ofende — "Ogum = Marte"
     sem contexto histórico é reducionismo.
  3. Moderação generalista não entende contexto cultural
     ("Esse ebó é sério, mod julgou como 'bruxaria'").

Aha moment (o que faria ele AMAR):
  → O modo consulta de Odu respeitando a hierarquia:
  * Odù principal (regente)
  * Orixá regente (oficial)
  * Orixá pedindo passagem (kinético)
  * Fundamento (o que fazer)
  * E mostra QUE o conteúdo foi escrito/revisado por
    Bábalaôs reais da tradição (não por "IA espiritual").

Deal breaker (o que faria ele ABANDONAR):
  → Ver a palavra "Ifá" em qualquer seção do app sem o
  devido respeito: sem crédito a sacerdotes, sem revisar
  com a comunidade, sem suporte a ebó/ofredá.
  Ou pior: post que prometa "Ifá pra resolver problema
  amoroso em 7 dias" — isso é EXATAMENTE o que ele
  combate no terreiro.
```

---

## Persona 3 — Marina, a Tantrika Moderna

```
┌─────────────────────────────────────────────────────────────┐
│  MARINA, 28                                               │
│  "Quero reconectar corpo e espírito sem virar coach."    │
└─────────────────────────────────────────────────────────────────┘

Idade:       28
Localização: Rio de Janeiro, RJ (Botafogo)
Tradição:    Tantra moderno (neo-tântrico integrativo)
Background:  Professora de yoga, terapeuta corporal em formação.
             Mãe solo de 1 (5 anos). Feminista interseccional.
             Leu "Prazeres Selvagens", "Womb Wisdom",
             "Urban Tantra".

Devices:     iPhone 15, iPad (consumo de conteúdo), AirPods
Tráfego:     Wi-fi estável. Notificações reduzidas a 4 apps.

Channels (onde ela ESTÁ):
  • Instagram (consome, mas tá saturada)
  • Podcasts: "Holy F*ck", "The Expand", "Vagina: A New Story"
  • Spotify (meditações guiadas)
  • Substack (writers feministas/espirituais)
  • Eventos presenciais (retiros, workshops)

Goals (3):
  1. Explorar espiritualidade que HONRE o corpo (não que
     negue ou culpabilize — frequente em religiões patriarcais).
  2. Encontrar práticas integrativas sem cair em coaches
     de "sexualidade sagrada" que são puro marketing.
  3. Construir uma comunidade de mulheres que estão fazendo
     o mesmo trabalho (sem ser "círculo de cura" tóxico).

Pain points (3):
  1. Apps de meditação têm corpo = "body scan" sem
     inteligência real sobre sexualidade/ciclos.
  2. Conteúdo "tântrico" online é 90% masculino-gaze,
     hetero-normativo, ou puramente sexual.
  3. Trauma não é nomeado nos apps espirituais — silêncio
     ensurdecedor sobre abuso, consentimento, acolhimento.

Aha moment (o que faria ela AMAR):
  → Ver o Akasha abordar Numerologia Tântrica (chakras
  como mapa de EXCESSO/DÉFICE energético, não "ativação
  mágica") + Akasha IA falar de corpo COM cuidado com
  trauma, COM aviso de conteúdo, COM redirecionamento pra
  terapeuta quando apropriado.
  → Saber que TODA a copy foi revisada por consultoras
  feministas.

Deal breaker (o que faria ela ABANDONAR):
  → UMA post ou comentário sexista, transfóbico, ou
  "curador espiritual masculino" falando sobre corpo
  feminino com confiança sem qualification.
  Ou pior: "ativação de chakra" sem consentimento
  informado (ex: "faça isso pra abrir seu coração" =
  desastre em alguém com trauma de abuso).
```

---

## Persona 4 — Carlos, o Terapeuta Clínico

```
┌─────────────────────────────────────────────────────────────┐
│  CARLOS, 55                                              │
│  "Preciso de ferramentas que eu POSSA indicar com       │
│   responsabilidade ética."                                │
└─────────────────────────────────────────────────────────────┘

Idade:       55
Localização: Belo Horizonte, MG (Savassi)
Tradição:    Meditação clínica (MBSR, MBCT — laico)
Background:  Psicólogo clínico CRP-04/12345, mestre em
             TCC pela UFMG. 25 anos de consultório.
             Budista praticante (Theravada, sem filiação
             institucional). Pai de 3 adultos.
Devices:     iPhone 13, Kindle, MacBook (escrita de artigos)
Tráfego:     Fibra ótica em casa. Notificações OFF por padrão.

Channels (onde ele ESTÁ):
  • Email newsletters (Mindful, Greater Good, APA)
  • Academia.edu (papers)
  • ResearchGate
  • LinkedIn (apenas profissional)
  • Podcasts: "The Tim Ferriss Show" (mindfulness ep),
              "Speaking of Psychology" (APA)

Goals (3):
  1. Encontrar um app que COMPLEMENTE a terapia sem
     substituir (não é concorrente, é aliado).
  2. Ter recursos que ele POSSA indicar pra pacientes
     sem medo de vir "promessa de cura".
  3. Contribuir com a base de conhecimento (escrever,
     revisar) como voluntário — busca credibilidade.

Pain points (3):
  1. Apps de meditação prometem "cure ansiedade" —
     éticamente inaceitável pra um clínico responsável.
  2. Apps espiritualizam questões clínicas (depressão vira
     "bloqueio do 3º chakra") — confunde pacientes.
  3. Falta de curadoria clínica visível — quem revisou isso?
     Qual evidência? Qual framework?

Aha moment (o que faria ele AMAR):
  → Ver badges de "revisado por profissional de saúde
  credenciado" + citations de papers (APA, Mindfulness-Based
  Stress Reduction literature) + disclaimer explícito
  "isso NÃO substitui acompanhamento terapêutico" em
  TODA seção que tocar saúde mental.
  → Saber que pode INDICAR com confiança para pacientes
  com ansiedade leve/moderada.

Deal breaker (o que faria ele ABANDONAR):
  → Ver UMA post dizendo "cura ansiedade" / "cura depressão" /
  "ativa glândula pineal" / qualquer promessa absoluta.
  → Falta de disclaimer clínico em conteúdo sobre saúde mental.
  → "Akasha IA" se passando por terapeuta.
```

---

## Persona 5 — Lúcia, a Xamã Jovem

```
┌─────────────────────────────────────────────────────────────┐
│  LÚCIA, 22                                                │
│  "Minha espiritualidade não cabe na sua religião."        │
└─────────────────────────────────────────────────────────────┘

Idade:       22
Localização: Florianópolis, SC (Trindade)
Tradição:    Xamanismo / Neo-paganismo (bruxaria moderna,
             wicca, herbalismo)
Background:  Estudante de Antropologia (UFSC, 6º período).
             Bissexual, TDAH diagnosticado, vegana.
             Praticante de tarot há 4 anos (auto-didata).
Devices:     iPhone SE (budget), notebook velho (estudos)
Tráfego:     Wi-fi da universidade + 4G limitado. App
             precisa funcionar bem em dados móveis.

Channels (onde ela ESTÁ):
  • TikTok (NÃO "spiritual TikTok" mainstream — busca
    creators de nicho: "bruxaria histórica", "antropologia
    da religião")
  • Discord (servidores de bruxaria, herbalismo, tarot)
  • Instagram (estético, mas cansou)
  • Tumblr (ainda ativo pra bruxaria)
  • Goodreads (livros: Starhawk, Silver RavenWolf,
    D.J. Conway)

Goals (3):
  1. Construir conhecimento espiritual SÉRIO sem ter que
     ir pra universidade de Teologia (e sem virar "TikTok
     witch").
  2. Encontrar comunidade de pessoas da geração dela —
     não Baby Boomers de loja esotérica.
  3. Expressar espiritualidade de forma integrada à
     identidade queer, acadêmica, politizada.

Pain points (3):
  1. Apps de espiritualidade parecem "sérios demais" —
     UI de Tarot tipo Oracle Apps, lentos, cheios de ads.
  2. Ou são "superficiais demais" — horóscopo diário,
     "manifeste hoje", cristal healing sem contexto.
  3. Falta de representação jovem/queer/LGBTQIA+ na copy,
     nos avatars, nos exemplos de casos.

Aha moment (o que faria ela AMAR):
  → Onboarding que pergunta como ela SE IDENTIFICA
  espiritualmente (não "qual sua religião?") — com opções
  como "bruxa urbana", "pagã em reconstrução", "espiritual
  mas não religiosa", "tô descobrindo".
  → Feed que mostra praticantes da MESMA idade, MESMA vibe,
  com conteúdo que mistura rigor acadêmico + linguagem acessível.

Deal breaker (o que faria ela ABANDONAR):
  → Onboarding binário "qual sua religião" (Católica,
  Evangélica, Espírita, Outras).
  → UI datada (gradiente azul, gif de estrelas, fonte
  Comic Sans — ela vê isso como red flag IMEDIATO).
  → Comunidade majoritariamente masculina + 40+ que ignora
  linguagem de gênero/queer.
```

---

## Mapa de personas × features do Akasha Portal

| Feature | Ana | João | Marina | Carlos | Lúcia |
|---|:-:|:-:|:-:|:-:|:-:|
| Mapa espiritual cruzado (4 mapas) | ★★★★★ | ★★★ | ★★★★ | ★★ | ★★★★ |
| Feed de comunidade por tradição | ★★★ | ★★★★★ | ★★★ | ★ | ★★★★★ |
| Akasha IA com contexto | ★★★★ | ★★ | ★★★★★ | ★★★★ | ★★★★★ |
| Disclaimer ético visível | ★ | ★★ | ★★ | ★★★★★ | ★ |
| Moderação por tradição (mods próprios) | ★★ | ★★★★★ | ★★★ | ★ | ★★★★ |
| Identidade flexível (handle, não nome) | ★★ | ★★★ | ★★★★ | ★ | ★★★★★ |
| Onboarding "como você se identifica" | ★★ | ★★★ | ★★★★★ | ★ | ★★★★★ |
| Perfis de praticantes verificados | ★★★★ | ★★★★★ | ★★★ | ★★★★★ | ★★★ |
| Modo "leve" (esconde trauma) | ★★ | ★ | ★★★★★ | ★★★★ | ★★★ |
| Mobile-first | ★★★★ | ★★★★★ | ★★★★ | ★★★ | ★★★★★ |
| i18n (PT/EN) | ★★★ | ★★ | ★★★ | ★★★★ | ★★★★ |

**Lições do mapa:**
- **Moderação por tradição** é hit-or-miss: João ama, Carlos não liga (ele curte moderação clínica).
- **Disclaimer ético** divide: Carlos vive por isso, Lúcia acha "coisa de establishment".
- **Identidade flexível** é universal (Lúcia e Marina amam; Ana e Carlos não ligam).
- **Feed comunitário** é o ponto de convergência — todas querem, com nuances diferentes.

---

## Estatísticas de uso esperado (validação)

| Persona | DAU esperado | Tempo médio/sessão | Frequência de post | Risco de churn (30d) |
|---|---|---|---|---|
| Ana | 1-2x/dia | 8-15min | 1-2x/semana | Médio (busca profundidade) |
| João | 3-5x/semana | 5-10min | 2-3x/semana (perguntas) | Baixo (enraizado) |
| Marina | 1-2x/dia | 10-20min | 3-5x/semana | Médio (busca acolhimento) |
| Carlos | 1-2x/semana | 5-8min | 1x/mês (comentário) | Alto (sem dor diária) |
| Lúcia | 3-5x/dia | 3-7min (snacking) | 5+x/semana | Baixo (hábit-forming) |

---

## Anti-personas (quem NÃO estamos desenhando pra)

| Anti-persona | Por que não |
|---|---|
| **Colecionador de apps de tarot** | Só quer mais um "yes/no" — não valoriza profundidade |
| **"Manifestador" de Instagram** | Busca validação performática, não autoconhecimento |
| **Charlatão / coach espiritual** | Quer audiência, não troca real — moderação flag cedo |
| **Esceptico militante** | Não busca espiritualidade, vai bater de frente com a comunidade |
| **Velho ortodoxo anti-tech** | Recusa digital; precisa de terreiro/centro, não app |

---

## Próximos passos

1. ✅ **Validar personas com 3 entrevistas reais** (target: 1 por persona) — Wave 16
2. ⏳ **Criar wireframes para o onboarding "identidade flexível"** (Lúcia, Marina)
3. ⏳ **Especificar design tokens do "Modo Leve"** (Marina, Carlos)
4. ⏳ **Desenhar fluxo de "moderação por tradição"** (João, Ana)
5. ⏳ **Escrever microcopy do disclaimer ético** com Curator (Carlos)

---

> Próxima revisão: após 5 entrevistas de validação (Wave 16)
> Última atualização: 2026-06-27 (Wave 15)
