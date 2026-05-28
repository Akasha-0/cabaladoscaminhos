'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="font-cinzel text-3xl mb-6">Dashboard Espiritual</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    </div>
  );
}