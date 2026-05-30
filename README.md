<!-- PROJECT BANNER -->
<div align="center">

# 🔮 Cabala dos Caminhos

**Tecnologia Sagrada de Alinhamento Espiritual**

![Status](https://img.shields.io/badge/status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Tests](https://img.shields.io/badge/Tests-1728%20%E2%9C%94%20passed-brightgreen)
![Sprints](https://img.shields.io/badge/Sprints-215%20completed-blue)
[![CI](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/ci.yml/badge.svg)](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/ci.yml)
[![Deploy](https://vercel.com/nezha-sandbox/test-deploy(button)/image.svg)](https://cabaladoscaminhos.vercel.app)

**Plataforma de autoconhecimento espiritual unificado — correlacionando Cabala, Ifá, Astrologia, Numerologia, Tarot e Chakras**

[Site](https://cabaladoscaminhos.com) • [Documentação](docs/) • [Progresso](PROGRESS.md) • [Contribuir](CONTRIBUTING.md)

</div>

---

## ✨ O que é a Cabala dos Caminhos?

A Cabala dos Caminhos é uma **plataforma sagrada de tecnologia espiritual** que conecta sistemas místicos ancestrais para revelar o seu mapa da alma.

> *"Assim como é em cima, também é embaixo."*
> — Hermetismo

O sistema correlaciona **16 sistemas simbólicos** para fornecer insights profundos sobre:
- 🔢 **Numerologia** — caminho de vida e destino
- 🏹 **Ifá/Odú** — Merindilogun e dezesseis Odús
- ⭐ **Astrologia** — mapa natal e trânsitos
- 🃏 **Tarot** — 78 cartas com interpretadores IA
- ⚡ **Chakras** — os sete centros energéticos
- 🌳 **Árvore da Vida** — as 10 Sephirot
- 📅 **Calendário Espiritual** — correspondências por dia da semana

---

## 🚀 Quick Start

```bash
# Clone o repositório
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a aplicação.

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Linguagem** | TypeScript 5 |
| **UI** | Tailwind CSS 4 + shadcn/ui |
| **Base de Dados** | Prisma 7 + PostgreSQL |
| **Cache** | Redis + ioredis |
| **Auth** | Supabase SSR + JWT |
| **Pagamentos** | Stripe |
| **IA** | OpenAI API + Minimax API |
| **Testing** | Vitest + Playwright |
| **Deploy** | Vercel + Docker |

---

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # 400+ API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── mapa/         # Mapa da Alma
│   │   └── calendario/   # Calendário espiritual
│   ├── components/       # Componentes React
│   │   ├── ui/           # Design system
│   │   ├── auth/         # Autenticação
│   │   ├── mapa/         # Mapa components
│   │   └── astrologia/   # Astrology components
│   ├── lib/              # Core libraries
│   │   ├── engines/      # Spiritual engines
│   │   ├── ai/           # AI generators
│   │   └── prisma/       # Database client
│   └── hooks/            # React hooks
├── prisma/               # Database schema
├── tests/                # Test suite (1728 tests)
└── docs/                 # Documentation
```

---

## 🌟 Funcionalidades Principais

### 🧭 Mapa da Alma Completo
Geração de perfil espiritual unificado combinando:
- Cálculo numerológico completo
- Leitura de Odú Ifá (Merindilogun)
- Mapa astral com posições planetárias
- Interpretação tarot com IA
- Painel de chakras interativo
- Visualização da Árvore da Vida

### 💡 Insights com IA
Geradores de insights baseados em LLMs:
- Propósito de vida
- Dons espirituais
- Desafios kármicos
- Preceitos e quizilas
- Mensagem semanal personalizada

### 📅 Calendário Energético
Sistema de correspondências diário:
- Odú regente por dia da semana
- Orixá do dia com cores e chakras
- Sephirah cabalistico
- Ebós recomendados
- Quizilas a evitar

### 🔐 Sistema de Pagamentos
- Integração Stripe completa
- Planos de assinatura
- Créditos para funcionalidades premium
- Webhooks configurados

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in CI mode
npm run test:run

# Open Vitest UI
npx vitest ui
```

**1728 testes** cobrindo engines, componentes e API routes.

---

## 🐳 Docker

```bash
# Build the image
docker build -t cabaladoscaminhos .

# Run with docker-compose
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

---

## 📊 Métricas de Qualidade

O projeto mantém tracking automático de qualidade com:
- Cobertura de testes
- Análise de complexidade
- Debt técnico
- Health score

Ver [quality-report-latest.json](quality-report-latest.json) para detalhes.

---

## 🤝 Contributing

Contribuições são bem-vindas! Por favor leia [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

```bash
# Fork o projeto
# Crie uma branch
git checkout -b feature/amazing-feature

# Commit suas mudanças
git commit -m 'feat: add amazing feature'

# Push para a branch
git push origin feature/amazing-feature

# Abra um Pull Request
```

---

## 📜 Licença

Este projeto está sob licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

Inspirado nas tradições:
- **Cabala** — misticismo judaico
- **Ifá** — tradição Yoruba/Nagô
- **Astrologia** — sabedoria celestial
- **Hermetismo** — filosofia perenne

---

<div align="center">

**⚡ Feito com propósito — aligning the microcosm with the macrocosm ⚡**

</div>