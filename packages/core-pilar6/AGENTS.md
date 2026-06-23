# @akasha/core-pilar6 DOX

## Purpose

Motor determinístico do **Pilar 6 — Mapa Energético Integrado**
(tradução universalista do Human Design — Guardrails do ADR 0002).
Alimenta a nova camada do Mandala, Mandato e Mentor via RAG.

Implementa 4 sub-componentes:

1. **Tipo Energético** — 4 tipos (Iniciador, Guia, Iniciador Aberto,
   Refletor), derivados heurísticamente da combinação de Pilar 4
   (Odu de nascimento) + Pilar 2 (Ascendente astrológico) + estado do
   Centro da Vitalidade (D-041).
2. **Estratégia Energética** — 4 estratégias (Esperar Convite, Informar,
   Iniciar, Esperar Ciclo Lunar). Mapeamento 1:1 a partir do Tipo.
3. **Autoridade Energética** — 6 autoridades internas (Emocional,
   Sacral, Esplenica, Cardíaca, Identidade, Lunar). Reutiliza a
   detecção canônica do D-041 (Caminhante) — sem duplicar modelagem.
4. **Centros Energéticos** — 9 centros baseados em I Ching + Cabala +
   Tantra (NÃO em chakras hindus, Guardrail 1 do ADR 0002), e
   **Canais** — 36 canais entre pares de centros adjacentes definidos.

Engine puro, sem dependências de framework. Mesma entrada → mesma
saída (testável, auditável).

## Ownership

- `src/tipo.ts`: detecção do Tipo Energético (4 tipos)
- `src/estrategia.ts`: mapeamento Tipo → Estratégia
- `src/autoridade.ts`: detecção da Autoridade (reusa D-041)
- `src/centros.ts`: detecção dos 9 Centros Energéticos
- `src/canais.ts`: detecção dos 36 Canais (pares de centros definidos)
- `src/calcular.ts`: orquestrador — `calcular(pilares, mc)`
- `src/types.ts`: tipos públicos (PilaresDados, MandalaCaminho,
  Pilar6Resultado)
- `src/index.ts`: barrel — export point público
- `src/__tests__/`: testes co-localizados (vitest)
  - `tipo.test.ts`, `estrategia.test.ts`, `autoridade.test.ts`,
    `centros.test.ts`, `canais.test.ts`, `calcular.test.ts`

## Local Contracts

### Pilar 6 — Input shape (PilaresDados)

Aceita o shape canônico já usado em
`apps/akasha-portal/src/lib/grimoire/significados-especificos.ts`
(`PilaresDados` com `cabala`, `astrologia`, `tantrica`, `odu`, `iching`).
NÃO duplica tipos — reusa do domínio já estabelecido.

### Pilar 6 — Input shape (MandalaCaminho)

Aceita um agregado opcional `MandalaCaminho` carregando contexto
multi-tenant do Caminhante (D-041) — `caminhanteId`, `caminhadaId`,
`centroVitalidadeAtivo` (derivado do MC canônico), `nascimentoIso`.
O `centroVitalidadeAtivo` é o que o D-041 considera **ativo** ou
**inativo** no momento do nascimento, e é a entrada que o Pilar 6
usa para a heurística de Tipo.

### Pilar 6 — Output shape (Pilar6Resultado)

```ts
interface Pilar6Resultado {
  tipo: TipoEnergetico
  estrategia: EstrategiaEnergetica
  autoridade: AutoridadeEnergetica | null  // null = inconclusivo
  centrosDefinidos: CentroEnergetico[]     // subset dos 9
  canais: Canal[]                          // canais ativos
  versaoCalculo: 'v1'
  calculadoEm: Date
}
```

### 4 Guardrails do ADR 0002 (NÃO VIOLAR)

1. **Renomear termos** — nenhum termo proprietário do Human Design
   ou Gene Keys pode aparecer em código, UI, schema, ou docs. Tabela
   de renomeação: ver `apps/akasha-portal/prisma/designs/D-YYY-pilar-6-mapa-energetico-traduzido.md`.
2. **Textos do zero** — descrições (nomes de tipos, temas de canais)
   são **originais**, não cópias nem traduções literais.
3. **Visualização própria** — **não há** implementação de visualização
   neste package; a Mandala SVG é `apps/akasha-portal/src/components/akasha/MandalaChart.tsx`
   e a integração visual é Task de Wave 4+ (não Wave 4 Task 1).
4. **Disclaimer legal** — fora de escopo deste package (app-layer).
   Ver `apps/akasha-portal/src/app/[locale]/(akasha)/onboarding/page.tsx`
   e `/conta/legal` (Wave 4 Task 4 — Disclaimer).

### Pilar 1-5 colors vs Pilar 6 (NOVA COR)

Mandala tem 5 cores de Pilar já estabelecidas. Pilar 6 ganha **nova cor**
— sugestão: **verde-água** (`#5CFFB0`) para diferenciá-lo dos 5
existentes. Decisão visual é Wave 4 Task 4 (MandalaChart update).

### Determinístico

Zero `Math.random()`. Mesmos PilaresDados + MandalaCaminho → mesmo
`Pilar6Resultado`. Stub heurístico para Wave 4 (algoritmo real
Wave 5+ a partir de uso real — Risk do D-YYY).

### 9 Centros (NÃO 7 chakras hindus)

Inspiração universalista: I Ching + Cabala + Tantra. Nomes em PT-BR
**próprios**, sem nomes próprios proprietários:

| Centro           | Inspiração                                  |
|------------------|---------------------------------------------|
| Inspiração       | Cabala (Keter)                              |
| Mental           | Cabala (Hokhmah / Binah)                    |
| Manifestação     | I Ching (canais de expressão)               |
| Identidade       | Astrologia (Ascendente)                     |
| Vontade          | Tantra (Anahata)                            |
| Emoções          | Tantra (Manipura)                           |
| Vitalidade       | Tantra (Svadhisthana)                       |
| Sobrevivência    | Tantra (Muladhara — instinto)               |
| Fundamentação    | Tantra (Muladhara — base)                   |

### 36 Canais (subset das 64 Portas)

Cada canal = par de portas (1-64) + 2 centros. Canal ativa quando
**2 centros adjacentes estão ambos definidos**. Tabela de 36 canais
hard-coded (D-YYY §4 do proposal). 36 é uma redução do grafo de
36 canais clássicos — pré-filtrada para os 9 centros acima.

## Work Guidance

- **PT-BR primeiro** (i18n config). Todos os comentários e nomes
  visíveis em PT-BR.
- **Determinismo em tests**: usar `vi.useFakeTimers()` para
  data-dependente. NUNCA depender de `Date.now()` real.
- **Heurística de Tipo (Wave 4)**: combinar `PilarDadosOdu.odu_principal`
  (Pilar 4) + `PilarDadosAstrologia.asc_signo` (Pilar 2) +
  `MandalaCaminho.centroVitalidadeAtivo` (D-041) para escolher 1 dos
  4 tipos. Wave 5+ evolui essa heurística a partir de uso real.
- **NÃO inventar correspondências**: 9 centros e 36 canais têm tabela
  canônica (D-YYY). Toda adição nova precisa de source canônico.
- **Stub OK para Wave 4**: o algoritmo heurístico é aceitável; o
  que importa é o shape do output ser estável e o TypeScript
  compilar sem erros.
- **Stub fallback (F-230)**: se algum campo crítico de PilaresDados
  for `null`, retornar fallback explícito (autoridade `null`,
  centros vazios), NÃO inventar dados.

## Verification

- `pnpm --filter @akasha/core-pilar6 typecheck` — `tsc --noEmit`
- `pnpm --filter @akasha/core-pilar6 test:run` — vitest run
- Antes de commit: typecheck + test:run
- Antes de merge: typecheck + portal typecheck (akasha-core vai
  importar este package na Task 3)

## Known Issues / Notes

- **Stub heurístico (Wave 4)**: o algoritmo de Tipo é heurístico
  (combina 3 sinais em uma regra simples). Wave 5+ evolui com base
  em uso real e parecer teológico dos consultores da tradição
  universalista (Cumino / Saraceni / Camargo).
- **Reuso de D-041**: as 6 Autoridades (Emocional, Sacral, Esplenica,
  Cardíaca, Identidade, Lunar) são detectadas pelo MC canônico do
  D-041 — ver `apps/akasha-portal/prisma/proposals/d-041-prisma-caminhante-caminhada-proposal.md`.
  Pilar 6 apenas **reutiliza** essa detecção; não duplica modelagem.
- **Disclaimer legal (Guardrail 4)**: o disclaimer em si não vive
  neste package. Wave 4 Task 4 (Disclaimer) é responsável por
  adicioná-lo no onboarding + `/conta/legal`.

## Related Files

- `packages/core-cabala/AGENTS.md` — Pilar 1 (sibling) — referência
  estrutural (mesma forma de package, mesmo padrão de test)
- `packages/core-astrology/AGENTS.md` — Pilar 2 (sibling)
- `packages/core-odus/AGENTS.md` — Pilar 4 (sibling) — birthOdu é
  input de Pilar 6
- `packages/core-iching/AGENTS.md` — Pilar 5 (sibling) — Portas 1-64
- `packages/akasha-core/AGENTS.md` — orchestrator (Task 3 vai
  integrar Pilar 6)
- `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` — ADR
  canônico (4 guardrails)
- `apps/akasha-portal/prisma/designs/D-YYY-pilar-6-mapa-energetico-traduzido.md` —
  design proposal (este package implementa)
- `apps/akasha-portal/src/lib/grimoire/significados-especificos.ts` —
  shape canônico de `PilaresDados`
- `apps/akasha-portal/prisma/designs/d-041-prisma-caminhante-caminhada-proposal.md` —
  shape canônico de `MandalaCaminho` (MC = Mandala do Caminhante)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado.)
