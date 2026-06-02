# Documento 11 — Referência de Cálculo Determinístico
## Cabala dos Caminhos

> **Tipo:** Especificação de algoritmos (zero ambiguidade)
> **Versão:** 1.0 | **Resolve:** G6, G7, G8 do Doc 10
> **Objetivo:** Toda função de cálculo deve produzir o mesmo resultado para a mesma entrada, sem "método cabalístico" implícito.

---

## 0. Como ler este documento

Pontos marcados com **`⚠️ VALIDAR (Dx)`** são **decisões de metodologia do operador** (linhagem do Cigano Ramiro) — Doc 10 §5. Os valores apresentados são **defaults canônicos e executáveis** (o sistema roda com eles), mas o operador deve confirmá-los ou substituí-los pela sua tradição antes do go-live. Onde o operador validar/alterar, **este documento é a fonte da verdade** e o código deve refletir exatamente o que está aqui.

---

## 1. Função Base — Redução de Dígitos

Toda a numerologia parte de uma única função, com tratamento explícito de **números mestres**.

```typescript
/**
 * Reduz um número à raiz de um dígito, PRESERVANDO os mestres 11, 22, 33.
 * Aplica a regra mestre em CADA passo da redução.
 */
function reduceToSingleDigit(n: number, keepMasters = true): number {
  const MASTERS = [11, 22, 33];
  while (n > 9) {
    if (keepMasters && MASTERS.includes(n)) return n;
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}
```

### 1.1 Regra dos Números Mestres (11, 22, 33)

**`⚠️ VALIDAR (D1)`** — Default canônico:
- Mestres são **preservados** nos campos de **identidade/missão de alma**: `lifePath`, `expression`, `mission`, `motivation`.
- Mestres são **reduzidos** (não preservados) nos campos **operacionais/cíclicos**: `personalDay/Month/Year`, `challenges`, `pinnacles` numéricos.
- 33 só é reconhecido como mestre **se emergir naturalmente** da soma de dois 33-componentes ou de um total intermediário 33; caso contrário reduz a 6.

Cada função abaixo declara explicitamente se usa `keepMasters = true` ou `false`.

---

## 2. Numerologia Cabalística

### 2.1 Tabela de Conversão Alfanumérica

**`⚠️ VALIDAR (D1)`** — Default canônico: **tabela Pitagórica 1–9** (a mais usada na numerologia cabalística brasileira). Substituir pela tabela Caldaica/Hebraica se for a linhagem do operador.

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| A | B | C | D | E | F | G | H | I |
| J | K | L | M | N | O | P | Q | R |
| S | T | U | V | W | X | Y | Z | — |

```typescript
const LETTER_VALUES: Record<string, number> = {
  A:1, J:1, S:1,  B:2, K:2, T:2,  C:3, L:3, U:3,
  D:4, M:4, V:4,  E:5, N:5, W:5,  F:6, O:6, X:6,
  G:7, P:7, Y:7,  H:8, Q:8, Z:8,  I:9, R:9,
};
```

### 2.2 Normalização de Nomes (acentos, Ç, Y, hífen)

**`⚠️ VALIDAR (D1)`** — Default canônico, determinístico:

1. **Maiúsculas** e remoção de espaços extras.
2. **Acentuação:** a letra acentuada vale **pela letra-base** (Á→A, É→E, Í→I, Ó→O, Ú→U, Â→A, Ê→E, Ô→O, Ã→A, Õ→O, À→A, Ü→U). Implementar via `normalize('NFD')` + remoção de diacríticos.
3. **Ç → C** (vale 3).
4. **Hífen e apóstrofo:** removidos; as letras adjacentes contam normalmente (ex.: "Sant'Ana" → "SANTANA").
5. **Y:** é **consoante por padrão** na contagem alfanumérica (vale 7). Para vogais/consoantes, ver §2.3.
6. Caracteres não-alfabéticos (números, pontuação) são ignorados.

```typescript
function normalizeName(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .toUpperCase()
    .replace(/[^A-Z]/g, ''); // mantém só A-Z (Ç já virou C)
}
```

### 2.3 Vogais vs. Consoantes

**`⚠️ VALIDAR (D1)`** — Default canônico:
- **Vogais:** A, E, I, O, U (após normalização — acentuadas já viram base).
- **Y:** tratado como **consoante** por padrão (não entra na Motivação). *(Alternativa de linhagem: Y como vogal quando ladeado por consoantes — não usado por padrão.)*

```typescript
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const isVowel  = (c: string) => VOWELS.has(c);
const isConsonant = (c: string) => /[A-Z]/.test(c) && !VOWELS.has(c);
```

### 2.4 Fórmulas Cabalísticas (passo a passo)

Entrada: `fullName` (string), `birthDate` (`YYYY-MM-DD`).

| Campo | Fórmula | Mestres |
|---|---|---|
| `lifePath` | Soma de **todos os dígitos** da data, reduzida. | preserva |
| `mission` | `reduce(lifePath + expression)` — síntese do propósito. | preserva |
| `expression` | Soma do valor de **todas as letras** do nome normalizado, reduzida. | preserva |
| `motivation` | Soma do valor das **vogais** do nome, reduzida. | preserva |
| `impression` | Soma do valor das **consoantes** do nome, reduzida. **(novo — G3)** | preserva |
| `nativeDayNumber` | Dia de nascimento **sem reduzir** (1–31). | n/a |
| `challenges` | Ver §2.5. | reduz |
| `pinnacles` | Ver §2.6. **(novo — G3)** | reduz |
| `karmicLessons` | Números de 1–9 **ausentes** no nome (lições a aprender). **(novo — G3)** | n/a |
| `karmaicDebts` | Presença de 13/14/16/19 em qualquer total intermediário (dívidas kármicas). | n/a |
| `personalYear` | `reduce(dia + mês + ano_atual_reduzido)`. **(novo — G3)** | reduz |
| `personalMonth` | `reduce(personalYear + mês_atual)`. **(novo — G3)** | reduz |
| `personalDay` | `reduce(personalMonth + dia_atual)`. **(novo — G3)** | reduz |

> **Nota sobre `expression` vs `destiny` (G3, D2):** No default canônico, **Expressão e Destino são o mesmo número** (soma de todo o nome). Mantemos apenas `expression` no `KabalisticMap`; um alias `destiny = expression` pode ser exposto se a UI exigir o rótulo "Destino". **`⚠️ VALIDAR (D2)`** se na sua linhagem Destino é distinto (ex.: nome + data).

### 2.5 Números de Desafio

```
firstChallenge  = |reduce(dia)  − reduce(mês)|
secondChallenge = |reduce(ano)  − reduce(dia)|
mainChallenge   = |firstChallenge − secondChallenge|   // desafio principal
lastChallenge   = |reduce(mês)  − reduce(ano)|
```
(Todos com `keepMasters = false`; resultado 0–8.)

### 2.6 Pináculos (Ciclos de Realização) — novo (G3)

```
firstPinnacle  = reduce(dia + mês)              // 0 → 36 − lifePath idade
secondPinnacle = reduce(dia + ano)
thirdPinnacle  = reduce(firstPinnacle + secondPinnacle)
fourthPinnacle = reduce(mês + ano)
```
Idades de troca: 1º até `36 − lifePath`; depois faixas de 9 anos.

### 2.7 Exemplo Resolvido (caso de validação oficial)

**Entrada:** "Eliane Simão de Almeida", `1986-08-20`.

- `lifePath`: 2+0+0+8+1+9+8+6 = **34** → 3+4 = **7** ✅ (bate com Doc 09 §8)
- `nativeDayNumber`: **20**
- `personalYear` (para 2026): reduce(20+8 + reduce(2026)) ... ver §2.4.

> Demais números do nome dependem da tabela validada em §2.1. Após o operador confirmar D1, adicionar aqui os valores esperados de `expression`, `motivation` e `impression` para fechar o teste unitário.

---

## 3. Numerologia Tântrica

### 3.1 Definições e Fórmulas (resolvendo o conflito da G3/D2)

**`⚠️ VALIDAR (D2)`** — Default canônico (alinhado ao exemplo trabalhado do Doc 09 §8: para 1986 → Dom Divino = 5, Destino = 6):

| Campo | Fórmula | Exemplo (20/08/1986) |
|---|---|---|
| `soul` (Alma) | `reduce(dia)` | 20 → **2** |
| `karma` | `reduce(mês)` | 08 → **8** |
| `divineGift` (Dom Divino) | `reduce(últimos 2 dígitos do ano)` | 86 → 8+6=14 → **5** |
| `destiny` (Destino) | `reduce(soma dos 4 dígitos do ano)` | 1+9+8+6=24 → **6** |
| `tantricPath` (Caminho Total) | `reduce(dia + mês + ano completo)` | ver §3.3 |
| `gift` (Presente / opcional) | `reduce(dia + mês)` | — |

> **Resolução do conflito de rótulos (G3):**
> - **Dom Divino** = redução dos **dois últimos dígitos do ano** (regra que reproduz o exemplo `1986 → 86 → 14 → 5`). A frase "reduzir o ANO" do Doc 02 era ambígua; **fica fixada como os dois últimos dígitos**.
> - **Destino** = redução da **soma dos 4 dígitos do ano** (`→ 6`).
> - **Caminho Total** = redução da **data completa** (dia+mês+ano).
> Assim `divineGift ≠ destiny ≠ tantricPath`, eliminando a troca de rótulos apontada na G3.

### 3.2 Os 11 Corpos Tântricos

**`⚠️ VALIDAR (D2)`** — Default canônico (numeração 1–11):

| # | Corpo | Essência |
|---|---|---|
| 1 | Corpo da Alma | Núcleo, pureza, origem |
| 2 | Corpo Negativo / Mente Protetora | Cautela, discernimento, proteção |
| 3 | Corpo Positivo / Mente Projetiva | Expansão, otimismo, ação |
| 4 | Corpo Neutro / Mente Meditativa | Equilíbrio, julgamento sereno |
| 5 | Corpo Físico | Manifestação, a palavra, o dom material |
| 6 | Arco da Linha | Integridade, projeção, intuição |
| 7 | Aura | Campo de proteção, presença |
| 8 | Corpo Prânico | Energia vital, respiração, força |
| 9 | Corpo Sutil | Maestria, sabedoria refinada |
| 10 | Corpo Radiante | Realeza, coragem, brilho |
| 11 | Corpo do Infinito / Ser Trinitário | Transcendência, totalidade |

Cada número tântrico carrega a descrição do seu corpo (campo `*Description`).

### 3.3 Exemplo Resolvido

**Entrada:** `1986-08-20`.
- `soul` = 2, `karma` = 8, `divineGift` = 5, `destiny` = 6 ✅ (batem com Doc 08/09)
- `tantricPath` = reduce(20 + 8 + 1986) = reduce(2014) = 2+0+1+4 = **7**.

---

## 4. Odu de Nascimento

### 4.1 Algoritmo Data → Odu

**`⚠️ VALIDAR (D3)` — BLOQUEADOR DE CONTEÚDO.** Não existe padrão universal; a tabela/algoritmo é **escolha da linhagem do Cigano Ramiro**. Até o operador definir, o sistema usa o **default provisório determinístico** abaixo (executável, porém **deve ser substituído** antes do go-live):

```typescript
/**
 * DEFAULT PROVISÓRIO — substituir pela tabela da linhagem (D3).
 * Soma todos os dígitos da data e mapeia ao intervalo 1..16.
 */
function calculateBirthOdu(date: string): number {
  const digits = date.replace(/\D/g, '').split('').reduce((s, d) => s + Number(d), 0);
  return ((digits - 1) % 16) + 1; // 1..16
}
```

> Quando o operador fornecer a tabela definitiva (ex.: por faixa de data, por jogo ritual, ou por correspondência astrológica→Odu), substituir esta função pela tabela fixa e adicionar os casos de teste correspondentes. Marcar `oduBirth.provisional: true` enquanto o default estiver em uso, para a UI sinalizar.

### 4.2 Estrutura de Saída

```typescript
interface OduBirth {
  oduNumber: number;       // 1..16
  oduName: string;
  orixaRegency: string[];
  elementalForce: string;
  lifeLesson: string;
  provisional?: boolean;   // true enquanto usar o algoritmo default (D3)
}
```

---

## 5. Os 16 Odus (Merindilogun) — Tabela Canônica

**`⚠️ VALIDAR (D4)`** — Grafias, numeração, orixás e essência variam entre tradições. A tabela abaixo é o default herdado do Doc 04 §5.2; o operador deve **confirmar ou corrigir** cada linha segundo sua linhagem antes de tornar a constante imutável.

| # | Odu | Orixás | Essência |
|---|---|---|---|
| 1 | Okran / Ogbe | Oxalá / Exu | Luz, origem, criação, renovação |
| 2 | Ejiokô | Ibeji, Ogum | Dualidade, movimento, parcerias |
| 3 | Etaogundá | Ogum | Batalha, conquista, abertura de caminhos |
| 4 | Irosun | Oxum, Iemanjá | Atenção, sangue, cuidado com traições |
| 5 | Oxê | Oxum | Beleza, amor, fertilidade, magnetismo |
| 6 | Obará | Xangô, Oxóssi | Riqueza, glória, abundância, fartura |
| 7 | Odi | Exu, Omolu | Segredos, transformação, cautela, limpeza |
| 8 | Ejionile | Xangô, Oxalá | Justiça, liderança, força, vitória |
| 9 | Ossá | Iemanjá, Oyá | Proteção feminina, sabedoria, turbulência |
| 10 | Ofun | Oxalufã, Oxalá | Espiritualidade profunda, equilíbrio mental |
| 11 | Owarin | Exu, Oyá | Dinâmica, perigo, astúcia, movimento rápido |
| 12 | Ejilaxebora | Xangô | Honra, proteção, caminho aberto |
| 13 | Ejiologbon / Oturupon | Omolu, Nanã | Cura, purificação, ancestralidade |
| 14 | Iká / Oturá | Oxalá, Iemanjá | Paz, benevolência, proteção divina |
| 15 | Obeogundá / Iká | Xangô, Oxum | Poder, estratégia, responsabilidade |
| 16 | Alafia / Ofurufu | Oxalá, Todos os Orixás | Completude, totalidade, bênção universal |

> **Importante:** o Glossário Oracular (Doc 15) detalha quizilas, preceitos e conselho de cada Odu, derivando desta tabela. Qualquer correção em D4 deve propagar para o Doc 15 e para `src/lib/constants/odus.ts`.

---

## 6. Resumo de Decisões Pendentes (espelho do Doc 10 §5)

| ID | O que falta | Impacto se não definido |
|---|---|---|
| D1 | Tabela alfanumérica + vogais/Y/acentos (§2.1–2.3) | Roda no default Pitagórico; números do nome podem divergir da linhagem |
| D2 | Definições tântricas + corpos (§3) | Roda no default; rótulos Destino/Dom/Caminho fixados pelo exemplo |
| D3 | Tabela data → Odu (§4.1) | Roda no default provisório; **deve** ser substituído antes do go-live |
| D4 | Validação dos 16 Odus (§5) | Roda com a lista herdada; conteúdo oracular pode conter grafias a corrigir |

Enquanto D1–D4 não forem confirmados, os motores **funcionam** (prontidão mecânica), mas os campos afetados devem ser tratados como **provisórios** e sinalizados na UI quando aplicável.
