# Human Design — Akasha Integration Research

**Autor:** Akasha Research Team
**Data:** 2026-06-18
**Versão:** 0.92.0

---

## Visão Geral

O **Human Design** (Ra Uru Hu, 1987) é um sistema de autoconhecimento que sintetiza Astrologia, I Ching, Kabbalah, Chakra system e genética humana em um mapa único chamado **BodyGraph**. O sistema determina:

- **Tipo** (5 categorias) — como você interage com o mundo
- **Estratégia** — o caminho correto de ação
- **Autoridade** — como tomar decisões corretas
- **Canais e Portões** —您的天赋和挑战的具体路径
- **Definições** — áreas de clareza vs. áreas de "em branco"

---

## 3 Correlações Fundamentais com Akasha

### 1. Tipo Generator ↔ Odu Oxé ↔ Agni (Fogo Tántrico)

- **Human Design Generator:** 70% da população. Estrategista de energia. Estratégia: "Esperar para responder." Autoridade: emocional ( esperar para sentir a decisão).
- **Oxé (Odu-5):** O feiticeiro. Transmutação, conhecimento secreto. Regido por Oxumar (Arco-íris/Serpente). Energia de transformação.
- **Agni (Tantra):** O fogo digestivo. Metabolic fire. Transformação de essência em forma.
- **Unificação Akasha:** O Generator tem energia abundante para construir e transmutar. O Odu Oxé é o Odu da transmutação — a capacidade de transformar chumbo em ouro. No mapa Akasha, o Generator com Oxé é "O Alquimista" — energia infinita disponível para transformação. A interface deve sinalizar: "Tipo: Generator | Odu: Oxé | Fogo: Alquímico" como síntese unificada.

### 2. Tipo Projector ↔ Odu Ogbe ↔ Cabala Chokhmah (Sabedoria)

- **Human Design Projector:** 20% da população. Guia e orquestrador. Não tem energia própria — precisam ser invitados. Estratégia: "Esperar pelo convite." Autoridade: autoridade aerospiritual (escuta).
- **Ogbe (Odu-1):** A luz que ilumina o caminho. Vitória, criação. Regido por Oxalá.
- **Chokhmah (Cabala):** A segunda sephirah. Sabedoria. A energia de revelar o caminho sem fazer o trabalho oneself.
- **Unificação Akasha:** O Projector é o "iluminador" — não constrói, mas guia. Ogbe é a "luz que ilumina o caminho" — o mesmo papel. Chokhmah é sabedoria que flui sem esforço. O Projector com Ogbe é "O Farol" — alguém destinado a mostrar o caminho para outros. A interface mostra: "Tipo: Projector | Odu: Ogbe | Sephirah: Chokhmah" = "O Farol".

### 3. Tipo Manifestor ↔ Odu Irosun ↔ I Ching Hexagrama 36 (Ming Yi / Escuridão da Virtude)

- **Human Design Manifestor:** 8% da população. Iniciador. Atua sobre o mundo com força. Estratégia: "Informar." Autoridade: autoridade aerospiritual (escuta interna antes de agir).
- **Irosun (Odu-4):** A mulher com o tabuleiro de Ifá. Insight profundo, conhecimento dos mistérios. Regido por Osunyá/Iemanjá. O Odu mais intuitivo.
- **I Ching Hexagrama 36 (Ming Yi):** "Escuridão da virtude." O sábio se esconde em tempos de obscuridade. A luz interior que brilha mesmo na escuridão.
- **Unificação Akasha:** O Manifestor com Irosun é "O Sábio Oculto" — alguém que possui visão profunda mas deve agir com cautela, informando antes de agir. No mapa Akasha: "Tipo: Manifestor | Odu: Irosun | Hexagrama: 36" = "O Sábio Oculto".

---

## Os 5 Tipos Human Design no Mapa Akasha

| Tipo HD | Energia | Estratégia | Odu Correlato | Arquetipo Akasha |
|---|---|---|---|---|
| **Generator** | Alta (sacral) | Esperar para responder | Oxé (5) | O Alquimista |
| **Manifesting Generator** | Alta + initiação | Informar + responder | Ogbe (1) | O Criador |
| **Manifestor** | Initiação pura | Informar | Irosun (4) | O Sábio Oculto |
| **Projector** | Direcionada | Esperar convite | Ogbe (1) + Ejiokô (2) | O Farol |
| **Reflector** | Nenhuma fixa (100% aberta) | Esperar 28 dias | Ejiobe (16) | O Espelho |

---

## Integração Proposta na Interface Akasha

### Card Human Design no Perfil
Adicionar ao mapa Akasha:
- **Tipo + Estratégia** mostrados como badge visual no header do perfil
- **Autoridade** como indicador de como tomar decisões (emoção, splenic, ego, mental)
- **Canais activos** conectados aos 5 eixos Akasha (não como linha separada mas integrado)

### Unificação com Odu e Astrologia
Hoje a interface mostra "Odu: Oxé | Caminho: 11 | Sol: Escorpião" como 3 linhas separadas.

Proposta unificada:
> **"Seu Tipo Espiritual: Alquimista"**
> Human Design: Generator | Odu: Oxé | Agni: Fogo Transmutativo
> Estratégia: Responda ao mundo com sua energia de transformação

---

## Algoritmo de Derivação

```
DataNascimento (DD/MM/YYYY HH:MM) → Carta Astrológica (Sol + Lua + Ascendente)
+ Hexagrama I Ching (hora lunar) → BodyGraph Human Design (tipo, estratégia, autoridade)
```

O cálculo completo de Human Design requer horário de nascimento e localização. Para versões iniciais, usar apenas Sol e Ascendente astrológico como aproximação.

---

## Próximos Passos de Implementação

- [ ] Criar `packages/core-humandesign/` com motor de cálculo (tipo, estratégia, autoridade)
- [ ] Adicionar mapeamento `mapeamentos/humandesign.json`
- [ ] Criar componente `<HumanDesignCard>` na página de perfil
- [ ] Integrar no card unificado do dashboard (em vez de linha separada)
- [ ] Preencher mapeamentos com os 12 portões principais + 36 canais
