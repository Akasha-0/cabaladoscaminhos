# Documento 05 — Especificação UI/UX
## Cabala dos Caminhos
> **Versão:** 1.0 | **Modo:** Dark Mode (único — sem modo claro)
> **Alvo:** Desktop First (1280px+), adaptado para tablet
> ⚠️ **SUPERSEDED** por **Doc 17** (`17_arquitetura-interface-unica.md`). A visão vigente de UI/UX é a Mesa Real em página única (`/cockpit`). Doc 17 é a fonte de verdade; Doc 05 está retido para referência histórica.

## 1. Design System

### 1.1 Paleta de Cores (CSS Variables) — v2 Cigano Ramiro

> **Fonte canônica: Doc 13.** Substitui a paleta dourado/âmbar + esmeralda (v1). Identidade: **laranja** (fogo, ação, abertura de caminhos) + **azul royal** (profundidade, mistério, proteção).

```css
/* tailwind.config.ts — extend colors */
:root {
  /* Backgrounds — azul-noite (harmoniza com o royal) */
  --bg-canvas:   #0A0E1A;  /* fundo principal */
  --bg-surface:  #111726;  /* cards e painéis */
  --bg-elevated: #1A2236;  /* elementos elevados */
  --bg-border:   #2A3550;  /* bordas */

  /* Primária — LARANJA (Ramiro: luz, fogo, movimento, abertura de caminhos) */
  --accent-orange:        #F97316;
  --accent-orange-bright: #FB923C;
  --accent-orange-dim:    #C2410C;
  --accent-orange-glow:   rgba(249,115,22,0.18);

  /* Secundária — AZUL ROYAL (Ramiro: profundidade, mistério, nobreza, proteção) */
  --accent-royal:        #2547D0;
  --accent-royal-bright: #3B5BDB;
  --accent-royal-dim:    #1E3A8A;
  --accent-royal-glow:   rgba(37,71,208,0.18);

  /* Alerta — Rosa (Atenção, Corte, Urgência) */
  --accent-alert: #F43F5E;

  /* Texto */
  --text-primary:   #F5F7FF;
  --text-secondary: #9AA7C7;
  --text-muted:     #56618A;
}
```

**Mapeamento semântico (Doc 13 §4):** laranja = elementos *ativos* (casa preenchida, glow do slot, botão "Gerar Dossiê", `h2` de casa, palavra-chave de destaque); azul royal = *estrutura e profundidade* (badges, glows internos, linha-síntese em itálico, bolhas do Oráculo no chat).

### 1.2 Tipografia

```css
/* Fontes via Google Fonts ou local */

/* Títulos místicos, nomes de casas, elementos de destaque */
font-family: 'Cinzel', serif;
/* Peso: 400, 600, 700 */

/* Dados, labels, textos de interface */
font-family: 'Cormorant Garamond', serif;
/* Peso: 300, 400, 600 */

/* Números de casas, dados técnicos, IDs */
font-family: 'JetBrains Mono', monospace;
/* Peso: 400 */

/* Corpo do dossiê gerado pela IA */
font-family: 'Lora', serif;
/* Peso: 400, 500 */
```

### 1.3 Escala de Espaçamento e Raios
- Espaçamento: múltiplos de 4px (sistema Tailwind padrão)
- Border radius padrão de cards: `rounded-xl` (12px)
- Border radius de badges: `rounded-full`
- Sombras: custom glow effects para elementos ativos

---

## 2. Layout Global das Telas do Dashboard

> ⚠️ **Superseded pelo Doc 17 (Interface Única).** A navegação multi-tela abaixo (sidebar com Nova Consulta / Consulentes / Dashboard / Leituras) foi substituída pela decisão de **uma só página** (a Mesa Real, `/cockpit`). As 4 entradas natais, a seleção de consulente e a saída do dossiê passam a viver **dentro da página única** (zonas A/B/C — Doc 17 §2). Mantido aqui apenas como referência histórica.

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR FIXA (w-72 = 288px)    │  ÁREA PRINCIPAL (flex-1)      │
│                                  │                               │
│  ┌──────────────────────────┐   │  ┌───────────────────────┐   │
│  │  [Logo]                  │   │  │  TOPBAR (h-14)        │   │
│  │  Cabala dos Caminhos     │   │  │  Título da tela atual │   │
│  └──────────────────────────┘   │  └───────────────────────┘   │
│                                  │                               │
│  ┌──────────────────────────┐   │  ┌───────────────────────┐   │
│  │  [Nav Items]             │   │  │                       │   │
│  │  🔮 Nova Consulta        │   │  │   CONTEÚDO DA PÁGINA  │   │
│  │  👥 Consulentes          │   │  │                       │   │
│  │  📋 Dashboard            │   │  │                       │   │
│  │  📄 Leituras             │   │  │                       │   │
│  └──────────────────────────┘   │  └───────────────────────┘   │
│                                  │                               │
│  [Bottom: Perfil do operador]   │                               │
└─────────────────────────────────────────────────────────────────┘
```

**Implementação (`DashboardLayout.tsx`):**
```tsx
<div className="flex h-screen bg-[#0A0E1A] overflow-hidden">
  <Sidebar className="w-72 flex-shrink-0 border-r border-[#2A3550]" />
  <div className="flex-1 flex flex-col overflow-hidden">
    <Topbar />
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
</div>
```

---

## 3. Tela: Dashboard (`/dashboard`)

**Objetivo:** Visão geral rápida. O operador chega aqui após o login.

```
┌─────────────────────────────────────────────────────────────────┐
│  TOPBAR: "Painel Principal" + [Botão: + Nova Consulta]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  12          │  │  47          │  │  3           │             │
│  │  Consultas   │  │  Consulentes │  │  Hoje        │             │
│  │  este mês    │  │  cadastrados │  │  pendentes   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ÚLTIMAS LEITURAS                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Nome            │  Data        │  Status    │  Ação     │   │
│  │  Maria Silva     │  01/06/2026  │  ✅ Pronto │ Ver PDF   │   │
│  │  João Santos     │  31/05/2026  │  ✅ Pronto │ Ver PDF   │   │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Tela: Nova Consulta (`/dashboard/nova-consulta`) — O COCKPIT

Esta é a tela principal do produto. Deve ser projetada para **operação em tempo real** durante o atendimento.

### 4.1 Layout Macro (Duas Zonas)

```
┌──────────────────────────┬────────────────────────────────────────────┐
│  PAINEL DO CONSULENTE    │  MESA REAL — GRID 9×4                       │
│  (w-80 = 320px, fixo)   │  (flex-1, área central)                     │
│                          │                                              │
│  [Buscador de cliente]   │  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┐             │
│                          │  │01│02│03│04│05│06│07│08│09│             │
│  ──────────────────────  │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤             │
│                          │  │10│11│12│13│14│15│16│17│18│             │
│  Nome completo           │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤             │
│  "João da Silva"         │  │19│20│21│22│23│24│25│26│27│             │
│                          │  ├──┼──┼──┼──┼──┼──┼──┼──┼──┤             │
│  ──────────────────────  │  │28│29│30│31│32│33│34│35│36│             │
│                          │  └──┴──┴──┴──┴──┴──┴──┴──┴──┘             │
│  MAPAS CALCULADOS:       │                                              │
│  ☀ Sol: Leão             │  Cartas na Mesa: 12/36                      │
│  ↑ Asc: Virgem           │                                              │
│  🔢 Vida: 7              │  [Limpar Mesa]         [✨ Gerar Dossiê]    │
│  🕉 Alma: 2              │                                              │
│  🌊 Karma: 8             │                                              │
│  🎁 Dom: 5               │                                              │
│  🏺 Odu: Ejionile (8)    │                                              │
│                          │                                              │
│  ──────────────────────  │                                              │
│                          │                                              │
│  [✨ GERAR DOSSIÊ]       │                                              │
│  (botão master aqui      │                                              │
│  também para acesso       │                                              │
│  rápido)                 │                                              │
└──────────────────────────┴────────────────────────────────────────────┘
```

### 4.2 Painel do Consulente (Sidebar Esquerda da Consulta)

**Seção 1 — Seleção do Consulente:**
```tsx
<div className="p-4 border-b border-slate-800">
  <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
    Consulente
  </label>
  <ClientSearchCombobox
    onSelect={(client) => store.setClient(client)}
    placeholder="Buscar por nome..."
  />
</div>
```

**Seção 2 — Resumo dos Mapas (após selecionar cliente):**

Cada mapa é exibido como um grupo de badges compactos:

```tsx
// Grupo Astrológico
<div className="space-y-1">
  <span className="text-xs text-slate-500 uppercase">Astrologia</span>
  <div className="flex flex-wrap gap-1">
    <Badge variant="astro">☀ Leão</Badge>
    <Badge variant="astro">🌙 Escorpião</Badge>
    <Badge variant="astro">↑ Virgem</Badge>
  </div>
</div>

// Grupo Numerológico
<div className="space-y-1">
  <span className="text-xs text-slate-500 uppercase">Numerologia</span>
  <div className="flex flex-wrap gap-1">
    <Badge variant="kabala">Vida: 7</Badge>
    <Badge variant="kabala">Missão: 11</Badge>
    <Badge variant="tantric">Alma: 2</Badge>
    <Badge variant="tantric">Karma: 8</Badge>
    <Badge variant="tantric">Dom: 5</Badge>
  </div>
</div>

// Odu de Nascimento
<div className="space-y-1">
  <span className="text-xs text-slate-500 uppercase">Odu Natal</span>
  <Badge variant="odu">Ejionile (8) — Xangô</Badge>
</div>
```

**Estilos dos Badges (v2 — Doc 13 §4.3; laranja + royal apenas):**
- `variant="astro"`: bg-[#1E3A8A]/20 border-[#2547D0]/40 text-[#3B5BDB]
- `variant="kabala"`: bg-[#2547D0]/10 border-[#3B5BDB]/40 text-[#F5F7FF]
- `variant="tantric"`: bg-[#C2410C]/20 border-[#F97316]/40 text-[#FB923C]
- `variant="odu"`: bg-[#2547D0]/15 border-[#3B5BDB]/50 text-[#3B5BDB]

> Princípio: a numerologia tântrica (dom/fogo da alma) puxa para o laranja; astrologia, cabala e Odu (estrutura/profundidade) puxam para o royal.

---

### 4.3 O Grid da Mesa Real (Área Central)

**Container do Grid:**
```tsx
<div
  className="
    grid grid-cols-9 gap-2
    p-4 rounded-2xl
    bg-gradient-to-br from-[#111726]/60 to-[#0A0E1A]/80
    border border-[#2A3550]
    shadow-[inset_0_0_60px_rgba(37,71,208,0.05)]
  "
>
  {HOUSES.map((house) => (
    <CasaSlot key={house.id} house={house} />
  ))}
</div>
```

**Componente `CasaSlot` — Estado Vazio:**
```tsx
// Dimensão: height: 140px, width: auto (proporcional ao grid)
<div
  className="
    relative flex flex-col items-center justify-center
    h-36 rounded-xl cursor-pointer
    bg-[#111726]/50
    border border-dashed border-[#2A3550]/60
    hover:border-orange-500/40 hover:bg-[#1A2236]/60
    hover:-translate-y-0.5
    transition-all duration-200
  "
  onClick={() => openPopover(house.id)}
>
  {/* Número da casa */}
  <span className="absolute top-1.5 left-2 text-[10px] font-mono text-slate-600">
    {String(house.id).padStart(2, '0')}
  </span>

  {/* Ícone de adicionar */}
  <div className="text-slate-700 text-2xl opacity-40">+</div>

  {/* Nome da casa */}
  <span className="
    absolute bottom-1.5 left-0 right-0 text-center
    text-[9px] uppercase tracking-widest text-slate-600
    px-1 leading-tight
  ">
    {house.name}
  </span>
</div>
```

**Componente `CasaSlot` — Estado Preenchido:**
```tsx
<div
  className="
    relative flex flex-col items-center justify-center gap-1
    h-36 rounded-xl cursor-pointer
    bg-gradient-to-b from-[#1A2236]/70 to-[#111726]/70
    border border-orange-500/40
    shadow-[0_0_12px_rgba(249,115,22,0.10)]
    hover:border-orange-400/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.18)]
    hover:-translate-y-0.5
    transition-all duration-200
  "
  onClick={() => openPopover(house.id)}
>
  {/* Número da casa */}
  <span className="absolute top-1.5 left-2 text-[10px] font-mono text-slate-500">
    {String(house.id).padStart(2, '0')}
  </span>

  {/* Nome da carta tirada */}
  <span className="text-xs font-semibold text-orange-400 text-center px-2 leading-tight font-['Cinzel']">
    {slotData.cartaName}
  </span>

  {/* Odu tirado */}
  <span className="
    text-[10px] font-medium text-[#3B5BDB]
    bg-[#1E3A8A]/40 border border-[#2547D0]/40
    px-2 py-0.5 rounded-full
  ">
    {slotData.oduName}
  </span>

  {/* Nome da casa no rodapé */}
  <span className="
    absolute bottom-1.5 left-0 right-0 text-center
    text-[9px] uppercase tracking-widest text-slate-600
    px-1 leading-tight
  ">
    {house.name}
  </span>
</div>
```

---

### 4.4 O Popover de Input (Fricção Zero)

**Comportamento:**
- Abre ao clicar no slot
- Se ancora ao slot clicado (Radix Popover com `side="top"` ou `"bottom"` automático)
- **Não** bloqueia a visão do restante do grid
- Fecha ao pressionar Esc, Enter (após preencher) ou clicar fora

**Estrutura do Popover:**
```tsx
<PopoverContent
  className="w-72 p-4 bg-slate-900 border border-slate-700 shadow-2xl shadow-black/50 rounded-2xl"
  align="start"
  sideOffset={8}
>
  {/* Header */}
  <div className="mb-4">
    <p className="text-[10px] uppercase tracking-widest text-slate-500">Preenchendo</p>
    <p className="text-sm font-semibold text-orange-400 font-['Cinzel']">
      Casa {house.id} — {house.name}
    </p>
  </div>

  {/* Campo 1: Carta Cigana */}
  <div className="mb-3">
    <label className="text-xs text-slate-400 mb-1.5 block">Carta Cigana</label>
    <CartaCombobox
      value={selectedCarta}
      onChange={setSelectedCarta}
      placeholder="Buscar carta..."
    />
  </div>

  {/* Campo 2: Odu */}
  <div className="mb-4">
    <label className="text-xs text-slate-400 mb-1.5 block">Odu</label>
    <OduCombobox
      value={selectedOdu}
      onChange={setSelectedOdu}
      placeholder="Selecionar Odu..."
    />
  </div>

  {/* Ações */}
  <div className="flex gap-2">
    <Button variant="ghost" size="sm" onClick={close} className="flex-1">
      Cancelar
    </Button>
    <Button
      size="sm"
      onClick={handleConfirm}
      disabled={!selectedCarta || !selectedOdu}
      className="flex-1 bg-orange-500 hover:bg-orange-400 text-white"
    >
      Confirmar ↵
    </Button>
  </div>
</PopoverContent>
```

**O ComboBox de Cartas (`CartaCombobox`):**
- Usa `Command` do Shadcn/ui (Combobox com busca)
- Lista as 36 cartas no formato: `"19 — A Torre"`
- Busca por número OU nome: digitar "19" ou "torre" retorna A Torre
- Resultado em lista com scroll, max 8 itens visíveis

**O ComboBox de Odus (`OduCombobox`):**
- Lista os 16 Odus no formato: `"8 — Ejionile (Xangô/Oxalá)"`
- Busca por número, nome ou Orixá

---

## 5. Tela: Visualização do Dossiê

Após clicar "Gerar Dossiê", a tela faz uma transição suave para o modo de visualização.

**Layout durante processamento:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Loader orbital animado em laranja]                         │
│  "Cruzando os mapas das 36 casas..."                        │
│  "Consultando os Odus..."                                    │
│  "Tecendo o Dossiê Cabalístico..."                          │
│                         ▓▓▓▓▓▓▓▓░░  18/36 casas            │
└──────────────────────────────────────────────────────────────┘
```

**Layout do dossiê (após geração — dois painéis):**
```
┌────────────────────────────────────────────────────────────────────┐
│  [← Voltar à Mesa]          DOSSIÊ CABALÍSTICO         [📄 PDF]    │
│  Nome: Maria Silva  |  Data: 01/06/2026  |  36 casas analisadas    │
├──────────────────────────────┬─────────────────────────────────────┤
│  ÍNDICE (sticky)             │  CONTEÚDO                           │
│                              │                                      │
│  ▸ Resumo dos Mapas Natais  │  ## Casa 1 — O Cavaleiro             │
│  ▸ Casa 1 — O Cavaleiro     │  *Carta: A Torre (19) | Odu: Osá*    │
│  ▸ Casa 2 — O Trevo         │                                      │
│  ▸ Casa 3 — O Navio         │  [Texto interpretativo gerado        │
│  ...                         │   pela IA, renderizado em           │
│  ▸ Síntese Final             │   Markdown com tipografia           │
│    ├ Trabalho & Dinheiro     │   elegante (Lora, serif)]           │
│    ├ Lar & Família           │                                      │
│    ├ Amor & Relacionamentos  │  ---                                 │
│    └ Conselho Espiritual     │                                      │
│                              │  ## Casa 4 — A Casa                 │
│                              │  ...                                 │
└──────────────────────────────┴─────────────────────────────────────┘
```

**Estilo do conteúdo do dossiê:**
```css
.dossier-content {
  font-family: 'Lora', serif;
  font-size: 15px;
  line-height: 1.8;
  color: #e2e8f0; /* slate-200 */
  max-width: 720px;
}

.dossier-content h2 {
  font-family: 'Cinzel', serif;
  color: #F97316; /* accent-orange */
  font-size: 18px;
  border-bottom: 1px solid #2A3550;
  padding-bottom: 8px;
  margin-top: 36px;
}

.dossier-content em {
  color: #3B5BDB; /* accent-royal-bright */
  font-style: normal;
  font-size: 12px;
}
```

---

## 6. Tela: Cadastro de Consulentes

**Formulário (`/dashboard/clientes/novo`):**
- Dividido em dois grupos lógicos com separação visual:

**Grupo 1 — Identificação:**
- Nome Completo (campo de texto longo, full width)
- Data de Nascimento (date picker)
- Hora de Nascimento (time picker, HH:MM)

**Grupo 2 — Local de Nascimento:**
- Cidade (Combobox com autocomplete via Google Places)
- Estado/Região (auto-preenchido após selecionar cidade)
- País (auto-preenchido após selecionar cidade)

**Grupo 3 — Anotações (opcional):**
- Textarea livre para observações do terapeuta

Após salvar: indicador de progresso animado enquanto os mapas são calculados ("Calculando mapa astral...", "Processando numerologias..."), depois redireciona para o perfil do cliente.

---

## 7. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `xl` (1280px+) | Layout completo: sidebar fixa + grid 9×4 + painel de mapas |
| `lg` (1024px) | Painel de mapas colapsa para badge compacto clicável |
| `md` (768px — iPad) | Sidebar vira drawer hamburguer. Grid 9×4 mantido com fonte menor |
| `sm` (640px) | Grid vira lista accordion de 36 itens. Botão "Gerar Dossiê" fixo no bottom |

---

## 8. Micro-interações e Animações

- **Slot preenchido:** animação de `scale(1.02)` + glow pulse de 0.3s ao confirmar.
- **Botão "Gerar Dossiê":** pulsa suavemente em **laranja** quando todas as casas estão preenchidas.
- **Transição de estado vazio → preenchido:** fade + slide-up da carta e Odu no slot.
- **Loading do Dossiê:** animação orbital de partículas ao redor do símbolo do projeto.
- **Streaming do texto:** o Markdown aparece token a token (efeito máquina de escrever) via SSE/streaming da API.

---

## 9. Tela: Consultar o Oráculo (Q&A) — *Fase 2 (Doc 12)*

Acessível a partir de um dossiê gerado (`/dashboard/leituras/[id]`), como aba ou painel lateral "Consultar o Oráculo". Permite **perguntas abertas** ancoradas exclusivamente na leitura (Doc 12).

```
┌────────────────────────────────────────────────────────────────────┐
│  CONSULTAR O ORÁCULO — Maria Silva · Leitura de 01/06/2026         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                          ┌─────────────────────────────────────┐  │
│                          │ E quanto à minha vida amorosa?       │  │  ← bolha do usuário
│                          └─────────────────────────────────────┘  │     (laranja, à direita)
│                                                                    │
│  ┌──────────────────────────────────────────────┐                 │
│  │ O seu Coração (Casa 24) revela...             │  ← bolha do     │
│  │ ...                                            │     Oráculo     │
│  │ *Síntese: o amor pede coragem, não pressa.*    │  (royal, à esq) │
│  │  ── consultadas: [Casa 24] [Casa 22]           │  ← chips royal  │
│  └──────────────────────────────────────────────┘                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  [ Pergunte ao Oráculo...                          ]  [ Enviar → ] │  ← input fixo
└────────────────────────────────────────────────────────────────────┘
```

**Especificação visual:**
- Bolha do usuário: `bg-orange-500/15 border-orange-500/30`, alinhada à direita.
- Bolha do Oráculo: `bg-[#2547D0]/12 border-[#3B5BDB]/30`, alinhada à esquerda, tipografia `Lora`.
- Linha-síntese em itálico dentro da resposta: `text-[#3B5BDB]` (royal-bright).
- **Chips de transparência do roteamento:** abaixo de cada resposta, chips royal discretos mostrando as casas consultadas (ex.: "Casa 24 · Casa 22") — derivados de `routedHouses` (Doc 12 §3).
- Botão "Enviar": laranja (`bg-orange-500 hover:bg-orange-400`).
- Streaming token a token, igual ao dossiê.
- Estado vazio: "Faça uma pergunta sobre esta leitura. O Oráculo responde a partir do que foi tirado para você."
