# Documento 23 — Auditoria de Completude dos Mapas Natais, Geolocalização & Precisão da IA
## Sistema Akasha
> **Norte:** Doc 25.
> **Tipo:** Auditoria (código × visão) + decisões de arquitetura para **precisão dos 4 mapas (os 4 Pilares)** e do cruzamento que alimenta a Mandala/Dashboard.
> **Versão:** 1.2 | **Data:** 2026-06-03
> **Motivação:** a visão exige que a IA emita o **diagnóstico unificado** cruzando os 4 mapas natais (os 4 Pilares — Doc 25 §1) com o céu de hoje. Isso só é possível se os mapas estiverem **completos, com todos os aspectos**. Esta auditoria mede o estado real e decide como fechar as lacunas — e é **pré-condição da precisão** do produto.
> **Relação:** confronta o código com Doc 04 §3 (estrutura dos 4 mapas, agnóstica e preservada) e Doc 11 (cálculo); alimenta o Grafo de Conhecimento (Doc 25 §4) e a geolocalização do onboarding (Doc 25 §6). Os engines auditados aqui são os `packages/core-*` (Doc 25 §11).

---

## 1. Veredito de Completude

| Mapa | Campos exigidos (Doc 04 §2) | Produzidos | % | Estado |
|---|---|---|---|---|
| **Numerologia Cabalística** | 15 | 15 | **100%** | ✅ completo (tipo com 12 campos mortos) |
| **Numerologia Tântrica** | 11 | 11 | **100%** | ✅ completo (11 corpos; 5 campos mortos no tipo) |
| **Odu de Nascimento** | 5 (núcleo) | 5 | **100%** | ⚠️ `provisional` sempre true (D3); `orixaRegency` com 1 orixá |
| **Astrologia** | 13 | 6 | **46%** | 🔴 **bloqueador crítico** |
| **Geral** | 44 | 37 | **84%** | 🔴 astrologia + geolocalização travam a precisão |

> **Conclusão:** numerologias (cabalística e tântrica) estão **sólidas e completas** — dois dos quatro Pilares já blindados. O **elo fraco é a Astrologia** (Pilar do Céu/Macro) — e, por trás dela, a **ausência de geolocalização**. Sem Ascendente/casas confiáveis e sem elementos/modalidades, o cruzamento dos pilares (Grafo, Doc 25 §4) perde profundidade exatamente onde a visão pede precisão. O Anel Cósmico da Mandala (Doc 26 §6) depende deste mapa.

---

## 2. Auditoria por Mapa

### 2.1 Numerologia Cabalística — ✅ completo
Produz **todos** os campos do Doc 04 §2.2: `lifePath(+Master)`, `mission`, `expression(+Master)`, `motivation`, `impression`, `nativeDayNumber`, `challenges{first,second,main,last}`, `pinnacles{1ª–4ª}`, `karmicLessons` (dígitos ausentes), `karmaicDebts` (13/14/16/19), `rulingArcana{lifePath,expression}`, `lifeCycles`, `personalCycles{ano,mês,dia}`.
- **Higiene:** o **tipo** declara ~12 campos nunca preenchidos (`hebrewLetter`, `sefirotPath`, `vibrationalNumber`, `chaliceNumber`, `soulUrgeNumber`, `personalityNumber`, `hiddenPassionNumber`, `maturityNumber`, `balanceNumber`, `minorCycles`, duplicatas `personalYear/Month/Day`). São **expectativas falsas** — o tipo deve refletir o que se produz.

### 2.2 Numerologia Tântrica — ✅ completo
Produz `soul/karma/divineGift` (+ `*Body` + `*Description`), `destiny` (soma dos 4 dígitos do ano), `tantricPath` (data completa) e `bodies[]` (os **11 corpos** explícitos, `TANTRIC_BODIES_DATA`).
- **Higiene:** tipo com 5 campos mortos (`sacredGeometry`, `chakraStates`, `energyMatrix`, `elementBalances`, `kundaliniState`) + `tantricBodies` genérico redundante com `bodies[]`.

### 2.3 Odu de Nascimento — ⚠️ provisório
Produz `oduNumber`, `oduName`, `orixaRegency[]`, `elementalForce`, `lifeLesson`, `provisional`. Este é o Pilar da Terra/Ori (Doc 25 §1), o núcleo da Mandala (Doc 26 §6).
- **`provisional` é sempre `true`** — algoritmo default dia+mês (Doc 11 §4.1); aguarda a **tabela de linhagem do curador (D3)**.
- `orixaRegency` retorna **só o primeiro** orixá; o Doc 04 §3.4 prevê vários (ex.: `["Xangô","Oxalá"]`).
- **Higiene:** tipo com ~10 campos mortos (`sign`, `animal`, `owner`, `ebwe`, `message`, `initiationPath`, `prohibitions`, `birthOdu`…).

### 2.4 Astrologia — 🔴 bloqueador
`getBirthChart({ birthDate, latitude, longitude })` retorna um shape **`BirthChart`** que **não bate** com o tipo `AstrologyMap` (Doc 04 §3.1). Faltam/diferem:

| Campo exigido (Doc 04 §3.1) | Código | Estado |
|---|---|---|
| `sun/moon/ascendant` como `{sign,degree,house}` | planetas em array; ascendente como **número (grau)** | ⚠️ estrutura difere; **falta o signo** do Asc/MC |
| 10 planetas **+ Quíron + Lilith** | só **10 planetas** | ❌ **Quíron e Lilith ausentes** |
| `houses` (12 casas, signo regente) | `chartHouses[]` | ⚠️ presente, shape difere |
| `planetsInHouses` (lookup) | — | ❌ ausente |
| `aspects[]` com `nature: harmony\|tension` | `aspects[]` (sem `nature` confirmado) | ⚠️ verificar |
| `elements{fogo,terra,ar,água}` | — | ❌ ausente |
| `modalities{cardinal,fixo,mutável}` | — | ❌ ausente |
| `northNode/southNode` | via `nodes` | ✅ presente |

- **Pré-requisito não atendido:** Ascendente e casas exigem **hora + local exatos**. Sem `lat/lng/timezone`, o cálculo cai num **stub** (`sun:'—', ascendant:'—'`).
- A base de efemérides é a **aproximação própria** (`swiss-ephemeris.ts`), não a Swiss Ephemeris real exigida pela visão (Doc 25 §4: o motor determinístico conecta ao Swiss Ephemeris para o céu exato).

---

## 3. Geolocalização — lacuna que trava a precisão astral

> **Achado:** **não existe serviço de geocodificação** no projeto (busca por `geocode`/`nominatim`/`places`/`timezone` = vazio). O `User` tem `birthLatitude/birthLongitude/birthTimezone` (nullable, Doc 04 §1), mas **nunca são preenchidos automaticamente** a partir da cidade.

Isso contraria o requisito da visão: no onboarding ("A Coleta Sagrada", Doc 25 §6), o campo *"Onde você aterrissou?"* deve ser geolocalizado. Sem coordenadas e fuso corretos, **o Ascendente e as 12 casas ficam errados ou ausentes** — degradando justamente o Anel Cósmico (Astrologia) da Mandala.

---

## 4. Decisões de Arquitetura

### AD-23.1 — Astrologia é o bloqueador nº1; fechar o `AstrologyMap` canônico.
- **Decisão:** definir **um** contrato `AstrologyMap` (o do Doc 04 §3.1) e um **adaptador** que converte a saída de `getBirthChart` para ele — ou realinhar `getBirthChart` para emiti-lo diretamente. O mapa deve conter **todos os aspectos**:
  - **Quíron + Lilith** (além dos 10 planetas) — exigidos pela correlação (Casa 7=Lilith, etc., Doc 06).
  - **`elements` e `modalities`** (contagens) — exigidos pela visão.
  - **`planetsInHouses`** (lookup) — o PromptBuilder depende disso por casa.
  - **Ascendente/MC como `{sign,degree}`** (não só grau).
  - **`nature: harmony|tension`** em cada aspecto.
- **Justificativa:** sem isso, ~metade das delegações do Grafo (Doc 06 / Doc 25 §4) não têm dado para cruzar → Dashboard/Manifesto genérico onde a visão exige precisão.

### AD-23.2 — Geolocalização obrigatória para o mapa astral (Nominatim no onboarding).
- **Decisão:** criar um serviço `geolocation` (**Nominatim/OpenStreetMap**, gratuito e soberano — `NOMINATIM_URL`, Doc 03 §5) que, no onboarding, converte **cidade/estado/país → `lat/lng/timezone`** e os persiste no `User` **antes** de calcular o mapa. Cache por localidade.
- **Regra:** o `astrologyMap` só é considerado **completo** quando há coordenadas + fuso; sem eles, marca-se `incomplete: true` (campo em `BirthChart`, Doc 04 §1) e a UI pede a localização (não gera leitura astral "estimada" silenciosamente — anti-alucinação, Doc 20 AD-20.2).
- **UX (Doc 25 §6 — "A Coleta Sagrada"):** o campo *"Onde você aterrissou?"* é um **autocomplete geolocalizado** que devolve coordenadas — fricção zero, precisão alta, dentro do ritual cerimonial do onboarding.

### AD-23.3 — Higiene de tipos: o tipo reflete o que se produz.
- **Decisão:** os tipos `KabalisticMap`/`TantricMap`/`OduBirth`/`AstrologyMap` devem listar **apenas** campos efetivamente populados. Campos "de futuro" (ex.: `chakraStates`, `sefirotPath`) saem do tipo ou viram um bloco `extensions?` opcional explicitamente marcado como **não calculado ainda**. Elimina expectativa falsa para os agentes de IA que leem os tipos.
- **Fonte única do shape dos mapas:** no monorepo, os tipos exportados pelos `packages/core-*` são a verdade; o Doc 04 §3 e os builders seguem-nos (e vice-versa) — sem divergência.

### AD-23.4 — Odu: linhagem (D3) + regência completa.
- **Decisão:** substituir o algoritmo provisório dia+mês pela **tabela data→Odu da linhagem do curador (D3)**; enquanto não vier, manter `provisional:true` sinalizado (Doc 20 AD-20.9). `orixaRegency` passa a trazer **todos** os orixás regentes do Odu (Doc 04 §3.4 / glossário Doc 15).

### AD-23.5 — "Mapas completos" é pré-condição da precisão do cruzamento.
- **Decisão:** o motor de síntese (Grafo + Camada 3, Doc 25 §4) só promete precisão se os 4 mapas estiverem completos. Formaliza-se a regra: **cada nó do cruzamento injeta exatamente os aspectos delegados** (Doc 06 §3) — e esses aspectos **precisam existir** no mapa. Mapas incompletos ⇒ a leitura **sinaliza** a lacuna ("dado astral indisponível"), nunca inventa (Doc 20 AD-20.2).

### AD-23.6 — Validador de completude dos mapas (teste-guardião).
- **Decisão:** um validador (teste-guardião, Doc 19 §4.1) verifica, para um cliente de referência, que cada mapa contém **todos** os campos exigidos pelo Doc 04 §2 — e falha o gate se faltar aspecto. Impede regressão silenciosa de completude.

---

## 5. Impacto na IA (por que isto importa para o diagnóstico)
O diagnóstico unificado do Akasha cruza **os 4 Pilares + o céu de hoje** (Doc 25 §1, §4). A qualidade depende, na ordem:
1. **Grimório/Glossário** (significados-base, magia natural) — ✅ base existe (Doc 15 / Doc 20).
2. **Correlação determinística** (o Grafo) — ✅ as entradas de cruzamento existem (Doc 06 / Doc 25 §4).
3. **Mapas natais completos** — ✅ astrologia (AD-23.1) + geolocalização (AD-23.2) resolvidos; AD-23.6 garante que não regride.
4. **Validador guardião** — ✅ AD-23.6 (Fase 45): `tests/calculators/map-completeness.test.ts` — 6 testes cobrindo os 4 mapas (migram para `packages/core-*` na Cirurgia de Extração).
> **Estado atual:** AD-23.1 (astrologia completa com nature+planetsInHouses) e AD-23.2 (timezone) resolvidos. AD-23.6 impede regressão. O gargalo restante é AD-23.4 (D3 — aguardando o curador para a tabela de linhagem).

---

## 6. Critério de "pronto" (mapas prontos para diagnóstico preciso)

- [x] `AstrologyMap` — AD-23.1 ✅ (2026-06-03): `nature` em aspectos (trino/sextil=harmony, oposicao/quadratura=tension, conjuncao=neutral); `planetsInHouses` em `normalizeBirthChart`; Chiron/Lilith e elementos/modalidades presentes (Fase 29).
- [ ] `AstrologyMap` canônico (Doc 04 §3.1): tipo difere do formato `BirthChart` armazenado (AD-23.3 — baixa prioridade; bridge via `normalizeBirthChart`).
- [ ] Odu com tabela de linhagem (D3) ou `provisional` sinalizado; `orixaRegency` completo (AD-23.4).
- [x] Validador de completude dos mapas (AD-23.6 ✅ 2026-06-03): `tests/calculators/map-completeness.test.ts` — 6 testes guardioes: KabalaMap (todos os campos numericos e strings), TantricMap (5 bodies + geometria sagrada + chakra states + energy matrix), OduBirth (oduNumber + provisional), AstrologyMap (10 planetas + Chiron/Lilith via chart.planeta + casas + aspectos com nature AD-23.1), aspectos nature consistency, planetsInHouses.

---

*Doc 23 é a auditoria canônica de completude dos 4 Pilares e a decisão de geolocalização (Nominatim no onboarding, Doc 25 §6) — pré-condição da precisão do Akasha. AD-23.1/.2/.6 resolvidos (Fase 43/44/45). Gargalo restante: AD-23.4 (D3 — aguardando o curador para a tabela de linhagem dos Odus). Auditoria agnóstica, válida para os engines `packages/core-*` (Doc 25 §11).*