# ADR-025: AkashaNarrativeEngine — Síntese Unificada de 5 Pilares

**Status:** Proposto
**Data:** 2026-06-12
**Decisor:** Sistema Akasha — Evolution Initiative

---

## Contexto

### O problema

O Sistema Akasha tinha 5 mapas técnicos separados. A experiência do usuário era:

1. "Seu número Cabalístico é 11" → sem interpretação prática
2. "Seu Odu é Ogbe" → sem tradução para a vida
3. "Vênus em Escorpião" → sem conselho prático

**Gene Keys** resolveu isso com Shadow→Gift→Siddhi.
**Human Design** resolveu isso com Strategy + Authority.
**AstroLink** resolveu isso com interpretações longas em 2ª pessoa.

O Akasha não tinha isso. Tinha 5 silos e informação rasa.

### Competitors

| App | Profundidade | Decisão | Narrativa |
|---|---|---|---|
| AstroLink | ★★★★★ | Ritual diário | 2ª pessoa, PT-BR |
| Numerologia Redescubra-se | ★★★★ | Pinnacles/ciclos | 3ª pessoa |
| Human Design | ★★★★ | Strategy+Authority | 2ª pessoa |
| Gene Keys | ★★★★★ | Shadow work | 2ª pessoa |
| **Akasha (antes)** | ★☆☆☆☆ | Nenhuma | 3ª pessoa, técnica |

---

## Decisão

### O que foi implementado

**`AkashaNarrativeEngine`** — motor de síntese que:

1. Lê os 5 mapas (Astrologia, Cabala, Tantra, Odus, I Ching)
2. Deriva 6 áreas de vida (Maslow + Akasha):
   - **Vitalidade & Energia** — corpo, saúde, sexualidade, energia vital
   - **Conexões & Amor** — relações, família, vínculos
   - **Carreira & Prosperidade** — finanças, vocação, abundância
   - **Ori, Cabeça & Quizilas** — intuição, propósito, direção
   - **Missão & Destino** — transcendência, Calling
   - **Desafios & Sombras** — karma, padrões inconscientes, transformação

3. Para cada área, gera:
   - **Frequência** (Shadow / Dom / Siddhi)
   - **Intensidade** (1-3 — urgência da transformação)
   - **Padrão Shadow** — o que a pessoa vive quando inconsciente
   - **Sintomas Shadow** — manifestações concretas
   - **Padrão Dom** — o que ela pode se tornar
   - **Forças do Dom** — pontos fortes concretos
   - **Contribuição de cada pilar** — o que Cabala/Tantra/Odus/Astrologia dizem sobre esta área
   - **Conselho prático** — uma ação concreta para HOJE
   - **Ritual diário** — personalizado por elemento (terra/água/fogo/ar/éter/luz)
   - **Pergunta de transformação** — auto-reflexão profunda

4. **Decisão diária** (Strategy + Authority):
   - Estratégia: `act | wait | observe`
   - Explicação da estratégia
   - Autoridade: `emotional | sacral | splenic | mental`
   - Pergunta da autoridade
   - Recomendação e evitamento

5. **Síntese geral** — 3-5 frases em 2ª pessoa resumindo o perfil

### Inspiração

- **Gene Keys**: Shadow→Gift→Siddhi como modelo de frequência
- **Human Design**: Strategy + Authority como framework de decisão
- **AstroLink**: Interpretação em 2ª pessoa, profundo, PT-BR

---

## Arquitetura

```
5 mapas brutos
    │
    ▼
aggregateHologram()   ← agrega dados dos 5 mapas em 6 áreas
    │
    ▼
buildAkashaSynthesis() ← deriva narrativas por área de vida
    │
    ├── areas: Record<LifeArea, AreaNarrative>
    │       ├── shadowPattern / giftPattern
    │       ├── pillarContribution (cabala/tantra/odus/astro)
    │       ├── practicalAdvice
    │       ├── dailyRitual
    │       └── transformationPrompt
    │
    ├── dailyDecision: DailyDecision (Strategy + Authority)
    │
    ├── synthesisParagraph: string
    │
    └── akashaProfile: { dominantFrequency, overallScore, transformationStage, activeSequence }

    ▼
buildDailyContent()   ← daily-engine.ts chama o motor de síntese
    │
    ▼
API /api/akasha/daily  ← expõe synthesis no JSON response
    │
    ▼
useAkashaSynthesis hook  ← React busca dados
    │
    ▼
AkashaLifeAreasDashboard ← UI mobile-first (6 áreas expandíveis)
```

---

## Arquivos criados/modificados

| Arquivo | Mudança |
|---|---|
| `lib/application/akasha/synthesis-engine.ts` | **NOVO** — Motor de síntese narrativa |
| `lib/application/akasha/daily-engine.ts` | **MODIFICADO** — Adiciona `synthesis?: AkashaSynthesis` ao retorno |
| `app/api/akasha/daily/route.ts` | **MODIFICADO** — Expõe `synthesis` no JSON response |
| `components/akasha/dashboard/hooks/useAkashaSynthesis.ts` | **NOVO** — Hook React para buscar síntese |
| `components/akasha/dashboard/AkashaLifeAreasDashboard.tsx` | **NOVO** — UI mobile-first das 6 áreas |
| `components/akasha/dashboard/Dashboard.tsx` | **MODIFICADO** — Integra AkashaLifeAreasDashboard como primeira seção |
| `Plans.md` | **MODIFICADO** — PLN-019 registrado |

---

## Padrões estabelecidos

### Nomenclatura de frequência

- `shadow` → vermelho → "Padrão inconsciente de sofrimento"
- `gift` → verde → "Genialidade e amor inato"
- `siddhi` → roxo → "Transcendência do padrão"

### Estratégias

- `act` → verde → área em Dom + intensidade baixa → "Aja hoje nesta área"
- `wait` → laranja → área em Shadow + intensidade alta → "Não force — espere"
- `observe` → azul → equilíbrio → "Observe sem julgar"

### Hierarquia de áreas (Maslow + Akasha)

1. **Vitalidade** (base fisiológica)
2. **Conexões** (relacionamentos)
3. **Carreira** (recursos e segurança)
4. **Ori** (propósito e direção)
5. **Missão** (auto-atualização)
6. **Desafios** (transformação — permeia todas)

---

## Tradeoffs

### O que ganhamos

- Narrativa de vida (não dados técnicos)
- Decisão prática diária (Strategy + Authority)
- 6 áreas de vida unificadas (não 5 mapas separados)
- 2ª pessoa — o usuário se reconhece no texto
- Pillar contribution — explica como cada tradição contribui para cada área

### O que ainda falta

- **F-226 Narrativa** — integração do LLM para interpretação dinâmica
- **F-224 Meu Dia** — conteúdo diário completo por área
- **F-225 Sexualidade** — interpretação profunda de sexualidade (Tantra + Astrologia + Odus)
- **F-227 Authority** — framework de decisão completo baseado nos 5 pilares
- **F-228 Mobile Strategy** — PWA installable, gestos, push notifications

### Limitações do engine atual

- Funções de tradução (`getVenusLoveStyle`, `getLifePathCareer`, etc.) são tabelas estáticas
- Para interpretação profunda real, um LLM com RAG seria necessário (F-226)
- O motor é determinístico — não usa MiniMax ainda (orçamento esgotado)
- I Ching não está integrado na síntese (só no daily-content legado)

---

## Histórico de revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-06-12 | Akasha System | Versão inicial |

---

## Referências

- Gene Keys: https://genekeys.com/how-to-read-your-profile/
- Human Design System: https://humandesignsystem.com/synthesis/HDSynthesisPremises.php
- AstroLink: https://www.astrolink.com.br
- Gene Keys Shadow/Gift/Siddhi: https://genekeys.com/free-profile/
