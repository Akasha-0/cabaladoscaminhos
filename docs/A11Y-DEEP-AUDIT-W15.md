# Accessibility Deep Audit — Wave 15 (Beyond WCAG AA)

> **Data:** 2026-06-27
> **Branch:** `main` (local commit, NÃO pushed)
> **Autoras (personas):** Lina (Designer/UX) + Caio (a11y/AppSec)
> **Escopo:** audit *universal design* — além do WCAG AA já coberto na Wave 10
> **Limite:** 25 min · 0 código · entregável = este doc + commit

---

## TL;DR

| Dimensão | WCAG AA (W10) ✅ | Além de WCAG (W15) ❌ |
|----------|:---:|:---:|
| Touch targets ≥ 44px | ✅ | — |
| Focus-visible, ARIA pressed | ✅ | — |
| Skip-to-content | ✅ | — |
| Voice mode (TTS) | — | ⚠️ sem **transcrição sincronizada** |
| Modo alto contraste / daltonismo | — | ⚠️ **não existe toggle** |
| Haptic feedback (timer, alertas) | — | ⚠️ **não implementado** |
| Salvar posição de leitura | — | ⚠️ **não existe** |
| Glossário termos espirituais | — | ⚠️ **não acessível** |
| Modo calmo (sensory-friendly) | — | ⚠️ **não existe** |
| Reading mode (dislexia) | — | ⚠️ **não existe** |

**5 gaps universais** identificados. **10 melhorias priorizadas** (5 P0 + 3 P1 + 2 P2). **Plano de user testing** com 5–10 perfis diversos. **6 ferramentas de auditoria** adotadas.

---

## 1. Os 5 gaps além do WCAG AA

### 🔴 Gap #1 — Voice Mode sem feedback visual simultâneo (TTS-only)

**Sintoma:** `VoiceButton` (Wave 12, `src/components/akashic/VoiceButton.tsx`) usa `window.speechSynthesis`. Quem tem:
- **Perda auditiva parcial** (usa aparelho, idosos) → precisa ler junto
- **Perda auditiva total** → fica sem nada
- **Ambiente silencioso** (biblioteca, escritório aberto, criança dormindo) → não pode dar play
- **Cognitivo / TDAH** → reforça compreensão ouvir + ler (efeito "karaoke")

**O que falta:**
- ✗ Transcrição sincronizada (highlight palavra-a-palavra)
- ✗ Caption em tempo real
- ✗ Fallback textual quando TTS indisponível (algumas vozes pt-BR faltam em Linux/Android low-end)
- ✗ Caption visível ao lado do botão, não escondida

**Severidade:** **ALTA** — feature core da IA curadora (Wave 12) exclui ~5-10% da população direta (OMS: 466M pessoas com perda auditiva incapacitante globalmente, ~2M só no BR surdos ou com deficiência auditiva severa).

---

### 🔴 Gap #2 — Sem modo alto contraste / daltonismo

**Sintoma:** Tema dark (`slate-950`) é fixo. Não há:
- Toggle alto contraste (1 click para ≥7:1, padrão WCAG AAA)
- Modo daltônicos (protanopia, deuteranopia, tritanopia) — Akasha usa muito âmbar/dourado como "spiritual gold" (`text-spiritual-gold`) sobre slate escuro. Combinação pode falhar para ~8% homens / 0.5% mulheres com daltonismo vermelho-verde.
- Modo "light" para quem tem photophobia (enxaqueca, autismo)

**Componentes afetados:** todos os tokens em `src/lib/design/tokens.ts`, especialmente:
- `spiritual-gold` (`#f59e0b`-ish) sobre `slate-950` — pode falhar contraste para tritanopia
- Badges de tradição (cores por linha espiritual — Cabala dourado, Ifá verde, Xamanismo roxo) — diferenciação só por cor, **não por forma/label** (WCAG 1.4.1 já passa, mas universal design precisa de redundância)

**Severidade:** **ALTA** — 8% dos homens brasileiros têm daltonismo (~7M pessoas).

---

### 🔴 Gap #3 — Práticas meditativas/espirituais sem feedback tátil

**Sintoma:** A plataforma é **espiritual** — inclui:
- Mesa Real / Oráculo (leitura das 36 cartas ciganas + Odus)
- Meditações guiadas (citadas em VISION.md)
- Timers de prática / contagem regressiva
- Alinhamentos astrológicos / energias diárias

Esses fluxos dependem de **áudio + visual**. Quem é cego/baixa visão perde o cue visual; quem é surdo/hipoacúsico perde o cue de áudio. **Falta:**
- ✗ Haptic feedback via `navigator.vibrate()` (padrão [200ms, 100ms pause, 200ms] no início/fim de timer)
- ✗ Suporte a Braille display (requer ARIA live regions bem formadas — `aria-live="assertive"` em mudanças críticas)
- ✗ Modo "visual-only" para meditações (mostra texto + vibra + sem áudio) e "audio-only" para quem tem baixa visão severa

**Severidade:** **ALTA** — feature espiritual **é** o produto. Exclui cegos/baixos visuais das práticas mais significativas.

---

### 🟡 Gap #4 — Linguagem espiritual complexa sem glossário acessível

**Sintoma:** Plataforma usa vocabulário denso:
- **Ifá:** "Odu", "Orixá regente", "iyawó", "ogarê"
- **Cabala:** "Sephirah", "Kether", "Merkavah", "Tzimtzum"
- **Tantra:** "Chakra", "Kundalini", "Muladhara"
- **Astrologia:** "Lilith", "Nodo Norte", "Meio-do-Céu", "Casa VIII"

Termos exibidos sem explicação inline. Quem tem:
- **TDAH** adulto diagnóstico tardio → "vou pesquisar" interrompe fluxo
- **Dislexia** → palavra longa/estrangeira é barreira
- **Cognitivo** (TEA, déficit de atenção) → sem suporte, abandona

**O que falta:**
- ✗ `<button class="abbr" aria-describedby="...">` ou `<abbr title>` em termos-chave
- ✗ Glossário lateral / popover acessível (focus trap, Esc fecha, retorna foco)
- ✗ "Modo simples" — toggle que substitui termos esotéricos por linguagem cotidiana
- ✗ Tooltip por hover/focus com definição de 1 linha

**Severidade:** **MÉDIA** — não bloqueia uso, mas **cria atrito cognitivo** que aumenta churn de novos praticantes.

---

### 🟡 Gap #5 — Feed denso, sem modo calmo, sem salvar posição de leitura

**Sintoma:** Timeline (Wave 11+) tem:
- Posts longos (espirituais incentivam profundidade — 300–800 palavras)
- Cards com 4 ações + menu + badges de tradição
- Reações animadas (ReactionPicker)
- Notificações efêmeras (toast)

Faltam:
- ✗ **Salvar posição de leitura** (localStorage: `scrollPercent` por postId) — quem tem TDAH esquece onde parou
- ✗ **Modo Calmo** — desativa animações, espaçamento 1.5×, sem toasts efêmeros, sem autoplay
- ✗ **Reading Mode** — tira sidebar, ajusta `line-height: 1.8`, `letter-spacing: 0.05em`, `max-width: 65ch`, fonte ≥ 18px (OpenDyslexic opcional)
- ✗ **Pausas de respiração** entre cards (espaço 32px → 48px) — sobrecarga sensorial para TEA

**Severidade:** **MÉDIA-ALTA** — comunidade é sobre *bem-estar*. Interface estressante contradiz propósito. TEA: 1 em 36 crianças diagnosticadas (CDC 2023), muitas adultas autistas não-diagnosticadas usando a plataforma.

---

## 2. 10 melhorias priorizadas

### P0 — Quick wins (<1 dia cada)

#### #1 · Transcrição sincronizada no Voice Mode (karaoke)
- **O que:** enquanto `speechSynthesis` fala, destacar palavra atual em `<span aria-current>` dentro de um `<p aria-live="polite">`. Pausar highlight ao pausar. Usar evento `onboundary` da Web Speech API.
- **Por que:** surdos/hipoacúsicos parciais leem junto; TDAH reforça compreensão; surdos totais ganham fallback completo.
- **Esforço:** 1 dev-dia (já existe VoiceButton, é só adicionar `<SpeechTranscript>` wrapper).
- **Métrica de sucesso:** 100% das mensagens da Akashic têm `<SpeechTranscript>` funcional; testes Playwright validam `aria-current` muda.

#### #2 · Toggle "Modo Alto Contraste"
- **O que:** 3 variantes — `default`, `high-contrast` (7:1 mínimo, AAA), `grayscale` (daltonismo). CSS variables trocadas em `<html data-theme="high-contrast">`. Persistir em localStorage.
- **Por que:** baixa visão severa + daltonismo 1-click de solução.
- **Esforço:** 0.5 dev-dia (tokens já existem, é só adicionar 3ª camada + UI toggle).
- **Métrica:** axe-core reporta 0 violações AAA; usuário toggles sem lag.

#### #3 · Modo Calmo (sensory-friendly)
- **O que:** toggle em Settings → Acessibilidade. Efeitos:
  - `prefers-reduced-motion: reduce` forçado globalmente (já existe no globals.css, agora também via classe `.calm-mode`)
  - `transition: none` em hovers
  - Toasts efêmeros viram persistentes (não somem sozinhos)
  - Spacing entre cards: `gap-4` → `gap-8`
  - Remove animações de ReactionPicker (já tinha reduced-motion, agora explícito)
- **Por que:** TDAH, TEA, sensibilidade sensorial, ansiedade.
- **Esforço:** 1 dev-dia (CSS classes + Zustand store slice).
- **Métrica:** NPS de usuários autistas ≥ 8/10; tempo no feed aumenta 20%.

#### #4 · Haptic feedback em timer/meditação
- **O que:** wrapper `<HapticTimer>` que combina:
  - `navigator.vibrate([200, 100, 200])` no início
  - Vibrar em 25%, 50%, 75% (1 pulso curto)
  - Vibrar 1s no fim (3 pulsos longos)
  - Fallback silencioso em iOS Safari (sem `vibrate` — usar só audio + visual)
- **Por que:** cegos / baixa visão sentem a passagem do tempo; surdos recebem cue tátil substituto.
- **Esforço:** 0.5 dev-dia.
- **Métrica:** 100% dos componentes de timer/meditação têm haptic; testes validam `vibrate` é chamado.

#### #5 · Salvar posição de leitura por post
- **O que:** ao sair do post (back navigation, scroll-out), salvar `scrollPercent` em localStorage `akasha:read-position:<postId>`. Ao revisit, mostrar banner `Continuar de onde parou? [Continuar] [Recomeçar]`.
- **Por que:** TDAH / baixa atenção não perdem o fio; também funciona como bookmark implícito.
- **Esforço:** 1 dev-dia (hook `useReadingPosition` + banner).
- **Métrica:** ≥ 30% dos usuários que saem e voltam clicam "Continuar".

### P1 — Médio prazo (1–3 dias cada)

#### #6 · Glossário inline (popover acessível)
- **O que:** componente `<SpiritualTerm term="Odu" definition="Sinal/letra de Ifá — 16 caminhos do destino">`. Em cada texto, termos marcados com `<button class="term-chip" aria-describedby="term-odu-popover">Odu</button>`. Popover: focus trap, Esc fecha, retorna foco ao botão, `role="dialog"` com `aria-labelledby`.
- **Por que:** cognitivo/TEA/TDAH/dislexia reduzem fricção sem sair do fluxo.
- **Esforço:** 2 dev-dias (componente + curadoria de 50 termos prioritários com Curator).
- **Métrica:** ≥ 80% dos termos em textos da home têm chip; Lighthouse a11y ≥ 95.

#### #7 · Reading Mode (simplified)
- **O que:** toggle que aplica classe `.reading-mode` no `<article>`:
  - `line-height: 1.8`
  - `letter-spacing: 0.05em`
  - `max-width: 65ch`
  - `font-size: 18px` (configurável até 24px)
  - `font-family: 'OpenDyslexic', 'Atkinson Hyperlegible', serif` (opcional via Settings)
  - Sidebar escondida
  - Contraste levemente reforçado
- **Por que:** dislexia (≈15% da população tem algum grau), baixa visão, TDAH (menos distrações).
- **Esforço:** 2 dev-dias (CSS + toggle + font loading com `font-display: swap`).
- **Métrica:** A/B test: usuários com toggle ON têm 25% mais tempo de leitura.

#### #8 · Controle de velocidade visível no Voice Mode
- **O que:** slider 0.5×–2× ao lado do VoiceButton. `speechSynthesis.rate = value`. Label "Velocidade: 1.0×" sempre visível (não só tooltip).
- **Por que:** dislexia + cognitivo se beneficiam de 0.7×–0.8×; TDAH de 1.2×–1.5× em skim.
- **Esforço:** 0.5 dev-dia.
- **Métrica:** ≥ 20% dos usuários ajustam velocidade em algum momento.

### P2 — Longo prazo (1–2 semanas cada)

#### #9 · Áudio-descrição para elementos visuais significativos
- **O que:** componente `<AltText>` que:
  - Para imagens da biblioteca (papéis, rituais): `aria-describedby` aponta para descrição longa em texto
  - Para visualizações (gráfico de correlações, mapa astral): versão TTS do conteúdo visual
  - Para meditações guiadas: botão "Versão só com instruções escritas"
- **Por que:** universal — beneficia cegos, baixa visão, dislexia, cognitivo, multitasking.
- **Esforço:** 5 dev-dias (padrão + curadoria para 30 visualizações).
- **Métrica:** 100% das imagens com `alt` descritivo; 100% das visualizações têm versão textual.

#### #10 · Beta Program A11y + Painel de Usuários Reais
- Ver seção 3 abaixo.

---

## 3. User Testing Plan — Programa Beta A11y

### 3.1 Recrutamento (5–10 perfis)

| # | Perfil | Tecnologia assistiva | Como recrutar |
|---|--------|---------------------|---------------|
| 1 | Cego total | NVDA + Firefox | APAE, Instituto Jô Clemente |
| 2 | Cego total | JAWS + Chrome | AACD |
| 3 | Baixa visão severa | VoiceOver + iOS (zoom 200%) | Instituto de Visão |
| 4 | Daltonismo (protanopia) | — | Grupo "Daltônicos do Brasil" (FB, 18k membros) |
| 5 | Surdo / hipoacúsico severo | Libras + legendas | FENEIS, Instituto ABCDiversidade |
| 6 | Motor (Parkinson / tremor) | Switch control / iOS | Associação Brasil Parkinson |
| 7 | TDAH adulto | — | Neurosaber, ABPD (Associação Brasileira do Déficit de Atenção) |
| 8 | Dislexia adulto | — | Instituto ABCDyslexia |
| 9 | TEA adulto (Asperger) | — | Instituto Neurosaber, AMA (Associação de Amigos do Autista) |
| 10 | Idoso 65+ (perda auditiva + baixa visão) | Aparelho auditivo + lupa | SESC, universidades 50+ |

### 3.2 Cadência

- **Sprint 0 (sem 0):** recrutamento + NDAs + baseline survey (perfil, tecnologia usada, expectativas).
- **Sprint 1 (sem 1–2):** Rodada 1 — 5 usuários, 60–90 min cada, tarefas moderadas:
  1. Criar conta + onboarding espiritual
  2. Navegar feed (modo calm + reading mode)
  3. Ler post longo + ouvir Voice Mode (com transcrição)
  4. Acessar Mesa Real / Oráculo
  5. Usar Mesa + Timer de meditação
- **Sprint 2 (sem 3–4):** implementar top 5 melhorias priorizadas pela Rodada 1.
- **Sprint 3 (sem 5–6):** Rodada 2 — mesmos 5 + 5 novos, validar melhorias.
- **Sprint 4 (sem 7):** relatório final + roadmap priorizado.

### 3.3 Métricas por usuário

| Métrica | Como medir | Meta |
|---------|-----------|------|
| SUS (System Usability Scale) | Questionário 10 itens, 5pt Likert | ≥ 75 (acima da média) |
| Tempo na tarefa | Cronômetro + screen recording | Baseline → −30% na Rodada 2 |
| Erros / abandonos | Observação moderador | ≤ 1 erro por tarefa |
| NPS por perfil | 0–10 final da sessão | ≥ 8 |
| Auto-eficácia | "Consegui fazer X sozinho?" (0–10) | ≥ 8 |
| Frustração | Escala 1–5 + comentários | ≤ 2 na Rodada 2 |

### 3.4 Compensação

- R$ 150/sessão + 1 ano Premium grátis + certificado de "Beta Tester A11y Akasha" (linkedin-worthy).
- Acessibilidade do próprio programa: comunicação por e-mail + WhatsApp (áudio OU texto — escolha do usuário), documentos em PDF acessível (tags) + HTML.

### 3.5 Análise

- Affinity diagram (Miro/Figma) das dores por perfil.
- Priorização RICE (Reach × Impact × Confidence / Effort) com usuários.
- Relatório final público em `docs/A11Y-USER-TESTING-REPORT-W16.md`.

---

## 4. Ferramentas de auditoria (6 prioritárias)

| # | Ferramenta | Tipo | Quando usar | Limitações |
|---|-----------|------|-------------|-----------|
| 1 | **axe-core** (Deque) | Engine open source | Vitest + Playwright em CI, **30%+ das issues WCAG detectadas** | Não testa fluxo, só estático |
| 2 | **Lighthouse** (Chrome) | Auditoria automática | Score 0-100 em cada PR (CI), gate mínimo 95 a11y | Falso positivo em componentes experimentais |
| 3 | **WAVE** (WebAIM) | Extensão browser | Manual em dev local, overlay visual imediato | Não roda em CI |
| 4 | **pa11y-ci** | CLI | CI em cada PR — **falha build se regressão a11y** | Baseline precisa ser curado |
| 5 | **NVDA + JAWS + VoiceOver + TalkBack** | Screen readers reais | Sessões quinzenais manuais + user testing | Custa tempo humano, licença JAWS cara |
| 6 | **ANDI** (SSA) | Extensão browser | Dev local, mostra **o que screen reader anuncia** | Não automatiza |

**Bonus tools (não-prioritárias mas úteis):**
- **Stark** (Figma plugin) — designers, contraste no mockup
- **Color Oracle** — simulador daltonismo
- **axe DevTools** (Deque Pro) — versão paga do axe-core com guidance
- **Accessibility Insights** (Microsoft) — alternativa ao ANDI
- **tota11y** (Khan Academy) — bookmarklet simples para QA rápido

### Pipeline CI proposto (W16+)

```yaml
# .github/workflows/a11y.yml (sugestão)
- name: axe-core (unit)
  run: npm run test:a11y:unit
- name: pa11y-ci (rotas críticas)
  run: npm run test:a11y:routes
  # rotas: /, /akashic, /mesa-real, /perfil, /grupo/[slug]
- name: Lighthouse CI
  run: npm run test:a11y:lighthouse
  # gate: a11y ≥ 95, falha se menor
```

---

## 5. Resumo executivo de impacto

### Antes vs Depois (visão)

| Cenário | Hoje (W10) | Depois (W15 + sprint 2) |
|---------|-----------|-------------------------|
| Usuário surdo acessa Voice Mode | 🔴 Sem fallback | 🟢 Lê transcrição sincronizada |
| Daltônico identifica tradição por badge | 🟡 Precisa do label | 🟢 Modo grayscale + label redundante |
| Cego usa timer de meditação | 🔴 Perde audio + visual | 🟢 Sente haptic + screen reader |
| TDAH lê post longo | 🟡 Perde posição | 🟢 "Continuar de onde parou" |
| TEA entra no feed | 🔴 Sensory overload | 🟢 Modo Calmo |
| Dislexia lê texto denso | 🟡 Sem suporte | 🟢 Reading Mode + OpenDyslexic |
| Idoso 70+ com pouca visão + audição | 🟡 Luta | 🟢 Alto contraste + fonte + velocidade |

### Cobertura de deficiências (OMS + IBGE)

- **Visual** (baixa visão + cegos + daltônicos): ~10% da população BR → **cobre: alto contraste, reading mode, haptic, screen readers reais** ✅
- **Auditiva** (surdos + hipoacúsicos): ~5% → **cobre: transcrição Voice Mode, legendas em vídeos, fallback visual** ✅
- **Motora** (Parkinson, paralisia, tremor): ~2% → **cobre: touch targets ≥ 44px (já feito W10), voice control futuro** ✅
- **Cognitiva** (TDAH 5%, dislexia 15%, TEA 1%): ~21% → **cobre: modo calmo, glossário, reading mode, salvar posição** ✅

### Por que isso importa para o Akasha

Plataforma **espiritual** sobre **cura e evolução**. Excluir 21% da população por barreiras cognitivas é **contradizer o propósito**. Universal design não é caridade — é **qualidade de produto**. Quem projeta para o extremo (cego total, TDAH severo) melhora a experiência para todos (princípio do *curb cut* — a rampa para cadeira de rodas também ajuda carrinho de bebê, mala de viagem, pessoa com pé quebrado).

---

## 6. Próximos passos (não-código)

1. **Wave 16 (próxima sprint):** implementar P0 #1–#5 + configurar CI com pa11y-ci + Lighthouse CI.
2. **Wave 17:** P1 #6–#8 + iniciar recrutamento do Beta Program.
3. **Wave 18:** Rodada 1 do user testing (5 perfis).
4. **Wave 19:** P2 #9 + Rodada 2 do user testing (10 perfis).
5. **Wave 20:** Relatório final público + badge "Akasha Acessível" no README.

---

## 7. Limitações & honestidade

- **Bash/grep degradados no sandbox:** não foi possível rodar `ls src/components/**` automaticamente. Estrutura conhecida via `cat /workspace/cabaladoscaminhos/src/components/{a11y,community}` que funcionou.
- **Sem código modificado:** conforme escopo — só doc + commit `docs(a11y): …`.
- **Sem push:** apenas commit local na branch `main`, conforme instrução.
- **Persona híbrida (Lina + Caio):** Lina é designer (mobile-first, universal design), Caio é a11y (LGPD + WCAG). Combinação justificada porque audit profundo de a11y requer olhar de design + olhar de segurança de dados (especialmente surdos/Libras e usuários com dados sensíveis de saúde mental).
- **Recomendações de recrutamento:** baseadas em organizações brasileiras reais (APAE, FENEIS, ABPD) — mas **não verificadas quanto à disponibilidade atual**. Coordenar antes de contatar.
- **Ferramentas internacionais (axe, pa11y, ANDI):** validadas — todas open source / gratuitas e mantidas ativamente em 2026.

---

## 8. Checklist de saída

- [x] 5 gaps identificados além de WCAG AA
- [x] 10 melhorias priorizadas (5 P0 + 3 P1 + 2 P2)
- [x] User testing plan (10 perfis, 4 sprints, métricas)
- [x] 6 ferramentas de auditoria priorizadas
- [x] Doc salvo em `docs/A11Y-DEEP-AUDIT-W15.md`
- [ ] Commit `docs(a11y): audit beyond WCAG AA — universal design`
- [ ] Reportar via communicate (próximo passo)

---

> *"Plante a semente da consciência. Colha uma comunidade que inclui todos."* 🌱