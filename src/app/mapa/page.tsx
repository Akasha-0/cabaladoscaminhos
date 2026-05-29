import MapaNatal from '@/components/dashboard/MapaNatal';
import ArvoreVida from '@/components/dashboard/ArvoreVida';

interface MapaData {
  id: string;
  created_at: string;
  numerologia: {
    numero_vida: number;
    numero_destino: number;
    numero_alma: number;
    numero_personalidade: number;
  };
  odu: {
    nome: string;
    numero: number;
    orixas: string[];
    quizilas: string[];
    preceitos: string;
  };
  astrologia: {
    signo: string;
    ascendente: string;
    planetas: Record<string, string>;
   planeta?: Record<string, { planeta: string; longitude: number; latitude: number; distancia: number; velocidade: number; signo: string; casa: number; grauNoSigno: number }>;
   casas?: Array<{ numero: number; signo: string; grauNoSigno: number }>;
   ascendenteDegree?: number;
   mediumCoeli?: number;
  };
  tarot: {
    carta_nascimento: number;
    carta_ano_pessoal: number;
  };
  orixas: string[];
  sefirot: string[];
  convergencias?: Array<{
    energia: string;
    forca: 'simples' | 'dupla' | 'tripla';
    descricao: string;
  }>;
}

const ARCANOS_MAIORES = [
  'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
  'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna',
  'A Justiça', 'O Louco', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo'
];

export default function MapaPage() {
  const [mapa, setMapa] = useState<MapaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo data for testing
  const testProfile = {
    userId: 'demo-user',
    nome: 'Maria da Silva',
    dataNascimento: '1985-03-15',
    hora: '14:30',
    local: 'São Paulo'
  };

  useEffect(() => {
    async function fetchMapa() {
      try {
        const response = await fetch('/api/mapa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testProfile)
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar Mapa da Alma');
        }

        const data = await response.json();
        setMapa(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchMapa();
  }, []);

  const handleDownloadPDF = async () => {
    if (!mapa) return;
    setPdfLoading(true);
    try {
      const blob = gerarRelatorioPDF(mapa);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mapa-da-alma.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto text-amber-400 animate-pulse mb-4" />
          <p className="text-amber-400">Gerando seu Mapa da Alma...</p>
        </div>
      </div>
    );
  }

  if (error || !mapa) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900 border-red-500/50 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Skull className="w-5 h-5" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            <p>{error || 'Não foi possível carregar o Mapa da Alma.'}</p>
            <p className="text-slate-500 text-sm mt-2">
              Verifique se o serviço está disponível.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getForcaColor = (forca: string) => {
    switch (forca) {
      case 'tripla': return 'bg-amber-500 text-black';
      case 'dupla': return 'bg-cyan-500 text-black';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
              ✦ Mapa da Alma ✦
            </h1>
            <p className="text-slate-400">
              {testProfile.nome} • {new Date(testProfile.dataNascimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? 'Gerando...' : 'Download PDF'}
          </button>
        </div>

        {/* Convergências */}
        {mapa.convergencias && mapa.convergencias.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-900/30 to-amber-950/50 border-amber-500/50 mb-8">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Convergências Espirituais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mapa.convergencias.map((conv, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getForcaColor(conv.forca)}>
                        {conv.forca.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-amber-300">{conv.energia}</span>
                    </div>
                    <p className="text-slate-300">{conv.descricao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de informações */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Numerologia */}
          <Card className="bg-slate-900 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Numerologia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Número de Vida</span>
                <span className="text-cyan-300 font-bold">{mapa.numerologia.numero_vida}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destino</span>
                <span className="text-slate-300">{mapa.numerologia.numero_destino}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alma</span>
                <span className="text-slate-300">{mapa.numerologia.numero_alma}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Personalidade</span>
                <span className="text-slate-300">{mapa.numerologia.numero_personalidade}</span>
              </div>
            </CardContent>
          </Card>

          {/* Odu */}
          <Card className="bg-slate-900 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Odú de Nascimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-300 mb-2">
                  {mapa.odu.nome}
                </div>
                <Badge className="bg-orange-500/20 text-orange-300">
                  Odú {mapa.odu.numero}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">Orixás:</p>
                <div className="flex flex-wrap gap-2">
                  {mapa.odu.orixas.map((o) => (
                    <Badge key={o} variant="outline" className="border-orange-500/50 text-orange-300">
                      {o}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Astrologia */}
          <Card className="bg-slate-900 border-violet-500/30">
            <CardHeader>
              <CardTitle className="text-violet-400 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Astrologia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Sol (Signo)</span>
                <span className="text-violet-300">{mapa.astrologia.signo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ascendente</span>
                <span className="text-slate-300">{mapa.astrologia.ascendente}</span>
              </div>
              {mapa.astrologia.planeta && (
                <div className="mt-4 flex justify-center">
                  <MapaNatal
                    mapaNatal={{
                      usuarioId: mapa.id,
                      dataCalculo: new Date(mapa.created_at),
                      planeta: mapa.astrologia.planeta as any,
                      casas: (mapa.astrologia.casas || []) as any,
                      ascendente: mapa.astrologia.ascendenteDegree || 0,
                      mediumCoeli: mapa.astrologia.mediumCoeli || 0,
                      nodes: {
                        norte: { planeta: 'node_norte' as const, longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'aries' as const, casa: 1, grauNoSigno: 0 },
                        sul: { planeta: 'node_sul' as const, longitude: 0, latitude: 0, distancia: 0, velocidade: 0, signo: 'aries' as const, casa: 7, grauNoSigno: 0 },
                      },
                    }}
                    size={300}
                    className="mx-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarot */}
          <Card className="bg-slate-900 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Tarot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Carta do Nascimento</p>
                  <p className="text-yellow-300">
                    {ARCANOS_MAIORES[mapa.tarot.carta_nascimento - 1] || `Arcano ${mapa.tarot.carta_nascimento}`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Carta do Ano Pessoal</p>
                  <p className="text-yellow-300">
                    {ARCANOS_MAIORES[mapa.tarot.carta_ano_pessoal - 1] || `Arcano ${mapa.tarot.carta_ano_pessoal}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orixás */}
          <Card className="bg-slate-900 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Orixás
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mapa.orixas.map((o) => (
                  <Badge key={o} className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                    {o}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sefirot */}
          <Card className="bg-slate-900 border-indigo-500/30">
            <CardHeader>
              <CardTitle className="text-indigo-400 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Sefirot da Árvore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mapa.sefirot.map((s) => (
                  <Badge key={s} variant="outline" className="border-indigo-500/50 text-indigo-300">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Árvore da Vida */}
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Árvore da Vida
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ArvoreVida
              highlightedSephiroth={mapa.sefirot}
              size="lg"
              showLabels={true}
              showPathNumbers={true}
            />
          </CardContent>
        </Card>

        {/* Quizilas do Odú */}
        {mapa.odu.quizilas && mapa.odu.quizilas.length > 0 && (
          <Card className="bg-slate-900 border-red-500/30 mt-6">
            <CardHeader>
              <CardTitle className="text-red-400">Quizilas do seu Odú</CardTitle>
              <p className="text-slate-400 text-sm">O que evitar para manter o axé equilibrado</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mapa.odu.quizilas.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-red-400">✕</span>
                    {q}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}