# DevOps - Cabala dos Caminhos

## Infraestrutura Atual

### Stack de Deploy
| Componente | Tecnologia | Status |
|-----------|------------|--------|
| Runtime | Next.js 16.2.6 | ✅ Ativo |
| Hospedagem | Vercel | ✅ Configurado |
| Database | PostgreSQL (Prisma) | ✅ Configurado |
| Auth | Supabase SSR + JWT | ✅ Implementado |
| Payments | Stripe | ✅ Integrado |

### Configurações de Build
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Scripts Disponíveis
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint validation |
| `npm run test` | Vitest (watch mode) |
| `npm run test:run` | Vitest (single run) |

---

## Recomendações de Deploy

### 1. Variáveis de Ambiente Necessárias

```bash
# ============================================
# DATABASE - PostgreSQL
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/cabala?schema=public

# ============================================
# AUTHENTICATION - JWT
# ============================================
JWT_SECRET=your-256-bit-secret-key-minimum-32-characters

# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# STRIPE
# ============================================
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# OPENAI (Opcional)
# ============================================
OPENAI_API_KEY=sk-...

# ============================================
# REDIS (Opcional - para Rate Limiting distribuído)
# ============================================
REDIS_URL=redis://user:password@host:6379
```

### 2. Configurações Vercel Recomendadas

```json
{
  "regions": ["gru1", "iad1"],
  "functions": {
    "memory": 1024,
    "timeout": 10
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### 3. Prisma Deploy
```bash
# Em produção, usar:
npm run db:push    # Para schema changes
npm run db:migrate # Para migrations controladas
```

---

## Checklist de Segurança

### ✅ Implementado

| Item | Status | Arquivo |
|------|--------|---------|
| Security Headers (CSP, HSTS, etc) | ✅ | `next.config.ts` |
| XSS Protection | ✅ | `next.config.ts` |
| Content Type Sniffing Protection | ✅ | `next.config.ts` |
| Frame Options (Clickjacking) | ✅ | `next.config.ts` |
| Rate Limiting (In-Memory) | ✅ | `middleware.ts` |
| Rate Limit Headers | ✅ | `middleware.ts` |
| Request ID Tracing | ✅ | `middleware.ts` |
| Security Headers Middleware | ✅ | `middleware.ts` |
| Error Codes Estruturados | ✅ | `src/lib/error-handling.ts` |
| Structured Logging | ✅ | `src/lib/logging.ts` |

### ⚠️ Requer Atenção

| Item | Prioridade | Recomendação |
|------|------------|--------------|
| Rate Limiting Distribuído | Alta | Migrar para Redis em produção |
| CORS Configuration | Alta | Definir origens explícitas |
| API Key Rotation | Média | Implementar rotação automática |
| Secrets Scanning | Média | Adicionar gitleaks ao CI |
| Dependency Scanning | Média | Adicionar npm audit ao CI |
| DDoS Protection | Alta | Usar Vercel Firewall |

### 🔒 Checklist de Produção

- [ ] `NEXT_PUBLIC_` prefix para variáveis expostas ao cliente
- [ ] `JWT_SECRET` com pelo menos 32 caracteres
- [ ] `STRIPE_WEBHOOK_SECRET` configurado
- [ ] Rate limiting com Redis para ambiente distribuído
- [ ] CORS configurado com origens específicas
- [ ] `NODE_ENV=production`
- [ ] Logs de erro envio para observabilidade (Datadog, Sentry)
- [ ] Backup automático do banco de dados
- [ ] SSL/TLS forçado em todas as conexões

---

## Checklist de Monitorização

### Métricas Recomendadas

| Categoria | Métrica | Ferramenta Sugerida |
|-----------|---------|---------------------|
| APM | Latência p95/p99 | Vercel Analytics, Datadog |
| Errors | Taxa de erros 5xx | Sentry |
| Uptime | Disponibilidade 99.9% | Pingdom |
| Database | Query latency, connections | Vercel Postgres Dashboard |
| External | API latency (OpenAI, Stripe) | Custom metrics |
| Business | Conversão, churn | Stripe Dashboard |

### Logging Estruturado (Já Implementado)

```typescript
// src/lib/logging.ts - Logger singleton com:
- Log levels: DEBUG, INFO, WARN, ERROR, FATAL
- Performance metrics
- Request tracing (requestId)
- Structured context
```

### Alertas Recomendados

| Alerta | Threshold | Ação |
|--------|-----------|------|
| Error Rate | > 1% em 5min | PagerDuty/Slack |
| Latency | p95 > 2s | Slack |
| Database Connections | > 80% max | Slack |
| Rate Limit Hits | > 100/min | Monitorar abuse |

---

## Otimizações Implementadas

### 1. Middleware (`middleware.ts`)

**Adicionado:**
- ✅ Rate limiting integrado (100 req/min por IP)
- ✅ Headers de segurança (`X-Request-Id`, `X-Frame-Options`, etc)
- ✅ Headers de rate limit (`X-RateLimit-*`)
- ✅ Request tracing para debugging
- ✅ Exclusão de paths estáticos

### 2. Next.js Config (`next.config.ts`)

**Adicionado:**
- ✅ `compress: true` - gzip/brotli compression
- ✅ `poweredByHeader: false` - Remove header disclosing tecnologia
- ✅ Image optimization com AVIF/WebP e cache TTL de 30 dias
- ✅ Cache headers para assets estáticos
- ✅ Webpack chunk splitting otimizado
- ✅ On-demand entries configuration

---

## CI/CD

### GitHub Actions (Recomendado)

```yaml
name: Build & Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## Backup e Disaster Recovery

### Database Backups

```bash
# Backup manual
pg_dump -h $DB_HOST -U $DB_USER -d cabala > backup_$(date +%Y%m%d).sql

# Backup automático (Vercel Postgres)
# Vercel faz backups automáticos diários
```

### Recovery Plan

1. **Incidente**: Database corrompido
2. **RTO**: 4 horas
3. **RPO**: 24 horas (último backup)
4. **Procedimento**: Restaurar via `psql` ou dashboard Vercel

---

## Performance Targets

| Métrica | Target | Current |
|---------|--------|---------|
| LCP | < 2.5s | Monitorar |
| FID | < 100ms | Monitorar |
| CLS | < 0.1 | Monitorar |
| TTFB | < 200ms | Monitorar |
| Build Time | < 3min | Meta |

---

## Contato e Emergência

| Função | Responsável |
|--------|-------------|
| DevOps | Equipe de Engenharia |
| On-Call | A definir |
| Escalação | A definir |
