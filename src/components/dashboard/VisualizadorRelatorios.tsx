'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  gerarAffirmationSemanal,
  gerarAffirmationMensal,
  calcularEnergiaDiaria,
  RITAIS_COMUNS,
  type DiaRelatorio
} from '@/lib/relatorios/dados';

interface VisualizadorRelatoriosProps {
  nome: string;
  dataNascimento: Date;
  numeroDestino: number;
  numeroAnoPessoal: number;
  oduPrincipal: string;
  signoSolar: string;
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function VisualizadorRelatorios({
  nome,
  dataNascimento,
  numeroDestino,
  numeroAnoPessoal,
  oduPrincipal,
  signoSolar,
}: VisualizadorRelatoriosProps) {
  const [tipoRelatorio, setTipoRelatorio] = useState<'semanal' | 'mensal'>('semanal');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());

  const gerarDiasSemana = (): DiaRelatorio[] => {
    const hoje = new Date();
    const dias: DiaRelatorio[] = [];
    
    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      
      const numeroPessoal = ((data.getDate() + numeroDestino + numeroAnoPessoal - 1) % 9) + 1;
      const transit = calcularTransitosSimulado(data);
      const energia = calcularEnergiaDiaria(data.getDay(), numeroPessoal, transit);
      
      dias.push({
        data,
        diaSemana: DIAS_SEMANA[data.getDay()],
        numeroPessoal,
        sefirot: getSefirotPorNumero(numeroPessoal),
        orixa: getOrixaPorDia(data.getDay()),
        energia,
        favorablePara: getAtividadesFavoraveis(data.getDay()),
        evitar: getEvitar(data.getDay()),
        ritais: getRitaisSugeridos(data.getDay()),
        cores: getCoresDoDia(data.getDay()),
        frequencias: getFrequenciasDoDia(data.getDay()),
      });
    }
    
    return dias;
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-900/50 border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-2">Selecionar Data</label>
            <input
              type="date"
              value={dataSelecionada.toISOString().split('T')[0]}
              onChange={(e) => setDataSelecionada(new Date(e.target.value))}
              className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200"
            />
          </div>
          <Tabs value={tipoRelatorio} onValueChange={(v) => setTipoRelatorio(v as typeof tipoRelatorio)}>
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="semanal" className="data-[state=active]:bg-indigo-600">
                Relatório Semanal
              </TabsTrigger>
              <TabsTrigger value="mensal" className="data-[state=active]:bg-indigo-600">
                Relatório Mensal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {tipoRelatorio === 'semanal' && (
        <RelatorioSemanal
          nome={nome}
          dataNascimento={dataNascimento}
          numeroDestino={numeroDestino}
          numeroAnoPessoal={numeroAnoPessoal}
          oduPrincipal={oduPrincipal}
          dias={gerarDiasSemana()}
        />
      )}

      {tipoRelatorio === 'mensal' && (
        <RelatorioMensal
          nome={nome}
          dataNascimento={dataNascimento}
          numeroDestino={numeroDestino}
          numeroAnoPessoal={numeroAnoPessoal}
          oduPrincipal={oduPrincipal}
          signoSolar={signoSolar}
          mes={dataSelecionada.getMonth() + 1}
          ano={dataSelecionada.getFullYear()}
        />
      )}
    </div>
  );
}

function RelatorioSemanal({
  nome,
  numeroAnoPessoal,
  oduPrincipal,
  dias,
}: {
  nome: string;
  dataNascimento: Date;
  numeroDestino: number;
  numeroAnoPessoal: number;
  oduPrincipal: string;
  dias: DiaRelatorio[];
}) {
  const affirmation = gerarAffirmationSemanal(numeroAnoPessoal);
  const diasFavoraveis = dias.filter(d => d.energia === 'favoravel');
  const diasDesafiantes = dias.filter(d => d.energia === 'desafiante');

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-indigo-900/30 to-slate-900/50 border-indigo-700/30">
        <h2 className="font-serif text-2xl text-slate-100 mb-2">Relatório Semanal</h2>
        <p className="text-slate-400">Olá, {nome}</p>
        <p className="text-sm text-slate-500 mt-1">
          Período: {dias[0].data.toLocaleDateString('pt-BR')} a {dias[6].data.toLocaleDateString('pt-BR')}
        </p>
        
        <Separator className="my-4 bg-slate-700/30" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-2xl font-serif text-indigo-400">{numeroAnoPessoal}</p>
            <p className="text-xs text-slate-400">Ano Pessoal</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-2xl font-serif text-amber-400">{diasFavoraveis.length}</p>
            <p className="text-xs text-slate-400">Dias Favoráveis</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-2xl font-serif text-orange-400">{diasDesafiantes.length}</p>
            <p className="text-xs text-slate-400">Dias Desafios</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-lg font-serif text-purple-400 truncate">{oduPrincipal.slice(0, 8)}</p>
            <p className="text-xs text-slate-400">Odú Principal</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Afirmação do Período</p>
          <p className="font-serif text-lg text-amber-200 italic">&ldquo;{affirmation}&rdquo;</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {dias.map((dia) => (
          <Card
            key={dia.data.toISOString()}
            className={`p-4 ${
              dia.energia === 'favoravel' 
                ? 'bg-green-900/20 border-green-700/30' 
                : dia.energia === 'desafiante'
                ? 'bg-orange-900/20 border-orange-700/30'
                : 'bg-slate-900/30 border-slate-700/30'
            }`}
          >
            <div className="text-center mb-3">
              <p className="text-lg font-serif text-slate-200">{dia.diaSemana.slice(0, 3)}</p>
              <p className="text-sm text-slate-400">{dia.data.getDate()}</p>
            </div>
            
            <div className="text-center mb-3">
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: getCorEnergia(dia.energia) }}
              >
                <span className="text-lg font-bold text-white">{dia.numeroPessoal}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{dia.sefirot}</p>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Favorável para:</p>
                <ul className="text-xs text-slate-300">
                  {dia.favorablePara.slice(0, 2).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cores:</p>
                <div className="flex gap-1 mt-1">
                  {dia.cores.slice(0, 2).map((cor) => (
                    <div
                      key={cor}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-200 mb-4">Rituais Recomendados para a Semana</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(RITAIS_COMUNS).slice(0, 4).map(([key, ritual]) => (
            <div key={key} className="p-4 rounded-lg bg-slate-800/30">
              <h4 className="font-serif text-slate-200">{ritual.nome}</h4>
              <p className="text-xs text-slate-400">{ritual.orixa}</p>
              <Separator className="my-2 bg-slate-700/30" />
              <p className="text-sm text-slate-300">{ritual.intencao}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RelatorioMensal({
  nome,
  numeroDestino,
  numeroAnoPessoal,
  mes,
  ano,
}: {
  nome: string;
  dataNascimento: Date;
  numeroDestino: number;
  numeroAnoPessoal: number;
  oduPrincipal: string;
  signoSolar: string;
  mes: number;
  ano: number;
}) {
  const nomeMes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][mes - 1];
  const affirmation = gerarAffirmationMensal(numeroAnoPessoal);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-slate-900/50 border-purple-700/30">
        <h2 className="font-serif text-2xl text-slate-100 mb-2">Relatório Mensal</h2>
        <p className="text-slate-400">Olá, {nome}</p>
        <p className="text-sm text-slate-500 mt-1">{nomeMes} de {ano}</p>
        
        <Separator className="my-4 bg-slate-700/30" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-2xl font-serif text-indigo-400">{numeroAnoPessoal}</p>
            <p className="text-xs text-slate-400">Ano Pessoal</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-2xl font-serif text-green-400">{(((mes + numeroDestino) % 9) + 1)}</p>
            <p className="text-xs text-slate-400">Mês Pessoal</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-2xl font-serif text-yellow-400">{numeroDestino}</p>
            <p className="text-xs text-slate-400">Número de Destino</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/30">
            <p className="text-lg font-serif text-purple-400 truncate">{getSefirotDoMes(((mes + numeroDestino) % 9) + 1)}</p>
            <p className="text-xs text-slate-400">Sefirot em Foco</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30 mt-4">
          <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Afirmação do Mês</p>
          <p className="font-serif text-lg text-purple-200 italic">&ldquo;{affirmation}&rdquo;</p>
        </div>
      </Card>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-200 mb-4">Tendências do Mês</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-900/20 border border-green-700/30">
            <h4 className="text-green-400 font-medium mb-2">Oportunidades</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Novas conexões profissionais</li>
              <li>• Momentos de clareza interior</li>
              <li>• Avanços em projetos criativos</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-700/30">
            <h4 className="text-orange-400 font-medium mb-2">Desafios</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Impaciência em processos lentos</li>
              <li>• Necessidade de flexibilidade</li>
              <li>• Gerenciamento de expectativas</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-700/30">
            <h4 className="text-indigo-400 font-medium mb-2">Áreas em Foco</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Relacionamentos</li>
              <li>• Comunicação</li>
              <li>• Espiritualidade</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-900/20 border-slate-700/20">
        <h3 className="font-serif text-lg text-slate-200 mb-4">Cronograma de Rituais</h3>
        <div className="space-y-3">
          {[
            { tipo: 'diario', nome: 'Meditação Matinal', freq: '528 Hz' },
            { tipo: 'semanal', nome: 'Banho de Ervas', freq: '639 Hz' },
            { tipo: 'mensal', nome: 'Ritual de Lua Cheia', freq: '963 Hz' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30">
              <div className={`px-3 py-1 rounded-full text-xs ${
                item.tipo === 'diario' ? 'bg-green-900/30 text-green-400' :
                item.tipo === 'semanal' ? 'bg-blue-900/30 text-blue-400' :
                'bg-purple-900/30 text-purple-400'
              }`}>
                {item.tipo}
              </div>
              <div className="flex-1">
                <p className="text-slate-200">{item.nome}</p>
              </div>
              <span className="text-xs text-slate-400">{item.freq}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function getSefirotPorNumero(numero: number): string {
  const sefirots = ['', 'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod'];
  return sefirots[numero] || 'Malkuth';
}

function getOrixaPorDia(dia: number): string {
  const orixas = ['Xangô', 'Omolu', 'Ogum', 'Xangô', 'Oxóssi', 'Oxalá', 'Oxum'];
  return orixas[dia];
}

function getCoresDoDia(dia: number): string[] {
  const cores = [
    ['#FFD700', '#EA580C'],
    ['#6B21A8', '#94A3B8'],
    ['#DC2626', '#EA580C'],
    ['#CA8A04', '#EAB308'],
    ['#059669', '#14B8A6'],
    ['#F5F5F4', '#FBCFE8'],
    ['#1E40AF', '#DB2777'],
  ];
  return cores[dia % 7];
}

function getFrequenciasDoDia(dia: number): string[] {
  const freq = [
    ['528 Hz'],
    ['741 Hz', '852 Hz'],
    ['174 Hz'],
    ['285 Hz', '417 Hz'],
    ['639 Hz'],
    ['528 Hz', '639 Hz'],
    ['396 Hz', '963 Hz'],
  ];
  return freq[dia % 7];
}

function getAtividadesFavoraveis(dia: number): string[] {
  const atividades = [
    ['Liderança', 'Poder pessoal', 'Iniciativas'],
    ['Limpeza', 'Aterramento', 'Descanso'],
    ['Ação', 'Corragem', 'Conquistas'],
    ['Estudo', 'Comunicação', 'Negócios'],
    ['Expansão', 'Fartura', 'Viagens'],
    ['Amor', 'Paz', 'Relacionamentos'],
    ['Fertilidade', 'Amor', 'Família'],
  ];
  return atividades[dia % 7];
}

function getEvitar(dia: number): string[] {
  const evitar = [
    ['Conflitos', 'Impulsividade'],
    ['Carne de porco', 'Pressa'],
    ['Brigas', 'Violência'],
    ['Mentiras', 'Abóbora'],
    ['Preguiça', 'Avareza'],
    ['álcool', 'Óleo'],
    ['Pó', 'Lama'],
  ];
  return evitar[dia % 7];
}

function getRitaisSugeridos(dia: number): string[] {
  const ritais = [
    ['Azeite + Louro'],
    ['Descargo com Sal'],
    ['Guiné + Pimenta'],
    ['Alecrim + Canela'],
    ['Samambaia + Mel'],
    ['Banho de Oxum'],
    ['Azeite +开门'],
  ];
  return ritais[dia % 7];
}

function getCorEnergia(energia: string): string {
  switch (energia) {
    case 'favoravel':
      return '#22C55E';
    case 'desafiante':
      return '#F97316';
    default:
      return '#64748B';
  }
}

function calcularTransitosSimulado(data: Date): string[] {
  const day = data.getDate();
  if (day % 7 === 0) return ['trino'];
  if (day % 5 === 0) return ['quadratura'];
  if (day % 4 === 0) return ['oposicao'];
  return ['conjunção'];
}

function getSefirotDoMes(numero: number): string {
  return getSefirotPorNumero(numero);
}

