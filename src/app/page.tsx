'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { MysticButton } from '@/components/shared/MysticButton';
import { 
  Sparkles,
  Map,
  Hash,
  TreePine,
  Calendar,
  Star,
  ArrowRight,
  Menu,
  X,
  Heart,
  Users,
  Zap,
  BookOpen,
  Globe,
  CheckCircle2,
  Play,
  Lock
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Map,
    title: 'Mapa Natal Completo',
    description: 'Descubra seu caminho de vida através da astrologia cabalística e alinhamento cósmico.',
    color: 'amber',
  },
  {
    icon: Hash,
    title: '16 Odús do Ifá',
    description: 'Conecte-se com a ancestralidade africana e os古老的 wisdom dos Odús.',
    color: 'violet',
  },
  {
    icon: Star,
    title: 'Numerologia Cabalística',
    description: 'Calcule seu número de vida e desperte seu potencial através da numerologia sagrada.',
    color: 'gold',
  },
  {
    icon: TreePine,
    title: 'Árvore da Vida',
    description: 'Explore as 10 Sephiroth e os 22 caminhos que conectam essência e universo.',
    color: 'sacral',
  },
  {
    icon: Calendar,
    title: 'Calendário Energético',
    description: 'Sincronize suas ações com os ciclos cósmicos e energeticamente favoráveis.',
    color: 'root',
  },
];

const stats = [
  { value: '2.000+', label: 'Almas Despertas', icon: Users },
  { value: '16', label: 'Sistemas Místicos', icon: Zap },
  { value: '22', label: 'Caminhos da Cabala', icon: Globe },
  { value: '4.9', label: 'Avaliação Média', icon: Star },
];

const steps = [
  {
    step: '01',
    title: 'Cadastre-se',
    description: 'Crie sua conta gratuitamente em segundos',
    icon: Users,
    color: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    step: '02',
    title: 'Informe seus Dados',
    description: 'Data, hora e local de nascimento para análise precisa',
    icon: Calendar,
    color: 'from-violet-500/20 to-violet-600/20',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-400',
  },
  {
    step: '03',
    title: 'Receba seu Mapa',
    description: 'Análise completa personalizada do seu caminho espiritual',
    icon: Sparkles,
    color: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
];

const testimonials = [
  {
    name: 'Marina S.',
    location: 'São Paulo, BR',
    text: 'Descobri minha missão de vida através do mapa natal. A precisão das análises me surpreendeu.',
    rating: 5,
  },
  {
    name: 'Ricardo M.',
    location: 'Lisboa, PT',
    text: 'O alinhamento com os Odús me trouxe clareza em um momento de grande transição.',
    rating: 5,
  },
  {
    name: 'Ana C.',
    location: 'Buenos Aires, AR',
    text: 'Prático e profundo. O calendário energético mudou minha rotina profissional.',
    rating: 5,
  },
];

const navLinks = [
  { href: '#features', label: 'Recursos' },
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '/pricing', label: 'Preços' },
];

const chakraColors: Record<string, string> = {
  amber: 'text-amber-400',
  violet: 'text-violet-400',
  gold: 'text-amber-300',
  sacral: 'text-orange-400',
  root: 'text-red-400',
};

const chakraBgColors: Record<string, string> = {
  amber: 'from-amber-500/20 to-amber-600/20',
  violet: 'from-violet-500/20 to-violet-600/20',
  gold: 'from-amber-400/20 to-amber-500/20',
  sacral: 'from-orange-500/20 to-orange-600/20',
  root: 'from-red-500/20 to-red-600/20',
};

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isLoading]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <CosmicBackground variant="subtle">
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />
            <p className="text-slate-400 font-raleway">Carregando...</p>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <CosmicBackground variant="default">
      <div className="relative z-10 min-h-screen text-white scroll-smooth">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-amber-500/10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <Sparkles className="w-8 h-8 text-amber-400 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.8)] transition-all duration-300" />
                <span className="text-xl font-bold font-playfair text-amber-400 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-all duration-300">
                  Cabala dos Caminhos
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href.replace('#', ''))}
                    className="text-slate-300 hover:text-amber-400 transition-colors duration-300 font-raleway cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
                <MysticButton 
                  variant="outline" 
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Login
                </MysticButton>
                <Link href="/onboarding">
                  <MysticButton variant="golden" size="sm">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Começar
                  </MysticButton>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-300 hover:text-amber-400 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-amber-500/10">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollToSection(link.href.replace('#', ''))}
                      className="text-slate-300 hover:text-amber-400 transition-colors font-raleway py-2 text-left"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="flex flex-col gap-3 pt-2">
                    <MysticButton variant="outline" className="w-full justify-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Login
                    </MysticButton>
                    <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                      <MysticButton variant="golden" className="w-full justify-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Começar Agora
                      </MysticButton>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </header>

        {/* Hero Section - Enhanced */}
        <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center">
          {/* Animated particles background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-amber-400 rounded-full animate-twinkle opacity-60" />
            <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-twinkle opacity-40" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-yellow-300 rounded-full animate-twinkle opacity-50" style={{ animationDelay: '1s' }} />
            <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-amber-400 rounded-full animate-twinkle opacity-70" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-twinkle opacity-30" style={{ animationDelay: '0.3s' }} />
            <div className="absolute top-1/4 right-1/6 w-1 h-1 bg-amber-300 rounded-full animate-twinkle opacity-50" style={{ animationDelay: '0.8s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-amber-400 rounded-full animate-twinkle opacity-60" style={{ animationDelay: '1.2s' }} />
            <div className="absolute top-1/6 left-1/2 w-0.5 h-0.5 bg-violet-400 rounded-full animate-twinkle opacity-40" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-1/6 left-1/4 w-0.5 h-0.5 bg-emerald-400 rounded-full animate-twinkle opacity-50" style={{ animationDelay: '2.5s' }} />
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl animate-pulse-soft" aria-hidden="true" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} aria-hidden="true" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} aria-hidden="true" />

          <div className="container mx-auto relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Floating badge */}
              <div className="animate-fade-in-up opacity-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-500/30 mb-8 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] transition-shadow duration-500">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse-soft" />
                <span className="text-amber-300 text-sm font-raleway font-medium">
                  Tecnologia Sagrada de Alinhamento
                </span>
              </div>

              {/* Main heading */}
              <Heading 
                variant="display" 
                glow="gold" 
                className="mb-6 animate-fade-in-up opacity-0"
                style={{ animationDelay: '100ms' }}
              >
                Desperte seu{' '}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 via-40% to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(212,175,55,0.6)]">
                  Mapa da Alma
                </span>
              </Heading>

              {/* Subtitle */}
              <p 
                className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto font-raleway animate-fade-in-up opacity-0 leading-relaxed"
                style={{ animationDelay: '200ms' }}
              >
                A tecnologia sagrada de alinhamento entre você e o cosmos. 
                Descubra seu caminho de vida através da{' '}
                <span className="text-amber-400 font-medium">Cabala</span>,{' '}
                <span className="text-violet-400 font-medium">Ifá</span> e{' '}
                <span className="text-emerald-400 font-medium">Astrologia</span>.
              </p>

              {/* Mystic Divider */}
              <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
                <MysticDivider variant="bold" className="mb-10 max-w-md mx-auto" />
              </div>

              {/* CTA Buttons */}
              <div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up opacity-0"
                style={{ animationDelay: '400ms' }}
              >
                <Link href="/onboarding">
                  <MysticButton 
                    variant="golden" 
                    size="lg"
                    className="text-lg px-10 h-14 shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.7)] transition-all duration-500 transform hover:scale-105 group"
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Criar Meu Mapa
                  </MysticButton>
                </Link>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="group flex items-center gap-3 px-8 h-14 text-lg font-raleway font-medium text-slate-300 hover:text-amber-400 transition-all duration-300"
                >
                  <span className="relative">
                    Ver Demonstração
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-transparent group-hover:w-full transition-all duration-500" />
                  </span>
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Social Proof Stats */}
              <div 
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in-up opacity-0"
                style={{ animationDelay: '600ms' }}
              >
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="group relative p-4 rounded-2xl bg-white/5 border border-amber-500/10 hover:border-amber-500/30 hover:bg-white/10 transition-all duration-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <stat.icon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-2xl sm:text-3xl font-bold font-playfair text-white">
                        {stat.value}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-400 font-raleway">
                        {stat.label}
                      </span>
                    </div>
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-amber-500/30 flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-amber-400/50 rounded-full animate-scroll-indicator" />
            </div>
          </div>
        </section>

        {/* Stats Section - Full Width */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-amber-500/10 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)]"
                >
                  <stat.icon className="w-8 h-8 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="block text-3xl sm:text-4xl font-bold font-playfair text-white mb-1">
                    {stat.value}
                  </span>
                  <span className="text-sm text-slate-400 font-raleway">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Heading variant="section" glow="gold" className="mb-4">
                Ferramentas de{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Transformação
                </span>
              </Heading>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-raleway">
                Explore as古老的 sabedorias unidas à tecnologia moderna para seu desenvolvimento espiritual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="card-spiritual group animate-fade-in-up hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${chakraBgColors[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]`}>
                      <feature.icon className={`w-7 h-7 ${chakraColors[feature.color]} group-hover:rotate-6 transition-transform duration-500`} />
                    </div>
                    <CardTitle className="text-xl font-playfair text-white group-hover:text-amber-300 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400 font-raleway group-hover:text-slate-300 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}

              {/* CTA Card */}
              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 md:col-span-2 lg:col-span-3 animate-fade-in-up group hover:shadow-[0_0_50px_rgba(212,175,55,0.2)] transition-all duration-500" style={{ animationDelay: '500ms' }}>
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold font-playfair text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                    Pronto para iniciar sua jornada?
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto font-raleway group-hover:text-slate-300 transition-colors duration-300">
                    Comece agora e descubra seu mapa astral completo com insights personalizados.
                  </p>
                  <Link href="/onboarding">
                    <MysticButton variant="golden" size="lg">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Criar Meu Mapa
                    </MysticButton>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section - Enhanced */}
        <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Heading variant="section" glow="gold" className="mb-4">
                Como{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Funciona
                </span>
              </Heading>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-raleway">
                Três passos simples para descobrir seu caminho espiritual
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="group relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-gradient-to-r from-amber-500/50 to-violet-500/50 z-0" />
                  )}
                  
                  {/* Step card */}
                  <div className="relative z-10 text-center p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-amber-500/20 hover:border-amber-500/40 hover:bg-white/[0.05] transition-all duration-500 hover:shadow-[0_0_50px_rgba(212,175,55,0.15)] group-hover:-translate-y-2 transition-transform duration-500">
                    {/* Step number badge */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} border-2 ${step.borderColor} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-500`}>
                      <span className="text-2xl font-bold text-white font-playfair drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {step.step}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500`}>
                      <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-3 font-playfair group-hover:text-amber-300 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 font-raleway group-hover:text-slate-300 transition-colors duration-300">
                      {step.description}
                    </p>

                    {/* Check mark for completion hint */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Heading variant="section" glow="gold" className="mb-4">
                O que dizem{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Nossos Usuários
                </span>
              </Heading>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-raleway">
                Histórias reais de transformação espiritual
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index}
                  className="card-spiritual group animate-fade-in-up hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6 pb-6">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-slate-300 font-raleway mb-6 leading-relaxed group-hover:text-white transition-colors duration-300">
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-400">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium font-raleway">
                          {testimonial.name}
                        </p>
                        <p className="text-slate-500 text-sm font-raleway">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-amber-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Heading variant="display" glow="gold" className="mb-6">
                Comece Sua Jornada Espiritual Hoje
              </Heading>
              <p className="text-xl text-slate-300 mb-10 font-raleway leading-relaxed">
                Milhares de pessoas já descobriram seu caminho. 
                Seja o próximo a despertar para sua verdadeira essência.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/onboarding">
                  <MysticButton 
                    variant="golden" 
                    size="lg"
                    className="text-lg px-10 h-14 shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.7)] transition-all duration-500"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Despertar Agora
                  </MysticButton>
                </Link>
                <Link href="/login">
                  <MysticButton 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-10 h-14"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Fazer Login
                  </MysticButton>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm font-raleway">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cadastro gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dados protegidos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-amber-500/10 bg-black/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-2 mb-4 group">
                  <Sparkles className="w-8 h-8 text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300" />
                  <span className="text-xl font-bold font-playfair text-amber-400 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-all duration-300">
                    Cabala dos Caminhos
                  </span>
                </Link>
                <p className="text-slate-400 font-raleway max-w-sm mb-4">
                  Tecnologia sagrada de alinhamento espiritual. Conectando você ao cosmos através da古老的 sabedoria.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/5 border border-amber-500/20 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 hover:bg-white/10 transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <BookOpen className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/5 border border-amber-500/20 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 hover:bg-white/10 transition-all duration-300"
                    aria-label="YouTube"
                  >
                    <Play className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-white font-semibold mb-4 font-playfair">Navegação</h4>
                <ul className="space-y-3">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <button
                        onClick={() => scrollToSection(link.href.replace('#', ''))}
                        className="text-slate-400 hover:text-amber-400 transition-colors font-raleway cursor-pointer"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                  <li>
                    <Link href="/calendario" className="text-slate-400 hover:text-amber-400 transition-colors font-raleway">
                      Calendário
                    </Link>
                  </li>
                  <li>
                    <Link href="/mapa" className="text-slate-400 hover:text-amber-400 transition-colors font-raleway">
                      Mapa Natal
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 font-playfair">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors font-raleway">
                      Privacidade
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-slate-400 hover:text-amber-400 transition-colors font-raleway">
                      Termos de Uso
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-amber-500/10 text-center">
              <p className="text-slate-500 font-raleway text-sm">
                © {new Date().getFullYear()} Cabala dos Caminhos. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>

        {/* Global styles for animations */}
        <style>{`
          @keyframes scroll-indicator {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.5;
            }
            50% {
              transform: translateY(6px);
              opacity: 1;
            }
          }
          
          .animate-scroll-indicator {
            animation: scroll-indicator 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </CosmicBackground>
  );
}
