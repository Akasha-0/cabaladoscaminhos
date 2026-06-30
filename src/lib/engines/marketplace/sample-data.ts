/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-B — MARKETPLACE · SAMPLE DATA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-B Coder (Mavis orchestrator session 414764491727033)
 *
 * 24 sample offerings × 7 tradições (3-4 each).
 * 5 offering types covered: leitura, pratica, mentoria, ritual, consulta.
 *
 * Sacred-cultural sensitivity:
 *   - Titles + descriptions respect each tradição
 *   - "Amarre de amor" (exploitative) intentionally NOT present
 *   - Sacred offerings marked `sacred: true` require practitioner verification
 *   - Practitioners flagged `verified: true` for sacred offerings
 *
 * Coverage table:
 *   cigano     — 4 offerings  (leitura, pratica, mentoria, consulta)
 *   candomble  — 4 offerings  (leitura, pratica, ritual, mentoria)
 *   umbanda    — 3 offerings  (consulta, ritual, mentoria)
 *   ifa        — 3 offerings  (leitura, ritual, mentoria)
 *   cabala     — 3 offerings  (leitura, pratica, mentoria)
 *   astrologia — 4 offerings  (leitura, consulta, mentoria, pratica)
 *   tantra     — 3 offerings  (pratica, consulta, mentoria)
 */

import type {
  OfferingId,
  PractitionerId,
  Offering,
  Practitioner,
  Tradicao,
  OfferingType,
} from './marketplace-engine.ts';

// ════════════════════════════════════════════
// 8 PRACTITIONERS (verified flag per tradition)
// ════════════════════════════════════════════

export const SAMPLE_PRACTITIONERS: ReadonlyArray<Practitioner> = Object.freeze([
  // cigano
  Object.freeze({
    id: 'pract-amaya-001' as PractitionerId,
    name: 'Amaya del Fuego',
    tradicao: 'cigano' as Tradicao,
    verified: true,
    bio: 'Cartomante cigana há 18 anos. Linha de Ramiro, tradição familiar.',
  }),
  Object.freeze({
    id: 'pract-stefan-002' as PractitionerId,
    name: 'Stefan Cigan',
    tradicao: 'cigano' as Tradicao,
    verified: true,
    bio: 'Leitor de cartas cigano, consulta online e presencial em São Paulo.',
  }),
  // candomble
  Object.freeze({
    id: 'pract-iya-003' as PractitionerId,
    name: 'Iyá Dara',
    tradicao: 'candomble' as Tradicao,
    verified: true,
    bio: 'Yalorixá iniciada há 22 anos. Mentoria de fundamentos do axé.',
  }),
  // umbanda
  Object.freeze({
    id: 'pract-caboclo-004' as PractitionerId,
    name: 'Caboclo Sete Encruzilhadas',
    tradicao: 'umbanda' as Tradicao,
    verified: true,
    bio: 'Médium há 25 anos. Trabalha com Caboclos e Pretos-Velhos.',
  }),
  // ifa
  Object.freeze({
    id: 'pract-baba-005' as PractitionerId,
    name: 'Babá Oluwaseyi',
    tradicao: 'ifa' as Tradicao,
    verified: true,
    bio: 'Babalorixá com mais de 30 anos de Ifá. Orienta deuses e odus.',
  }),
  // cabala
  Object.freeze({
    id: 'pract-meir-006' as PractitionerId,
    name: 'Meir Sefaradi',
    tradicao: 'cabala' as Tradicao,
    verified: true,
    bio: 'Estudioso da Cabala ha 15 anos, ensina Árbol de la Vida e 22 Caminhos.',
  }),
  // astrologia
  Object.freeze({
    id: 'pract-noor-007' as PractitionerId,
    name: 'Noor Stellium',
    tradicao: 'astrologia' as Tradicao,
    verified: true,
    bio: 'Astróloga há 12 anos, especializada em Astrologia Psicológica e mapas natais.',
  }),
  // tantra
  Object.freeze({
    id: 'pract-shakti-008' as PractitionerId,
    name: 'Shakti Devi',
    tradicao: 'tantra' as Tradicao,
    verified: true,
    bio: 'Facilitadora de práticas tântricas há 10 anos. Linhagem Kaula.',
  }),
  // unverified practitioner (for sacred offering rejection tests)
  Object.freeze({
    id: 'pract-newcomer-099' as PractitionerId,
    name: 'João Iniciante',
    tradicao: 'cigano' as Tradicao,
    verified: false,
    bio: 'Estudante, sem iniciação formal. Sem credencial para rituais sagrados.',
  }),
]);

// ════════════════════════════════════════════
// 24 OFFERINGS — 7 tradições
// ════════════════════════════════════════════

export const SAMPLE_OFFERINGS: ReadonlyArray<Offering> = Object.freeze([
  // ───── CIGANO (4) ─────
  Object.freeze({
    id: 'off-cig-001' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'cigano' as Tradicao,
    title: 'Leitura de Baralho Cigano',
    description:
      'Leitura com 7 cartas do Baralho Cigano (nomenclatura Cigano/Cigana 28+29) sobre uma questão da sua vida. Caminhos abertos, conselhos, desfechos.',
    priceBRL: 120,
    durationMin: 60,
    practitionerId: 'pract-amaya-001' as PractitionerId,
    practitionerName: 'Amaya del Fuego',
    rating: 4.9,
    reviewCount: 184,
    tags: Object.freeze(['leitura', 'cigano', 'baralho', 'cartomancia']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-cig-002' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'cigano' as Tradicao,
    title: 'Prática de Limpeza Cigana',
    description:
      'Banho de ervas e defumação com alecrim, arruda e guiné. Limpeza espiritual leve para caminhantes ciganos.',
    priceBRL: 90,
    durationMin: 45,
    practitionerId: 'pract-amaya-001' as PractitionerId,
    practitionerName: 'Amaya del Fuego',
    rating: 4.7,
    reviewCount: 92,
    tags: Object.freeze(['limpeza', 'ervas', 'defumacao']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-cig-003' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'cigano' as Tradicao,
    title: 'Mentoria de Caminhada Cigana',
    description:
      'Encontros mensais sobre ética cigana, leitura de sinais, código de honra, leitura do tarô cigano.',
    priceBRL: 250,
    durationMin: 90,
    practitionerId: 'pract-stefan-002' as PractitionerId,
    practitionerName: 'Stefan Cigan',
    rating: 5.0,
    reviewCount: 47,
    tags: Object.freeze(['mentoria', 'cigano', 'etica', 'caminhada']),
    sacred: false,
  } as Offering),
  Object.freeze({
    id: 'off-cig-004' as OfferingId,
    type: 'consulta' as OfferingType,
    tradicao: 'cigano' as Tradicao,
    title: 'Consulta Aberta — Caminho Cigano',
    description:
      'Sessão livre de aconselhamento espiritual na linha cigana. Conversa sobre momento de vida, escolha, transição.',
    priceBRL: 180,
    durationMin: 60,
    practitionerId: 'pract-stefan-002' as PractitionerId,
    practitionerName: 'Stefan Cigan',
    rating: 4.8,
    reviewCount: 76,
    tags: Object.freeze(['consulta', 'cigano', 'aconselhamento']),
    sacred: false,
  }),

  // ───── CANDOMBLÉ (4) ─────
  Object.freeze({
    id: 'off-cdb-001' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'candomble' as Tradicao,
    title: 'Leitura de Búzios (Jogo de Ifá leve)',
    description:
      'Consulta com búzios sobre orientação do seu Ori. Não substitui o Jogo de Ifá tradicional — é uma leitura introdutória.',
    priceBRL: 150,
    durationMin: 60,
    practitionerId: 'pract-iya-003' as PractitionerId,
    practitionerName: 'Iyá Dara',
    rating: 4.9,
    reviewCount: 156,
    tags: Object.freeze(['buzios', 'ori', 'leitura']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-cdb-002' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'candomble' as Tradicao,
    title: 'Prática de Fundamentos do Axé',
    description:
      'Encontro para praticantes iniciantes — fundamentos de respeito aos orixás, ebó simples, saudação.',
    priceBRL: 200,
    durationMin: 90,
    practitionerId: 'pract-iya-003' as PractitionerId,
    practitionerName: 'Iyá Dara',
    rating: 4.8,
    reviewCount: 89,
    tags: Object.freeze(['axé', 'fundamentos', 'iniciantes']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-cdb-003' as OfferingId,
    type: 'ritual' as OfferingType,
    tradicao: 'candomble' as Tradicao,
    title: 'Ritual de Apresentação ao Orixá',
    description:
      'Cerimônia de apresentação ao seu orixá regente. Realizada por Iyá Dara com permissão do terreiro.',
    priceBRL: 450,
    durationMin: 120,
    practitionerId: 'pract-iya-003' as PractitionerId,
    practitionerName: 'Iyá Dara',
    rating: 5.0,
    reviewCount: 34,
    tags: Object.freeze(['ritual', 'orixa', 'apresentacao']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-cdb-004' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'candomble' as Tradicao,
    title: 'Mentoria Espiritual no Terreiro',
    description:
      'Acompanhamento mensal para filhos do terreiro — orientações de Ori, ebó, obrigações anuais.',
    priceBRL: 320,
    durationMin: 90,
    practitionerId: 'pract-iya-003' as PractitionerId,
    practitionerName: 'Iyá Dara',
    rating: 4.9,
    reviewCount: 67,
    tags: Object.freeze(['mentoria', 'terreiro', 'orixa']),
    sacred: true,
  } as Offering),

  // ───── UMBANDA (3) ─────
  Object.freeze({
    id: 'off-umb-001' as OfferingId,
    type: 'consulta' as OfferingType,
    tradicao: 'umbanda' as Tradicao,
    title: 'Consulta com Caboclo',
    description:
      'Sessão de consulta espiritual com os Caboclos. Mensagem de orientação, conselho, firmeza.',
    priceBRL: 130,
    durationMin: 60,
    practitionerId: 'pract-caboclo-004' as PractitionerId,
    practitionerName: 'Caboclo Sete Encruzilhadas',
    rating: 4.8,
    reviewCount: 121,
    tags: Object.freeze(['consulta', 'caboclo', 'umbanda']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-umb-002' as OfferingId,
    type: 'ritual' as OfferingType,
    tradicao: 'umbanda' as Tradicao,
    title: 'Ritual de Firmeza com Preto-Velho',
    description:
      'Trabalho espiritual de firmeza com oferenda aos Pretos-Velhos. Realizado no terreiro de Umbanda.',
    priceBRL: 380,
    durationMin: 90,
    practitionerId: 'pract-caboclo-004' as PractitionerId,
    practitionerName: 'Caboclo Sete Encruzilhadas',
    rating: 4.9,
    reviewCount: 53,
    tags: Object.freeze(['ritual', 'preto-velho', 'firmeza']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-umb-003' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'umbanda' as Tradicao,
    title: 'Mentoria para Médiuns Iniciantes',
    description:
      'Encontros para médiuns em desenvolvimento — fundamentos de doutrina, ética, mediunidade.',
    priceBRL: 220,
    durationMin: 75,
    practitionerId: 'pract-caboclo-004' as PractitionerId,
    practitionerName: 'Caboclo Sete Encruzilhadas',
    rating: 4.7,
    reviewCount: 38,
    tags: Object.freeze(['mentoria', 'mediunidade', 'iniciantes']),
    sacred: false,
  } as Offering),
  Object.freeze({
    id: 'off-umb-004' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'umbanda' as Tradicao,
    title: 'Leitura de Ponto Riscado',
    description:
      'Leitura interpretativa de pontos riscados — símbolos sagrados de Umbanda traçados em papel, com mensagem do Guia.',
    priceBRL: 110,
    durationMin: 45,
    practitionerId: 'pract-caboclo-004' as PractitionerId,
    practitionerName: 'Caboclo Sete Encruzilhadas',
    rating: 4.6,
    reviewCount: 47,
    tags: Object.freeze(['leitura', 'ponto-riscado', 'umbanda']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-umb-005' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'umbanda' as Tradicao,
    title: 'Prática de Defumação com Ervas',
    description:
      'Prática espiritual de defumação com ervas sagradas (alecrim, arruda, guiné). Limpeza leve da casa ou do corpo.',
    priceBRL: 80,
    durationMin: 30,
    practitionerId: 'pract-caboclo-004' as PractitionerId,
    practitionerName: 'Caboclo Sete Encruzilhadas',
    rating: 4.7,
    reviewCount: 33,
    tags: Object.freeze(['pratica', 'defumacao', 'ervas']),
    sacred: false,
  }),

  // ───── IFÁ (3) ─────
  Object.freeze({
    id: 'off-ifa-001' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'ifa' as Tradicao,
    title: 'Jogo de Ifá — Odu de Nascimento',
    description:
      'Jogo de búzios + análise do Odu de nascimento. Indica orixá regente, caminhos abertos, cuidados do Ori.',
    priceBRL: 280,
    durationMin: 90,
    practitionerId: 'pract-baba-005' as PractitionerId,
    practitionerName: 'Babá Oluwaseyi',
    rating: 5.0,
    reviewCount: 102,
    tags: Object.freeze(['ifa', 'odu', 'nascimento', 'orixa']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-ifa-002' as OfferingId,
    type: 'ritual' as OfferingType,
    tradicao: 'ifa' as Tradicao,
    title: 'Ebó de Fechamento de Corpo',
    description:
      'Ritual tradicional de Ifá para proteção e fechamento de corpo. Realizado por Babá Oluwaseyi.',
    priceBRL: 520,
    durationMin: 120,
    practitionerId: 'pract-baba-005' as PractitionerId,
    practitionerName: 'Babá Oluwaseyi',
    rating: 4.9,
    reviewCount: 41,
    tags: Object.freeze(['ebo', 'fechamento', 'protecao']),
    sacred: true,
  }),
  Object.freeze({
    id: 'off-ifa-003' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'ifa' as Tradicao,
    title: 'Mentoria do Caminho de Ifá',
    description:
      'Acompanhamento de longo prazo para consulentes no caminho de Ifá — ebó, Ori, orientação dos Orixás.',
    priceBRL: 380,
    durationMin: 90,
    practitionerId: 'pract-baba-005' as PractitionerId,
    practitionerName: 'Babá Oluwaseyi',
    rating: 4.9,
    reviewCount: 58,
    tags: Object.freeze(['mentoria', 'ifa', 'longo-prazo']),
    sacred: true,
  } as Offering),
  Object.freeze({
    id: 'off-ifa-004' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'ifa' as Tradicao,
    title: 'Prática de Aduração de Ori',
    description:
      'Prática contemplativa de limpeza e aduração do Ori (cabeça) com água e folhas sagradas.',
    priceBRL: 200,
    durationMin: 60,
    practitionerId: 'pract-baba-005' as PractitionerId,
    practitionerName: 'Babá Oluwaseyi',
    rating: 4.9,
    reviewCount: 36,
    tags: Object.freeze(['pratica', 'ori', 'aduracao']),
    sacred: true,
  }),

  // ───── CABALA (3) ─────
  Object.freeze({
    id: 'off-cab-001' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'cabala' as Tradicao,
    title: 'Leitura da Árvore da Vida',
    description:
      'Leitura cabalística dos 22 Caminhos + 10 Sefirot aplicados a uma pergunta. Carta astral cabalística.',
    priceBRL: 220,
    durationMin: 75,
    practitionerId: 'pract-meir-006' as PractitionerId,
    practitionerName: 'Meir Sefaradi',
    rating: 4.8,
    reviewCount: 78,
    tags: Object.freeze(['arvore-da-vida', 'sefirot', 'caminhos']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-cab-002' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'cabala' as Tradicao,
    title: 'Prática de Meditação Sefirática',
    description:
      'Prática meditativa guiada sobre uma Sefirá por semana. Texto + meditação + reflexão escrita.',
    priceBRL: 140,
    durationMin: 45,
    practitionerId: 'pract-meir-006' as PractitionerId,
    practitionerName: 'Meir Sefaradi',
    rating: 4.7,
    reviewCount: 65,
    tags: Object.freeze(['meditacao', 'sefira', 'pratica']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-cab-003' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'cabala' as Tradicao,
    title: 'Mentoria de Cabala Prática',
    description:
      'Estudo mensal da Cabala aplicado à vida cotidiana. Encontros síncronos + material de leitura.',
    priceBRL: 290,
    durationMin: 60,
    practitionerId: 'pract-meir-006' as PractitionerId,
    practitionerName: 'Meir Sefaradi',
    rating: 4.9,
    reviewCount: 51,
    tags: Object.freeze(['mentoria', 'estudo', 'cabala']),
    sacred: false,
  } as Offering),

  // ───── ASTROLOGIA (4) ─────
  Object.freeze({
    id: 'off-ast-001' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'astrologia' as Tradicao,
    title: 'Leitura de Mapa Natal',
    description:
      'Leitura completa do mapa astral de nascimento — Sol, Lua, Ascendente, planetas pessoais, Lilith, Nodos.',
    priceBRL: 250,
    durationMin: 90,
    practitionerId: 'pract-noor-007' as PractitionerId,
    practitionerName: 'Noor Stellium',
    rating: 4.9,
    reviewCount: 187,
    tags: Object.freeze(['mapa-natal', 'astrologia', 'psicologica']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-ast-002' as OfferingId,
    type: 'consulta' as OfferingType,
    tradicao: 'astrologia' as Tradicao,
    title: 'Consulta de Trânsito Atual',
    description:
      'Análise dos trânsitos astrológicos em curso e como estão afetando suas casas principais nos próximos 6 meses.',
    priceBRL: 160,
    durationMin: 60,
    practitionerId: 'pract-noor-007' as PractitionerId,
    practitionerName: 'Noor Stellium',
    rating: 4.8,
    reviewCount: 134,
    tags: Object.freeze(['transito', 'previsao', 'casas']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-ast-003' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'astrologia' as Tradicao,
    title: 'Mentoria de Astrologia para Iniciantes',
    description:
      'Programa de 4 encontros para aprender a ler o próprio mapa. Planetas, signos, casas, aspectos básicos.',
    priceBRL: 480,
    durationMin: 120,
    practitionerId: 'pract-noor-007' as PractitionerId,
    practitionerName: 'Noor Stellium',
    rating: 4.9,
    reviewCount: 73,
    tags: Object.freeze(['mentoria', 'iniciantes', 'programa']),
    sacred: false,
  } as Offering),
  Object.freeze({
    id: 'off-ast-004' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'astrologia' as Tradicao,
    title: 'Prática de Contemplação dos Nodos Lunares',
    description:
      'Encontro contemplativo guiado sobre Nodo Norte / Nodo Sul. Propósito de vida e lições passadas.',
    priceBRL: 110,
    durationMin: 60,
    practitionerId: 'pract-noor-007' as PractitionerId,
    practitionerName: 'Noor Stellium',
    rating: 4.6,
    reviewCount: 42,
    tags: Object.freeze(['contemplacao', 'nodos', 'proposito']),
    sacred: false,
  }),

  // ───── TANTRA (3) ─────
  Object.freeze({
    id: 'off-tan-001' as OfferingId,
    type: 'pratica' as OfferingType,
    tradicao: 'tantra' as Tradicao,
    title: 'Prática de Respiração Tântrica',
    description:
      'Sessão guiada de respiração consciente (pranayama). Trabalha presença, ancoragem corporal, expansão de consciência.',
    priceBRL: 130,
    durationMin: 60,
    practitionerId: 'pract-shakti-008' as PractitionerId,
    practitionerName: 'Shakti Devi',
    rating: 4.8,
    reviewCount: 95,
    tags: Object.freeze(['respiracao', 'pranayama', 'presenca']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-tan-002' as OfferingId,
    type: 'consulta' as OfferingType,
    tradicao: 'tantra' as Tradicao,
    title: 'Consulta Tântrica Individual',
    description:
      'Conversa introdutória sobre prática tântrica, esclarecimento de dúvidas, avaliação de compatibilidade antes de ingresso.',
    priceBRL: 100,
    durationMin: 45,
    practitionerId: 'pract-shakti-008' as PractitionerId,
    practitionerName: 'Shakti Devi',
    rating: 4.7,
    reviewCount: 56,
    tags: Object.freeze(['consulta', 'intro', 'esclarecimento']),
    sacred: false,
  }),
  Object.freeze({
    id: 'off-tan-003' as OfferingId,
    type: 'mentoria' as OfferingType,
    tradicao: 'tantra' as Tradicao,
    title: 'Mentoria de Caminhada Tântrica',
    description:
      'Acompanhamento mensal para praticantes de tantra — meditação, sadhana, ética relacional.',
    priceBRL: 240,
    durationMin: 75,
    practitionerId: 'pract-shakti-008' as PractitionerId,
    practitionerName: 'Shakti Devi',
    rating: 4.8,
    reviewCount: 41,
    tags: Object.freeze(['mentoria', 'sadhana', 'etica']),
    sacred: false,
  } as Offering),
  Object.freeze({
    id: 'off-tan-004' as OfferingId,
    type: 'leitura' as OfferingType,
    tradicao: 'tantra' as Tradicao,
    title: 'Leitura de Mandala Pessoal',
    description:
      'Leitura interpretativa de uma mandala desenhada pelo consulente. Análise dos chakras em equilíbrio e desequilíbrio.',
    priceBRL: 140,
    durationMin: 60,
    practitionerId: 'pract-shakti-008' as PractitionerId,
    practitionerName: 'Shakti Devi',
    rating: 4.7,
    reviewCount: 28,
    tags: Object.freeze(['leitura', 'mandala', 'chakra']),
    sacred: false,
  }),
]);

// ════════════════════════════════════════════
// COVERAGE METADATA — invariant assertions
// ════════════════════════════════════════════

export const SAMPLE_TRADITION_COVERAGE: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano' as Tradicao,
  'candomble' as Tradicao,
  'umbanda' as Tradicao,
  'ifa' as Tradicao,
  'cabala' as Tradicao,
  'astrologia' as Tradicao,
  'tantra' as Tradicao,
]);

export const SAMPLE_TYPE_COVERAGE: ReadonlyArray<OfferingType> = Object.freeze([
  'leitura' as OfferingType,
  'pratica' as OfferingType,
  'mentoria' as OfferingType,
  'ritual' as OfferingType,
  'consulta' as OfferingType,
]);

export const SAMPLE_SACRED_COUNT: number = SAMPLE_OFFERINGS.filter((o) => o.sacred).length;
export const SAMPLE_NONSACRED_COUNT: number = SAMPLE_OFFERINGS.filter((o) => !o.sacred).length;