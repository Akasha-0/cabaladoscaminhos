# Translation Strategy — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-30 | **Wave:** 32 (DOCUMENTATION 6/8)
> **Owner:** PM + Curador (Iyá)
> **Idiomas:** PT-BR (primário), EN (secundário parcial), ES (em progresso)

---

## 1. Princípios

1. **PT-BR é fonte de verdade.** Toda documentação e UI nascem em PT-BR.
2. **EN é parcial e técnico.** Apenas docs de dev, API reference, README, e termos técnicos.
3. **ES está em progresso.** Foco em funcionalidades que tocam hispanohablantes da comunidade (Candomblé, Umbanda, Xamanismo — fortes na América Latina).
4. **Tradução é humana, não automática.** Machine translation é apenas rascunho. Curador (Iyá) valida termos técnicos espirituais.
5. **Glossário canônico** — termos sensíveis têm tradução fixa (ver §4).

---

## 2. Cobertura atual

| Tipo | PT-BR | EN | ES |
|------|-------|----|----|
| UI (i18n) | ✅ 100% | ✅ 95% | 🟡 40% |
| README | ✅ | ✅ | ❌ |
| VISION.md | ✅ | ❌ | ❌ |
| ARCHITECTURE.md | ✅ | ❌ | ❌ |
| CHANGELOG.md | ✅ | ✅ | ❌ |
| AI-PROMPT-base.md | ✅ | ❌ | ❌ |
| USER-GUIDE | ✅ (Wave 32) | ❌ | ❌ |
| FAQ-EXPANDED | ✅ (Wave 32) | ✅ (parcial) | ❌ |
| API-REFERENCE | ❌ | ✅ (Wave 32) | ❌ |
| DEVELOPER-GUIDE | ❌ | ✅ (Wave 32) | ❌ |
| OPS-RUNBOOK | ✅ (Wave 32) | ❌ | ❌ |
| Video scripts | ✅ (Wave 32) | ❌ | ❌ |
| Public FAQ (marketing) | ✅ (Wave 23) | ✅ (Wave 23) | ❌ |

**Cobertura PT-BR:** ~85% (com Wave 32)
**Cobertura EN:** ~50%
**Cobertura ES:** ~10%

---

## 3. Translation keys (organização)

### 3.1 Estrutura

```
src/lib/i18n/
├── pt-BR/
│   ├── common.json          # Botões, labels, mensagens genéricas
│   ├── auth.json            # Login, signup, reset
│   ├── feed.json            # Feed, posts, comments
│   ├── akasha.json          # Chat IA
│   ├── oraculo.json         # Mapas, numerologia
│   ├── marketplace.json     # Listings, booking, payment
│   ├── notifications.json
│   ├── admin.json
│   └── errors.json          # Mensagens de erro
├── en/ (mesma estrutura)
└── es/ (mesma estrutura, parcial)
```

### 3.2 Convenção de chaves

- **camelCase** dentro de cada arquivo
- **Namespace:** `area.subarea.elemento` (ex: `akasha.chat.placeholder`)
- **Variáveis:** `{{variavel}}` para interpolação
- **Pluralização:** i18next plural rules (`{count, plural, one {# mensagem} other {# mensagens}}`)

### 3.3 Exemplo — `common.json`

```json
{
  "buttons": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "publish": "Publicar",
    "delete": "Apagar",
    "confirm": "Confirmar",
    "loading": "Carregando..."
  },
  "errors": {
    "generic": "Algo deu errado. Tente novamente.",
    "network": "Sem conexão. Verifique sua internet.",
    "unauthorized": "Você precisa estar logado."
  },
  "traditions": {
    "candomble": "Candomblé",
    "cabala": "Cabala",
    "astrologia": "Astrologia",
    "tantra": "Tantra",
    "meditacao": "Meditação",
    "xamanismo": "Xamanismo",
    "umbanda": "Umbanda",
    "espiritismo": "Espiritismo",
    "reiki": "Reiki",
    "ifá": "Ifá",
    "outra": "Outra"
  }
}
```

### 3.4 Glossário canônico (PT-BR ↔ EN ↔ ES)

| PT-BR | EN | ES | Notas |
|-------|----|----|-------|
| Akasha (nome próprio) | Akasha | Akasha | Não traduz |
| Orí | Ori | Orí | Cabeça espiritual em Candomblé |
| Axé | Axé | Ashé | Não traduz em EN/ES (termo iorubá) |
| Orixá | Orixá / Orisha | Orisha | Usar termo iorubá em itálico |
| Cabala | Kabbalah | Cábala | |
| Numerologia Cabalística | Kabbalistic Numerology | Numerología Cabalística | |
| Gematria | Gematria | Gematria | Não traduz |
| Mapa astral | Natal chart / birth chart | Carta astral | |
| Ascendente | Ascendant / Rising | Ascendente | |
| Casa (astrologia) | House | Casa | |
| Mesa Real Cigana | Gypsy Royal Table (em EN, manter nome BR no ES) | Mesa Real Gitana | |
| Tarô | Tarot | Tarot | |
| Baralho Cigano | Gypsy Deck | Baraja Gitana | |
| Runas | Runes | Runas | |
| I Ching | I Ching | I Ching | Não traduz |
| Hexagrama | Hexagram | Hexagrama | |
| Meditação | Meditation | Meditación | |
| Tantra | Tantra | Tantra | Não traduz |
| Xamanismo | Shamanism | Chamanismo | |
| Umbanda | Umbanda | Umbanda | Não traduz |
| Espiritismo | Spiritism | Espiritismo | |
| Reiki | Reiki | Reiki | Não traduz |
| Curandeirismo | Healing practice | Curanderismo | |
| Fé | Faith | Fe | |
| Oferenda | Offering | Ofrenda | |
| Terreiro | Terreiro (terreiro) | Terreiro | Não traduz — espaço físico |
| Ponto riscado | Drawn point | Punto rayado | Simbolismo na Umbanda |
| Entidade (umbanda/candomblé) | Entity | Entidad | |
| Guia (espírito) | Guide | Guía | |
| Mentorship | Mentoria | Mentoría | |
| Curadoria | Curation | Curaduría | |

> **Glossário fonte:** `docs/I18N-GLOSSARY.md` (a criar com curador Iyá).

---

## 4. Processo de tradução

### 4.1 Fluxo

```
1. PT-BR escrito por nativo
   ↓
2. Revisão pelo Curador (Iyá) — valida termos espirituais
   ↓
3. Tradução EN por tradutor técnico (com contexto + glossário)
   ↓
4. Revisão PT↔EN por bilíngue (PM Tomás + dev)
   ↓
5. Publicação
   ↓
6. ES (quando aplicável) — mesmo fluxo, com tradutor ES nativo
```

### 4.2 Ferramentas

- **i18n:** `react-i18next` + `i18next-fs-backend` (carregamento dinâmico)
- **Gerência:** `Lokalise` ou `Crowdin` (futuro, pós-beta)
- **Validação:** CI checa que toda chave em PT-BR tem equivalente em EN (cobertura mínima)

### 4.3 CI gate

```yaml
# .github/workflows/i18n-check.yml
- name: Check i18n coverage
  run: |
    pnpm i18n:check        # falha se chave PT-BR sem EN
    pnpm i18n:unused       # detecta chaves não usadas
```

---

## 5. Roadmap

| Trimestre | Marco |
|-----------|-------|
| Q3 2026 | Cobertura PT-BR 100%, EN 80% (funcional) |
| Q4 2026 | ES 60% (pós-feature marketplace ativa) |
| Q1 2027 | EN 100% em docs técnicas; ES 100% em UI |
| Q2 2027 | Francês (opcional, comunidade francófona de Umbanda) |

---

## 6. Próximo passo

- **Glossário completo:** `docs/I18N-GLOSSARY.md` (a criar com Iyá)
- **Coverage por arquivo:** `docs/DOCUMENTATION-COVERAGE-W32.md` §4
- **Config i18n:** `src/lib/i18n/`