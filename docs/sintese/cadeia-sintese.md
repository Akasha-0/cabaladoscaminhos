# Cadeia de Síntese do Akasha — FASE 2

**Data:** 2026-06-12
**Versão:** v0.1.0 bootstrap
**Status:** Draft — aguardando outputs da FASE 1

---

## Visão Geral

O Akasha opera em 3 camadas invisíveis ao usuário e 1 camada visível:

```
[DADOS DO USUÁRIO]
    ↓
[CAMADA 1: OS 5 MAPAS]  (interna, invisível)
  - AstrologyMap
  - KabalisticMap
  - TantricMap
  - OduBirth
  - AkashicHologram (agregação dos 4 acima)
    ↓
[CAMADA 2: MOTOR DE SÍNTESE]  (interna, invisível)
  - aggregateHologram()    → agrega 5 mapas → 6 HologramDimensions
  - buildAkashaSynthesis() → deriva narrativas por área
  - deriveSexualArchetype() → sexualidade profunda
  - deriveDailyTransitOverlay() → trânsito diário
    ↓
[CAMADA 3: LINGUAGEM UNIFICADA]  (interna, invisível)
  - Vocabulário Akasha: frequências (shadow/gift/siddhi)
  - Sistema de tipo: 9 tipos derivados de Odu family + Tantric body
  - Estratégia + Autoridade (HD-inspired)
  - 6 áreas de vida cobrindo Maslow completo
    ↓
[CAMADA VISÍVEL: UI AKASHA]
  - Usuário vê: UNA narrativa Akasha por área de vida
  - Usuário NUNCA vê: Cabala, Numerologia, Odu, Astrologia como fontes separadas
```

---

## Os 5 Mapas — Estrutura e Domínio

### Mapa 1: AstrologyMap
**Domínio:** Posições planetárias, casas, elementos, modalidade

**Dados disponíveis:**
- `planets[]` — planeta, signo, grau, casa
- `houses[]` — casa, signo, grau
- `ascendant` — signo ascendente
- `midheaven` — medium coeli (MC)
- `lunarPhase` — fase lunar
- `elementalChart` — fogo/terra/ar/água (contagem)
- `modality` — cardinal/fixed/mutable (contagem)
- `quality` — individual/relational/transform/social/traditional
- `dominantPlanet`, `signRuler`, `houseRuler`

**Domínio de vida que alimenta:**
- Vitalidade (elementalChart, dominantPlanet → saúde/corpo/energia sexual)
- Conexões (Venus, Lua, Lilith, casas 5/7 → amor, vínculos, sexualidade)
- Carreira (Midheaven, Júpiter, casas 2/6/10 → prosperidade, trabalho)
- Ori/Mente (Odu number/name → intuição, propósito)
- Missão (Life path, mission, arcana → destino, vocação)
- Sombras (Saturno, Plutão, karmic → desafios, bloqueios)

---

### Mapa 2: KabalisticMap
**Domínio:** Numerologia cabalística (caminho de vida, expressão, motivação)

**Dados disponíveis (produzidos):**
- `lifePath` + `lifePathMaster`
- `mission`
- `expression` + `expressionMaster`
- `motivation`, `impression`, `nativeDayNumber`
- `challenges` — first, second, main, last
- `pinnacles[]` — first, second, third, fourth
- `karmicLessons[]`, `karmicDebts[]`
- `rulingArcana` — lifePath e expression com major arcana
- `lifeCycles` — first, second, third
- `personalCycles` — personalYear/Month/Day

**⚠️ Campos PROVISIONAIS (nunca gerados por buildKabalisticMap):**
- `soulUrge`, `personality`, `hiddenPassion`, `maturity`, `balance`
- `vibrationalNumber`, `destinyNumber`, `chaliceNumber`
- `nameHistory`, `minorCycles`

**Domínio de vida que alimenta:**
- Carreira (lifePath, expression → vocação, talento expressivo)
- Missão (mission → propósito de vida)
- Sombras (karmicLessons, karmicDebts, challenges → feridas kármicas)

---

### Mapa 3: TantricMap
**Domínio:** Corpos tântricos, alma, destino

**Dados disponíveis (produzidos):**
- `soul` + `soulBody` + `soulDescription`
- `karma` + `karmaBody` + `karmaDescription`
- `divineGift` + `divineGiftBody` + `divineGiftDescription`
- `destiny`, `tantricPath`
- `bodies` — fisico, pranic, emocional, mental, espiritual (cada um com número, descrição, qualidades)

**⚠️ Campos PROVISIONAIS (nunca gerados):**
- `sacredGeometry`, `chakraStates`, `energyMatrix`, `elementBalances`, `kundaliniState`

**Domínio de vida que alimenta:**
- Vitalidade (bodies.pranic, bodies.fisico → energia vital, saúde)
- Conexões (soul bond → estilo de amar)
- Carreira (divineGift → talento inerente)
- Ori/Mente (mental body → modo de pensar)
- Missão (destiny, tantricPath → caminho de vida)

---

### Mapa 4: OduBirth
**Domínio:** Odu de nascimento (tradição iorubá)

**Dados disponíveis:**
- `oduNumber`, `oduName`
- `orixaRegency[]`
- `elementalForce`
- `lifeLesson`
- `birthOdu[]` — array de {dayOfBirth, oduNumber, meaning}

**⚠️ Campos PROVISIONAIS (marcados @provisional no código):**
- `sign`, `animal`, `owner`, `ebwe`, `message`, `initiationPath`, `prohibitions`

**Correspondência com Mapa 4 (OriCabecaQuizilas):**
- Odu → tipo Akasha (9 tipos derivados de Odu family + Tantric body)
- Odu → autoridade Akasha
- Odu → estratégia de decisão
- Orixá regente → prática espiritual

---

### AkashicHologram — A Agregação dos 5 Mapas

O `AkashicHologram` já existe como conceito de agregação. Cada dimensão contém:

```typescript
interface HologramDimension {
  title: string;       // "Vitalidade & Energia"
  chakra: string;       // "1º Muladhara (Básico)"
  color: string;       // "#FF3B30"
  keyData: {           // dados agregados dos 5 mapas
    [key: string]: any;
  }
}
```

**6 Dimensões do Holograma:**
| Dimensão | Chakra | Cor | Dados-chave |
|----------|--------|-----|-------------|
| vitalidadeEnergia | Muladhara (1º) | Vermelho | elementalChart, dominantPlanet, pranicBody, physicalBody |
| conexoesAmor | Anahata (4º) | Verde/Rosa | Venus, Lua, Lilith, casas 5/7 |
| carreiraProsperidade | Manipura (3º) | Amarelo | Midheaven, Júpiter, casas 2/6/10, lifePath, expression |
| oriCabecaQuizilas | Ajna (6º) | Índigo | Odu, orixá, lifeLesson, proibições |
| missaoDestino | Sahasrara (7º) | Violeta | LifePath, mission, arcana, destiny, tantricPath |
| desafiosSombras | Svadhisthana (2º) | Laranja | Saturno, Plutão, karmicLessons, challenges |

---

## Cadeia de Correlação entre os 5 Mapas

### Correlação 1: Odu → Tipo Akasha (9 Tipos)
```
Odu family + Tantric body → Akasha Type
```
O `deriveAkashaType()` em synthesis-engine.ts já implementa isso.

### Correlação 2: Life Path + Odu → Estratégia
```
KabalisticMap.lifePath + Odu.oduFamily → AkashaStrategy
```

### Correlação 3: Venus (Astrology) + Soul (Tantric) + ElementalForce (Odu) → Sexualidade
```
AstrologyMap.Venus + TantricMap.soul + Odu.elementalForce → SexualArchetype
```
O `deriveSexualArchetype()` já implementa isso (F-225).

### Correlação 4: ElementalChart (Astrology) + Bodies (Tantric) + LifePath (Kabala) → Vitalidade
```
AstrologyMap.elementalChart + TantricMap.bodies + KabalisticMap.lifePath → Vitalidade
```

### Correlação 5: Midheaven + LifePath + DivineGift → Carreira
```
AstrologyMap.midheaven + KabalisticMap.lifePath + TantricMap.divineGift → Carreira
```

---

## Problemas Encontrados na Base de Conhecimento

### P1: UI expõe os 5 mapas separadamente
**Arquivo:** `AkashaLifeAreasDashboard.tsx` — componente `PillarContribution`
**Problema:** Mostra "Cabala", "Tantra", "Odus", "Astrologia" como colunas separadas
**Solução:** Remover `PillarContribution`, mostrar apenas output Akasha unificado

### P2: Interpretações superficiais — cadeia de raciocínio ausente
**Problema:** As funções `buildKabalaNarrative`, `buildAstrologyNarrative`, etc. em `narrative-generator.ts` geram texto descritivo sem explicar o "porquê"
**Solução:** Implementar cadeia de raciocínio explícita por área de vida

### P3: Sistema de frequência sem validação
**Problema:** shadow/gift/siddhi (Gene Keys inspired) implementado sem base validada na literatura
**Solução:** Validar contra Gene Keys original (Richard Rudd) na FASE 1

### P4: life-areas módulo ausente
**Arquivo:** Known Issue no CHANGELOG v0.0.9
**Problema:** `src/lib/domain/mapa/life-areas.ts` não existe
**Solução:** Implementar após validação de fundações

### P5: Campos provisionais misturados com dados reais
**Problema:** Diversos campos marcados `@provisional` existem no tipo mas não são produzidos
**Solução:** Na FASE 3, fazer curadoria: separar campos reais de stubs

---

## Prioridade de Implementação da Síntese

1. **Unificar UI** — eliminar `PillarContribution`, usuário vê só Akasha
2. **Cadeia de raciocínio explícita** — cada insight vem com "isso porque..."
3. **Profundidade prática** — responder "o que isso significa para mim HOJE"
4. **Frequência validada** — ajustar shadow/gift/siddhi contra pesquisa FASE 1
5. **Curadoria de dados** — separar campos reais de provisionais

---

## Vocabulário Unificado Akasha (proposto)

| Conceito | Termo Akasha | Tradição original |
|----------|-------------|-------------------|
| Life Path | Caminho de Vida | Kabala |
| Destiny Number | Número de Destino | Kabala |
| Soul | Alma | Tantra |
| Divine Gift | Dom Divino | Tantra |
| Odu | Odu | Ifá |
| Planetary Position | Frequência Planetária | Astrologia |
| Shadow | Sombra | Gene Keys |
| Gift | Dom | Gene Keys |
| Siddhi | Siddhi | Gene Keys/Hinduismo |
| Chakra | Centro Energético | Hinduismo/Tantra |
| Orixá | Orixá Regente | Iorubá |

**Princípio:** O usuário nunca vê a coluna "Tradição". Cada conceito é apresentado como conceito Akasha com nome próprio.
