# F-228 — Mobile Strategy Analysis

**Data:** 2026-06-15
**Versão:** akasha-v0.0.19
**Status:** ✅ Recomendação clara + próximos passos
**Base:** spec §F-228 + spec §3 (Decisão 7: PWA-first + Store listing)

---

## TL;DR — Recomendação

**Curto prazo (3-6 meses): PWA-first**
- Manter o Next.js 15 + Turbopack atual como fonte única
- Ativar manifest.json completo, service worker robusto, push notifications via web push
- Publicar na PWA Store (Google Play via Bubblewrap/TWA) — 1 APK assinado, sem reescrita
- Resultado: presença em iOS + Android com ~10% do esforço de um rewrite nativo

**Médio prazo (6-12 meses): AVALIAR React Native APENAS se:**
- Métricas de uso mobile >70% (atualmente não temos dados)
- Time dedicado a manter 2 codebases
- Necessidade de APIs nativas que PWA não cobre (HealthKit, NFC, contatos)

**Longo prazo: NÃO Expo** — limita o controle sobre módulos nativos críticos.

---

## Análise comparativa

### 1. PWA (Progressive Web App) — RECOMENDAÇÃO ATUAL

| Aspecto | Estado | Notas |
|---|---|---|
| **Esforço de migração** | ✅ Zero | Já é Next.js; só ativar PWA features |
| **Bundle único** | ✅ Sim | 1 codebase web → PWA |
| **iOS Safari** | ✅ Bom (limitações conhecidas) | Push só pós-iOS 16.4, sem background sync |
| **Android Chrome** | ✅ Excelente | Push, background sync, install prompt, share target |
| **Offline-first** | ✅ Service Worker | Roteamento já funciona |
| **Store listing** | ⚠️ Parcial | Google Play via TWA (Bubblewrap) — simples |
| **Apple App Store** | ❌ Não nativo | Workaround: PWA redirects são vetados pela Apple |
| **Bundle size** | ✅ ~150KB (gzipped) | Reuse Next.js tree-shaking |
| **Push notifications** | ✅ Web Push API | Suportado em Android e iOS 16.4+ |
| **Geolocation/Camera** | ✅ Web APIs | Suficiente para 90% do uso |
| **Dev velocity** | ✅ Alta | 1 plataforma, 1 build |
| **Manutenção** | ✅ Baixa | Sem dual codebases |

**Quando NÃO escolher PWA:**
- HealthKit / NFC / Bluetooth LE / Contacts API (iOS-only)
- App Store como CANAL de aquisição primário (Apple vetou PWAs em 2024)
- Performance 60fps em listas >10k items (use FlatList nativo)

---

### 2. React Native (sem Expo)

| Aspecto | Estado | Notas |
|---|---|---|
| **Esforço de migração** | ❌ Alto | Reescrever 70% da UI, manter 2 codebases |
| **Bundle único** | ❌ Não | Lógica de negócio compartilhada via packages, UI reescrita |
| **iOS Safari** | ✅ Nativo | iOS-first apps |
| **Android Chrome** | ✅ Nativo | Android-first apps |
| **Offline-first** | ✅ AsyncStorage + SQLite | Requer setup manual |
| **Store listing** | ✅ Nativo | Apple App Store + Google Play |
| **Bundle size** | ⚠️ ~5-10MB | Hermes engine |
| **Push notifications** | ✅ Nativo | FCM + APNs direto |
| **Geolocation/Camera** | ✅ Nativo | Acesso a APIs iOS/Android |
| **Dev velocity** | ⚠️ Média | 2 codebases, 2 times, 2 build pipelines |
| **Manutenção** | ❌ Alta | Updates de SO + libs nativas constantes |

**Quando escolher React Native:**
- App Store como canal primário (iOS discovery)
- Performance nativa obrigatória (animações 60fps em listas grandes)
- Acesso a APIs nativas que PWA não cobre

---

### 3. Expo (managed workflow)

| Aspecto | Estado | Notas |
|---|---|---|
| **Esforço de migração** | ❌ Alto + lock-in | Mesmo que RN, mais dependência de Expo |
| **Bundle único** | ❌ Não | Expo Go (dev) + EAS Build (prod) |
| **iOS Safari** | ✅ Nativo | Via Expo Router |
| **Android Chrome** | ✅ Nativo | Via Expo Router |
| **Offline-first** | ✅ WatermelonDB | Requer setup |
| **Store listing** | ✅ EAS Build | Apple + Google |
| **Bundle size** | ⚠️ ~10-20MB | Expo runtime |
| **Push notifications** | ✅ expo-notifications | Wrapper sobre FCM/APNs |
| **Dev velocity** | ⚠️ Média-inicial | Config zero, mas ejetar é doloroso |
| **Manutenção** | ❌ Alta + lock-in | Versão Expo controla libs disponíveis |

**Quando escolher Expo:**
- Time novo em mobile (config zero, docs boas)
- App pequeno/médio sem necessidade de módulos nativos custom
- Aceitar o lock-in

**Quando NÃO escolher Expo:**
- Módulos nativos custom (F-228: Akasha pode precisar de contatos, NFC, geofencing)
- Time com experiência em RN que prefere controle total

---

### 4. Flutter

| Aspecto | Estado | Notas |
|---|---|---|
| **Esforço de migração** | ❌ Altíssimo | Reescrita total em Dart, perder 100% do código TS |
| **Bundle único** | ❌ Não | 1 codebase Flutter, separado de Next.js |
| **Performance** | ✅ Excelente (60fps) | Skia rendering engine |
| **Bundle size** | ⚠️ ~10-15MB | Engine Flutter embutido |
| **Dev velocity** | ⚠️ Curva Dart | Time TS precisa aprender Dart |
| **Manutenção** | ❌ Muito alta | 2 linguagens, 2 mentalidades |

**Quando escolher Flutter:**
- Equipe com experiência em Dart
- Necessidade de UI altamente customizada (60fps constante)
- NÃO recomendado para Akasha: a lógica está em TS packages compartilhados

---

## Recomendação detalhada para Akasha

### Fase 1 (3-6 meses): PWA-first + Store listing

**Ações concretas:**

1. **Manifest.json robusto** (apps/akasha-portal/public/manifest.json):
   ```json
   {
     "name": "Akasha OS",
     "short_name": "Akasha",
     "theme_color": "#0B0E1C",
     "background_color": "#0B0E1C",
     "display": "standalone",
     "scope": "/",
     "start_url": "/meu-dia",
     "icons": [
       { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
       { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
     ],
     "share_target": { "action": "/diario/share", "method": "POST" }
   }
   ```

2. **Service Worker** com Workbox:
   - Cache-first para assets estáticos
   - Network-first para API
   - Background sync para DailyContent
   - Web Push handler

3. **Install prompt customizado** (já existe PwaInstallPrompt — verificar se está ativo)

4. **TWA (Trusted Web Activity)** para Google Play:
   - Usar Bubblewrap: `npx @bubblewrap/cli init --manifest=/manifest.json`
   - Build APK assinado: `bubblewrap build`
   - Publicar no Google Play Console (taxa única $25 vs Apple $99/ano)

5. **Web Push** via VAPID keys:
   - Server: `web-push` lib
   - Client: `serviceWorkerRegistration.pushManager.subscribe`

### Fase 2 (6-12 meses): AVALIAR migração React Native

**Critérios de gate (TODOS devem ser true):**
- [ ] Métricas de uso mobile >70% dos acessos (verificar via Plausible/Vercel Analytics)
- [ ] App Store como canal de aquisição primário (medir CAC)
- [ ] Necessidade real de APIs nativas (HealthKit, NFC, etc)
- [ ] Time dedicado a manter 2 codebases (1 web + 1 RN)
- [ ] Budget para rewrite (~3-6 meses de 1 dev)

**Plano de migração (se aprovado):**
1. Extrair lógica de negócio de `apps/akasha-portal/src/lib/` para `packages/` (já parcialmente feito)
2. Reescrever UI em React Native (1:1 com componentes atuais)
3. Manter `apps/akasha-portal/` como web app (NÃO remover)
4. Publicar RN app na App Store + Google Play

### Fase 3 (12+ meses): NÃO Expo

Expo limita controle de módulos nativos. Se migrarmos para RN, usar **bare workflow** com TypeScript template.

---

## Métricas de decisão (verificar trimestralmente)

| Métrica | Meta | Atual |
|---|---|---|
| % acesso mobile | >70% para justificar RN | _medir_ |
| Conversão install (web → PWA) | >15% | _medir_ |
| Push opt-in rate | >40% | _medir_ |
| Time-to-interactive (3G) | <3s | _medir_ |
| PWA Lighthouse score | >90 | _medir_ |
| App Store rating (se RN) | >4.5 | N/A |

---

## Próximos passos

### Imediato (esta sprint)
- [ ] Auditar `apps/akasha-portal/public/manifest.json` (atual vs. spec)
- [ ] Verificar se Service Worker está registrado (apps/akasha-portal/src/app/sw.ts ou similar)
- [ ] Confirmar PwaInstallPrompt component está integrado
- [ ] Configurar VAPID keys para Web Push

### Curto prazo (próxima sprint)
- [ ] Bubblewrap init + build APK para Google Play
- [ ] Publicar na Play Store (interna primeiro, depois produção)
- [ ] Adicionar Web Push subscription ao `useAkashaSynthesis`

### Médio prazo (próximo quarter)
- [ ] Medir % mobile vs desktop
- [ ] Medir conversion install prompt
- [ ] Avaliar Fase 2 (RN) com base em dados reais

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Apple vetar TWA / PWA em iOS | Média | Alto | PWA funciona em iOS Safari; só Store listing fica bloqueado |
| Push notifications iOS 16.4+ só pós-permission | Alta | Médio | Onboarding explica; primeira sessão = prompt |
| Bubblewrap deprecated | Baixa | Médio | Migrar para PWABuilder.com (Microsoft) |
| RN rewrite custar >6 meses | Média | Alto | Gate criteria acima; se não bater, NÃO migrar |

---

## Decisão final

**HOJE**: PWA-first. Manter Next.js 15 + ativar todos os PWA features.
**6 meses**: Medir. Decidir RN baseado em dados reais, não em hype.
**12 meses**: Se RN confirmado, usar bare workflow (NÃO Expo).

Esta decisão está alinhada com:
- spec §3 Decisão 7 (PWA-first + Store listing)
- Lesson N+25 (knowing when to PAUSE; don't over-engineer)
- Plano PLN-022 (F-228 ainda em pendência; agora completo)

---

**Status:** ✅ Pronto para implementação incremental
**Owner:** TBD (sugestão: 1 dev frontend + 1 dev ops)
**Reviewers:** Lead architect + Head of product
