---
name: cabala-engines
description: Conhecimento técnico-espiritual especializado para implementar os engines de cálculo da plataforma Cabala dos Caminhos. Use quando implementar numerologia, Odu, astrologia, tarot, cabala ou chakras.
---

# Skill: Engines Espirituais da Cabala dos Caminhos

## Regra Fundamental
SEMPRE leia IDEIA.md antes de implementar qualquer cálculo. Ele contém a fonte da verdade.

## Numerologia Cabalística — Algoritmo

```typescript
// Tabela pitagórica: A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9
// J=1, K=2, L=3, M=4, N=5, O=6, P=7, Q=8, R=9
// S=1, T=2, U=3, V=4, W=5, X=6, Y=7, Z=8
// Vogais: A=1, E=5, I=9, O=6, U=3
// Números mestres: 11, 22, 33 — NÃO reduzir

function reduzir(n: number, preservarMestres = true): number {
  if (preservarMestres && (n === 11 || n === 22 || n === 33)) return n;
  if (n < 10) return n;
  return reduzir(String(n).split('').reduce((a, d) => a + Number(d), 0), preservarMestres);
}

// Número de Vida: soma de todos os dígitos da data DD+MM+AAAA
// Ex: 13/07/1989 → 1+3+0+7+1+9+8+9 = 38 → 3+8 = 11 (mestre, não reduz)
```

## Odu de Nascimento — Algoritmo Geral
Soma dos dígitos da data completa → redução para 1-16
Se resultado > 16: continuar reduzindo pela soma dos dígitos
Casos especiais: 17→8, 18→9, etc.

## Validação Obrigatória
Sempre teste com estes casos conhecidos:
- Data 13/07/1989 → Nº de Vida = 11 (mestre)
- Validar Odus com pelo menos 3 praticantes que conhecem seu Odu confirmado

## Estrutura de dados recomendada para Odu

```typescript
interface OduCompleto {
  numero: number;        // 1-16
  nome: string;          // "Oxé", "Obará", etc.
  orixasRegentes: string[];
  planeta: string;
  elemento: string;
  quizilas: string[];    // O que EVITAR
  preceitos: string[];   // O que FAZER
  alimentosProibidos: string[];
  banhos: string[];      // Ervas e receitas
  ebos: string[];        // Tipos de oferendas
  diasFavoraveis: string[];
  cores: string[];
  arcanoTarot: string;
  sephirah: string;
  descricao: string;     // Arquétipo em linguagem simples
}
```

## Motor de Correlações — Padrão de Convergência

```typescript
interface Convergencia {
  tema: string;           // "Oxum/Amor/Doçura"
  sistemas: string[];     // ["Odu Oxé", "Nº de Vida 5", "Sol em Touro"]
  forca: 'simples' | 'dupla' | 'tripla' | 'quadrupla';
  insight: string;        // Texto em linguagem simples para o usuário
}
```