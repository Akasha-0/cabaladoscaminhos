/**
 * Akasha Synthesis — Motor de Síntese v2
 * R-023 F-223 F-226
 *
 * Transforma dados brutos do mapa (5 pilares) em síntese por dimensão de vida.
 * v2: usa Narrative Generator para gerar narrativas profundas e unificadas.
 */

import type { PilaresDados } from '../significados-curados';
import type { Area } from '../traducao-areas';
import { traducaoPara } from '../traducao-areas';
import {
  DIMENSOES,
  DIMENSAO_DE_AREA,
  DIMENSAO_POR_ID,
  type DimensaoId,
  type DimensaoContribuicao,
} from './dimensoes';
import type { Pilar } from '../significados-curados';
import {
  gerarNarrativaDimensao,
  gerarPerfilGeral,
} from './narrative-generator';

// ─── Tipos de Saída ────────────────────────────────────────────────────

/** Resultado da síntese para uma dimensão. */
export interface DimensaoSintese {
  readonly dimensoesId: DimensaoId;
  readonly titulo: string;
  readonly icone: string;
  readonly chakraCor: string;
  readonly bgCor: string;
  readonly borderCor: string;
  /** Descrição curta da dimensão (header visível no accordion fechado) */
  readonly descricao: string;
  /** Síntese narrativa profunda — o texto principal que o usuário lê */
  readonly synthes: string;
  /** Contribuição de cada pilar para esta dimensão */
  readonly contribuicoes: readonly DimensaoContribuicao[];
  /** Prática recomendada para esta dimensão */
  readonly praktika: string;
  /** O que evitar nesta dimensão */
  readonly alerta: string;
  /** Akasha Authority — aplicar a regra de decisão? */
  readonly autoridadeAkasha: {
    readonly tipo: 'paz' | 'ansiedade';
    readonly aplicavel: boolean;
    readonly timing?: string;
  }
}

// ─── Akasha Authority — Sistema de Decisão ─────────────────────────────────

export type EstrategiaAkasha = 'act' | 'wait' | 'observe' | 'surrender';
export type AutoridadeAkasha = 'emocional' | 'sagrada' | 'esplénica' | 'mental';

export interface AkashaAuthority {
  readonly estrategia: EstrategiaAkasha;
  readonly autoridade: AutoridadeAkasha;
  /** Explicação de porque esta estratégia funciona para esta pessoa */
  readonly explicacao: string;
  /** Regra prática: se sentir X, então faça Y */
  readonly regra: {
    readonly condicao: string;
    readonly accao: string;
  };
  /** Timing: melhor e pior momento para decidir */
  readonly timing: {
    readonly melhor: string;
    readonly pior: string;
  };
  /** Área de vida prioritária para HOJE */
  readonly areaFoco: Area;
  /** Síntese de 1-2 frases: o que fazer HOJE */
  readonly decisaoHoje: string;
}

/**
 * Derivar Akasha Authority a partir dos 5 pilares.
 * Inspirado no Strategy + Authority do Human Design.
 *
 * Lógica:
 * - Estratégia: derivada do Life Path (início vs. espera) + Lua (padrão emocional)
 * - Autoridade: derivada do Corpo Tântrico + Casa 8 (intuição corporal)
 * - Área de foco: a área com mais marcadores activos nos pilares
 */
export function deriveAkashaAuthority(pilares: Partial<PilaresDados>): AkashaAuthority {
  const lp = pilares.cabala?.life_path;
  const luaSigno = pilares.astrologia?.lua_signo;
  const casa8Signo = pilares.astrologia?.casa_8_signo;
  const corpo = pilares.tantrica?.corpo_predominante;
  const oduPrinc = pilares.odu?.odu_principal;

  // ── Derivar Estratégia ─────────────────────────────────────
  // Life Path 1,3,5 → act (iniciativa)
  // Life Path 2,4,6,7 → wait (receber/responder)
  // Life Path 8,9,11 → observe (contemplar antes de agir)
  // Life Path 22,33 → surrender (confiar no fluxo)
  let estrategia: EstrategiaAkasha = 'wait';
  let estrategiaExplicacao = '';

  if (lp !== undefined) {
    if ([1, 3, 5].includes(lp)) {
      estrategia = 'act';
      estrategiaExplicacao = `Life Path ${lp} — você é um iniciador nato. A estratégia não é esperar que as coisas aconteçam: é criar o momento. Masactue com informação, não com impulsividade.`;
    } else if ([2, 4, 6, 7].includes(lp)) {
      estrategia = 'wait';
      estrategiaExplicacao = `Life Path ${lp} — você atrai mais do que força. A vida traz as pessoas e oportunidades certas quando você está no seu centro. Espere o reconhecimento; não corra atrás.`;
    } else if ([8, 9, 11].includes(lp)) {
      estrategia = 'observe';
      estrategiaExplicacao = `Life Path ${lp} — sua visão é mais avançada do que o momento. Antes de agir, observe: o que o sistema precisa? Age quando tiver clareza, não quando tiver urgência.`;
    } else if (lp === 22 || lp === 33) {
      estrategia = 'surrender';
      estrategiaExplicacao = `Número Mestre ${lp} — seu caminho não é linear. Não force a rota; confie na abertura. O universo reorganiza melhor quando você solta.`;
    } else {
      estrategia = 'wait';
      estrategiaExplicacao = `Life Path ${lp} — você tem um ritmo próprio. Não se compare ao ritmo dos outros. Quando a oportunidade certa chegar, você vai saber.`;
    }
  }

  // Lua em água (Cancêr, Escorpião, Peixes) → tendência a reagir emocionalmente
  const luaDeAgua = luaSigno && ['Cancér', 'Escorpião', 'Peixes'].includes(luaSigno);

  // ── Derivar Autoridade ─────────────────────────────────────
  // Corpo 8 (Prana) → autoridade sagrada (corpo como guia)
  // Corpo 4 (Mente Negativa) → autoridade emocional (claridade emocional antes de agir)
  // Casa 8 presente → autoridade esplénica (intuição directa)
  // Caso contrário → autoridade mental (decisão reflectida)
  let autoridade: AutoridadeAkasha = 'mental';
  let autoridadeExplicacao = '';

  if (corpo === 8) {
    autoridade = 'sagrada';
    autoridadeExplicacao = 'O Corpo 8 (Prana) é sua autoridade — quando sente expansão no corpo, é sim. Quando sente contracção ou tensão, é não. Confie na sabedoria corporal.';
  } else if (corpo === 4) {
    autoridade = 'emocional';
    autoridadeExplicacao = 'O Corpo 4 (Mente Negativa) traz pensamento repetitivo. Antes de decidir, espere até sentir paz emocional — não clareza mental. A mente pode argumentar para os dois lados.';
  } else if (casa8Signo) {
    autoridade = 'esplénica';
    autoridadeExplicacao = `A Casa 8 em ${casa8Signo} dá-lheintuição directa. Quando sentir um "sim" no corpo — uma expansão, um calor — é a resposta. Não pense; sinta.`;
  } else {
    autoridade = 'mental';
    autoridadeExplicacao = 'Sua decisão pede reflexão antes de actão. Mas não fique em loop: defina um prazo máximo de 48h para decidir. Depois, actue mesmo sem certeza total.';
  }

  // ── Derivar Timing ────────────────────────────────────────
  const timing = {
    melhor: luaDeAgua
      ? 'quando sentir paz emocional — não urgência emocional'
      : 'quando sentir clareza e ausência de ansiedade',
    pior: luaDeAgua
      ? 'quando sentir medo ou ansiedade no estômago'
      : 'quando estiver cansado, com fome, ou emocionalmente reactivo',
  };

  // ── Derivar Área de Foco ────────────────────────────────
  // Heurística simples: área com mais marcadores é o foco do dia
  // Life Path 1,3,5 → trabalho/criatividade
  // Life Path 2,6,7 → relações/família
  // Life Path 4,8,9 → propósito/transformação
  let areaFoco: Area = 'trabalho';
  let decisaoHoje = '';

  if (lp !== undefined) {
    if ([1, 3, 5].includes(lp)) {
      areaFoco = 'trabalho';
      decisaoHoje = 'Hoje é dia de avançar no que você começou. Não espere inspiração — actue e a inspiração vem no caminho.';
    } else if ([2, 6, 7].includes(lp)) {
      areaFoco = 'relacoes';
      decisaoHoje = 'O trabalho pode esperar; a conexão não. Se há alguém que precisa de sua presença hoje, vá.';
    } else if ([4, 8, 9, 11].includes(lp)) {
      areaFoco = 'proposito';
      decisaoHoje = 'Você não precisa de mais informação — precisa de decisão. O que você sabe que deve fazer há mais de 6 meses? Hoje é o dia.';
    } else if (lp === 22 || lp === 33) {
      areaFoco = 'espiritualidade';
      decisaoHoje = 'Não force aacção. Hoje é dia de silêncio, reflexão e trustedo que está a emergir. O próximo passo vai estar mais claro amanhã.';
    } else {
      areaFoco = 'trabalho';
      decisaoHoje = 'Mantenha o ritmo. As pequenas acções consistentes superam as grandes decisões dramáticas.';
    }
  }

  return {
    estrategia,
    autoridade,
    explicacao: `${estrategiaExplicacao} ${autoridadeExplicacao}`,
    regra: {
      condicao: autoridade === 'sagrada'
        ? 'se sentir expansão no corpo ao pensar na decisão'
        : autoridade === 'emocional'
        ? 'se sentir paz emocional — não só vontade de fazer'
        : autoridade === 'esplénica'
        ? 'se sentir um "sim" intuitivo, não um "talvez" mental'
        : 'se tiver reflexão clara e ausência de ansiedade',
      accao: estrategia === 'act'
        ? 'actue nos próximos 30 minutos antes que a mente intervenha'
        : estrategia === 'wait'
        ? 'aguarde até sentir reconhecimento externo ou paz interior'
        : estrategia === 'observe'
        ? 'observe mais 24-48h antes de decidir — a clarity virá'
        : 'confie no processo; não force o resultado hoje',
    },
    timing,
    areaFoco,
    decisaoHoje,
  };
}

/** Síntese completa — 9 dimensões para um usuário. */
export interface CaixaSintese {
  readonly dimensoes: readonly DimensaoSintese[];
  readonly caminhoDeVida: string;
  /** Narrativa curta do perfil (header da página) */
  readonly perfilGeral: string;
  /** Akasha Authority — sistema de decisão diário */
  readonly autoridade: AkashaAuthority;
}

// ─── Helpers de alerta e prática ──────────────────────────────────────────

const ALERTAS: Record<DimensaoId, string> = {
  saude: 'Evite forçar o corpo quando sentir exaustão — seu corpo capta antes da mente.',
  trabalho: 'Evite decisões financeiras em dias de alta tensão emocional.',
  amor: 'Evite decisões relacionais quando a Lua está em tensão com Marte.',
  criacao: 'Evite forçar criação — sua criatividade flui melhor no estado de paz.',
  proposito: 'Evite questionar seu propósito em momentos de baixa energia.',
  familia: 'Evite confrontar questões ancestrais quando você não está firme.',
  espiritualidade: 'Evite forçar experiências espirituais — elas vêm quando você está pronto.',
  superacao: 'Evite evitar o desconforto — a transformação acontece no confronto.',
};

const PRAKTIKAS: Record<DimensaoId, string> = {
  saude: '3 respirações profundas ao acordar, antes de qualquer decisão.',
  trabalho: 'Revise suas intenções antes de abrir o email corporativo.',
  amor: 'Escute mais do que fale em conversas importantes hoje.',
  criacao: 'Dedique 20 minutos a algo artístico sem objetivo — só pelo prazer.',
  proposito: 'Pergunte a si mesmo: "Estou vivendo minha missão ou minha zona de conforto?"',
  familia: 'Ligue para alguém da família hoje, mesmo que brevemente.',
  espiritualidade: '5 minutos de silêncio antes de dormir — sem celular.',
  superacao: 'Nomeie o desconforto que você está evitando. Escreva num papel.',
};

// ─── Core: Síntetizar mapa → 9 Dimensões ────────────────────────────────

export function sintetizarMapa(pilares: PilaresDados): CaixaSintese {
  const dimensoes: DimensaoSintese[] = [];

  for (const dimensao of DIMENSOES) {
    const areasCorrespondentes = (
      Object.entries(DIMENSAO_DE_AREA) as [Area, DimensaoId][]
    )
      .filter(([, dimId]) => dimId === dimensao.id)
      .map(([area]) => area);

    const contribuicoes: DimensaoContribuicao[] = [];

    for (const pilar of ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as Pilar[]) {
      const pilarEPrimario = dimensao.pilaresPrimarios.includes(pilar);
      const pilarESecundario = dimensao.pilaresSecundarios.includes(pilar);
      if (!pilarEPrimario && !pilarESecundario) continue;

      for (const area of areasCorrespondentes) {
        const traducao = traducaoPara(pilar, area);
        if (traducao) {
          contribuicoes.push({
            pilar,
            frase: traducao.frase,
            fonte: traducao.fonte,
            nivel: pilarEPrimario ? 'primario' : 'secundario',
          });
        }
      }
    }

    // Deduplicate — um pilar = uma contribuição por dimensão
    const porPilar = new Map<Pilar, DimensaoContribuicao>();
    for (const c of contribuicoes) {
      const existing = porPilar.get(c.pilar);
      if (!existing || c.nivel === 'primario') {
        porPilar.set(c.pilar, c);
      }
    }
    const contribuicoesUnicas = Array.from(porPilar.values());

    // v2: narrativa profunda em vez de concatenação de frases curtas
    const synthes = gerarNarrativaDimensao(dimensao.id, pilares);

    // Akasha Authority aplicável a todas as 8 dimensões
    const aplicavel = true;

    dimensoes.push({
      dimensoesId: dimensao.id,
      titulo: dimensao.titulo,
      icone: dimensao.icone,
      chakraCor: dimensao.chakraCor,
      bgCor: dimensao.id,
      borderCor: dimensao.id,
      descricao: dimensao.descricao,
      synthes,
      contribuicoes: contribuicoesUnicas,
      praktika: PRAKTIKAS[dimensao.id] ?? 'Observe seus sinais internos.',
      alerta: ALERTAS[dimensao.id] ?? 'Preste atenção aos sinais do seu corpo e mente.',
      autoridadeAkasha: {
        tipo: aplicavel ? 'paz' : 'ansiedade',
        aplicavel,
        timing: aplicavel ? 'Aguarde até momento de paz interior.' : undefined,
      },
    });
  }

  const caminho = pilares.cabala?.life_path;
  const caminhoStr = caminho
    ? `Caminho de Vida ${caminho}${[11, 22, 33].includes(caminho) ? ' (Mestre)' : ''}`
    : 'Dados não disponíveis';

  return {
    dimensoes,
    caminhoDeVida: caminhoStr,
    perfilGeral: gerarPerfilGeral(pilares),
    autoridade: deriveAkashaAuthority(pilares),
  };
}
