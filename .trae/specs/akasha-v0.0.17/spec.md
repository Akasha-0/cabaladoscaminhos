# Akasha OS v0.0.17 — Especificação

**Data:** 2026-06-10
**Versão:** akasha-v0.0.17
**Status:** ✅ Completa
**Handoff:** Baseada em `/tmp/handoff-akasha-v0.0.17.md` + `/tmp/handoff-akasha-v0.1.0-context.md`

---

## Decisões Tomadas

| Decisão | Opção Escolhida | Alternativa Considerada |
|---------|-----------------|------------------------|
| CLI Type | Chat interativo completo (TUI) | CLI baseada em prompts |
| Biblioteca TUI | blessed + blessed-contrib | ink, React-blessed |
| Estilo | Inspirado no Hermes Agent | CLI minimalista |
| Método Setup | Script bash automatizado | Docker compose |
| OS Support | Linux (apt) + macOS (brew) | Incluir Windows/WSL2 |
| LLM do Chat | Mentor existente (`packages/mentor/`) | Criar novo |
| Credenciais | Variáveis de ambiente (.env) | Secrets manager |

---

## Perguntas em Aberto

---

## 1. Why — Propósito

Corrigir o bug crítico do onboarding que impede novos usuários de se cadastrarem, e criar a base da CLI `akasha` para experiência "one-command" como Hermes Agent.

**Visão:** Usuário digita `akasha` no terminal e tem acesso a um agente espiritual interativo completo.

---

## 2. What — Escopo

### 2.1 Bug Fix: Onboarding

**Problema:** `Erro ao criar conta` ao tentar cadastrar.

**Causa:** PostgreSQL não está configurado no ambiente local de desenvolvimento.

**Solução:** Script `akasha setup` que instala e configura PostgreSQL automaticamente.

### 2.2 CLI Akasha — Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     AKASHA CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   $ akasha                    → Chat interativo (TUI)      │
│   $ akasha setup              → Setup PostgreSQL            │
│   $ akasha status             → Status do sistema           │
│   $ akasha diagnostico        → Verificar problemas         │
│                                                             │
│   Arquitetura inspirada no Hermes Agent:                     │
│   • TUI (Terminal User Interface)                           │
│   • Multiline input                                        │
│   • Slash commands autocomplete                             │
│   • Conversation history                                   │
│   • Streaming output                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Entregas

| # | Entrega | Descrição | Prioridade |
|---|---------|-----------|------------|
| 1 | Bug fix: Onboarding | PostgreSQL configurado via script | 🔴 |
| 2 | CLI Chat | `akasha` → Chat interativo TUI | 🔴 |
| 3 | CLI Setup | `akasha setup` → Instalação automática | 🔴 |
| 4 | CLI Status | `akasha status` → Status do sistema | 🟡 |
| 5 | CLI Diagnostico | `akasha diagnostico` → Verificação | 🟡 |
| 6 | Visão Agente | `docs/akasha-agent-vision.md` | 🟡 |

---

## 3. CLI Akasha — Comandos

### 3.1 Comando Principal

```bash
# Chat interativo (TUI)
akasha

# One-shot query
akasha -q "Qual é o ritual do dia?"

# Help
akasha --help
```

### 3.2 Comandos de Sistema

```bash
# Setup inicial
akasha setup

# Status do sistema
akasha status

# Diagnóstico
akasha diagnostico

# Versão
akasha version
```

### 3.3 Interface TUI

Inspirada no Hermes Agent:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚕ Akasha v0.0.17 │ 12.4K/200K │ [██████░░░░] 6% │ 15m │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  > Como posso te ajudar hoje?                              │
│                                                             │
│  Você: Qual é o ritual de hoje?                             │
│                                                             │
│  Akasha: Berdasarkan posisi bulan di Scorpio...             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  > Digite sua mensagem ou /help para comandos...            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Script Setup — akasha setup

### 4.1 Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    AKASHA SETUP                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Detectar Sistema Operacional                           │
│      ├── Linux → apt/yum/dnf                               │
│      ├── macOS → brew                                       │
│      └── Windows → WSL2 ou manual                          │
│                                                             │
│   2. Instalar PostgreSQL (se não existir)                   │
│      ├── Linux: sudo apt install postgresql postgresql-contrib│
│      └── macOS: brew install postgresql@16                  │
│                                                             │
│   3. Criar usuário e banco                                  │
│      ├── Usuário: cabala                                    │
│      └── Banco: cabala_dos_caminhos                         │
│                                                             │
│   4. Configurar DATABASE_URL                                │
│      └── Gravar em .env.local                               │
│                                                             │
│   5. Rodar migrations Prisma                                 │
│      └── npx prisma migrate deploy                          │
│                                                             │
│   6. Verificar conexão                                      │
│      └── Testar query simples                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Script de Setup

**Arquivo:** `scripts/akasha-setup.sh`

```bash
#!/bin/bash
# akasha-setup.sh — Setup automático do Akasha

set -e

echo "🔮 Akasha Setup — Configurando ambiente..."

# 1. Detectar OS
detect_os() { ... }

# 2. Instalar PostgreSQL
install_postgres() { ... }

# 3. Criar banco
create_database() { ... }

# 4. Gerar .env.local
create_env() { ... }

# 5. Rodar migrations
run_migrations() { ... }

# 6. Verificar
verify() { ... }

echo "✅ Akasha configurado com sucesso!"
echo "Execute 'akasha' para iniciar."
```

---

## 5. Bug Fix — Onboarding

### 5.1 Problema

```typescript
// apps/akasha-portal/src/app/api/akasha/auth/register/route.ts
const passwordHash = await bcrypt.hash(body.password, 12);
await prisma.user.create({ ... }); // ❌ Prisma tenta conectar em DATABASE_URL que não existe
```

### 5.2 Solução

1. Executar `akasha setup` antes de desenvolver
2. Script detecta se PostgreSQL já existe
3. Se existir, apenas verifica conexão

### 5.3 Fluxo Corrigido

```
Usuário executa:
  $ akasha setup
    → Detecta PostgreSQL
    → Se não existe: instala
    → Cria banco + usuário
    → Gera .env.local
    → Roda migrations
    → ✅ Pronto!

  $ akasha dev (ou pnpm dev)
    → Next.js conecta ao PostgreSQL
    → Onboarding funciona
```

---

## 6. NÃO está no escopo

- Integrações Telegram/WhatsApp
- Skills do agente (ritual, mapa, etc)
- Dashboard expandido
- Sistema unificado Akasha (documentado em `docs/akasha-agent-vision.md`)

---

## 7. Impact — Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Onboarding | ❌ Erro "Erro ao criar conta" | ✅ Funciona |
| CLI | Não existe | ✅ Chat interativo |
| Setup | Manual | ✅ `akasha setup` |
| DX | Múltiplos comandos | ✅ `akasha` único |

---

## 8. Critérios de Sucesso

- [ ] `akasha setup` instala PostgreSQL automaticamente
- [ ] Onboarding funciona após setup
- [ ] `akasha` abre chat interativo (TUI)
- [ ] `akasha status` mostra status do sistema
- [ ] `akasha diagnostico` identifica problemas
- [ ] `docs/akasha-agent-vision.md` criado
- [ ] Typecheck passa
- [ ] Tests passam

---

## 9. Definições

| Termo | Definição |
|-------|-----------|
| **TUI** | Terminal User Interface — interface visual no terminal |
| **Akasha CLI** | Interface de linha de comando do sistema |
| **Setup** | Script de configuração inicial do ambiente |
| **Akasha** | Campo cósmico de memória/energia (tradição indiana) |
| **Hermes Agent** | Referência: agente autônomo com TUI, skills, memory (NousResearch) |

---

## 10. Perguntas em Aberto

| # | Pergunta | Decisão Adiada Para |
|---|----------|---------------------|
| 1 | Windows Support (WSL2)? | v0.0.18+ |
| 2 | Credenciais API (OpenAI) no setup | v0.0.18+ |
| 3 | Skills do agente | v0.1.0+ |

---

## 11. Notas Técnicas

### 10.1 Estrutura de Arquivos

```
cabala-dos-caminhos/
├── scripts/
│   └── akasha-setup.sh              # Script de setup
├── packages/
│   └── akasha-cli/                  # [NOVO] CLI do Akasha
│       ├── src/
│       │   ├── index.ts             # Entry point
│       │   ├── commands/
│       │   │   ├── setup.ts
│       │   │   ├── status.ts
│       │   │   └── diagnostico.ts
│       │   └── tui/
│       │       ├── chat.ts          # TUI Chat
│       │       └── interface.ts     # Layout TUI
│       └── package.json
├── apps/
│   └── akasha-portal/
│       └── src/
│           └── app/
│               └── onboarding/
│                   └── page.tsx     # Bug fix testado
└── docs/
    └── akasha-agent-vision.md       # Visão de longo prazo
```

### 10.2 Dependências

| Dependência | Status | Observação |
|-------------|--------|------------|
| blessed | 🆕 | TUI library |
| blessed-contrib | 🆕 | Componentes TUI |
| chalk | 🆕 | Cores no terminal |

### 10.3 Script Setup — Requisitos

```bash
# Detectar PostgreSQL
command -v psql >/dev/null 2>&1

# Linux: checar serviço
systemctl status postgresql 2>/dev/null || service postgresql status 2>/dev/null

# macOS: checar brew
brew list postgresql@16 2>/dev/null
```

---

## 12. Referências

| Recurso | URL/Localização | Uso |
|---------|-----------------|-----|
| Hermes Agent | github.com/NousResearch/hermes-agent | Inspiração TUI |
| Hermesd Dashboard | github.com/mudrii/hermesd | Referência monitoramento |
| Sagelon | sagelon.com | Arquitetura convergence engine |
| Prisma Migrate | docs.prisma.io | Migrations database |

---

## 13. Arquivos de Handoff

| Handoff | Conteúdo |
|---------|----------|
| `/tmp/handoff-akasha-v0.0.17.md` | Bug fix + CLI decisions |
| `/tmp/handoff-akasha-v0.1.0-context.md` | Visão de longo prazo |
