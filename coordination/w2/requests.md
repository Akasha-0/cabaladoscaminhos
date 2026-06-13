# coordination/w2/requests.md

## Pedidos de trabalho para outros domínios

| Data | Arquivo/Área | O que precisa | Por quê | Urgência |
|------|-------------|---------------|---------|----------|
| 2026-06-12 | synthesis-engine.ts | lifePath + kab consertados pelo integrador (commit 2213eb96) | — | RESOLVIDO |
| 2026-06-12 | capacitor.config.ts | Decidir offline APK architecture: (a) esvaziar server.url e servir assets locais (offline-ready), (b) manter server.url=Vercel e aceitar online-only | APK atual carrega de Vercel production via server.url — nao funciona offline. Offline capability precisa de architecture decision: se server.url for esvaziado, o APK usa assets locais do standalone build. Alternativa: manter online-only e marcar como producao-web-only. | P1 |