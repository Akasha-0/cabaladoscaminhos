# coordination/w2/changelog-pending.md

## Entradas pendentes de changelog

### Ciclo 2 (2026-06-12)
- **feat(w2): AkashaSignificadoCard no dashboard principal** — substituído `LifePathInsightCard` (compacto) pelo `AkashaSignificadoCard` completo na página `/dashboard` (commit `0e1ef333`). Usuário agora vê interpretação profunda com seletor de nível (shadow/gift/siddhi) e seletor de 5 áreas de vida diretamente no dashboard, sem navegar para `/mapa/significado`.
- **fix(w2): hygiene — HTML entities e Next.js Link** — `&ldquo;`/`&rdquo;` corrigidos em `AkashaLifeAreasDashboard.tsx` (5 instâncias), `MandalaNarrative.tsx` (1 instância), `mandala/page.tsx` (`<a>` → `<Link>`), `Route` import não-utilizado removido de `AkashaLifeAreasDashboard`.
