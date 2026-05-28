'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/components/providers/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  
  const shouldShowSuccess = searchParams.get('registered') === 'true'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      await signIn(formData.email, formData.password)
      router.push('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Email ou senha incorretos'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {shouldShowSuccess && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm text-center">
            Conta criada com sucesso! Faça login para continuar.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#F8FAFC]">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#F8FAFC]">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
        >
          {isSubmitting ? 'Entrando...' : '✧ ENTRAR ✧'}
        </Button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md bg-[#0F172A] border-purple-500/20 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center gap-1 text-purple-400">
            {[...Array(7)].map((_, i) => (
              <span key={i} className="text-lg">✦</span>
            ))}
          </div>
          <CardTitle className="font-cinzel text-2xl text-[#F8FAFC]">
            CABALA DOS CAMINHOS
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Retorne ao seu caminho de luz
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="flex justify-center gap-1 text-purple-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg animate-pulse">✦</span>
                ))}
              </div>
            </div>
          }>
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center">
            <p className="text-[#94A3B8] text-sm">
              Novo aqui?{' '}
              <Link href="/registro" className="text-purple-400 hover:text-purple-300">
                Criar uma conta
              </Link>
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-1 text-purple-400/50">
            {[...Array(7)].map((_, i) => (
              <span key={i} className="text-xs">◯</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}