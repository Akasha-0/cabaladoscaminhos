/**
 * ════════════════════════════════════════════════════════════════════════════
 * PREDICTIVE SYNTHESIS ENGINE v1.0
 * Cabala dos Caminhos - Motor de Síntese Consciencial
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Propósito: Unificar correlações espirituais em insights preditivos de
 * autoconhecimento profundo. Transforma 303+ widgets fragmentados em um
 * motor dinâmico e integrado de síntese.
 * 
 * Arquiteto: MESTRE_ENGENHEIRO_SINTESE_CONSCIENCIAL
 * Versão: 1.0.0
 * Data: 2026-05-30
 * 
 * ════════════════════════════════════════════════════════════════════════════
 */

import { MapaAlmaCompleto, Convergence } from '../engines/types/mapa-alma'

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Insight de Síntese Profunda - resultado do motor de síntese
 */
export interface InsightSintese {
  id: string
  titulo: string
  mensagem: string
  tradicoes: string[]
  eixos: EixoCorrelacional[]
  confianca: number
  nivelPotencia: 'tríplice' | 'dupla' | 'simples' | 'neutra'
  aplicacaoPratica: string
  preceitos?: string[]
  orixafavoravel?: string
  ervas?: string[]
  chakras?: string[]
  sephirot?: string[]
  timestamp: Date
}

/**
 * Eixo Correlacional - mapeamento entre tradições
 */
export interface EixoCorrelacional {
  eixo: 'cósmico-vibracional' | 'numérico-iniciático' | 'árvore-vida' | 'força-ancestral'
  elementos: MapeamentoElemento[]
  confianca: number
}

export interface MapeamentoElemento {
  tradicao: string
  elemento: string
  valor: string
  significado: string
}

/**
 * Resultado da Síntese Consciencial
 */
export interface SinteseConsciencial {
  insights: InsightSintese[]
  grafoConsciencial: GrafoNodo[]
  calendarioConvergencia: JanelaTemporal[]
  traçosDominantes: TraçoDominante[]
  traçosSombra: TraçoSombra[]
  recomendações: Recomendação[]
  timestamp: Date
  qualidadeScore: number
}

/**
 * Nó do Grafo Consciencial
 */
export interface GrafoNodo {
  id: string
  tipo: 'tradição' | 'elemento' | 'conceito' | 'prática'
  nome: string
  tradicoes: string[]
  conexoes: string[]
  energia: number
  bloqueio?: boolean
}

/**
 * Janela Temporal de Convergência
 */
export interface JanelaTemporal {
  data: Date
  tipo: 'tríplice' | 'dupla' | 'simples' | 'neutra'
  factores: string[]
  pontuacao: number
  práticaRecomendada: string
}

/**
 * Traço Dominante - padrão confirmado por 3+ sistemas
 */
export interface TraçoDominante {
  nome: string
  tradicoesConfirmam: string[]
  descrição: string
  energia: number
}

/**
 * Traço de Sombra - bloqueio identificado
 */
export interface TraçoSombra {
  nome: string
  tradicoesIndicam: string[]
  causaProfunda: string
  prácticaRecuperadora: string
}

/**
 * Recomendação de Prática Espiritual
 */
export interface Recomendação {
  tipo: 'ebó' | 'banho' | 'defumação' | 'oração' | 'meditação' | 'jalecom'
  título: string
  descrição: string
  orixá: string
  frequência: string
  período: string
}

// ============================================================================
// CONSTANTES DE CORRELAÇÃO MESTRA
// ============================================================================

const EIXOS_CORRELACIONAIS = {
  CÓSMICO_VIBRACIONAL: ['astrologia', 'tarot'],
  NUMÉRICO_INICIÁTICO: ['numerologia', 'cabalística'],
  ÁRVORE_VIDA: ['cabala', 'sephirot'],
  FORÇA_ANCESTRAL: ['orixás', 'chakras', 'umbanda', 'candomblé', 'fitoenergética']
} as const

const MAPEAMENTO_ORIXÁ_CHAKRA: Record<string, { chakra: string; numero: number; elemento: string; cor: string }> = {
  'oxalá': { chakra: 'sahasrara', numero: 7, elemento: 'éter', cor: 'branco' },
  'oxum': { chakra: 'anjá', numero: 6, elemento: 'água', cor: 'azul' },
  'ogum': { chakra: 'muladhara', numero: 1, elemento: 'fogo', cor: 'vermelho' },
  'iansã': { chakra: 'svadhisthana', numero: 2, elemento: 'água', cor: 'laranja' },
  'oxóssi': { chakra: 'manipura', numero: 3, elemento: 'fogo', cor: 'amarelo' },
  'xangô': { chakra: 'manipura', numero: 3, elemento: 'fogo', cor: 'laranja' },
  'logum': { chakra: 'ajna', numero: 5, elemento: 'ar', cor: 'anil' },
  'omulu/obaluayé': { chakra: 'muladhara', numero: 1, elemento: 'terra', cor: 'preto' },
  'iemanja': { chakra: 'svadhisthana', numero: 2, elemento: 'água', cor: 'azul' },
  'nanã': { chakra: 'muladhara', numero: 1, elemento: 'terra', cor: 'roxo' }
}

const NÚMEROS_MESTRES = {
  11: { nome: 'Mestre', significado: 'Intuição, Iluminação, Insight Espiritual', tradição: 'cabalística' },
  22: { nome: 'Mestre', significado: 'Construtor, Realização Prática', tradição: 'cabalística' },
  33: { nome: 'Mestre', significado: 'Mestre Teacher, Compaixão Divina', tradição: 'cabalística' }
}

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class PredictiveSynthesisEngine {
  private mapaAlma: MapaAlmaCompleto | null = null
  private insightsCache: Map<string, InsightSintese> = new Map()

  /**
   * Carrega o Mapa do Alma para síntese
   */
  carregarMapaAlma(mapa: MapaAlmaCompleto): void {
    this.mapaAlma = mapa
    this.insightsCache.clear()
  }

  /**
   * Gera Síntese Consciencial completa
   */
  gerarSinteseConsciencial(): SinteseConsciencial {
    if (!this.mapaAlma) {
      throw new Error('MapaAlma não carregado. Use carregarMapaAlma() primeiro.')
    }

    const insights = this.gerarInsightsSintese()
    const grafoConsciencial = this.construirGrafoConsciencial(insights)
    const traçosDominantes = this.identificarTraçosDominantes(grafoConsciencial)
    const traçosSombra = this.identificarTraçosSombra(grafoConsciencial)
    const calendário = this.calcularCalendárioConvergência()
    const recomendações = this.gerarRecomendações(traçosDominantes, traçosSombra)

    return {
      insights,
      grafoConsciencial,
      calendarioConvergencia: calendário,
      traçosDominantes,
      traçosSombra,
      recomendações,
      timestamp: new Date(),
      qualidadeScore: this.calcularQualidadeScore(insights)
    }
  }

  /**
   * Gera insights de síntese profunda
   */
  private gerarInsightsSintese(): InsightSintese[] {
    if (!this.mapaAlma) return []

    const insights: InsightSintese[] = []

    // Insight 1: Integração de Tradições
    insights.push(this.gerarInsightIntegraçãoTradições())

    // Insight 2: Síntese Numero-Arquetípica
    insights.push(this.gerarInsightSínteseNumeroArquetípica())

    // Insight 3: Correlação Orixá-Chakra-Sephirah
    insights.push(this.gerarInsightCorrelaçãoOrixáChakraSephirah())

    // Insight 4: Calendário de Potencial
    insights.push(this.gerarInsightCalendárioPotencial())

    // Insight 5: Síntese de Convergências
    insights.push(this.gerarInsightSínteseConvergências())

    return insights
  }

  /**
   * Gera insight de integração entre tradições
   */
  private gerarInsightIntegraçãoTradições(): InsightSintese {
    const mapa = this.mapaAlma!
    const numerologia = mapa.numerologia
    const odu = mapa.odu
    const astrologia = mapa.astrologia

    // Encontrar o elemento comum entre tradições
    const signo = astrologia?.sol?.signo || astrologia?.ascendente || 'Desconhecido'
    const caminhoVida = numerologia?.vida || 0
    const oduPrincipal = odu?.regente?.nome || 'Desconhecido'

    // Verificar número mestre
    const éNúmeroMestre = [11, 22, 33].includes(caminhoVida)
    const infoNúmeroMestre = éNúmeroMestre ? NÚMEROS_MESTRES[caminhoVida as 11 | 22 | 33] : null

    // Calcular nível de convergência
    const converências = mapa.convergencias || []
    const converênciasSignificativas = converências.filter(c => 
      c.forca === 'forte' || c.forca === 'medio'
    )

    return {
      id: `insight-integracao-${Date.now()}`,
      titulo: `Integração Consciencial: ${signo} + Caminho ${caminhoVida}`,
      mensagem: éNúmeroMestre 
        ? `Você carrega a vibrational frequency do Número Mestre ${caminhoVida} (${infoNúmeroMestre?.significado}). ` +
          `Como nativo de ${signo}, sua intuição é sua maior ferramenta espiritual. ` +
          `Odu ${oduPrincipal} confirma um caminho de transformação e iluminação.`
        : `Sua configuração energética conecta ${signo} com o Caminho de Vida ${caminhoVida}. ` +
          `Odu ${oduPrincipal} indica a energia predominante do seu destino. ` +
          `Esta integração revela um perfil de autoconhecimento profundo.`,
      tradicoes: ['astrologia', 'numerologia', 'odu'],
      eixos: [
        {
          eixo: 'cósmico-vibracional',
          elementos: [
            { tradicao: 'astrologia', elemento: 'signo', valor: signo, significado: 'archétipo solar' },
            { tradicao: 'tarot', elemento: 'arcano', valor: this.obterArcanoCorrespondente(signo), significado: 'energia do signo' }
          ],
          confianca: 0.9
        },
        {
          eixo: 'numérico-iniciático',
          elementos: [
            { tradicao: 'numerologia', elemento: 'caminhoVida', valor: String(caminhoVida), significado: 'missão de vida' }
          ],
          confianca: 0.95
        }
      ],
      confianca: 0.92,
      nivelPotencia: converênciasSignificativas.length > 2 ? 'tríplice' : 'dupla',
      aplicacaoPratica: 'Pratique auto-observação nos momentos de intuição aguda. ' +
        'Anote seus insights em um diário espiritual para rastrear padrões.',
      orixafavoravel: this.identificarOrixáFavorável(signo, caminhoVida),
      timestamp: new Date()
    }
  }

  /**
   * Gera insight de síntese número-arquetípica
   */
  private gerarInsightSínteseNumeroArquetípica(): InsightSintese {
    const mapa = this.mapaAlma!
    const numerologia = mapa.numerologia
    const tarot = mapa.tarot

    const caminhoVida = numerologia?.vida || 0

    // Mapear número a arcano
    const arcanoCorrespondente = caminhoVida <= 22 
      ? this.obterArcanoPorNúmero(caminhoVida)
      : this.obterArcanoPorNúmero(this.calcularReduçãoDigital(caminhoVida))

    return {
      id: `insight-sintese-numero-${Date.now()}`,
      titulo: `Síntese Numero-Arquetípica: ${caminhoVida} ↔ ${arcanoCorrespondente.nome}`,
      mensagem: `O número ${caminhoVida} do seu Caminho de Vida ressoa com o Arcano "${arcanoCorrespondente.nome}". ` +
        `${arcanoCorrespondente.descricao}. ` +
        `Esta síntese revela como sua energia numérica se manifesta no nível arquetípico.`,
      tradicoes: ['numerologia', 'tarot', 'cabala'],
      eixos: [
        {
          eixo: 'numérico-iniciático',
          elementos: [
            { tradicao: 'numerologia', elemento: 'caminhoVida', valor: String(caminhoVida), significado: 'missão de vida' },
            { tradicao: 'cabalística', elemento: 'sephirah', valor: this.obterSephirahCorrespondente(caminhoVida), significado: 'canal divino' }
          ],
          confianca: 0.95
        },
        {
          eixo: 'cósmico-vibracional',
          elementos: [
            { tradicao: 'tarot', elemento: 'arcanoMaior', valor: arcanoCorrespondente.nome, significado: 'archétipo de destino' }
          ],
          confianca: 0.88
        }
      ],
      confianca: 0.91,
      nivelPotencia: 'dupla',
      aplicacaoPratica: `Medite sobre a energia do Arcano ${arcanoCorrespondente.nome}. ` +
        `Visualize seu caminho de vida fluindo através desta energia arquetípica.`,
      timestamp: new Date()
    }
  }

  /**
   * Gera insight de correlação Orixá-Chakra-Sephirah
   */
  private gerarInsightCorrelaçãoOrixáChakraSephirah(): InsightSintese {
    const mapa = this.mapaAlma!
    const odu = mapa.odu
    const chakrasInfo = mapa.chakras?.chakras || []
    const oduRegente = odu?.regente
    const oduPrincipal = typeof oduRegente === 'object' && 'nome' in oduRegente ? oduRegente.nome : 'Ogbe'
    const orixáCabeca = this.identificarOrixáCabeça(oduPrincipal)
    const mapeamento = MAPEAMENTO_ORIXÁ_CHAKRA[orixáCabeca.toLowerCase()] || 
                       MAPEAMENTO_ORIXÁ_CHAKRA['oxalá']

    // Encontrar chakra correspondente
    const chakraCorrespondente = chakrasInfo.find(c => 
      c.nome === mapeamento.chakra || c.numero === mapeamento.numero
    )

    return {
      id: `insight-orixa-chakra-${Date.now()}`,
      titulo: `Correlação Ancestral: ${orixáCabeca} ↔ ${mapeamento.chakra}`,
      mensagem: `Você é filho(a) de ${orixáCabeca}, que ressoa com o chakra ${mapeamento.chakra} (${mapeamento.numero}º). ` +
        `Este alinhamento indica que sua energia ancestral flui através do ${mapeamento.elemento}. ` +
        (chakraCorrespondente 
          ? `Seu chakra ${mapeamento.chakra} está com energia de ${chakraCorrespondente.intensidade}%.`
          : `A harmonização deste eixo é essencial para seu equilíbrio.`),
      tradicoes: ['candomblé', 'umbanda', 'yoga', 'chakras'],
      eixos: [
        {
          eixo: 'força-ancestral',
          elementos: [
            { tradicao: 'candomblé', elemento: 'orixá', valor: orixáCabeca, significado: 'força ancestral' },
            { tradicao: 'yoga', elemento: 'chakra', valor: mapeamento.chakra, significado: 'centro energético' },
            { tradicao: 'fitoenergética', elemento: 'erva', valor: this.obterErvaCorrespondente(orixáCabeca), significado: 'harmonização' }
          ],
          confianca: 0.93
        }
      ],
      confianca: 0.93,
      nivelPotencia: chakrasInfo.length > 3 ? 'tríplice' : 'dupla',
      aplicacaoPratica: `Use ervas de ${orixáCabeca} para harmonizar seu ${mapeamento.chakra}. ` +
        `Cores ${mapeamento.cor} são especialmente favoráveis. ` +
        `Mantras do chakra são recomendados diariamente.`,
      orixafavoravel: orixáCabeca,
      chakras: [mapeamento.chakra],
      ervas: [this.obterErvaCorrespondente(orixáCabeca)],
      timestamp: new Date()
    }
  }

  /**
   * Gera insight de calendário de potencial
   */
  private gerarInsightCalendárioPotencial(): InsightSintese {
    const mapa = this.mapaAlma!
    const astrologia = mapa.astrologia

    const signo = astrologia?.sol?.signo || 'escorpiao'
    const lua = astrologia?.lua?.signo || 'crescente'

    // Calcular períodos favoráveis
    const períodos = this.calcularPeríodosFavoráveis(signo, lua)

    return {
      id: `insight-calendario-${Date.now()}`,
      titulo: `Calendário de Potencial: ${signo} + Lua ${lua}`,
      mensagem: `Como nativo de ${signo} com Lua em ${lua}, seu potencial está alinhado com os ciclos cósmicos. ` +
        `${períodos.descrição}. ` +
        `Os dias mais favoráveis são: ${períodos.diasFavoráveis}.`,
      tradicoes: ['astrologia', 'numerologia', 'odu'],
      eixos: [
        {
          eixo: 'cósmico-vibracional',
          elementos: [
            { tradicao: 'astrologia', elemento: 'signo', valor: signo, significado: 'energia solar' },
            { tradicao: 'astrologia', elemento: 'lua', valor: lua, significado: 'energia emocional' }
          ],
          confianca: 0.91
        }
      ],
      confianca: 0.89,
      nivelPotencia: 'dupla',
      aplicacaoPratica: períodos.prática,
      timestamp: new Date()
    }
  }

  /**
   * Gera insight de síntese de convergências
   */
  private gerarInsightSínteseConvergências(): InsightSintese {
    const mapa = this.mapaAlma!
    const convergências = mapa.convergencias || []

    const fortes = convergências.filter(c => c.forca === 'forte')
    const medias = convergências.filter(c => c.forca === 'medio')

    const título = fortes.length > 0 
      ? `Convergência Forte: ${fortes[0].descricao}`
      : medias.length > 0 
        ? `Convergência Média: ${medias[0].descricao}`
        : 'Síntese de Configurações'

    const descrição = fortes.length > 0
      ? `Você possui ${fortes.length} convergência(s) forte(s), indicando alta sintonia com múltiplas tradições. ${fortes[0].descricao}`
      : medias.length > 0
        ? `Sua configuração possui ${medias.length} convergência(s) média(s). ${medias[0].descricao}`
        : 'Suas tradições estão alinhadas de forma consistente.'

    const forçaMap: Record<string, number> = { 'forte': 0.9, 'medio': 0.7, 'fraco': 0.5 }

    return {
      id: `insight-convergencias-${Date.now()}`,
      titulo: título,
      mensagem: descrição,
      tradicoes: this.extrairTradiçõesConvergências(convergências),
      eixos: convergências.map(c => ({
        eixo: 'cósmico-vibracional' as const,
        elementos: c.sistemas.map((s, i) => ({
          tradicao: s,
          elemento: `sistema${i + 1}`,
          valor: c.energia,
          significado: c.descricao
        })),
        confianca: forçaMap[c.forca] ?? 0.85
      })),
      confianca: fortes.length > 0 ? 0.95 : 0.88,
      nivelPotencia: fortes.length > 0 ? 'tríplice' : medias.length > 0 ? 'dupla' : 'simples',
      aplicacaoPratica: fortes.length > 0
        ? 'Este é um momento de alta potência espiritual. Realize suas práticas mais importantes.'
        : 'Suas práticas regulares estão bem alinhadas. Continue com consistência.',
      timestamp: new Date()
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private calcularReduçãoDigital(numero: number): number {
    while (numero > 9 && ![11, 22, 33].includes(numero)) {
      numero = String(numero).split('').reduce((sum, digit) => sum + parseInt(digit), 0)
    }
    return numero
  }

  private obterArcanoCorrespondente(signo: string): string {
    const mapa: Record<string, string> = {
      'aries': 'O Imperador',
      'touro': 'O Hierofante',
      'gemeos': 'Os Enamorados',
      'cancer': 'O Carro',
      'leao': 'A Força',
      'virgem': 'O Eremita',
      'libra': 'A Justiça',
      'escorpiao': 'A Morte',
      'sagitario': 'Temperança',
      'capricornio': 'O Diabo',
      'aquario': 'A Estrela',
      'peixes': 'A Lua'
    }
    return mapa[signo.toLowerCase()] || 'O Louco'
  }

  private obterArcanoPorNúmero(numero: number): { nome: string; descricao: string } {
    const arcanos: Record<number, { nome: string; descricao: string }> = {
      0: { nome: 'O Louco', descricao: 'Iniciação, liberdade, salto de fé' },
      1: { nome: 'O Mago', descricao: 'Manifestação, poder pessoal, vontade' },
      2: { nome: 'A Sacerdotisa', descricao: 'Intuição, mistério, sabedoria interior' },
      3: { nome: 'A Imperatriz', descricao: 'Fertilidade, abundância, criação' },
      4: { nome: 'O Imperador', descricao: 'Autoridade, estrutura, estabilidade' },
      5: { nome: 'O Hierofante', descricao: 'Tradição, espiritualidade, ensinamento' },
      6: { nome: 'Os Enamorados', descricao: 'União, escolhas, relacionamentos' },
      7: { nome: 'O Carro', descricao: 'Vitória, determinação, conquista' },
      8: { nome: 'A Justiça', descricao: 'Equilíbrio, verdade, karma' },
      9: { nome: 'O Eremita', descricao: 'Introspecção, solidão, busca interior' },
      10: { nome: 'A Roda da Fortuna', descricao: 'Ciclos, destino, mudança' },
      11: { nome: 'A Força', descricao: 'Coragem, compaixão, poder suave' },
      12: { nome: 'O Eremita (Invertido)', descricao: 'Isolamento, medo, introversão excessiva' },
      13: { nome: 'A Morte', descricao: 'Transformação, fim de ciclo, renascimento' },
      14: { nome: 'Temperança', descricao: 'Equilíbrio, paciência, integração' },
      15: { nome: 'O Diabo', descricao: 'Tentação, materialismo, sombras' },
      16: { nome: 'A Torre', descricao: 'Destruição criativa, revelação, despertar' },
      17: { nome: 'A Estrela', descricao: 'Esperança, inspiração, renovação' },
      18: { nome: 'A Lua', descricao: 'Ilusão, intuição, inconsciência' },
      19: { nome: 'O Sol', descricao: 'Sucesso, alegria, vitalidade' },
      20: { nome: 'O Julgamento', descricao: 'Renascimento, redenção, chamada' },
      21: { nome: 'O Mundo', descricao: 'Realização, completude, integração' },
      22: { nome: 'O Louco (Mestre)', descricao: 'Mestria espiritual, trascendência' }
    }
    return arcanos[numero] || { nome: 'Desconhecido', descricao: 'Arcano não identificado' }
  }

  private obterSephirahCorrespondente(numero: number): string {
    const sephirot: Record<number, string> = {
      1: 'Keter (Coroa)',
      2: 'Chokhmah (Sabedoria)',
      3: 'Binah (Entendimento)',
      4: 'Chesed (Misericórdia)',
      5: 'Geburah (Severidade)',
      6: 'Tiferet (Beleza)',
      7: 'Netzach (Vitória)',
      8: 'Hod (Glória)',
      9: 'Yesod (Fundação)',
      10: 'Malkuth (Reino)'
    }
    return sephirot[numero] || sephirot[this.calcularReduçãoDigital(numero)] || 'Não mapeado'
  }

  private identificarOrixáFavorável(signo: string, caminhoVida: number): string {
    const mapa: Record<string, string> = {
      'aries': 'Ogum',
      'touro': 'Oxum',
      'gemeos': 'Iansã',
      'cancer': 'Iemanjá',
      'leao': 'Oxalá',
      'virgem': 'Nanã',
      'libra': 'Iansã',
      'escorpiao': 'Ogum',
      'sagitario': 'Oxóssi',
      'capricornio': 'Omulu',
      'aquario': 'Nanã',
      'peixes': 'Oxum'
    }
    return mapa[signo.toLowerCase()] || 'Oxalá'
  }

  private identificarOrixáCabeça(odu: string): string {
    const mapa: Record<string, string> = {
      'ogbe': 'Oxalá',
      'oyeku': 'Iemanjá',
      'iwori': 'Oxum',
      'odii': 'Ogum',
      'ogunda': 'Oxóssi',
      'oshosi': 'Oxóssi',
      'obi': 'Logum',
      'logum': 'Logum',
      'owonrin': 'Xangô',
      'brbe': 'Omulu',
      'ose': 'Iansã',
      'woli': 'Nanã',
      'opira': 'Oxalá',
      'iori': 'Oxum'
    }
    return mapa[odu.toLowerCase()] || 'Oxalá'
  }

  private obterErvaCorrespondente(orixá: string): string {
    const ervas: Record<string, string> = {
      'oxalá': 'cravo',
      'oxum': 'manjericão',
      'ogum': 'arruda',
      'iansã': 'pimenta',
      'oxóssi': 'cabaceira',
      'xangô': 'fumo',
      'logum': 'atal',
      'omulu': 'palmeira',
      'iemanja': 'golá',
      'nanã': 'cetim'
    }
    return ervas[orixá.toLowerCase()] || 'manjericão'
  }

  private calcularPeríodosFavoráveis(signo: string, lua: string): { 
    descrição: string
    diasFavoráveis: string
    prática: string 
  } {
    return {
      descrição: `Períodos de alta receptividade energética para ${signo}. ` +
        `Lua ${lua} amplifica suas práticas espirituais.`,
      diasFavoráveis: 'Segunda a Quarta para introspecção, Sexta para práticas de amor',
      prática: 'Medite durante a Lua ${lua} em ambiente com cores do seu signo.'
    }
  }

  private construirGrafoConsciencial(insights: InsightSintese[]): GrafoNodo[] {
    const nodos: Map<string, GrafoNodo> = new Map()

    // Adicionar nós baseados nos insights
    insights.forEach(insight => {
      insight.eixos.forEach(eixo => {
        eixo.elementos.forEach(elem => {
          if (!nodos.has(elem.elemento)) {
            nodos.set(elem.elemento, {
              id: elem.elemento,
              tipo: 'elemento',
              nome: elem.elemento,
              tradicoes: [elem.tradicao],
              conexoes: [],
              energia: 0.8
            })
          }
          const nodo = nodos.get(elem.elemento)!
          if (!nodo.tradicoes.includes(elem.tradicao)) {
            nodo.tradicoes.push(elem.tradicao)
          }
        })
      })
    })

    return Array.from(nodos.values())
  }

  private identificarTraçosDominantes(grafo: GrafoNodo[]): TraçoDominante[] {
    return grafo
      .filter(n => n.tradicoes.length >= 3)
      .map(n => ({
        nome: n.nome,
        tradicoesConfirmam: n.tradicoes,
        descrição: `Padrão confirmado por ${n.tradicoes.length} tradições`,
        energia: n.energia
      }))
  }

  private identificarTraçosSombra(grafo: GrafoNodo[]): TraçoSombra[] {
    const bloqueios = grafo.filter(n => n.bloqueio)
    return bloqueios.map(n => ({
      nome: n.nome,
      tradicoesIndicam: n.tradicoes,
      causaProfunda: 'Bloqueio energético identificado',
      prácticaRecuperadora: 'Práticas de harmonização recomendadas'
    }))
  }

  private calcularCalendárioConvergência(): JanelaTemporal[] {
    const hoje = new Date()
    const janelas: JanelaTemporal[] = []

    // Calcular próximos 7 dias
    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje)
      data.setDate(data.getDate() + i)
      const diaSemana = data.getDay()

      const factores: string[] = []
      let pontuacao = 0

      if ([0, 6].includes(diaSemana)) {
        factores.push('Fim de semana - energia receptiva')
        pontuacao += 30
      }
      if (diaSemana === 4) {
        factores.push('Quinta-feira - Oxóssi')
        pontuacao += 40
      }
      if (diaSemana === 5) {
        factores.push('Sexta-feira - Oxum')
        pontuacao += 40
      }

      janelas.push({
        data,
        tipo: pontuacao >= 70 ? 'dupla' : pontuacao >= 40 ? 'simples' : 'neutra',
        factores,
        pontuacao,
        práticaRecomendada: pontuacao >= 70 ? 'Rituais importantes' : 'Práticas regulares'
      })
    }

    return janelas
  }

  private gerarRecomendações(traçosDominantes: TraçoDominante[], traçosSombra: TraçoSombra[]): Recomendação[] {
    const recomendações: Recomendação[] = []

    if (traçosDominantes.length > 0) {
      recomendações.push({
        tipo: 'meditação',
        título: 'Meditação de Integração',
        descrição: 'Conecte-se com seus traços dominantes através de meditação guiada',
        orixá: 'Oxalá',
        frequência: 'diária',
        período: 'manhã'
      })
    }

    if (traçosSombra.length > 0) {
      recomendações.push({
        tipo: 'ebó',
        título: 'Ritual de Harmonização',
        descrição: 'Prática de limpeza energética para integrar sombras',
        orixá: 'Ogum',
        frequência: 'semanal',
        período: 'terça-feira'
      })
    }

    return recomendações
  }

  private extrairTradiçõesConvergências(convergências: Convergence[]): string[] {
    const tradições = new Set<string>()
    convergências.forEach(c => {
      c.sistemas.forEach(s => tradições.add(s))
    })
    return Array.from(tradições)
  }

  private calcularQualidadeScore(insights: InsightSintese[]): number {
    if (insights.length === 0) return 0
    
    const médiaConfiança = insights.reduce((sum, i) => sum + i.confianca, 0) / insights.length
    const médiaPotencia = insights.filter(i => i.nivelPotencia !== 'neutra').length / insights.length
    
    return (médiaConfiança * 0.6 + médiaPotencia * 0.4) * 100
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const predictiveSynthesisEngine = new PredictiveSynthesisEngine()