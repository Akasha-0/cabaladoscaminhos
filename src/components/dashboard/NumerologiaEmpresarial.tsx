'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  analisarNomeEmpresarial, 
  NUMEROS_INTERPRETACAO,
  gerarRecomendacoes,
  getDiaFavoravel,
  type AnaliseEmpresarial
} from '@/lib/empresa/dados';

export function NumerologiaEmpresarialExplorer() {
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [dataAbertura, setDataAbertura] = useState('');
  const [analise, setAnalise] = useState<AnaliseEmpresarial | null>(null);
  const [loading, setLoading] = useState(false);

  const analisarEmpresa = () => {
    if (!nomeEmpresa && !razaoSocial) return;
    
    setLoading(true);
    
    const nomeParaAnalisar = nomeEmpresa || razaoSocial;
    const resultado = analisarNomeEmpresarial(nomeParaAnalisar);
    
    setTimeout(() => {
      setAnalise(resultado);
      setLoading(false);
    }, 500);
  };

  const getCorForca = (forca: string): string => {
    switch (forca) {
      case 'forte':
        return '#22C55E';
      case 'media':
        return '#F59E0B';
      case 'fraca':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getCorNumero = (numero: number): string => {
    if ([11, 22, 33].includes(numero)) return '#FFD700';
    const cores = ['#DC2626', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#7C3AED', '#EC4899', '#14B8A6', '#6366F1'];
    return cores[(numero - 1) % 9];
  };

  const diaFavoravel = dataAbertura ? getDiaFavoravel() : null;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-900/50 border-slate-700/50">
        <h2 className="font-serif text-xl text-slate-200 mb-4">Numerologia Empresarial</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Nome Fantasia</label>
            <Input
              placeholder="Ex: Instituto de Conhecimento"
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Razão Social</label>
            <Input
              placeholder="Ex: Instituto de Conhecimento Ltda"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Data de Abertura (opcional)</label>
            <Input
              type="date"
              value={dataAbertura}
              onChange={(e) => setDataAbertura(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>
          {diaFavoravel && (
            <div className="p-3 rounded-lg bg-indigo-900/30 border border-indigo-700/30">
              <p className="text-sm text-indigo-400">Melhor dia para abrir:</p>
              <p className="font-serif text-lg text-indigo-200">
                {diaFavoravel.nome} ({diaFavoravel.orixa})
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={analisarEmpresa}
          disabled={loading || (!nomeEmpresa && !razaoSocial)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {loading ? 'Analisando...' : 'Analisar Nome'}
        </Button>
      </Card>

      {analise && (
        <div className="space-y-6">
          <Card className="p-6 bg-slate-900/30 border-slate-700/30">
            <h3 className="font-serif text-lg text-slate-200 mb-4">Análise do Nome</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-slate-800/30">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-2"
                  style={{ 
                    backgroundColor: `${getCorNumero(analise.numeroDestino)}20`,
                    color: getCorNumero(analise.numeroDestino),
                    border: `2px solid ${getCorNumero(analise.numeroDestino)}`
                  }}
                >
                  {analise.numeroDestino}
                </div>
                <p className="text-xs text-slate-400">Número de Destino</p>
                <p className="text-sm text-slate-300">
                  {NUMEROS_INTERPRETACAO[analise.numeroDestino]?.significado.split(',')[0]}
                </p>
              </div>

              <div className="text-center p-4 rounded-lg bg-slate-800/30">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-2"
                  style={{ 
                    backgroundColor: `${getCorNumero(analise.numeroMotivador)}20`,
                    color: getCorNumero(analise.numeroMotivador),
                    border: `2px solid ${getCorNumero(analise.numeroMotivador)}`
                  }}
                >
                  {analise.numeroMotivador}
                </div>
                <p className="text-xs text-slate-400">Motivador</p>
                <p className="text-sm text-slate-300">Energia inicial</p>
              </div>

              <div className="text-center p-4 rounded-lg bg-slate-800/30">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-2"
                  style={{ 
                    backgroundColor: `${getCorNumero(analise.numeroImpressao)}20`,
                    color: getCorNumero(analise.numeroImpressao),
                    border: `2px solid ${getCorNumero(analise.numeroImpressao)}`
                  }}
                >
                  {analise.numeroImpressao}
                </div>
                <p className="text-xs text-slate-400">Impressão</p>
                <p className="text-sm text-slate-300">Como é vista</p>
              </div>
            </div>

            <Separator className="my-4 bg-slate-700/30" />

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-serif" style={{ color: getCorNumero(analise.numeroPoder) }}>
                  {analise.numeroPoder}
                </p>
                <p className="text-xs text-slate-400">Poder</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif" style={{ color: getCorNumero(analise.numeroExpressao) }}>
                  {analise.numeroExpressao}
                </p>
                <p className="text-xs text-slate-400">Expressão</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif" style={{ color: getCorNumero(analise.numeroRealizacao) }}>
                  {analise.numeroRealizacao}
                </p>
                <p className="text-xs text-slate-400">Realização</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/20 border-slate-700/20">
            <h3 className="font-serif text-lg text-slate-200 mb-4">
              Interpretação - Número {analise.numeroDestino}
            </h3>
            
            <div 
              className="p-4 rounded-lg mb-4"
              style={{ 
                backgroundColor: `${getCorForca(NUMEROS_INTERPRETACAO[analise.numeroDestino]?.forca)}20`,
                borderColor: getCorForca(NUMEROS_INTERPRETACAO[analise.numeroDestino]?.forca)
              }}
            >
              <p className="text-sm text-slate-300">
                <span className="font-medium" style={{ color: getCorForca(NUMEROS_INTERPRETACAO[analise.numeroDestino]?.forca) }}>
                  Vibração {NUMEROS_INTERPRETACAO[analise.numeroDestino]?.forca.toUpperCase()}
                </span>
              </p>
              <p className="text-slate-200 mt-2">
                {NUMEROS_INTERPRETACAO[analise.numeroDestino]?.significado}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Áreas de Atuação:</p>
              <div className="flex flex-wrap gap-2">
                {NUMEROS_INTERPRETACAO[analise.numeroDestino]?.areas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 text-sm rounded-full bg-indigo-900/30 text-indigo-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/20 border-slate-700/20">
            <h3 className="font-serif text-lg text-slate-200 mb-4">Recomendações</h3>
            
            <ul className="space-y-2">
              {gerarRecomendacoes(analise).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5">✦</span>
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {!analise && (
        <Card className="p-6 bg-slate-900/20 border-slate-700/20 text-center">
          <p className="text-slate-400">
            Insira o nome da empresa para realizar a análise numerológica.
          </p>
        </Card>
      )}
    </div>
  );
}