'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Lightbulb,
  RefreshCw,
  Moon
} from 'lucide-react';
import { getDailyMessage } from '@/lib/guidance/daily-message';
import { cn } from '@/lib/utils';

export function DailyCosmicMessage() {
  const [copied, setCopied] = useState<string | null>(null);

  const dailyMessage = useMemo(() => getDailyMessage(), []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleShare = async () => {
    const text = `✨ Mensagem Cósmica do Dia - Cabala dos Caminhos\n\n${dailyMessage.faseLuaSimbolo} ${dailyMessage.faseLua} | Regente: ${dailyMessage.planetaRegente}\n\n💜 Afirmação: "${dailyMessage.afirmacao.texto}"\n    — ${dailyMessage.afirmacao.fonte}\n\n💡 Dica: ${dailyMessage.dica}\n\n🔮 Reflexão: ${dailyMessage.reflexao}\n\n#CabalaDosCaminhos #Espiritualidade #MensagemCósmica`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mensagem Cósmica do Dia',
          text: text
        });
      } catch {
        copyToClipboard(text, 'share');
      }
    } else {
      copyToClipboard(text, 'share');
    }
  };

  const shareText = `✨ Mensagem Cósmica do Dia\n\n${dailyMessage.faseLuaSimbolo} ${dailyMessage.faseLua} | Regente: ${dailyMessage.planetaRegente}\n\n💜 "${dailyMessage.afirmacao.texto}"\n\n💡 ${dailyMessage.dica}\n\n🔮 ${dailyMessage.reflexao}`;

  return (
    <Card className="bg-gradient-to-br from-indigo-950/60 via-card to-purple-950/40 border-indigo-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <CardTitle className="text-lg">Mensagem Cósmica do Dia</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-violet-500/20 text-violet-400 border-violet-500/40">
              <Moon className="w-3 h-3 mr-1" />
              {dailyMessage.faseLua}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Regente: {dailyMessage.planetaRegente}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Affirmation Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20">
              <Sparkles className="w-3 h-3 text-pink-400" />
            </div>
            <span className="font-medium text-pink-400">Afirmação</span>
            <button
              onClick={() => copyToClipboard(dailyMessage.afirmacao.texto, 'afirmacao')}
              className="ml-auto p-1 rounded hover:bg-muted/50 transition-colors"
              title="Copiar afirmação"
            >
              {copied === 'afirmacao' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
          <blockquote className="pl-4 border-l-2 border-pink-500/50 text-sm italic">
            <p className="text-foreground/90">&ldquo;{dailyMessage.afirmacao.texto}&rdquo;</p>
            <footer className="text-xs text-muted-foreground mt-1 not-italic">
              — {dailyMessage.afirmacao.fonte}
            </footer>
          </blockquote>
        </div>

        <Separator className="bg-indigo-500/20" />

        {/* Tip Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20">
              <Lightbulb className="w-3 h-3 text-amber-400" />
            </div>
            <span className="font-medium text-amber-400">Dica Espiritual</span>
            <button
              onClick={() => copyToClipboard(dailyMessage.dica, 'dica')}
              className="ml-auto p-1 rounded hover:bg-muted/50 transition-colors"
              title="Copiar dica"
            >
              {copied === 'dica' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-sm text-foreground/80 pl-8">{dailyMessage.dica}</p>
        </div>

        <Separator className="bg-indigo-500/20" />

        {/* Reflection Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20">
              <MessageCircle className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="font-medium text-cyan-400">Reflexão</span>
            <button
              onClick={() => copyToClipboard(dailyMessage.reflexao, 'reflexao')}
              className="ml-auto p-1 rounded hover:bg-muted/50 transition-colors"
              title="Copiar reflexão"
            >
              {copied === 'reflexao' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-sm text-foreground/80 pl-8">{dailyMessage.reflexao}</p>
        </div>

        <Separator className="bg-indigo-500/20" />

        {/* Share Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20",
              "hover:from-indigo-500/30 hover:to-purple-500/30",
              "border-indigo-500/40 text-indigo-300"
            )}
          >
            {copied === 'share' ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Compartilhar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}