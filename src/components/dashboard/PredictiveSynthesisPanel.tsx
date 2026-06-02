// fallow-ignore-file unused-file
/**
 * ════════════════════════════════════════════════════════════════════════════
 * PREDICTIVE SYNTHESIS PANEL
 * Cabala dos Caminhos - Componente de Insights Preditivos de Síntese
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Propósito: Exibir insights de síntese consciencial profunda em um
 * painel unificado, substituindo múltiplos widgets fragmentados.
 * 
 * Versão: 1.0.0
 * Data: 2026-05-30
 * ════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useState, useEffect } from 'react'
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Heart, 
  Brain, 
  Eye,
  Star,
  Zap,
  Shield,
  Flame
} from 'lucide-react'
import { 
  predictiveSynthesisEngine, 
  type InsightSintese,
  type SinteseConsciencial,
  type TraçoDominante,
  type TraçoSombra
} from '@/lib/engines/predictive-synthesis-engine'
import { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma'
// fallow-ignore-next-line unresolved-import
import { GlowEffect } from '@/components/shared/GlowEffect'

// ============================================================================
// ICONES MÍSTICOS
// ============================================================================

const EixoIcones = {
  'cósmico-vibracional': <Sparkles className="w-5 h-5" />,
  'numérico-iniciático': <Brain className="w-5 h-5" />,
  'árvore-vida': <Star className="w-5 h-5" />,
  'força-ancestral': <Heart className="w-5 h-5" />
}

const PotenciaBadge = {
  'tríplice': { cor: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'TRÍPLICE' },
  'dupla': { cor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'DUPLA' },
  'simples': { cor: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'SIMPLES' },
  'neutra': { cor: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: 'NEUTRA' }
}

// ============================================================================
// COMPONENTES INTERNOS
// ============================================================================

interface InsightCardProps {
  insight: InsightSintese
  index: number
}

// fallow-ignore-next-line complexity
const InsightCard: React.FC<InsightCardProps> = ({ insight, index }) => {
  const [expandido, setExpandido] = useState(false)
  const badge = PotenciaBadge[insight.nivelPotencia]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <GlowEffect intensity="low" color="purple" className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              {EixoIcones[insight.eixos[0]?.eixo || 'cósmico-vibracional']}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{insight.titulo}</h3>
              <p className="text-sm text-purple-400">{insight.tradicoes.join(' + ')}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.cor}`}>
            {badge.label}
          </span>
        </div>

        {/* Mensagem Principal */}
        <p className="text-gray-300 mb-4 leading-relaxed">
          {insight.mensagem}
        </p>

        {/* Aplicação Prática */}
        {insight.aplicacaoPratica && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Prática Espiritual</span>
            </div>
            <p className="text-sm text-amber-200/80">{insight.aplicacaoPratica}</p>
          </div>
        )}

        {/* Elementos Correlacionados */}
        <AnimatePresence>
          {expandido && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-purple-500/20">
                {insight.orixafavoravel && (
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <span className="text-xs text-orange-400">Orixá</span>
                    <p className="text-white font-medium">{insight.orixafavoravel}</p>
                  </div>
                )}
                {insight.chakras?.map(chakra => (
                  <div key={chakra} className="p-3 rounded-lg bg-green-500/10">
                    <span className="text-xs text-green-400">Chakra</span>
                    <p className="text-white font-medium capitalize">{chakra}</p>
                  </div>
                ))}
                {insight.ervas?.map(erva => (
                  <div key={erva} className="p-3 rounded-lg bg-emerald-500/10">
                    <span className="text-xs text-emerald-400">Erva</span>
                    <p className="text-white font-medium capitalize">{erva}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Expandido */}
        <button
          onClick={() => setExpandido(!expandido)}
          className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          {expandido ? '↑ Menos detalhes' : '↓ Mais detalhes'}
        </button>

        {/* Confiança */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-gray-700 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${insight.confianca * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {Math.round(insight.confianca * 100)}% confiança
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface PredictiveSynthesisPanelProps {
  mapaAlma: MapaAlmaCompleto | null
  className?: string
}

// fallow-ignore-next-line complexity
export const PredictiveSynthesisPanel: React.FC<PredictiveSynthesisPanelProps> = ({
  mapaAlma,
  className = ''
}) => {
  const [sintese, setSintese] = useState<SinteseConsciencial | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'insights' | 'traços' | 'calendário'>('insights')

  // Gerar síntese quando mapaAlma mudar
  useEffect(() => {
    if (mapaAlma) {
      setLoading(true)
      try {
        predictiveSynthesisEngine.carregarMapaAlma(mapaAlma)
        const result = predictiveSynthesisEngine.gerarSinteseConsciencial()
        setSintese(result)
      } catch (error) {
        console.error('Erro ao gerar síntese:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [mapaAlma])

  // Loading state
  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-purple-400">Gerando Síntese Consciencial...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sem dados
  if (!sintese || !mapaAlma) {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Sparkles className="w-16 h-16 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Síntese Consciencial</h3>
            <p className="text-gray-400">
              Complete seu Mapa do Alma para receber insights de síntese profunda
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Síntese Consciencial</h2>
              <p className="text-sm text-gray-400">
                Insights de alta correlação entre tradições
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">
              Score: {Math.round(sintese.qualidadeScore)}%
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['insights', 'traços', 'calendário'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800/50 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {tab === 'insights' && <Sparkles className="w-4 h-4 inline mr-2" />}
              {tab === 'traços' && <Eye className="w-4 h-4 inline mr-2" />}
              {tab === 'calendário' && <Calendar className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4"
          >
            {sintese.insights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </motion.div>
        )}

        {activeTab === 'traços' && (
          <motion.div
            key="traços"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-6"
          >
            {/* Traços Dominantes */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Traços Dominantes
                <span className="text-xs text-gray-400">Confirmados por 3+ tradições</span>
              </h3>
              <div className="grid gap-3">
                {sintese.traçosDominantes.length > 0 ? (
                  sintese.traçosDominantes.map((traço, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{traço.nome}</h4>
                        <span className="text-xs text-green-400">
                          {traço.tradicoesConfirmam.length} tradições
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{traço.descrição}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Nenhum traço dominante identificado ainda
                  </p>
                )}
              </div>
            </div>

            {/* Traços de Sombra */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                <Eye className="w-5 h-5 text-purple-400" />
                Traços de Sombra
                <span className="text-xs text-gray-400">Bloqueios identificados</span>
              </h3>
              <div className="grid gap-3">
                {sintese.traçosSombra.length > 0 ? (
                  sintese.traçosSombra.map((traço, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{traço.nome}</h4>
                        <span className="text-xs text-purple-400">Sombra</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{traço.causaProfunda}</p>
                      <p className="text-sm text-amber-400 italic">{traço.prácticaRecuperadora}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Nenhum traço de sombra identificado ainda
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'calendário' && (
          <motion.div
            key="calendário"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Calendar className="w-5 h-5 text-blue-400" />
              Calendário de Convergência
              <span className="text-xs text-gray-400">Próximos 7 dias</span>
            </h3>
            <div className="grid gap-3">
              {sintese.calendarioConvergencia.map((janela, index) => {
                const badge = PotenciaBadge[janela.tipo]
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-800/50 border border-gray-700/50 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {janela.data.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${badge.cor}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {janela.factores.map((factor, i) => (
                        <p key={i} className="text-sm text-gray-400 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {factor}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Potência: {janela.pontuacao}%
                      </span>
                      <span className="text-sm text-blue-400">{janela.práticaRecomendada}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between text-sm text-gray-500">
        <span>Última atualização: {sintese.timestamp.toLocaleString('pt-BR')}</span>
        <span>{sintese.insights.length} insights gerados</span>
      </div>
    </div>
  )
}

export default PredictiveSynthesisPanel