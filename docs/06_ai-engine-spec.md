# Documento 06 — Motor de IA & Matriz de Correlação
## Cabala dos Caminhos

> **Versão:** 1.0 | **Core do Produto** — Este é o documento mais crítico do projeto.  
> Todo o valor diferencial do sistema está nas regras de correlação definidas aqui.

---

## 1. Visão do Motor de IA

O motor de IA não é um chatbot genérico. É um **motor de inferência determinístico** que segue uma cadeia de raciocínio rígida para cada uma das 36 casas. A IA nunca recebe perguntas abertas — ela recebe dados estruturados e retorna análises formatadas.

**Fórmula de interpretação para cada casa:**

```
Interpretação(Casa X) = 
  Significado Base(Casa X)
  + Aspecto Astral(do mapa natal, delegado a esta casa)
  + Aspecto Numerológico(Cabalístico/Tântrico, delegado a esta casa)
  + Odu Natal(filtrado para a temática desta casa)
  + Carta Cigana Tirada(evento atual)
  + Odu Tirado(direção e conselho)
```

---

## 2. Matriz de Correlação Completa — As 36 Casas

Esta é a tabela definitiva de delegação. O `PromptBuilder` usa este mapa para injetar os dados corretos do consulente em cada casa.

### Casa 1 — O Cavaleiro
**Tema:** Notícias chegando, início de movimento, o primeiro impulso da vida.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Ascendente (1ª Casa) + Marte (regente do ímpeto) | O Cavaleiro = como a pessoa chega ao mundo e age |
| Cabalística | Número de Expressão | Como o self se manifesta/expressa |
| Tântrica | Número de Alma (dia de nascimento) | A essência interior que move a pessoa |
| Odu Natal | Filtrado pela temática de início e movimento | |

---

### Casa 2 — O Trevo
**Tema:** Pequenas sortes, oportunidades rápidas, a fé que sustenta.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Júpiter (sorte, expansão) + signo de Júpiter natal | Júpiter = o planeta da boa sorte e abundância |
| Cabalística | Número de Motivação | O que o coração busca, o que atrai sorte |
| Tântrica | Dom Divino (ano de nascimento reduzido) | O presente que a pessoa carrega desde o nascimento |

---

### Casa 3 — O Navio
**Tema:** Viagens, negócios à distância, mudanças de horizonte.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 9ª Casa (viagens longas, estrangeiro) + Mercúrio (3ª Casa — viagens curtas) | O Navio abrange ambos os tipos de jornada |
| Cabalística | Número de Expressão | Como a pessoa se comunica além dos próprios limites |
| Tântrica | Número de Caminho Tântrico | A direção global da jornada de vida |

---

### Casa 4 — A Casa
**Tema:** Lar físico, família, moradia, estrutura doméstica.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 4ª Casa (IC / Fundo do Céu) + Lua natal (lar, mãe, raízes) | A 4ª Casa é o "lar" por excelência na astrologia |
| Cabalística | Número de Motivação | O que traz segurança emocional e sensação de lar |
| Tântrica | Número de Karma (mês) | Bloqueios ou aberturas na estrutura doméstica e familiar |

---

### Casa 5 — A Árvore
**Tema:** Saúde, vitalidade, energia vital, raízes, ancestralidade.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 6ª Casa (saúde, corpo) + Sol natal (vitalidade) | A Árvore = o corpo e a força de vida |
| Cabalística | Número de Destino | O destino físico e a resistência da pessoa |
| Tântrica | Número de Alma | A energia prânica da alma |

---

### Casa 6 — As Nuvens
**Tema:** Confusão mental, dúvidas, nebulosidade, indecisão.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 12ª Casa (inconsciente, confusão) + Netuno natal (ilusão, nebulosa) | Netuno é o planeta da neblina e da ilusão |
| Cabalística | Números de Desafio (1º e 2º desafios) | Onde estão as dúvidas e bloqueios kármicos |
| Tântrica | Número de Karma (mês) | De onde vêm as limitações e os véus |

---

### Casa 7 — A Serpente
**Tema:** Perigo, traição, inveja, forças ocultas, sexualidade, sabedoria oculta.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Lilith natal (sombra, poder oculto, sexualidade) + Plutão aspectos tensos | A Serpente = o princípio oculto e perigoso |
| Cabalística | Karma de Vida / Dívidas (números ausentes no nome) | O que a pessoa não desenvolveu e a torna vulnerável |
| Tântrica | Número de Karma (mês) | Os medos mais profundos que atraem perigo |

---

### Casa 8 — O Caixão
**Tema:** Fim de ciclos, transformação profunda, crises, renascimento.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 8ª Casa natal (Plutão, morte/renascimento, recursos partilhados) | A 8ª Casa = transformação radical na astrologia |
| Cabalística | Número de Missão | A missão requer a morte do velho self para se cumprir |
| Tântrica | Número de Karma (mês) | O teste material máximo — o que precisa morrer |

---

### Casa 9 — Os Buquês
**Tema:** Presentes, surpresas felizes, reconhecimento, beleza, alegria.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Vênus natal (beleza, presentes, prazer) + 5ª Casa (prazer, criatividade) | Vênus = o que traz bênçãos e reconhecimento |
| Cabalística | Dons Nativos (número do dia de nascimento) | Os talentos com que a pessoa nasceu |
| Tântrica | Dom Divino (ano reduzido) | O presente divino da alma |

---

### Casa 10 — A Foice
**Tema:** Cortes necessários, decisões definitivas, colheita, perigos imediatos.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Saturno natal (onde a vida exige corte e maturidade) + 8ª Casa (transformações drásticas) | Saturno = o grande ceifeiro |
| Cabalística | Números de Desafio (principal) | O maior obstáculo a ser cortado/superado |
| Tântrica | Número de Karma (mês) | O que precisa ser definitivamente encerrado |

---

### Casa 11 — O Chicote
**Tema:** Conflitos, repetição de padrões, estresse, agressividade, disputas.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Marte natal (conflito, agressão, modo de luta) + aspectos de Marte tensos | Marte = o planeta da guerra e dos conflitos |
| Cabalística | Números de Desafio | Os padrões destrutivos repetitivos |
| Tântrica | Corpo Prânico — Karma (mês) | Onde a energia vital é sugada por conflito |

---

### Casa 12 — Os Pássaros
**Tema:** Comunicação, parcerias dinâmicas, nervosismo, trocas rápidas.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Mercúrio natal (comunicação, mente) + 3ª Casa (comunicação, vizinhança) | Mercúrio = voz, palavra, troca |
| Cabalística | Número de Expressão | Como e com que eficiência a pessoa se comunica |
| Tântrica | Dom Divino (ano reduzido) | O dom da voz e da palavra como ferramenta |

---

### Casa 13 — A Criança
**Tema:** Novos começos, projetos iniciais, inocência, renovação, vulnerabilidade.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 1ª Casa / Ascendente (novos ciclos, como se recomeça) + Júpiter (expansão de novos projetos) | O recomeço sempre passa pelo Ascendente |
| Cabalística | Número de Missão | A missão é sempre um recomeço |
| Tântrica | Número de Alma | O aspecto mais puro e inicial da alma |

---

### Casa 14 — A Raposa
**Tema:** Astúcia, estratégia, autossuficiência, cautela, discernimento.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Mercúrio natal (intelecto, estratégia) + Urano (insight, esperteza) | A Raposa = inteligência estratégica |
| Cabalística | Número de Expressão | Como a mente opera nas estratégias de vida |
| Tântrica | Dom Divino | O dom inato de perceber o que está oculto |

---

### Casa 15 — O Urso
**Tema:** Poder pessoal, autoridade, finanças de grande porte, proteção, liderança.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Sol natal (poder, ego, autoridade) + 10ª Casa (posição de poder, carreira) | O Sol = o centro do poder na vida da pessoa |
| Cabalística | Caminho de Vida | O núcleo do poder e da liderança pessoal |
| Tântrica | Número de Alma | O tipo de poder que a alma carrega |

---

### Casa 16 — A Estrela
**Tema:** Esperança, espiritualidade, guia divino, sonhos, missão de alma.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Netuno natal (espiritualidade, sonhos, transcendência) + 9ª Casa (fé, filosofia) | Netuno = a estrela guia espiritual |
| Cabalística | Caminho de Vida (especialmente se for 11, 22 ou 33) | Números mestres = missão espiritual elevada |
| Tântrica | Dom Divino | O presente divino que ilumina a jornada |

---

### Casa 17 — A Cegonha
**Tema:** Mudanças significativas, renovação, melhoria, movimentos inesperados.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Nodo Norte natal (direção do destino, evolução) + Urano (mudanças súbitas) | O Nodo Norte = para onde a vida está mudando |
| Cabalística | Número de Missão | A mudança ao serviço da missão |
| Tântrica | Número de Destino (ano completo) | O destino que se transforma |

---

### Casa 18 — O Cachorro
**Tema:** Lealdade, amizade, aliados, proteção, confiança.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 11ª Casa (amigos, grupos, redes de apoio) + Vênus (vínculos afetivos) | A 11ª Casa = círculo de aliados |
| Cabalística | Número de Motivação | O que a pessoa busca e projeta nos amigos |
| Tântrica | Número de Alma | Como a alma se conecta com outros |

---

### Casa 19 — A Torre
**Tema:** Isolamento, solidão consciente, ego, autoridade institucional, introspecção.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 12ª Casa (isolamento, reclusão, karma oculto) + Saturno (estruturas rígidas, ego) | A Torre = as paredes que a pessoa constrói em volta de si |
| Cabalística | Números de Desafio | O ego como desafio central |
| Tântrica | Número de Karma (mês) | De onde vem a tendência ao isolamento |

---

### Casa 20 — O Jardim
**Tema:** Vida social, público, eventos, exposição, coletividade.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 11ª Casa (grupos sociais, redes) + 7ª Casa (parcerias públicas) | O Jardim = o espaço público e social |
| Cabalística | Número de Expressão | Como a pessoa se apresenta em público |
| Tântrica | Dom Divino | Como o dom se manifesta diante dos outros |

---

### Casa 21 — A Montanha
**Tema:** Obstáculos, bloqueios, atrasos, inimigos ocultos, desafios duradouros.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Saturno natal em aspectos tensos + 12ª Casa (inimigos ocultos) | Saturno = o grande bloqueador e testador |
| Cabalística | Números de Desafio + Dívidas Kármicas | Os obstáculos kármicos específicos desta vida |
| Tântrica | Número de Karma (mês) | A natureza do bloqueio energético |

---

### Casa 22 — Os Caminhos
**Tema:** Escolhas, bifurcação, decisões cruciais, possibilidades múltiplas.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Eixo Nodo Norte/Sul (as grandes escolhas do destino) + 1ª/7ª Casa (o self vs. o outro) | Os Nodos = as escolhas mais importantes da alma |
| Cabalística | Caminho de Vida | O grande caminho que deve ser escolhido |
| Tântrica | Número de Caminho Tântrico | O sentido de direção na vida |

---

### Casa 23 — O Rato
**Tema:** Perdas graduais, desgaste, ansiedade, pensamentos que consomem, escassez.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 12ª Casa (perdas ocultas) + aspectos tensos de Netuno (confusão, vazamento) + Saturno restritivo | O Rato = o que drena sem ser visto |
| Cabalística | Karma de Vida / Dívidas (números ausentes) | O que falta no nome = onde há vazamento |
| Tântrica | Corpo Prânico — Karma (mês) | A energia vital sendo drenada |

---

### Casa 24 — O Coração
**Tema:** Amor, emoções profundas, desejos do coração, afetos.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Vênus natal (amor, beleza, como ama) + Lua natal (emoções, instinto afetivo) + 5ª Casa (romance) | Venus e Lua = os grandes regentes do amor |
| Cabalística | Número de Motivação | O que o coração realmente deseja |
| Tântrica | Número de Alma | A forma como a alma experimenta o amor |

---

### Casa 25 — O Anel
**Tema:** Contratos, comprometimentos, alianças, casamento, acordos formais.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 7ª Casa (Descendente — parcerias, casamento, contratos) + Saturno (formalização, durabilidade) | A 7ª Casa = todos os contratos da vida |
| Cabalística | Número de Missão | A missão frequentemente se cumpre através de alianças |
| Tântrica | Número de Destino | O destino se sela em compromissos |

---

### Casa 26 — O Livro
**Tema:** Segredos, conhecimento oculto, estudos, mistérios guardados.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 9ª Casa (conhecimento superior, filosofia, fé) + 12ª Casa (oculto, esotérico) + Mercúrio (mente) | O saber que vai além do óbvio |
| Cabalística | Caminho de Vida 7 (se presente) | O 7 é o número do conhecimento oculto |
| Tântrica | Dom Divino | Os segredos do dom divino da pessoa |

---

### Casa 27 — A Carta
**Tema:** Documentos, notícias escritas, mensagens formais, comunicação oficial.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Mercúrio natal (comunicação escrita, documentos) + 3ª Casa (correspondências) | Mercúrio = o mensageiro e escriba |
| Cabalística | Número de Expressão | Como a comunicação formal se manifesta |
| Tântrica | Dom Divino (se for 5 = dom da palavra) | A palavra como ferramenta de poder |

---

### Casa 28 — O Cigano (Figura Masculina)
**Tema:** O consulente masculino ou a energia masculina/ativa principal na situação.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Sol natal (identidade, ego, força masculina/yang) + Marte (ação, drive, iniciativa) | Sol+Marte = o arquétipo masculino ativo |
| Cabalística | Caminho de Vida | O destino pessoal do self ativo |
| Tântrica | Número de Caminho Tântrico | A totalidade da jornada desta persona |

---

### Casa 29 — A Cigana (Figura Feminina)
**Tema:** O consulente feminino ou a energia feminina/receptiva principal na situação.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Lua natal (instinto, intuição, energia feminina/yin) + Vênus (graça, receptividade) | Lua+Vênus = o arquétipo feminino receptivo |
| Cabalística | Número de Motivação | O que o self receptivo deseja profundamente |
| Tântrica | Número de Alma | A essência mais profunda da alma |

---

### Casa 30 — Os Lírios
**Tema:** Paz, pureza, maturidade, sabedoria conquistada, calma após a tempestade.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Júpiter natal (sabedoria, benevolência, colheita) + 9ª Casa (filosofia de vida, paz) | Júpiter = a expansão serena e a sabedoria |
| Cabalística | Caminho de Vida | A paz que vem de honrar o próprio destino |
| Tântrica | Número de Destino | A colheita do destino em paz |

---

### Casa 31 — O Sol
**Tema:** Sucesso máximo, clareza total, vitória, o ápice da realização.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 10ª Casa (Meio do Céu — carreira, sucesso público, ápice) + Sol natal (brilho, vitória) | A 10ª Casa + Sol = o ponto mais alto da vida |
| Cabalística | Número de Missão | A missão cumprida = o Sol no zênite |
| Tântrica | Dom Divino | O dom divino manifestado em sua plenitude |

---

### Casa 32 — A Lua
**Tema:** Intuição, psiquismo, reconhecimento, honrarias, o inconsciente à flor da pele.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Lua natal (intuição, emoções profundas, ciclos) + Netuno (psiquismo) + 12ª Casa | A Lua governa o mundo interior e os ciclos |
| Cabalística | Número de Motivação | Os desejos inconscientes que guiam a pessoa |
| Tântrica | Número de Alma | A alma em sua dimensão mais psíquica |

---

### Casa 33 — A Chave
**Tema:** A solução que se revela, abertura de portas, a resposta esperada, importância.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Júpiter natal (abertura, expansão, solução) + Nodo Norte (direção para o qual a solução aponta) | Júpiter + Nodo Norte = a porta que se abre |
| Cabalística | Número de Missão | A chave da vida é sempre a missão |
| Tântrica | Dom Divino | O dom como a chave que abre o destino |

---

### Casa 34 — Os Peixes
**Tema:** Dinheiro, fluxo financeiro, negócios, abundância material.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 2ª Casa natal (finanças pessoais, como ganha dinheiro) + Vênus (valor próprio, o que atrai recursos) | A 2ª Casa = o bolso e o valor da pessoa |
| Cabalística | Número de Expressão | Como o talento se transforma em recurso financeiro |
| Tântrica | Número de Karma (mês) | O teste material — o karma com o dinheiro |

---

### Casa 35 — A Âncora
**Tema:** Estabilidade, trabalho fixo, permanência, segurança de longo prazo.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | 6ª Casa (trabalho diário, rotina, emprego) + Saturno (estruturas sólidas e duradouras) + 10ª Casa (carreira) | A Âncora vive na interseção do trabalho e da solidez |
| Cabalística | Número de Missão | A missão que se ancora em um propósito profissional |
| Tântrica | Corpo Físico — Dom Divino | O dom que sustenta a vida material |

---

### Casa 36 — A Cruz
**Tema:** Fardo kármico, teste espiritual máximo, responsabilidade, superação do destino.
| Sistema | Aspecto Delegado | Justificativa |
|---|---|---|
| Astrologia | Nodo Sul natal (karma do passado, o que precisa ser superado) + Saturno aspectos tensos + 12ª Casa | A Cruz = o karma que a alma trouxe para superar |
| Cabalística | Karma de Vida + Dívidas Kármicas | As dívidas de vidas passadas que pedem resolução |
| Tântrica | Número de Karma (mês) | O teste espiritual máximo desta encarnação |

---

## 3. O PromptBuilder — Arquitetura do Código

### 3.1 O Dicionário de Correlação (correlation-map.ts)

```typescript
// src/lib/ai/correlation-map.ts

export type CorrelationEntry = {
  houseId: number;
  houseName: string;
  houseTheme: string;  // Para o LLM entender o contexto
  astrology: {
    primaryHouses: number[];           // Casas astrológicas relevantes
    primaryPlanets: string[];          // Planetas mais importantes
    extractionKeys: string[];          // Keys para extrair do astrologyMap JSON
  };
  kabalah: {
    aspects: string[];                 // Quais números cabalísticos usar
    extractionKeys: string[];
  };
  tantric: {
    aspects: string[];                 // Quais números tântricos usar
    extractionKeys: string[];
  };
};

export const CORRELATION_MAP: Record<number, CorrelationEntry> = {
  1: {
    houseId: 1,
    houseName: "O Cavaleiro",
    houseTheme: "Notícias, movimento, o primeiro impulso, como a pessoa chega ao mundo",
    astrology: {
      primaryHouses: [1],
      primaryPlanets: ["ascendant", "mars"],
      extractionKeys: ["ascendant.sign", "planets.mars.sign", "planets.mars.house", "houses.1"],
    },
    kabalah: {
      aspects: ["Número de Expressão"],
      extractionKeys: ["expression"],
    },
    tantric: {
      aspects: ["Número de Alma"],
      extractionKeys: ["soul", "soulDescription"],
    },
  },
  4: {
    houseId: 4,
    houseName: "A Casa",
    houseTheme: "Lar físico, família, moradia, base de vida, ancestralidade",
    astrology: {
      primaryHouses: [4],
      primaryPlanets: ["moon"],
      extractionKeys: ["houses.4", "planets.moon.sign", "planets.moon.house"],
    },
    kabalah: {
      aspects: ["Número de Motivação"],
      extractionKeys: ["motivation"],
    },
    tantric: {
      aspects: ["Número de Karma"],
      extractionKeys: ["karma", "karmaDescription"],
    },
  },
  // ... [continua para todas as 36 casas seguindo o padrão da Seção 2]
  34: {
    houseId: 34,
    houseName: "Os Peixes",
    houseTheme: "Dinheiro, fluxo financeiro, abundância material, negócios",
    astrology: {
      primaryHouses: [2],
      primaryPlanets: ["venus"],
      extractionKeys: ["houses.2", "planets.venus.sign", "planets.venus.house", "planetsInHouses.2"],
    },
    kabalah: {
      aspects: ["Número de Expressão"],
      extractionKeys: ["expression"],
    },
    tantric: {
      aspects: ["Número de Karma (Material)"],
      extractionKeys: ["karma", "karmaDescription"],
    },
  },
};
```

### 3.2 O PromptBuilder (prompt-builder.ts)

```typescript
// src/lib/ai/prompt-builder.ts

import { CORRELATION_MAP } from './correlation-map';
import type { Client, MatrixData } from '@/types';

export class PromptBuilder {

  static buildSystemPrompt(): string {
    return `Você é o Oráculo da "Cabala dos Caminhos", um sistema integrativo de leitura profunda.

Sua missão é analisar cada casa da Mesa Real cruzando os dados do mapa natal do consulente com a tiragem do dia.

REGRAS OBRIGATÓRIAS:
1. Dirija-se SEMPRE ao consulente na segunda pessoa (você, seu, sua).
2. Para cada casa, siga RIGOROSAMENTE a estrutura de 3 parágrafos:
   - §1 O TERRENO: Como o consulente naturalmente vive esta área da vida, baseado nos dados natais.
   - §2 O EVENTO: O que a carta tirada revela sobre o momento atual nesta área.
   - §3 A DIREÇÃO: O conselho do Odu para agir/navegar esta energia.
3. Seja direto, preciso e profundo. NUNCA seja genérico.
4. Termine cada casa com uma linha de síntese em itálico: *[Palavra-chave]: [frase de 10 a 15 palavras]*
5. Para a Síntese Final, integre os padrões que se repetem nas 36 casas em 4 capítulos.`;
  }

  static buildHousePayload(
    house: number,
    matrixEntry: MatrixData[string],
    client: Client
  ): object {

    const correlation = CORRELATION_MAP[house];
    if (!correlation) throw new Error(`Casa ${house} não encontrada no mapa de correlação`);

    // Extrai dados astrológicos relevantes para esta casa
    const astralData = this.extractFromMap(
      client.astrologyMap as Record<string, unknown>,
      correlation.astrology.extractionKeys
    );

    // Extrai dados cabalísticos relevantes
    const kabalaData = this.extractFromMap(
      client.kabalisticMap as Record<string, unknown>,
      correlation.kabalah.extractionKeys
    );

    // Extrai dados tântricos relevantes
    const tantricData = this.extractFromMap(
      client.tantricMap as Record<string, unknown>,
      correlation.tantric.extractionKeys
    );

    return {
      casa_numero: house,
      casa_nome: correlation.houseName,
      casa_tema: correlation.houseTheme,
      dados_natais_consultante: {
        astrologia: {
          aspectos_relevantes: correlation.astrology.aspects,
          valores: astralData,
        },
        numerologia_cabalistica: {
          aspectos: correlation.kabalah.aspects,
          valores: kabalaData,
        },
        numerologia_tantrica: {
          aspectos: correlation.tantric.aspects,
          valores: tantricData,
        },
        odu_natal: client.oduBirth,
      },
      tiragem_do_dia: {
        carta: matrixEntry.cartaName,
        carta_numero: matrixEntry.carta,
        carta_significado: "// Injetado da constante LENORMAND_CARDS",
        odu_tirado: matrixEntry.oduName,
        odu_numero: matrixEntry.odu,
        odu_essencia: "// Injetado da constante ODUS",
      },
      instrucao: `Analise a Casa ${house} (${correlation.houseName}) seguindo os 3 parágrafos obrigatórios.`,
    };
  }

  static buildFullPayload(client: Client, matrixData: MatrixData): object {
    const housesPayload = Object.entries(matrixData).map(([houseStr, entry]) => {
      return this.buildHousePayload(parseInt(houseStr), entry, client);
    });

    return {
      consulente: {
        nome: client.fullName,
        data_nascimento: client.birthDate,
        cidade_nascimento: `${client.birthCity}, ${client.birthCountry}`,
      },
      instrucao_geral: this.buildSystemPrompt(),
      casas: housesPayload,
      instrucao_sintese_final: `Após analisar todas as ${housesPayload.length} casas acima, gere uma SÍNTESE FINAL com 4 capítulos:
        1. **O Caminho do Trabalho e Dinheiro** (casas relacionadas a trabalho, finanças, carreira)
        2. **O Caminho do Lar e Família** (casas relacionadas a moradia, família, raízes)
        3. **O Caminho do Amor e Relacionamentos** (casas relacionadas a amor, contratos, parcerias)
        4. **O Grande Conselho Espiritual** (casas relacionadas a espiritualidade, karma, propósito)
        Cada capítulo: 2 a 3 parágrafos. Feche com um VEREDITO FINAL de 1 parágrafo com a direção mais urgente.`,
    };
  }

  private static extractFromMap(
    map: Record<string, unknown> | null | undefined,
    keys: string[]
  ): Record<string, unknown> {
    if (!map) return {};
    return keys.reduce((acc, key) => {
      const value = key.split('.').reduce((obj: unknown, k) => {
        if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
        return undefined;
      }, map);
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, unknown>);
  }
}
```

### 3.3 O LLM Client (llm-client.ts)

```typescript
// src/lib/ai/llm-client.ts
// Wrapper abstrato — troca de provider sem refatorar PromptBuilder

export type LLMProvider = 'openai' | 'anthropic';

export async function generateDossier(
  payload: object,
  provider: LLMProvider = 'openai'
): Promise<ReadableStream> {

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é o Oráculo da Cabala dos Caminhos. Responda apenas em Markdown estruturado.',
          },
          {
            role: 'user',
            content: JSON.stringify(payload),
          },
        ],
        stream: true,
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });
    return response.body!;
  }

  // Anthropic
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      stream: true,
      messages: [{ role: 'user', content: JSON.stringify(payload) }],
    }),
  });
  return response.body!;
}
```

---

## 4. Estrutura do Output Esperado (Markdown do LLM)

```markdown
# Dossiê Cabalístico — [Nome do Consulente]
*Gerado em [Data] | [N] casas analisadas*

---

## Casa 1 — O Cavaleiro
*Carta: A Torre (19) | Odu: Osá (10)*

**O Terreno:** [Parágrafo sobre como o consulente naturalmente se apresenta ao mundo
baseado no Ascendente e no Número de Alma. 3-5 frases diretas.]

**O Evento:** [Parágrafo sobre o que a carta da Torre revela sobre o momento atual.
O que está acontecendo nesta área da vida agora. 3-5 frases.]

**A Direção:** [Parágrafo com o conselho do Odu Osá para esta área.
O que fazer, o que evitar, como agir. 3-5 frases.]

*Palavra-chave: Introspecção necessária antes de qualquer movimento externo importante.*

---

## Casa 4 — A Casa
*Carta: [Nome] | Odu: [Nome]*

[Mesma estrutura de 3 parágrafos]

---

[... demais casas ...]

---

# Síntese Final

## O Caminho do Trabalho e Dinheiro
[2-3 parágrafos integrando as casas de trabalho e finanças]

## O Caminho do Lar e Família
[2-3 parágrafos]

## O Caminho do Amor e Relacionamentos
[2-3 parágrafos]

## O Grande Conselho Espiritual
[2-3 parágrafos]

---

## Veredito Final
[1 parágrafo com a direção mais urgente e o passo concreto que o consulente deve dar agora]
```
