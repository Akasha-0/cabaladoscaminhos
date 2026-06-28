# FEATURE FLAGS — Wave 20 (GTM Readiness 3/6)

> **Data:** 2026-06-28
> **Escopo:** Sistema de feature flags + A/B testing para o Akasha Portal.
> **Tipo:** Infrastructure — habilita rollout seguro de todas as features
> das próximas ondas (Wave 19 onboard redesign, Wave 22 marketplace, etc).

---

## TL;DR

| Antes | Depois |
|---|---|
| Sem flags — código entra direto em prod | 10 flags registradas com rollout controlado |
| Sem A/B testing — decisions por intuição | `assignVariant` determinístico + tracking |
| Admin sem UI — toggle via redeploy | `/admin/flags` mobile-first com toggles + whitelist |
| Sem histórico — "quem ligou isso?" | Audit trail (updatedBy + updatedAt) em `/data/flags.json` |

---

## 1. As 10 flags iniciais

| Key | Tipo | Rollout | Expira | Dono | Por quê |
|---|---|---|---|---|---|
| `onboarding-redesign-v2` | percentage | 5% | 2026-09-30 | PM | A/B test do novo onboard (Wave 19) |
| `akashic-voice-mode` | percentage | 10% | 2026-09-30 | PM | TTS na leitura akáshica |
| `mentorship-public-list` | boolean | 100% | — | PM | Lista pública de mentores |
| `marketplace-affiliate-tracker` | boolean | 100% | — | PM | Tracking de afiliados (LGPD opt-in) |
| `newsletter-digest-auto` | percentage | 5% | 2026-10-31 | PM | Digest semanal automático |
| `pwa-install-prompt` | boolean | 100% | — | Coder | Install prompt PWA |
| `feed-para-voce-v2` | percentage | 25% | 2026-09-15 | Coder | Algoritmo de feed personalizado v2 |
| `comments-reactions-emojis` | boolean | 100% | — | Coder | Reações rápidas (🔥🙏✨💜🌙) |
| `akashic-multitradition` | percentage | 50% | 2026-10-15 | PM | Cabala + Ifá + Tantra na mesma leitura |
| `streaming-sse-always` | boolean | 100% | — | Coder | SSE sempre ativo (notif + chat) |

**Regra de higiene:** toda flag percentage tem `expiresAt`. Quando chega a data,
abrir issue de revisão: ou vira boolean (GA), ou remove (morto).

---

## 2. Como usar (client-side)

```tsx
'use client';
import { useFlag } from '@/hooks/use-flag';

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading } = useFlag('onboarding-redesign-v2');

  if (loading) return <Skeleton />;
  return enabled ? <OnboardingV2 /> : <OnboardingLegacy />;
}
```

**Com provider (cache compartilhado, recomendado para apps grandes):**

```tsx
// app/layout.tsx
import { FlagsProvider } from '@/hooks/use-flag';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FlagsProvider>{children}</FlagsProvider>
      </body>
    </html>
  );
}
```

## 3. Como usar (server-side)

```tsx
// app/onboarding/page.tsx
import { isFlagEnabled } from '@/lib/feature-flags';
import { getCurrentUser } from '@/lib/auth';

export default async function Page() {
  const user = await getCurrentUser();
  const showV2 = await isFlagEnabled('onboarding-redesign-v2', user?.id);
  return showV2 ? <OnboardingV2 /> : <OnboardingLegacy />;
}
```

---

## 4. A/B testing workflow

```tsx
// 1. Definir variantes no código
import { assignVariant, trackExposure, trackConversion } from '@/lib/feature-flags/experiments';

const variants = [
  { name: 'control', weight: 50 },
  { name: 'redesign', weight: 50 },
];

// 2. Atribuir (client ou server)
const assignment = assignVariant(userId, 'onboarding-test', variants);

// 3. Logar exposição quando renderizar
useEffect(() => { trackExposure(userId, assignment); }, []);

// 4. Logar conversão quando completar objetivo
function onSignupComplete() {
  trackConversion(userId, 'onboarding-test', 'signup_completed');
  // ...signup normal
}

// 5. Renderizar variante
return assignment.variant === 'redesign' ? <OnboardingV2 /> : <OnboardingLegacy />;
```

**Server-side (hydration-safe):**

```ts
// POST /api/experiments/onboarding-test/assign
// Body: { userId, variants: [...] }
// Returns: { experiment, variant, hash, percentile }
const res = await fetch('/api/experiments/onboarding-test/assign', {
  method: 'POST',
  body: JSON.stringify({ userId, variants }),
});
```

---

## 5. Criando uma flag nova

1. **Abrir issue** com a hipótese ("se X, esperamos Y").
2. **Adicionar ao registry** em `src/lib/feature-flags/flags.ts`:
   ```ts
   'minha-flag-nova': {
     key: 'minha-flag-nova',
     type: 'percentage',
     defaultValue: false,
     rolloutPercent: 1, // começa com 1% (canário)
     description: 'Hipótese X — métrica Y esperada',
     owner: 'pm',
     expiresAt: '2026-12-31', // força revisão
   },
   ```
3. **Usar no código** via `useFlag` ou `isFlagEnabled`.
4. **Monitorar** no `/admin/flags` — aumentar % gradualmente (1→5→25→100).
5. **Cleanup** ao chegar GA: trocar type para 'boolean' e remover `expiresAt`.

---

## 6. Admin UI — `/admin/flags`

Mobile-first, com 3 ações por flag:

- **ON / OFF / Default** — toggle de override
- **Rollout %** — slider (0-100), atualiza ao soltar
- **Whitelist** — adicionar/remover userIds específicos

Acessível em dev/staging. **Em produção está bloqueado** (gate via
`NODE_ENV === 'production'`) até integrarmos auth admin real (Wave 23).

---

## 7. API endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/flags` | público (por user) | Lista todas flags resolvidas para o user |
| `PATCH` | `/api/flags/[name]` | admin (dev) | Toggle / rollout / whitelist |
| `POST` | `/api/experiments/[name]/assign` | público | Atribui variante a userId |

**Exemplo PATCH:**
```bash
curl -X PATCH http://localhost:3000/api/flags/onboarding-redesign-v2 \
  -H 'content-type: application/json' \
  -d '{"enabled": true, "rolloutPercent": 10}'
```

---

## 8. Storage — `/data/flags.json`

JSON file persistido em runtime. Formato:

```json
{
  "onboarding-redesign-v2": {
    "enabled": null,
    "rolloutPercent": 5,
    "whitelist": ["user-abc-123"],
    "updatedAt": "2026-06-28T10:30:00Z",
    "updatedBy": "admin"
  }
}
```

- `enabled: null` → usa defaultValue do registry
- `enabled: true/false` → override absoluto
- `whitelist` → bypass do rollout (sempre vê)
- Write atômico (tmp + rename) — não corrompe em crash

**Migrar para PostHog/LaunchDarkly depois?** Trocar storage.ts pelo client
PostHog; API pública (`getFlag`, `isFlagEnabled`) não muda.

---

## 9. Garantias

- ✅ **Determinístico:** mesmo userId + mesma flag = mesmo resultado (FNV-1a hash)
- ✅ **Cross-device:** funciona com anonymousId
- ✅ **Fail-safe:** erro de I/O → `defaultValue` (nunca crasha)
- ✅ **Auditável:** toda mutação registra `updatedBy` + `updatedAt`
- ✅ **SSR-safe:** hooks retornam default no primeiro render, hidratam depois
- ✅ **Mobile-first:** admin UI com botões 44px+, layout em cards

---

## 10. Próximos passos (Wave 21+)

- [ ] Integrar com PostHog real (`@/lib/track`) — substituir console.log em `trackExposure`
- [ ] Auth admin (Wave 23) — remover gate `NODE_ENV === 'production'`
- [ ] Tabela `FlagExposure` no Prisma — métricas de exposição/conversão por variante
- [ ] CI check: falhar se flag `percentage` sem `expiresAt`
- [ ] Dashboard de resultados de experimentos (significância estatística)
