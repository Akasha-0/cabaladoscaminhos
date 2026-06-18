# Route Consolidation Plan — Akasha Portal
**Autor:** Akasha Loop Team
**Data:** 2026-06-18
**Versão:** 0.92.0

---

## Inventário Completo de Rotas

### Rotas de Página (`/app/[locale]/(akasha)/`)

| Rota | Página | Props | Prioridade |
|---|---|---|---|
| `/akasha` | Main chart (perfil completo) | Auth | ⭐ Essencial |
| `/dashboard` | Dashboard do usuário | Auth | ⭐ Essencial |
| `/diario` | Diário espiritual | Auth | Alta |
| `/diario/foco` | Foco do dia | Auth | **Baixa** — pode ser tab em `/diario` |
| `/conexoes` | Conexões amorosas | Auth | Alta |
| `/mandala` | Mandala pessoal | Auth | Média |
| `/manifesto` | Manifesto gerado | Auth | Média |
| `/mapa/significado` | Significado do mapa | Auth | **Baixa** — pode ser tab em `/akasha` |
| `/meu-dia` | Previsão diária | Auth | Alta |
| `/minha-caixa` | Caixa pessoal | Auth | **Baixa** — pode ser tab em `/dashboard` |
| `/oraculo` | Oráculo I Ching | Auth | Média |
| `/significado-primeiro` | Primeiro significado | Auth | **Baixa** — redundante com `/mapa/significado` |
| `/glossario` | Glossário | Auth | Baixa |
| `/conta` | Conta do usuário | Auth | Alta |
| `/onboarding` | Onboarding | No-auth | Essencial (SSR) |
| `/sobre` | Sobre o sistema | No-auth | Baixa |
| `/login` | Login | No-auth | Essencial (SSR) |
| `/compartilhar/receber` | Compartilhar mapa | Auth | Média |

### API Routes (não são páginas — manter)

---

## 5 Propostas de Consolidação

### PROPOSTA 1 — `/diario` + `/diario/foco` → Uma página com tabs
**Problema:** Duas páginas para o mesmo fluxo (diário espiritual). O foco do dia é um tab dentro do diário.

**Solução:**
- `/diario/foco` vira `/diario?tab=foco`
- Componente de tabs no topo da página `/diario`
- Mantém `/diario/foco` como rota legado (redirect 308 → `/diario?tab=foco`)

**Melhoria UX:** Reduz navegação, usuário não precisa escolher entre duas páginas parecidas.

---

### PROPOSTA 2 — `/mapa/significado` + `/significado-primeiro` → Aba em `/akasha`
**Problema:** Estas são views do mesmo recurso (o mapa Akasha). O significado já está na página principal `/akasha` — estas são redundantes.

**Solução:**
- Analisar: `/mapa/significado` mostra o que? Se for só significado textual do Odu/Caminho, integrar como aba "Significado" em `/akasha`
- `/significado-primeiro` parece ser дублирующий — remover
- Se necessário, manter como rota com `redirect` para `/akasha?tab=significado`

**Melhoria UX:** Elimina navegação redundante. O mapa principal já contém o significado.

---

### PROPOSTA 3 — `/meu-dia` + `/minha-caixa` → Abas em `/dashboard`
**Problema:** `/meu-dia` (previsão diária) e `/minha-caixa` (itens guardados) são funcionalidades relacionadas ao dashboard mas em páginas separadas.

**Solução:**
- `/meu-dia` vira `/dashboard?tab=meu-dia`
- `/minha-caixa` vira `/dashboard?tab=minha-caixa`
- Dashboard usa tabs para alternar entre visão geral, meu-dia, minha-caixa

**Melhoria UX:** Centraliza tudo relacionado ao dia a dia do usuário em um lugar.

---

### PROPOSTA 4 — 3 sistemas separados (Odu + Cabala + Astrologia) → Card Unificado no Perfil
**Problema Central (reportado pelo usuário):** O sistema mostra 3 informações separadas:
- "Odu: Oxé" (separado)
- "Caminho de Vida: 11" (separado)
- "Sol: Escorpião" (separado)

Isto fragmenta a experiência e contradiz o princípio de sistema unificado.

**Solução — Card de Síntese Unificada:**
Criar um componente `<AkashaSynthesisCard>` na página `/akasha` que mostra:

```
┌─────────────────────────────────────────────┐
│  🜄 Seu Tipo Espiritual: O Alquimista        │
│                                             │
│  Odu: Oxé-5  │  Caminho: 11  │  Sol: ♏    │
│  (Feitiço)    │  (Mestre)     │  (Escorp)  │
│                                             │
│  Síntese: Você é um transformador nato.     │
│  Sua energia de transmutação (Oxé) alinhada  │
│  ao caminho 11 potencializa sua capacidade   │
│  de autoprodução espiritual.                 │
└─────────────────────────────────────────────┘
```

**Arquivos a criar:**
- `components/akasha/AkashaSynthesisCard.tsx`
- `hooks/useAkashaSynthesis.ts` (deriva síntese dos 3 dados)

**Melhoria UX:** Elimina o problema de 3 sistemas visuais. Unifica a linguagem.

---

### PROPOSTA 5 — `/oraculo` + `/mandala` → Abas em `/akasha` ou `/dashboard`
**Problema:** Oráculo I Ching e Mandala são ferramentas de prática espiritual. Atualmente páginas separadas.

**Solução:**
- Para usuários logados: `/dashboard?tab=oraculo` e `/dashboard?tab=mandala`
- Para não-logados: `/oraculo` e `/mandala` permanecem
- Ou criar rota `/praticas` com tabs

**Melhoria UX:** Agrupa ferramentas de prática em um lugar.

---

## Resumo de Alterações

| Ação | Rota | Destino | Tipo |
|---|---|---|---|
| Merge | `/diario/foco` | `/diario?tab=foco` | Redirect 308 |
| Merge | `/significado-primeiro` | `/akasha?tab=significado` | Redirect 308 |
| Merge | `/meu-dia` | `/dashboard?tab=meu-dia` | Redirect 308 |
| Merge | `/minha-caixa` | `/dashboard?tab=minha-caixa` | Redirect 308 |
| Novo | — | `<AkashaSynthesisCard>` | Componente novo |
| Tab | `/mapa/significado` | `/akasha?tab=significado` | Funcionalidade |

---

## Prioridade de Implementação

1. **⭐⭐⭐ AkashaSynthesisCard** — resolve queixa central do usuário (3 sistemas separados)
2. **⭐⭐ Diálogo + tabs** — consolida `/diario/foco` em `/diario`
3. **⭐ Dashboard tabs** — consolida `/meu-dia` e `/minha-caixa`
4. **⭐ Redirects** — `/significado-primeiro` → `/akasha?tab=significado`
5. **⭐ `/oraculo` como tab** — consolidar com `/mandala`

---

## Notas de Implementação

- Todos os redirects usar HTTP 308 (Permanent Redirect) para preservar SEO
- Componentes de tab devem ser acessíveis (ARIA tabs, keyboard navigation)
- O `AkashaSynthesisCard` deve derivar a síntese automaticamente dos dados existentes — não exige mudança na API
- Verificar se `/mapa/significado` tem alguma funcionalidade única antes de consolidar
