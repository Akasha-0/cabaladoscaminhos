# 🗺️ Journey Maps — Akasha Portal

> **Wave:** 15 | **Data:** 2026-06-27 | **Branch:** main
> **Status:** Documento de design (validação de produto)
> **Pergunta respondida:** "Como cada persona chega, usa, e (esperamos) ama o Akasha Portal?"
> **Companion doc:** `docs/PERSONAS-W15.md`
> **Base empírica:** Amy Jo Kim lifecycle (Visitante → Novato → Regular → Líder → Ancião), Calm/Headspace onboarding data, TalkLife retention curve

---

## TL;DR

5 journey maps cobrindo **8 estágios** (Awareness → Signup → First Post → First Like → First Comment → First Event → Habitual User → Advocate) por persona.

**3 padrões universais:**

1. **First Post é o ponto de virada.** Tudo que acontece antes é teatro; depois é identidade.
2. **First Like precisa ser < 5 minutos.** Senão a pessoa acha que falou sozinha.
3. **First Event (presencial/virtual) cria laço emocional que nenhum feed substitui.**

**3 padrões divergentes:**

1. **João (Bábalaô)** pula o "Discovery" porque vem de convite de outro Zelador. Não descobrimos ele — ele descobre a gente via WhatsApp.
2. **Carlos (Terapeuta)** pula "First Like/Comment" porque ele é lurker por anos. Contribui quando vê utilidade clínica concreta.
3. **Lúcia (Xamã Jovem)** viraliza de forma diferente — TikTok → Discord → app. O "Advocate" dela é "indica pra 5 amigas no DM", não "escreve review na App Store".

---

## Estágios comuns (legenda pra todos os journey maps)

```
Awareness       Descobre que o app existe
Signup          Cria conta (5-7min onboarding)
First View      Primeira sessão real (lê feed, vê perfil)
First Post      Primeiro conteúdo público
First Like      Primeira interação recebida
First Comment   Primeira conversa
First Event     Primeiro evento presencial/virtual
Habitual User   Uso semanal consistente
Advocate        Indica ativamente pra outros
```

**Tempo médio entre estágios** (meta de produto):

```
Awareness → Signup           : 1-7 dias
Signup → First View          : < 24h (sessão 1)
First View → First Post      : < 7 dias
First Post → First Like      : < 5 min
First Like → First Comment   : < 24h
First Comment → First Event  : < 30 dias
First Event → Habitual User  : 30-90 dias
Habitual User → Advocate     : 90-180 dias
```

---

## Persona 1 — Ana, a Cabalista (32)

```
JORNADA DA ANA — Cabala exploradora, 32 anos, SP
═══════════════════════════════════════════════════════════════════════

ESTÁGIO         CANAL          AÇÃO                    EMOÇÃO      FOCO UX
─────────────────────────────────────────────────────────────────────────
Awareness       Substack       Lê artigo "Cabala      🤔 Curiose  CTA claro:
                Twitter/X      e Ifá não são           -iada      "Beta aberta
                              contrários"                            em beta"
                              (creator post)

Signup          App / web      5 passos de              😐 "Mais    Onboarding
                              onboarding.              um app      COM
                              Escolhe "Cabala          espiritual  profundidade:
                              + Astrologia"            de novo?"   glossário,
                                                            tooltip,
                                                            "tradição
                                                            explicada"

First View      Mobile app     Mapa cabalístico        😮 "Uau,    Visualização
                              básico renderizado       isso       que respeita
                              com Sephirot             parece      a tradição
                                                        sério"     (sem glifo
                                                            esquisito,
                                                            sem Kabbalah
                                                            Center
                                                            genérico)

First Post      Editor de      "Minha leitura de       😬         Template
                post           Tiferet cruzou com      Vulnerável  guiado por
                              Oxalá hoje" + tag        + espera   tradição
                              #cabala #cruzamentos                  (#cabalístico,
                                                            #cruzamento)
                                                            Sugestões de
                                                            cross-link

First Like      Push (5min     Recebe 3 likes +        😃         Notificação
                depois)        1 comentário            Validada   calorosa,
                              "Boa provocação,                        NÃO genérica:
                              Ana! Foi luz pra mim                   "✨Alguém
                              também"                                 curtiu seu post"
                                                            ≠ calor

First Comment   Notificação    Responde comentário,    😊         UI de
                + email        começa thread           Conectada   comentário
                              com 2 praticantes                      aninhado +
                              de Cabala diferentes                   @menção +
                                                            edit history

First Event     Email + app    "Encontro Cabalístico   🤩         Página de
                              Online: Sephirot em                     evento clara
                              prática" — 12 pessoas                  (data, hora,
                              interessadas                           tradição, pré-
                                                            requisito,
                                                            link de acesso)

Habitual User   Mobile         2-3x/semana. Lê feed,   😌         Personalização
                Push digest    posta 1x/semana,        "Isso vira  sem
                              salva 3 posts/semana     rotina"     algorítmico
                                                            (escolhe
                                                            racionais)

Advocate        Substack       Escreve post            🥰         "Compartilhe
                pessoal        "Minha ferramenta       Embaixadora seu perfil"
                Twitter        favorita de estudo                      + template
                              cabalístico em 2026"                    de review
                                                            + referral
                                                            tracking
                                                            (sem spam)
```

**Drop-off risk:** entre First Post e First Like (se > 5min, ela assume que ninguém viu).  
**Aha moment:** ver o cruzamento Cabala × Ifá explicado com fontes.  
**Ponto de fricção principal:** "pago pra Cabala séria" — ela espera modelo freemium honesto, não paywall agressivo.

---

## Persona 2 — João, o Bábalaô (45)

```
JORNADA DO JOÃO — Ifá tradicional, 45 anos, Salvador
═══════════════════════════════════════════════════════════════════════

ESTÁGIO         CANAL          AÇÃO                    EMOÇÃO      FOCO UX
─────────────────────────────────────────────────────────────────────────
Awareness       WhatsApp       Bábalaô mais velho      🤝 Confiança  Trust badge
                (grupo do      manda print do app      transitória  visível:
                terreiro)      "Olha isso, é da-        (do mensageiro)"revisado por
                                                            Bábalaôs
                                                            credenciados"

Signup          Mobile         Onboarding              🧐         "Pergunte a
                Android        EXPLICITAMENTE          "Isso é     um Bábalaô
                              pergunta: "Você é        mesmo pra   antes de
                              Zelador/Sacerdote/       gente da    publicar
                              Iniciado/Visitante?"     minha       conteúdo
                                                        tradição    sagrado"
                              Escolhe "Zelador         ou é mais
                              Ogum, 12 anos de axé"    um app de
                                                        brincadeira?"

First View      Mobile         Vê seções "Odù de        😤→😌      Separação
                              Nascimento" + "Meu      "Finalmente  CLARA entre
                              Orixá Regente" +         tem um      seção de
                              "Ebó" + "Fundamentos"    espaço pra  INICIANTES
                                                        gente da    e seção de
                                                        casa"       ZELADORES
                                                            (com
                                                            permissão)

First Post      Editor (só     "Consulta de hoje:      😬         Moderação
                pra             Ogum abriu caminho      Respeitoso + PREVIA
                Zeladores)     pra Oxalá. Fundamento:   + cuidadoso  (Zelador
                              Ofereça pipoca ao        (não        posta → 2
                              seu egum."               escreve     Zeladores
                                                        besteira    senior
                                                        pública-    revisam
                                                        mente)"     antes de
                                                            publicar)

First Like      Notificação    Recebe 5 likes +        🤲         Reações
                + vibração     2 comentários de        "A corrente  tradicionais
                háptica        Zeladores mais          me viu"     + emojis
                              antigos                                 ANCESTRAIS
                                                            (não só
                                                            🔥❤️✨)

First Comment   Chat           Conversa séria          💬         Thread
                (in-app)       sobre fundamento        Respeitoso  estruturado
                              com 1 Zelador sênior                  por Odu
                              (não post público                     (referência
                              — mensagem direta)                    cruzada fácil)

First Event     Presencial +   "Roda de Conversa       🎉         Página de
                app            Ifá na Bahia" —          "Isso é     evento com
                              evento organizado        terreiro    QR check-in,
                              POR 3 Zeladores          virtual"    lista de
                              pelo app. 30 pessoas.                  presença
                                                            visível pra
                                                            mods

Habitual User   App (3-5x/     Consulta app ANTES     🧘         "Modo
                semana)        de ritual. Salva         "Auxiliar   Zelador" —
                              Odùs no caderno          digital"    mais info,
                              digital. Ensina                          menos gamif.
                              filhos de santo
                              com prints do app

Advocate        WhatsApp +     "Vou criar grupo        🌳         Ferramenta
                presencial     Bábalaôs no app.         Plantando  de "criar
                              12 confirmados."          sementes    grupo +
                                                            onboard
                                                            Zelador líder"
```

**Drop-off risk:** se app não separar claramente iniciantes de Zeladores, João sai em 24h.  
**Aha moment:** "Modo Zelador" — interface diferente pra quem tem axé.  
**Ponto de fricção principal:** moderação generalista julgando ebó/ofredá como "conteúdo sensível demais".

---

## Persona 3 — Marina, a Tantrika (28)

```
JORNADA DA MARINA — Tantra moderno, 28 anos, Rio
═══════════════════════════════════════════════════════════════════════

ESTÁGIO         CANAL          AÇÃO                    EMOÇÃO      FOCO UX
─────────────────────────────────────────────────────────────────────────
Awareness       Instagram      Creator de yoga         🌱 "Mais     CTA visual,
                Podcast        compartilha: "App        um app,     NÃO texto:
                              que respeita corpo +     mas..."     "Conheça o
                              trauma? Finally."                     Akasha" com
                                                            arte

Signup          Mobile         Onboarding pergunta:     😌 "Não     Pergunta de
                iOS            "Como você se           precisou    identidade
                              identifica? (Bruxa,      mentir      livre:
                              Tântrica, Em              minha       "Espiritual
                              reconstrução,            tradição    mas não
                              Descobrindo...)"         inteira"     religiosa"
                                                            + opção
                                                            "Prefiro
                                                            não dizer"

First View      Mobile app     Akasha IA cumprimenta    🤗 "Fui     Tom de voz
                              "Oi, Marina. Você        recebida,    validante
                              está explorando          não         SEM bajular
                              Tantra e Numerologia      julgada"    "Marina, você
                              Tântrica. Como posso                     busca
                              ser útil hoje?"                          integração
                                                            corpo-mente.
                                                            Começa por
                                                            onde você
                                                            está confortável"

First Post      Editor         "Minha relação com       😬         Aviso de
                (com check     ciclos mudou quando      Vulnerável   conteúdo +
                de trauma)     entendi meu Svad-                        recursos de
                              histhana. Como vocês                      crise visíveis
                              lidam com isso no                        ANTES de postar
                              Tantra?"
                              + opta por "post com
                              trigger warning"

First Like      Notificação    Recebe 8 likes +        😭 "Não     Reações
                (4min depois)  3 comentários. Um       estou       calorosas +
                              deles: "Obrigada por      sozinha"    respostas
                              isso, Marina. Eu                          empáticas de
                              pensei que era a única                    moderadoras
                              que sentia isso."                         da comunidade

First Comment   Notificação    Comenta de volta +       🤝         "Mostrar
                + email        recebe DM de uma         "Amiga      mais" — ver
                              mulher da mesma          nova"       perfil da
                              cidade                                   pessoa que
                                                            comentou

First Event     App +          "Círculo online:         🌺         Pré-evento
                Zoom           Corpo, ciclos e                          com:
                              Tantra — facilitado                      - descrição
                              por Marina + 1                            do espaço
                              terapeuta corporal"                       seguro
                                                            - regras de
                                                            conduta
                                                            - opt-out
                                                            disponível

Habitual User   Mobile         1-2x/dia, 10-20min       😌         "Modo Leve"
                Push           Noturno: Akasha IA       "Meu        toggle pra
                              conversa sobre dia,      ritual      esconder
                              corpo, sonho             noturno"    trauma
                                                            + "Daily
                                                            Embodiment"
                                                            prompt

Advocate        Instagram      "O único app que        🥰         Programa de
                Podcast        NÃO me pediu pra         Embaixadora  "Embaixadoras
                              'ativar chakra          (com        do Corpo" com
                              sexual' pra ter           propósito)  badge oficial
                              acesso ao conteúdo
                              profundo."               → tag
                                                            @akashaportal
                                                            + link de
                                                            referral
```

**Drop-off risk:** UMA interação sexista/transfóbica quebra confiança pra sempre.  
**Aha moment:** Akasha IA falar de corpo com cuidado + aviso de conteúdo.  
**Ponto de fricção principal:** ONBOARDING que força categorização ("qual sua tradição?" — "Nenhuma dessas" como default).

---

## Persona 4 — Carlos, o Terapeuta (55)

```
JORNADA DO CARLOS — Meditação clínica, 55 anos, BH
═══════════════════════════════════════════════════════════════════════

ESTÁGIO         CANAL          AÇÃO                    EMOÇÃO      FOCO UX
─────────────────────────────────────────────────────────────────────────
Awareness       Email          APA newsletter           🤔 "Mais    Subject line
                newsletter     menciona Akasha          um app,    séria:
                LinkedIn       como "recurso            mas tem    "Ferramenta
                              promissor de              base       de mindfulness
                              mindfulness com           eviden-     com curadoria
                              curadoria clínica"        cial?"      clínica"
                                                            (sem hype)

Signup          Web (não       Cria conta PROFISSIONAL  🧐         Modo dual:
                mobile)        com badge CRP.           "Preciso    Pessoal /
                                                            ver se vale Profissional
                                                            a pena"
                                                            (free tier
                                                            pra terapeutas
                                                            verificados)

First View      Web            Explora SEÇÕES           😌 "Isso    Bibliometria
                Desktop        CLÍNICAS, papers,        é sério,    visível:
                              reviews de literatura    não         "5 papers
                                                        coacharia   sustentam
                                                            espiritual"  essa prática"

First Post      Editor         "Recomendo o Akasha      😐 "Não    Disclaimer
                (com revisão   para pacientes com       tenho       obrigatório:
                clínica        ansiedade leve, com       tempo      "Isto NÃO
                obrigatória)   moderação adequada.       pra postar  substitui
                              Ressalvas: [X, Y, Z]"     todo dia"   terapia.
                                                            Sempre
                                                            acompanha-
                                                            do de NPS"

First Like      Email (sem     Recebe 3 likes de        😊 "Tem     Email digest
                push)          outros terapeutas        uma         semanal (não
                              + 1 de paciente          comunidade  push)
                              anônimo:                  séria de
                              "Ajudou, Dr Carlos"       clínicos"

First Comment   Email          Conversa com 1            💬         Thread
                              pesquisador USP           Respeitoso  acadêmico +
                              sobre eficácia de                      citations
                              mindfulness apps                       inline
                                                            + links
                                                            pros papers

First Event     App +          "Webinar: Mindfulness    📚         Página com
                YouTube        Apps na Prática          Aprendeu    bibliografia
                              Clínica — 200                            + slides
                              profissionais"                           + replay

Habitual User   Web (1-2x/     Consulta app             🧘         "Modo
                semana)        ANTES de recomendar       "Auxiliar   Profissional"
                              pra paciente. Verifica    do          com:
                              se conteúdo é             consultório" - citação
                              baseado em evidência.                   rápida
                                                            - link pro
                                                            paper
                                                            - export
                                                            PDF pra
                                                            paciente

Advocate        Email +        Escreve paper: "O        🎓         Programa
                congresso      papel de apps de          "Ferramenta "Co-criador
                              mindfulness na           confiável   clínico" com
                              adesão ao tratamento      pra         co-autoria
                              MBSR: um estudo de        indicar"    de papers
                              caso com Akasha                       + badge de
                              Portal"                              "Co-criador"
                                                            + convites
                                                            pra advisory
                                                            board
```

**Drop-off risk:** se em 5min ele NÃO encontrar evidência clínica, sai pra sempre.  
**Aha moment:** ver bibliografia inline + disclaimer ético + co-autoria possível.  
**Ponto de fricção principal:** "Akasha IA" se passando por terapeuta. (Ele é literalmente o primeiro a detectar isso.)

---

## Persona 5 — Lúcia, a Xamã Jovem (22)

```
JORNADA DA LÚCIA — Xamanismo jovem, 22 anos, Floripa
═══════════════════════════════════════════════════════════════════════

ESTÁGIO         CANAL          AÇÃO                    EMOÇÃO      FOCO UX
─────────────────────────────────────────────────────────────────────────
Awareness       TikTok         Creator de tarot         🌟 "PARA   Hook visual:
                Discord        histórico (não           DE          "App de
                              mainstream) posta:       VERDADE     espiritualidade
                              "Encontrei um app        existe      QUE TRATA
                              que trata tarot com       algo       a gente
                              rigor acadêmico.          sério?"     como gente
                              Vou testar."                           grande"

Signup          Mobile         Onboarding: "Como        😄 "Me     UI com
                iOS            você se identifica       viram      micro-animações
                              espiritualmente?"       !"          + linguagem
                                                            que NÃO
                                                            é "ó vovó"
                                                            "Espiritual  +
                                                            estudiosa
                                                            +
                                                            queer"

First View      Mobile         Feed mostra pessoas       😌 "Tem    Filtros por
                TikTok-style   DA MESMA IDADE           gente       vibe (não só
                scroll         praticando tarot,         como        tradição):
                              herbalismo, bruxaria      eu"        • "Acadêmica"
                              urbana. Vê badges                     • "Prática
                              "verificada" +                         diária"
                              "estudiosa"                            • "Criativa"

First Post      Editor (com    "Comecei a estudar       😬→😊     Templates
                templates      o Tarô de Marselha       "Será      visuais:
                visuais)       historicamente.          que vão     "Compartilhe
                              Quem mais tá nessa?"      achar       sua prática"
                                                            weird?"    com ilustrações
                                                            sugeridas
                                                            (não força)

First Like      Push (2min     12 likes + 3             🥳 "Não    Reações
                depois)        comentários de           estou      múltiplas:
                              gente da mesma            sozinha     🔮🌿📚✨
                              geração!"                              (não só 🔥)

First Comment   DM in-app      Conversa com 3           🤝         DM com
                              pessoas. Marca           "Tribo"    filtros de
                              encontro presencial                      segurança
                              em Floripa                                (block, report,
                                                            age
                                                            verification
                                                            opt-in)

First Event     Discord +      "Study group:            🌙         Integração
                app            Tarô histórico                          com
                              + ervas medicinais                       Discord
                              — toda quarta"                           (pra quem já
                                                            usa) +
                                                            meetup tool

Habitual User   Mobile (3-5x/  Snacking rápido          😌         "Daily
                dia)           + 1 sessão longa         "Meu       Oracle"
                Push digest    por semana               ritual     push único
                                                            digital"   com horário
                                                            ESCOLHIDO
                                                            por ela
                                                            (não 8h
                                                            da manhã)

Advocate        TikTok         "5 apps de               💃         Programa
                Discord        espiritualidade         Embaixadora "Geração Z"
                DM pra         que NÃO são cringe      (com       com:
                amigas         (review)"               propósito)  • co-criação
                                                            de features
                                                            • acesso a
                                                            beta fechado
                                                            • badge
                                                            "Co-criadora"
                                                            visível no
                                                            perfil
```

**Drop-off risk:** UI datada em 3 segundos. Ela julga app pela estética como sinal de seriedade.  
**Aha moment:** "Como você se identifica espiritualmente" — primeira pergunta, antes de "qual tradição".  
**Ponto de fricção principal:** ONBOARDING binário. Notificações em horário errado (8h da manhã num domingo).

---

## Cross-persona: Pontos de fricção × Soluções

| Fricção | Personas afetadas | Solução |
|---|---|---|
| **First Like > 5min** | Ana, Marina, Lúcia | Sistema de "primeira reação" — bot automático que dá "visto" em <30s + notificação quando 1ª reação real chega |
| **Moderação sem contexto cultural** | João, Marina | Mods por tradição (já no roadmap W14). Política de escalonamento: mod da tradição julga conteúdo da tradição |
| **Onboarding binário** | Lúcia, Marina | Opção "Espiritual mas não religiosa" + "Descobrindo" + "Prefiro não dizer" como DEFAULT em qualquer pergunta de tradição |
| **UI datada / genérica** | Lúcia, Marina | Design system atualizado W15+ (tokens jovens, não azulado/gradiente) |
| **Disclaimer ausente** | Carlos, Marina | Footer fixo em TODA página de saúde mental: "Isto não substitui terapia. CVV 188 (BR). 988 (EUA)." |
| **Mobile lento em 4G** | João, Lúcia | PWA offline-first (já W11) + Service Worker pra conteúdo de meditação |
| **Lurker (Carlos) sente que "não pertence"** | Carlos | "Modo Espectador" valorizado — badge de "Leitor Frequente" sem precisar postar |
| **Charlatanismo** | Todas | Sistema de "sinalização de risco" + selo de "praticante verificado" com critérios públicos |

---

## Métricas de sucesso por estágio (acceptance criteria)

| Estágio | Métrica | Meta Wave 15+ | Meta Wave 20 (3 meses) |
|---|---|---|---|
| Awareness → Signup | Conversion rate | 5% | 12% |
| Signup → First View | Same-session rate | 80% | 90% |
| First View → First Post | 7-day activation | 25% | 45% |
| First Post → First Like | Median time | < 5min | < 2min |
| First Like → First Comment | 24h rate | 30% | 50% |
| First Comment → First Event | 30-day rate | 15% | 30% |
| First Event → Habitual | 90-day rate | 40% | 60% |
| Habitual → Advocate | 180-day rate | 10% | 25% |

---

## Top 5 melhorias de UX (derivadas das journeys)

### 🥇 #1 — "First Reaction" instantâneo (bot humanizado)
- **Personas que ajuda:** Ana, Marina, Lúcia (3 de 5)
- **Por quê:** Primeira reação decide se a pessoa volta. < 5min é benchmark.
- **Implementação:** Bot que dá "visto caloroso" + microcopy da curadoria em < 30s. Primeira reação REAL de humano chega em < 5min (mod starter + sistema de reação rápida).
- **Métrica de sucesso:** median time-to-first-reaction < 5min
- **Esforço:** M (2-3 sprints)
- **Risco:** Baixo (se microcopy for cuidadoso)

### 🥈 #2 — Onboarding "Como você se identifica" ANTES de tradição
- **Personas que ajuda:** Lúcia, Marina (mais impactadas), Ana (em menor grau)
- **Por quê:** Onboarding atual força categorização religiosa binária.
- **Implementação:** Pergunta 1 = identidade ("Espiritual mas não religiosa" / "Praticante de tradição X" / "Descobrindo" / "Prefiro não dizer"). Pergunta 2 = tradições de interesse (multi-select). Default: "Descobrindo".
- **Métrica de sucesso:** completion rate do onboarding + diversity score de personas
- **Esforço:** P (1 sprint, é só copy + select component)
- **Risco:** Baixo

### 🥉 #3 — "Modo Zelador" / "Modo Profissional" / "Modo Espectador"
- **Personas que ajuda:** João, Carlos, Lúcia (cada uma ganha modo diferente)
- **Por quê:** João precisa de seção separada pra Zeladores (senão moderação generalista ofende). Carlos precisa de "Modo Espectador" valorizado. Lúcia precisa de feed por vibe.
- **Implementação:** 3 modos de UI selecionados no onboarding (mutáveis depois):
  - **Modo Praticante:** feed padrão
  - **Modo Zelador/Profissional:** UI avançada, sem gamificação, mais info técnica
  - **Modo Espectador:** badge de "leitor frequente", sem pressão pra postar
- **Métrica de sucesso:** retention por modo + NPS por modo
- **Esforço:** G (3-4 sprints, inclui refactor de feed)
- **Risco:** Médio (cria fragmentação de comunidade — mitigar com cross-mode visibility)

### 🏅 #4 — Disclaimer ético FIXO em páginas de saúde mental
- **Personas que ajuda:** Carlos (vital), Marina (essencial), todas as outras (proteção)
- **Por quê:** Ético + regulatório (LGPD + CFP). Carlos é literalmente quem detecta a falta.
- **Implementação:** Componente `<EthicalFooter />` que aparece em TODA rota que toca saúde mental, trauma, cura, transformação. Conteúdo:
  - "Isto NÃO substitui acompanhamento terapêutico"
  - "Em crise: CVV 188 (BR) · 988 (EUA) · Crisis Text Line"
  - "Akasha IA é consciência digital, NÃO terapeuta"
- **Métrica de sucesso:** Carlos indicaria pra paciente (survey)
- **Esforço:** P (1 sprint, é só componente + routing)
- **Risco:** Zero

### 🏅 #5 — Sistema de "verificado" com critérios públicos
- **Personas que ajuda:** João (Bábalaôs verificados), Carlos (profissionais verificados), Ana (praticantes verificadas)
- **Por qué:** Charlatanismo é o maior risco. João precisa ver selo de Zelador. Carlos precisa de selo CRP. Ana precisa saber se a pessoa que escreve sobre Cabala TEM formação.
- **Implementação:**
  - Badge visual por tipo (Zelador · Terapeuta · Acadêmico · Praticante verificado)
  - Critérios públicos em `/about/verification`
  - Processo de aplicação + revisão por pares da tradição
  - **NÃO** comprável, **NÃO** por número de posts
- **Métrica de sucesso:** % de posts de saúde mental de verified accounts + charlatanismo flag rate
- **Esforço:** G (3-5 sprints, envolve processo + UI + política)
- **Risco:** Médio (se critérios não forem públicos, vira "elite gatekeeping")

---

## Próximos passos (handoff pra Wave 16)

1. **Wireframe do novo onboarding** (pergunta de identidade ANTES de tradição)
2. **Spec do `<EthicalFooter />`** (componente + roteamento)
3. **Critérios públicos de verificação** (co-criar com João + Carlos)
4. **Mockup do "Modo Zelador / Profissional / Espectador"**
5. **Validação com 5 entrevistas reais** (1 por persona)

---

> Próxima revisão: após wireframes W16 + 5 entrevistas de validação  
> Última atualização: 2026-06-27 (Wave 15)
