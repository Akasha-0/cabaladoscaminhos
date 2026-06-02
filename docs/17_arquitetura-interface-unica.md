# Documento 17 — Arquitetura da Interface Única (Mesa Real) & Plano de Enxugamento

## Cabala dos Caminhos

> **Tipo:** Decisão de arquitetura **canônica** — interface única + poda de escopo
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Resolve:** a dispersão de páginas/componentes; fixa a visão "**um só sistema, uma só página**".
> **Precedência:** em estrutura de **interface, navegação e telas**, o Doc 17 **prevalece** sobre os Docs 03 §3, 05 §2–3 e 09 §6. Identidade visual → Doc 13. Cálculo → Doc 11. Correlação → Doc 06.

---

## 1. A Decisão-Mãe — O produto É uma página

**O sistema Cabala dos Caminhos é UMA tela operacional: a Mesa Real.** Não há dashboard, não há listagens, não há páginas de consumidor. Tudo o que o operador precisa acontece nessa página única:

```
        ┌──────────────────── A PÁGINA ÚNICA (/cockpit) ────────────────────┐
        │                                                                     │
   1.   │  Entradas natais        →  nome (certidão), data, hora, local       │
   2.   │  Mesa Real 9×4          →  36 casas em CARDS                         │
   3.   │  Preenchimento          →  cada casa recebe 1 das 36 cartas (todas) │
   4.   │  Búzios por casa        →  cada casa recebe 1 Odu (merindilogun)    │
   5.   │  Gerar Dossiê           →  IA cruza casa + carta + Odu + mapa natal │
   6.   │  Dossiê (+ Q&A)         →  leitura e consulta, no mesmo fluxo        │
        └─────────────────────────────────────────────────────────────────────┘
```

> **AD-17.1 — Interface única.** O produto é a rota **`/cockpit`** (+ `/cockpit/login` e a saída do dossiê). Toda navegação multi-página (dashboard de métricas, lista de consulentes, histórico de leituras como telas separadas) é **eliminada** como navegação primária. Quando necessário, vira **painel/drawer dentro da própria página** (ex.: selecionar consulente, ver leitura anterior), nunca uma rota concorrente.

Isso **supersede** os mapas de navegação multi-tela dos Docs 03/05/09 (que descreviam `(dashboard)/nova-consulta`, `/clientes`, `/leituras`).

---

## 2. Anatomia da Página Única (especificação de interface)

Layout em **3 zonas** numa só viewport (desktop-first, dark, paleta Ramiro — Doc 13):

```
┌──────────────────────┬───────────────────────────────────────┬───────────────┐
│  ZONA A — CONSULENTE  │  ZONA B — MESA REAL (9×4, 36 cards)    │  ZONA C —     │
│  (sidebar esquerda)   │  (centro, foco visual)                │  AÇÃO/SAÍDA   │
│                       │                                        │  (drawer dir.)│
│  • Nome (certidão)    │  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┐          │               │
│  • Data nascimento    │  │01│02│03│04│05│06│07│08│09│          │  [Gerar       │
│  • Hora nascimento    │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤          │   Dossiê]     │
│  • Local nascimento   │  │10│..│  │  │  │  │  │  │18│          │               │
│                       │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤          │  Dossiê       │
│  Badges dos 4 mapas   │  │19│..│  │  │  │  │  │  │27│          │  (streaming)  │
│  (após cálculo)       │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤          │               │
│                       │  │28│..│  │  │  │  │  │  │36│          │  Consultar    │
│  Cartas restantes:    │  └──┴──┴──┴──┴──┴──┴──┴──┴──┘          │  o Oráculo    │
│  ▓▓▓▓░░ 24/36         │  Cartas na mesa: 12/36 · Odus: 12/36  │  (Q&A drawer) │
└──────────────────────┴───────────────────────────────────────┴───────────────┘
```

### 2.1 Zona A — Consulente (as 4 entradas)
Os **únicos** dados de entrada do sistema (Doc 02 §B.1 / Doc 11):
- **Nome completo conforme certidão** — base da numerologia cabalística.
- **Data de nascimento** — numerologias + Odu natal.
- **Hora de nascimento** — Ascendente e casas astrológicas.
- **Local de nascimento** — coordenadas p/ o mapa astral.

Ao confirmar, o sistema calcula e **cacheia** os 4 mapas (astrológico, cabalístico, tântrico, Odu natal) e os exibe como badges (royal/laranja, Doc 13 §4.3). Cálculo **uma única vez** (Doc 09 §5.3).

### 2.2 Zona B — A Mesa Real (o coração visual)
- Grid fixo **9×4 = 36 casas**, cada casa um **card** com número fixo (1..36) e nome canônico (O Cavaleiro … A Cruz — Doc 15 / `lenormand-cards.ts`).
- Estados do card: **vazio** → **com carta** → **com carta + Odu** → **em foco**.
- Visual da paleta Ramiro: casa preenchida = laranja (ação/fogo); badge do Odu = royal (profundidade). Números em JetBrains Mono (Doc 16 AD-09).

### 2.3 Preenchimento — Popover de fricção zero (sem modais)
- Clique numa casa → **Popover ancorado** (não cobre a mesa) com 2 campos: **Carta Cigana** (combobox busca) e **Odu** (combobox busca). Enter confirma, Esc fecha.
- **AD-17.3 — Banir modais.** O Popover é a **única** forma de entrada na mesa. Modais (`CasaModal`) e diálogos de leitura são proibidos — contrariam a "fricção zero" e tapam o tabuleiro.

### 2.4 Zona C — Ação e saída
- Botão **"Gerar Dossiê"** (laranja, pulsa quando a mesa avança).
- **Dossiê** renderizado em streaming (tipografia Lora — Doc 16 AD-09), 3 parágrafos por casa (Terreno/Evento/Direção) + síntese (Doc 06).
- **Consultar o Oráculo** (Q&A, RAG fechado — Doc 12) como drawer na mesma página.

---

## 3. O Modelo do Jogo (refinamento de arquitetura)

> **AD-17.2 — A tiragem é um Grande Tableau (baralhamento completo).**
> Conforme a visão: *"cada casa vai ser preenchida com uma carta das 36 até concluir as 36 cartas nas 36 casas"*. Logo:
> - **Cartas = permutação.** As 36 cartas são distribuídas nas 36 casas, **uma por casa, sem repetição**. Quando as 36 estão na mesa, a tiragem está completa.
> - **Odus = repetição livre.** O jogo de búzios é lançado **por casa**; um mesmo Odu (dos 16) pode cair em várias casas.
>
> **Implicações de arquitetura (a refletir no código numa onda futura — aqui só decididas):**
> 1. **`matrixData`**: 36 entradas `{ casa → { carta∈1..36 único, odu∈1..16 } }`; invariante de **unicidade das cartas** validada no `save` (Doc 04 §3).
> 2. **Popover**: o combobox de cartas **filtra as já colocadas** (não oferece repetição); a Zona A mostra **"cartas restantes"**.
> 3. **Distinção de papéis por casa** (Doc 06): a casa tem (a) um **nome fixo** (posição/arquétipo) e (b) uma **carta sorteada** (evento do dia). São camadas distintas — o nome da casa nº24 é "O Coração"; a carta que cai nela pode ser qualquer uma das 36.

---

## 4. Inventário Manter / Remover (a poda)

Hoje há **~1.295 arquivos**; a página única precisa de uma fração. Classificação por diretório (decisão de arquitetura; execução em onda futura, fora deste doc):

### 4.1 MANTER — núcleo do produto
| Área | Itens | Papel |
|---|---|---|
| Página | `app/cockpit/*` (page, login) | A interface única |
| Componentes | `components/cockpit/*` (CockpitOracular, CockpitHeader, CockpitSidebar, HouseCell, HouseInputPopover) | A mesa e seu preenchimento |
| UI base | `components/ui/{badge,button,input,label,progress,command,popover}` | Primitivas usadas pela página |
| APIs | `app/api/{operator,mesa-real,consult,health}/*` | Auth + tiragem + dossiê + Q&A |
| Inteligência | `lib/ai/{correlation-map,theme-router,prompt-builder,dossier/*}`, `lib/constants/{lenormand-cards,odus}`, `lib/divination/{house-delegation,house-types}`, `lib/calculators/*`, `lib/astrologia/*` (AD-04), `lib/auth/operator-*`, `lib/db/{client,consultation}-actions`, `lib/prisma` | A camada de inteligência (§6) |

### 4.2 REMOVER / QUARENTENAR — fora do objetivo
| Área | Itens (contagem) | Motivo |
|---|---|---|
| Dashboard B2C | `components/dashboard/*` (**165**) | Consumidor final / bem-estar — proibido (Doc 09 §5.1/§9) |
| Mapa pessoal B2C | `components/mapa/*` (17), `components/astrologia/*` (2) | Telas de consumidor |
| E-commerce | `components/shop/*` (3) | Billing/loja — fora de escopo (Doc 09 §9) |
| Mesa Real duplicada | `components/mesa-real/{MesaRealGrid,CasaModal}` | Duplicata legada da mesa; **CasaModal é modal** (AD-17.3) |
| Onboarding consumidor | `components/onboarding/*` (1) | Fluxo de consumidor |
| Auth B2C | `components/auth/{LoginForm,RegisterForm,AuthGuard}`, `providers/{SupabaseProvider,UserProvider}` | Auth de consumidor (Supabase); o B2B usa `/cockpit/login` + Operator JWT |
| Shell multi-página | `components/layout/{AppShell,PageHeader}` | A página única não usa shell de navegação |
| Design-system disperso | `components/design-system/{ThemeSwitcher,…}` | `ThemeSwitcher` contraria o dark-único; reavaliar Typography/Glow |
| Páginas e APIs B2C | todas as rotas fora de `/cockpit` e das APIs do §4.1 | Já **quarentenadas** por flag (Doc 16 AD-01); marcar p/ remoção definitiva |

> **AD-17.4 — Tudo fora da página única sai do caminho.** A quarentena (Doc 16 AD-01) já neutralizou as rotas; o passo final é **remover fisicamente** os diretórios da §4.2 (após confirmação), encolhendo o repositório ao essencial.
>
> **AD-17.5 — Sem cadastro/listagem como telas.** As 4 entradas vivem **na própria página** (Zona A). Selecionar um consulente já existente é um **combobox de busca** na Zona A — não uma rota `/clientes`.
>
> **AD-17.6 — Layout raiz enxuto.** O `app/layout.tsx` deve deixar de envolver tudo em `SupabaseProvider` (dependência B2C); a página única não precisa dele.

---

## 5. Arquitetura de Inteligência (mais inteligência, mais estrutura)

A "inteligência" do produto não é um chat genérico — é uma **pipeline determinística em camadas**, fácil de evoluir porque cada camada tem uma responsabilidade e uma fonte única:

```
┌── CAMADA 1 — FONTE DE VERDADE (constantes curadas) ──────────────────┐
│  lenormand-cards.ts (36) · odus.ts (16) · glossário (Doc 15)         │
│  → baseMeaning/shadow, quizila/baseAdvice. Anti-alucinação.          │
├── CAMADA 2 — CORRELAÇÃO DETERMINÍSTICA (a regra de negócio) ─────────┤
│  correlation-map.ts (36 casas → aspectos natais delegados, Doc 06)   │
│  + cálculo natal determinístico (Doc 11). Cada casa puxa SÓ o seu.   │
├── CAMADA 3 — MONTAGEM DE PROMPT (por casa, 3 parágrafos) ────────────┤
│  prompt-builder + oracle-prompt-builder. Injeta verdade, não memória.│
├── CAMADA 4 — GERAÇÃO (LLM, modelo por env) ──────────────────────────┤
│  dossiê em streaming → Report. Persistência Prisma.                  │
├── CAMADA 5 — CONSULTA (Q&A RAG fechado) ────────────────────────────┤
│  theme-router (tema→casas) + contexto fechado (Doc 12). Sem invenção.│
└──────────────────────────────────────────────────────────────────────┘
```

**Princípios que mantêm a evolução rápida e segura:**
1. **Fonte única por conceito** — uma carta/Odu/casa tem **uma** definição (Doc 16 AD-02). Nunca duplicar listas.
2. **Determinismo na correlação** — cada casa recebe apenas seus aspectos mapeados; zero genérico (Doc 06).
3. **Verdade injetada, não lembrada** — o glossário alimenta o prompt; o LLM não "inventa" significados (Doc 15).
4. **Extensão por contrato** — novos sistemas (I-Ching) entram só pelos 5 pontos do Doc 14; campos opcionais não quebram as 36 entradas.
5. **Volátil vs imutável** — mapas natais cacheados; só os **ciclos pessoais** recalculam sob demanda (Doc 04 §1, Doc 11).

> **AD-17.7 — A inteligência cresce nas camadas 1–2, não na UI.** Para o sistema ficar "mais inteligente", enriquece-se a fonte de verdade (glossário) e o mapa de correlação — **a página não muda**. Isso desacopla evolução de conteúdo da evolução de interface.

---

## 6. Estrutura-alvo do `src/` após a poda (enxuta)

```
src/
├── app/
│   ├── cockpit/page.tsx         ← A PÁGINA ÚNICA (portão de auth)
│   ├── cockpit/login/page.tsx   ← login do Operator
│   ├── layout.tsx               ← enxuto (sem SupabaseProvider)
│   └── api/{operator,mesa-real,consult,health}/…
├── components/
│   ├── cockpit/*                ← mesa, header, sidebar, card, popover
│   └── ui/*                     ← só as primitivas usadas
├── lib/
│   ├── ai/{correlation-map,theme-router,prompt-builder,dossier}
│   ├── constants/{lenormand-cards,odus}  + glossário
│   ├── calculators/*            ← numerologia/Odu (Doc 11)
│   ├── astrologia/*             ← mapa natal (precisão: AD-04)
│   ├── divination/{house-delegation,house-types}
│   ├── auth/operator-*          ├ db/{client,consultation}-actions ├ prisma
└── stores/cockpit-store.ts      ← estado da mesa (Zustand)
```

Tudo o que não aparece aqui é candidato à remoção (§4.2).

---

## 7. Plano de Refatoração (ondas — decisão, execução fora deste doc)

1. **Onda 1 — Convergência da página.** Garantir que `/cockpit` cobre 100% do §2 (3 zonas: entradas natais na Zona A, mesa 9×4, ação/dossiê na Zona C). Selecionar consulente via combobox na própria página.
2. **Onda 2 — Regra do Grande Tableau (AD-17.2).** Popover filtra cartas usadas; barra "cartas restantes"; validar unicidade no `save`.
3. **Onda 3 — Poda (AD-17.4).** Remover diretórios da §4.2; enxugar `layout.tsx` (AD-17.6); apagar `CasaModal`/`MesaRealGrid` legados.
4. **Onda 4 — Inteligência (§5).** Wire cadastro→4 mapas; dossiê em streaming com glossário; Q&A drawer.
5. **Onda 5 — Precisão astral (Doc 16 AD-04).** Validar e, se preciso, trocar a efeméride.

---

## 8. Critério de "pronto" (a visão atingida)

A arquitetura terá atingido o objetivo quando:
- [ ] Existe **uma** rota de produto (`/cockpit`) + login; nenhuma página B2C navegável.
- [ ] A página tem as **3 zonas**: 4 entradas natais, mesa 9×4 de cards, ação/dossiê.
- [ ] As 36 casas são preenchíveis com as 36 cartas (**permutação**) + 1 Odu por casa, via **popover** (sem modais).
- [ ] O `src/` reflete a estrutura enxuta do §6 (cruft removido).
- [ ] O dossiê cruza casa + carta + Odu + mapa natal, com verdade do glossário.

---

*Doc 17 é a referência canônica da interface única e do escopo enxuto. Onde divergir de docs mais antigos sobre telas/navegação/estrutura de pastas, prevalece este documento.*
