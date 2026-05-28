'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/SupabaseProvider'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/(dashboard)')
    }
  }, [user, isLoading, router])

  const showLoader = isLoading || (user === null && typeof window !== 'undefined')

  if (showLoader) {
    return (
      <main className="min-h-screen bg-mystic-gradient flex items-center justify-center">
        <div className="flex justify-center gap-2 text-primary">
          {[...Array(7)].map((_, i) => (
            <span key={i} className="text-2xl animate-pulse">✦</span>
          ))}
        </div>
      </main>
    )
  }

  if (user) {
    return null
  }

  return (
    <main className="min-h-screen bg-mystic-gradient flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="flex justify-center gap-2 text-primary">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">✦</span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-cinzel text-text-primary tracking-wider">
            CABALA DOS CAMINHOS
          </h1>
          
          <p className="text-lg text-text-secondary font-cormorant">
            Autoconhecimento espiritual unificado
          </p>
          
          <div className="flex justify-center gap-2 text-primary">
            {[...Array(7)].map((_, i) => (
              <span key={i} className="text-xl">◯</span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-text-secondary font-raleway">
            Descubra sua jornada espiritual através da integração de múltiplas tradições:
            Cabala, Numerologia, Astrologia, Tarot, Candomblé e Umbanda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/registro">
            <Button className="w-full sm:w-auto px-8 py-6 text-lg font-raleway">
              ✧ INICIAR JORNADA ✧
            </Button>
          </Link>
          
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg font-raleway">
              Já possui conta
            </Button>
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-text-secondary font-raleway">
            Explore seu mapa natal, odús de nascimento e ciclos temporais
          </p>
        </div>
      </div>
    </main>
  )
}