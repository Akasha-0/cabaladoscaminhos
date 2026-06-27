# Documento 05 — Especificação UI/UX

> ⚠️ **DEPRECATED** — Esta documentação se refere ao Akasha Portal **v1.0 (B2B Cockpit Oracular)**.
> A visão atual é **v3.0 (comunidade universalista + Akasha IA como consciousness translator)**.
> Veja: [VISION.md](../VISION.md) | [ARCHITECTURE.md](../ARCHITECTURE.md) | [README.md](../../README.md)
> Use esta versão apenas para referência histórica.

## Cabala dos Caminhos

> **Versão:** 1.0 | **Modo:** Dark Mode (único — sem modo claro)  
> **Alvo:** Desktop First (1280px+), adaptado para tablet

---

## 1. Design System

### 1.1 Paleta de Cores (CSS Variables)

```css
/* tailwind.config.ts — extend colors */
:root {
  /* Backgrounds */
  --bg-canvas:     #020817;  /* slate-950 — fundo principal */
  --bg-surface:    #0f172a;  /* slate-900 — cards e painéis */
  --bg-elevated:   #1e293b;  /* slate-800 — elementos elevados */
  --bg-border:     #334155;  /* slate-700 — bordas */

  /* Primária — Dourado/Âmbar (Sagrado, Luz, Oráculo) */
  --accent-gold:   #f59e0b;  /* amber-500 */
  --accent-gold-dim: #92400e; /* amber-800 — hover states */
  --accent-gold-glow: rgba(245, 158, 11, 0.15); /* glow effects */

  /* Secundária — Esmeralda (Odus, Natureza, Abertura) */
  --accent-emerald: #10b981;  /* emerald-500 */
  --accent-emerald-dim: #065f46;

  /* Alerta — Rosa (Atenção, Corte, Urgência) */
  --accent-rose:   #f43f5e;   /* rose-500 */

  /* Texto */
  --text-primary:  #f8fafc;   /* slate-50 */
  --text-secondary:#94a3b8;   /* slate-400 */
  --text-muted:    #475569;   /* slate-600 */
}
```

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
<div className="flex h-screen bg-[#020817] overflow-hidden">
  <Sidebar className="w-72 flex-shrink-0 border-r border-slate-800" />
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

**Estilos dos Badges:**
- `variant="astro"`: bg-blue-950 border-blue-700 text-blue-300
- `variant="kabala"`: bg-purple-950 border-purple-700 text-purple-300
- `variant="tantric"`: bg-amber-950 border-amber-700 text-amber-300
- `variant="odu"`: bg-emerald-950 border-emerald-700 text-emerald-300

---

### 4.3 O Grid da Mesa Real (Área Central)

**Container do Grid:**
```tsx
<div
  className="
    grid grid-cols-9 gap-2
    p-4 rounded-2xl
    bg-gradient-to-br from-slate-900/60 to-slate-950/80
    border border-slate-800
    shadow-[inset_0_0_60px_rgba(245,158,11,0.03)]
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
    bg-slate-900/50
    border border-dashed border-slate-700/60
    hover:border-amber-600/40 hover:bg-slate-800/60
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
    bg-gradient-to-b from-slate-800/70 to-slate-900/70
    border border-amber-600/40
    shadow-[0_0_12px_rgba(245,158,11,0.08)]
    hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]
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
  <span className="text-xs font-semibold text-amber-400 text-center px-2 leading-tight font-['Cinzel']">
    {slotData.cartaName}
  </span>

  {/* Odu tirado */}
  <span className="
    text-[10px] font-medium text-emerald-400
    bg-emerald-950/60 border border-emerald-800/40
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
    <p className="text-sm font-semibold text-amber-400 font-['Cinzel']">
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
      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
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
│  [Loader orbital animado em âmbar]                           │
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
  color: #f59e0b; /* amber-500 */
  font-size: 18px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 8px;
  margin-top: 36px;
}

.dossier-content em {
  color: #10b981; /* emerald-500 */
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
- **Botão "Gerar Dossiê":** pulsa suavemente em âmbar quando todas as casas estão preenchidas.
- **Transição de estado vazio → preenchido:** fade + slide-up da carta e Odu no slot.
- **Loading do Dossiê:** animação orbital de partículas ao redor do símbolo do projeto.
- **Streaming do texto:** o Markdown aparece token a token (efeito máquina de escrever) via SSE/streaming da API.
