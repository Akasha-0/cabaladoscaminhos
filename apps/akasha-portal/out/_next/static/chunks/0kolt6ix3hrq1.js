(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  90009,
  (a) => {
    'use strict';
    let e = Object.fromEntries(
      [
        { id: 1, name: 'Corpo da Alma', essence: 'Núcleo, pureza, origem' },
        {
          id: 2,
          name: 'Corpo Negativo / Mente Protetora',
          essence: 'Cautela, discernimento, proteção',
        },
        { id: 3, name: 'Corpo Positivo / Mente Projetiva', essence: 'Expansão, otimismo, ação' },
        {
          id: 4,
          name: 'Corpo Neutro / Mente Meditativa',
          essence: 'Equilíbrio, julgamento sereno',
        },
        { id: 5, name: 'Corpo Físico', essence: 'Manifestação, a palavra, o dom material' },
        { id: 6, name: 'Arco da Linha', essence: 'Integridade, projeção, intuição' },
        { id: 7, name: 'Aura', essence: 'Campo de proteção, presença' },
        { id: 8, name: 'Corpo Prânico', essence: 'Energia vital, respiração, força' },
        { id: 9, name: 'Corpo Sutil', essence: 'Maestria, sabedoria refinada' },
        { id: 10, name: 'Corpo Radiante', essence: 'Realeza, coragem, brilho' },
        { id: 11, name: 'Corpo do Infinito', essence: 'Transcendência, totalidade' },
      ].map((a) => [a.id, `${a.name} — ${a.essence}`])
    );
    function i(a) {
      return e[a] ?? `Corpo T\xe2ntrico ${a}`;
    }
    let o = {
      1: {
        name: 'Raiz / Muladhara',
        element: 'Terra',
        frequency: 396,
        affirmation: 'Eu sou seguro e protegido',
      },
      2: {
        name: 'Sacro / Svadhisthana',
        element: 'Água',
        frequency: 417,
        affirmation: 'Eu flua com as mudanças da vida',
      },
      3: {
        name: 'Solar / Manipura',
        element: 'Fogo',
        frequency: 528,
        affirmation: 'Eu afirmo meu poder pessoal',
      },
      4: {
        name: 'Coração / Anahata',
        element: 'Ar',
        frequency: 639,
        affirmation: 'Eu sou amor e compaixão',
      },
      5: {
        name: 'Garganta / Vishuddha',
        element: 'Éter',
        frequency: 741,
        affirmation: 'Eu expresso minha verdade',
      },
      6: {
        name: 'Terceiro Olho / Ajna',
        element: 'Luz',
        frequency: 852,
        affirmation: 'Eu vejo com clareza interior',
      },
      7: {
        name: 'Coroa / Sahasrara',
        element: 'Cosmos',
        frequency: 963,
        affirmation: 'Eu sou conectado ao divino',
      },
      8: {
        name: 'Estrela da Alma',
        element: 'Estelar',
        frequency: 174,
        affirmation: 'Eu honro minha jornada estelar',
      },
      9: {
        name: 'Estrela da Terra',
        element: 'Cristal',
        frequency: 285,
        affirmation: 'Eu manifesto na matéria',
      },
      10: {
        name: 'Universal',
        element: 'Prana',
        frequency: 396,
        affirmation: 'Eu sou um com o universo',
      },
      11: {
        name: 'Divino',
        element: 'Transcend',
        frequency: 111,
        affirmation: 'Eu transcendo toda forma',
      },
    };
    function r(a) {
      return a <= 0
        ? 1
        : a <= 11
          ? a
          : r(
              String(a)
                .split('')
                .reduce((a, e) => a + parseInt(e, 10), 0)
            );
    }
    function n(a) {
      let e = a.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return e ? r(parseInt(e[3], 10)) : 1;
    }
    function t(a) {
      let e = a.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return e ? r(parseInt(e[2], 10)) : 1;
    }
    function s(a) {
      let e = a.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return e ? r(parseInt(e[1].slice(-2), 10)) : 1;
    }
    function d(a) {
      let e = a.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return e
        ? r(
            String(parseInt(e[1], 10))
              .split('')
              .reduce((a, e) => a + parseInt(e, 10), 0)
          )
        : 1;
    }
    function l(a) {
      let e = a.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!e) return 1;
      let [, i, o, n] = e;
      return r(parseInt(n, 10) + parseInt(o, 10) + parseInt(i, 10));
    }
    let c = {
        1: ['Liderança', 'Iniciativa', 'Determinação', 'Coragem'],
        2: ['Intuição', 'Sensibilidade', 'Cooperatividade', 'Diplomacia'],
        3: ['Criatividade', 'Expressão', 'Comunicação', 'Otimismo'],
        4: ['Estabilidade', 'Praticidade', 'Disciplina', 'Resiliência'],
        5: ['Versatilidade', 'Liberdade', 'Adaptação', 'Curiosidade'],
        6: ['Harmonia', 'Responsabilidade', 'Devoção', 'Família'],
        7: ['Análise', 'Espiritualidade', 'Sabedoria', 'Introspecção'],
        8: ['Abundância', 'Autoridade', 'Sabedoria prática', 'Manifestação'],
        9: ['Compaixão', 'Universalidade', 'Iluminação', 'Generosidade'],
        11: ['Visão', 'Inspiração', 'Iluminação espiritual', 'Mestria'],
        22: ['Realização', 'Construção', 'Grande escala', 'Visão prática'],
        33: ['Serviço', 'Ensino', 'Transcendência', 'Mestria espiritual'],
      },
      m = {
        fisico: {
          1: 'Corpo físico forte e vital, predisposição à liderança e ação direta',
          2: 'Corpo físico harmonioso, sensibilidade corporal e receptividade',
          3: 'Corpo expressivo e flexível, energia de comunicação e movimento',
          4: 'Corpo robusto e estável, resistência física e disciplina',
          5: 'Corpo dinâmico e adaptável, energia de liberdade e mudança',
          6: 'Corpo harmonioso e nutritivo, energia de cuidado e família',
          7: 'Corpo refined e contemplativo, energia de introspecção',
          8: 'Corpo poderoso e abundante, energia de manifestação material',
          9: 'Corpo compassivo e humanitário, energia de serviço universal',
        },
        pranic: {
          1: 'Prana vibrante e direcionado, energia de vontade e ação',
          2: 'Prana receptivo e fluido, energia de feeling e empatia',
          3: 'Prana expansivo e comunicativo, energia de expressão creativa',
          4: 'Prana firme e estruturado, energia de disciplina e root',
          5: 'Prana livre e versátil, energia de mudança e adaptação',
          6: 'Prana harmonioso e amoroso, energia de conexão e cuidado',
          7: 'Prana profundo e contemplativo, energia de sabedoria interior',
          8: 'Prana poderoso e abundante, energia de transformação material',
          9: 'Prana universal e compassivo, energia de serviço global',
        },
        emocional: {
          1: 'Emoções diretas e intensas, autoexpressão forte e independentes',
          2: 'Emoções profundas e receptivas, forte conexão com sentimentos alheios',
          3: 'Emoções expressivas e criativas, alegria de viver e comunicação',
          4: 'Emoções estáveis e leais, profundidade sentimental e comprometimento',
          5: 'Emoções livres e versáteis, intensidade emocional e curiosidade',
          6: 'Emoções harmoniosas e devotas, amor incondicional e família',
          7: 'Emoções refinadas e intuitivas, empatia profunda e espiritualidade',
          8: 'Emoções poderosas e transformadoras, paixão por justiça e poder',
          9: 'Emoções universais e compassivas, empatia global e altruísmo',
        },
        mental: {
          1: 'Mente analítica e diretiva, foco em resultados e originalidade',
          2: 'Mente intuitiva e cooperadora, foco em relacionamentos e equilíbrio',
          3: 'Mente criativa e expressiva, foco em comunicação e inovação',
          4: 'Mente prática e estruturada, foco em organização e fundamento',
          5: 'Mente versátil e curiosa, foco em liberdade e novas ideias',
          6: 'Mente harmoniosa e responsável, foco em justiça e serviço',
          7: 'Mente sábia e introspectiva, foco em conhecimento e verdade',
          8: 'Mente estratégica e poderosa, foco em poder e abundância',
          9: 'Mente humanitária e iluminada, foco em compaixão e sabedoria',
        },
        espiritual: {
          1: 'Espiritualidade de autoafirmação, busca de propósito individual',
          2: 'Espiritualidade de union, busca de conexão com o divino através do outro',
          3: 'Espiritualidade de expressão criativa, busca de verdade através da arte',
          4: 'Espiritualidade de serviço estruturado, busca de propósito através do trabalho',
          5: 'Espiritualidade de liberdade, busca de verdade através da experiência',
          6: 'Espiritualidade de devoção, busca de amor divino através do serviço',
          7: 'Espiritualidade contemplativa, busca de sabedoria através da solidão',
          8: 'Espiritualidade de abundância, busca de plenitude através da manifestação',
          9: 'Espiritualidade universal, busca de iluminação através da compaixão',
        },
      };
    (a.s([], 61956), a.i(61956));
    let u = ['sanguineo', 'colerico', 'melancolico', 'fleumatico'];
    a.s(
      [
        'TEMPERAMENTOS',
        0,
        u,
        'TEMPERAMENTO_CARACTERISTICAS',
        0,
        {
          sanguineo: {
            humor: 'sangue',
            qualidade: 'quente + umido',
            orgao: 'coracao',
            estacao: 'primavera',
            tracos: ['sociavel', 'otimista', 'ativo', 'instavel', 'prazeroso'],
          },
          colerico: {
            humor: 'bilis amarela',
            qualidade: 'quente + seco',
            orgao: 'figado',
            estacao: 'verao',
            tracos: ['ambicioso', 'lider', 'irritavel', 'energetico'],
          },
          melancolico: {
            humor: 'bilis negra',
            qualidade: 'frio + seco',
            orgao: 'baco',
            estacao: 'outono',
            tracos: ['analitico', 'criativo', 'introspectivo', 'pessimista'],
          },
          fleumatico: {
            humor: 'fleuma',
            qualidade: 'frio + umido',
            orgao: 'cerebro',
            estacao: 'inverno',
            tracos: ['calmo', 'pacifico', 'diplomatico', 'estavel'],
          },
        },
        'TEMPERAMENTO_PILAR_MAP',
        0,
        {
          sanguineo: { pilar: 'tantra', camada: 'S', elemento: 'ar' },
          colerico: { pilar: 'cabala', camada: 'V', elemento: 'fogo' },
          melancolico: { pilar: 'iching', camada: 'D', elemento: 'terra' },
          fleumatico: { pilar: 'astrologia', camada: 'Z', elemento: 'agua' },
        },
        'buildTantricMap',
        0,
        function (a) {
          let u,
            p,
            f,
            v,
            y,
            h,
            g,
            C,
            b,
            E,
            k,
            B,
            M = n(a),
            q = t(a),
            A = s(a),
            x = d(a),
            I = l(a);
          return {
            soul: M,
            soulBody: M,
            soulDescription: i(M),
            karma: q,
            karmaBody: q,
            karmaDescription: i(q),
            divineGift: A,
            divineGiftBody: A,
            divineGiftDescription: i(A),
            destiny: x,
            tantricPath: I,
            tantricBodies: { ...e },
            bodies: (function (a) {
              let e = a.match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (!e)
                return {
                  fisico: {
                    number: 1,
                    description: 'Corpo físico — padrão',
                    qualities: ['Energia padrão'],
                  },
                  pranic: {
                    number: 1,
                    description: 'Corpo prânico — padrão',
                    qualities: ['Prana padrão'],
                  },
                  emocional: {
                    number: 1,
                    description: 'Corpo emocional — padrão',
                    qualities: ['Emoção padrão'],
                  },
                  mental: {
                    number: 1,
                    description: 'Corpo mental — padrão',
                    qualities: ['Mente padrão'],
                  },
                  espiritual: {
                    number: 1,
                    description: 'Corpo espiritual — padrão',
                    qualities: ['Espiritualidade padrão'],
                  },
                };
              let [, i, o, n] = e,
                t = parseInt(n, 10),
                s = parseInt(o, 10),
                d = parseInt(i, 10),
                l = r(t),
                u = r(s),
                p = r(t + s),
                f = r(t + (d % 100)),
                v = r(
                  String(d)
                    .split('')
                    .reduce((a, e) => a + parseInt(e, 10), 0)
                ),
                y = (a) => (11 === a, a),
                h = (a, e) => m[a]?.[e] ?? m[a]?.[r(e)] ?? `Corpo ${a}: energia ${e}`,
                g = (a) => c[a] ?? c[r(a)] ?? [`Energia ${a}`];
              return {
                fisico: { number: y(l), description: h('fisico', l), qualities: g(l) },
                pranic: { number: y(u), description: h('pranic', u), qualities: g(u) },
                emocional: { number: y(p), description: h('emocional', p), qualities: g(p) },
                mental: { number: y(f), description: h('mental', f), qualities: g(f) },
                espiritual: { number: y(v), description: h('espiritual', v), qualities: g(v) },
              };
            })(a),
            sacredGeometry:
              ((p = (u = M + q + x) >= 9),
              (f = u >= 12),
              (h = (y = Object.keys(
                (v = {
                  triangle: ['Estrela de Davi', 'Metatron', 'Triângulo de Wealth'],
                  square: ['Cubo de Metatron', 'Quadrado de Duty', 'Octaedro'],
                  pentagon: ['Pentagrama', 'Fibonacci', 'Proporção Áurea'],
                  hexagon: ['Hexagrama', 'Flor da Vida', 'Padrão Floral'],
                  default: ['Cubo de Metatron', 'Semente da Vida', 'Ovo da Vida'],
                })
              ).find((a) => 'default' !== a && u % (parseInt(a.replace(/\D/g, '')) || 3) == 0))
                ? v[y]
                : v.default),
              (g = f ? Math.round(7.83 * u) : 0),
              {
                merkabaActive: p,
                merkabahFields: p
                  ? ['Luz', 'Rotação', 'Respiro', 'Inversão', 'Expansão', 'Contração']
                  : ['Luz', 'Rotação'],
                flowerOfLife: h,
                torusEnergy: {
                  active: f,
                  frequency: g,
                  intensity: Math.min(10, Math.round(u / 3)),
                },
              }),
            chakraStates:
              ((C = o[M] ?? o[1]),
              (b = Object.entries(o)
                .filter(([a]) => parseInt(a) !== M)
                .map(([a, e]) => ({
                  chakra: a,
                  name: e.name,
                  element: e.element,
                  frequency: e.frequency,
                  state: 'balanced',
                  affirmation: e.affirmation,
                }))),
              [{ ...C, chakra: String(M), state: 'balanced' }, ...b]),
            energyMatrix: {
              1: { physicalBody: 9, emotionalBody: 1, mentalBody: 3, spiritualBody: 2 },
              2: { physicalBody: 2, emotionalBody: 9, mentalBody: 1, spiritualBody: 3 },
              3: { physicalBody: 3, emotionalBody: 2, mentalBody: 9, spiritualBody: 1 },
              4: { physicalBody: 9, emotionalBody: 4, mentalBody: 2, spiritualBody: 4 },
              5: { physicalBody: 5, emotionalBody: 5, mentalBody: 5, spiritualBody: 5 },
              6: { physicalBody: 6, emotionalBody: 6, mentalBody: 3, spiritualBody: 6 },
              7: { physicalBody: 7, emotionalBody: 3, mentalBody: 7, spiritualBody: 7 },
              8: { physicalBody: 8, emotionalBody: 8, mentalBody: 4, spiritualBody: 8 },
              9: { physicalBody: 9, emotionalBody: 9, mentalBody: 9, spiritualBody: 9 },
              10: { physicalBody: 1, emotionalBody: 1, mentalBody: 1, spiritualBody: 10 },
              11: { physicalBody: 2, emotionalBody: 2, mentalBody: 11, spiritualBody: 11 },
            }[q] ?? { physicalBody: q, emotionalBody: q, mentalBody: q, spiritualBody: q },
            elementBalances: {
              fire: ((E = M + q + x) % 9) + 1,
              water: ((2 * E) % 9) + 1,
              earth: ((3 * E) % 9) + 1,
              air: ((4 * E) % 9) + 1,
              ether: ((5 * E) % 9) + 1,
            },
            kundaliniState:
              ((B =
                (k = {
                  1: {
                    primaryChakra: '1',
                    secondaryChakras: ['2', '3'],
                    kundaliniMessage:
                      'A energia kundalini está despertando na Raiz — firmeza e sobrevivência.',
                  },
                  2: {
                    primaryChakra: '2',
                    secondaryChakras: ['1', '3'],
                    kundaliniMessage:
                      'A energia flui do Sacro — criatividade e emoções em movimento.',
                  },
                  3: {
                    primaryChakra: '3',
                    secondaryChakras: ['2', '4'],
                    kundaliniMessage: 'O poder pessoal do Solar está ativando a kundalini.',
                  },
                  4: {
                    primaryChakra: '4',
                    secondaryChakras: ['3', '5'],
                    kundaliniMessage:
                      'O coração é o portal de ativação — amor como força ascendente.',
                  },
                  5: {
                    primaryChakra: '5',
                    secondaryChakras: ['4', '6'],
                    kundaliniMessage:
                      'A garganta abre o canal de expressão — a kundalini se manifesta na voz.',
                  },
                  6: {
                    primaryChakra: '6',
                    secondaryChakras: ['5', '7'],
                    kundaliniMessage:
                      'O terceiro olho vê o caminho — a kundalini guia com visão clara.',
                  },
                  7: {
                    primaryChakra: '7',
                    secondaryChakras: ['6', '8'],
                    kundaliniMessage: 'A coroa se abre — a kundalini se funde com o divino.',
                  },
                  8: {
                    primaryChakra: '8',
                    secondaryChakras: ['7', '9'],
                    kundaliniMessage:
                      'A estrela da alma acelera a kundalini — expansão multidimensional.',
                  },
                  9: {
                    primaryChakra: '9',
                    secondaryChakras: ['8', '10'],
                    kundaliniMessage: 'A estrela da terra ancora a kundalini — manifestação pura.',
                  },
                  10: {
                    primaryChakra: '10',
                    secondaryChakras: ['9', '11'],
                    kundaliniMessage: 'O estado universal ativa a kundalini — unicidade cósmica.',
                  },
                  11: {
                    primaryChakra: '11',
                    secondaryChakras: ['10', '7'],
                    kundaliniMessage: 'O divino opera a kundalini — transcendência total.',
                  },
                })[A] ?? k[1]),
              {
                active: A >= 4,
                primaryChakra: B.primaryChakra,
                secondaryChakras: B.secondaryChakras,
                kundaliniMessage: B.kundaliniMessage,
              }),
          };
        },
        'calculateDestiny',
        0,
        d,
        'calculateDivineGift',
        0,
        s,
        'calculateKarma',
        0,
        t,
        'calculateSoul',
        0,
        n,
        'calculateTantricPath',
        0,
        l,
        'inferirTemperamentoAtual',
        0,
        function (a) {
          let e = a.getMonth() + 1;
          return e >= 3 && e <= 5
            ? 'sanguineo'
            : e >= 6 && e <= 8
              ? 'colerico'
              : e >= 9 && e <= 11
                ? 'melancolico'
                : 'fleumatico';
        },
        'isTemperamento',
        0,
        function (a) {
          return 'string' == typeof a && u.includes(a);
        },
      ],
      90009
    );
  },
]);
