'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { gerarRelatorioMensal, type RelatorioMensal } from '@/lib/relatorios/gerador-mensal';

export function RelatorioMensalPage() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [relatorio, setRelatorio] = useState<RelatorioMensal | null>(null);
  const [loading, setLoading] = useState(false);
  
  const gerar = () => {
    setLoading(true);
    setTimeout(() => {
      const r = gerarRelatorioMensal(mes, ano);
      setRelatorio(r);
      setLoading(false);
    }, 500);
  };
  
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">
          ✦ Relatório Mensal ✦
        </h1>
        <p className="text-slate-400">
          Análise completa do mês com previsões e orientações
        </p>
      </div>
      
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mês</label>
              <select 
                value={mes} 
                onChange={(e) => setMes(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200"
              >
                {nomesMeses.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ano</label>
              <input 
                type="number" 
                value={ano} 
                onChange={(e) => setAno(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 w-28"
              />
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-500"
              onClick={gerar}
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {relatorio && (
        <>
          <Card className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span> {relatorio.mes} {relatorio.ano}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-purple-400 mb-1">Energia do Mês</p>
                <p className="text-lg text-slate-100">{relatorio.resumo.energiaMensal}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-300">{relatorio.resumo.temaMensal}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-950/30 rounded-lg">
                  <p className="text-xs text-green-400 mb-2">Oportunidades</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {relatorio.resumo.oportunidades.map((o, i) => (
                      <li key={i}>✦ {o}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-red-950/30 rounded-lg">
                  <p className="text-xs text-red-400 mb-2">Desafios</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {relatorio.resumo.desafios.map((d, i) => (
                      <li key={i}>⚠ {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔢</span> Ciclo do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-purple-400">
                    {relatorio.ciclos.numeroMes}
                  </div>
                  <p className="text-sm text-slate-400">Número do Mês</p>
                </div>
                <p className="text-sm text-slate-300 text-center mb-4">
                  {relatorio.ciclos.cicloAtual}
                </p>
                <div className="flex justify-center gap-4 text-xs">
                  <span className="text-green-400">● Favoráveis: {relatorio.ciclos.diasFavoraveis.length} dias</span>
                  <span className="text-yellow-400">● Neutros: {relatorio.ciclos.diasNeutros.length} dias</span>
                  <span className="text-red-400">● Desafio: {relatorio.ciclos.diasDesafio.length} dias</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🪐</span> Aspectos Planetários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(relatorio.aspectos).map(([planeta, desc]) => (
                  <div key={planeta} className="flex items-center justify-between text-sm">
                    <span className="text-purple-400 capitalize">{planeta}:</span>
                    <span className="text-slate-300">{desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-slate-900/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔮</span> Previsões por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatorio.previsoes.map((p, i) => (
                  <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="font-medium text-purple-300 mb-2">{p.area}</h3>
                    <p className="text-sm text-green-400 mb-1">Tendência: {p.tendencia}</p>
                    <p className="text-xs text-slate-400">Conselho: {p.conselho}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📅</span> Calendário Espiritual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {relatorio.diasDetalhados.map((d) => (
                  <div key={d.dia} className="p-3 bg-slate-800/50 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-400">{d.dia}</div>
                    <div className="text-xs text-slate-500">{d.faseLua}</div>
                    <div className="text-xs text-slate-400">{d.orixa}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}