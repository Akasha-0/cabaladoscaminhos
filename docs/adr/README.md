# 📐 Architecture Decision Records (ADR) — Akasha Portal

> Sistema de registro formal de decisões técnicas e de produto do Akasha Portal.
> Toda decisão arquitetural importante vive aqui, versionada em Git, com contexto, alternativas e consequências.

---

## 🎯 O que é um ADR

**Architecture Decision Record (ADR)** é um documento curto que captura **uma decisão arquitetural importante** no momento em que ela é tomada. Não é documentação retroativa — é **fotografia do momento da decisão**, incluindo:

- **Status** (proposta, aceita, deprecada, supersedida)
- **Contexto** (o problema ou situação que motivou)
- **Decisão** (o que escolhemos fazer)
- **Consequências** (positivas, negativas, neutras)
- **Alternativas consideradas** (e por que não foram escolhidas)

> Inspirado em [Michael Nygard's ADR template](https://github.com/joelparkerhenderson/architecture-decision-records/blob/main/locales/en/templates/decision-record-template-by-michael-nygard/index.md).

---

## 📂 Estrutura deste diretório

```
docs/adr/
├── README.md             ← este arquivo
├── 0001-use-nextjs-16.md
├── 0002-use-supabase-as-backend.md
├── 0003-use-pgvector-for-embeddings.md
├── 0004-akasha-ia-as-translator-not-curator.md
├── 0005-pt-br-first-language.md
└── 0006-universalist-not-proselytizing.md
```

Cada arquivo `NNNN-titulo-kebab-case.md` é **um ADR imutável**. Para mudar uma decisão, escreva **um novo ADR** que referencie e substitua o anterior (mude o status para `Superseded by NNNN`).

---

## 🚀 Como criar um novo ADR

### Opção 1: usar o script (recomendado)

```bash
bash scripts/new-adr.sh "Título da decisão em inglês, kebab-case"
```

O script:
1. Calcula o próximo número sequencial (`0007`, `0008`, ...)
2. Cria o arquivo com template preenchido
3. Abre no editor padrão (ou mostra o caminho)

**Exemplo:**
```bash
bash scripts/new-adr.sh "use-prisma-orm-with-pg-adapter"
# Cria: docs/adr/0007-use-prisma-orm-with-pg-adapter.md
```

### Opção 2: criar manualmente

1. Copie o template abaixo
2. Salve como `NNNN-titulo-kebab-case.md` em `docs/adr/`
3. Use o próximo número disponível (veja `ls docs/adr/`)
4. Preencha todas as seções
5. Faça commit + abra PR

---

## 📝 Template (Nygard)

```markdown
# ADR-NNNN: Título da Decisão

## Status

[Proposed | Accepted | Deprecated | Superseded by NNNN]

## Contexto

Qual é o problema / situação que motivou esta decisão?
- Restrições técnicas
- Restrições de prazo / orçamento
- Restrições de equipe
- Drivers do projeto
- Forças em jogo

## Decisão

O que decidimos fazer? Seja específico.
- Tecnologia / padrão / convenção escolhida
- Como vai funcionar
- Quem é responsável

## Consequências

### Positivas
- O que ganhamos com isso

### Negativas
- Trade-offs honestos (pelo menos 2)
- Dívida técnica contraída

### Neutras
- Efeitos laterais que aceitamos

## Alternativas consideradas

Liste **4-6** alternativas reais que foram consideradas e por que não foram escolhidas.

### 1. Alternativa A
- **Prós:** ...
- **Contras:** ...
- **Por que não:** ...

### 2. Alternativa B
...

## Referências

- [Link para VISION.md](../VISION.md)
- [Link para ARCHITECTURE.md](../ARCHITECTURE.md)
- Links externos (papers, docs oficiais)
```

---

## ✅ Regras de qualidade (validadas por CI)

O workflow [`.github/ADR-LINT.yml`](../../.github/ADR-LINT.yml) valida automaticamente:

| Regra | Descrição |
|---|---|
| **Numeração** | Arquivo deve começar com `NNNN-` (4 dígitos) |
| **Nome** | Apenas kebab-case, minúsculas, sem acentos |
| **Status** | Deve ser um dos 4 valores válidos |
| **Seções obrigatórias** | Contexto, Decisão, Consequências, Alternativas |
| **Consequências negativas** | Pelo menos **2** consequências negativas explícitas |
| **Alternativas** | Pelo menos **4** alternativas consideradas (seções `### N.`) |
| **Cross-reference** | ADR deve referenciar VISION.md **ou** ARCHITECTURE.md |
| **Tamanho** | Mínimo 30 linhas, máximo 800 linhas |

ADRs que falharem o lint **não quebram o build**, mas aparecem como aviso no PR.

---

## 🔄 Ciclo de vida de um ADR

```
[Proposed]  →  [Accepted]  →  [Deprecated]
                 ↓
            [Superseded by NNNN]
```

| Status | Significado |
|---|---|
| **Proposed** | Em discussão. Não implementada ainda. |
| **Accepted** | Decisão ativa. Implementada ou em implementação. |
| **Deprecated** | Decisão não é mais recomendada, mas o código legado pode existir. |
| **Superseded by NNNN** | Decisão foi substituída por outro ADR (apontar qual). |

**Importante:** ADRs são **imutáveis**. Uma vez aceito, você **não edita** o histórico. Se a decisão mudou, crie um ADR novo que depreca ou supersede o anterior.

---

## 🔗 Como um ADR se relaciona com VISION.md e ARCHITECTURE.md

```
VISION.md          →  O QUE somos, PRA QUEM, POR QUÊ
ARCHITECTURE.md    →  COMO o sistema é organizado hoje
docs/adr/NNNN-*.md →  POR QUE cada decisão foi tomada
```

- **VISION.md** pode mudar sem ADR (é visão, não decisão técnica)
- **ARCHITECTURE.md** deve referenciar ADRs quando descrever o "porquê" de uma escolha
- **ADRs** devem linkar para a seção relevante de VISION.md e ARCHITECTURE.md

---

## 📋 Lista atual de ADRs

| # | Título | Status | Data |
|---|---|---|---|
| [0001](0001-use-nextjs-16.md) | Use Next.js 16 | Accepted | 2026-06-26 |
| [0002](0002-use-supabase-as-backend.md) | Use Supabase as Backend | Accepted | 2026-06-26 |
| [0003](0003-use-pgvector-for-embeddings.md) | Use pgvector for Embeddings | Accepted | 2026-06-26 |
| [0004](0004-akasha-ia-as-translator-not-curator.md) | Akasha IA as Translator, Not Curator | Accepted | 2026-06-26 |
| [0005](0005-pt-br-first-language.md) | PT-BR as First Language | Accepted | 2026-06-26 |
| [0006](0006-universalist-not-proselytizing.md) | Universalist, Not Proselytizing | Accepted | 2026-06-26 |

---

## 🧠 Filosofia

> *"Decisões arquiteturais são contratos com o futuro. ADRs são a forma de lembrar o que prometemos — e por quê."*

- **Decisões explícitas > decisões implícitas**
- **Trade-offs honestos > vende-dourado**
- **Memória institucional > dependência de herói**
- **Mudar é fácil quando você sabe por que estava do jeito que estava**

Se você está prestes a tomar uma decisão técnica ou de produto que afeta **mais de uma sprint** ou **mais de um sistema**, escreva um ADR. Vai agradecer a si mesmo daqui a 6 meses.