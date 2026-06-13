# coordination/w2/changelog-pending.md

## Entradas pendentes de changelog

### Ciclo 2 (2026-06-12)
- **feat(w2): AkashaSignificadoCard no dashboard principal** — substituído `LifePathInsightCard` (compacto) pelo `AkashaSignificadoCard` completo na página `/dashboard`. Usuário agora vê interpretação profunda com seletor de nível (shadow/gift/siddhi) e seletor de área de vida (Propósito, Carreira, Finanças, Saúde, Relacionamentos) diretamente no dashboard, sem precisar navegar para `/mapa/significado`.
- **fix(w2): HTML entities e Next.js Link** — `&ldquo;`/`&rdquo;` corrigidos em `AkashaLifeAreasDashboard.tsx` (5 instâncias) e `MandalaNarrative.tsx` (1 instância); `<a>` convertidos para `<Link>` em `mandala/page.tsx`; `Route` import não-utilizado removido.
