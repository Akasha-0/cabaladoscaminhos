"use client";

/**
 * DailyReflectionCard — Wave 25
 * ============================================================================
 * Card mobile-first (funciona em 360px) que exibe o convite de reflexão do
 * dia. Tom: acolhimento, jamais instrução.
 *
 * COMPORTAMENTO:
 *   - Ao montar: chama GET /api/daily-reflection (sem cache local na primeira
 *     renderização — o Cache-Control HTTP cuida do cache no client)
 *   - Loading: skeleton com shimmer sutil (~400ms típico)
 *   - Error: mensagem amigável + botão "tentar novamente"
 *   - Sucesso: mostra o prompt com tom dourado (amber-500), ícone ✨
 *
 * Acessibilidade:
 *   - role="article" + aria-labelledby p/ leitor de tela
 *   - Contraste AA garantido (amber-700 sobre amber-50)
 *   - Tap target mínimo 44px (botão "refletir")
 *
 * Privacidade:
 *   - Não envia o texto digitado pelo usuário (isso é da JournalEntry,
 *     recurso separado)
 *   - O simples fato de "ver o card" já é registrado no servidor (DailyReflection)
 * ============================================================================
 */

import { useCallback, useEffect, useState } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------------
// Types (espelham o que a API retorna)
// ----------------------------------------------------------------------------

export interface DailyReflection {
  id: string;
  date: string;
  tradition: string;
  promptId: string;
  text: string;
  locale: string;
  source: string;
  caminhoDeVida?: number | null;
  cached?: boolean;
}

interface ApiError {
  error: string;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Nome amigável da tradição para o label do card. */
function traditionLabel(t: string): string {
  const map: Record<string, string> = {
    universal: "Reflexão de hoje",
    cabala: "Cabala",
    candomble: "Candomblé",
    umbanda: "Umbanda",
    ifa: "Ifá",
    tantra: "Tantra",
  };
  return map[t] ?? "Reflexão de hoje";
}

/** YYYY-MM-DD de hoje no fuso local (não UTC — é o que o usuário vê). */
function todayLocalDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function DailyReflectionCard() {
  const [data, setData] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const fetchReflection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/daily-reflection?date=${todayLocalDate()}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as Partial<ApiError>;
        if (res.status === 401) {
          setError("Entre na sua conta para ver sua reflexão diária.");
        } else {
          setError(body.error ?? `Erro ${res.status}`);
        }
        return;
      }
      const json = (await res.json()) as DailyReflection;
      setData(json);
    } catch (err) {
      setError("Não conseguimos carregar a reflexão agora. Tente novamente.");
      // log sem expor PII
      console.error("[DailyReflectionCard] fetch failed:", String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReflection();
  }, [fetchReflection, retryNonce]);

  // --------------------------------------------------------------------------
  // Render: Loading
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <Card
        className="w-full max-w-full border-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10"
        aria-busy="true"
        aria-label="Carregando reflexão do dia"
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-amber-300/40 animate-pulse" />
            <div className="h-3 w-32 rounded bg-amber-300/30 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-amber-300/20 animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-amber-300/20 animate-pulse" />
            <div className="h-3 w-3/5 rounded bg-amber-300/20 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Error
  // --------------------------------------------------------------------------
  if (error || !data) {
    return (
      <Card
        className="w-full max-w-full border-rose-500/20 bg-rose-50 dark:bg-rose-950/20"
        role="alert"
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <p className="text-sm text-rose-900 dark:text-rose-100 leading-relaxed">
              {error ?? "Reflexão indisponível no momento."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRetryNonce((n) => n + 1)}
            className="min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Tentar carregar reflexão novamente"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Success
  // --------------------------------------------------------------------------
  return (
    <Card
      className="w-full max-w-full border-amber-500/30 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 shadow-sm"
      role="article"
      aria-labelledby="daily-reflection-title"
    >
      <CardContent className="p-4 sm:p-5 space-y-3">
        <header className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
          <h2
            id="daily-reflection-title"
            className="text-xs uppercase tracking-wider font-medium"
          >
            {traditionLabel(data.tradition)}
          </h2>
          {data.tradition !== "universal" && (
            <span
              className="ml-auto text-[10px] uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70"
              aria-label="Convite, não instrução"
              title="Conteúdo é convite à reflexão, não instrução religiosa."
            >
              convite
            </span>
          )}
        </header>

        <p className="text-base sm:text-lg leading-relaxed text-amber-950 dark:text-amber-50 font-medium">
          {data.text}
        </p>

        <footer className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-amber-700/70 dark:text-amber-300/70">
            {new Date(data.date + "T00:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRetryNonce((n) => n + 1)}
            className="min-h-[44px] min-w-[44px] touch-manipulation text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 dark:text-amber-300 dark:hover:bg-amber-900/30"
            aria-label="Trocar reflexão de hoje"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Trocar
          </Button>
        </footer>
      </CardContent>
    </Card>
  );
}

export default DailyReflectionCard;