'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { gerarRelatorioSemanal, type RelatorioSemanal } from '@/lib/relatorios/gerador';

export function RelatorioSemanalPage() {
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);
  const [loading, setLoading] = useState(false);

  const gerar = () => {
    setLoading(true);
    setTimeout(() => {
      const r = gerarRelatorioSemanal(null);
      setRelatorio(r);
      setLoading(false);
    }, 500);
  };

  if (!relatorio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-300 mb-2">
            ✦ Relatório Semanal ✦
          </h1>
          <p className="text-slate-400">
            Descubra as orientações espirituais para sua semana
          </p>
        </div>

        <Card className="max-w-md bg-slate-900/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-slate-300 text-center">
                Seu relatório semanal inclui:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✦</span>
                  Resumo da energia da semana
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✦</span>
                  Ciclos pessoais (Ano, Mês, Dia)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✦</span>
                  Trânsitos planetários importantes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✦</span>
                  Orientações por dia da semana
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✦</span>
                  Cronograma de rituais
                </li>
              </ul>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-500"
                onClick={gerar}
                disabled={loading}
              >
                {loading ? 'Gerando...' : 'Gerar Meu Relatório'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatarData = (d: Date) => {
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">
          ✦ Relatório Semanal ✦
        </h1>
        <p className="text-slate-400">
          {formatarData(relatorio.periodo.inicio)} - {formatarData(relatorio.periodo.fim)}
        </p>
      </div>

      <Card className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span> Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-purple-400 mb-1">Tema da Semana</p>
            <p className="text-lg font-medium text-slate-100">{relatorio.resumo.temaSemana}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-950/30 rounded-lg">
              <p className="text-xs text-green-400 mb-1">Dias Favoráveis</p>
              <p className="text-sm text-slate-200">{relatorio.resumo.diasFavoraveis.join(', ')}</p>
            </div>
            <div className="p-3 bg-red-950/30 rounded-lg">
              <p className="text-xs text-red-400 mb-1">Dias de Desafio</p>
              <p className="text-sm text-slate-200">{relatorio.resumo.diasDesafio.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔢</span> Seus Ciclos Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-950/30 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">{relatorio.ciclos.anoPessoal}</div>
              <div className="text-sm text-slate-400">Ano Pessoal</div>
            </div>
            <div className="text-center p-4 bg-purple-950/30 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">{relatorio.ciclos.mesPessoal}</div>
              <div className="text-sm text-slate-400">Mês Pessoal</div>
            </div>
            <div className="text-center p-4 bg-purple-950/30 rounded-lg">
              <div className="text-3xl font-bold text-green-400">{relatorio.ciclos.diaPessoal}</div>
              <div className="text-sm text-slate-400">Dia Pessoal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📅</span> Orientações Diárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relatorio.orientacoes.map((o, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-purple-300">{o.dia}</h3>
                  <span className="text-sm text-slate-500">Orixá: {o.orixa}</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  <span className="text-purple-400">Energia:</span> {o.energia}
                </p>
                <p className="text-sm text-slate-300 mb-2">
                  <span className="text-green-400">Ritual:</span> {o.ritual}
                </p>
                <div className="flex flex-wrap gap-1">
                  {o.evitar.map((e, j) => (
                    <span key={j} className="text-xs px-2 py-1 bg-red-950/30 text-red-300 rounded">
                      Evitar: {e}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="outline" onClick={() => setRelatorio(null)}>
          Gerar Novo Relatório
        </Button>
      </div>
    </div>
  );
}