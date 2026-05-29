'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Sun,
  Moon,
  Bell,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

// Mock user data - in production this would come from auth context
const mockUser = {
  name: 'Maria Silva',
  email: 'maria.silva@email.com',
  memberSince: '2024-03-15',
  subscription: {
    plan: 'Premium',
    status: 'active',
    renewDate: '2025-06-15',
    price: 'R$ 29,90/mês'
  }
}

// Toggle component since we don't have Switch
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-violet-600' : 'bg-slate-600'}`}
      onChange={undefined}
    >
      <span
        className={`pointer-events-none inline-block size-5 shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        style={{ background: 'white', borderRadius: '50%' }}
      />
    </button>
  )
}

export default function ContaPage() {
  const { theme, toggleTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fbbf24', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={28} />
            Minha Conta
          </h1>
          <p style={{ color: '#94a3b8' }}>Gerencie suas informações e preferências</p>
        </div>

        {/* User Info Card */}
        <Card style={{ marginBottom: '1.5rem', background: '#1e293b', borderColor: '#334155' }}>
          <CardHeader>
            <CardTitle style={{ color: '#f1f5f9' }}>Informações Pessoais</CardTitle>
            <CardDescription style={{ color: '#94a3b8' }}>
              Seus dados de perfil
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {mockUser.name.charAt(0)}
              </div>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1.125rem' }}>{mockUser.name}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Membro desde {formatDate(mockUser.memberSince)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#0f172a', borderRadius: '0.5rem' }}>
              <Mail size={18} style={{ color: '#a855f7' }} />
              <span style={{ color: '#cbd5e1' }}>{mockUser.email}</span>
            </div>
            <Button variant="outline" style={{ marginTop: '0.5rem', borderColor: '#475569', color: '#e2e8f0' }}>
              <ChevronRight size={16} style={{ marginRight: '0.5rem' }} />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card style={{ marginBottom: '1.5rem', background: '#1e293b', borderColor: '#334155' }}>
          <CardHeader>
            <CardTitle style={{ color: '#f1f5f9' }}>Assinatura</CardTitle>
            <CardDescription style={{ color: '#94a3b8' }}>
              Informações do seu plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <p style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '1.125rem' }}>{mockUser.subscription.plan}</p>
                  <span style={{ background: '#059669', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>
                    Ativo
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{mockUser.subscription.price}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <Calendar size={16} />
              <span>Renovação: {formatDate(mockUser.subscription.renewDate)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" style={{ borderColor: '#475569', color: '#e2e8f0', width: '100%' }}>
              <ExternalLink size={16} style={{ marginRight: '0.5rem' }} />
              Gerenciar Assinatura (Stripe)
            </Button>
          </CardFooter>
        </Card>

        {/* Preferences Card */}
        <Card style={{ marginBottom: '1.5rem', background: '#1e293b', borderColor: '#334155' }}>
          <CardHeader>
            <CardTitle style={{ color: '#f1f5f9' }}>Preferências</CardTitle>
            <CardDescription style={{ color: '#94a3b8' }}>
              Personalize sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {theme === 'dark' ? <Moon size={20} style={{ color: '#a855f7' }} /> : <Sun size={20} style={{ color: '#fbbf24' }} />}
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: '500' }}>Tema</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {theme === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}
                  </p>
                </div>
              </div>
              <Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} label="Tema" />
            </div>

            <div style={{ height: '1px', background: '#334155' }} />

            {/* Notifications Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={20} style={{ color: '#a855f7' }} />
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: '500' }}>Notificações</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Receba alertas sobre rituais e previsões</p>
                </div>
              </div>
              <Toggle checked={notificationsEnabled} onChange={setNotificationsEnabled} label="Notificações" />
            </div>

            <div style={{ height: '1px', background: '#334155' }} />

            {/* Email Updates Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={20} style={{ color: '#a855f7' }} />
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: '500' }}>Atualizações por Email</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Newsletter semanal com insights</p>
                </div>
              </div>
              <Toggle checked={emailUpdates} onChange={setEmailUpdates} label="Email" />
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Link Card */}
        <Card style={{ marginBottom: '1.5rem', background: '#1e293b', borderColor: '#334155' }}>
          <CardHeader>
            <CardTitle style={{ color: '#f1f5f9' }}>Dados de Nascimento</CardTitle>
            <CardDescription style={{ color: '#94a3b8' }}>
              Atualize suas informações astrológicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Manter seus dados de nascimento atualizados garante insights mais precisos sobre seu mapa astral e previsões personalizadas.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" style={{ borderColor: '#475569', color: '#e2e8f0', width: '100%' }}>
              <ChevronRight size={16} style={{ marginRight: '0.5rem' }} />
              Atualizar Dados de Nascimento
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Cabala Dos Caminhos · © 2025
          </p>
        </div>
      </div>
    </div>
  )
}