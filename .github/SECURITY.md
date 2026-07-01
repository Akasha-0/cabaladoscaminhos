# 🔒 Security Policy — Cabala dos Caminhos

> **Versão:** 1.0 | **Data:** 2026-07-01 | **Wave:** 33 (GITHUB TEMPLATES 5/8)
> **Idioma:** PT-BR (EN follows)

A Cabala dos Caminhos leva a segurança a sério — não apenas dos nossos sistemas, mas também dos dados pessoais e espirituais confiados por nossa comunidade. Este documento descreve como reportar vulnerabilidades, versões suportadas, e o que esperar de nós.

---

## 🌐 Idiomas / Languages

- 🇧🇷 **Português (Brasil)** — este arquivo
- 🇺🇸 **English** — translated inline below each section

---

## ✅ Supported Versions

Use esta tabela para entender quais versões recebem patches de segurança:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| `main` branch | ✅ Yes        | Desenvolvimento ativo |
| Última minor release (`v0.X.Y`) | ✅ Yes | Recebe patches de segurança |
| Penúltima minor release | ⚠️ Critical only | Apenas CVEs críticos |
| Versões mais antigas | ❌ No         | Faça upgrade |

> 🇺🇸 **EN:** `main` branch and latest minor release receive security patches. Older releases receive critical fixes only; very old versions are unsupported.

---

## 📢 Reporting a Vulnerability

### 🔐 Disclosure Privado (OBRIGATÓRIO para vulnerabilidades exploráveis)

**NÃO abra issue pública** para vulnerabilidades exploráveis. Use o canal privado:

📧 **Email:** `security@cabaladoscaminhos.com`
🔐 **Assunto:** `[SECURITY] <título breve>`
📨 **PGP Key:** (opcional — solicite a chave pública por email primeiro)

### 📋 O que Incluir no Reporte

Para acelerar a triagem, inclua:

1. **Descrição técnica:** o que é a vulnerabilidade e como funciona
2. **Impacto:** o que um atacante pode fazer (leak de dados, RCE, privilege escalation, etc.)
3. **Componentes afetados:** endpoint, arquivo, versão, commit SHA
4. **Passos para reproduzir:** PoC (proof of concept) mínimo
5. **Ambiente:** staging, production, ou local; URL completa
6. **Possível mitigação:** se você tem uma ideia, compartilhe
7. **Sua info de contato:** para follow-up
8. **Disclosure preference:** você prefere crédito público? Anônimo?

### ⏱️ O que Esperar Depois do Reporte

| Etapa | SLA | Ação |
|-------|-----|------|
| **Acknowledgment** | 48 horas | Confirmamos recebimento e atribuímos um ID |
| **Triage** | 7 dias | Avaliamos severidade, validade e impacto |
| **Status updates** | A cada 7 dias | Mantemos você informado até resolução |
| **Fix & disclosure** | 30-90 dias | Patch + CVE (se aplicável) + advisory público |

> 🇺🇸 **EN:** We acknowledge within 48h, triage within 7d, provide weekly updates, and aim to patch within 30-90d depending on severity.

### 🚫 O que NÃO Fazer

- ❌ Não abra issue pública com detalhes de exploit
- ❌ Não abuse da vulnerabilidade além do necessário para provar o impacto
- ❌ Não acesse dados de outros usuários (mesmo que acessível)
- ❌ Não realize ataques de negação de serviço
- ❌ Não faça social engineering contra nossa equipe ou comunidade

### ✅ Boas Práticas (Safe Harbor)

Quando você segue esta política de disclosure, comprometemo-nos a:

- ✅ Tratar você com respeito e profissionalismo
- ✅ Não iniciar ação legal contra você
- ✅ Coordenar disclosure público conjunto (90 dias máx)
- ✅ Reconhecer sua contribuição (se desejado)
- ✅ Aplicar patches com prioridade apropriada

> 🇺🇸 **EN:** We commit to safe harbor for good-faith research following this policy.

---

## 🛡️ Áreas Sensíveis & Tratamento Especial

### 🔐 Dados Pessoais & Espirituais (LGPD)

A Cabala dos Caminhos trata dados de mapa astral, mapa numerológico e preferências espirituais como **dados pessoais sensíveis** sob LGPD Art. 11 (§1, II — dado sobre crença religiosa).

**Compromissos:**

- ✅ Criptografia at-rest e in-transit (TLS 1.3)
- ✅ Exportação de dados (Art. 18, V) — usuário pode baixar tudo
- ✅ Exclusão completa (Art. 18, VI) — usuário pode solicitar
- ✅ Anonimização após 24 meses de inatividade
- ✅ Logs de auditoria para qualquer acesso a dados pessoais
- ✅ DPO (Data Protection Officer) designado

**Reportes sobre vazamento de dados pessoais têm SLA de 24h** (não 48h) sob LGPD Art. 48.

### 🌙 Conteúdo Espiritual / Cultural

Vulnerabilidades que afetam a integridade de conteúdo cultural (ex: termos sagrados, atribuição incorreta de odú, datas cerimoniais) são tratadas com **alta prioridade** mesmo quando tecnicamente menores, porque afetam a confiança da comunidade.

### 💳 Pagamentos (Stripe)

Vulnerabilidades que afetam checkout, subscriptions ou marketplace têm **severidade crítica** e SLA de 24h.

### 🔑 Autenticação & Sessões

Auth bypass, session fixation, password reset flaws, JWT forgery — **severidade crítica**, SLA de 24h.

---

## 🏆 Reconhecimentos & Bounty

### 🌟 Hall of Fame

Contribuidores que reportaram vulnerabilidades válidas são reconhecidos (com permissão):

<!-- Lista é atualizada após cada disclosure coordenada. -->

_(Em breve — primeiro disclosure coordenado será listado aqui.)_

> 🇺🇸 **EN:** Contributors who report valid vulnerabilities are recognized (with permission).

### 💰 Bounty Program

**Status:** 🚧 Planejado para Q4 2026

- Hoje: reconhecemos publicamente + swag espiritual (kit Cabala)
- Q4 2026: lançamos programa formal via HackerOne ou Open Bug Bounty
- Valores: a definir (começando em $50 para low, até $2000+ para critical)

> 🇺🇸 **EN:** Bug bounty program planned for Q4 2026. Today we offer public recognition + spiritual swag.

---

## 📚 Recursos Adicionais

- 📄 [Política LGPD completa](./docs/LGPD-COMPLIANCE.md) _(em breve)_
- 🔐 [Threat model](./docs/SECURITY-THREAT-MODEL.md) _(em breve)_
- 📋 [Security advisories publicados](https://github.com/Akasha-0/cabaladoscaminhos/security/advisories)
- 🛡️ [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- 🇧🇷 [LGPD — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## 📞 Contato

| Canal | Uso |
|-------|-----|
| 📧 security@cabaladoscaminhos.com | Reportes privados, questões sensíveis |
| 🐛 GitHub Issue (security template) | Discussões públicas sobre hardening |
| 💬 Discord/Slack da comunidade | Dúvidas gerais (NÃO para vulnerabilidades) |

---

## 🕉️ Compromisso Espiritual

> *A segurança não é apenas técnica — é ética. Protegemos os dados que a comunidade nos confia com o mesmo zelo com que protegemos um espaço sagrado.*

> 🇺🇸 **EN:** Security is not just technical — it's ethical. We protect the data our community entrusts to us with the same care as a sacred space.

---

**Última atualização:** 2026-07-01 | **Mantenedor:** @security-team | **Revisão:** anual ou após incidente grave