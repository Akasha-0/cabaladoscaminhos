# Mapeamentos Akasha — Sistema de Tradução Simbólica

## Visão Geral

Este diretório contém tabelas de mapeamento que traduzem símbolos de cada tradição espiritual (Cabala, Tantra, Astrologia, I Ching, Odu) em **primitivos universais** — conceitos fundamentais que o sistema Akasha consegue processar, relacionar e gerar insights sobre.

O objetivo é construir uma rede semântica onde qualquer símbolo reconhecido por qualquer tradição possa ser conectado ao mesmo primitivo subjacente, viabilizando a análise unificada do mapa astral/espiritual de uma pessoa.

## Arquitetura de um Mapeamento

Cada arquivo `*.json` cobre uma tradição. A estrutura é:

```json
{
  "_meta": {
    "version": "0.1.0",
    "seeded": "2026-06-17",
    "description": "Mapeamento de símbolos da tradição X para primitivos universais"
  },
  "<símbolo da tradição>": {
    "primitivo": "<primitivo universal>",
    "intensidade": 0-10,
    "polaridade": "luz | sombra | ambas",
    "fonte": "<referência bibliográfica ou tradicional>"
  }
}
```

## Formato de Cada Entrada

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `primitivo` | string | Conceito fundamental universal. Ver lista de primitivos abaixo. |
| `intensidade` | integer 0–10 | Peso energético do símbolo na psique — 0 = ausente ou negligível, 10 = totalmente dominante |
| `polaridade` | enum | `luz` = expressão elevada/iluminada, `sombra` = expressão bloqueada/tóxica, `ambas` = pode expressar-se em qualquer polo |
| `fonte` | string | Referência que valida o mapeamento — nunca inventar sem fonte |

## Primitivos Universais (vocabulário comum)

| Primivito | Domínio |
|-----------|---------|
| `Poder` | Autoridade, força vital, domínio, liderança |
| `Sabedoria` | Intuição, conhecimento profundo, discernimento |
| `Amor` | União, receptividade, compaixão, conexão |
| `Transformacao` | Metamorfose, morte e renascimento, alquimia interior |
| `Expansao` | Crescimento, abertura, ultrapassar limites |
| `Conexao` | Ligação, relação, pertencimento, comunidade |
| `Movimento` | Ação, dinâmica, mudança, velocidade |
| `Ordem` | Estrutura, lei, organização, ritmo |
| `Protecao` | Defesa,边界,guarda, limites |
| `Visao` | Percepção, claridade, profecia, futuro |
| `Equilibrio` | Harmonia, centro, yin-yang, mediação |
| `Liberacao` | Soltar, abandonar, surrender, vazio |

> ⚠️ **Regra de Governança**: Nunca inventar um mapeamento sem fonte verificável. Cada entrada deve ter uma `fonte` que remeta a uma autoridade tradicional (textos sagrados,commentários aceitos, tradição oral documentada). Mapeamentos sem fonte são标记 `fonte: "[pendente]"` e não devem ser usados pelo sistema para gerar insights.

## Regras de Expansão

1. **Cada nova entrada precisa de fonte.** Sem fonte = sem merge.
2. **Consenso entre tradições** fortalece a entrada. Se 2+ tradições convergem no mesmo par símbolo→primitivo, a confiança aumenta.
3. **Revisão por pares.** Mapeamentos criados por agentes devem ser validados antes de entrar na seed.
4. **Versionamento.** O `_meta.version` segue semver. Quebra de formato incrementa major.
5. **Pendências visíveis.** Entradas com fonte `[pendente]` são expostas no diff mas não usadas pelo motor.

## Tradições Cobertas

- `cabala.json` — Caminhos de Vida, Almas, Personas, etc. (tradição judaico-cabalística)
- `tantra.json` — Corpos, Chakras, Nadis, Gunas (tradição tântrica hindu/tibetana)
- `astrologia.json` — Signos, planetas, casas, aspectos (astrologia occidental)
- `iching.json` — Hexagramas, linhas, mutações (I Ching / Yi Jing)
- `odu.json` — Odu Ifá, Ori, Erindiz (tradição Yoruba/Ifá)

## Fluxo de Iteration

```
1. Levantamento → símbolos identificados no mapa do usuário
2. Consulta → mapeamentos/*.json para encontrar primitivos
3. Match parcial? → agente propõe novo par (símbolo → primitivo)
4. Proposta → revisada com fonte documentada
5. Merge → entra na próxima versão do arquivo relevante
6. Feedback loop → uso real confirma ou refuta o mapeamento
```
