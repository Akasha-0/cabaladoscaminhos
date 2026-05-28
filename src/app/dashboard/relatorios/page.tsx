'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNumerologia } from '@/lib/hooks/useNumerologia';
import { useCiclos } from '@/lib/hooks/useCiclos';

export default function RelatoriosPage() {
  const nome = 'Usuário';
  const dataNascimento = '1990-01-01';

  const { pitagorica, loading } = useNumerologia(nome, dataNascimento);
  const { ano, mes, dia, loading: loadingCiclos } = useCiclos(dataNascimento);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-slate-100">Relatórios Espirituais</h1>
        <p className="text-slate-400 mt-2">
          Acompanhe sua jornada espiritual com relatórios personalizados.
        </p>
      </div>

      <Tabs defaultValue="semanal" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="semanal" className="mt-6">
          <div className="space-y-4">
            <Card className="p-6 bg-slate-900/20 border-slate-700/20">
              <h3 className="font-serif text-lg text-slate-300 mb-4">Ciclos do Dia</h3>
              {loadingCiclos ? (
                <p className="text-slate-400">Carregando...</p>
              ) : dia ? (
                <div className="space-y-2">
                  <p className="text-slate-200">Número: {dia.numero}</p>
                  <p className="text-slate-400">Sephirot: {dia.sefirot}</p>
                  {dia.descricao && <p className="text-slate-300">{dia.descricao.nome}</p>}
                </div>
              ) : (
                <p className="text-slate-400">Sem dados disponíveis</p>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mensal" className="mt-6">
          <div className="space-y-4">
            <Card className="p-6 bg-slate-900/20 border-slate-700/20">
              <h3 className="font-serif text-lg text-slate-300 mb-4">Número do Destino</h3>
              {loading ? (
                <p className="text-slate-400">Carregando...</p>
              ) : pitagorica ? (
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{pitagorica}</span>
                  <p className="text-slate-400 mt-2">Número Pitagórico</p>
                </div>
              ) : (
                <p className="text-slate-400">Sem dados disponíveis</p>
              )}
            </Card>
            {mes && (
              <Card className="p-6 bg-slate-900/20 border-slate-700/20">
                <h3 className="font-serif text-lg text-slate-300 mb-4">Ciclo Mensal</h3>
                <div className="space-y-2">
                  <p className="text-slate-200">Número: {mes.numero}</p>
                  <p className="text-slate-400">Sephirot: {mes.sefirot}</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-300 mb-3">Sobre os Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div>
            <p className="font-medium text-slate-300 mb-1">Relatório Semanal</p>
            <p>Acompanhe os ciclos astrais e orientações espirituais para os próximos 7 dias.</p>
          </div>
          <div>
            <p className="font-medium text-slate-300 mb-1">Relatório Mensal</p>
            <p>Visão geral das influências cósmicas e recomendações para o mês.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}