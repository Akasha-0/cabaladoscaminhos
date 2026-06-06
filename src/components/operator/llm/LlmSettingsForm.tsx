'use client';

import { useState, useTransition } from 'react';
import { Cpu, Key, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveActiveOperatorLlmSetting, type SaveLlmSettingInput } from '@/lib/db/llm-settings-actions';

interface LlmSettingsFormProps {
  initialSettings: SaveLlmSettingInput;
}

export function LlmSettingsForm({ initialSettings }: LlmSettingsFormProps) {
  const [provider, setProvider] = useState<SaveLlmSettingInput['provider']>(initialSettings.provider);
  const [openaiKey, setOpenaiKey] = useState(initialSettings.openaiKey || '');
  const [openaiModel, setOpenaiModel] = useState(initialSettings.openaiModel || 'gpt-4o');
  const [minimaxKey, setMinimaxKey] = useState(initialSettings.minimaxKey || '');
  const [minimaxModel, setMinimaxModel] = useState(initialSettings.minimaxModel || 'minimax/m3');
  const [anthropicKey, setAnthropicKey] = useState(initialSettings.anthropicKey || '');
  const [anthropicModel, setAnthropicModel] = useState(initialSettings.anthropicModel || 'claude-3-5-sonnet');
  const [localEndpoint, setLocalEndpoint] = useState(initialSettings.localEndpoint || 'http://localhost:1234/v1');
  const [localModel, setLocalModel] = useState(initialSettings.localModel || 'meta-llama-3-8b-instruct');

  // Google Gemini
  const [geminiKey, setGeminiKey] = useState(initialSettings.geminiKey || '');
  const [geminiModel, setGeminiModel] = useState(initialSettings.geminiModel || 'gemini-1.5-flash');

  // Groq
  const [groqKey, setGroqKey] = useState(initialSettings.groqKey || '');
  const [groqModel, setGroqModel] = useState(initialSettings.groqModel || 'llama-3.3-70b-versatile');

  // DeepSeek
  const [deepseekKey, setDeepseekKey] = useState(initialSettings.deepseekKey || '');
  const [deepseekModel, setDeepseekModel] = useState(initialSettings.deepseekModel || 'deepseek-chat');

  // OpenRouter
  const [openrouterKey, setOpenrouterKey] = useState(initialSettings.openrouterKey || '');
  const [openrouterModel, setOpenrouterModel] = useState(initialSettings.openrouterModel || 'google/gemini-2.5-flash');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await saveActiveOperatorLlmSetting({
        provider,
        openaiKey: openaiKey || null,
        openaiModel,
        minimaxKey: minimaxKey || null,
        minimaxModel,
        anthropicKey: anthropicKey || null,
        anthropicModel,
        localEndpoint,
        localModel,
        geminiKey: geminiKey || null,
        geminiModel,
        groqKey: groqKey || null,
        groqModel,
        deepseekKey: deepseekKey || null,
        deepseekModel,
        openrouterKey: openrouterKey || null,
        openrouterModel,
      });

      if (!res.ok) {
        setError(res.error || 'Erro ao salvar configurações');
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Provider Selector */}
      <div className="space-y-2">
        <Label htmlFor="provider" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Provedor Ativo de LLM
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            { id: 'openai', label: 'OpenAI', icon: '🤖' },
            { id: 'minimax', label: 'Minimax', icon: '⚡' },
            { id: 'anthropic', label: 'Anthropic', icon: '🔮' },
            { id: 'local', label: 'IA Local', icon: '💻' },
            { id: 'gemini', label: 'Gemini', icon: '♊' },
            { id: 'groq', label: 'Groq', icon: '🚀' },
            { id: 'deepseek', label: 'DeepSeek', icon: '🐋' },
            { id: 'openrouter', label: 'OpenRouter', icon: '🌐' },
          ] as const).map((p) => {
            const active = provider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-cinzel transition-all ${
                  active
                    ? 'border-primary bg-primary/10 text-foreground font-bold shadow-md shadow-primary/5'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <span className="text-lg mb-1">{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Specific Inputs */}
      <div className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-4">
        {provider === 'openai' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="openaiKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Chave de API OpenAI
              </Label>
              <Input
                id="openaiKey"
                type="password"
                placeholder={openaiKey ? '••••••••••••••••••••' : 'Cole sua API Key (sk-...)'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground/60">
                Se deixado em branco, o sistema usará a chave definida nas variáveis de ambiente globais.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="openaiModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo OpenAI
              </Label>
              <Input
                id="openaiModel"
                placeholder="Ex: gpt-4o, gpt-4o-mini"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'minimax' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="minimaxKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Token de API Minimax
              </Label>
              <Input
                id="minimaxKey"
                type="password"
                placeholder={minimaxKey ? '••••••••••••••••••••' : 'Cole seu Token de API'}
                value={minimaxKey}
                onChange={(e) => setMinimaxKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minimaxModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo Minimax
              </Label>
              <Input
                id="minimaxModel"
                placeholder="Ex: minimax/m3"
                value={minimaxModel}
                onChange={(e) => setMinimaxModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'anthropic' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="anthropicKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Chave de API Anthropic
              </Label>
              <Input
                id="anthropicKey"
                type="password"
                placeholder={anthropicKey ? '••••••••••••••••••••' : 'Cole sua API Key (sk-ant-...)'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="anthropicModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo Anthropic (Claude)
              </Label>
              <Input
                id="anthropicModel"
                placeholder="Ex: claude-3-5-sonnet, claude-3-haiku"
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'local' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="localEndpoint" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-secondary" /> Endpoint da API Local
              </Label>
              <Input
                id="localEndpoint"
                placeholder="Ex: http://localhost:1234/v1"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground/60">
                URL base do servidor compatível com OpenAI (LM Studio, Ollama, LocalAI).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="localModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                ID do Modelo Local
              </Label>
              <Input
                id="localModel"
                placeholder="Ex: meta-llama-3-8b-instruct, qwen-14b"
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'gemini' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="geminiKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Chave de API Google Gemini
              </Label>
              <Input
                id="geminiKey"
                type="password"
                placeholder={geminiKey ? '••••••••••••••••••••' : 'Cole sua API Key do Google AI Studio'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground/60">
                Se deixado em branco, o sistema usará a chave definida nas variáveis de ambiente globais (GEMINI_API_KEY).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="geminiModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo Gemini
              </Label>
              <Input
                id="geminiModel"
                placeholder="Ex: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'groq' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="groqKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Chave de API Groq
              </Label>
              <Input
                id="groqKey"
                type="password"
                placeholder={groqKey ? '••••••••••••••••••••' : 'Cole sua API Key do Groq (gsk-...)'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground/60">
                Se deixado em branco, o sistema usará a chave definida nas variáveis de ambiente globais (GROQ_API_KEY).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groqModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo Groq
              </Label>
              <Input
                id="groqModel"
                placeholder="Ex: llama-3.3-70b-versatile, llama3-8b-8192, mixtral-8x7b-32768"
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'deepseek' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="deepseekKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Chave de API DeepSeek
              </Label>
              <Input
                id="deepseekKey"
                type="password"
                placeholder={deepseekKey ? '••••••••••••••••••••' : 'Cole sua API Key do DeepSeek (sk-...)'}
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground/60">
                Se deixado em branco, o sistema usará a chave definida nas variáveis de ambiente globais (DEEPSEEK_API_KEY).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deepseekModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo DeepSeek
              </Label>
              <Input
                id="deepseekModel"
                placeholder="Ex: deepseek-chat, deepseek-reasoner"
                value={deepseekModel}
                onChange={(e) => setDeepseekModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {provider === 'openrouter' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="openrouterKey" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3 text-secondary" /> Chave de API OpenRouter
              </Label>
              <Input
                id="openrouterKey"
                type="password"
                placeholder={openrouterKey ? '••••••••••••••••••••' : 'Cole sua API Key do OpenRouter (sk-or-...)'}
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground/60">
                Se deixado em branco, o sistema usará a chave definida nas variáveis de ambiente globais (OPENROUTER_API_KEY).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="openrouterModel" className="text-xs text-muted-foreground uppercase tracking-wider">
                Modelo OpenRouter
              </Label>
              <Input
                id="openrouterModel"
                placeholder="Ex: google/gemini-2.5-flash, anthropic/claude-3.5-sonnet"
                value={openrouterModel}
                onChange={(e) => setOpenrouterModel(e.target.value)}
                className="bg-card border-border/40 focus:border-primary/50"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Configurações salvas com sucesso! As consultas e dossiês usarão este provedor.</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="spiritual"
          disabled={isPending}
          className="shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando…
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvar Provedor LLM
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
