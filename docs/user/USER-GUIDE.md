# Guia do Usuário — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-30 | **Wave:** 32 (DOCUMENTATION 6/8)
> **Idioma primário:** PT-BR
> **Público:** praticantes, buscadores, curiosos em espiritualidade universalista
> **Stack resumido:** Next.js 16 + Supabase + IA Akasha + Oráculos (Astrologia, Numerologia)

---

## Bem-vindo ao Akasha

O Akasha é uma **comunidade online de espiritualidade universalista com IA curadora**. Aqui você pode praticar, estudar, compartilhar e fazer perguntas — sem guru, sem prescrição, sem caminho único.

Este guia mostra como usar todas as funcionalidades, do primeiro acesso até os recursos avançados.

---

## 1. Primeiros passos

### 1.1 Criar conta

1. Acesse [akashaportal.com.br](https://akashaportal.com.br)
2. Clique em **"Entrar"** (canto superior direito)
3. Selecione **"Criar conta"**
4. Preencha: email, senha (mínimo 8 caracteres), nome de exibição
5. Confirme o email pelo link que enviaremos
6. Pronto — você está dentro

> **Dica:** durante a beta (até agosto/2026), algumas contas passam por uma **conversa de 20 minutos** com o operador. Esse processo humano garante que a comunidade comece com qualidade.

### 1.2 Configurar perfil

Após o login, vá em **Meu perfil → Editar**:

- **Foto** (opcional mas recomendado)
- **Nome de exibição** — como a comunidade te vê
- **Bio** (até 280 caracteres) — quem você é, o que busca
- **Tradição favorita** — qual tradição mais ressoa com você (Candomblé, Cabala, Astrologia, Tantra, Meditação, Xamanismo, Umbanda, Reiki, Outra)
- **Interesses** — tags para personalizar seu feed

> **Por que pedimos tradição favorita?** Para personalizar sua experiência. Você pode mudar a qualquer momento e seguir várias tradições simultaneamente.

### 1.3 Onboarding guiado

No primeiro acesso, oferecemos um **tour guiado de 60 segundos** que cobre:
- Feed da comunidade
- Akasha IA (chat curador)
- Oráculos (mapa astral, numerologia)
- Marketplace de serviços

Você pode pular e revisitá-lo em **Configurações → Tour guiado**.

---

## 2. Como usar a comunidade

### 2.1 Criar um post

1. No feed, clique em **"Compartilhar"**
2. Escreva o texto (até 5.000 caracteres)
3. Adicione imagens (opcional, até 4)
4. Escolha a **tradição** do post
5. Marque como **draft** ou publique direto
6. Clique **"Publicar"**

> **Privacidade:** posts podem ser públicos (visíveis para toda a comunidade) ou restritos a grupos específicos. Você escolhe na hora de postar.

### 2.2 Comentar e reagir

- **Comentar:** clique no ícone de comentário em qualquer post
- **Responder:** use o botão **"Responder"** no comentário
- **Reagir:** emojis curados (🔥 Gratidão, 💡 Insight, 🙏 Reverência, 🌱 Curiosidade, 💬 Diálogo)
- **Salvar:** ícone de marcador para ler depois

### 2.3 Mensagens privadas

1. Acesse o perfil de alguém
2. Clique em **"Mensagem"**
3. Escreva (até 2.000 caracteres por mensagem)
4. Enter para enviar, Shift+Enter para nova linha

> **Importante:** mensagens privadas são criptografadas em trânsito. O Akasha **não** lê o conteúdo das suas mensagens para treinar a IA.

### 2.4 Seguir pessoas e tradições

- **Seguir usuário:** botão **"Seguir"** no perfil
- **Seguir tradição:** clique na tag de tradição (ex: #Cabalá)
- **Feed personalizado:** você vê posts das tradições e pessoas que segue em ordem cronológica reversa
- **Deixar de seguir:** mesma rota, botão vira **"Seguindo"**

---

## 3. Marketplace

O marketplace conecta praticantes a quem busca serviços espirituais (consultas, leituras, curas).

### 3.1 Oferecer um serviço

1. Vá em **Marketplace → Oferecer serviço**
2. Preencha:
   - **Título** (até 80 caracteres)
   - **Descrição** (até 1.500 caracteres)
   - **Categoria** (consulta, leitura, cura, ritual, mentoria)
   - **Duração** (em minutos)
   - **Preço** (em BRL)
   - **Tradição**
   - **Disponibilidade** (calendário semanal)
3. Configure **pagamento via Stripe Connect**
4. Publique

> **Verificação:** novos ofertantes passam por uma checagem de identidade (CPF + selfie). Leva até 48h.

### 3.2 Reservar (booking) um serviço

1. Navegue em **Marketplace → Explorar**
2. Filtre por tradição, preço, disponibilidade
3. Clique em um serviço
4. Escolha **data e horário**
5. Confirme o pagamento (cartão ou Pix)
6. Você recebe um email de confirmação com link para a videochamada

> **Política de cancelamento:** cancele até 24h antes para reembolso integral. Após isso, 50%.

### 3.3 Como funciona o pagamento

- O cliente paga via **Stripe**
- O valor fica **retido** até a conclusão do serviço
- Após confirmação mútua, o repasse é feito em **D+2 úteis** para a conta do ofertante
- O Akasha retém **15%** de taxa de plataforma

---

## 4. Akasha IA (chat curador)

A Akasha é uma IA curiosa que **traduz entre tradições e a ciência moderna**, sem prescrever caminhos.

### 4.1 Como perguntar

1. Acesse **Akasha → Conversar**
2. Escreva sua pergunta em linguagem natural
3. Receba resposta em **streaming** (texto aparece em tempo real)
4. Pode enviar follow-ups na mesma conversa

**Exemplos de perguntas:**
- "O que é Orí em Candomblé e como se conecta com a Cabala?"
- "Como a meditação Vipassana se relaciona com neurociência?"
- "Quais são as diferenças entre Reiki e cura xamânica?"
- "Posso praticar Candomblé e ser ateu?"

### 4.2 Como interpretar respostas

Toda resposta da Akasha vem com:
- **Citações** de fontes acadêmicas e tradicionais
- **Nível de confiança** (🟢 Alta, 🟡 Média, 🔴 Baixa)
- **Tradições consultadas** (ex: "Cruzou 3 tradições: Cabala, Tantra, Meditação")
- **Sugestão de leitura** (links para artigos curados)

### 4.3 Dar feedback

- **👍 Útil** ou **👎 Não útil** em cada resposta
- Marque **"Quero aprofundar"** para a Akasha detalhar mais
- Você pode **resetar a conversa** a qualquer momento (botão no topo)

### 4.4 Limites da Akasha

- **30 mensagens/minuto** por usuário (rate limit)
- Não dá conselho médico, psicológico ou financeiro
- Não substitui acompanhamento de um líder espiritual humano
- Pode recusar perguntas sobre: violência, ódio, autolesão, atividades ilegais

---

## 5. Oráculos

### 5.1 Mapa astral completo

1. Vá em **Oráculos → Mapa Astral**
2. Informe: **data, hora e local de nascimento**
3. Aguarde o processamento (~15 segundos)
4. Receba:
   - Posição dos 10 planetas nos 12 signos
   - 12 casas astrológicas
   - Aspectos principais (conjunção, oposição, trígono, quadratura)
   - **Mesa Real Cigana** (mesa de 32 cartas baseada no seu mapa)
   - Cruzamento das cartas com 4 mapas secundários (Cabala, Numerologia, I Ching, Runas)

### 5.2 Numerologia cabalística

1. Vá em **Oráculos → Numerologia**
2. Informe seu **nome completo de batismo** e **data de nascimento**
3. Receba:
   - **Gematria** (valor numérico das letras em hebraico)
   - **Caminho de vida** (número principal)
   - **Número de expressão** e **número da alma**
   - Cruzamento comTarot e Astrologia

### 5.3 Outros oráculos (em breve)

- **Tarot Pessoal** — carta do dia e tiragens de 3, 5 e 10 cartas
- **I Ching** — método clássico com moedas
- **Runas** — Elder Futhark + interpretação moderna
- **Mesa Real Cigana** — cruzamento com mapa astral

---

## 6. Privacidade e LGPD

### 6.1 Seus direitos (LGPD Art. 18)

- **Acesso:** ver todos os dados que temos sobre você → `Configurações → Exportar dados`
- **Correção:** editar perfil, email, dados de nascimento
- **Exclusão:** apagar conta e todos os dados → `Configurações → Apagar conta`
- **Portabilidade:** baixar JSON com tudo (posts, comentários, mensagens, mapa astral)
- **Revogação de consentimento:** opt-out de emails, push, analytics

### 6.2 Opt-in (nada é automático)

| Recurso | Padrão | Onde ativar |
|---|---|---|
| Email transacional | ✅ Ativo (obras) | Não configurável |
| Newsletter semanal | ❌ Opt-in | `Configurações → Emails` |
| Push notifications | ❌ Opt-in | `Configurações → Notificações` |
| Analytics (PostHog) | ❌ Opt-in | `Configurações → Privacidade` |
| Personalização IA | ❌ Opt-in | `Configurações → IA` |

### 6.3 Segurança

- **Senha:** mínimo 8 caracteres, com letras, números e símbolo
- **2FA (em breve):** TOTP via app autenticador
- **Sessões:** você pode ver e revogar sessões ativas em `Configurações → Segurança`
- **Criptografia:** todas comunicações via HTTPS/TLS 1.3

---

## 7. FAQ rápido

**P: Akasha é uma religião?**
R: Não. É uma comunidade de praticantes de várias tradições (e de quem ainda não escolheu nenhuma).

**P: A Akasha IA é confiável?**
R: Ela cita fontes, devolve perguntas, e tem humildade epistêmica. Mas **não substitui** um mestre humano. Use como ponto de partida, não como verdade final.

**P: Quanto custa?**
R: Durante a beta, **grátis**. Marketplace cobra taxa de 15% sobre serviços.

**P: Posso usar sem experiência espiritual?**
R: Sim. Temos vagas para "buscadores" (pessoas em fase de exploração).

**P: Como reportar um bug?**
R: Veja seção "Suporte" abaixo.

---

## 8. Suporte e contato

- **Email:** suporte@akashaportal.com.br (resposta em até 24h)
- **Status da plataforma:** [status.akashaportal.com.br](https://status.akashaportal.com.br)
- **Reportar bug:** [github.com/Akasha-0/cabaladoscaminhos/issues](https://github.com/Akasha-0/cabaladoscaminhos/issues) (label `bug`)
- **Sugerir feature:** mesmo repositório, label `enhancement`
- **Chat da comunidade:** `#suporte` no Discord (link em `Configurações → Comunidade`)

---

## Próximo passo

Explore o **Tour guiado** em `Configurações → Tour` ou leia o **FAQ expandido** em `docs/user/FAQ-EXPANDED.md`.