<!-- PROJECT BANNER -->
<div align="center">

# 🌌 Akasha Portal — Cabala dos Caminhos

**Comunidade Viva de Espiritualidade Universalista + IA**

![Status](https://img.shields.io/badge/status-Building%20Community-orange)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
[![CI](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/ci.yml/badge.svg)](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/ci.yml)

> **Uma rede social espiritual** onde pessoas compartilham, aprendem e evoluem juntas, com **IA curadora** trazendo correlações entre tradições e artigos científicos com evidência comprovada.

[Visão Completa](VISION.md) • [Documentação](docs/) • [Contribuir](CONTRIBUTING.md)

</div>

---

## ✨ O que é o Akasha Portal?

O Akasha Portal é uma **comunidade online de espiritualidade universalista** que une pessoas interessadas em despertar, com **Inteligência Artificial co-evoluindo** ao lado da comunidade.

### 🌱 Propósito

Criar um espaço onde pessoas podem:

- **Compartilhar** experiências, práticas e descobertas espirituais
- **Aprender** com base em evidências científicas e tradições ancestrais
- **Evoluir** juntas em consciência — não um guru dizendo, mas uma comunidade crescendo

### 🤖 O papel da IA

A IA dentro do sistema **não é prescritora** (não fala "faça isso"). Ela é **curadora**:

- 📚 Traz **artigos científicos** com embasamento (Reiki, ayahuasca, psilocibina, meditação,...)
- 🔗 Mostra **correlações** entre tradições (numerologia + Odu + astrologia + tantra)
- 💡 Sugere **leituras** personalizadas pro seu caminho
- 🌐 **Co-evolui** — quanto mais a comunidade cresce, mais inteligente a IA fica

---

## 🧩 Funcionalidades

### 🔬 Motor Espiritual (base sólida construída)

- 🔢 **Numerologia Cabalística** — caminho de vida, expressão, motivação
- 🏹 **Odu (Ifá)** — 16 odus, orixás regentes, preceitos cerimoniais
- ⭐ **Astrologia** — mapa natal, signo, ascendente, planetas
- 🔮 **Numerologia Tântrica** — chakras dominantes
- 🌳 **Árvore da Vida** — 10 Sefirot
- 🔄 **Engine de correlação** — cruza os mapas pra dar insights

### 🌐 Camada social (nova)

- 📱 **Timeline personalizada** — posts de quem você segue + grupos + tradições
- 👥 **Grupos por tradição** — Cabala, Ifá, Xamanismo, Tantra, Reiki,...
- 💬 **Comentários threaded** — diálogo respeitoso e profundo
- 📚 **Biblioteca coletiva** — papers, artigos, livros com nível de evidência
- 🤝 **Seguir** usuários — acompanhe a jornada de cada um
- 🔔 **Notificações** — atividade relevante pra você
- 🔒 **Perfis com privacidade** — público, comunidade ou privado

### 🤖 IA Curadora (Fase 3)

- **Chat curador** — "me explica o que é xamanismo", "acha artigos sobre psilocibina"
- **Recomendações** de artigos e pessoas baseado no seu perfil espiritual
- **Correlações automáticas** — encontra padrões entre tradições
- **Co-evolução** — feedback da comunidade melhora a IA

---

## 🛠 Stack técnica

- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind** + sistema de design espiritual (`SpiritualWidgetSystem`)
- **Prisma** + **PostgreSQL/Supabase**
- **Supabase Auth** + **Row Level Security**
- **pgvector** para busca semântica (Fase 3)
- **IA** via API Anthropic / MiniMax (já integrado)

---

## 📂 Estrutura

```
src/
├── app/
│   ├── (auth)/          # login, signup, onboarding espiritual
│   ├── (community)/     # home, explorar, grupos, biblioteca
│   ├── (profile)/       # perfil público, mapa espiritual
│   ├── (tools)/         # mesa real, oráculo (ferramentas pessoais)
│   └── api/
├── components/
│   ├── dashboard/       # widgets redesenhados
│   ├── community/       # post card, comment thread, group card
│   └── shared/
├── lib/
│   ├── engines/         # motor espiritual (numerologia, Odu, correlação)
│   ├── community/       # lógica social (posts, follows, likes)
│   └── ai/              # curador IA (RAG sobre biblioteca)
└── prisma/
    └── schema.prisma    # User, SpiritualProfile, Post, Group, Article...
```

---

## 🚀 Quick start

```bash
# instalar dependências
npm install

# rodar dev server
npm run dev

# abrir http://localhost:3000
```

Documentação completa em [`docs/`](docs/).

---

## 🗺️ Roadmap

Veja [`VISION.md`](VISION.md) para a visão completa e roadmap em 3 fases:

1. **Fase 1 — MVP comunidade** (4-6 semanas): auth, perfil espiritual, posts, follows
2. **Fase 2 — Conhecimento + grupos** (4-6 semanas): grupos por tradição, biblioteca, artigos
3. **Fase 3 — IA Curadora** (4-6 semanas): RAG, recomendações, correlações automáticas

---

## 📜 Filosofia

- **Respeitoso** com todas as tradições (universalista, não proselitista)
- **Científico** quando tem evidência, **honesto** quando não tem
- **Comunitário** — "juntos evoluindo", não "guru dizendo"
- **Cuidado** com promessas — Reiki não cura câncer, ayahuasca não é pra todo mundo
- **Português** — público-alvo fala PT-BR

---

## 🤝 Como contribuir

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md). Resumo:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feat/minha-feature`)
3. Commit seguindo conventional commits (`feat:`, `fix:`, `docs:`)
4. Push e abra PR

---

## 📄 Licença

MIT — Veja [`LICENSE`](LICENSE).

---

> *"Plante a semente da consciência. Colha uma comunidade desperta."* 🌱