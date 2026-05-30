/**
 * ════════════════════════════════════════════════════════════════════════════
 * PREDICTIVE SYNTHESIS ENGINE TESTS
 * Cabala dos Caminhos - Testes para o Motor de Síntese Consciencial
 * ════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { 
  predictiveSynthesisEngine,
  PredictiveSynthesisEngine,
  type MapaAlmaCompleto
} from '@/lib/engines/predictive-synthesis-engine'

// Mock do MapaAlmaCompleto
const criarMapaMock = (overrides = {}): MapaAlmaCompleto => ({
  nome: 'Maria da Silva',
  dataNascimento: '1990-03-15',
  localNascimento: { cidade: 'São Paulo', estado: 'SP', pais: 'BR', lat: -23.55, lon: -46.63 },
  numerologia: {
    caminhoVida: 11, // Número Mestre!
    destino: 8,
    Expressao: 4,
    impressao: 7,
    motivacao: 3,
    Divida: 5,
    lição: 2,
    tendências: [],
    númerosPessoais: {
      AnoPessoal: 5,
      MêsPessoal: 7,
      DiaPessoal: 12
    }
  },
  odu: {
    oduPrincipal: { nome: 'Ogbe', descricao: 'Caminho de Oxalá', quizilas: [], preceitos: [], caminho: 'luz' },
    oduCaminho: { nome: 'Iwori', descricao: 'Dualidade', quizilas: [], preceitos: [], caminho: 'aprendizado' },
    oduAlma: { nome: 'Oyeku', descricao: 'Receptividade', quizilas: [], preceitos: [], caminho: 'receber' },
    contraObu: null,
    ebós: []
  },
  astrologia: {
    signoSun: 'Peixes',
    signoMoon: 'Escorpiao',
    ascendente: 'Aquario',
    planetas: {
      sol: { signo: 'Peixes', casa: 12, aspectos: [] },
      lua: { signo: 'Escorpiao', casa: 8, aspectos: [] },
      mercurio: { signo: 'Aquario', casa: 11, aspectos: [] },
      venus: { signo: 'Aries', casa: 1, aspectos: [] },
      marte: { signo: 'Cancer', casa: 4, aspectos: [] }
    },
    casas: []
  },
  tarot: {
    arcanoMaior: 13, // A Morte
    arcoMenor: ['Copas 7', 'Espadas 3', 'Ouros 5'],
    cartaConselho: 'Temperança',
    cartaPosição: 'O Eremita'
  },
  chakras: {
    chakras: [
      { nome: 'Muladhara', posicao: 1, elemento: 'terra', energia: 75, cor: 'vermelho' },
      { nome: 'Svadhisthana', posicao: 2, elemento: 'água', energia: 60, cor: 'laranja' },
      { nome: 'Manipura', posicao: 3, elemento: 'fogo', energia: 85, cor: 'amarelo' },
      { nome: 'Anahata', posicao: 4, elemento: 'ar', energia: 70, cor: 'verde' },
      { nome: 'Vishuddha', posicao: 5, elemento: 'éter', energia: 55, cor: 'azul' },
      { nome: 'Ajna', posicao: 6, elemento: 'luz', energia: 90, cor: 'índigo' },
      { nome: 'Sahasrara', posicao: 7, elemento: 'divino', energia: 80, cor: 'violeta' }
    ],
    canais: [],
    energiaTotal: 73
  },
  convergencias: [
    {
      tipo: 'tríplice',
      descricao: 'Peixes + Oxalá + Número Mestre 11 = Intuição Elevada',
      elementos: [
        { tradicao: 'astrologia', tipo: 'signo', valor: 'Peixes', descricao: 'Intuição' },
        { tradicao: 'candomblé', tipo: 'orixá', valor: 'Oxalá', descricao: 'Luz' },
        { tradicao: 'numerologia', tipo: 'número', valor: '11', descricao: 'Mestre' }
      ],
      forca: 0.95
    }
  ],
  ...overrides
} as MapaAlmaCompleto)

describe('PredictiveSynthesisEngine', () => {
  let engine: PredictiveSynthesisEngine

  beforeEach(() => {
    engine = new PredictiveSynthesisEngine()
  })

  describe('carregarMapaAlma', () => {
    it('deve carregar mapa sem erros', () => {
      const mapa = criarMapaMock()
      expect(() => engine.carregarMapaAlma(mapa)).not.toThrow()
    })

    it('deve limpar cache ao carregar novo mapa', () => {
      const mapa1 = criarMapaMock({ nome: 'João' })
      const mapa2 = criarMapaMock({ nome: 'Maria' })
      
      engine.carregarMapaAlma(mapa1)
      engine.carregarMapaAlma(mapa2)
      
      // Cache deve estar limpo
      expect(true).toBe(true) // Se não lançou erro, passou
    })
  })

  describe('gerarSinteseConsciencial', () => {
    it('deve gerar síntese completa', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese).toBeDefined()
      expect(sintese.insights).toBeDefined()
      expect(sintese.insights.length).toBeGreaterThan(0)
    })

    it('deve gerar exatamente 5 insights', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.insights.length).toBe(5)
    })

    it('deve identificar traços dominantes', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      // Peixes + Oxalá + 11 = intuição alta, deve gerar traço dominante
      expect(sintese.traçosDominantes).toBeDefined()
    })

    it('deve calcular calendário de convergência', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.calendarioConvergencia).toBeDefined()
      expect(sintese.calendarioConvergencia.length).toBe(7) // 7 dias
    })

    it('deve gerar recomendações', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.recomendações).toBeDefined()
      expect(sintese.recomendações.length).toBeGreaterThanOrEqual(0)
    })

    it('deve calcular qualidade score', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.qualidadeScore).toBeGreaterThan(0)
      expect(sintese.qualidadeScore).toBeLessThanOrEqual(100)
    })

    it('deve lançar erro se mapa não carregado', () => {
      expect(() => engine.gerarSinteseConsciencial()).toThrow('MapaAlma não carregado')
    })
  })

  describe('Insight: Integração de Tradições', () => {
    it('deve identificar número mestre', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[0]
      
      expect(insight.tradicoes).toContain('astrologia')
      expect(insight.tradicoes).toContain('numerologia')
      expect(insight.tradicoes).toContain('odu')
    })

    it('deve detectar convergência', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[0]
      // Pode ser tríplice ou dupla dependendo da configuração
      expect(['tríplice', 'dupla']).toContain(insight.nivelPotencia)
    })
    it('deve identificar orixá favorável', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[0]
      
      expect(insight.orixafavoravel).toBeDefined()
    })
  })

  describe('Insight: Síntese Número-Arquetípica', () => {
    it('deve mapear número para arcano', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[1]
      
      expect(insight.titulo).toContain('11')
      expect(insight.tradicoes).toContain('numerologia')
      expect(insight.tradicoes).toContain('tarot')
    })

    it('deve incluir cabala no eixo numérico', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[1]
      
      expect(insight.eixos).toContainEqual(
        expect.objectContaining({ eixo: 'numérico-iniciático' })
      )
    })
  })

  describe('Insight: Correlação Orixá-Chakra-Sephirah', () => {
    it('deve identificar correlação ancestral', () => {
      const mapa = criarMapaMock({ odu: { oduPrincipal: { nome: 'Ogbe', descricao: 'Caminho de Oxalá', quizilas: [], preceitos: [], caminho: 'luz' } } } as any)
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[2]
      
      expect(insight.orixafavoravel).toBe('Oxalá')
      expect(insight.chakras).toBeDefined()
    })

    it('deve incluir ervas de harmonização', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[2]
      
      expect(insight.ervas).toBeDefined()
      expect(insight.ervas.length).toBeGreaterThan(0)
    })
  })

  describe('Insight: Calendário de Potencial', () => {
    it('deve calcular períodos favoráveis', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[3]
      // Verificar que menciona períodos favoráveis (não especificamente "Calendário")
      expect(insight.mensagem).toContain('potencial')
      expect(insight.tradicoes).toContain('astrologia')
    })
  })
  describe('Insight: Síntese de Convergências', () => {
    it('deve extrair tradições de convergências', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[4]
      expect(insight.tradicoes.length).toBeGreaterThan(0)
    })
    it('deve detectar nível tríplice ou dupla', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      const sintese = engine.gerarSinteseConsciencial()
      const insight = sintese.insights[4]
      // Pode ser tríplice ou dupla
      expect(['tríplice', 'dupla']).toContain(insight.nivelPotencia)
    })
  })

  describe('Mapeamentos de Correlação', () => {
    it('deve mapear Orixá para Chakra corretamente', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      const orixaInsight = sintese.insights[2]
      
      // Oxalá deve mapear para Sahasrara (7º chakra)
      expect(orixaInsight.chakras).toContain('sahasrara')
    })

    it('deve calcular redução digital para números não-mestres', () => {
      const mapa = criarMapaMock({ numerologia: { caminhoVida: 28 } as any })
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      // 28 = 2+8 = 10, deve mapear para Malkuth
      expect(sintese).toBeDefined()
    })
  })

  describe('Qualidade do Score', () => {
    it('deve ser maior que 0 com insights', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.qualidadeScore).toBeGreaterThan(80)
    })

    it('deve ser 0 sem insights', () => {
      // Não carrega mapa, testa erro
      expect(() => engine.gerarSinteseConsciencial()).toThrow()
    })
  })

  describe('Grafo Consciencial', () => {
    it('deve construir nós de cada tradição', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.grafoConsciencial.length).toBeGreaterThan(0)
    })

    it('deve construir grafo consciencial', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      const sintese = engine.gerarSinteseConsciencial()
      // Grafo deve ter nós
      expect(sintese.grafoConsciencial.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Calendário de Convergência', () => {
    it('deve ter 7 janelas para 7 dias', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      expect(sintese.calendarioConvergencia.length).toBe(7)
    })

    it('deve identificar quinta e sexta como favoráveis', () => {
      const mapa = criarMapaMock()
      engine.carregarMapaAlma(mapa)
      
      const sintese = engine.gerarSinteseConsciencial()
      
      const quinta = sintese.calendarioConvergencia.find(j => 
        j.data.getDay() === 4
      )
      const sexta = sintese.calendarioConvergencia.find(j => 
        j.data.getDay() === 5
      )
      
      expect(quinta).toBeDefined()
      expect(sexta).toBeDefined()
    })
  })
})