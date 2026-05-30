'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
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
  Heart
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

const navLinks = [
  { href: '/login', label: 'Login' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/calendario', label: 'Calendário' },
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

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
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
      <div className="relative z-10 min-h-screen text-white">
        {/* Header - Transparent over cosmic background */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-lg border-b border-amber-500/10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo with glow */}
              <Link href="/" className="flex items-center gap-2 group">
                <Sparkles className="w-8 h-8 text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300" />
                <span className="text-xl font-bold font-playfair text-amber-400 group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-all duration-300">
                  Cabala dos Caminhos
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-300 hover:text-amber-400 transition-colors font-raleway"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/onboarding">
                  <Button variant="golden" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Começar Agora
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-300 hover:text-amber-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-amber-500/10">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-slate-300 hover:text-amber-400 transition-colors font-raleway py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="golden" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Começar Agora
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-raleway">
                  Tecnologia Sagrada de Alinhamento
                </span>
              </div>

              {/* Title with Heading component */}
              <Heading 
                variant="display" 
                glow="gold" 
                className="mb-6"
              >
                Desperte seu{' '}
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 bg-clip-text text-transparent">
                  Mapa da Alma
                </span>
              </Heading>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-slate-300 mb-6 max-w-2xl mx-auto font-raleway">
                A tecnologia sagrada de alinhamento entre você e o cosmos. Descubra seu caminho de vida através da Cabala, Ifá e astrologia.
              </p>

              {/* Mystic Divider */}
              <MysticDivider variant="bold" className="mb-10" />

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/onboarding">
                  <Button variant="golden" size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Começar Agora
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 text-lg px-8 h-12"
                  onClick={scrollToFeatures}
                >
                  Conhecer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Social Proof */}
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-400">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span className="font-raleway">+2.000 almas despertas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="font-raleway">4.9/5 avaliações</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
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
                  className={`card-spiritual animate-fade-in-up group`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chakraBgColors[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${chakraColors[feature.color]}`} />
                    </div>
                    <CardTitle className="text-xl font-playfair text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400 font-raleway">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}

              {/* CTA Card */}
              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 md:col-span-2 lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="text-2xl font-bold font-playfair text-white mb-4">
                    Pronto para iniciar sua jornada?
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto font-raleway">
                    Comece agora e descubra seu mapa astral completo com insights personalizados.
                  </p>
                  <Link href="/onboarding">
                    <Button variant="golden">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Criar Meu Mapa
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Heading variant="section" glow="gold" className="mb-4">
                Como{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Funciona
                </span>
              </Heading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: '01', title: 'Cadastre-se', desc: 'Crie sua conta gratuitamente' },
                { step: '02', title: 'Informe seus dados', desc: 'Data, hora e local de nascimento' },
                { step: '03', title: 'Receba seu mapa', desc: 'Análise completa personalizada' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-amber-400 font-playfair">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-playfair">{item.title}</h3>
                  <p className="text-slate-400 font-raleway">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section with gradient overlay */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-amber-500/10" />
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Heading variant="display" glow="gold" className="mb-6">
                Comece Sua Jornada Espiritual Hoje
              </Heading>
              <p className="text-xl text-slate-300 mb-10 font-raleway">
                Milhares de pessoas já descobriram seu caminho. Seja o próximo a despertar para sua verdadeira essência.
              </p>
              <Link href="/onboarding">
                <Button variant="golden" size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Despertar Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-amber-500/10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                  <span className="text-xl font-bold font-playfair text-amber-400">
                    Cabala dos Caminhos
                  </span>
                </Link>
                <p className="text-slate-400 font-raleway max-w-sm">
                  Tecnologia sagrada de alinhamento espiritual. Conectando você ao cosmos através da古老的 sabedoria.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-white font-semibold mb-4 font-raleway">Navegação</h4>
                <ul className="space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-slate-400 hover:text-amber-400 transition-colors font-raleway">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 font-raleway">Legal</h4>
                <ul className="space-y-2">
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
      </div>
    </CosmicBackground>
  );
}