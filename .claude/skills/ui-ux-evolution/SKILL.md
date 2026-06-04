# UI/UX Evolution — Evolução da Interface

> **Tipo:** Agente especialista em validação e evolução de UI/UX
> **Versão:** 1.0 | **Data:** 2026-06-04
> **Base:** Doc 13 (Identidade Ramiro v2), Doc 17 (Arquitetura da Mesa Real), Doc 05 (UI/UX — superseded)

## Quando Ativar

- Validação de interface
- Melhorias de UX propostas
- Verificar conformidade com identidade visual
- "validar UI", "avaliar UX", "checar interface", "verificar design"

## Entrada

```json
{
  "focus": "full|sidebar|cells|dossier|popover|badges",
  "target_components": ["CockpitSidebar", "HouseCell", "HouseInputPopover", "DossierViewer"]
}
```

## Tarefas

### 1. Validar Arquitetura da Mesa Real (Doc 17)

**AD-17.3: ZERO modais**
- Nenhum componente com `<Dialog>`, `<Modal>` ou similar?
- Apenas `<Popover>` ou `<Drawer>`?
- HouseInputPopover usa Popover (não Modal)?

**AD-17.5: 3 zonas**
```
┌────────────────────────────────────────────────────┐
│ A (Sidebar)  │ B (Cells)          │ C (Dossier)   │
│ - 4 natais   │ - Grid 9×4          │ - Gerar Dossiê│
│ - badges     │ - 36 casas          │ - Streaming   │
│ - contador   │ - popovers          │ - PDF export  │
└────────────────────────────────────────────────────┘
```
- CockpitSidebar presente?
- Grid de 36 HouseCell?
- DossierViewer no painel C?

**Grid 9×4:**
- 9 colunas × 4 linhas = 36 células?
- Cada célula tem estado (empty/filled/selected)?

### 2. Validar Paleta e Tipografia (Doc 13)

**Paleta Ramiro v2:**
```
Laranja:     #F97316 (tantric/accent)
Royal Blue:  #2547D0 (astro/cabala/odu)
Dark BG:     #0A0A0F ou similar (dark mode only)
Surface:     #1A1A2E ou similar
Text:        #F5F5F5
```

**Tipografia:**
- Cinzel → títulos de casas (majestoso)
- Cormorant → corpo do dossiê
- JetBrains Mono → números de casa, métricas
- Lora → anotações do operador

**BADGES:**
- `astro` / `kabala` / `odu` → royal (#2547D0)
- `tantric` → orange (#F97316)
- Badges visíveis no CockpitSidebar?

### 3. Validar Componentes

**CockpitSidebar:**
- 4 entradas natais (nome, data, hora, local)?
- Geolocalização funcional?
- Badges por tipo de mapa?
- Contador de cartas restantes (36 - preenchidas)?

**HouseCell:**
- Número da casa (1-36)?
- Nome da casa (O Cavaleiro, O Trevo...)?
- Estado visual (empty/filled/selected)?
- JetBrains Mono para número?
- Cinzel para nome?

**HouseInputPopover:**
- Combobox de cartas (apenas cartas não usadas)?
- Combobox de Odus (8 Odus)?
- Popover (não Modal)?
- Filtro funcional?

**DossierViewer:**
- Botão "Gerar Dossiê"?
- Streaming SSE visualizado?
- Tipografia Lora para texto?
- Botão PDF export?

### 4. Validar Estados e Interações

- Loading state durante geração?
- Error state se API falha?
- Empty state se sem leitura?
- Hover states nos botões?
- Keyboard navigation funcional?
- Focus states acessíveis?

### 5. Propor Melhorias de UX

```
1. Interações:
   - Drag & drop de cartas entre casas?
   - Auto-fill baseado em Odu selecionado?
   - Salvamento automático (debounced)?

2. Feedback visual:
   - Progress bar durante geração?
   - Toast notifications para erros?
   - Confirmação antes de действия destrutivos?

3. Acessibilidade:
   - ARIA labels em todos os controles?
   - Keyboard navigation completa?
   - Contraste WCAG AA?

4. Performance:
   - Virtualização do grid se lento?
   - Lazy loading do DossierViewer?
   - Optimistic UI updates?

5. Mobile (se aplicável):
   - Layout responsivo?
   - Sidebar colapsável?
```

## Gate de Validação

```
AD-17.3: ZERO modais (só popovers)?
AD-17.5: 3 zonas (Sidebar/Cells/Dossier)?
Paleta Ramiro: laranja (#F97316) + royal (#2547D0)?
Tipografia: Cinzel/Cormorant/JetBrains Mono/Lora?
Grid 9×4 cells (36 casas)?
Badges: royal para astro/kabala/odu, orange para tantric?
Sem modais — só popovers?
```

## Saída

```json
{
  "architecture": {
    "ad173_zero_modals": true,
    "ad175_three_zones": true,
    "grid_9x4": true
  },
  "palette": {
    "orange": "#F97316",
    "royal": "#2547D0",
    "dark_bg": "#0A0A0F",
    "compliant": true
  },
  "typography": {
    "cinzel": "titles",
    "cormorant": "body",
    "jetbrains_mono": "numbers",
    "lora": "notes",
    "compliant": true
  },
  "components": {
    "CockpitSidebar": { "present": true, "checks": 4 },
    "HouseCell": { "present": true, "states": ["empty", "filled", "selected"] },
    "HouseInputPopover": { "present": true, "type": "popover" },
    "DossierViewer": { "present": true, "streaming": true }
  },
  "badges": {
    "astro_kabala_odu": "#2547D0",
    "tantric": "#F97316",
    "compliant": true
  },
  "accessibility": {
    "aria_labels": "partial",
    "keyboard_nav": "partial",
    "contrast": "pass"
  },
  "proposed_improvements": [],
  "gates_passed": ["zero_modals", "three_zones", "grid_9x4", "palette", "typography", "badges"],
  "quality_score": 0.917
}
```

## Regras

1. **ZERO modais.** AD-17.3 é inviolável.
2. **Paleta Ramiro.** Não gold/violet/esmeralda.
3. **Tipografia canônica.** Cinzel/Cormorant/JetBrains/Lora.
4. **Mobile first NÃO.** Desktop-first (1280px+).
5. **Não propor telas novas.** Uma página, Doc 17.
