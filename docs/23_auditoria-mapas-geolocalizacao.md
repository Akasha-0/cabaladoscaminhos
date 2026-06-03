# Documento 23 — Auditoria de Completude dos Mapas Natais, Geolocalização & Precisão da IA

## Cabala dos Caminhos

> **Tipo:** Auditoria (código × visão) + decisões de arquitetura para **precisão dos 4 mapas** e da análise por casa.
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Motivação:** a visão exige que a IA gere o **diagnóstico preciso de cada uma das 36 casas** cruzando os 4 mapas natais. Isso só é possível se os mapas estiverem **completos, com todos os aspectos**. Esta auditoria mede o estado real e decide como fechar as lacunas.
> **Relação:** confronta o código com Doc 04 §2 (estrutura dos mapas) e Doc 11 (cálculo); alimenta o Doc 18 (contratos) e o Doc 06 (correlação por casa). Registrado no painel (Doc 21).

---

## 1. Veredito de Completude

| Mapa | Campos exigidos (Doc 04 §2) | Produzidos | % | Estado |
|---|---|---|---|---|
| **Numerologia Cabalística** | 15 | 15 | **100%** | ✅ completo (tipo com 12 campos mortos) |
| **Numerologia Tântrica** | 11 | 11 | **100%** | ✅ completo (11 corpos; 5 campos mortos no tipo) |
| **Odu de Nascimento** | 5 (núcleo) | 5 | **100%** | ⚠️ `provisional` sempre true (D3); `orixaRegency` com 1 orixá |
| **Astrologia** | 13 | 6 | **46%** | 🔴 **bloqueador crítico** |
| **Geral** | 44 | 37 | **84%** | 🔴 astrologia + geolocalização travam a precisão |

> **Conclusão:** numerologias (cabalística e tântrica) estão **sólidas e completas**. O **elo fraco é a Astrologia** — e, por trás dela, a **ausência de geolocalização**. Sem Ascendente/casas confiáveis e sem elementos/modalidades, o cruzamento por casa (Doc 06) perde profundidade exatamente onde a visão pede precisão.

---

## 2. Auditoria por Mapa

### 2.1 Numerologia Cabalística — ✅ completo
Produz **todos** os campos do Doc 04 §2.2: `lifePath(+Master)`, `mission`, `expression(+Master)`, `motivation`, `impression`, `nativeDayNumber`, `challenges{first,second,main,last}`, `pinnacles{1ª–4ª}`, `karmicLessons` (dígitos ausentes), `karmaicDebts` (13/14/16/19), `rulingArcana{lifePath,expression}`, `lifeCycles`, `personalCycles{ano,mês,dia}`.
- **Higiene:** o **tipo** declara ~12 campos nunca preenchidos (`hebrewLetter`, `sefirotPath`, `vibrationalNumber`, `chaliceNumber`, `soulUrgeNumber`, `personalityNumber`, `hiddenPassionNumber`, `maturityNumber`, `balanceNumber`, `minorCycles`, duplicatas `personalYear/Month/Day`). São **expectativas falsas** — o tipo deve refletir o que se produz.

### 2.2 Numerologia Tântrica — ✅ completo
Produz `soul/karma/divineGift` (+ `*Body` + `*Description`), `destiny` (soma dos 4 dígitos do ano), `tantricPath` (data completa) e `bodies[]` (os **11 corpos** explícitos, `TANTRIC_BODIES_DATA`).
- **Higiene:** tipo com 5 campos mortos (`sacredGeometry`, `chakraStates`, `energyMatrix`, `elementBalances`, `kundaliniState`) + `tantricBodies` genérico redundante com `bodies[]`.

### 2.3 Odu de Nascimento — ⚠️ provisório
Produz `oduNumber`, `oduName`, `orixaRegency[]`, `elementalForce`, `lifeLesson`, `provisional`.
- **`provisional` é sempre `true`** — algoritmo default dia+mês (Doc 11 §4.1); aguarda a **tabela de linhagem do operador (D3)**.
- `orixaRegency` retorna **só o primeiro** orixá; o Doc 04 §2.4 prevê vários (ex.: `["Xangô","Oxalá"]`).
- **Higiene:** tipo com ~10 campos mortos (`sign`, `animal`, `owner`, `ebwe`, `message`, `initiationPath`, `prohibitions`, `birthOdu`…).

### 2.4 Astrologia — 🔴 bloqueador
`getBirthChart({ birthDate, latitude, longitude })` retorna um shape **`BirthChart`** que **não bate** com o tipo `AstrologyMap` (Doc 04 §2.1). Faltam/diferem:

| Campo exigido (Doc 04 §2.1) | Código | Estado |
|---|---|---|
| `sun/moon/ascendant` como `{sign,degree,house}` | planetas em array; ascendente como **número (grau)** | ⚠️ estrutura difere; **falta o signo** do Asc/MC |
| 10 planetas **+ Quíron + Lilith** | só **10 planetas** | ❌ **Quíron e Lilith ausentes** |
| `houses` (12 casas, signo regente) | `chartHouses[]` | ⚠️ presente, shape difere |
| `planetsInHouses` (lookup) | — | ❌ ausente |
| `aspects[]` com `nature: harmony\|tension` | `aspects[]` (sem `nature` confirmado) | ⚠️ verificar |
| `elements{fogo,terra,ar,água}` | — | ❌ ausente |
| `modalities{cardinal,fixo,mutável}` | — | ❌ ausente |
| `northNode/southNode` | via `nodes` | ✅ presente |

- **Pré-requisito não atendido:** Ascendente e casas exigem **hora + local exatos**. Sem `lat/lng/timezone`, `createClientWithMaps` cai num **stub** (`sun:'—', ascendant:'—'`).
- A base de efemérides é a **aproximação própria** (`swiss-ephemeris.ts`), não a Swiss Ephemeris real (Doc 16 AD-04).

---

## 3. Geolocalização — lacuna que trava a precisão astral

> **Achado:** **não existe serviço de geocodificação** no projeto (busca por `geocode`/`nominatim`/`places`/`timezone` = vazio). O `Client` tem `birthLatitude/birthLongitude/birthTimezone` (nullable), mas **nunca são preenchidos automaticamente** a partir da cidade.

Isso contraria o requisito da visão: *"o local de nascimento deveria ser preenchido por geolocalização para maior precisão"*. Sem coordenadas e fuso corretos, **o Ascendente e as 12 casas ficam errados ou ausentes** — degradando justamente a camada astrológica do diagnóstico.

---

## 4. Decisões de Arquitetura

### AD-23.1 — Astrologia é o bloqueador nº1; fechar o `AstrologyMap` canônico.
- **Decisão:** definir **um** contrato `AstrologyMap` (o do Doc 04 §2.1) e um **adaptador** que converte a saída de `getBirthChart` para ele — ou realinhar `getBirthChart` para emiti-lo diretamente. O mapa deve conter **todos os aspectos**:
  - **Quíron + Lilith** (além dos 10 planetas) — exigidos pela Matriz (Casa 7=Lilith, etc., Doc 06).
  - **`elements` e `modalities`** (contagens) — exigidos pela visão.
  - **`planetsInHouses`** (lookup) — o PromptBuilder depende disso por casa.
  - **Ascendente/MC como `{sign,degree}`** (não só grau).
  - **`nature: harmony|tension`** em cada aspecto.
- **Justificativa:** sem isso, ~metade das delegações da Matriz (Doc 09 §3) não têm dado para injetar → dossiê genérico onde a visão exige precisão.

### AD-23.2 — Geolocalização obrigatória para o mapa astral.
- **Decisão:** criar um serviço `geolocation` (ex.: **Nominatim/OpenStreetMap**, gratuito, ou Google Places — Doc 03 §2) que, no cadastro, converte **cidade/estado/país → `lat/lng/timezone`** e os persiste no `Client` **antes** de calcular o mapa. Cache por localidade.
- **Regra:** o `astrologyMap` só é considerado **completo** quando há coordenadas + fuso; sem eles, marca-se `incomplete: true` e a UI pede a localização (não gera dossiê astral "estimado" silenciosamente).
- **UX (Doc 17 Zona A):** o campo "Local de nascimento" é um **autocomplete geolocalizado** que devolve coordenadas — fricção zero, precisão alta.

### AD-23.3 — Higiene de tipos: o tipo reflete o que se produz.
- **Decisão:** os tipos `KabalisticMap`/`TantricMap`/`OduBirth`/`AstrologyMap` devem listar **apenas** campos efetivamente populados. Campos "de futuro" (ex.: `chakraStates`, `sefirotPath`) saem do tipo ou viram um bloco `extensions?` opcional explicitamente marcado como **não calculado ainda**. Elimina expectativa falsa para os agentes de IA que leem os tipos.
- **Fonte única do shape dos mapas:** os tipos em `src/types` são a verdade; o Doc 04 §2 e os builders seguem-nos (e vice-versa) — sem divergência.

### AD-23.4 — Odu: linhagem (D3) + regência completa.
- **Decisão:** substituir o algoritmo provisório dia+mês pela **tabela data→Odu da linhagem do operador (D3)**; enquanto não vier, manter `provisional:true` sinalizado (Doc 20 AD-20.9). `orixaRegency` passa a trazer **todos** os orixás regentes do Odu (Doc 04 §2.4 / glossário Doc 15).

### AD-23.5 — "Mapas completos" é pré-condição da precisão por casa.
- **Decisão:** o motor de dossiê (Doc 06/18) só promete precisão se os 4 mapas estiverem completos. Formaliza-se a regra: **cada casa injeta exatamente os aspectos que a Matriz delega** (Doc 09 §3) — e esses aspectos **precisam existir** no mapa. Mapas incompletos ⇒ o dossiê **sinaliza** a lacuna ("dado astral indisponível para esta casa"), nunca inventa (Doc 20 AD-20.2).

### AD-23.6 — Validador de completude dos mapas (teste-guardião).
- **Decisão:** um validador (teste-guardião, Doc 19 §4.1) verifica, para um cliente de referência, que cada mapa contém **todos** os campos exigidos pelo Doc 04 §2 — e falha o gate se faltar aspecto. Impede regressão silenciosa de completude.

---

## 5. Impacto na IA (por que isto importa para o diagnóstico)

A análise por casa cruza **significado da casa + carta tirada + Odu tirado + aspecto natal delegado** (Doc 06 §1). A qualidade depende, na ordem:
1. **Glossário** (significados-base) — ✅ existe (Doc 15).
2. **Correlação determinística** — ✅ as 36 entradas existem (Doc 06).
3. **Mapas natais completos** — ⚠️ **aqui está o gargalo**: astrologia a 46% e sem geolocalização.

> **Logo:** o maior salto de **precisão da IA** não vem de um modelo maior, e sim de **completar o mapa astral + geolocalizar** (AD-23.1/.2). É a alavanca de maior retorno para "dar todos os caminhos com precisão".

---

## 6. Critério de "pronto" (mapas prontos para diagnóstico preciso)

- [ ] `AstrologyMap` canônico completo: 10 planetas + Quíron + Lilith, casas, `planetsInHouses`, `elements`, `modalities`, Asc/MC com signo, aspectos com `nature` (AD-23.1).
- [ ] Geolocalização preenche `lat/lng/timezone` no cadastro; sem eles, mapa astral marcado `incomplete` (AD-23.2).
- [ ] Tipos dos 4 mapas refletem exatamente o que é produzido (AD-23.3).
- [ ] Odu com tabela de linhagem (D3) ou `provisional` sinalizado; `orixaRegency` completo (AD-23.4).
- [ ] Validador de completude verde no gate (AD-23.6).

---

*Doc 23 é a auditoria canônica de completude dos mapas e a decisão de geolocalização. As numerologias estão prontas; a astrologia + geolocalização são o caminho crítico para a precisão da IA. Registrado no painel (Doc 21) como parte da Onda 4/5.*
