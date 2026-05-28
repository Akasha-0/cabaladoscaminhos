'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  Play,
  Pause,
  RotateCcw,
  Save,
  Trash2,
  Plus,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  ListMusic,
  Clock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AffirmationItem {
  id: string;
  texto: string;
  categoria: string;
}

interface SavedFlow {
  id: string;
  nome: string;
  sequencia: AffirmationItem[];
  duracaoPorAfirmacao: number;
  createdAt: string;
}

const CATEGORIAS = [
  'Proteção Divina',
  'Amor',
  'Abundância',
  'Cura',
  'Sabedoria',
  'Gratidão',
  'Manifestação',
  'Intuição',
  'Harmonia',
  'Propósito',
];

const AFIRMACOES_PREDEFINIDAS: AffirmationItem[] = [
  { id: 'a1', texto: 'Ako querubyn, eu sou luz. Eu sou paz. Eu sou caminho.', categoria: 'Proteção Divina' },
  { id: 'a2', texto: 'Eu abraço novos começos com coragem e determinação.', categoria: 'Novo Ciclo' },
  { id: 'a3', texto: 'A harmonia flui naturalmente em minha vida.', categoria: 'Harmonia' },
  { id: 'a4', texto: 'Minha criatividade transborda.', categoria: 'Criatividade' },
  { id: 'a5', texto: 'A prosperidade flui naturalmente para mim.', categoria: 'Abundância' },
  { id: 'a6', texto: 'Eu sou digno de amor.', categoria: 'Amor' },
  { id: 'a7', texto: 'A sabedoria divina me guia.', categoria: 'Sabedoria' },
  { id: 'a8', texto: 'Eu permito que meu corpo se cure e se renove.', categoria: 'Cura' },
  { id: 'a9', texto: 'Estou envolto em proteção divina.', categoria: 'Proteção' },
  { id: 'a10', texto: 'Sou pioneiro em minha própria história.', categoria: 'Propósito' },
  { id: 'a11', texto: 'Gratidão preenche meu coração.', categoria: 'Gratidão' },
  { id: 'a12', texto: 'Eu manifesto minha realidade com intenção e amor.', categoria: 'Manifestação' },
  { id: 'a13', texto: 'Minha intuição é minha guia.', categoria: 'Intuição' },
  { id: 'a14', texto: 'O universo conspira a meu favor.', categoria: 'Abundância' },
  { id: 'a15', texto: 'Cada respiração traz paz e clareza.', categoria: 'Harmonia' },
];

export default function AffirmationFlow() {
  const [disponiveis, setDisponiveis] = useState<AffirmationItem[]>(AFIRMACOES_PREDEFINIDAS);
  const [selecionadas, setSelecionadas] = useState<AffirmationItem[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [busca, setBusca] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(30);
  const [duracaoPorAfirmacao, setDuracaoPorAfirmacao] = useState(30);
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]);
  const [flowNome, setFlowNome] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);
  const idCounterRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('affirmation-flows');
    if (saved) {
      setSavedFlows(JSON.parse(saved));
    }
  }, []);

  const filtradas = categoriaFiltro === 'Todas'
    ? disponiveis
    : disponiveis.filter(a => a.categoria === categoriaFiltro).filter(
        a => a.texto.toLowerCase().includes(busca.toLowerCase())
      );
  const adicionarAfirmacao = (afirmacao: AffirmationItem) => {
    if (!selecionadas.find(a => a.id === afirmacao.id)) {
      idCounterRef.current += 1;
      setSelecionadas([...selecionadas, { ...afirmacao, id: `${afirmacao.id}-${idCounterRef.current}` }]);
    }
  };
  const removerAfirmacao = (id: string) => {
    setSelecionadas(selecionadas.filter(a => a.id !== id));
  const moverAfirmacao = (index: number, direction: 'up' | 'down') => {
    const nova = [...selecionadas];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < nova.length) {
      [nova[index], nova[target]] = [nova[target], nova[index]];
      setSelecionadas(nova);
    }
  };

  const salvarFlow = () => {
    if (!flowNome.trim() || selecionadas.length === 0) return;
    const novo: SavedFlow = {
      id: `flow-${Date.now()}`,
      nome: flowNome,
      sequencia: [...selecionadas],
      duracaoPorAfirmacao,
      createdAt: new Date().toISOString(),
    };
    const updated = [novo, ...savedFlows];
    setSavedFlows(updated);
    localStorage.setItem('affirmation-flows', JSON.stringify(updated));
    setFlowNome('');
    setShowSaveDialog(false);
  };

  const carregarFlow = (flow: SavedFlow) => {
    setSelecionadas([...flow.sequencia]);
    setDuracaoPorAfirmacao(flow.duracaoPorAfirmacao);
    setMostrarBiblioteca(false);
  };

  const deletarFlow = (id: string) => {
    const updated = savedFlows.filter(f => f.id !== id);
    setSavedFlows(updated);
    localStorage.setItem('affirmation-flows', JSON.stringify(updated));
  };

  const iniciarReproducao = () => {
    if (selecionadas.length === 0) return;
    setIsPlaying(true);
    setCurrentIndex(0);
    setTempoRestante(duracaoPorAfirmacao);
  };

  const pausarReproducao = () => setIsPlaying(false);
  const continuarReproducao = () => setIsPlaying(true);

  const resetarReproducao = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setTempoRestante(duracaoPorAfirmacao);
  };

  useEffect(() => {
    if (!isPlaying || selecionadas.length === 0) return;
    if (tempoRestante > 0) {
      const timer = setInterval(() => {
        setTempoRestante(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      if (currentIndex < selecionadas.length - 1) {
        setCurrentIndex(i => i + 1);
        setTempoRestante(duracaoPorAfirmacao);
      } else {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, tempoRestante, currentIndex, selecionadas.length, duracaoPorAfirmacao]);

  const currentAffirmation = selecionadas[currentIndex];
  const progress = selecionadas.length > 0 ? ((currentIndex + 1) / selecionadas.length) * 100 : 0;

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <ListMusic className="w-5 h-5 text-rose-400" />
            Flow de Afirmações
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarBiblioteca(!mostrarBiblioteca)}
            className="text-slate-400 hover:text-slate-100"
          >
            <Star className="w-4 h-4 mr-1" />
            {mostrarBiblioteca ? 'Criar' : 'Biblioteca'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mostrarBiblioteca ? (
          <div className="space-y-4">
            {savedFlows.length === 0 ? (
              <p className="text-slate-400 text-center py-4 text-sm">
                Nenhum flow salvo ainda. Crie e salve sua primeira sequência.
              </p>
            ) : (
              savedFlows.map(flow => (
                <div
                  key={flow.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
                >
                  <div>
                    <p className="text-slate-100 font-medium">{flow.nome}</p>
                    <p className="text-slate-400 text-xs">
                      {flow.sequencia.length} afirmações • {flow.duracaoPorAfirmacao}s cada
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => carregarFlow(flow)}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletarFlow(flow.id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : isPlaying ? (
          <div className="space-y-4">
            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center space-y-2">
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                {currentIndex + 1} / {selecionadas.length}
              </Badge>
              <p className="text-2xl font-medium text-slate-100 leading-relaxed min-h-[80px] flex items-center justify-center">
                {currentAffirmation?.texto}
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{tempoRestante}s</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetarReproducao}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Resetar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pausarReproducao}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pausar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar afirmações..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <select
                  value={categoriaFiltro}
                  onChange={e => setCategoriaFiltro(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 text-slate-100 rounded-md px-3 text-sm"
                >
                  <option value="Todas">Todas</option>
                  {CATEGORIAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {filtradas.slice(0, 10).map(afirmacao => (
                  <button
                    key={afirmacao.id}
                    onClick={() => adicionarAfirmacao(afirmacao)}
                    className="flex items-center gap-2 p-2 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg border border-slate-700/30 text-left transition-colors"
                  >
                    <Plus className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-200 text-sm line-clamp-1">{afirmacao.texto}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto border-slate-600 text-slate-400">
                      {afirmacao.categoria}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-medium">
                  Sequência ({selecionadas.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">Tempo:</span>
                  <input
                    type="number"
                    value={duracaoPorAfirmacao}
                    onChange={e => setDuracaoPorAfirmacao(Number(e.target.value))}
                    min={5}
                    max={120}
                    className="w-16 bg-slate-800/50 border border-slate-700 text-slate-100 rounded px-2 py-1 text-sm text-center"
                  />
                  <span className="text-slate-400 text-xs">seg</span>
                </div>
              </div>
              {selecionadas.length === 0 ? (
                <p className="text-slate-500 text-center py-4 text-sm">
                  Adicione afirmações para criar sua sequência
                </p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {selecionadas.map((afirmacao, index) => (
                    <div
                      key={afirmacao.id}
                      className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-700/30"
                    >
                      <span className="text-slate-500 text-xs w-6 text-center">{index + 1}</span>
                      <span className="text-slate-200 text-sm flex-1 line-clamp-1">
                        {afirmacao.texto}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moverAfirmacao(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moverAfirmacao(index, 'down')}
                          disabled={index === selecionadas.length - 1}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removerAfirmacao(afirmacao.id)}
                          className="p-1 hover:bg-rose-900/30 rounded text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {selecionadas.length > 0 && (
                <>
                  <Button
                    onClick={iniciarReproducao}
                    className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Reproduzir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(true)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </>
              )}
              {selecionadas.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setSelecionadas([])}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            {showSaveDialog && (
              <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/50 space-y-3">
                <p className="text-slate-200 text-sm font-medium">Salvar Flow</p>
                <Input
                  placeholder="Nome do flow"
                  value={flowNome}
                  onChange={e => setFlowNome(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={salvarFlow}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSaveDialog(false)}
                    className="text-slate-400"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}