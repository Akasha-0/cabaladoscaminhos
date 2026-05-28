'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegistroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    password: '',
    confirmPassword: '',
    dataNascimento: '',
    horaNascimento: '',
    localNascimento: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)
    
    try {
      await signUp(formData.email, formData.password, {
        nomeCompleto: formData.nomeCompleto,
        dataNascimento: formData.dataNascimento,
        horaNascimento: formData.horaNascimento || undefined,
        localNascimento: formData.localNascimento || undefined
      })
      
      router.push('/login?registered=true')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
            Inicie sua jornada de autoconhecimento
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto" className="text-[#F8FAFC]">Nome Completo</Label>
              <Input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
                placeholder="Seu nome completo"
                required
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-[#F8FAFC]">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="horaNascimento" className="text-[#F8FAFC]">Hora (opcional)</Label>
                <Input
                  id="horaNascimento"
                  name="horaNascimento"
                  type="time"
                  value={formData.horaNascimento}
                  onChange={handleChange}
                  className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localNascimento" className="text-[#F8FAFC]">Local de Nascimento</Label>
              <Input
                id="localNascimento"
                name="localNascimento"
                type="text"
                value={formData.localNascimento}
                onChange={handleChange}
                className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
                placeholder="Cidade, Estado"
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
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#F8FAFC]">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-[#020617] border-purple-500/30 text-[#F8FAFC] focus:border-purple-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {isLoading ? 'Criando conta...' : '✧ INICIAR JORNADA ✧'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#94A3B8] text-sm">
              Já possui conta?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Fazer login
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