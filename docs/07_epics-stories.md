# Documento 07 — Épicos & User Stories
## Sistema Akasha

> **Versão:** 2.0 | **Metodologia:** Kanban por ondas (Doc 08)
> **Formato de Story:** "Como [ator], quero [ação], para [valor]." Ator primário = **usuário** (cliente final B2C).
> **Identidade:** todas as stories de UI seguem a paleta cósmica Akasha (Doc 26). Toda referência a Ramiro/laranja+royal foi aposentada.

---

## Mapa dos Épicos

| ID | Épico | Onda | Prioridade |
|---|---|---|---|
| E1 | Monorepo & Cirurgia de Extração | 1 | 🔴 Crítica |
| E2 | Conta B2C & Onboarding Ritual | 2 | 🔴 Crítica |
| E3 | Motores de Cálculo dos 4 Mapas | 1–2 | 🔴 Crítica |
| E4 | Mandala Toroidal (UI central) | 2 | 🔴 Crítica |
| E5 | Manifesto Akáshico & PDF | 2 | 🟡 Alta |
| E6 | Grimório Digital (RAG) | 3 | 🔴 Crítica |
| E7 | Motor de IA 3 Camadas & Dashboard Diário | 3 | 🔴 Crítica |
| E8 | Agente Oracular (consulta por créditos) | 3 | 🟡 Alta |
| E9 | Monetização (Stripe + Créditos) & PWA | 4 | 🟡 Alta |
| E10 | i18n & Escala Global | 4 | 🟢 Média |

---

## E1 — Monorepo & Cirurgia de Extração

- **S1.1** — Como dev, quero **Turborepo/pnpm workspaces** configurados, para ter apps e packages compartilhando o mesmo core.
  *AC:* `pnpm-workspace.yaml` + `turbo.json`; TS e Vitest compilam módulos independentes.
- **S1.2** — Como dev, quero extrair `packages/core-astrology|tantra|cabala|odus`, para isolar os motores agnósticos.
  *AC:* pacotes não importam React/HTTP; recebem dados, devolvem JSON; build verde por pacote.
- **S1.3** — Como dev, quero **religar** `apps/legacy-cockpit` para importar de `@akasha/core-*`, para não quebrar o legado.
  *AC:* cockpit funciona via imports; **os ~9k testes permanecem verdes**.
- **S1.4** — Como dev, quero `packages/core-graph`, para cruzar os 4 pilares (Camada 2).
  *AC:* função `cruzar()` recebe o JSON da Camada 1 e devolve o Ponto de Tensão.

---

## E2 — Conta B2C & Onboarding Ritual

- **S2.1** — Como visitante, quero me **cadastrar** (e-mail/senha ou OAuth), para ter minha conta Akasha.
  *AC:* cria `User` Freemium; verificação de e-mail; sessão JWT/cookie.
- **S2.2** — Como usuário, quero a **Coleta Sagrada** (nome, data/hora, local), para o sistema calcular meus mapas.
  *AC:* campos sequenciais cerimoniais; cidade via Nominatim → lat/lng/tz.
- **S2.3** — Como usuário, quero o **Quiz de Ancoragem**, para personalizar minha primeira leitura.
  *AC:* 3–4 perguntas salvas em `intentionProfile`; não alteram a matemática.
- **S2.4** — Como usuário, quero a **Renderização Ritualística** (loading mágico), para sentir o sistema trabalhando.
  *AC:* fundo Three.js + frases sincronizadas com o Toroide desenhando.

---

## E3 — Motores de Cálculo dos 4 Mapas

- **S3.1** — Como sistema, quero calcular a **Numerologia Cabalística** (Doc 11 §2), para o pilar do Verbo.
  *AC:* Caminho de Vida, Expressão, Motivação, Impressão, Pináculos, Lições, Ciclos.
- **S3.2** — Como sistema, quero calcular a **Numerologia Tântrica** (Doc 11 §3), para os 11 Corpos.
  *AC:* `divineGift`/`destiny`/`tantricPath` distintos; bodies[1..11] com `balanced`.
- **S3.3** — Como sistema, quero o **mapa astrológico** via Swiss Ephemeris, para o pilar do Céu.
  *AC:* Sol/Lua/Asc, 10 planetas + Quíron/Lilith, casas, aspectos (harmony/tension), elementos/modalidades.
- **S3.4** — Como sistema, quero o **Odu de nascimento** (Doc 11 §4), para o pilar da Terra/Ori.
  *AC:* Odu, Orixás, força elemental, caminhos/sombras (provisional até D3).
- **S3.5** — Como usuário sem hora/local, quero um aviso claro, para completar meu mapa astral.
  *AC:* `BirthChart.incomplete=true`; UI pede a informação (Doc 23).

---

## E4 — Mandala Toroidal

- **S4.1** — Como usuário, quero ver minha **Mandala** (4 camadas), para entender meu mapa de um olhar.
  *AC:* WebGL atmosfera (R3F) + SVG/D3 dados; núcleo Ori, geometria Cabala, teia Tântrica, anel Astro.
- **S4.2** — Como usuário mobile, quero **girar o anel** com o polegar, para navegar entre vertentes.
  *AC:* clique cirúrgico em cada nó (SVG, não raycasting); bottom-sheet glassmorphism.
- **S4.3** — Como usuário, quero o **Painel de Sintonia**, para ver caminhos abertos vs curto-circuito.
  *AC:* linhas ciano (sincronicidade) e magenta (desalinhamento); nó tântrico em tensão destacado.
- **S4.4** — Como usuário Freemium, quero a **Mandala base**, para querer desbloquear o resto.
  *AC:* geometria + resumo superficial; camadas profundas bloqueadas com upsell.

---

## E5 — Manifesto Akáshico & PDF

- **S5.1** — Como usuário, quero comprar o **Manifesto** (4 camadas + síntese), para meu mapa profundo.
  *AC:* gerado uma vez (1→2→3); cita dados específicos; concede 30 dias de Dashboard.
- **S5.2** — Como usuário, quero **exportar o Manifesto em PDF**, para guardar/imprimir.
  *AC:* `@react-pdf/renderer`, vetorial, texto selecionável; zero RAM gráfica.

---

## E6 — Grimório Digital (RAG)

- **S6.1** — Como curador, quero escrever rituais em **Markdown+YAML**, para alimentar o oráculo.
  *AC:* 4 bibliotecas (Botânica/Vibracional/Ancestral/Diagnóstico); proveniência (Doc 20).
- **S6.2** — Como sistema, quero **ingerir** os `.md` em **pgvector** via Ollama, para a busca semântica.
  *AC:* `npm run grimoire:sync` lê YAML, gera embedding, faz upsert; webhook GitHub + botão admin.
- **S6.3** — Como sistema, quero a **busca híbrida** (JSONB + pgvector), para achar o ritual certo.
  *AC:* filtro determinístico + semântico; retorna fragmentos com `grimoireId`.

---

## E7 — Motor de IA 3 Camadas & Dashboard Diário

- **S7.1** — Como sistema, quero o **cronjob de trânsitos** (madrugada UTC → Redis), para servir o céu instantâneo.
  *AC:* `SETEX transitos_diarios:AAAA-MM-DD 86400 {...}`.
- **S7.2** — Como sistema, quero a **Camada 3** (Agente de Síntese) com RAG, para escrever o painel.
  *AC:* System Prompt de fronteira restrita; SSE; nenhum ritual fora do Grimório.
- **S7.3** — Como usuário, quero meu **Dashboard Diário** (Clima/Ritual/Alerta), para minha direção do dia.
  *AC:* carrega instantâneo; botão "Realizado"; nunca repete texto.

---

## E8 — Agente Oracular (consulta por créditos)

- **S8.1** — Como usuário, quero **perguntar ao Oráculo** algo sobre minha vida, para conselho ancorado.
  *AC:* roteamento por pilares; RAG fechado (Grimório + meu mapa); nunca contradiz o Manifesto (Doc 12).
- **S8.2** — Como usuário, quero ver o **custo em créditos** e a **transparência** das vertentes consultadas.
  *AC:* ritual=1 / pergunta complexa=3; chips de vertentes; débito no `CreditEntry`.

---

## E9 — Monetização (Stripe + Créditos) & PWA

- **S9.1** — Como usuário, quero **assinar o Akasha Pro** ou comprar **créditos**, para usar o oráculo.
  *AC:* Stripe (assinatura, one-time, pacotes); webhook assinado → Subscription/Credits.
- **S9.2** — Como usuário, quero **instalar o app** na tela inicial, para acesso diário.
  *AC:* PWA nativo; prompt pós-checkout.

---

## E10 — i18n & Escala Global

- **S10.1** — Como usuário, quero a interface no **meu idioma** (pt-BR/en), para conforto.
  *AC:* `next-intl`; nada hardcoded; rotas localizadas.
- **S10.2** — Como produto, quero o **Grimório e a persona em inglês**, para o mercado global.
  *AC:* bibliotecas traduzidas; checkout multi-moeda.

---

## Casos de Validação (regressão)

- **T1 — Numerologia:** caso conhecido → Caminho de Vida e números tântricos corretos (Doc 11).
- **T2 — Astrologia:** data/hora/local → Sol/Asc esperados; aspectos com `nature`.
- **T3 — Anti-alucinação:** ritual do Dashboard sempre tem `grimoireId` válido (nada inventado).
- **T4 — Créditos:** pergunta complexa debita 3; saldo zerado bloqueia com upsell.
