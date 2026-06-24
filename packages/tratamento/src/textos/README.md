# Textos Terapêuticos — Wave 5 Synthesis Engine

**Projeto:** Akasha Portal (Cabala dos Caminhos)  
**Data de geração:** 2026-06-23  
**Gerado por:** subagente Wave 5 prep (MiniMax M3)  
**Para revisão:** Gabriel (Zelador)

## Sumário

- **Total de arquivos:** 352
- **alucinacao_score médio:** 0.92
- **% com requires_professional_review:** 3.1%
- **Categorias:** 10

## Estilo e guardrails

- **PT-BR only** (Brazilian Portuguese)
- **Therapeutic-holistic universalist** (sem termos religiosos-cult, sem diagnóstico)
- **'Menos é mais'**: 1-3 frases por texto, verbos diretos ("Faça X", "Evite Y")
- **ADR 0002 guardrails respeitados**: sem "Human Design", "Gene Keys", "BodyGraph"
- **Anti-alucinação**: cada arquivo cita research-medicina-tradicional §X linha Y OU research-numerologia-psicanalise §X linha Y
- **No diagnosis**: nunca afirma "você tem X" — usa "pode haver sinais de... consulte profissional"

## Estrutura

| Categoria | Diretório | Arquivos |
|---|---|---|
| preceito | `01-odu-preceitos/` | 80 |
| quisila | `02-odu-quisilas/` | 80 |
| oriquente | `03-odu-oriquente/` | 48 |
| orifrio | `04-odu-orifrio/` | 48 |
| chakra_pratica | `05-chakra-praticas/` | 21 |
| elemento_banho | `06-elemento-banhos/` | 8 |
| caminho_essencia | `07-caminho-essencia/` | 22 |
| caminho_sombra | `08-caminho-sombra/` | 22 |
| camada_prompt | `09-camadas-7/` | 7 |
| pergunta_clinica | `10-perguntas-clinicas/` | 16 |
| **Total** | | **352** |

## Por Odu

| Odu | Arquivos |
|---|---|
| Ogbe (1) | 16 |
| Oyeku (2) | 16 |
| Iwori (3) | 16 |
| Odi (4) | 16 |
| Irosun (5) | 16 |
| Owonrin (6) | 16 |
| Obara (7) | 16 |
| Okanran (8) | 16 |
| Ogunda (9) | 16 |
| Osa (10) | 16 |
| Ika (11) | 16 |
| Oturupon (12) | 16 |
| Otura (13) | 16 |
| Irete (14) | 16 |
| Ofun (15) | 16 |
| Obe (16) | 16 |

## Por Chácra

| Chácra | Arquivos |
|---|---|
| Raiz (Muladhara) | 3 |
| Sacral (Svadhisthana) | 3 |
| Plexo Solar (Manipura) | 3 |
| Cardíaco (Anahata) | 3 |
| Laríngeo (Vishuddha) | 3 |
| Terceiro Olho (Ajna) | 3 |
| Coronário (Sahasrara) | 3 |

## Quick start (uso no Synthesis Engine)

```ts
// Carregar todos os textos de um Odu específico
import preceitos from './01-odu-preceitos/odu-01-ogbe-preceito-01.json';
import quisilas from './02-odu-quisilas/odu-01-ogbe-quisila-01.json';

// Filtrar por categoria para Camada 4 (Quisilas) ou Camada 2 (Práticas)
const quisilasDoOdu1 = Object.values<{categoria: string, odu: string}>
  .filter(t => t.categoria === 'quisila' && t.odu.startsWith('Ogbe'))
  .map(t => t.texto);
```

## Pesquisa de origem (citations)

Todos os textos citam um dos dois research reports canônicos:

1. **research-medicina-tradicional-2026-06-23.md** — 16 Odu canônicos + cristais + ervas
   - Path: `.hermes/plans/research-medicina-tradicional-2026-06-23.md`
   - URL open-source: https://pt.wikipedia.org/wiki/If%C3%A1
2. **research-numerologia-psicanalise-2026-06-23.md** — 22 caminhos de vida + psicanálise + perguntas clínicas
   - Path: `.hermes/plans/research-numerologia-psicanalise-2026-06-23.md`
   - URL open-source: https://pt.wikipedia.org/wiki/Numerologia_cabal%C3%ADstica

## Disclaimer terapêutico

> Estes textos são baseados em tradições terapêuticas públicas (fitoterapia brasileira, numerologia cabalística, psicanálise open-source) e NÃO substituem acompanhamento médico, psicológico ou psiquiátrico profissional. Em caso de gestação, lactação, uso contínuo de medicamentos ou condições crônicas, consulte um profissional de saúde antes de iniciar qualquer prática. Para uso litúrgico (Pilar 4): supervisionar com terreiro de Ifá/Candomblé.

## Filtro `requires_professional_review: true`

Total: **11** arquivos (3.1% do corpus). Padrão típico: perguntas clínicas sobre dissociação/segregredo familiar, práticas com ervas com contraindicação (boldo, arruda), e camadas de diagnóstico/psicanálise. Revisão por Gabriel antes de uso em sessão.

## Manutenção

- Re-gerar corpus: `python3 _generate.py` (executa no monorepo root)
- Adicionar preceitos: editar `ODU_PRECEITOS[odu_num]` em `_generate.py`
- Mudar estilo: ajustar funções `gen_*()` preservando schema JSON
- Validar schema: ver `index.json` (categoria + stats)

---

**Wave 5 prep — READ-ONLY até revisão do Gabriel.**
