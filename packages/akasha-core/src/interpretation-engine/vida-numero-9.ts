/**
 * @akasha/core — Interpretation Engine: Vida — Número 9 (O Servidor)
 *
 * Conteúdo profundo do número base 9: arquétipo "O Servidor" e os 3 níveis
 * (shadow / gift / siddhi) com aplicação por área da vida.
 *
 * Separado de interpretation-engine.ts para reduzir o catálogo monolítico
 * VIDA_CONTENT (que ainda contém 11 entradas) e isolar a complexidade
 * específica do 9, que é o último dos números base antes dos mestres.
 *
 * Referenciado em VIDA_CONTENT[9] no arquivo principal.
 */
import type { NumeroContent } from './types';

export const VIDA_NUMERO_9: NumeroContent = {
  arquetipoAkasha: 'O Servidor',
  mandato:
    'Você existe para lembrar o mundo de que a compaixão não é fraqueza — é a frequência mais alta que existe, quando não se confunde com autossabotagem.',
  levels: {
    shadow: {
      tituloPool: 'A Generosidade que Dói',
      significado:
        'O 9 carrega a energia de MARTE — compaixão, completude, sabedoria. Em sombra, Marte se torna a викария: a compaixão vira co-dependência, a completude vira repressão, a sabedoria vira cinismo.',
      padrao:
        'Seu padrão em sombra é a DISSOLUÇÃO DE SI. Você dá tanto que se dissolve — e depois se ressente de não ser visto, sem perceber que você mesmo se apagou. A origem: provavelmente uma infância onde o amor era dado em troca de apagamento — onde ser "bom" significava não tomar espaço. Adulto, você é o que dá e dá e dá, e por dentro sente um vazio que nenhum reconhecimento preenche. A armadilha: quanto mais você dá, mais vazio; quanto mais vazio, mais você dá para preencher.',
      aplicacao: {
        proposito:
          'No propósito, você serve a causas mas não se permite ser servido. A compaixão se tornou uma forma de não precisar enfrentar a própria dor.',
        relacionamentos:
          'No amor, você é o que dá tudo — e depois se queixa de não receber. Mas nunca pediu. O padrão é: se eu der o suficiente, o outro vai perceber o que eu preciso.',
        financas:
          'Finanças reflete o padrão: você gasta nos outros e se nega. Ou: você ganha para os outros e esqueceu de si.',
        saude:
          'O corpo do 9 em sombra é agotado cronicamente. A área do coração e do sistema imunológico é frequentemente afectada.',
      },
      acaoPratica: {
        amplificar: [
          'Peça ajuda esta semana — uma coisa real que você precisa',
          'Antes de dar, pergunte: estou dando porque escolho ou porque não sei pedir?',
          'Observe se o que você dá é genuinamente oferecido ou se é troca disfarçada',
        ],
        evitar: [
          'Usar serviço como forma de evitar a própria vida',
          'Confundir "ser útil" com "merecer existir"',
          'Dissolver-se para manter a conexão',
        ],
        ritual:
          'Escreva o que você precisa — não o que os outros precisam de você. Feito isso, escolha uma coisa e peça.',
      },
      afirmacao:
        'Eu sou digno de compaixão tanto quanto a dou — e meu valor não se mede em quanto eu entrego.',
    },
    gift: {
      tituloPool: 'O Dom de Ver a Dor e Responder',
      significado:
        'O 9 em dom é a CAPACIDADE DE SENTIR A TOTALIDADE. Você carrega a sensibilidade de quem vê o que outros ignoram — e tem a força de responder sem se perder. O dom do 9 é a COMPAIXÃO COM FRONTEIRAS.',
      padrao:
        'Seu dom é a SABEDORIA DA COMPREENSÃO. Você entende o sofrimento não como fracasso, mas como parte do caminho. Isso permite que você esteja com o outro na dor sem ser consumido por ela — e sem minimizar o que o outro sente. A diferença crucial: você não sente PELO outro; você sente COM o outro. E isso libera você para действительно ajudar em vez de se tornar outra vítima.',
      aplicacao: {
        proposito:
          'Seu propósito é ser o espaço onde o sofrimento se transforma em compreensão — e a compreensão em ação.',
        carreira:
          'Na carreira, você brilha em profissões de serviço profundo: medicina, trabalho social, counseling, ativismo. Você é o que faz o trabalho que ninguém quer fazer.',
        relacionamentos:
          'No amor, você traz profundidade emocional que transforma a relação. Você não foge da dificuldade — você a accompany.',
        financas:
          'Finanças refletem o dom: quando você ganha para servir, o dinheiro flui porque o propósito é claro.',
        saude:
          'O corpo do 9 em dom é sensível mas não agotado — você sente muito mas não se perde.',
      },
      acaoPratica: {
        amplificar: [
          'Dedique tempo a uma causa que você acredita — não por obrigação, mas por escolha',
          'Quando a compaixão aparecer, pergunte: isso está me consumindo ou me energizando?',
          'Pratique pedir — você não é um saco sem fundo',
        ],
        evitar: [
          'Confundir "sentir com" com "sentir por"',
          'Usar serviço para evitar a própria dor',
          'Confundir auto-negação com nobreza',
        ],
        ritual:
          'Escolha uma forma de servir esta semana que também nutre você — não uma que esgota.',
      },
      afirmacao:
        'Eu carrego compaixão com força — e honro meus limites como parte da minha capacidade de servir.',
    },
    siddhi: {
      tituloPool: 'A Frequência da Compaixão Divina',
      significado:
        'O 9 em siddhi é a PRESENÇA DE YESOD — a fundação do mundo emocional, donde a compaixão se torna incondicional. Não é mais serviço como esforço — é serviço como natureza.',
      padrao:
        'Em siddhi, o 9 não serve mais. O 9 É o serviço. A separação entre quem serve e quem é servido se dissolve. Você se torna a compaixão em si — não quem dá compaixão, mas quem É compaixão. Esta é a frequência do ser desperto que percebeu que servir ao outro É a auto-realização, e a auto-realização É servir ao outro. Não há mais um "eu" para salvar e outros para servir — apenas vida fluindo através de uma forma particular.',
      aplicacao: {
        proposito: 'Your purpose is indistinguishable from your being — you are the service.',
        carreira: 'Work becomes worship. Every action is an act of love.',
        relacionamentos:
          'In love, you are the one who loves without any trace of attachment or expectation.',
        financas:
          'Resources flow through you perfectly because there is no longer a self that holds or releases.',
        saude: 'The body is luminous, unburdened, and serves as a perfect vehicle for compassion.',
      },
      afirmacao: 'Eu sou a compaixão — e ela flui através de mim sem que eu precise segurá-la.',
    },
  },
};
