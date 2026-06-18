# @akasha/mentor

Agente mentor espiritual Akáshico — integra 4 tradições (Cabala, Ifá, Astrologia, Tantra) para autoconhecimento unificado.

## Instalação

```bash
pnpm add @akasha/mentor
```

## Uso

### CLI

```bash
# Login
pnpm login:mentor

# Chat interativo
pnpm chat:mentor
```

### Web

```typescript
import { MentorChat } from '@akasha/mentor/web';

<MentorChat userId="user-123" maps={userMaps} />
```

### API

```typescript
// POST /api/mentor/ask
const response = await fetch('/api/mentor/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Como posso melhorar meu trabalho em grupo?',
    userId: 'user-123',
    sessionHistory: [],
  }),
});

// Streaming response
for await (const chunk of response.body) {
  console.log(chunk);
}
```

## Arquitetura

```
┌─────────────────────────────────────┐
│  CLI (Ink)  │  Web (React)         │
└─────────────┴───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  packages/mentor                    │
│  ├── maps.ts         — 4 mapas      │
│  ├── correlation.ts   — correlações  │
│  ├── memory.ts        — persistência │
│  └── mentor.ts        — orquestrador │
└─────────────────────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  apps/akasha-portal                │
│  ├── llm-router.ts   — OpenAI/Ollama│
│  ├── rate-limit.ts  — 10 msg/min    │
│  ├── credits.ts     — 1 credit/msg   │
│  └── api/mentor/    — endpoints      │
└─────────────────────────────────────┘
```

## Mapas Suportados

| Tradição   | Função            | Status |
| ---------- | ----------------- | ------ |
| Cabala     | calculateLifePath | ✅     |
| Ifá        | getOduBirth       | ✅     |
| Astrologia | getBirthChart     | ✅     |
| Tantra     | getTantraBody     | ✅     |

## Configuração

### Variáveis de Ambiente

```env
OPENAI_API_KEY=sk-...
OLLAMA_URL=http://localhost:11434
REDIS_URL=redis://localhost:6379
```

### Rate Limiting

- **Limite:** 10 mensagens por minuto por usuário
- **Armazenamento:** Redis (fallback: memória)

### Créditos

- 1 crédito = 1 pergunta
- Verificação antes de processar
- Dedução após resposta completa

## Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -am 'feat: adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## License

MIT
