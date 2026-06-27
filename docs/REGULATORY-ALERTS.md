# ⚠️ Regulatory Alerts — Akasha Portal

> Caderno de bordo do cron `akasha-research-weekly`
> Alertas legais e regulatórios relevantes pro projeto

---

## Status regulatório BR (2026-06-26)

### LGPD
- **Aplicável:** sim (Akasha coleta email, perfil, conversas)
- **DPO obrigatório:** depende do porte (volume + tipo de dado)
- **Status:** precisa adequar (privacidade, retenção, exclusão de dados)

### Substâncias controladas
- **Ayahuasca:** uso religioso liberado (CONAD), terapêutico em disputa
- **Psilocibina:** Schedule I no Brasil; FDA pode aprovar nos EUA 2026-2028
- **Cannabis medicinal:** ANVISA regulamentou em 2023

### Publicidade de saúde
- **CFM 1931/2009:** proibido anunciar "cura" de doenças
- **CONAR:** autorregulamentação publicitária; práticas sensíveis

### PNPIC/SUS
- 29 práticas integrativas ofertadas no SUS
- Crescimento de 670% em 5 anos (2017-2022)

---

## Alertas ativos

### 2026-06-26 — Alerta: conteúdo sobre psilocibina
**Severidade:** ALTA
**Descrição:** posts mencionando psilocibina devem ser marcados automaticamente como conteúdo sensível. Apresentar contexto científico (papers, regulamentação) sem nunca promover uso recreativo ou "cura".

**Ação:** adicionar disclaimer automático em posts com tag "psilocibina", "ayahuasca", "cannabis"

### 2026-06-26 — Alerta: promessas de cura
**Severidade:** ALTA
**Descrição:** frases como "cura câncer", "trata depressão", "resolve ansiedade" violam CFM 1931/2009 + podem gerar processo.

**Ação:** moderação automática flag + revisão humana obrigatória + remoção

### 2026-06-26 — Alerta: coleta de dados de conversas IA
**Severidade:** MÉDIA
**Descrição:** conversas com Akasha IA são dado pessoal (LGPD). Precisam de: opt-in explícito, retenção limitada, possibilidade de deletar.

**Ação:** schema `AiConversation` precisa de política de retenção; UI de "deletar histórico"

### 2026-06-26 — Alerta: apropriação cultural
**Severidade:** MÉDIA
**Descrição:** posts sobre práticas sagradas (Ifá, Candomblé, Cabala, Xamanismo) precisam de atribuição correta. Sem coautoria de praticantes da tradição = apropriação.

**Ação:** tag obrigatória `tradition` + co-autoria com praticantes em artigos curados

---

## Próximas verificações (cron semanal)

- Mudanças em FDA sobre psilocibina/MDMA (decisão esperada 2026-2028)
- ANVISA regulamentos de cannabis medicinal
- CFM atualizações sobre publicidade de práticas integrativas
- ANPD enforcement actions (multas, sanções)
