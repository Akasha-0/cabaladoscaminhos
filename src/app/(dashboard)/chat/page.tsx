'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { getCorrespondenciasDia } from '@/lib/data/spiritual-data';
import { useCreditos } from '@/lib/hooks/useCreditos';
import {
  Send,
  Sparkles,
  Heart,
  Briefcase,
  Banknote,
  HeartPulse,
  Sparkle,
  Target,
  HelpCircle,
  User,
  Bot,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { TemaChat, MensagemChat } from '@/lib/chat/types';

interface Mensagem {
  id: string;
  tipo: 'usuario' | 'assistente';
  conteudo: string;
  tema?: string;
  timestamp: Date;
}

const temas = [
  { id: 'relacionamento' as TemaChat, label: 'Relacionamentos', icon: Heart, cor: 'text-pink-400' },
  { id: 'trabalho' as TemaChat, label: 'Trabalho', icon: Briefcase, cor: 'text-blue-400' },
  { id: 'dinheiro' as TemaChat, label: 'Dinheiro', icon: Banknote, cor: 'text-green-400' },
  { id: 'saude' as TemaChat, label: 'Saúde', icon: HeartPulse, cor: 'text-red-400' },
  { id: 'espiritualidade' as TemaChat, label: 'Espiritualidade', icon: Sparkle, cor: 'text-purple-400' },
  { id: 'proposito' as TemaChat, label: 'Propósito', icon: Target, cor: 'text-amber-400' },
  { id: 'outros' as TemaChat, label: 'Outros', icon: HelpCircle, cor: 'text-gray-400' },
];

const CUSTO_MENSAGEM = 2;

const mensagensIniciais: Mensagem[] = [
  {
    id: '1',
    tipo: 'assistente',
    conteudo: 'Olá! Sou seu guia espiritual na Cabala dos Caminhos.\n\nEstou aqui para oferecer orientações baseadas na tradição esotérica, alinhando suas energia atuais com sabedorias ancestrais.\n\nComo posso iluminar seu caminho hoje?',
    tema: 'saudacao',
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais);
  const [input, setInput] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState<TemaChat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { dia } = getCorrespondenciasDia();
  const { saldo, temCreditosSuficientes, recarregar } = useCreditos();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  const handleEnviar = async () => {
    if (!input.trim()) return;

    if (!temaSelecionado) {
      setErro('Por favor, selecione um tema antes de enviar sua pergunta.');
      return;
    }

    setErro(null);

    const mensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      tipo: 'usuario',
      conteudo: input,
      tema: temaSelecionado,
      timestamp: new Date(),
    };

    setMensagens(prev => [...prev, mensagemUsuario]);
    const perguntaOriginal = input;
    setInput('');
    setIsLoading(true);

    if (demoMode || !temCreditosSuficientes(CUSTO_MENSAGEM)) {
      setTimeout(() => {
        const respostaSistema: Mensagem = {
          id: (Date.now() + 1).toString(),
          tipo: 'assistente',
          conteudo: `Entendo sua busca por orientação sobre ${temaSelecionado}.\n\nA energia do ${dia.dia} traz influências de ${dia.planetas.join(' e ')}, regidos por ${dia.orixas.join(' e ')}.\n\nNeste momento, o número tântrico do dia é ${dia.numTantrico.split(' ')[0]}. Este número está relacionado ao arcano ${dia.arcano.split('/')[0].trim()}.\n\nPara uma orientação mais precisa, recomendo que:\n\n• Medite sobre a energia do dia\n• Observe seus pensamentos ao acordar\n• Pratique o mantram relacionado ao Chakra ${dia.chakras[0].split('º')[0]}º\n\nAguardo sua próxima pergunta. 🕯️`,
          timestamp: new Date(),
        };

        setMensagens(prev => [...prev, respostaSistema]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    try {
      const historico: MensagemChat[] = mensagens.slice(1).map(m => ({
        id: m.id,
        tipo: m.tipo as 'usuario' | 'assistente',
        conteudo: m.conteudo,
        tema: m.tema as TemaChat,
        timestamp: m.timestamp,
      }));

      const response = await fetch('/api/chat/mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: perguntaOriginal,
          tema: temaSelecionado,
          historico,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      const respostaSistema: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'assistente',
        conteudo: data.resposta,
        tema: temaSelecionado,
        timestamp: new Date(),
      };

      setMensagens(prev => [...prev, respostaSistema]);
      recarregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao processar sua mensagem');
      setMensagens(prev => prev.filter(m => m.id !== mensagemUsuario.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const temSaldoSuficiente = temCreditosSuficientes(CUSTO_MENSAGEM);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cinzel text-primary tracking-wide">
              Consulta Espiritual
            </h1>
            <p className="text-muted-foreground font-raleway mt-1">
              Diálogo oracular guiado pela tradição • Custo: {CUSTO_MENSAGEM} créditos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
              {saldo} créditos
            </Badge>
            {!temSaldoSuficiente && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDemoMode(true)}
                className="text-xs"
              >
                Usar Demo
              </Button>
            )}
          </div>
        </div>

        {erro && (
          <Card className="border-red-500/50 bg-red-950/20">
            <CardContent className="flex items-center gap-2 py-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400 font-raleway">{erro}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Selecione um Tema
            </CardTitle>
            <CardDescription className="font-raleway">
              Clique em um tema para contextualizar sua consulta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {temas.map((tema) => {
                const Icone = tema.icon;
                return (
                  <Button
                    key={tema.id}
                    variant={temaSelecionado === tema.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTemaSelecionado(tema.id === temaSelecionado ? null : tema.id)}
                    className={`font-raleway text-xs ${temaSelecionado === tema.id ? '' : tema.cor}`}
                  >
                    <Icone className="w-4 h-4 mr-1" />
                    {tema.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 flex flex-col h-[500px]">
          <CardHeader className="pb-2 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-cinzel text-primary">
                    Guia Espiritual
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Online • Respondendo em nome da tradição
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {temaSelecionado
                  ? temas.find(t => t.id === temaSelecionado)?.label
                  : 'Sem tema'}
              </Badge>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.tipo === 'usuario' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.tipo === 'usuario'
                      ? 'bg-gradient-to-br from-indigo-500/30 to-blue-500/30'
                      : 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30'
                  }`}>
                    {msg.tipo === 'usuario'
                      ? <User className="w-4 h-4 text-blue-400" />
                      : <Bot className="w-4 h-4 text-purple-400" />
                    }
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    msg.tipo === 'usuario'
                      ? 'bg-indigo-950/50 border border-indigo-500/30'
                      : 'bg-card border border-border/50'
                  }`}>
                    <p className="text-sm font-raleway whitespace-pre-wrap leading-relaxed">
                      {msg.conteudo}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="bg-card border border-border/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-raleway">Consultando a tradição...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <Separator className="bg-border/30" />

          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                className="min-h-[60px] resize-none font-raleway bg-background/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleEnviar}
                disabled={!input.trim() || isLoading}
                className="self-end h-[60px] px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💎 Custo desta resposta: {CUSTO_MENSAGEM} créditos • Enter para enviar, Shift+Enter para nova linha
            </p>
            {!temSaldoSuficiente && !demoMode && (
              <p className="text-xs text-amber-400 mt-1 text-center">
                Créditos insuficientes. Clique em &quot;Usar Demo&quot; para testar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}