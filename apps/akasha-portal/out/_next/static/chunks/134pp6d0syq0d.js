(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  36446,
  (a) => {
    'use strict';
    let e = [
        {
          id: 'saude',
          titulo: 'Saúde & Vitalidade',
          descricao: 'Como está seu corpo hoje? Qual é sua energia?',
          icone: '◈',
          chakraCor: '#C43E3E',
          pilaresPrimarios: ['tantrica', 'cabala'],
          pilaresSecundarios: ['astrologia'],
        },
        {
          id: 'trabalho',
          titulo: 'Trabalho & Prosperidade',
          descricao: 'Qual carreira te realiza? Como está seu dinheiro?',
          icone: '◬',
          chakraCor: '#C4763E',
          pilaresPrimarios: ['cabala'],
          pilaresSecundarios: ['astrologia', 'tantrica'],
        },
        {
          id: 'sexualidade',
          titulo: 'Sexualidade & Desejo',
          descricao: 'Como é sua sexualidade? O que te atrai?',
          icone: '◉',
          chakraCor: '#C43E8E',
          pilaresPrimarios: ['tantrica'],
          pilaresSecundarios: ['cabala', 'astrologia', 'odu'],
        },
        {
          id: 'amor',
          titulo: 'Amor & Relacionamentos',
          descricao: 'Como você se relaciona? Qual parceiro é ideal?',
          icone: '♥',
          chakraCor: '#C43E5E',
          pilaresPrimarios: ['astrologia'],
          pilaresSecundarios: ['tantrica', 'cabala', 'odu'],
        },
        {
          id: 'criacao',
          titulo: 'Criação & Expressão',
          descricao: 'Como você se expressa? Qual é sua arte?',
          icone: '✦',
          chakraCor: '#C4C43E',
          pilaresPrimarios: ['cabala', 'astrologia'],
          pilaresSecundarios: ['tantrica'],
        },
        {
          id: 'proposito',
          titulo: 'Propósito & Destino',
          descricao: 'Para que você veio? Qual é sua missão?',
          icone: '★',
          chakraCor: '#8EC43E',
          pilaresPrimarios: ['cabala', 'astrologia'],
          pilaresSecundarios: ['tantrica', 'odu'],
        },
        {
          id: 'familia',
          titulo: 'Família & Ancestralidade',
          descricao: 'Qual é sua herança? O que vem da sua família?',
          icone: '⬡',
          chakraCor: '#3EC48E',
          pilaresPrimarios: ['odu'],
          pilaresSecundarios: ['astrologia', 'tantrica'],
        },
        {
          id: 'espiritualidade',
          titulo: 'Espiritualidade & Transcendência',
          descricao: 'Como você se conecta com o divino?',
          icone: '✧',
          chakraCor: '#3E8EC4',
          pilaresPrimarios: ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'],
          pilaresSecundarios: [],
        },
        {
          id: 'superacao',
          titulo: 'Superação & Desafios',
          descricao: 'Como transformar sombra em força?',
          icone: '⛾',
          chakraCor: '#8E3EC4',
          pilaresPrimarios: ['cabala', 'odu'],
          pilaresSecundarios: ['astrologia', 'tantrica'],
        },
      ],
      r = {
        saude: e[0],
        trabalho: e[1],
        sexualidade: e[2],
        amor: e[3],
        criacao: e[4],
        proposito: e[5],
        familia: e[6],
        espiritualidade: e[7],
        superacao: e[8],
      };
    a.s([
      'DIMENSAO_BG',
      0,
      {
        saude: 'rgba(196,62,62,0.08)',
        trabalho: 'rgba(196,118,62,0.08)',
        sexualidade: 'rgba(196,62,142,0.08)',
        amor: 'rgba(196,62,94,0.08)',
        criacao: 'rgba(196,196,62,0.08)',
        proposito: 'rgba(142,196,62,0.08)',
        familia: 'rgba(62,196,142,0.08)',
        espiritualidade: 'rgba(62,142,196,0.08)',
        superacao: 'rgba(142,62,196,0.08)',
      },
      'DIMENSAO_BORDER',
      0,
      {
        saude: 'rgba(196,62,62,0.25)',
        trabalho: 'rgba(196,118,62,0.25)',
        sexualidade: 'rgba(196,62,142,0.25)',
        amor: 'rgba(196,62,94,0.25)',
        criacao: 'rgba(196,196,62,0.25)',
        proposito: 'rgba(142,196,62,0.25)',
        familia: 'rgba(62,196,142,0.25)',
        espiritualidade: 'rgba(62,142,196,0.25)',
        superacao: 'rgba(142,62,196,0.25)',
      },
      'DIMENSAO_DE_AREA',
      0,
      {
        paz: 'saude',
        saude: 'saude',
        relacoes: 'amor',
        dinheiro: 'trabalho',
        trabalho: 'trabalho',
        proposito: 'proposito',
        criatividade: 'criacao',
        espiritualidade: 'espiritualidade',
        sexualidade: 'sexualidade',
      },
      'DIMENSAO_POR_ID',
      0,
      r,
      'DIMENSOES',
      0,
      e,
    ]);
  },
  28944,
  (a) => {
    'use strict';
    var e = a.i(30722),
      r = a.i(52330),
      i = a.i(36446);
    function o(a) {
      return a
        ? a
            .split('\n\n')
            .filter(Boolean)
            .map((a, r) => {
              let i = a.split(/\*\*(.+?)\*\*/g);
              return i.length > 1
                ? (0, e.jsx)(
                    'span',
                    {
                      style: { display: 'block', marginBottom: 4 },
                      children: i.map((a, r) =>
                        r % 2 == 1
                          ? (0, e.jsx)('strong', { style: { color: '#E8D0FF' }, children: a }, r)
                          : (0, e.jsx)('span', { children: a }, r)
                      ),
                    },
                    r
                  )
                : (0, e.jsx)(
                    'span',
                    { style: { display: 'block', marginBottom: 4 }, children: a },
                    r
                  );
            })
        : [];
    }
    a.s([
      'DimensaoCard',
      0,
      function ({ sintese: a, index: s }) {
        let [t, l] = (0, r.useState)(!1),
          n = i.DIMENSAO_POR_ID[a.dimensoesId];
        return (0, e.jsxs)('article', {
          onClick: () => l((a) => !a),
          onKeyDown: (a) => {
            ('Enter' === a.key || ' ' === a.key) && (a.preventDefault(), l((a) => !a));
          },
          role: 'button',
          tabIndex: 0,
          'aria-expanded': t,
          style: {
            background: i.DIMENSAO_BG[a.dimensoesId] ?? 'rgba(255,255,255,0.04)',
            border: `1px solid ${i.DIMENSAO_BORDER[a.dimensoesId] ?? 'rgba(255,255,255,0.1)'}`,
            borderRadius: 16,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: 0,
            animation: `fadeSlideIn 0.4s ease ${60 * s}ms forwards`,
          },
          children: [
            (0, e.jsxs)('header', {
              style: { display: 'flex', alignItems: 'center', gap: 12 },
              children: [
                (0, e.jsx)('span', {
                  style: { fontSize: '1.4rem', color: a.chakraCor, lineHeight: 1, flexShrink: 0 },
                  'aria-hidden': !0,
                  children: a.icone,
                }),
                (0, e.jsxs)('div', {
                  style: { flex: 1, minWidth: 0 },
                  children: [
                    (0, e.jsx)('h3', {
                      style: {
                        fontFamily: 'var(--font-cinzel, serif)',
                        fontSize: '1rem',
                        color: '#E8E0FF',
                        margin: 0,
                        lineHeight: 1.2,
                      },
                      children: a.titulo,
                    }),
                    n?.descricao &&
                      (0, e.jsx)('p', {
                        style: {
                          fontSize: '0.78rem',
                          color: 'rgba(232,224,255,0.5)',
                          margin: '3px 0 0',
                          lineHeight: 1.3,
                        },
                        children: n.descricao,
                      }),
                  ],
                }),
                (0, e.jsx)('span', {
                  style: {
                    color: 'rgba(232,224,255,0.4)',
                    fontSize: '1rem',
                    transition: 'transform 0.2s ease',
                    transform: t ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  },
                  'aria-hidden': !0,
                  children: '▼',
                }),
              ],
            }),
            (0, e.jsx)('div', {
              style: {
                marginTop: 10,
                fontSize: '0.88rem',
                color: 'rgba(232,224,255,0.75)',
                lineHeight: 1.5,
                overflow: 'hidden',
                maxHeight: t ? 'none' : '3.6em',
                maskImage: t ? 'none' : 'linear-gradient(to bottom, black 50%, transparent 100%)',
                WebkitMaskImage: t
                  ? 'none'
                  : 'linear-gradient(to bottom, black 50%, transparent 100%)',
              },
              children: o(a.synthes),
            }),
            t &&
              (0, e.jsxs)('div', {
                style: {
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                },
                children: [
                  (0, e.jsx)('section', {
                    children: (0, e.jsx)('div', {
                      style: {
                        fontSize: '0.88rem',
                        color: 'rgba(232,224,255,0.8)',
                        lineHeight: 1.6,
                      },
                      children: o(a.synthes),
                    }),
                  }),
                  a.praktika &&
                    (0, e.jsxs)('section', {
                      children: [
                        (0, e.jsx)('h4', {
                          style: {
                            fontSize: '0.72rem',
                            color: 'rgba(232,224,255,0.4)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            margin: '0 0 6px',
                          },
                          children: '▸ Prática de hoje',
                        }),
                        (0, e.jsx)('p', {
                          style: {
                            fontSize: '0.85rem',
                            color: 'rgba(232,224,255,0.75)',
                            lineHeight: 1.5,
                            margin: 0,
                          },
                          children: a.praktika,
                        }),
                      ],
                    }),
                  a.alerta &&
                    (0, e.jsxs)('section', {
                      children: [
                        (0, e.jsx)('h4', {
                          style: {
                            fontSize: '0.72rem',
                            color: 'rgba(255,180,100,0.6)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            margin: '0 0 6px',
                          },
                          children: '⚠ Atenção',
                        }),
                        (0, e.jsx)('p', {
                          style: {
                            fontSize: '0.85rem',
                            color: 'rgba(255,200,150,0.75)',
                            lineHeight: 1.5,
                            margin: 0,
                          },
                          children: a.alerta,
                        }),
                      ],
                    }),
                  a.autoridadeAkasha.aplicavel &&
                    (0, e.jsxs)('section', {
                      style: {
                        background: 'rgba(255,200,80,0.06)',
                        border: '1px solid rgba(255,200,80,0.15)',
                        borderRadius: 10,
                        padding: '10px 14px',
                      },
                      children: [
                        (0, e.jsx)('h4', {
                          style: {
                            fontSize: '0.72rem',
                            color: 'rgba(255,200,80,0.7)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            margin: '0 0 6px',
                          },
                          children: '⚖ Akasha Authority',
                        }),
                        (0, e.jsxs)('p', {
                          style: {
                            fontSize: '0.83rem',
                            color: 'rgba(255,220,150,0.85)',
                            lineHeight: 1.5,
                            margin: 0,
                          },
                          children: [
                            'Antes de decidir nesta área: pergunte — isso vem da sua paz interior ou da sua ansiedade?',
                            ' ',
                            'Se ansiedade, ',
                            (0, e.jsx)('strong', {
                              style: { color: '#FFD080' },
                              children: 'espere',
                            }),
                            '. Se paz,',
                            ' ',
                            (0, e.jsx)('strong', { style: { color: '#FFD080' }, children: 'aja' }),
                            '.',
                            a.autoridadeAkasha.timing &&
                              (0, e.jsxs)('span', {
                                style: { display: 'block', marginTop: 4, opacity: 0.75 },
                                children: ['⏰ ', a.autoridadeAkasha.timing],
                              }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
          ],
        });
      },
    ]);
  },
]);
