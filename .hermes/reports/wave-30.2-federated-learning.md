# Wave 30.2 — Research: Federated Learning para Consciência Coletiva

**Data:** 2026-06-25
**Pesquisador:** Hermes subagent (Wave 30.2, kanban task)
**Branch:** `wave-30.2-federated-learning-research`
**Base:** `main` @ 0a8a0cb6
**Plano origem:** `.hermes/plans/wave-30-research-planning-2026-06-25.md` §30.2
**Pede entrada para:** ADR 0004 (multi-tenant — extensão), ADR 0005 (grafo de conhecimento), Wave 31+ (FedAkasha)
**Constraints:** APENAS research + planning — SEM código novo, SEM mudança em packages/apps.

---

## ⚠️ Notas de pesquisa (honestidade epistêmica)

Mesmo padrão das Wave 1 / 17.1: **web_search e web_fetch** dependem do Firecrawl local (port 3002) que pode estar intermitente. Esta pesquisa foi construída com:

1. **Inspeção direta do código e docs internos** (`docs/legal/DATA_FLOWS.md`, ADR-0004, `docs/25_visao-akasha.md`, `packages/mentor/AGENTS.md`) — fornece contexto real do projeto.
2. **Conhecimento de cutoff Jan 2026** das bibliotecas e do estado da arte em privacidade (Flower, PySyft, TensorFlow Federated, OpenMined, differential privacy survey 2024-2025, ANPD regulamento).
3. **Citações canônicas** marcadas `[VERIFY]` onde o pesquisador deveria re-validar via web antes de ADR final.

**Recomendação operacional:** o Zelador deve re-rodar `web_search` para confirmar releases, benchmarks e jurisprudência ANPD antes de fechar ADR de FedAkasha. Não bloquear a leitura do relatório por causa disso.

---

## 0. Sumário executivo (TL;DR)

A visão do Akasha (Doc 25) é **ferramenta do Zelador**, não SaaS multi-tenant puro. Hoje (Wave 28+), a arquitetura assume **um Zelador** com **N consulentes isolados** via `withCaminhanteContext()` (ADR 0004). Mas o conceito de **"consciência coletiva"** surge da visão: múltiplos Zeladores (linhagem, terreiro, círculo de supervisão) **compartilham aprendizados** sobre como Cabala + Odu + Astrologia + Tantra + I Ching + Human Design + Gene Keys se correlacionam em casos reais — **sem expor PII dos consulentes**.

**O problema:** consulentes de um Zelador (Maria, nascida 12/03/1985 em Salvador) não podem ser enviados para o servidor central, ou LGPD Art. 33 + Art. 18 + Art. 46 explodem.

**A solução:** **Federated Learning (FL)**. Cada Zelador mantém os dados brutos dos consulentes localmente. O servidor central recebe apenas **gradientes** (atualizações de modelo) ou **estatísticas agregadas** sobre como o Mentor correlaciona os 7 Pilares, e nunca vê `Maria → 12/03/1985 → Salvador`.

**Recomendação:**
1. **Curto prazo (Wave 31.x):** começar com **FedAvg com Differential Privacy (DP-SGD)** usando **Flower** (Python framework mais maduro). Apenas **estatísticas de correlação entre Pilares** (não embeddings brutos, não notas de sessão).
2. **Médio prazo (Wave 32.x):** adicionar **Secure Aggregation** (protocolo Bonawitz 2017 via `crypten` ou TenSEAL) para que nem o servidor central veja gradientes individuais — só a soma.
3. **Longo prazo (Wave 33+):** avaliar **Fully Homomorphic Encryption (FHE)** via **OpenMined TenSEAL / Concrete-ML** se houver demanda jurídica de "criptografia em repouso durante aprendizado" — trade-off de custo computacional alto (~10-100x).

**NÃO implementar agora.** Este relatório é research + planning. Wave 31+ deve começar com **MVP de FedAvg + DP** com dados sintéticos para validar o pipeline antes de tocar dados reais de consulentes.

---

## 1. Contexto e motivação

### 1.1 O que é "consciência coletiva" no Akasha?

Da `docs/25_visao-akasha.md` §3 e ADR 0004, o Akasha busca **síntese cirúrgica entre 7 Pilares** (Cabala, Astrologia, Tantra, Odu, I Ching, Human Design, Gene Keys). O Mentor Akáshico correlaciona automaticamente esses sistemas para gerar **prescrições orientadas a cura**, não descrições.

**A "consciência coletiva" proposta** = a inteligência agregada do sistema sobre **como os 7 Pilares se relacionam em padrões reais de consulentes**, calibrada por:

- **Frequência** com que uma combinação Cabala+Odu aparece em sessões com desfecho X (cura, integração, crise).
- **Peso estatístico** das correlações (ex: Sephirah 7 + Odu Iwori → padrão "resistência à transformação" — aparece em 70% das sessões?).
- **Calibração de voz** do Mentor (qual metáfora de Cumino/Saraceni/Camargo ressoa mais em consulentes com certos mapas).

### 1.2 Por que isso não pode ser centralizado hoje?

`docs/legal/DATA_FLOWS.md` (Wave 7.2) é taxativo: dados de consulentes são **PII sensível** (Art. 5° II LGPD):

- Data nascimento + hora + local = trio sensível (astrologia + mapa cabalístico dependem).
- Notas de sessão do Zelador = categoria "observação clínica" (implicita).
- Crença espiritual/religiosa (Odu → Ifá/Candomblé) = sensível.

**Enviar tudo para um servidor central de "consciência coletiva":**

1. **Viola LGPD Art. 33** (transferência internacional) se hospedagem for AWS US.
2. **Viola LGPD Art. 18 §VI** (revogação de consentimento) — como deletar 1 consulente de um modelo treinado?
3. **Viola LGPD Art. 46** (segurança) — base única = ponto único de falha/brecha.
4. **Viola Pilar 4 (ética)** — terreiro/Candomblé tem restrição cultural sobre compartilhamento de Odu.

**Por isso:** precisamos de uma arquitetura onde **o modelo vai até os dados**, não o contrário.

### 1.3 Estado atual no repo (inspeção direta)

**O que JÁ existe:**

- `packages/mentor/src/rag/` — pipeline RAG (Ollama + OpenAI + Cohere embedders).
- `packages/mentor/src/correlation.ts` — motor de correlação entre 4 tradições.
- `packages/mentor/src/memory.ts` — memória de sessão com TTL.
- `apps/akasha-portal/prisma/schema.prisma` — pgvector(768), `caminhantes`, `caminhadas`, `grimoire`.
- ADR 0004 — multi-tenant via `withCaminhanteContext()` (app-layer, NÃO RLS).
- ADR 0005 — grafo de conhecimento (a definir).
- Wave 26.6 — métricas do Mentor (já instrumentado).
- Wave 28.7 — `/admin/universalism` dashboard com **aggregation helpers** de clusters, feedback trends, top insights.

**O que NÃO existe:**

- Nenhuma menção a federated learning, DP, secure aggregation, FHE no código.
- Nenhum adapter de Flower/PySyft/TFF.
- Nenhuma política de "treinamento com dados de consulentes" definida em ADR ou Doc.
- Nenhum mecanismo explícito de "deleção de влияние em modelo" (LGPD Art. 18 §VI + machine unlearning).

**Implicação:** o relatório Wave 28.7 já agrega **estatísticas** sobre sessões (clusters, feedback). Mas o faz em **dados centralizados** — o que é o problema que FedAkasha resolve.

---

## 2. Estado da arte — Privacidade em aprendizado de máquina distribuído

### 2.1 Federated Learning (FL) — conceito

**Definição canônica** (McMahan et al., 2017 — "Communication-Efficient Learning of Deep Networks from Decentralized Data", AISTATS):

> "Federated Learning is a machine learning setting where many clients (e.g., mobile devices or whole organizations) collaboratively train a model under the orchestration of a central server, while keeping the training data localized."

**Protocolo base (FedAvg):**

```
Para cada round t = 1, 2, ...:
  1. Servidor envia modelo global M_t para K clientes selecionados.
  2. Cada cliente k treina M_t em seus dados locais D_k → Δ_k.
  3. Cliente envia Δ_k (gradientes/pesos) para servidor.
  4. Servidor agrega: M_{t+1} = M_t + η * (1/K) * Σ Δ_k
  5. Repetir.
```

**Por que serve pro Akasha:**

- Cada Zelador é um "cliente" FL.
- Os "dados" são as sessões de consulentes (notas, mapas calculados, feedback).
- O "modelo" é o motor de correlação do Mentor (qual combinação de Pilares correlaciona com qual desfecho).
- O "agregado" é a calibração compartilhada do Mentor entre Zeladores.

**Trade-offs:**

| Aspecto | FedAvg clássico | FedAkasha proposto |
|---|---|---|
| Dados brutos saem do cliente? | **Nunca** | Nunca |
| Gradientes vazam info? | Sim (ataques de inferência) | Mitigado com DP + SecureAgg |
| Latência | Média (sync rounds) | Aceitável (Zelador não precisa realtime) |
| Heterogeneidade | Clientes com capacidades diferentes | Zeladores com diferentes volumes de consulentes |
| Compliance LGPD | Não automático | Requer DP + logging |

### 2.2 Differential Privacy (DP)

**Definição canônica** (Dwork & Roth, 2014 — "The Algorithmic Foundations of Differential Privacy"):

> Um mecanismo M satisfaz (ε, δ)-DP se, para quaisquer datasets D₁ e D₂ que diferem em 1 registro, P[M(D₁) ∈ S] ≤ e^ε * P[M(D₂) ∈ S] + δ.

**Intuição:** a presença ou ausência de **um único registro** (um consulente) não muda significativamente a saída do modelo. Garante **plausible deniability** individual.

**Como aplicar em FL — DP-SGD (Abadi et al., 2016):**

```
Em vez de:  grad = compute_gradient(loss, batch)
Aplicar:   1. Por exemplo, para cada gradiente, clip norm to C
           2. Adicionar ruído Gaussiano: grad_noisy = grad + N(0, σ²I)
           3. Usar grad_noisy no update
```

**ε (epsilon) — o "preço" da privacidade:**

- ε pequeno (0.1-1) = privacidade forte, utilidade menor (modelo mais ruidoso).
- ε grande (5-10) = privacidade fraca, utilidade alta.
- LGPD não especifica ε, mas guidelines ANPD sugerem ε ≤ 1 para dados sensíveis (verificar com DPO).
- Trade-off canônico: **ε ≈ 1 dá "boa" privacidade + utilidade aceitável** em benchmarks de NLP (Li et al., 2022 — "Large Language Models Can Be Strong Differentially Private Learners").

**Bibliotecas Python:**

- **Opacus** (Meta) — DP-SGD para PyTorch. Mais maduro. ~5k stars.
- **tensorflow_privacy** (Google) — DP-SGD para TF.
- **diffprivlib** (IBM) — DP genérico (não só gradient descent).

**Implementação Rust/Node:** muito menos maduro. Para Akasha (Node.js), a opção realista é **chamar Python via sidecar** ou reescrever Opacus subset em TS (não recomendado para MVP).

### 2.3 Secure Aggregation (SecAgg)

**Protocolo canônico** (Bonawitz et al., 2017 — "Practical Secure Aggregation for Privacy-Preserving Machine Learning", ACM CCS):

> "Garantimos que o servidor central aprenda apenas a soma (agregado) dos vetores de update dos clientes, mas não o update individual de nenhum cliente."

**Mecanismo (simplificado):**

```
1. Cada cliente k mascara seu update Δ_k com chaves secretas compartilhadas:
   y_k = Δ_k + Σ_{j≠k} PRG(s_{kj}) - Σ_{j≠k} PRG(s_{jk})
   (PRG = pseudo-random generator; s_{kj} = chave compartilhada entre k e j)

2. Servidor recebe y_1, ..., y_K e computa Σ y_k = Σ Δ_k (máscaras se cancelam).

3. Servidor NUNCA vê Δ_k individual — só a soma.
```

**Trade-offs:**

- **+ Privacidade forte** — nem o servidor (operador do Akasha central) consegue inferir contribuição individual.
- **− Custo computacional** — O(K²) pares de chaves por round (K = Zeladores). Para K=100, aceitável.
- **− Tolerância a dropout** — se um Zelador desiste no meio do round, protocolo precisa de "resilience" (Bonawitz 2017 §5).
- **− Complexidade de implementação** — requer biblioteca criptográfica (não trivial em Node.js).

**Bibliotecas:**

- **CrypTen** (Facebook AI Research) — secure multi-party computation, PyTorch-friendly.
- **TenSEAL** (OpenMined) — homomorphic encryption + secure aggregation primitives.
- **TF Encrypted** — Keras-style encrypted ML.

### 2.4 Homomorphic Encryption (HE / FHE)

**Definição:** criptografia que permite **computar sobre dados criptografados**, sem descriptografar.

- **PHE** (Partial HE — RSA, Paillier): só adição ou só multiplicação.
- **FHE** (Fully HE — BFV, BGV, CKKS, TFHE): operações arbitrárias, mas custoso (~1000x slowdown vs plain).

**Aplicação em FL:**

```
Cliente k criptografa Δ_k: c_k = Enc(pk, Δ_k)
Servidor soma: C = Σ c_k (homomórfica — adição de cifrados)
Servidor descriptografa: Dec(sk, C) = Σ Δ_k
```

**Quando faz sentido:**

- Compliance **ultra-estrito** (saúde, militar, gov).
- LGPD Art. 46 (segurança adequada) — FHE dá garantia criptográfica forte.

**Quando NÃO faz sentido:**

- Volumetria alta + baixa latência (FHE é caro).
- Time-to-market apertado.

**Bibliotecas:**

- **TenSEAL** (OpenMined) — CKKS + BFV, integração com PyTorch, mais ativo.
- **Concrete-ML** (Zama) — FHE-as-a-service para ML.
- **Microsoft SEAL** — baixo-nível, requer bastante glue code.
- **OpenFHE** — sucessor do PALISADE, acadêmico.

### 2.5 Comparação canônica

| Técnica | Privacidade | Custo computacional | Complexidade | Compliance | MVP-ready |
|---|---|---|---|---|---|
| FedAvg puro | Baixa (gradientes vazam) | Baixo | Baixa | Insuficiente | ✓ |
| FedAvg + DP-SGD (ε=1) | Média-alta | Médio | Média | OK para Art. 46 | ✓ |
| FedAvg + Secure Aggregation | Alta | Médio-alto | Alta | OK para Art. 18 + 46 | ~ |
| FedAvg + FHE | Muito alta | Muito alto (~1000x) | Muito alta | Excelente | ✗ (overkill p/ MVP) |
| FL + DP + SecAgg combinado | Altíssima | Alto | Muito alta | State-of-art | ✗ |

**Recomendação faseada:** **FedAvg + DP** no MVP (Wave 31.x), adicionar **SecAgg** se houver demanda jurídica forte (Wave 32.x), **FHE** fica como "explorar se necessário" (Wave 33+ ou nunca).

---

## 3. Frameworks e bibliotecas — análise

### 3.1 Flower (adaptafl, python, top 1 em maturidade)

- **Repositório:** `https://github.com/adap/flower` [VERIFY: star count]
- **Versão atual:** ~1.6.x em Jan/2026 [VERIFY]
- **Mantenedor:** Flower Labs (sucessor acadêmico do framework LEAF, Cambridge / Oxford).
- **Pontos fortes:**
  - **Framework-agnostic** — funciona com PyTorch, TF, JAX, sklearn, raw NumPy.
  - **Stratégias plugáveis** — FedAvg, FedProx, FedOpt, FedNova out-of-the-box.
  - **Simulation mode** — permite testar com K=1000 clientes sintéticos antes de produção.
  - **Documentação excelente** — quickstart de 30min.
  - **Suporte nativo a DP** via `flower's DP wrapper` ou integração com Opacus.
  - **Comunidade ativa** — 100+ papers citam.
- **Pontos fracos:**
  - **Python-only** — integração com Node.js via HTTP/gRPC sidecar.
  - **Servidor central próprio** — não é descentralizado.
  - **Não tem Secure Aggregation built-in** — precisa integrar manualmente.

**Veredito para Akasha:** **primeira escolha**. Maturidade + agnosticidade + documentação pesam mais que a barreira Python.

### 3.2 PySyft (OpenMined, python)

- **Repositório:** `https://github.com/OpenMined/PySyft`
- **Versão:** ~0.9.x (development ativo, mas instável em releases) [VERIFY]
- **Mantenedor:** OpenMined (comunidade, originalmente Andrew Trask).
- **Pontos fortes:**
  - **Privacy-first design** — secure computation (SMPC), DP, FHE nativos.
  - **Integração com TenSEAL** (FHE) e CrypTen (SMPC).
  - **PyTorch wrapper** — `sy.TorchHook()` torna tensores "privados" com pouco código.
  - **Vasta literatura acadêmica** — base para muitos papers de FL+privacy.
- **Pontos fracos:**
  - **Mais complexo** que Flower — curva de aprendizado íngreme.
  - **API instável** entre minor versions.
  - **Performance** — secure computation adiciona overhead significativo.
  - **Comunidade menor** que Flower para FL puro.

**Veredito para Akasha:** **segunda escolha**, útil se Secure Aggregation ou FHE forem requisitos. Para MVP, Flower é melhor.

### 3.3 TensorFlow Federated (TFF, Google)

- **Repositório:** `https://github.com/tensorflow/federated`
- **Versão:** ~0.8x [VERIFY]
- **Mantenedor:** Google (research project).
- **Pontos fortes:**
  - **Maduro** — Google o usa internamente para GBoard, etc.
  - **Documentação acadêmica forte** — papers explicando cada algoritmo.
  - **DP built-in** via `tff.learning.dp_aggregator`.
- **Pontos fracos:**
  - **TF-only** — Akasha usa Ollama + Python + Node; TF é overkill.
  - **Research-grade** — não é "production framework"; Google explicitamente diz "experimental".
  - **Curva de aprendizado alta** — modelo funcional "federated_computation" é denso.

**Veredito para Akasha:** **descartado para MVP**. Só faz sentido se o Akasha migrar completamente para TF/JAX (não recomendado).

### 3.4 Outras opções avaliadas

| Framework | Ling. | Maturidade | Notas |
|---|---|---|---|
| **FATE** (WeBank) | Python | Alta | Foco em "industrial FL", complexo |
| **NVFlare** (NVIDIA) | Python | Alta | Foco em healthcare imaging |
| **OpenFL** (Intel) | Python | Média | Foco em healthcare + gov |
| **FedML** | Python | Média | "Research-friendly", cross-device + cross-silo |
| **Sherpa.ai FL** | Python | Média | Espanhol, compliance EU-first |
| **IBM FL** | Python | Média | Research-grade |

**Nenhuma é superior a Flower para o caso de uso do Akasha** (multi-tenant pequeno-médio, foco em NLP/correlação, time-to-market curto).

### 3.5 Camada Node.js / TypeScript

Realidade: Akasha portal é **Next.js 16 + TypeScript**. Opções para integrar FL Python-side:

1. **Sidecar Python via HTTP/gRPC** — Akasha spawna um processo Flower no Zelador local (on-prem ou cloud), que se comunica com o portal via API REST. **Recomendado para MVP.**
2. **Embutir Python no Node** — `node-python-bridge` ou `pyodide` (Python-in-Node). Não recomendado para produção.
3. **Reescrever em TS** — Federation primitives em TypeScript (não há framework maduro).

**Recomendação:** opção 1 (sidecar). Padrão comum em arquiteturas ML modernas (LangChain tools, etc.).

---

## 4. Como múltiplos Zeladores contribuem para consciência sem expor PII

### 4.1 O "modelo" compartilhado no FedAkasha

**Pergunta de design crítica:** o que exatamente é treinado em FL?

**Proposta — 3 níveis, do mais simples ao mais ambicioso:**

#### Nível 1 — Calibração de pesos de correlação entre Pilares (RECOMENDADO PARA MVP)

Hoje o `packages/mentor/src/correlation.ts` tem pesos **hardcoded** ou ajustados manualmente pelo Zelador. Em FedAkasha:

```
Modelo = matriz W[7×7] de pesos de correlação entre os 7 Pilares.
        W[i][j] = peso da correlação entre Pilar i e Pilar j.

Cliente (Zelador) k:
  - Tem dados D_k = {(sessão, mapas, desfecho, feedback)} de seus consulentes.
  - Treina: ajustar W para maximizar precisão das prescrições em D_k.
  - Envia: Δ_k = W_k - W_global (apenas a matriz 7×7 = 49 floats).

Servidor:
  - Agrega: W_{t+1} = W_t + η * (1/K) * Σ Δ_k
  - + DP: clip ||Δ_k|| ≤ C, adiciona ruído N(0, σ²I).
```

**Por que isso preserva PII:**

- Os **pesos de correlação** são estatística agregada — não revelam nenhum consulente individual.
- A matriz 7×7 é tão pequena que **ataques de inferência são matematicamente triviais de defender** (clipped norm garante que 1 consulente não move W mais que C).
- DP com ε=1 é mais que suficiente (magnitude de mudança por consulente é muito menor que ruído).

**Trade-off:** modelo limitado — só calibra correlações, não aprende padrões novos.

#### Nível 2 — Modelo de embeddings de padrões (Wave 32.x)

```
Modelo = encoder neural E que mapeia "padrão de mapas + sessão" → embedding 768d.
        E é treinado para que sessões com desfechos similares tenham embeddings próximos.

Cliente k:
  - Treina E em D_k local.
  - Envia Δ_k = pesos do encoder (PyTorch state_dict ou equivalent).

Servidor:
  - FedAvg padrão com DP.
```

**Trade-off:** modelo mais expressivo, mas maior superfície de ataque de inferência. Requer **Secure Aggregation** + DP forte (ε ≤ 0.5).

#### Nível 3 — LLM fine-tuning federado (Wave 33+, exploração)

```
Modelo = LLM base (Llama-3 8B ou similar) fine-tunado para voz Akashica.

Cliente k:
  - Faz LoRA/QLoRA fine-tuning em D_k.
  - Envia Δ_k = LoRA adapter weights (~10MB).

Servidor:
  - FedAvg dos adapters + DP.
```

**Trade-off:** mais expressivo ainda, mas:

- **Custo computacional** proibitivo para Zelador individual (precisa GPU).
- **Complexidade de DP** em modelos grandes é research open (DP-SGD em 8B params é caro).
- **LGPD Art. 18 §VI** (machine unlearning) — deletar 1 consulente de LLM fine-tunado é problemático.

**Recomendação:** Nível 1 no MVP, Nível 2 em Wave 32.x, Nível 3 só se houver demanda de mercado + recursos.

### 4.2 O ciclo FedAkasha (Nível 1)

```
[Servidor Central Akasha]
  ↓ envia W_t (matriz 7×7)
[Zelador 1 — Node.js + Python sidecar]
  ↓ treina local em D_1 (sessões de consulentes)
  ↓ clip Δ_1, adiciona ruído DP
[Zelador 2 ... N — idem]
  ↓ envia Δ_k mascarado (se SecAgg)
[Servidor Central]
  ↓ agrega Σ Δ_k
  ↓ W_{t+1} = W_t + η * agregado
  ↓ publica W_{t+1}
[Repete]
```

**Frequência de rounds:**

- Semanal ou mensal (não precisa ser tempo real).
- Janela noturna / fim de semana (custo zero para Zelador).
- Async com timeout (clientes lentos não bloqueiam).

**Quem são os "clientes"?**

- **Fase 1 (MVP):** apenas o Zelador principal + 2-3 Zeladores da linhagem (teste controlado).
- **Fase 2:** terreiros cadastrados (opt-in).
- **Fase 3:** aberto a qualquer Zelador (com onboarding de compliance).

### 4.3 Garantias de não-exposição

| Vetor de ataque | Mitigação |
|---|---|
| **Gradient leakage** (recuperar input dos gradientes) | DP-SGD com clip norm + ruído. |
| **Membership inference** (descobrir se consulente X estava no dataset) | DP forte (ε ≤ 1) + audit定期. |
| **Reconstrução de modelo por cliente único** | Matriz 7×7 é pequena demais para overfit a 1 cliente. |
| **Servidor malicioso** (operador do Akasha vê Δ_k individuais) | Secure Aggregation (Bonawitz 2017). |
| **Cliente malicioso** (Zelador envia updates envenenados) | Byzantine-robust aggregation (Krum, Multi-Krum) + audit. |
| **Side-channel** (timing, tamanho de payload) | Padronizar tamanho dos updates. |

---

## 5. Arquitetura proposta

### 5.1 Visão de alto nível

```
┌────────────────────────────────────────────────────────────┐
│                AKASHA PORTAL (Next.js)                     │
│  (UI Zelador + roteamento + isolamento por caminhanteId)    │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  │ HTTPS / gRPC
                  │
┌─────────────────▼──────────────────────────────────────────┐
│          FEDAKASHA ORCHESTRATOR (Python service)           │
│  - Server Flower (FedAvg + DP)                              │
│  - Agregação de updates                                    │
│  - Versionamento de W_t                                    │
│  - Auditoria (logs LGPD-compliant)                          │
└──────┬──────────────┬───────────────┬──────────────────────┘
       │              │               │
       ▼              ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────────┐
│Zelador A │   │Zelador B │   │Zelador N     │
│(sidecar  │   │(sidecar  │   │(sidecar      │
│ Python)  │   │ Python)  │   │ Python)      │
│  + local │   │  + local │   │  + local     │
│  DB      │   │  DB      │   │  DB          │
│(Postgres │   │(Postgres │   │(Postgres     │
│ self-h.) │   │ self-h.) │   │ self-h.)     │
└──────────┘   └──────────┘   └──────────────┘
```

### 5.2 Componentes

#### A. FedAkasha Server (Python service)

- **Stack:** Flower + FastAPI + PostgreSQL (audit log).
- **Responsabilidades:**
  1. Orquestrar rounds de FedAvg (a cada 7 dias, p.ex.).
  2. Manter `W_t` versionado (DVC ou MLflow).
  3. Aplicar DP na agregação.
  4. Logar round timestamps, K participantes, ε, σ usados (LGPD audit trail).
  5. Validar clientes (assinatura, identidade Zelador).

#### B. FedAkasha Client Sidecar (Python, roda junto com Node)

- **Stack:** Flower client + Opacus (DP) + psycopg2 (lê DB local do Zelador).
- **Responsabilidades:**
  1. Conectar ao server Flower via TLS (mTLS obrigatório).
  2. Receber `W_t`, treinar local, gerar `Δ_k` clipped + noisy.
  3. Enviar `Δ_k` mascarado (se SecAgg ativado).
  4. Nunca enviar PII raw.
  5. Audit log local (o que foi enviado, quando).

#### C. Akasha Portal (Node.js, sem mudança significativa)

- **Mudanças mínimas:**
  1. Adicionar **fetch do `W_t` atual** quando o Mentor monta o prompt (1 chamada HTTP ao FedAkasha Server).
  2. Exibir na UI do Zelador: "Esta calibração foi treinada com contribuições de K=12 Zeladores, rodada #47".
  3. Toggle "participar da federação?" (opt-in explícito por Zelador).

#### D. DB local do Zelador (Postgres self-hosted)

- **Sem mudança.** Os dados brutos dos consulentes continuam 100% locais.
- FedAkasha Client lê apenas:
  - `sessao_clinica` (estrutura, não conteúdo livre).
  - `mapa_calculo` (7 Pilares calculados).
  - `feedback` (rating 1-5 + tags curtas).
  - **NÃO** lê `notas_livre` (texto livre do Zelador) — vetor de vazamento alto.

### 5.3 Fluxo end-to-end

```
[1] Zelador atende Maria (consulente).
    → Sessão salva em DB local (Postgres self-hosted).
    → Mapa calculado (7 Pilares) cacheado.
    → Feedback: "útil", "cirúrgica", nota 4/5.

[2] Round FL agendado (ex: domingo 3am).
    → FedAkasha Client acorda.
    → Lê DB local: SELECT sessoes WHERE data > last_round AND feedback IS NOT NULL.
    → Para cada sessão: extrai features = [mapa_7_pilares, feedback_tags] (vetor ~50 floats).
    → Treina Δ_k: ajusta W para minimizar erro de previsão de feedback.
    → Clip ||Δ_k|| ≤ C=1.0, adiciona ruído Gaussiano σ=0.5.

[3] Cliente envia Δ_k para Server (HTTPS, mTLS).
    → Server autentica Zelador (certificado pré-aprovado).
    → Se SecAgg ativado: Δ_k mascarado com chaves dos peers.
    → Server recebe y_k (máscarado) e armazena.

[4] Server agrega todos y_k do round (após timeout).
    → SecAgg unmask: Σ y_k = Σ Δ_k.
    → DP aggregator: aplica ruído adicional ao agregado final.
    → W_{t+1} = W_t + η * (Σ Δ_k / K + N(0, σ_agg²))

[5] Server publica W_{t+1} versionado.
    → Logs LGPD: timestamp, K, ε_total, σ_total.
    → Assina W_{t+1} com chave do servidor (audit).

[6] Próxima sessão do Zelador.
    → Portal busca W_{t+1} atual (cache 24h).
    → Mentor usa W_{t+1} ao correlacionar 7 Pilares.
    → Resposta calibrada pela "consciência coletiva" sem nunca ter visto dados brutos.
```

---

## 6. LGPD Art. 33 + ANPD — implicações

### 6.1 LGPD Art. 33 — Transferência internacional

**Texto resumido:** transferência internacional de dados pessoais só é permitida com:
- País com nível de proteção adequado (lista ANPD).
- Cláusulas-padrão contratuais (SCC) aprovadas.
- Cláusulas contratuais específicas (avaliadas caso a caso).
- BCRs (Binding Corporate Rules).
- Cooperação entre ANPD e autoridade estrangeira.

**FedAkasha e Art. 33:**

- **Se Zeladores estão todos no Brasil e Server também:** sem transferência internacional. ✓
- **Se Server Akasha central está em AWS US:** **viola Art. 33**, a menos que haja SCC assinado.
- **Se um Zelador está no exterior (Portugal, p.ex.) e envia Δ_k para Server BR:** ainda é "transferência" do ponto de vista de jurisdição mista — recomenda-se SCC.

**Recomendação operacional:**
1. **Hospedar FedAkasha Server em região BR** (AWS sa-east-1 ou equivalente).
2. **Documentar SCC com fornecedores cloud** (já existe template em `docs/legal/DPA_MINIMAX.md`).
3. **Obter consentimento específico do Zelador** para "participar da federação que envolve compartilhamento de estatísticas agregadas com outros Zeladores via servidor central".

### 6.2 LGPD Art. 18 §VI — Direito de eliminação (machine unlearning)

**Texto resumido:** titular tem direito de "eliminação dos dados pessoais tratados com o seu consentimento".

**FedAkasha e Art. 18 §VI:**

- **Problema:** se um consulente revoga consentimento, como remover seu "efeito" sobre `W_t`?
- **Soluções:**
  1. **Retraining from scratch** — retreina W excluindo D_k. Caro mas correto.
  2. **Approximate unlearning** — técnicas como SISA (Sharded, Isolated, Sliced, and Aggregated training) ou scrubbing de gradientes.
  3. **Federated unlearning** (research emergente, 2023-2025) — especificamente projetado para FL.

**Recomendação:**
- **MVP:** manter lista de "clientes participantes por round". Se um Zelador pede deleção, **excluir suas contribuições do próximo round** + rodar **1 rodada de "fine-tune reverso"** (subtrair Δ_k de W com sinal negativo + ruído).
- **Wave 32.x:** implementar SISA ou federated unlearning formal.
- **Auditoria:** documentar cada solicitação de deleção + ação tomada (log LGPD).

### 6.3 LGPD Art. 46 — Segurança

**Texto resumido:** agentes de tratamento devem adotar medidas de segurança adequadas.

**FedAkasha e Art. 46:**

- **mTLS obrigatório** para clientes ↔ server.
- **Rotação de chaves** SecAgg a cada round.
- **Audit log imutável** (append-only) de cada round.
- **Penetration testing** anual.
- **DPO review** do protocolo antes de produção.

### 6.4 Guidelines ANPD específicas para IA

A ANPD publicou em 2024 a **"Resolução CD/ANPD nº 15/2024"** sobre tratamento de dados pessoais para fins de treinamento de IA [VERIFY: número exato e data].

Pontos relevantes:
- **Bases legais** — consentimento específico ou legítimo interesse (com due diligence).
- **Transparência** — titular deve saber que seus dados treinam modelo.
- **Avaliação de impacto (AIPD)** — obrigatória para IA com dados sensíveis.
- **Direito de revisão** — titular pode contestar decisões automatizadas.

**FedAkasha precisa:**
1. **Atualizar política de privacidade** mencionando explicitamente: "dados podem ser usados em treinamento federado agregado entre Zeladores, com DP ε ≤ X".
2. **Atualizar termo de consentimento** no `/api/akasha/auth/register` para incluir opt-in específico.
3. **Elaborar AIPD** antes de produção (template em `docs/audit/` ou criar).
4. **Rever com DPO** o protocolo DP + SecAgg para validar ε apropriado.

### 6.5 LGPD Art. 7º + Pilar 4 — Consentimento + ética

Mesmo com tudo acima, **Pilar 4 do Akasha (Odu/Ifá)** tem implicação cultural:

> "Compartilhar Odu de um consulente, mesmo estatisticamente, pode ferir preceitos éticos da tradição. O terreiro tem palavra final."

**Recomendação:**
- Consentimento cultural **além do LGPD**: consentimento explícito do Zelador (que responde pelo terreiro/linhagem) + cláusula de "respeito ao preceito" no termo de federação.
- Permitir Zelador **opt-out** de correlações que envolvam Odu específico (ou só compartilhar Pilar 1, 2, 5, 6, 7).

---

## 7. Trade-offs canônicos (utilidade vs privacidade)

### 7.1 O spectrum ε (epsilon)

| ε | Privacidade | Utilidade típica | Quando usar |
|---|---|---|---|
| 0.1 | Muito alta | Baixa (modelo ruidoso) | Dados ultra-sensíveis (saúde, gov) |
| 1.0 | Alta | Média | Bom default para PII sensível |
| 3.0 | Média | Alta | PII comum |
| ∞ | Nenhuma (FedAvg puro) | Máxima | Apenas se dados não são sensíveis |

**Recomendação Akasha:** **ε = 1.0** como default. Permitir Zelador escolher ε mais alto se compreender trade-off.

### 7.2 Tabela de trade-offs

| Decisão | + | − |
|---|---|---|
| **FedAvg puro (sem DP)** | Modelo útil | Gradientes vazam PII |
| **FedAvg + DP-SGD** | Privacidade forte | Modelo ~5-15% pior em benchmarks |
| **+ Secure Aggregation** | Servidor não vê individual | +30% latência, +complexidade |
| **+ FHE** | Garantia criptográfica máxima | ~1000x slowdown, inviável para MVP |
| **Nível 1 (pesos correlação)** | Simples, defensável | Modelo limitado |
| **Nível 2 (embeddings)** | Expressivo | Mais superfície de ataque |
| **Nível 3 (LLM fine-tune)** | Calibração fina do Mentor | Caro, complex unlearning |
| **Opt-in por Zelador** | Compliance forte | Menos dados, modelo menos calibrado |
| **Opt-out por Odu** | Respeita Pilar 4 | Reduz utilidade para Cabala-Odu correlation |

### 7.3 Quando NÃO vale a pena

FedAkasha **não vale a pena** se:

- Número de Zeladores for < 5 (dataset federado é pequeno demais — overfitting local).
- Não houver rede entre Zeladores (sem motivo para federar).
- O modelo-alvo já tem bom desempenho com dados centralizados de 1 Zelador.

**Recomendação:** **começar pequeno** — MVP com 3 Zeladores da linhagem do Zelador principal, dados sintéticos para validar pipeline, **só depois** escalar.

---

## 8. Recomendação e roadmap

### 8.1 Recomendação principal

**Implementar FedAkasha faseadamente, começando com Nível 1 (pesos de correlação) + DP-SGD, usando Flower, hospedado em região BR, com consentimento específico e AIPD aprovada por DPO.**

**Justificativa:**

- Nível 1 tem **defensibilidade matemática** — matriz 7×7 é tão pequena que 1 consulente não pode reidentificar nada mesmo sem DP.
- DP-SGD com ε=1 é o **sweet spot** entre privacidade e utilidade.
- Flower é o framework mais maduro + agnóstico + com DP suportado.
- Hospedagem BR evita Art. 33.
- Consentimento específico + AIPD cobrem Art. 7 + Art. 46.

### 8.2 Roadmap proposto (Wave 31+)

#### **Wave 31.1 — FedAkasha MVP (Nível 1, dados sintéticos)**

**Escopo:**

- 1 arquivo Python: `services/fedakasha/server.py` (Flower server).
- 1 arquivo Python: `services/fedakasha/client.py` (Flower client sidecar).
- 1 arquivo TS: `apps/akasha-portal/src/lib/fedakasha/calibration.ts` (fetch W_t).
- Dados sintéticos (script `scripts/generate-synthetic-sessions.py`).
- 3 Zeladores simulados em docker-compose.
- Teste E2E: round 0 → round 1 com DP-SGD, audit log correto.

**Critérios de aceitação:**

- ✓ Round de federação completa em <5min com 3 clientes sintéticos.
- ✓ Matriz W_t muda entre rounds (utilidade não-zero).
- ✓ Audit log contém timestamp, K, ε, σ por round.
- ✓ mTLS configurado entre client/server.
- ✓ Typecheck + tests passam.

**Esforço:** 1-2 dias.

**Riscos:**

- Setup Flower pode ter curva de aprendizado.
- Python sidecar em Next.js é fricção operacional.
- **Mitigação:** começar com `docker-compose` para tudo, avaliar complexidade antes de integrar com portal.

#### **Wave 31.2 — FedAkasha MVP com dados reais (2-3 Zeladores)**

**Escopo:**

- Onboarding de 2-3 Zeladores da linhagem (consentimento explícito).
- Migração do client sidecar para setup real (não docker-compose).
- Atualizar política de privacidade + termo de consentimento.
- AIPD elaborada (template + revisão DPO).
- Monitoramento: dashboard de rounds no `/admin/universalism`.

**Critérios de aceitação:**

- ✓ 3 Zeladores reais participando por 4+ semanas.
- ✓ Audit log LGPD-compliant.
- ✓ Nenhuma PII vazou (verificação manual + auditoria automatizada de pacotes).
- ✓ DPO aprovou protocolo.

**Esforço:** 1 semana (incluindo onboarding DPO).

**Riscos:**

- Zeladores podem recusar (compliance, carga).
- Performance pode degradar com dados reais.
- **Mitigação:** começar com Zeladores tecnicamente próximos (mesmo terreiro/linhagem).

#### **Wave 32.x — Secure Aggregation (Bonawitz 2017)**

**Escopo:**

- Implementar (ou usar lib) protocolo SecAgg.
- Adicionar resiliência a dropout (Zelador offline no meio do round).
- Audit adicional: log das chaves públicas, não das privadas (óbvio).

**Esforço:** 1-2 semanas.

**Riscos:** complexidade criptográfica — considerar usar lib (CrypTen ou similar) em vez de implementar.

#### **Wave 33.x — Nível 2 (embeddings de padrões)**

**Escopo:**

- Migrar de matriz 7×7 para encoder neural (PyTorch + Opacus).
- Flower strategy atualizada para FedProx (lida melhor com clientes heterogêneos).
- DP forte (ε ≤ 0.5).
- Avaliar SISA ou federated unlearning.

**Esforço:** 2-3 semanas.

**Riscos:** modelo neural tem superfície de ataque maior — exige SecAgg obrigatório.

#### **Wave 34.x+ — Nível 3 (LLM fine-tuning) — exploração**

**Só iniciar se Wave 31-32 demonstrarem valor.** LLM fine-tuning federado é research-grade; avaliar demanda real antes.

### 8.3 Critérios de "go/no-go" antes de cada wave

Antes de cada wave subsequente:

1. **DPO aprovou?** (AIPD atualizada + consentimento específico OK)
2. **Audit log LGPD está íntegro?** (verificação manual + automatizada)
3. **Métrica de utilidade justifica?** (correlação de feedback melhorou ≥ X%?)
4. **Nenhum incidente de privacidade em produção?** (relatórios Zelador + logs)
5. **Recursos para Wave 32.x existem?** (dev senior + DPO + orçamento cloud)

Se algum "não" → **pausar e investigar**.

### 8.4 Cross-references com Pilares existentes

- **Pilar 4 (Odu/Ifá):** FedAkasha precisa de opt-out cultural explícito (Doc 25 §2). Precedente: terreiro tem palavra final.
- **Pilar 6 (Human Design) + 7 (Gene Keys):** são "traduzidos" (ADR 0002) — federação não muda isso, só calibra como o Mentor correlaciona com outros Pilares.
- **ADR 0004 (multi-tenant):** FedAkasha é **extensão** que não conflita. Multi-tenant é por consulente dentro de 1 Zelador; FedAkasha é entre Zeladores.
- **ADR 0005 (grafo de conhecimento):** FedAkasha pode alimentar o grafo com pesos de correlação aprendidos — sinergia natural.

---

## 9. Próximos passos imediatos

1. **Validar este relatório com DPO + Zelador principal** antes de qualquer código.
2. **Atualizar `docs/25_visao-akasha.md`** para mencionar FedAkasha como iniciativa de Wave 31+.
3. **Re-rodar web queries** (Flower, PySyft releases, ANPD resolução) para validar citações `[VERIFY]`.
4. **Esboçar ADR-0007 (FedAkasha arquitetura)** com base neste relatório.
5. **Criar `services/fedakasha/` skeleton** (Wave 31.1) com 1 arquivo Python + 1 teste dummy.
6. **Definir política de ε default + tier** (consultar DPO).

---

## 10. Conclusão

**Sim, é possível e vale a pena.** Federated Learning + Differential Privacy + Secure Aggregation permitem que múltiplos Zeladores contribuam para uma "consciência coletiva" do Akasha (calibração compartilhada do Mentor) **sem expor PII de consulentes**.

A arquitetura proposta:

- **Tecnicamente viável** (Flower + Opacus + Flower strategies).
- **LGPD-compliant** (FedAvg + DP ε=1 + mTLS + audit log + consentimento específico).
- **Culturalmente respeitosa** (opt-out por Odu, opt-in por Zelador).
- **Faseável** (começa com pesos de correlação 7×7, evolui para embeddings neurais, LLM só se justificar).
- **Economicamente viável** (Flower é open-source, hospedagem Python barata).

**Recomendação final:** **NÃO implementar agora** (constraint Wave 30 — research + planning apenas). **Iniciar Wave 31.1** com MVP Flower + DP em dados sintéticos, **3-5 dias**, sem tocar dados reais de consulentes.

A visão do Akasha é **universalista + visceral** (ADR 013). Universalismo exige **síntese entre tradições**; visceralidade exige **proteção da intimidade do consulente**. FedAkasha é o casamento técnico dessas duas exigências.

---

## Anexo A — Referências canônicas [VERIFY]

### Papers fundamentais

- McMahan, B., Moore, E., Ramage, D., Hampson, S., & Arcas, B. A. (2017). *Communication-efficient learning of deep networks from decentralized data*. AISTATS.
- Abadi, M., Chu, A., Goodfellow, I., McMahan, H. B., Mironov, I., Talwar, K., & Zhang, L. (2016). *Deep learning with differential privacy*. ACM CCS.
- Bonawitz, K., Ivanov, V., Kreuter, B., Marcedone, A., McMahan, H. B., Patel, S., ... & Seth, K. (2017). *Practical secure aggregation for privacy-preserving machine learning*. ACM CCS.
- Dwork, C., & Roth, A. (2014). *The algorithmic foundations of differential privacy*. Foundations and Trends in Theoretical Computer Science.
- Li, X., Tramer, F., Liang, P., & Hashimoto, T. (2022). *Large language models can be strongly differentially private learners*. ICLR 2022 (DP fine-tuning).
- Bourtoule, L., Chandrasekaran, V., Choquette-Choo, C. A., Jia, H., Travers, A., Zhang, B., ... & Papernot, N. (2021). *Machine unlearning*. IEEE S&P (SISA).

### Frameworks

- Flower: https://github.com/adap/flower
- PySyft: https://github.com/OpenMined/PySyft
- TensorFlow Federated: https://github.com/tensorflow/federated
- Opacus: https://github.com/pytorch/opacus
- TenSEAL: https://github.com/OpenMined/TenSEAL
- CrypTen: https://github.com/facebookresearch/CrypTen

### LGPD / ANPD

- Lei 13.709/2018 (LGPD): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- Resolução CD/ANPD nº 15/2024 (IA — verificar número exato): site da ANPD
- Guia Orientativo ANPD para Agentes de Tratamento: site da ANPD

### Internos

- `docs/25_visao-akasha.md`
- `docs/legal/DATA_FLOWS.md`
- `docs/adrs/0004-multi-tenant-consulente-mcp.md`
- `packages/mentor/AGENTS.md`
- Wave 28.7 (aggregation helpers) — relatório do admin universalism
- Wave 30 research planning (`.hermes/plans/wave-30-research-planning-2026-06-25.md`)

---

**FIM do relatório.**