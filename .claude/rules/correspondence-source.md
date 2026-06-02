---
paths:
  - "IDEIA.md"
  - "src/lib/divination/**"
  - "src/lib/lenormand/**"
  - "src/lib/numerology/**"
  - "src/lib/astrology/**"
  - "src/lib/correlation/**"
---

# Correspondence Source Rule — Regra de Ouro do Projeto

## A regra

**Toda correspondência esotérica NO CÓDIGO ou em IDEIA.md DEVE ter fonte documentada em tradição suportada.**

## Tradições suportadas (de CLAUDE.md)

- Numerologia Cabalística
- Odu Ifá (Merindilogun, 16 Odús)
- Astrologia
- Tarot (22 Maiores + 56 Menores)
- Cabala (10 Sephiroth, 22 Caminhos)
- Orixás (12 principais)
- Chakras (7)
- Geometria Sagrada
- Frequências Solfeggio (9)

## Fontes aceitáveis (em ordem de preferência)

1. **`IDEIA.md` do projeto** — já documentado, usar como referência
2. **`AGENTS.md`** — regras comportamentais e referências às tradições
3. **Textos clássicos** identificáveis:
   - Sepher Yetzirah (Cabala)
   - Tree of Life (Regardie, Mathers)
   - 777 (Crowley)
   - Numerologia Pitagórica / Chaldeana / Cabalística
   - I Ching (Wen Wang Gua)
   - Odu Ifá (Ifa Lite, Ibat Owoni)
   - Tarô de Marselha / Rider-Waite / Thoth
4. **Tradição oral/escrita moderna verificável** (livro, autor, edição)

## Como adicionar uma correspondência nova

```bash
# 1. ANTES de tocar IDEIA.md ou código, consultar:
grep -rE "<keyword>" /home/skynet/cabala-dos-caminhos/IDEIA.md
grep -rE "<keyword>" /home/skynet/cabala-dos-caminhos/src/lib/

# 2. Se NÃO existe, documentar primeiro em IDEIA.md:
## Nova correspondência: <X> ↔ <Y>
- Fonte: <livro, autor, página, edição>
- Tradição: <Pitagórica / Cabalística / Hermética>
- Data de adição: <YYYY-MM-DD>
- Adicionado por: <nome/agent>

# 3. DEPOIS codificar em src/lib/<engine>.ts
```

## Quando rejeitar uma proposta

❌ **Rejeitar se:**
- "X corresponde a Y porque sim" — sem tradição
- Mistura tradições incompatíveis sem base (ex: runas + orixás)
- Números/forças inventados (ex: "frequência 432 Hz cura tudo" — afirmação esotérica sem fonte específica)
- Correspondência nova que contradiz correspondência já documentada em IDEIA.md (revisar IDEIA.md primeiro)

## Em caso de dúvida

**Use o agent `cabala-corr-validator`** (em `.claude/agents/`) — ele verifica a fonte antes de aprovar.
