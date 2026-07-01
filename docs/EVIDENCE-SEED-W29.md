# Akasha Portal — Evidence Seed Wave 29

> **Curadoria científica de práticas integrativas, espiritualidade e medicinas tradicionais.**
> Iyá (Curator) — Onda 29, 2026-06-28.

---

## 1. Propósito

Este seed inicial popula a **Biblioteca Akasha Curada** com **34 artigos
científicos verificados** distribuídos em **10 tradições** (Reiki, Ayahuasca,
Psilocybina, Ibogaína, Meditação/MBSR, Cannabis/CBD, Breathwork, Kambo,
Sananga, Astrologia, Numerologia, Rapé, Kava). É o primeiro de uma série
de 8 ondas (W29 = seed 3/8) que visa construir a base de evidências
acessível à comunidade Akasha.

**Princípio editorial:** cada artigo carrega DOI/PMID quando existe, resumo
leigo em PT-BR, nível de evidência GRADE-aligned e notas de segurança.
A curadoria honra o princípio universalista — sem proselitismo, sem
negação a priori, com honestidade sobre limites metodológicos.

---

## 2. Critérios de Seleção (Pirâmide de Evidência)

Aplicamos a hierarquia clássica da medicina baseada em evidências, com
mapeamento explícito para o enum `EvidenceLevel` do Prisma:

| Rank | Tipo de Estudo              | JSON `evidenceLevel` | Prisma `EvidenceLevel` |
| ---- | --------------------------- | -------------------- | ---------------------- |
| 1    | Meta-análise de RCTs        | `META_ANALYSIS`      | `HIGH`                 |
| 2    | Revisão sistemática         | `SYSTEMATIC_REVIEW`  | `HIGH`                 |
| 3    | Ensaio clínico randomizado  | `RCT`                | `MEDIUM`               |
| 4    | Estudo de coorte            | `COHORT`             | `MEDIUM`               |
| 5    | Relato de caso              | `CASE_REPORT`        | `LOW`                  |
| 6    | Ensaio / opinião            | `ESSAY`              | `ANECDOTAL`            |
| 7    | Política pública / portaria | `ARTICLE`            | `HIGH`*                |

\* Marcos regulatórios com chancela institucional reconhecida (Ministério
da Saúde, FDA, EMA) recebem `HIGH` por seu impacto na prática clínica,
mesmo quando o tipo de fonte é `ARTICLE` ou `ESSAY`. Mapeamento feito
em `prisma/seeds/seed-articles.ts` → `mapEvidenceLevel()`.

---

## 3. Inventário dos 34 Artigos

### 3.1 Reiki / Práticas Integrativas no SUS (4 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `reiki-sus-pnpic-2017`                 | 2017| Portaria MS           | HIGH      | gov.br/saude                    |
| `pnpic-revisao-2018`                   | 2018| Revisão SciELO        | MEDIUM    | SciELO RLAE                     |
| `reiki-meta-analise-2017`              | 2017| Revisão (McManus)     | HIGH      | J Evid Based Complement Altern  |
| `reiki-cancer-palliative-care`         | 2017| Revisão integrativa   | MEDIUM    | Integr Cancer Ther              |

### 3.2 Ayahuasca (3 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `ayahuasca-spect-depression-2016`      | 2016| Estudo aberto (n=6)   | MEDIUM    | J Clin Psychopharmacol          |
| `ayahuasca-rct-depression-2019`        | 2019| RCT (n=29)            | HIGH      | Psychol Med (Cambridge)         |
| `ayahuasca-pharmacology-2016`          | 2016| Revisão               | HIGH      | Brain Res Bull                  |

### 3.3 Psilocybina (5 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `psilocybin-cancer-griffiths-2016`     | 2016| RCT Johns Hopkins     | HIGH      | J Psychopharmacol               |
| `psilocybin-cancer-ross-2016`          | 2016| RCT NYU               | HIGH      | J Psychopharmacol               |
| `psilocybin-treatment-resistant-2016`  | 2016| Estudo aberto (n=12)  | MEDIUM    | Lancet Psychiatry               |
| `psilocybin-mdd-davis-2021`            | 2021| RCT (n=24)            | HIGH      | JAMA Psychiatry                 |
| `psilocybin-brain-mechanisms-2017`     | 2017| Neuroimagem (n=19)    | MEDIUM    | Sci Rep (Nature)                |

### 3.4 Ibogaína / Hypogein (3 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `ibogaine-subjective-effectiveness-2018` | 2018| Observacional (n=88) | MEDIUM    | Am J Drug Alcohol Abuse         |
| `ibogaine-detoxification-mash-2018`   | 2018| Revisão pré-clínica   | MEDIUM    | Front Pharmacol                |
| `ibogaine-safety-review-2022`          | 2022| Revisão IUPHAR        | HIGH      | Pharmacol Res                   |

### 3.5 Meditação / MBSR (4 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `mbsr-healthy-meta-analysis-2015`      | 2015| Meta-análise          | HIGH      | J Psychosom Res                 |
| `mbsr-psychosis-meta-analysis-2013`    | 2013| Meta-análise          | HIGH      | Schizophr Res                   |
| `default-mode-network-meditation-2011` | 2011| Neuroimagem           | MEDIUM    | PNAS                            |
| `mbsr-social-anxiety-2010`             | 2010| RCT + fMRI            | MEDIUM    | Emotion (APA)                   |

### 3.6 Cannabis / CBD (3 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `cbd-epilepsy-devinsky-2016`           | 2016| Estudo aberto         | HIGH      | Lancet Neurology                |
| `cbd-dravet-2017`                      | 2017| RCT fase 3            | HIGH      | NEJM                            |
| `cannabis-cbd-pain-meta-2018`          | 2015| Meta-análise JAMA     | HIGH      | JAMA                            |

### 3.7 Breathwork (3 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `wim-hof-kox-2014`                     | 2014| RCT (n=24)            | HIGH      | PNAS                            |
| `wim-hof-brain-muzik-2018`             | 2020| Hipótese              | LOW       | Med Hypotheses                  |
| `holotropic-breathwork-croft-2018`     | 2018| Estudo controlado     | MEDIUM    | J Altern Complement Med         |

### 3.8 Kambo / Sananga (5 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `kambo-toxicology-review-2022`         | 2022| Revisão               | MEDIUM    | Toxicon                         |
| `kambo-psychoactive-effects-2020`      | 2020| Estudo observacional  | MEDIUM    | Sci Rep (Nature)                |
| `sananga-phytochemistry-review-2014`   | 2014| Fitoquímica           | LOW       | J Nat Prod                      |
| `tabernaemontana-ibogaine-family`      | 2014| Revisão etnofarmacol. | MEDIUM    | J Ethnopharmacol                |

### 3.9 Astrologia, Numerologia, Rapé (3 artigos)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `astrology-empirical-study-mayo-1978`  | 1978| Estudo empírico       | MEDIUM    | J Soc Psychol                   |
| `astrology-barnum-effect-2018`         | 2018| Estudo cognitivo      | MEDIUM    | Pers Individ Differ             |
| `numerology-rationalist-review`        | 2010| Ensaio sociológico    | ANECDOTAL | Routledge Handbook              |
| `rape-indigenous-ethnography`          | 2020| Etnografia            | ANECDOTAL | Springer Ethnopharmacol        |

### 3.10 Kava (1 artigo)

| Slug                                   | Ano | Tipo                  | Evidência | Fonte primária                  |
| -------------------------------------- | --- | --------------------- | --------- | ------------------------------- |
| `kava-anxiety-sarris-2013`             | 2013| RCT (n=75)            | HIGH      | J Clin Psychopharmacol          |

**Total: 34 artigos** em 10 tradições.

---

## 4. Workflow de Curadoria

### 4.1 Como adicionar um novo artigo

```
1. Pesquisar a fonte primária (PubMed, SciELO, Google Scholar).
2. Verificar DOI/PMID, journal, ano, autores. NÃO inventar dados.
3. Classificar pelo nível de evidência (pirâmide acima).
4. Redigir:
   - `summary` em PT-BR, leigo, ~200 palavras
   - `curatorNotes`: contexto, limitações, conflito de interesse
   - `safetyNotes`: contraindicações, interação medicamentosa
5. Adicionar entrada em `prisma/seeds/articles-seed.json`
6. Rodar o seed: `pnpm tsx prisma/seeds/seed-articles.ts`
7. O script é idempotente — re-rodar não duplica.
```

### 4.2 Critérios editoriais obrigatórios

- ✅ Citação primária verificável (DOI/PMID/URL real)
- ✅ Resumo PT-BR acessível a leigos
- ✅ Notas de segurança quando aplicável
- ✅ Marcação honesta de evidência fraca quando for o caso
- ✅ Sem proselitismo nem negação a priori
- ❌ NUNCA inventar DOI, PMID ou autor
- ❌ NUNCA afirmar "cura" ou substituir tratamento médico
- ❌ NUNCA atribuir orixá/signo/número "errado" por simplificação

### 4.3 Validação de citações

Para cada novo artigo:
1. Conferir DOI em `https://doi.org/{doi}` (deve resolver)
2. Conferir PMID em `https://pubmed.ncbi.nlm.nih.gov/{pmid}/`
3. Conferir journal no Scopus/WoS quando possível
4. Documentar limitações em `curatorNotes`

---

## 5. Estrutura Técnica

### 5.1 Arquivos

```
prisma/seeds/
├── articles-seed.json     ← 34 artigos, fonte única de verdade
└── seed-articles.ts       ← script idempotente, mapeia JSON → Prisma

prisma/seed/
└── articles.ts            ← seed legado (20 artigos hardcoded em TS)
                              coexiste — não conflita porque usa slugs distintos
```

### 5.2 Schema Prisma (campos preenchidos)

Campos do model `Article` preenchidos pelo seed:

```ts
{
  slug, title, summary, content,
  authors, journal, year, doi, url,
  tags, topics, tradition,
  evidenceLevel, language,
  type, body, externalUrl, references,
  curatedBy: 'iyá-curator-w29',
  source: 'doi:10.xxxx/...' | 'manual:slug',
  sourceHash: 'sha256[16]',
  publishedAt: new Date(`${year}-01-01`),
}
```

### 5.3 Como rodar

```bash
# Geração do cliente (uma vez)
pnpm db:generate

# Seed
pnpm tsx prisma/seeds/seed-articles.ts

# Adicionar ao package.json (sugestão)
# "seed:articles:w29": "tsx prisma/seeds/seed-articles.ts"
```

---

## 6. Disclaimer Ético

> **Os artigos curados no Akasha NÃO substituem atendimento médico,
> psicológico ou psiquiátrico profissional.**
>
> A Biblioteca Akasha existe para fins **educacionais e de pesquisa** —
> apoiar a comunidade no acesso à evidência científica atual, com
> transparência sobre seus limites. Curadoria não é aconselhamento.
>
> Tradições espirituais e práticas integrativas podem trazer benefícios
> reais documentados, mas também riscos — sobretudo em populações
> vulneráveis (gestantes, cardiopatas, pessoas com psicoses, em uso de
> psicofármacos). Consulte sempre profissional de saúde habilitado antes
> de iniciar qualquer prática.
>
> A Akasha Portal é uma comunidade universalista. Curadoria honesta
> inclui reconhecer quando uma tradição carece de evidência científica
> robusta, e quando uma tradição tem evidência que precisa ser levada
> a sério — sem confundir os dois registros.

---

## 7. Próximas Ondas (4–8/8)

- **W30** — Tradições afro-brasileiras (Candomblé, Umbanda, Ifá) com
  bibliografia antropológica (Roger Bastide, Pierre Verger, Juana
  Elbein dos Santos).
- **W31** — Cabala, Tantra, Taoísmo — fontes primárias comentadas.
- **W32** — Mesa Real Cigano Ramiro — registro das regras do método
  pessoal do operador (governança separada).
- **W33** — IA prompts — curadoria de prompts com fontes citadas.
- **W34** — Auditoria cruzada — checagem por praticantes reconhecidos
  (babalorixás, astrólogos profissionais, numerólogos com linhagem).

---

**Iyá (Curator) · Wave 29 · 2026-06-28 · Akasha Portal**