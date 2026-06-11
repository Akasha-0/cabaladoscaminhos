# Akasha OS v0.0.17 — Tarefas

**Versão:** akasha-v0.0.17
**Data:** 2026-06-10
**Status:** Pronta para implementação

---

## Dependências Externas

| Dependência | Instalação |
|-------------|------------|
| PostgreSQL | Via `akasha setup` |
| Node.js 18+ | Pré-requisito |
| pnpm | Pré-requisito |

---

## Ordem de Implementação

---

## Prioridade 1: Bug Fix Onboarding

### 1.1 Script Setup Bash
- [ ] Criar `scripts/akasha-setup.sh`
- [ ] Detectar sistema operacional (Linux/macOS)
- [ ] Instalar PostgreSQL se não existir
- [ ] Criar usuário `cabala` e banco `cabala_dos_caminhos`
- [ ] Gerar `.env.local` com `DATABASE_URL`
- [ ] Rodar migrations Prisma
- [ ] Verificar conexão
- [ ] Testar onboarding após setup

### 1.2 Atualizar package.json
- [ ] Adicionar bin `akasha` para scripts
- [ ] Configurar script `akasha-setup`

---

## Prioridade 2: CLI Chat TUI

### 2.1 Setup do Package
- [ ] Criar `packages/akasha-cli/`
- [ ] Configurar `package.json` com bin
- [ ] Instalar dependências (blessed, chalk)
- [ ] Configurar TypeScript

### 2.2 TUI Chat
- [ ] Criar `packages/akasha-cli/src/tui/chat.ts`
- [ ] Implementar layout do terminal
- [ ] Implementar input interativo
- [ ] Implementar output streaming
- [ ] Adicionar histórico de mensagens
- [ ] Adicionar slash commands autocomplete

### 2.3 Comandos CLI
- [ ] `akasha` → Chat interativo
- [ ] `akasha -q "pergunta"` → One-shot query
- [ ] `akasha --help` → Help

---

## Prioridade 3: CLI Setup

### 3.1 Comandos de Sistema
- [ ] `akasha setup` → Script de setup
- [ ] Integrar script bash no CLI
- [ ] Adicionar flags (--force, --skip-postgres)

---

## Prioridade 4: CLI Status

### 4.1 Verificação de Status
- [ ] Verificar PostgreSQL rodando
- [ ] Verificar conexão com banco
- [ ] Verificar variáveis de ambiente
- [ ] Exibir versão do sistema
- [ ] Exibir status de serviços

---

## Prioridade 5: CLI Diagnostico

### 5.1 Diagnóstico
- [ ] Verificar dependências instaladas
- [ ] Testar conexões (DB, Redis)
- [ ] Verificar migrations aplicadas
- [ ] Listar problemas encontrados
- [ ] Sugerir correções

---

## Prioridade 6: Documentação

### 6.1 Visão do Agente
- [x] Criar `docs/akasha-agent-vision.md`
- [ ] Documentar arquitetura
- [ ] Documentar roadmap de fases

---

## Notas de Implementação

### Estrutura do CLI

```
packages/akasha-cli/
├── bin/
│   └── akasha.js           # Entry point
├── src/
│   ├── index.ts            # Main exports
│   ├── cli.ts              # CLI parser
│   ├── commands/
│   │   ├── setup.ts        # akasha setup
│   │   ├── status.ts       # akasha status
│   │   ├── diagnostico.ts  # akasha diagnostico
│   │   └── chat.ts         # akasha (chat)
│   ├── tui/
│   │   ├── chat.ts         # TUI chat component
│   │   ├── input.ts        # Input handler
│   │   └── output.ts       # Output renderer
│   └── lib/
│       ├── postgres.ts      # PostgreSQL helpers
│       ├── config.ts        # Config helpers
│       └── color.ts         # Terminal colors
├── package.json
└── tsconfig.json
```

### Script Setup

```bash
#!/bin/bash
# akasha-setup.sh

# Detectar OS
detect_os() {
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "linux"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macos"
  else
    echo "unsupported"
  fi
}

# Instalar PostgreSQL (Linux)
install_postgres_linux() {
  sudo apt update
  sudo apt install -y postgresql postgresql-contrib
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
}

# Instalar PostgreSQL (macOS)
install_postgres_macos() {
  brew install postgresql@16
  brew services start postgresql@16
}

# Criar usuário e banco
create_database() {
  sudo -u postgres psql -c "CREATE USER cabala WITH PASSWORD 'cabala123';"
  sudo -u postgres psql -c "CREATE DATABASE cabala_dos_caminhos OWNER cabala;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cabala_dos_caminhos TO cabala;"
}

# Gerar .env.local
create_env() {
  cat > .env.local << EOF
DATABASE_URL="postgresql://cabala:cabala123@localhost:5432/cabala_dos_caminhos"
EOF
}

# Rodar migrations
run_migrations() {
  npx prisma migrate deploy
}
```
