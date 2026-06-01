// ============================================================
// AGENTE INTERPRETATIVO — Motor de Prompts das 36 Casas
// ============================================================
// Para cada uma das 36 casas, este agente monta um prompt
// ESTRUTURADO e BLINDADO que será enviado à IA.
//
// A TRAVA ANTI-MISTURA funciona em 3 camadas:
//   1. SYSTEM PROMPT — Define a regra-mestra da casa
//   2. CONTEXTO DA CASA — Bloqueia o que NÃO pode ser falado
//   3. ASPECTOS AUTORIZADOS — Lista fechada do que PODE ser falado
//
// Resultado: a IA fica IMPEDIDA de misturar temas.
// Casa 24 só fala de amor. Casa 34 só fala de dinheiro.

import { getHouse, getHousesByPillar } from './house-delegation';
import type {
  AstrologyPoint,
  ConsultaInput,
  HouseDefinition,
  InterpretacaoCasa,
  NumerologyNumber,
  SynthesisPillar,
} from './house-types';

// ============================================================
// TABELA DE TRAVAS — O que cada casa tem PROIBIDO falar
// ============================================================

const TRAVAS_POR_CASA: Record<number, string[]> = {
  1: ['dinheiro', 'casamento', 'trabalho_específico'],
  2: ['casamento_formal', 'filhos', 'sexualidade'],
  3: ['dinheiro_bolso', 'casamento'],
  4: ['carreira_pública', 'sexualidade'],
  5: ['casamento', 'viagens_longas'],
  6: ['carreira', 'casamento'],
  7: ['trabalho_rotina', 'família_de_origem'],
  8: ['carreira_pública', 'casamento'],
  9: ['trabalho_rotina', 'família'],
  10: ['sexualidade', 'família_de_origem'],
  11: ['família_de_origem', 'casamento'],
  12: ['sexualidade', 'dinheiro_bolso'],
  13: ['morte_transformação', 'carreira_consagrada'],
  14: ['casamento_formal', 'família_de_origem'],
  15: ['sexualidade', 'inveja'],
  16: ['dinheiro_bolso', 'trabalho_rotina'],
  17: ['sexualidade', 'inveja'],
  18: ['casamento_formal', 'sexualidade'],
  19: ['carreira', 'dinheiro_bolso'],
  20: ['sexualidade', 'morte_ego'],
  21: ['sexualidade', 'filhos'],
  22: ['sexualidade', 'inveja'],
  23: ['casamento', 'carreira'],
  24: ['carreira', 'dinheiro_bolso', 'trabalho_rotina'], // SÓ AMOR
  25: ['sexualidade', 'rotina', 'inveja'], // SÓ CONTRATOS
  26: ['sexualidade', 'carreira'],
  27: ['sexualidade', 'inveja'],
  28: ['casamento_formal', 'morte'],
  29: ['carreira', 'dinheiro_bolso'],
  30: ['sexualidade', 'carreira_início'],
  31: ['sexualidade', 'família_de_origem', 'inveja'],
  32: ['sexualidade', 'rotina'],
  33: ['sexualidade', 'morte'],
  34: ['amor', 'casamento_formal', 'sexualidade', 'família_de_origem'], // SÓ DINHEIRO
  35: ['sexualidade', 'morte'],
  36: ['sexualidade', 'rotina'],
};

// ============================================================
// MAPA DE ASPECTOS — Como extrair do mapa fixo
// ============================================================

const ASTROLOGY_LABELS: Record<AstrologyPoint, string> = {
  ascendente: 'Ascendente (como a pessoa se apresenta ao mundo)',
  meio_do_ceu: 'Meio do Céu (carreira e imagem pública)',
  descendente: 'Descendente (parcerias e casamento)',
  fundo_do_ceu: 'Fundo do Céu (raízes e lar)',
  lua_natal: 'Lua Natal (emoções, mãe, infância)',
  sol_natal: 'Sol Natal (essência, pai, ego)',
  venus_natal: 'Vênus Natal (amor, beleza, valores)',
  marte_natal: 'Marte Natal (ação, raiva, energia)',
  mercurio_natal: 'Mercúrio Natal (mente, comunicação)',
  saturno_natal: 'Saturno Natal (maturidade, limites, tempo)',
  netuno_natal: 'Netuno Natal (espiritualidade, intuição)',
  plutao_natal: 'Plutão Natal (transformação, poder)',
  urano_natal: 'Urano Natal (inovação, rebeldia)',
  jupiter_natal: 'Júpiter Natal (expansão, sorte)',
  lilith: 'Lilith (ponto cego, sombra, inveja)',
  nodos_lunares: 'Nodos Lunares (destino, direção de vida)',
  casa_2: 'Casa 2 (finanças e valores pessoais)',
  casa_3: 'Casa 3 (comunicação e mente)',
  casa_4: 'Casa 4 (lar e família)',
  casa_6: 'Casa 6 (trabalho e rotina)',
  casa_7: 'Casa 7 (parcerias formais)',
  casa_8: 'Casa 8 (transformação e morte simbólica)',
  casa_10: 'Casa 10 (carreira e vocação)',
  casa_11: 'Casa 11 (amigos e grupos)',
  casa_12: 'Casa 12 (inconsciente e espiritualidade)',
};

const NUMEROLOGY_LABELS: Record<NumerologyNumber, string> = {
  caminho_de_vida: 'Caminho de Vida (lição central)',
  numero_alma: 'Número de Alma (essência oculta)',
  numero_personalidade: 'Número de Personalidade (máscara social)',
  numero_expressao: 'Número de Expressão (como se comunica)',
  numero_motivacao: 'Número de Motivação (o que move a pessoa)',
  numero_destino: 'Número de Destino (missão cármica)',
  numero_missao: 'Número de Missão (propósito final)',
  desafios_carmicos: 'Desafios Cármicos (lições pendentes)',
  dons_divinos: 'Dons Divinos (talentos inatos)',
  dominio_tantrico: 'Domínio Tântrico (chakra dominante)',
  numero_karma_tantrico: 'Número de Karma Tântrico',
  veredito_tantrico: 'Veredito Tântrico (veredito final)',
  ponto_vulnerabilidade: 'Ponto de Vulnerabilidade Energética',
};

// ============================================================
// HELPER — Extrair valor do mapa fixo
// ============================================================

function extractAstrologyValue(
  point: AstrologyPoint,
  consulta: ConsultaInput
): string | null {
  const c = consulta.cliente;
  const map: Partial<Record<AstrologyPoint, string | undefined>> = {
    ascendente: c.ascendente,
    meio_do_ceu: c.meioDoCeuSigno,
    sol_natal: c.solSigno,
    lua_natal: c.luaSigno,
    venus_natal: c.venusSigno,
    marte_natal: c.marteSigno,
    mercurio_natal: c.mercurioSigno,
    saturno_natal: c.saturnoSigno,
    netuno_natal: c.netunoSigno,
    plutao_natal: c.plutaoSigno,
    urano_natal: c.uranoSigno,
    jupiter_natal: c.jupiterSigno,
    lilith: c.lilithSigno,
    nodos_lunares: c.noduloNorteSigno,
  };
  return map[point] ?? null;
}

function extractNumerologyValue(
  number: NumerologyNumber,
  consulta: ConsultaInput
): string | null {
  const c = consulta.cliente;
  const map: Partial<Record<NumerologyNumber, number | number[] | string | string[] | undefined>> = {
    caminho_de_vida: c.caminhoDeVida,
    numero_alma: c.numeroAlma,
    numero_personalidade: c.numeroPersonalidade,
    numero_expressao: c.numeroExpressao,
    numero_motivacao: c.numeroMotivacao,
    numero_destino: c.numeroDestino,
    numero_missao: c.numeroMissao,
    desafios_carmicos: c.desafiosCarmicos,
    dons_divinos: c.donsDivinos,
    dominio_tantrico: c.dominioTantrico,
    numero_karma_tantrico: c.numeroKarmaTantrico,
    veredito_tantrico: c.vereditoTantrico,
  };
  const value = map[number];
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

// ============================================================
// CONSTRUTOR DO SYSTEM PROMPT
// ============================================================

/**
 * Monta o SYSTEM PROMPT blindado para uma casa específica.
 * Inclui travas anti-mistura e o contexto delegado.
 */
export function buildSystemPromptForHouse(
  house: HouseDefinition,
  consulta: ConsultaInput
): string {
  const carta = consulta.cartasCiganas.find((c) => c.casaId === house.number);
  const oduPrincipal = consulta.odus.find((o) => o.tipo === 'principal');
  const oduComplementar = consulta.odus.find((o) => o.tipo === 'complementar');

  // Aspectos que ESTÃO AUTORIZADOS
  const astrologiaAutorizada = house.astrologia
    .map((p) => `${ASTROLOGY_LABELS[p]} = ${extractAstrologyValue(p, consulta) ?? 'não informado'}`)
    .filter((v) => !v.includes('= não informado'));

  const numerologiaAutorizada = house.numerologia
    .map((n) => {
      if (n === 'cruzamentosDestino') {
        return consulta.cliente.cruzamentosDestino?.length
          ? `Cruzamentos de Destino = ${consulta.cliente.cruzamentosDestino.join(' / ')}`
          : '';
      }
      if (n === 'ponto_vulnerabilidade') {
        return consulta.cliente.pontoVulnerabilidade
          ? `Ponto de Vulnerabilidade = ${consulta.cliente.ponto_vulnerabilidade ?? consulta.cliente.pontoVulnerabilidade}`
          : '';
      }
      const value = extractNumerologyValue(n, consulta);
      return value ? `${NUMEROLOGY_LABELS[n]} = ${value}` : '';
    })
    .filter(Boolean);

  // O que ESTÁ PROIBIDO
  const travas = TRAVAS_POR_CASA[house.number] ?? [];

  const prompt = `
Você é o AGENTE INTERPRETATIVO do sistema "Cabala dos Caminhos".
Sua missão é analisar ESPECIFICAMENTE a Casa ${house.number} — "${house.cartaCigana}".

═══════════════════════════════════════════════════
DADOS DO CONSULENTE
═══════════════════════════════════════════════════
Nome: ${consulta.cliente.nomeCompleto}
Data de Nascimento: ${consulta.cliente.dataNascimento}
${consulta.cliente.horaNascimento ? `Hora de Nascimento: ${consulta.cliente.horaNascimento}` : ''}
${consulta.cliente.localNascimento ? `Local: ${consulta.cliente.localNascimento}` : ''}
${consulta.cliente.orixaRegente ? `Orixá Regente: ${consulta.cliente.orixaRegente}` : ''}

═══════════════════════════════════════════════════
TEMA DA CASA ${house.number} — ${house.tema.toUpperCase()}
═══════════════════════════════════════════════════
${house.significado}

Palavra-chave: ${house.keyword}
Bloco: ${house.bloco} (${house.bloco === 'A' ? 'O Eu' : house.bloco === 'B' ? 'Trabalho/Desafios' : house.bloco === 'C' ? 'Social/Relacionamentos' : 'Destino Final'})

═══════════════════════════════════════════════════
CARTA CIGANA SORTEADA
═══════════════════════════════════════════════════
${carta ? `Carta: ${carta.nome ?? house.cartaCigana}${carta.invertida ? ' (INVERTIDA)' : ''}
${carta.observacao ? `Observação do oraculista: ${carta.observacao}` : ''}` : 'Nenhuma carta sorteada para esta casa.'}

═══════════════════════════════════════════════════
ODU DE BÚZIOS SORTEADO
═══════════════════════════════════════════════════
${oduPrincipal ? `Odu Principal: ${oduPrincipal.nome}
${oduPrincipal.refrao ? `Refrão: ${oduPrincipal.refrao}` : ''}
${oduPrincipal.observacao ? `Observação: ${oduPrincipal.observacao}` : ''}` : 'Nenhum Odu principal informado.'}
${oduComplementar ? `
Odu Complementar: ${oduComplementar.nome}
${oduComplementar.refrao ? `Refrão: ${oduComplementar.refrao}` : ''}` : ''}

═══════════════════════════════════════════════════
ASPECTOS AUTORIZADOS A USAR (NÃO INVENTE OUTROS)
═══════════════════════════════════════════════════
${astrologiaAutorizada.length > 0 ? astrologiaAutorizada.map((a) => `• ${a}`).join('\n') : '• Nenhum aspecto astrológico delegado a esta casa.'}
${numerologiaAutorizada.length > 0 ? numerologiaAutorizada.map((n) => `• ${n}`).join('\n') : ''}

═══════════════════════════════════════════════════
🚫 TRAVAS ANTI-MISTURA — PROIBIÇÕES RÍGIDAS
═══════════════════════════════════════════════════
Você ESTÁ TERMINANTEMENTE PROIBIDO de falar sobre:
${travas.map((t) => `✗ ${t.replace(/_/g, ' ')}`).join('\n')}

Se o mapa do consulente tiver informações sobre esses temas PROIBIDOS, IGNORE-AS COMPLETAMENTE.
Outra casa do sistema é responsável por aqueles temas.

═══════════════════════════════════════════════════
ESTRUTURA DA RESPOSTA (JSON ESTRITO)
═══════════════════════════════════════════════════
Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem explicações:

{
  "significado": "(2-3 frases) O significado sagrado da Casa ${house.number}",
  "cruzamentoCarta": "(3-4 frases) Como a Carta Cigana '${carta?.nome ?? house.cartaCigana}' se conecta com o Odu '${oduPrincipal?.nome ?? 'informado'}' no contexto desta casa",
  "cruzamentoMapa": "(3-5 frases) Cruzamento COM APENAS os aspectos autorizados acima. Use-os de forma orgânica, mostrando como eles confirmam ou desafiam a mensagem da carta+odu",
  "direcaoPratica": "(2-3 frases) Uma direção prática, clara e mística que o consulente pode aplicar HOJE",
  "alerta": "(1 frase) Um alerta místico sutil se houver risco, ou string vazia se a casa estiver leve",
  "tom": "(um de: 'revelador' | 'protetor' | 'transformador' | 'celebrativo')"
}

═══════════════════════════════════════════════════
REGRAS FINAIS
═══════════════════════════════════════════════════
1. NÃO invente aspectos que não estão na lista de AUTORIZADOS.
2. NÃO mencione os temas PROIBIDOS.
3. Use uma linguagem MÍSTICA DIRETA — sem rodeios.
4. Traga uma REVELAÇÃO, não uma generalidade.
5. Se faltar dado, fale do significado original da casa de forma mais profunda.
6. O tom deve ser de um oraculista sábio, não de um chatbot.
`.trim();

  return prompt;
}

// ============================================================
// CONSTRUTOR DO PROMPT DE SÍNTESE
// ============================================================

/**
 * Monta o prompt para a síntese final dos 4 pilares.
 */
export function buildSynthesisPrompt(
  pilar: SynthesisPillar,
  interpretacoes: InterpretacaoCasa[]
): string {
  const titulos: Record<SynthesisPilar, string> = {
    trabalho_dinheiro: 'O Caminho do Trabalho e Dinheiro',
    lar_familia: 'O Caminho do Lar e Família',
    amor_relacionamentos: 'O Caminho do Amor e Relacionamentos',
    conselho_espiritual: 'O Grande Conselho Espiritual e Evolutivo',
  };

  const casasUsadas = getHousesByPillar(pilar);
  const casasFiltradas = interpretacoes.filter((i) =>
    casasUsadas.includes(i.casaId)
  );

  return `
Você é o AGENTE SINTETIZADOR do sistema "Cabala dos Caminhos".
Sua missão é consolidar a leitura de ${casasUsadas.length} casas em um PARECER ÚNICO sobre o pilar: "${titulos[pilar]}".

═══════════════════════════════════════════════════
CASAS CONSIDERADAS NESTE PILAR
═══════════════════════════════════════════════════
${casasUsadas.map((c) => `• Casa ${c}`).join('\n')}

═══════════════════════════════════════════════════
LEITURAS DAS CASAS
═══════════════════════════════════════════════════
${casasFiltradas.length > 0
  ? casasFiltradas
      .map(
        (c) => `
--- Casa ${c.casaId} (${c.cartaCigana}) ---
Significado: ${c.conteudo.significado}
Cruzamento: ${c.conteudo.cruzamentoCarta}
Mapa: ${c.conteudo.cruzamentoMapa}
Direção: ${c.conteudo.direcaoPratica}
${c.conteudo.alerta ? `Alerta: ${c.conteudo.alerta}` : ''}
`
      )
      .join('\n')
  : 'Nenhuma leitura disponível para este pilar.'}

═══════════════════════════════════════════════════
ESTRUTURA DA RESPOSTA (JSON ESTRITO)
═══════════════════════════════════════════════════
{
  "titulo": "${titulos[pilar]}",
  "casasUsadas": [${casasUsadas.join(', ')}],
  "resumoExecutivo": "(4-6 frases) Visão geral mística e profunda deste pilar na vida do consulente",
  "pontosChave": [
    "(Insight 1)",
    "(Insight 2)",
    "(Insight 3)",
    "(Insight 4)",
    "(Insight 5)"
  ],
  "orientacaoPratica": "(3-4 frases) Ações concretas e realizáveis que o consulente deve tomar",
  "periodoFavoravel": "(Opcional) Próximo período astrológico/numerológico favorável para agir neste pilar, ou null"
}

═══════════════════════════════════════════════════
REGRAS FINAIS
═══════════════════════════════════════════════════
1. Conecte os insights das casas em uma NARRATIVA COESA.
2. Use a linguagem de um MESTRE ESPIRITUAL, não de um assistente.
3. Seja DIRETO. Sem rodeios, sem generalidades.
4. Traga uma VISÃO ESTRATÉGICA de vida, não uma lista.
`.trim();
}

// ============================================================
// VALIDADOR — Garante que a casa tem dados suficientes
// ============================================================

export function validateHouseReadiness(
  house: HouseDefinition,
  consulta: ConsultaInput
): { ready: boolean; missing: string[] } {
  const missing: string[] = [];

  const carta = consulta.cartasCiganas.find((c) => c.casaId === house.number);
  if (!carta) missing.push(`Carta Cigana da Casa ${house.number}`);

  const odu = consulta.odus.find((o) => o.tipo === 'principal');
  if (!odu) missing.push('Odu Principal de Búzios');

  // Astrologia: se há aspectos delegados, idealmente o mapa precisa ter
  if (house.astrologia.length > 0) {
    const temAlgum = house.astrologia.some(
      (p) => extractAstrologyValue(p, consulta) !== null
    );
    if (!temAlgum) {
      missing.push(
        `Mapa Astral completo (faltam: ${house.astrologia
          .map((p) => ASTROLOGY_LABELS[p])
          .join(', ')})`
      );
    }
  }

  // Numerologia
  if (house.numerologia.length > 0) {
    const temAlgum = house.numerologia.some((n) => {
      if (n === 'cruzamentosDestino') {
        return (consulta.cliente.cruzamentosDestino?.length ?? 0) > 0;
      }
      return extractNumerologyValue(n, consulta) !== null;
    });
    if (!temAlgum) {
      missing.push(
        `Mapa Numerológico (faltam: ${house.numerologia
          .map((n) => NUMEROLOGY_LABELS[n])
          .join(', ')})`
      );
    }
  }

  return { ready: missing.length === 0, missing };
}
