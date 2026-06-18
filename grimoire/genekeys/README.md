# GeneKeys — Akasha Integration Research

**Autor:** Akasha Research Team
**Data:** 2026-06-18
**Versão:** 0.92.0

---

## Visão Geral

O **GeneKeys** é um sistema de autoconhecimento criado por Richard Rudd (2000), construído sobre a tradição milenar do I Ching. O sistema opera em 3 níveis:

1. **Shadow (Sombra)** — padrões de medo e bloqueio (24 Qualidades)
2. **Gift (Dádiva)** — talentos e capacidades inatas (24 Skills)
3. **Sidhi** — estados de essência análogos aos siddhis do yoga (24 Realizações)

O espectro de cada GeneKey vai do Shadow ao Sidhi através de 56 Codons — criando um caminho de transformação pessoal de 24 estágios.

---

## 3 Correlações Fundamentais com Akasha

### 1. GeneKey 1 "The Seed" ↔ Odu Ogbe ↔ Cabala Keter

- **GeneKey 1** (Sombra: Survivor Guilt → Dádiva: Honesty → Sidhi:。清純 Innocence)
- **Ogbe (Odu-1):** A luz que ilumina o caminho. Vitória, criação, renascimento. Regido por Oxalá.
- **Keter (Cabala):** A coroa. Vontade divina, propósito de alma.
- **Unificação Akasha:** O primeiro impulso criativo do universo manifesta-se como "semente" em todos os 3 sistemas. O caminho da vida começa com Ogbe/Keter/Seed — o momento antes da forma. A interface Akasha deve mostrar "Camino da Vida: Semente" como síntese dos 3.

### 2. GeneKey 11 "Peace" ↔ Odu Ejiokô ↔ Tantra Sahasrara

- **GeneKey 11** (Sombra: Ideation → Dádiva: Harmony → Sidhi: Illumination)
- **Ejiokô (Odu-2):** Dupla face. Aprendiz da dualidade. Regido por Oxalá e Iemanjá.
- **Sahasrara (Tantra):** O chakra da coro. Integração do divino.
- **Unificação Akasha:** Ejiokô é o Odu da reflexão dual — a paz que vem de entender que todo par de opostos é uma ilusão. O GeneKey 11 Harmonia/Iluminação complementa: a mente ideativa (shadow) se transforma em paz interior (gift) e depois em iluminação (sidhi). No mapa Akasha, este é o eixo da "Dupla Face" — o ponto de integração entre Odu 2, Sahasrara e GK11.

### 3. GeneKey 24 "The Sleeper" ↔ Odu Oxé ↔ I Ching Hexagrama 24

- **GeneKey 24** (Sombra: Rationalization → Dádiva: Regression → Sidhi: Freedom)
- **Oxé (Odu-5):** O feiticeiro. Transmutação, conhecimento secreto. Regido por Oxumar.
- **I Ching Hexagrama 24 (Fu/Retorno):** O retorno. Novo início após o inverno.
- **Unificação Akasha:** Oxé é o Odu da transformação — o feiticeiro que transmutada chumbo em ouro. O GeneKey 24 "O Dorminhoco" acordando (regressão como retorno ao essencial) ↔ Hexagrama 24 (retorno ao caminho). A interface Akasha deve exibir esta tríade como "Transmutação: O Despertar" — a capacidade de transformar velhos padrões em dons.

---

## Integração Proposta na Interface Akasha

### Card GeneKeys no Perfil
Ao abrir o mapa Akasha, um card "GeneKeys Ativados" mostra:
- 3 GeneKeys derivados da Data de Nascimento (usando o algoritmo de Richard Rudd)
- Cada GeneKey mostrado como: Shadow → Gift → Sidhi (com ícones intuitivos)
- Comparação lado-a-lado com Odu, Cabala e Astrologia do mesmo período

### Unificação de Linguagem
Em vez de mostrar "Seu Odu é Ogbe | Seu caminho Cabala é 11 | Seu GeneKey é 24", a interface unificada mostra:

> **"Sua Semente Primordial: O Primeiro Impulso"**
> Odu-1 + Keter + GK-1 = A vontade de criar que nasce em você

> **"Seu Eixo de Integração: A Dupla Face"**
> Odu-2 + Sahasrara + GK-11 = A capacidade de harmonizar opostos

---

## Algoritmo de Derivação

```
DataNascimento → SomaDosDígitos(DDMMYYYY) → Número 1-24
Se número > 24: soma até caber em 1-24
```

Esta é a mesma operação usada para Odu e Cabala — o que demonstra que os sistemas sãofacetas diferentes da mesma verdade matemática subjacente.

---

## Próximos Passos de Implementação

- [ ] Criar `packages/core-genekeys/` com o motor de cálculo
- [ ] Adicionar mapeamento `mapeamentos/genekeys.json`
- [ ] Criar componente `<GeneKeysCard>` na página de perfil
- [ ] Integrar no card unificado do dashboard (em vez de linha separada Odu | Cabala | Astrologia)
