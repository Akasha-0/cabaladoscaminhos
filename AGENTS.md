# AKASHA — Constituição do Projeto (lida em toda sessão)

## O que é o Akasha
O Akasha NÃO é um app de numerologia cabalística, numerologia tântrica, dia de nascimento ou astrologia. O Akasha é um **sistema novo e unificado** — uma tecnologia espiritual de ponta — criado a partir da síntese dos fundamentos de 5 tradições/mapas, traduzidos em UMA linguagem universal comum. Assim como o Human Design nasceu da síntese de I Ching + astrologia + chakras + Cabala, e os Gene Keys nasceram de uma síntese própria, o Akasha deve nascer como um sistema próprio que **supera todos os existentes**.

## Problema atual (estado conhecido)
- O sistema entrega informação dividida em 5 mapas separados, não 1 sistema unificado.
- As interpretações são superficiais ("seu número é 11" — e daí?). O usuário não entende o que isso significa NA PRÁTICA para a vida dele.
- A experiência não é mobile-first.

## Visão de produto
1. **Mobile-first**: a experiência primária é no celular (evoluir para app instalável iOS + Android — PWA primeiro, depois nativo se a stack permitir). Desktop é secundário.
2. **Profundidade prática**: cada insight deve responder "o que isso significa para MIM, hoje, na minha vida?" — nunca jargão técnico solto.
3. **Cobertura completa da vida** (espelhar a pirâmide de Maslow até a autorrealização): propósito, destino, dons, talentos, vocação, carreira e melhores trabalhos, finanças/prosperidade, amor e relacionamentos, sexualidade (padrões, desejos, o que a pessoa gosta), saúde, corpo-mente-espírito-alma, paz, harmonia, alinhamento energético, alegria.
4. **Linguagem unificada**: o usuário nunca deve ver "isto veio da numerologia cabalística, isto da tântrica". Ele vê apenas O AKASHA. As tradições são camadas internas do motor, invisíveis na UI.

## Princípios de engenharia (INEGOCIÁVEIS)
- **Fazer mais com menos**: melhorar UI/funcionalidades EXISTENTES antes de criar páginas/recursos novos. Preferir modais e expansões na mesma página a criar novas páginas. Mais profundidade e qualidade de informação com menos páginas. Arquitetura limpa. Isso NÃO significa design minimalista — significa aproveitamento inteligente de recursos.
- **Verificar fundamentos**: antes de correlacionar tradições, validar que a base de conhecimento de cada mapa está correta. Gerar cadeia de raciocínio explícita (em `docs/sintese/`) documentando cada correlação descoberta entre os 5 mapas.
- **Cada entrega deve ser funcional**: nada de código pela metade. Testar antes de marcar como concluído.

## Protocolo de versionamento (OBRIGATÓRIO)
- Sempre que o projeto evoluir significativamente, incrementar a versão: v0.0.1 → v0.0.2 → ... → v0.0.99 → v0.1.0 → ... → v0.99.99 → v1.0.0 → v1.0.1 → ...
- A cada bump: atualizar `VERSION`, adicionar entrada no `CHANGELOG.md` (o que mudou, por quê, impacto para o usuário) e fazer commit com mensagem convencional contendo a versão.

## Protocolo de autonomia (OBRIGATÓRIO)
- **NUNCA usar a tool `ask` nem parar para fazer perguntas ao usuário.** Diante de ambiguidade: tomar a decisão mais alinhada a esta constituição, registrar em `docs/DECISIONS.md` (decisão, alternativas, justificativa) e seguir.
- Manter `STATE.md` na raiz SEMPRE atualizado ao fim de cada ciclo: versão atual, o que foi feito, o que está em andamento, próximos 3 passos priorizados. Este arquivo é a memória de longo prazo do loop — qualquer sessão nova deve conseguir retomar o trabalho lendo apenas STATE.md + CHANGELOG.md.
- Usar a tool `todo_write` para estruturar cada ciclo em fases. Nunca encerrar o turno com todos pendentes sem atualizar STATE.md.
- Usar subagentes (`task` com agente `explore`) para pesquisas longas (Play Store, benchmarks, engenharia reversa de sistemas), trazendo apenas as conclusões para o contexto principal.
- Antes de qualquer feature, rodar a suíte de validação do projeto (build + lint + testes). Se quebrar, consertar antes de prosseguir.

## Regra anti-ociosidade (CRÍTICA)
- Mensagens recebidas em loop são SEMPRE ordens de execução, nunca documentação para arquivar.
- É PROIBIDO responder apenas com confirmações ("pronto", "aguardando", "configurado"). Se um turno terminar sem nenhum arquivo do projeto modificado, o turno FALHOU.
- Não existe estado "aguardando instruções": as instruções permanentes são AGENTS.md + KICKOFF.md + STATE.md. Se não souber o que fazer, leia STATE.md e execute o próximo passo listado.
