# Arquitetura do Motor Akasha

**Data:** 2026-06-12
**Versão:** v0.1.0 bootstrap

---

## Arquitetura Atual (existente)

### Entrada → Saída
```
buildAkashaSynthesis(
  AstrologyMap,
  KabalisticMap,
  TantricMap,
  OduBirth,
  AkashicHologram
) → AkashaSynthesis
```

### AkashaSynthesis output:
```typescript
interface AkashaSynthesis {
  typeProfile: AkashaTypeProfile;    // 9 tipos derivados de Odu + Tantric
  areas: Record<LifeArea, AreaNarrative>;  // 6 áreas de vida
  frequency: FrequencyLevel;          // shadow | gift | siddhi
  frequencyScore: number;            // 0-100
  sexualArchetype: SexualArchetype; // F-225
  dailyDecision: DailyDecision;     // estratégia + autoridade
  dailyTransit: DailyTransitOverlay; // F-224
  synthesisParagraph: string;         // parágrafo unificado
  activeSequence: 'vitality' | 'heart' | 'purpose';
}
```

---

## Arquitetura Proposta (Evolução)

### Camada 1: Coleta de Dados (existing — não mudar)
- `calculateBirthChart()` → AstrologyMap
- `buildKabalisticMap()` → KabalisticMap
- `buildTantricMap()` → TantricMap
- `calculateBirthOdu()` → OduBirth
- `aggregateHologram()` → AkashicHologram

### Camada 2: Síntese Narrativa (a evoluir)

#### 2a. Derivation Layer — derive facts from each map per area
```
deriveVitalidadeEnergia(AstrologyMap, KabalisticMap, TantricMap, OduBirth, AkashicHologram)
  → facts: string[]  // fatos concretos derivados de cada mapa
  → frequency: { level: FrequencyLevel, intensity: 1|2|3 }
  → chakraState: 'balanced' | 'overactive' | 'underactive'
```

#### 2b. Correlation Layer — correlações entre os 5 mapas
```
correlateVitalidadeEnergia(facts_from_all_maps)
  → correlations: Array<{ source: string, target: string, correlation: string }>
  → dominantFactor: string
  → practicalImpact: string  // "isso significa que você..."
```

#### 2c. Synthesis Layer — une correlações em narrativa prática
```
synthesizeVitalidadeEnergia(correlations, area_context)
  → headline: string              // "Seu corpo é seu instrumento mais poderoso"
  → narrative: string              // narrativa prática de 2-3 parágrafos
  → chainOfReasoning: string[]    // cadeia de raciocínio explícita
  → dailyPractice: string          // prática konkreet de HOJE
  → avoidPattern: string          // o que NÃO fazer
```

### Camada 3: Tipo Akasha (existing — evoluir)
- Manter os 9 tipos derivados
- Adicionar descrição prática por tipo: "como seu tipo se manifesta no amor, no trabalho, na sexualidade"
- Cadeia de raciocínio: "seu tipo é X porque seu Odu é Y e seu Tantric body é Z"

### Camada 4: Sexualidade Profunda (existing — evoluir)
- `deriveSexualArchetype()` já existe
- Adicionar cadeia de raciocínio: "seu arquétipo é X porque Venus está em Y e seu soul number é Z"
- Adicionar interpretation prática: "como isso se manifesta na sua vida sexual"

### Camada 5: Decisão Diária (existing — evoluir)
- `deriveDailyDecision()` já existe
- Adicionar justificativa: "a decisão de HOJE é X porque [fator cósmico] está ativo"
- Conectar com tipo Akasha e área mais intensa do dia

---

## Plano de Implementação (FASE 3)

### Ciclo 1: Unificação da UI
- Remover `PillarContribution` do dashboard
- Criar componente `AkashaAreaCard` que mostra só output Akasha
- Manter dados por trás, apenas não mostrar na UI

### Ciclo 2: Cadeia de Raciocínio
- Implementar `chainOfReasoning` no AreaNarrative
- Cada insight inclui: "isso porque [fator1] + [fator2] = [conclusão]"

### Ciclo 3: Profundidade Prática
- Implementar campo `practicalToday` em cada area
- Resposta: "o que fazer HOJE based on current transit"

### Ciclo 4: Frequência Validada
- Ajustar shadow/gift/siddhi com base na pesquisa FASE 1
- Conectar com dados reais dos mapas

---

## Notas de Implementação

### Evitar duplicação
O motor de síntese JÁ existe em `synthesis-engine.ts`. A evolução deve:
1. ADICIONAR campos aos tipos existentes (AreaNarrative, AkashaSynthesis)
2. EVITAR criar novos motores paralelos
3. Manter backward compatibility com UI existente

### Mobile-first
- Área de vida = accordion/expansion na mesma página
- NÃO criar página nova por área
- Usar modal para detalhes profundos se necessário

### Testes
- `buildAkashaSynthesis()` com dados mock deve continuar funcionando
- Adicionar testes para novos campos
- Testar com dados reais (se disponíveis)
