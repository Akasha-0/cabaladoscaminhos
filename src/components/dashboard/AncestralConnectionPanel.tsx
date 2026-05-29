'use client'

import React, { useState } from 'react'
import { Users, Heart, Leaf, Shield, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

interface AncestralConnectionPanelProps {
  userData?: {
    name?: string
    birthDate?: string
    orixaRegente?: string
  }
  className?: string
}

// Data based on IDEIA.md - Ancestral practices and connections
const ANCESTRAL_PRACTICES = [
  {
    name: 'Bori',
    description: 'Cerimônia de alimentação da cabeça (Ori) para fortalecer a conexão com os ancestrais',
    orixas: ['Oxalá', 'Nanã'],
    day: 'Sexta-feira',
    elements: ['Algodão', 'Canjica branca', 'Velas brancas'],
  },
  {
    name: 'Ebó de Ancestralidade',
    description: 'Oferenda para fortalecer a conexão com os mortos e guias espirituais',
    orixas: ['Omolu', 'Nanã', 'Iemanjá'],
    day: 'Segunda-feira',
    elements: ['Pipoca (Deburu)', 'Velas pretas', 'Flores brancas'],
  },
  {
    name: 'Guerra de Igb挡',
    description: 'Ritual de proteção contra demandas espirituais e limpeza de energias pesadas',
    orixas: ['Ogum', 'Iansã', 'Exu'],
    day: 'Terça-feira',
    elements: ['Espada-de-são-jorge', 'Guiné', 'Pinhão roxo'],
  },
  {
    name: 'Feitura de Ori',
    description: 'Cerimônia de confirmação/consagração do Ori (cabeça) com um Babalawo',
    orixas: ['Orunmilá', 'Oxalá'],
    day: 'Sexta-feira',
    elements: ['Kola', 'Dende', 'Velas brancas'],
  },
]

const ANCESTRAL_WARNINGS = [
  {
    title: 'Evite contato com Egum (mortos) em dias de quizila',
    description: 'Dias de Omolu (segunda) não são indicados para trabalho com Ancestral',
  },
  {
    title: 'Não faça ebó em dias de Oxum sem orientação',
    description: 'Oxum é muito exigente com a limpeza antes de receber oferendas',
  },
  {
    title: 'Respeite o tempo de descanso do Ori',
    description: 'Não force trabalho espiritual quando cansado ou doente',
  },
]

export function AncestralConnectionPanel({ userData, className = '' }: AncestralConnectionPanelProps) {
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null)
  const [showWarnings, setShowWarnings] = useState(false)

  return (
    <div className={`bg-gradient-to-br from-amber-950/50 to-orange-950/50 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-amber-100">Conexão Ancestral</h2>
          <p className="text-sm text-amber-200/60">Práticas e proteção espiritual</p>
        </div>
      </div>

      {/* User Orixá info */}
      {userData?.orixaRegente && (
        <div className="mb-6 p-4 bg-amber-900/20 rounded-lg border border-amber-600/20">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-200">Seu Orixá Regente</span>
          </div>
          <p className="text-lg font-medium text-amber-100">{userData.orixaRegente}</p>
        </div>
      )}

      {/* Practices Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-amber-200/80 uppercase tracking-wide">
          Práticas Recomendadas
        </h3>
        
        {ANCESTRAL_PRACTICES.map((practice, index) => (
          <div
            key={index}
            className="bg-amber-900/10 rounded-lg overflow-hidden border border-amber-600/10"
          >
            <button
              onClick={() => setExpandedPractice(expandedPractice === index ? null : index)}
              className="w-full p-4 flex items-center justify-between hover:bg-amber-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-amber-100">{practice.name}</span>
              </div>
              {expandedPractice === index ? (
                <ChevronUp className="w-5 h-5 text-amber-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-amber-400" />
              )}
            </button>
            
            {expandedPractice === index && (
              <div className="px-4 pb-4 border-t border-amber-600/10 pt-3">
                <p className="text-sm text-amber-200/80 mb-3">{practice.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-amber-400">Orixás:</span>
                    <span className="text-amber-200 ml-1">{practice.orixas.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Dia:</span>
                    <span className="text-amber-200 ml-1">{practice.day}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Elementos:</span>
                    <span className="text-amber-200 ml-1">{practice.elements.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warnings Section */}
      <div className="mt-6 pt-6 border-t border-amber-600/20">
        <button
          onClick={() => setShowWarnings(!showWarnings)}
          className="w-full flex items-center justify-between text-left hover:bg-amber-900/20 p-3 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-amber-100">Avisos Importantes</span>
          </div>
          {showWarnings ? (
            <ChevronUp className="w-5 h-5 text-amber-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-amber-400" />
          )}
        </button>
        
        {showWarnings && (
          <div className="mt-3 space-y-3">
            {ANCESTRAL_WARNINGS.map((warning, index) => (
              <div
                key={index}
                className="p-3 bg-red-900/10 rounded-lg border border-red-600/20"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-200">{warning.title}</p>
                    <p className="text-xs text-red-200/60 mt-1">{warning.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AncestralConnectionPanel