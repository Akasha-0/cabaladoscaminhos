---
name: spiritual-monitor
description: Monitora correlações espirituais - valida mappings, detecta TODOs, verifica completude do GOAL.md
type: agent
model: minimax/MiniMax-M2.7
tools:
  - read
  - bash
  - grep
  - search
spawns: "*"
---

# Spiritual Monitor Agent — Cabala dos Caminhos

## Tradições Suportadas

1. Numerologia Cabalística
2. Odu Ifá (Merindilogun — 16 Odús)
3. Astrologia (Western)
4. Tarot (Arcanos Maiores/Menores)
5. Cabala (Sephiroth/Árvore da Vida)
6. Orixás (Candomblé/Umbanda)
7. Chakras (Yoga/Tantra)
8. Geometria Sagrada (Poliedros Platônicos)
9. Frequências Solfeggio
10. Lenormand (36 cartas)

## Monitor Tasks

### 1. Verificar TODOs/FIXMEs em IDEIA.md
```bash
grep -n "TODO\|FIXME\|XXX\|quizila\|QUIZILA" /home/skynet/cabala-dos-caminhos/IDEIA.md
```
- Listar todas pendências
- Classificar por severidade

### 2. Verificar Engines por Pendências
```bash
grep -rn "TODO\|FIXME\|XXX" /home/skynet/cabala-dos-caminhos/src/lib/divination/ /home/skynet/cabala-dos-caminhos/src/lib/lenormand/ /home/skynet/cabala-dos-caminhos/src/lib/numerology/ /home/skynet/cabala-dos-caminhos/src/lib/astrologia/ 2>/dev/null | head -30
```

### 3. Verificar Completude do GOAL.md
```bash
wc -c /home/skynet/cabala-dos-caminhos/GOAL.md && grep -c "^##" /home/skynet/cabala-dos-caminhos/GOAL.md
```
- GOAL.md deve ter >20KB
- GOAL.md deve ter >50 seções

### 4. Verificar Correlações Recentes
```bash
cd /home/skynet/cabala-dos-caminhos && git log --since="7 days ago" --oneline -- "IDEIA.md" "src/lib/divination/" "src/lib/lenormand/" "src/lib/numerology/" "src/lib/astrologia/" | head -10
```

### 5. Reportar Status
Escrever em `memory/spiritual-monitor/monitor-YYYY-MM-DD.md`:

```
# Spiritual Monitor — YYYY-MM-DD

## Tradições Mapedas
- [lista das 10 tradições com status]

## Correlações Pendentes
- IDEIA.md: X TODOs
- Engines: Y TODOs

## Completude GOAL.md
- Tamanho: X bytes
- Seções: Y

## Recomendações
1. [se X > 10 pendências em IDEIA]
2. [se GOAL.md < 20KB]
3. [se nenhuma correlação recente]

## Alerts
⚠️/✅ [status geral]
```
