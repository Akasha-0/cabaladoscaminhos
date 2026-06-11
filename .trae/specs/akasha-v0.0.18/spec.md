# Akasha OS v0.0.18 — Especificação

**Data:** 2026-06-10
**Versão:** akasha-v0.0.18
**Status:** ⏳ Pronta para implementação
**Handoff:** Baseada em `/tmp/handoff-akasha-v0.0.18.md` + sessão grill-with-docs

---

## Decisões Tomadas

| # | Decisão | Opção | Alternativa |
|---|---------|-------|-------------|
| 1 | Arquitetura Mentor ↔ TUI | **A** — OpenAI real no MentorEngine | Mock placeholder |
| 2 | Persistência histórico | **B** — SQLite em `~/.akasha/data/` | PostgreSQL ou memória |
| 3 | Comunicação TUI → Mentor | **A** — Import direto `@akasha/mentor` | HTTP ou gRPC |
| 4 | Multi-usuário | **A** — Single-user `~/.akasha/config.json` | Multi-usuário |
| 5 | Escopo v0.0.18 | **A** — Focado (OpenAI + wiring) | Tarefas opcionais |
| 6 | Implementação LLM | **C** — Abstração OpenAI/Ollama | Apenas um provider |
| 7 | Streaming | **A** — Streaming real token por token | Resposta completa |
| 8 | System prompt | **A** — Usar `grimoire/mentor/system-prompt.md` | Nova versão |
| 9 | API Keys | **B** — `~/.akasha/.env` | .env root ou vars sistema |
| 10 | Estrutura dirs | **B** — `~/.akasha/` com `data/` | Estrutura simples |
| 11 | Mentor semântica | **B** — Roteador de intents | Assistente genérico ou agente completo |
| 12 | Fallback LLM | **C** — Detecção automática (Ollama→OpenAI→mock) | Erro ou graceful degradation |
| 13 | Glossário | Padronizado no CONTEXT.md | Termos ambíguos |
| 14 | akasha-core | **B** — Código do dia automático | Sem integração ou mapa natal |

---

## 1. Why — Propósito

Substituir respostas simuladas do MentorEngine por integração real com LLM (OpenAI/Ollama), enabling streaming de respostas no TUI e cálculo automático do Código do Dia.

**Visão:** Usuário digita `akasha` e tem conversa espiritual contextualizada com código do dia, streaming de respostas, e histórico persistente em SQLite.

---

## 2. What — Escopo

### 2.1 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        AKASHA CLI                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   TUI (blessed)          MentorEngine        LLM Providers     │
│   ┌──────────┐          ┌──────────┐        ┌──────────────┐   │
│   │  chat.ts │─────────→│  ask()   │───────→│   Ollama     │   │
│   │  output  │  stream  │ intent   │        │   (local)    │   │
│   └──────────┘  tokens  │ detect  │        └──────────────┘   │
│                          │          │        ┌──────────────┐   │
│                          │          │───────→│   OpenAI     │   │
│                          │          │        │   (API)      │   │
│                          └──────────┘        └──────────────┘   │
│                                                                 │
│   ~/.akasha/                     packages/mentor/               │
│   ├── .env                      ├── src/                        │
│   ├── config.json               │   ├── mentor.ts              │
│   └── data/                    │   ├── intent-detector.ts     │
│       └── chat.db              │   └── types.ts               │
│                               └── (system-prompt de grimoire/)  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Dados

```
1. Usuário digita mensagem no TUI
2. TUI envia para MentorEngine.chat()
3. MentorEngine.detectIntent() identifica tipo
4. Se intent=practice/ritual → calcula código do dia via @akasha/core
5. MentorEngine.ask() monta prompt com system-prompt + contexto
6. LLM Provider (Ollama/OpenAI) retorna stream
7. TUI renderiza tokens em tempo real
8. Resposta salva em SQLite (futuro)
```

### 2.3 Entregas

| # | Entrega | Descrição | Prioridade |
|---|---------|-----------|------------|
| 1 | MentorEngine.openAI() | Camada OpenAI real com streaming | 🔴 |
| 2 | MentorEngine.ollama() | Abstração Ollama com fallback | 🔴 |
| 3 | LLM Provider detection | Auto-detectar Ollama → OpenAI → mock | 🔴 |
| 4 | TUI streaming | Renderizar tokens em tempo real | 🔴 |
| 5 | Código do dia | Calcular via @akasha/core automaticamente | 🟡 |
| 6 | Config ~/.akasha/ | Criar estrutura de diretórios e .env | 🟡 |

---

## 3. NÃO está no escopo

- Histórico de chat persistente em SQLite (futuro v0.0.19)
- Autocomplete melhorado
- Histórico de comandos persistente
- Suporte emojis
- Cores mais vibrantes
- Comandos `/ritual`, `/mapa`
- Multi-usuário
- Integrações Telegram/WhatsApp

---

## 4. Impact — Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Respostas do chat | Placeholder simulado | Respostas reais via LLM |
| Experiência | Resposta completa | Streaming token por token |
| Contexto | Sem dados | Código do dia automático |
| Config | Nenhuma | `~/.akasha/.env` com API keys |

---

## 5. Critérios de Sucesso

- [ ] `MentorEngine.ask()` usa OpenAI API real
- [ ] `MentorEngine.ask()` usa Ollama local se OpenAI não disponível
- [ ] TUI exibe streaming de respostas
- [ ] Código do dia calculado automaticamente
- [ ] `~/.akasha/.env` lido corretamente
- [ ] Fallback para mock se nenhuma LLM disponível
- [ ] Typecheck passa
- [ ] Tests passam

---

## 6. Definições

| Termo | Definição |
|-------|-----------|
| **Mentor** | Roteador de intents (chat, ritual, practice) que delega para serviços existentes |
| **MentorEngine** | Motor de chat com abstração OpenAI/Ollama |
| **LLM Provider** | Abstração que permite trocar OpenAI por Ollama ou mock |
| **Código do Dia** | Hexagrama I Ching calculado para data atual via @akasha/core |
| **Streaming** | Resposta renderizada token por token em tempo real |

---

## 7. Notas Técnicas

### 7.1 Estrutura de Arquivos

```
packages/mentor/src/
├── mentor.ts               # [MODIFICAR] Implementar OpenAI/Ollama
├── intent-detector.ts     # [JÁ EXISTE] Detectar intents
├── types.ts               # [JÁ EXISTE] Tipos internos
├── llm/
│   ├── index.ts          # [NOVO] Factory de providers
│   ├── openai.ts        # [NOVO] OpenAI provider
│   ├── ollama.ts        # [NOVO] Ollama provider
│   └── mock.ts          # [NOVO] Mock provider fallback
└── context/
    ├── system-prompt.ts  # [NOVO] Carregar system-prompt.md
    └── code-of-day.ts    # [NOVO] Calcular código do dia

packages/akasha-cli/src/
├── commands/chat.ts      # [MODIFICAR] Usar streaming
├── tui/output.ts        # [MODIFICAR] Renderizar stream
└── lib/config.ts        # [MODIFICAR] Ler ~/.akasha/.env

~/.akasha/
├── .env                  # [NOVO] OPENAI_API_KEY, OLLAMA_URL
├── config.json           # [NOVO] Perfil single-user
└── data/                # [PREPARAR] Para SQLite futuro
```

### 7.2 Dependências

| Dependência | Uso | Status |
|-------------|-----|--------|
| openai | SDK OpenAI | 🆕 |
| ollama (npm) | SDK Ollama | 🆕 |
| @akasha/core | Código do dia | 📦 Existe |
| dotenv | Carregar .env | 🆕 |

### 7.3 API LLM

```typescript
// packages/mentor/src/llm/openai.ts
export class OpenAIProvider {
  constructor(apiKey: string);
  stream(prompt: string): AsyncIterable<string>;
}

// packages/mentor/src/llm/ollama.ts
export class OllamaProvider {
  constructor(baseUrl?: string);
  async check(): Promise<boolean>;
  stream(prompt: string): AsyncIterable<string>;
}

// packages/mentor/src/llm/index.ts
export type LLMProvider = {
  stream(prompt: string): AsyncIterable<string>;
};

export function createProvider(config: LLMConfig): LLMProvider {
  // 1. Tenta Ollama
  // 2. Tenta OpenAI
  // 3. Fallback para Mock
}
```

### 7.4 System Prompt

O system prompt é carregado de `grimoire/mentor/system-prompt.md`. Deve ser incluído no bundle ou lido via `fs.readFileSync`.

```typescript
// packages/mentor/src/context/system-prompt.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadSystemPrompt(): string {
  const paths = [
    resolve(process.cwd(), 'grimoire/mentor/system-prompt.md'),
    resolve(__dirname, '../../grimoire/mentor/system-prompt.md'),
  ];

  for (const path of paths) {
    try {
      return readFileSync(path, 'utf-8');
    } catch {
      // Tentar próximo path
    }
  }

  return 'Você é um mentor espiritual...'; // Fallback
}
```

---

## 8. Referências

| Recurso | Localização | Uso |
|---------|-------------|-----|
| SPEC v0.0.17 | `.trae/specs/akasha-v0.0.17/` | CLI base |
| Mentor Engine | `packages/mentor/src/mentor.ts` | Código existente |
| System Prompt | `grimoire/mentor/system-prompt.md` | Prompt base |
| Akasha Core | `packages/akasha-core/` | Código do dia |

---

## 9. Perguntas em Aberto

| # | Pergunta | Decisão Adiada Para |
|---|----------|---------------------|
| 1 | Persistir histórico em SQLite? | v0.0.19 |
| 2 | Multi-usuário? | v0.1.0 |
| 3 | Comandos `/ritual`, `/mapa`? | v0.0.19 |
