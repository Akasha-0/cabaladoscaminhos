'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  FileText,
  Calendar,
  Headphones,
  Star,
  Check,
  X,
  User,
} from 'lucide-react'

type Plan = {
  id: string
  name: string
  price: string
  priceNote?: string
  features: Array<{ text: string; included: boolean; icon?: React.ReactNode }>
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'gratuito',
    name: 'Plano Gratuito',
    price: 'Grátis',
    features: [
      { text: 'Mapa básico (Numerologia + Odu)', included: true, icon: <Star className="w-4 h-4" /> },
      { text: 'Sem IA insights', included: false, icon: <Sparkles className="w-4 h-4" /> },
      { text: 'Sem PDF', included: false, icon: <FileText className="w-4 h-4" /> },
      { text: 'Calendário energético', included: false, icon: <Calendar className="w-4 h-4" /> },
      { text: 'Prioridade no suporte', included: false, icon: <Headphones className="w-4 h-4" /> },
    ],
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 'R$ 47,90',
    priceNote: '/mês',
    popular: true,
    features: [
      { text: 'Mapa completo (todos os sistemas)', included: true, icon: <Star className="w-4 h-4" /> },
      { text: 'AI insights com OpenAI', included: true, icon: <Sparkles className="w-4 h-4" /> },
      { text: 'PDF download', included: true, icon: <FileText className="w-4 h-4" /> },
      { text: 'Calendário energético', included: true, icon: <Calendar className="w-4 h-4" /> },
      { text: 'Prioridade no suporte', included: true, icon: <Headphones className="w-4 h-4" /> },
    ],
  },
]

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserId(user.id || user.userId || null)
      } catch {
        setUserId(null)
      }
    }
    setLoading(false)
  }, [])

  const handleCheckout = async (planoId: string) => {
    if (!userId) return
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planoId }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-amber-500/50">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-amber-500 mb-4"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
          >
            ✦ Escolha teu Caminho ✦
          </h1>
          <p className="text-slate-400 text-lg">
            Assine um plano para desbloquear insights espirituais com IA avançada
          </p>
        </div>

        {!userId ? (
          <Card className="max-w-md mx-auto bg-slate-800 border-slate-700">
            <CardContent className="pt-8 pb-8 text-center">
              <User className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h2 className="text-xl text-white mb-2">Conecte-se para assinar</h2>
              <p className="text-slate-400 mb-6">
                Faça login para escolher um plano e desbloquear todo o potencial da Cabala dos Caminhos.
              </p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-slate-800 border-slate-700 flex flex-col ${
                  plan.popular ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-slate-900 font-semibold px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    <span className="text-4xl font-bold text-amber-500">{plan.price}</span>
                    {plan.priceNote && (
                      <span className="text-slate-500 text-sm ml-1">{plan.priceNote}</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            feature.included
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-700 text-slate-600'
                          }`}
                        >
                          {feature.included ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </span>
                        <span
                          className={`flex items-center gap-2 ${
                            feature.included ? 'text-slate-200' : 'text-slate-500'
                          }`}
                        >
                          {feature.icon}
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    onClick={() => handleCheckout(plan.id)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                    size="lg"
                  >
                    Assinar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
