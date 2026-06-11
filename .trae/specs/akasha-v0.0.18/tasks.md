# Akasha OS v0.0.18 — Tarefas

**Versão:** akasha-v0.0.18
**Data:** 2026-06-10
**Status:** Pronta para implementação

---

## Prioridade 1: LLM Providers (Crítico)

### 1.1 LLM Factory
- [ ] Criar `packages/mentor/src/llm/index.ts`
- [ ] Implementar `createProvider()` com detecção automática
- [ ] Implementar fallback: Ollama → OpenAI → Mock

### 1.2 OpenAI Provider
- [ ] Criar `packages/mentor/src/llm/openai.ts`
- [ ] Implementar `OpenAIProvider` com streaming
- [ ] Configurar `OPENAI_API_KEY` via `~/.akasha/.env`
- [ ] Implementar error handling

### 1.3 Ollama Provider
- [ ] Criar `packages/mentor/src/llm/ollama.ts`
- [ ] Implementar `OllamaProvider` com streaming
- [ ] Implementar `check()` para detectar se Ollama está rodando
- [ ] Configurar `OLLAMA_URL` (default: `http://localhost:11434`)

### 1.4 Mock Provider
- [ ] Criar `packages/mentor/src/llm/mock.ts`
- [ ] Implementar `MockProvider` com respostas simuladas
- [ ] Usar como fallback final

---

## Prioridade 2: MentorEngine Integration

### 2.1 Update MentorEngine
- [ ] Modificar `MentorEngine.ask()` para usar LLM Provider
- [ ] Implementar streaming com `AsyncIterable<string>`
- [ ] Integrar com intent detection

### 2.2 System Prompt Loader
- [ ] Criar `packages/mentor/src/context/system-prompt.ts`
- [ ] Carregar de `grimoire/mentor/system-prompt.md`
- [ ] Implementar fallback se arquivo não existir

### 2.3 Código do Dia
- [ ] Criar `packages/mentor/src/context/code-of-day.ts`
- [ ] Integrar com `@akasha/core`
- [ ] Calcular hexagrama do dia automaticamente

---

## Prioridade 3: TUI Streaming

### 3.1 Update TUI Output
- [ ] Modificar `packages/akasha-cli/src/tui/output.ts`
- [ ] Implementar renderização de stream token por token
- [ ] Adicionar indicador de typing/spinner durante streaming

### 3.2 Update Chat Command
- [ ] Modificar `packages/akasha-cli/src/commands/chat.ts`
- [ ] Integrar com `MentorEngine.chat()`
- [ ] Passar stream para TUI output

---

## Prioridade 4: Config Local

### 4.1 Config Module
- [ ] Criar `packages/akasha-cli/src/lib/config.ts`
- [ ] Ler `~/.akasha/.env`
- [ ] Criar diretório `~/.akasha/` se não existir
- [ ] Gerar `.env` padrão se não existir

### 4.2 Config Schema
- [ ] Definir `~/.akasha/config.json`
- [ ] Store: modelo preferido, temperatura, etc.

---

## Prioridade 5: Documentation & Testing

### 5.1 Documentation
- [ ] Atualizar `packages/mentor/AGENTS.md` se existir
- [ ] Documentar nova arquitetura LLM no README do package

### 5.2 Testing
- [ ] Testar com OpenAI API (se key disponível)
- [ ] Testar com Ollama local (se instalado)
- [ ] Testar fallback para Mock

---

## Ordem de Implementação

```
1. LLM Providers (1.1 → 1.4)
   ↓
2. MentorEngine Integration (2.1 → 2.3)
   ↓
3. TUI Streaming (3.1 → 3.2)
   ↓
4. Config Local (4.1 → 4.2)
   ↓
5. Documentation & Testing (5.1 → 5.2)
```

---

## Notas de Implementação

### LLM Streaming Pattern

```typescript
// Exemplo de streaming
async function* streamResponse(prompt: string): AsyncIterable<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content ?? '';
  }
}
```

### Ollama Streaming Pattern

```typescript
async function* streamOllama(prompt: string): AsyncIterable<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      const data = JSON.parse(line);
      if (data.message?.content) {
        yield data.message.content;
      }
    }
  }
}
```

### Config Loader

```typescript
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { loadDotenv } from './dotenv';

const AKASHA_DIR = join(os.homedir(), '.akasha');

export function ensureAkashaDir(): void {
  if (!existsSync(AKASHA_DIR)) {
    mkdirSync(AKASHA_DIR, { recursive: true });
    mkdirSync(join(AKASHA_DIR, 'data'), { recursive: true });
  }
}

export function loadAkashaConfig(): AkashaConfig {
  ensureAkashaDir();

  const envPath = join(AKASHA_DIR, '.env');
  if (existsSync(envPath)) {
    loadDotenv(envPath);
  }

  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    model: process.env.MODEL ?? 'llama3',
  };
}
```
