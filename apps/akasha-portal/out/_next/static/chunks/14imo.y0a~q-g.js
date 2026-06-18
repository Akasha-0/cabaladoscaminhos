(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  77634,
  (e) => {
    'use strict';
    (e.s([], 36915), e.i(36915));
    let a = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 6,
        G: 7,
        H: 8,
        I: 9,
        J: 1,
        K: 2,
        L: 3,
        M: 4,
        N: 5,
        O: 6,
        P: 7,
        Q: 8,
        R: 9,
        S: 1,
        T: 2,
        U: 3,
        V: 4,
        W: 5,
        X: 6,
        Y: 7,
        Z: 8,
      },
      o = new Set(['A', 'E', 'I', 'O', 'U']);
    function i(e, a = !0) {
      if (e <= 0) return 0;
      if (e <= 9 || (a && (11 === e || 22 === e || 33 === e))) return e;
      let o = e;
      for (; o > 9 && !(a && (11 === o || 22 === o || 33 === o)); )
        o = String(o)
          .split('')
          .reduce((e, a) => e + parseInt(a, 10), 0);
      return o;
    }
    function r(e) {
      return 11 === e || 22 === e || 33 === e;
    }
    function n(e) {
      let a = i(
        e
          .replace(/\D/g, '')
          .split('')
          .reduce((e, a) => e + parseInt(a, 10), 0)
      );
      return { number: a, master: r(a) };
    }
    function t(e) {
      let o = i(
        I(e)
          .split('')
          .filter((e) => void 0 !== a[e])
          .reduce((e, o) => e + a[o], 0)
      );
      return { number: o, master: r(o) };
    }
    function s(e) {
      let n = i(
        I(e)
          .split('')
          .filter((e) => o.has(e.toUpperCase()) && void 0 !== a[e.toUpperCase()])
          .reduce((e, o) => e + a[o.toUpperCase()], 0)
      );
      return { number: n, master: r(n) };
    }
    function d(e) {
      let n = i(
        I(e)
          .split('')
          .filter((e) => !o.has(e) && void 0 !== a[e])
          .reduce((e, o) => e + a[o], 0)
      );
      return { number: n, master: r(n) };
    }
    function l(e) {
      let a = e.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return a ? parseInt(a[3], 10) : 0;
    }
    function c(e) {
      let a = e.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!a) return { first: 0, second: 0, main: 0, last: 1 };
      let [, o, r, n] = a,
        t = parseInt(o, 10),
        s = parseInt(r, 10),
        d = i(parseInt(n, 10)),
        l = i(s),
        c = i(t),
        m = Math.abs(d - l),
        u = Math.abs(d - c),
        p = Math.abs(m - u),
        f = Math.abs(l - c);
      return { first: m, second: u, main: p, last: 0 === f ? 1 : f };
    }
    function m(e) {
      let o = new Set(
          I(e)
            .split('')
            .map((e) => a[e])
            .filter((e) => void 0 !== e && e > 0)
        ),
        i = [];
      for (let e = 1; e <= 9; e++) o.has(e) || i.push(e);
      return i;
    }
    let u = [13, 14, 16, 19];
    function p(e, i) {
      let r,
        n = I(e);
      var t = [
        n.split('').reduce((e, o) => e + (a[o] ?? 0), 0),
        n
          .split('')
          .filter((e) => o.has(e))
          .reduce((e, o) => e + (a[o] ?? 0), 0),
        n
          .split('')
          .filter((e) => !o.has(e))
          .reduce((e, o) => e + (a[o] ?? 0), 0),
        i
          .replace(/\D/g, '')
          .split('')
          .reduce((e, a) => e + parseInt(a, 10), 0),
        (r = i.match(/^(\d{4})-(\d{2})-(\d{2})/)) ? parseInt(r[3], 10) : 0,
      ];
      let s = new Set();
      for (let e of t) {
        let a = e;
        for (; a > 9; )
          (u.includes(a) && s.add(a),
            (a = String(a)
              .split('')
              .reduce((e, a) => e + parseInt(a, 10), 0)));
      }
      return [...s].sort((e, a) => e - a);
    }
    function f(e, a) {
      let o = e.match(/^(\d{4})-(\d{2})-(\d{2})/),
        n = o ? i(parseInt(o[3], 10), !1) : 0,
        t = o ? i(parseInt(o[2], 10), !1) : 0,
        s = o ? i(parseInt(o[1], 10), !1) : 0,
        d = i(n + t, !1),
        l = i(n + s, !1),
        c = i(d + l, !1),
        m = i(t + s, !1),
        u = 36 - (r(a) ? i(a, !1) : a);
      return {
        first: { number: d, ageEnd: u, meaning: A(d) },
        second: { number: l, ageStart: u + 1, ageEnd: u + 9, meaning: A(l) },
        third: { number: c, ageStart: u + 10, ageEnd: u + 18, meaning: A(c) },
        fourth: { number: m, ageStart: u + 19, meaning: A(m) },
      };
    }
    let h = {
      0: {
        name: 'O Louco',
        meaning: 'Inocência, espontaneidade, liberdade, novos começos, o viajante',
      },
      1: { name: 'O Mago', meaning: 'Vontade, habilidade, poder, criatividade, foco,manifestação' },
      2: {
        name: 'A Sacerdotisa',
        meaning: 'Intuição, conhecimento, mistério, sabedoria interior, segredos',
      },
      3: {
        name: 'A Imperatriz',
        meaning: 'Fertilidade, abundance, nuturing, natureza, mãe divina',
      },
      4: {
        name: 'O Imperador',
        meaning: 'Autoridade, estrutura, paternalismo, liderança, estabilidade',
      },
      5: { name: 'O Hierofante', meaning: 'Tradição, espiritualidade, educação, dogmas, guias' },
      6: { name: 'Os Enamorados', meaning: 'Amor, união, escolhas, duality, relacionamentos' },
      7: { name: 'O Carro', meaning: 'Vontade, vitória, autodisciplina, assertividade, triunfo' },
      8: { name: 'A Justiça', meaning: 'Equilíbrio, verdade, lei,因果, honestidade, karma' },
      9: {
        name: 'O Eremita',
        meaning: 'Introspecção, solidão, autoconhecimento, busca interior, sabedoria',
      },
      10: {
        name: 'A Roda da Fortuna',
        meaning: 'Ciclos, destino, mudança, sorte, transformação, acaso',
      },
      11: {
        name: 'A Força',
        meaning: 'Coragem, perseverança, compaixão, autocontrole, poder suave',
      },
      12: {
        name: 'O Enforcado',
        meaning: 'Nova perspectiva, sacrifício, pausa, rendição, visão invertida',
      },
      13: {
        name: 'A Morte',
        meaning: 'Transformação, fim de ciclo, renovação, transição, metamorfose',
      },
      14: {
        name: 'A Temperança',
        meaning: 'Equilíbrio, paciência, propósito, significado, moderação',
      },
      15: { name: 'O Diabo', meaning: 'Apego material, sombras, tentação, cadeias, manipulação' },
      16: {
        name: 'A Torre',
        meaning: 'Destruição criativa, revelação, upheaval, despertar súbito',
      },
      17: {
        name: 'A Estrela',
        meaning: 'Esperança, fé, propósito,renewal, serenidade, inspiracão',
      },
      18: { name: 'A Lua', meaning: 'Ilusão, intuição, inconsciente, medo, sombras, água' },
      19: {
        name: 'O Sol',
        meaning: 'Sucesso, vitalidade, infância, felicidade, realização, alegria',
      },
      20: {
        name: 'O Julgamento',
        meaning: 'Avaliação, redenção, culpa, despertar, chamada interior',
      },
      21: {
        name: 'O Mundo',
        meaning: 'Completude, integração, realização, wholeness, danca da vida',
      },
    };
    function g(e) {
      return e <= 21 ? e : i(e, !1);
    }
    function v(e, a) {
      let o = g(e),
        i = g(a);
      return {
        lifePath: {
          major: o,
          name: h[o]?.name ?? `Arcana ${o}`,
          meaning: h[o]?.meaning ?? 'Significado arquetípico do Tarô',
        },
        expression: {
          major: i,
          name: h[i]?.name ?? `Arcana ${i}`,
          meaning: h[i]?.meaning ?? 'Significado arquetípico do Tarô',
        },
      };
    }
    function b(e, a = new Date()) {
      let o = e.match(/^(\d{4})-(\d{2})-(\d{2})/),
        r = o ? parseInt(o[3], 10) : 0,
        n = o ? parseInt(o[2], 10) : 0,
        t = a.getFullYear(),
        s = a.getMonth() + 1,
        d = a.getDate(),
        l = i(
          String(t)
            .split('')
            .reduce((e, a) => e + parseInt(a, 10), 0),
          !1
        ),
        c = i(r + n + l, !1),
        m = i(c + s, !1),
        u = i(m + d, !1);
      return {
        personalYear: c,
        personalMonth: m,
        personalDay: u,
        referenceDate: a.toISOString().slice(0, 10),
      };
    }
    function C(e) {
      let a = e.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!a)
        return {
          first: { number: 0, ageStart: 0, ageEnd: 28 },
          second: { number: 0, ageStart: 29, ageEnd: 56 },
          third: { number: 0, ageStart: 57 },
        };
      let [, o, r, n] = a,
        t = i(parseInt(n, 10)),
        s = i(parseInt(r, 10)),
        d = i(parseInt(o, 10)),
        l = 36 - t,
        c = l + 27;
      return {
        first: { number: t, ageStart: 0, ageEnd: l },
        second: { number: s, ageStart: l + 1, ageEnd: c },
        third: { number: d, ageStart: c + 1 },
      };
    }
    function I(e) {
      return e
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z]/g, '');
    }
    let O = {
      1: 'Iniciativa, liderança, independência, originalidade, pioneirismo',
      2: 'Parceria, cooperação, diplomacia, sensibilidade, equilíbrio',
      3: 'Expressão, criatividade, comunicação, otimismo, inspiração',
      4: 'Estabilidade, estrutura, trabalho árduo, organização, fundamento',
      5: 'Liberdade, mudança, aventura, versatilidade, adaptação',
      6: 'Responsabilidade, família, lar, harmonia, serviço',
      7: 'Análise, introspecção, espiritualidade, solidão, conhecimento',
      8: 'Poder, autoridade, riqueza material, ambição, sabedoria prática',
      9: 'Compaixão, humanitarismo, encerramento, generosidade, iluminação',
      11: 'Iluminação espiritual, intuição elevada, mestre, visão profética',
      22: 'Mestre construtor, realizações práticas em grande escala',
      33: 'Mestre professor, serviço espiritual sem ego, cura em massa',
    };
    function A(e) {
      return O[e] ?? O[i(e, !0)] ?? `Energia do n\xfamero ${e}`;
    }
    let E = {
        1: 'Aleph',
        2: 'Bet',
        3: 'Gimel',
        4: 'Dalet',
        5: 'He',
        6: 'Vav',
        7: 'Zayin',
        8: 'Het',
        9: 'Tet',
        10: 'Yod',
        11: 'Kaf',
        12: 'Lamed',
        13: 'Mem',
        14: 'Nun',
        15: 'Samekh',
        16: 'Ayin',
        17: 'Pe',
        18: 'Tsade',
        19: 'Qof',
        20: 'Resh',
        21: 'Shin',
        22: 'Tav',
      },
      M = {
        1: 'Keter (Coroa)',
        2: 'Chokhmah (Sabedoria)',
        3: 'Binah (Compreensão)',
        4: 'Chesed (Misericórdia)',
        5: 'Gevurah (Força)',
        6: 'Tiferet (Beleza)',
        7: 'Netzach (Vitória)',
        8: 'Hod (Glória)',
        9: 'Yesod (Fundação)',
        10: 'Malkuth (Reino)',
      },
      q = [11, 22, 33],
      T = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 6,
        G: 7,
        H: 8,
        I: 9,
        J: 1,
        K: 2,
        L: 3,
        M: 4,
        N: 5,
        O: 6,
        P: 7,
        Q: 8,
        R: 9,
        S: 1,
        T: 2,
        U: 3,
        V: 4,
        W: 5,
        X: 6,
        Y: 7,
        Z: 8,
        Á: 1,
        À: 1,
        Ã: 1,
        Â: 1,
        É: 5,
        Ê: 5,
        Í: 9,
        Ó: 6,
        Ô: 6,
        Õ: 6,
        Ú: 3,
        Ü: 3,
      },
      z = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 8,
        G: 3,
        H: 5,
        I: 1,
        J: 1,
        K: 2,
        L: 3,
        M: 4,
        N: 5,
        O: 7,
        P: 8,
        Q: 1,
        R: 2,
        S: 3,
        T: 4,
        U: 6,
        V: 6,
        W: 6,
        X: 5,
        Y: 1,
        Z: 7,
        Á: 1,
        À: 1,
        Ã: 1,
        Â: 1,
        É: 5,
        Ê: 5,
        Í: 1,
        Ó: 7,
        Ô: 7,
        Õ: 7,
        Ú: 6,
        Ü: 6,
      },
      N = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 8,
        G: 3,
        H: 5,
        I: 1,
        J: 1,
        K: 2,
        L: 30,
        M: 40,
        N: 50,
        O: 70,
        P: 80,
        Q: 100,
        R: 200,
        S: 300,
        T: 400,
        U: 6,
        V: 700,
        W: 900,
        X: 60,
        Y: 10,
        Z: 700,
        Á: 1,
        À: 1,
        Ã: 1,
        Â: 1,
        É: 5,
        Ê: 5,
        Í: 1,
        Ó: 70,
        Ô: 70,
        Õ: 70,
        Ú: 6,
        Ü: 6,
      };
    function S(e) {
      for (; e > 9 && 11 !== e && 22 !== e && 33 !== e; )
        e = e
          .toString()
          .split('')
          .reduce((e, a) => e + parseInt(a), 0);
      return e;
    }
    function P(e) {
      let a = e
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/[^A-Z]/g, ''),
        o = 0;
      for (let e of a) o += T[e] || 0;
      return S(o);
    }
    function F(e) {
      let a = e
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/[^A-Z]/g, ''),
        o = 0;
      for (let e of a) o += z[e] || 0;
      return S(o);
    }
    function R(e) {
      let a = e
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/[^A-Z]/g, ''),
        o = 0;
      for (let e of a) o += N[e] || 0;
      return S(o);
    }
    function x(e) {
      let a = e.replace(/\D/g, ''),
        o = 0;
      for (let e of a) o += parseInt(e);
      return S(o);
    }
    function D(e) {
      let a = e.replace(/\D/g, ''),
        o = 0;
      for (let e of a) o += parseInt(e);
      return S(o);
    }
    let y = {
      1: {
        numero: 1,
        nome: 'O Sol',
        significado:
          'Liderança, independência, pioneirismo e inovação. O número 1 representa o início de tudo, a centelha divina que dá origem à criação.',
        forca: 'Determinação, coragem, originalidade e ambição',
        desafio: 'Egocentrismo, impaciência e arrogância',
        sefirotRelacionado: 'Kether (Coroa)',
      },
      2: {
        numero: 2,
        nome: 'A Lua',
        significado:
          'Parceria, cooperação, diplomacy and sensitivity. O número 2 representa a dualidade e a necessidade de equilíbrio entre opostos.',
        forca: 'Diplomacia, empatia, paciência e adaptabilidade',
        desafio: 'Indecisão, subordinação excessiva e auto-piedade',
        sefirotRelacionado: 'Chokmah (Sabedoria)',
      },
      3: {
        numero: 3,
        nome: 'Júpiter',
        significado:
          'Expressão criativa, comunicação, otimismo e expansão. O número 3 representa a trindade e a manifestação criativa.',
        forca: 'Criatividade, sociabilidade, otimismo e inspiração',
        desafio: 'Superficialidade, dispersão e crítica excessiva',
        sefirotRelacionado: 'Binah (Compreensão)',
      },
      4: {
        numero: 4,
        nome: 'Urano',
        significado:
          'Estabilidade, construção, disciplina e trabalho árduo. O número 4 representa a matéria e a estrutura física da realidade.',
        forca: 'Praticidade, reliability, hard work and organization',
        desafio: 'Rigidez, teimosia e resistência à mudança',
        sefirotRelacionado: 'Chesed (Misericórdia)',
      },
      5: {
        numero: 5,
        nome: 'Mercúrio',
        significado:
          'Liberdade, mudança, aventura e progresso. O número 5 representa a mente em movimento e a busca por experiências.',
        forca: 'Versatilidade, curiosidade, comunicação e adaptabilidade',
        desafio: 'Impaciência, irresponsabilidade e superficialidade',
        sefirotRelacionado: 'Geburah (Severidade)',
      },
      6: {
        numero: 6,
        nome: 'Vênus',
        significado:
          'Harmonia, amor, família e responsabilidade. O número 6 representa o idealismo e o serviço aos outros.',
        forca: 'Compassão, responsabilidade, harmonic e devoção',
        desafio: 'Autocomplacência, interferência excessiva e ciúme',
        sefirotRelacionado: 'Tiphereth (Beleza)',
      },
      7: {
        numero: 7,
        nome: 'Netuno',
        significado:
          'Sabedoria interior, introspecção, espiritualidade e análise. O número 7 representa a busca pela verdade interior.',
        forca: 'Intuição, sabedoria, análise e espiritualidade',
        desafio: 'Isolamento, melancolia e ceticismo excessivo',
        sefirotRelacionado: 'Netzach (Vitória)',
      },
      8: {
        numero: 8,
        nome: 'Saturno',
        significado:
          'Abundância material, poder, autoridade ekarma. O número 8 representa o equilíbrio entre o material e o espiritual.',
        forca: 'Ambição, determinação, wisdom and material success',
        desafio: 'Materialismo, avareza e rigidez emocional',
        sefirotRelacionado: 'Hod (Glória)',
      },
      9: {
        numero: 9,
        nome: 'Marte',
        significado:
          'Humanitarismo, compaixão, completion and wisdom. O número 9 representa o encerramento de um ciclo e a sabedoria universal.',
        forca: 'Compaixão, generosidade, wisdom and idealism',
        desafio: 'Impaciência, resentimento e autodestruição',
        sefirotRelacionado: 'Yesod (Fundação)',
      },
      11: {
        numero: 11,
        nome: 'A Inspiração',
        significado:
          'Intuição espiritual, iluminação e visão profética. O número 11 é um número mestre que representa a ponte entre o mortal e o divino.',
        forca: 'Visão, intuição, espiritualidade e inspiração',
        desafio: 'Ansiedade, exaustão e sensibilidade excessiva',
        sefirotRelacionado: 'Daath (Conhecimento)',
      },
      22: {
        numero: 22,
        nome: 'O Mestre Construtor',
        significado:
          'Manifestação prática de sonhos grandiosos. O número 22 combina a visão espiritual do 11 com a praticidade do 4.',
        forca: 'Visão, practicidade, master e achievement',
        desafio: 'Exigência excessiva, instabilidade e autocrítica',
        sefirotRelacionado: 'Malkuth (Reino)',
      },
      33: {
        numero: 33,
        nome: 'O Mestre Elevado',
        significado:
          'Serviço espiritual altruísta. O número 33 representa a mais alta expressão de amor incondicional.',
        forca: 'Altruísmo, sabedoria, inspiration and healing',
        desafio: 'Martírio, sobrecarga e autopiedade',
        sefirotRelacionado: 'Tiphereth (Beleza)',
      },
    };
    function k(e) {
      return (
        y[e] || {
          numero: e,
          nome: 'Energia Desconhecida',
          significado:
            'Este número carrega uma energia única que transcende as definições tradicionais.',
          forca: 'Versatilidade e adaptabilidade',
          desafio: 'Encontrar seu caminho único',
          sefirotRelacionado: 'A determinar',
        }
      );
    }
    let V = {
        1: {
          numero: 1,
          nome: 'Líder',
          planeta: 'Sol',
          significado: 'Iniciativa, individualidade, pioneirismo',
          forca: 'Vontade, determinação',
          desafio: 'Egoísmo, impaciência',
          sefira: 'Kether',
          arco: 'I',
          cor: 'Ouro',
          pedra: 'Ágata de fogo',
          qualidade: 'Cardeal',
          palavraChave: ['liderança', 'início', 'independência'],
          affirmation: 'Eu lidero com confiança e clareza',
        },
        2: {
          numero: 2,
          nome: 'Diplomático',
          planeta: 'Lua',
          significado: 'Parceria, cooperação, receptividade',
          forca: 'Equilíbrio, adaptabilidade',
          desafio: 'Conflito interno, indecisão',
          sefira: 'Chokhmah',
          arco: 'II',
          cor: 'Prata',
          pedra: 'Pérola',
          qualidade: 'Cardeal',
          palavraChave: ['parceria', 'cooperação', 'receptividade'],
          affirmation: 'Eu colboro em harmonia e mutualidade',
        },
        3: {
          numero: 3,
          nome: 'Comunicador',
          planeta: 'Júpiter',
          significado: 'Expressão, criatividade, otimismo',
          forca: 'Inspiração, alegria',
          desafio: 'Superficialidade, dispersão',
          sefira: 'Binah',
          arco: 'III',
          cor: 'Azul-celeste',
          pedra: 'Ametista',
          qualidade: 'Cardeal',
          palavraChave: ['comunicação', 'criatividade', 'otimismo'],
          affirmation: 'Eu expresso minha verdade com alegria',
        },
        4: {
          numero: 4,
          nome: 'Construtor',
          planeta: 'Urano',
          significado: 'Trabalho, disciplina, estabilidade',
          forca: 'Método, organização',
          desafio: 'Rigidez, teimosia',
          sefira: 'Chesed',
          arco: 'IV',
          cor: 'Verde',
          pedra: 'Esmeralda',
          qualidade: 'Cardeal',
          palavraChave: ['construção', 'disciplina', 'estabilidade'],
          affirmation: 'Eu construo com firmeza e propósito',
        },
        5: {
          numero: 5,
          nome: 'Libertador',
          planeta: 'Mercúrio',
          significado: 'Liberdade, mudança, aventura',
          forca: 'Versatilidade, curiosidade',
          desafio: 'Irresponsabilidade, inquietude',
          sefira: 'Gevurah',
          arco: 'V',
          cor: 'Azul-turquesa',
          pedra: 'Turquesa',
          qualidade: 'Composto',
          palavraChave: ['liberdade', 'adaptação', 'mudança'],
          affirmation: 'Eu abraço a liberdade com responsabilidade',
        },
        6: {
          numero: 6,
          nome: 'Harmonizador',
          planeta: 'Vênus',
          significado: 'Família, responsabilidade, beleza',
          forca: 'Compaixão, serviço',
          desafio: 'Autocomplacência, martyr',
          sefira: 'Tipheret',
          arco: 'VI',
          cor: 'Rosa',
          pedra: 'Rodocrosita',
          qualidade: 'Composto',
          palavraChave: ['harmonia', 'família', 'responsabilidade'],
          affirmation: 'Eu amo e sirvo com equilíbrio',
        },
        7: {
          numero: 7,
          nome: 'Analítico',
          planeta: 'Netuno',
          significado: 'Análise, espiritualidade, introspecção',
          forca: 'Sabedoria, intuição',
          desafio: 'Isolamento, melancolia',
          sefira: 'Netzach',
          arco: 'VII',
          cor: 'Violeta',
          pedra: 'Larimar',
          qualidade: 'Fixo',
          palavraChave: ['análise', 'espiritualidade', 'introspecção'],
          affirmation: 'Eu busco a verdade com mente aberta',
        },
        8: {
          numero: 8,
          nome: 'Realizador',
          planeta: 'Saturno',
          significado: 'Poder, realizações, karma',
          forca: 'Abundância, mastersia',
          desafio: 'Materialismo, autoritarismo',
          sefira: 'Hod',
          arco: 'VIII',
          cor: 'Ferro',
          pedra: 'Ônix',
          qualidade: 'Fixo',
          palavraChave: ['realização', 'poder', 'karma'],
          affirmation: 'Eu manifesto abundância com integridade',
        },
        9: {
          numero: 9,
          nome: 'Humanitário',
          planeta: 'Marte',
          significado: 'Compaixão, completude, sabedoria',
          forca: 'Generosidade, idealismo',
          desafio: 'Impaciência, complacência',
          sefira: 'Yesod',
          arco: 'IX',
          cor: 'Roxo',
          pedra: 'Coral vermelho',
          qualidade: 'Mútavel',
          palavraChave: ['humanitarismo', 'compaixão', 'completude'],
          affirmation: 'Eu sirvo a todos com compaixão',
        },
        11: {
          numero: 11,
          nome: 'Visionário',
          planeta: 'Plutão',
          significado: 'Intuição, iluminação, ideais elevados',
          forca: 'Inspiração, sensibilidade',
          desafio: 'Ilusão, exaustão nervosa',
          sefira: 'Malkuth',
          arco: 'XI',
          cor: 'Prata lunar',
          pedra: 'Quartzo rutilado',
          qualidade: 'Cardeal',
          palavraChave: ['visão', 'intuição', 'iluminação'],
          affirmation: 'Eu sou um canal de luz e sabedoria',
        },
        22: {
          numero: 22,
          nome: 'Mestre Construtor',
          planeta: 'Terra',
          significado: 'Grandes realizações práticas',
          forca: 'Disciplina, obra-prima',
          desafio: 'Perfeccionismo, procrastinação',
          sefira: 'Daat',
          arco: 'XXII',
          cor: 'Cristal',
          pedra: 'Moldavita',
          qualidade: 'Fixo',
          palavraChave: ['construção', 'obra-prima', 'pragmatismo'],
          affirmation: 'Eu construo obras que servem à humanidade',
        },
        33: {
          numero: 33,
          nome: 'Mestre Servidor',
          planeta: 'Cosmos',
          significado: 'Ensino, cura, sacrifício divino',
          forca: 'Devoção, unconditional love',
          desafio: 'Martírio, burnout',
          sefira: 'Kether',
          arco: 'XXXIII',
          cor: 'Branco',
          pedra: 'Selenita',
          qualidade: 'Cardeal',
          palavraChave: ['ensino', 'cura', 'serviço'],
          affirmation: 'Eu sirvo com amor incondicional',
        },
      },
      H = [
        '',
        'Kether',
        'Chokmah',
        'Binah',
        'Chesed',
        'Geburah',
        'Tiphereth',
        'Netzach',
        'Hod',
        'Yesod',
        'Malkuth',
      ],
      L = {
        1: {
          nome: 'Início e Liderança',
          descricao: 'Momento de plantar novas sementes.',
          oraculo: 'O-sol',
          cor: '#D97706',
          elemento: 'Fogo',
        },
        2: {
          nome: 'Parceria e Diplomacia',
          descricao: 'Período de cooperação e união.',
          oraculo: 'A-Sacerdotisa',
          cor: '#6366F1',
          elemento: 'Água',
        },
        3: {
          nome: 'Expressão e Criatividade',
          descricao: 'Tempo de expansão criativa.',
          oraculo: 'A-Imperatriz',
          cor: '#EC4899',
          elemento: 'Água',
        },
        4: {
          nome: 'Estrutura e Disciplina',
          descricao: 'Período de construção sólida.',
          oraculo: 'O-Imperador',
          cor: '#0EA5E9',
          elemento: 'Terra',
        },
        5: {
          nome: 'Mudança e Liberdade',
          descricao: 'Tempo de transformação e aventura.',
          oraculo: 'O-Papa',
          cor: '#8B5CF6',
          elemento: 'Ar',
        },
        6: {
          nome: 'Harmonia e Responsabilidade',
          descricao: 'Período focado em lar e família.',
          oraculo: 'Os-Enamorados',
          cor: '#22C55E',
          elemento: 'Ar',
        },
        7: {
          nome: 'Reflexão e Sabedoria',
          descricao: 'Tempo de introspecção e espiritualidade.',
          oraculo: 'O-Carros',
          cor: '#EF4444',
          elemento: 'Fogo',
        },
        8: {
          nome: 'Poder e Abundância',
          descricao: 'Período de poder pessoal e realizações.',
          oraculo: 'A-Justiça',
          cor: '#F59E0B',
          elemento: 'Terra',
        },
        9: {
          nome: 'Completude e Transição',
          descricao: 'Tempo de encerramento de ciclos.',
          oraculo: 'O-Eremita',
          cor: '#A855F7',
          elemento: 'Terra',
        },
      };
    function B(e) {
      return H[{ 11: 2, 22: 4, 33: 6 }[e] ?? e] ?? '';
    }
    function G(e) {
      let a = (e + new Date().getFullYear().toString()).replace(/\D/g, ''),
        o = 0;
      for (let e of a) o += parseInt(e);
      for (; o > 9 && 11 !== o && 22 !== o && 33 !== o; )
        o = o
          .toString()
          .split('')
          .reduce((e, a) => e + parseInt(a), 0);
      return { numero: o, sefirot: B(o), descricao: L[o] ?? null };
    }
    let K = {
      keter: {
        name: 'Keter (Coroa)',
        divineName: 'Ein Sof',
        angelicOrder: 'Chayot HaKodesh',
        color: 'Branco Dourado',
        quality: 'Vontade Divina',
        essence: 'A coroa suprema, o primeiro impulso da vontade divina de se revelar.',
        path: 'Coroa – ponto de origem antes da forma.',
        letter: 'א (Alef)',
        element: 'Primordial',
      },
      chokhmah: {
        name: 'Chokhmah (Sabedoria)',
        divineName: 'Yah',
        angelicOrder: 'Ofanim',
        color: 'Cinza Azulado',
        quality: 'Impulso Criativo',
        essence: 'A centelha da criação, o primeiro pensamento que rompe o vazio.',
        path: 'Sabedoria – movimento dinâmico da primeira ideia.',
        letter: 'ב (Bet)',
        element: 'Fogo Primordial',
      },
      binah: {
        name: 'Binah (Compreensão)',
        divineName: 'YHWH',
        angelicOrder: 'Aralot',
        color: 'Preto',
        quality: 'Formação Estruturante',
        essence: 'O recipiente que dá forma e limite ao impulso criativo.',
        path: 'Compreensão – receptividade que transforma ideia em estrutura.',
        letter: 'ג (Gimel)',
        element: 'Águas Superiores',
      },
      chesed: {
        name: 'Chesed (Misericórdia)',
        divineName: 'El',
        angelicOrder: 'Chasmalim',
        color: 'Branco Puro',
        quality: 'Expansão Generosa',
        essence: 'O fluxo ilimitado da graça divina, bondade sem medida.',
        path: 'Misericórdia – o braço que se estende para dar.',
        letter: 'ד (Dalet)',
        element: 'Água',
      },
      gevurah: {
        name: 'Gevurah (Força/Julgamento)',
        divineName: 'Elohim',
        angelicOrder: 'Seraphim',
        color: 'Vermelho',
        quality: 'Contenção e Limite',
        essence: 'O poder que restringe, julga e estabelece a lei.',
        path: 'Força – o braço que se fecha para proteger.',
        letter: 'ה (He)',
        element: 'Fogo',
      },
      tiferet: {
        name: 'Tiferet (Beleza/Harmonia)',
        divineName: 'Adonai',
        angelicOrder: 'Malakhim',
        color: 'Amarelo-Dourado',
        quality: 'Equilíbrio e Mediação',
        essence: 'O eixo central que harmoniza misericórdia e julgamento.',
        path: 'Beleza – o ponto onde todos os opostos se encontram.',
        letter: 'ו (Vav)',
        element: 'Ar',
      },
      netzach: {
        name: 'Netzach (Vitória/Eternidade)',
        divineName: 'Tzevaot',
        angelicOrder: 'Serafim',
        color: 'Verde-Esmeralda',
        quality: 'Persistência e Ardência',
        essence: 'A chama que não se extingue, a perseverança do espírito.',
        path: 'Vitória – o impulso que vence o tempo.',
        letter: 'ז (Zayin)',
        element: 'Fogo',
      },
      hod: {
        name: 'Hod (Glória/Submissão)',
        divineName: 'Elohim Tzevaot',
        angelicOrder: 'Hashmallim',
        color: 'Laranja-Amarelado',
        quality: 'Humildade e Confiança',
        essence: 'O reconhecimento da grandeza divina na própria limitação.',
        path: 'Glória – a luz que irradia da rendição.',
        letter: 'ח (Chet)',
        element: 'Éter',
      },
      yesod: {
        name: 'Yesod (Fundação)',
        divineName: 'El Chai',
        angelicOrder: 'Cherubim',
        color: 'Violeta',
        quality: 'Conexão e Transmissão',
        essence: 'O canal através do qual a energia divina flui para o mundo.',
        path: 'Fundação – o pilar que sustenta toda a estrutura.',
        letter: 'ט (Tet)',
        element: 'Terra',
      },
      malkhut: {
        name: 'Malkhut (Reino)',
        divineName: 'Adonai HaAretz',
        angelicOrder: 'Issim',
        color: 'Preto com Reflexos',
        quality: 'Manifestação e Presença',
        essence: 'O ponto onde o divino se torna visível e tangível no mundo material.',
        path: 'Reino – o espelho que reflete a vontade celestial.',
        letter: 'י (Yud)',
        element: 'Terra/Metal',
      },
    };
    e.s(
      [
        'NUMEROLOGY_ODU_CORRELATIONS',
        0,
        [
          {
            numeroReduzido: 1,
            equivalenteTantrica: 'Corpo da Alma (Essência Interna)',
            equivalenteCabalistica: 'O Iniciador / O Líder',
            oduNascimento: 'Okaran (1)',
            oduId: 'okaran',
            tarotCorrelation: 'O Mago / O Louco',
            vetorAlinhamento: 'Kether para Chokmah (Impulso Puro)',
            sephirahFrom: 'Kether',
            sephirahTo: 'Chokmah',
          },
          {
            numeroReduzido: 2,
            equivalenteTantrica: 'Mente Negativa (Proteção/Alerta)',
            equivalenteCabalistica: 'O Diplomata / O Par',
            oduNascimento: 'Ejiokô (2)',
            oduId: 'ejioko',
            tarotCorrelation: 'A Sacerdotisa',
            vetorAlinhamento: 'Chokmah para Binah (A Forma/Polaridade)',
            sephirahFrom: 'Chokmah',
            sephirahTo: 'Binah',
          },
          {
            numeroReduzido: 3,
            equivalenteTantrica: 'Mente Positiva (Ação/Expansão)',
            equivalenteCabalistica: 'O Comunicador / Criador',
            oduNascimento: 'Etaogundá (3)',
            oduId: 'etaogunda',
            tarotCorrelation: 'A Imperatriz',
            vetorAlinhamento: 'Binah para Chesed (Expansão da Matriz)',
            sephirahFrom: 'Binah',
            sephirahTo: 'Chesed',
          },
          {
            numeroReduzido: 4,
            equivalenteTantrica: 'Mente Negativa (Equilíbrio/Julgamento)',
            equivalenteCabalistica: 'O Construtor / Estrutura',
            oduNascimento: 'Irosun (4)',
            oduId: 'irosun',
            tarotCorrelation: 'O Imperador',
            vetorAlinhamento: 'Chesed para Geburah (Equilíbrio da Lei)',
            sephirahFrom: 'Chesed',
            sephirahTo: 'Geburah',
          },
          {
            numeroReduzido: 5,
            equivalenteTantrica: 'Corpo Físico (Ação no Mundo)',
            equivalenteCabalistica: 'O Viajante / Alquimista',
            oduNascimento: 'Oxé (5)',
            oduId: 'oxe',
            tarotCorrelation: 'O Hierofante',
            vetorAlinhamento: 'Geburah para Tiphereth (O Homem no Centro)',
            sephirahFrom: 'Geburah',
            sephirahTo: 'Tiphereth',
          },
          {
            numeroReduzido: 6,
            equivalenteTantrica: 'Corpo do Arco (Linha de Luz/Foco)',
            equivalenteCabalistica: 'O Conciliador / Família',
            oduNascimento: 'Obará (6)',
            oduId: 'obara',
            tarotCorrelation: 'Os Enamorados',
            vetorAlinhamento: 'Tiphereth para Netzach (Vitória da Vontade)',
            sephirahFrom: 'Tiphereth',
            sephirahTo: 'Netzach',
          },
          {
            numeroReduzido: 7,
            equivalenteTantrica: 'Campo Auricular (Proteção/Magnetismo)',
            equivalenteCabalistica: 'O Filósofo / O Ocultista',
            oduNascimento: 'Odi (7)',
            oduId: 'odi',
            tarotCorrelation: 'O Carro',
            vetorAlinhamento: 'Tiphereth para Hod (Intelecto e Magia)',
            sephirahFrom: 'Tiphereth',
            sephirahTo: 'Hod',
          },
          {
            numeroReduzido: 8,
            equivalenteTantrica: 'Corpo Prânico (Respiração/Energia vital)',
            equivalenteCabalistica: 'O Executivo / Justiça Karma',
            oduNascimento: 'EjiOníle (8)',
            oduId: 'ejionile',
            tarotCorrelation: 'A Justiça / A Força',
            vetorAlinhamento: 'Hod para Yesod (Condensação da Força)',
            sephirahFrom: 'Hod',
            sephirahTo: 'Yesod',
          },
          {
            numeroReduzido: 9,
            equivalenteTantrica: 'Corpo Sutil (Percepção além da matéria)',
            equivalenteCabalistica: 'O Sábio / O Integrador',
            oduNascimento: 'Ossá (9)',
            oduId: 'ossa',
            tarotCorrelation: 'O Eremita',
            vetorAlinhamento: 'Yesod para Malkuth (Manifestação Oculta)',
            sephirahFrom: 'Yesod',
            sephirahTo: 'Malkuth',
          },
          {
            numeroReduzido: 10,
            equivalenteTantrica: 'Corpo Radiante (Brilho e Coragem Real)',
            equivalenteCabalistica: 'O Renovador / Mudança',
            oduNascimento: 'Ofun (10)',
            oduId: 'ofun',
            tarotCorrelation: 'A Roda da Fortuna',
            vetorAlinhamento: 'Malkuth (Retorno ao Eixo Central)',
            sephirahFrom: 'Malkuth',
            sephirahTo: 'Malkuth',
          },
          {
            numeroReduzido: 11,
            equivalenteTantrica: 'Incorporação Divina / Mestre de Si',
            equivalenteCabalistica: 'O Canalizador / Desperto',
            oduNascimento: 'Alafia (16)',
            oduId: 'alafia',
            tarotCorrelation: 'A Força / O Pendurado',
            vetorAlinhamento: 'O Alinhamento Completo do Pilar Central',
            sephirahFrom: 'Kether',
            sephirahTo: 'Malkuth',
          },
        ],
        'buildKabalisticMap',
        0,
        function (e, o) {
          let u = n(o),
            h = (function (e) {
              let a = e.match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (!a) return { number: 0, master: !1 };
              let [, o, n, t] = a,
                s = i(parseInt(o, 10)),
                d = i(parseInt(n, 10)),
                l = i(parseInt(t, 10)),
                c = i(s + d + l);
              return { number: c, master: r(c) };
            })(o),
            g = t(e),
            O = s(e),
            A = d(e),
            q = u.number,
            T = g.number;
          return {
            lifePath: q,
            lifePathMaster: u.master,
            mission: h.number,
            expression: T,
            expressionMaster: g.master,
            motivation: O.number,
            impression: A.number,
            nativeDayNumber: l(o),
            challenges: c(o),
            pinnacles: f(o, q),
            karmicLessons: m(e),
            karmicDebts: p(e, o),
            rulingArcana: v(q, T),
            lifeCycles: C(o),
            personalCycles: b(o),
            vibrationalNumber: T,
            chaliceNumber: O.number,
            balanceNumber: (function (e) {
              let o = I(e),
                r = [];
              for (let e = 0; e < o.length; e++) {
                let i = a[o[e]];
                void 0 !== i && r.push(i);
              }
              return i(r.reduce((e, a) => e + a, 0));
            })(e),
            maturityNumber: i(q + T),
            hiddenPassionNumber: (function (e) {
              let o = I(e),
                i = {};
              for (let e of o) {
                let o = a[e];
                void 0 !== o && (i[o] = (i[o] ?? 0) + 1);
              }
              let r = 0,
                n = 1;
              for (let [e, a] of Object.entries(i)) a > r && ((r = a), (n = parseInt(e, 10)));
              return n;
            })(e),
            destinyNumber: T,
            soulUrgeNumber: O.number,
            personalityNumber: A.number,
            hebrewLetter: E[q] ?? E[i(q, !1)] ?? 'Aleph',
            sefirotPath: M[q] ?? M[i(q, !1)] ?? 'Keter (Coroa)',
            personalYear: b(o).personalYear,
            personalMonth: b(o).personalMonth,
            personalDay: b(o).personalDay,
            minorCycles: { years: [], months: [], days: [] },
            nameHistory: [
              { name: e, meaning: `N\xfamero de express\xe3o ${T}`, source: 'fornecido' },
            ],
          };
        },
        'calcularAnoPessoal',
        0,
        G,
        'calcularCabalistica',
        0,
        R,
        'calcularCaldeia',
        0,
        F,
        'calcularCaminhoVida',
        0,
        function (e) {
          let [a, o, i] = e.split('/');
          for (var r = Number(a) + Number(o) + Number(i); r > 9 && ![11, 22, 33].includes(r); )
            r = String(r)
              .split('')
              .reduce((e, a) => e + Number(a), 0);
          return r;
        },
        'calcularPitagorica',
        0,
        P,
        'calcularPitagoricaData',
        0,
        D,
        'calcularTantrica',
        0,
        x,
        'calculateChallenges',
        0,
        c,
        'calculateExpression',
        0,
        t,
        'calculateImpression',
        0,
        d,
        'calculateKarmicDebts',
        0,
        p,
        'calculateKarmicLessons',
        0,
        m,
        'calculateLifeCycles',
        0,
        C,
        'calculateLifePath',
        0,
        n,
        'calculateMotivation',
        0,
        s,
        'calculateNativeDayGifts',
        0,
        l,
        'calculateNumerology',
        0,
        function (e, a) {
          let o = P(e),
            i = F(e),
            r = R(e),
            l = x(a),
            c = D(a);
          return {
            name: e,
            date: a,
            pitagorica: { numero: o, tipo: 'pitagorica', interpretacao: k(o) },
            caldeia: { numero: i, tipo: 'caldeia', interpretacao: k(i) },
            cabalistica: { numero: r, tipo: 'cabalistica', interpretacao: k(r) },
            tantrica: { numero: l, tipo: 'tantrica', interpretacao: k(l) },
            destino: { numero: c, tipo: 'destino', interpretacao: k(c) },
            vida: n(a).number,
            expressao: t(e).number,
            motivacao: s(e).number,
            impressao: d(e).number,
          };
        },
        'calculatePersonalCycles',
        0,
        b,
        'calculatePinnacles',
        0,
        f,
        'calculateRulingArcana',
        0,
        v,
        'getCiclosTemporais',
        0,
        function (e) {
          let a = G(e),
            o = (function (e) {
              let a = e + (new Date().getMonth() + 1);
              for (; a > 9 && 11 !== a && 22 !== a && 33 !== a; )
                a = a
                  .toString()
                  .split('')
                  .reduce((e, a) => e + parseInt(a), 0);
              return { numero: a, sefirot: B(a), descricao: L[a] ?? null };
            })(a.numero),
            i = (function (e) {
              let a = new Date(),
                o = a.getDate(),
                i = e + (a.getMonth() + 1) + o;
              for (; i > 9 && 11 !== i && 22 !== i && 33 !== i; )
                i = i
                  .toString()
                  .split('')
                  .reduce((e, a) => e + parseInt(a), 0);
              return { numero: i, sefirot: B(i), descricao: L[i] ?? null };
            })(a.numero);
          return {
            anoPessoal: a.numero,
            mesPessoal: o.numero,
            diaPessoal: i.numero,
            sefirotAno: a.sefirot,
            sefirotMes: o.sefirot,
            sefirotDia: i.sefirot,
            descricao: { ano: a.descricao, mes: o.descricao, dia: i.descricao },
          };
        },
        'getCoreNumbers',
        0,
        function () {
          return [1, 2, 3, 4, 5, 6, 7, 8, 9];
        },
        'getInterpretacao',
        0,
        k,
        'getMasterNumbers',
        0,
        function () {
          return [11, 22, 33];
        },
        'getMeaning',
        0,
        function (e) {
          return V[e];
        },
        'getNumberMeanings',
        0,
        function () {
          return V;
        },
        'getSefirotMeanings',
        0,
        function () {
          return K;
        },
        'isMasterNumber',
        0,
        function (e) {
          return q.includes(e);
        },
        'numerologyMethods',
        0,
        {
          pitagorica: (e) => ({ numero: P(e), interpretacao: k(P(e)) }),
          caldeia: (e) => ({ numero: F(e), interpretacao: k(F(e)) }),
          cabalistica: (e) => ({ numero: R(e), interpretacao: k(R(e)) }),
          tantrica: (e) => ({ numero: x(e), interpretacao: k(x(e)) }),
          destino: (e) => ({ numero: D(e), interpretacao: k(D(e)) }),
          vida: (e) => n(e).number,
          expressao: (e) => t(e).number,
          motivacao: (e) => s(e).number,
          impressao: (e) => d(e).number,
        },
        'somarDigitos',
        0,
        S,
        'tabelaCabalistica',
        0,
        N,
        'tabelaCaldeia',
        0,
        z,
        'tabelaPitagorica',
        0,
        T,
      ],
      77634
    );
  },
]);
