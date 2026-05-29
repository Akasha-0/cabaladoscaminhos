'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProgressChart() {
  return (
    <Card className="card-spiritual">
      <CardHeader>
        <CardTitle>Progresso ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-slate-500">
          <p>Gráfico de progresso em desenvolvimento</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProgressChart;
